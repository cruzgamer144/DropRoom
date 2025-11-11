"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getMonthKey } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-service-role";

const inviteSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6),
});

const reservationSchema = z.object({
  dropId: z.string().uuid(),
  size: z.string().min(1),
});

const dropSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(12),
  image_url: z.string().url(),
  price: z.number().positive(),
  drop_date: z.string(),
  active: z.boolean(),
  sizes: z.array(z.string().min(1)).min(1),
});

const reservationStatusSchema = z.object({
  reservationId: z.string().uuid(),
  status: z.enum(["reservado", "pago", "enviado", "cancelado"]),
});

const inviteAdminSchema = z.object({
  email: z.string().email().optional(),
  amount: z.number().int().min(1).max(20),
});

class InviteSyncError extends Error {
  constructor(
    readonly code:
      | "INVITE_INVALID"
      | "INVITE_UPDATE_FAILED"
      | "PROFILE_UPSERT_FAILED"
  ) {
    super(code);
    this.name = "InviteSyncError";
  }
}

interface AuthCallbackResult {
  redirectTo: string;
}

interface SyncInviteParams {
  inviteId: string;
  inviteCode: string;
  userId: string;
  email: string;
  monthKey: string;
}

async function syncInviteAndProfile({
  inviteId,
  inviteCode,
  userId,
  email,
  monthKey,
}: SyncInviteParams) {
  const serviceSupabase = createSupabaseServiceRoleClient();

  const { error: rpcError } = await serviceSupabase.rpc(
    "use_invite_and_sync_profile",
    {
      invite_code: inviteCode,
      user_id: userId,
      email,
      month_key: monthKey,
    }
  );

  if (!rpcError) {
    return;
  }

  const inviteResponse = await serviceSupabase
    .from("invites")
    .select("id, status")
    .eq("id", inviteId)
    .maybeSingle();

  if (
    inviteResponse.error ||
    !inviteResponse.data ||
    inviteResponse.data.status !== "active"
  ) {
    throw new InviteSyncError("INVITE_INVALID");
  }

  const profileResponse = await serviceSupabase
    .from("profiles")
    .select("role, monthly_limit, monthly_count, month_key")
    .eq("id", userId)
    .maybeSingle();

  if (profileResponse.error) {
    throw new InviteSyncError("PROFILE_UPSERT_FAILED");
  }

  const carryOverCount =
    profileResponse.data?.month_key === monthKey
      ? profileResponse.data?.monthly_count ?? 0
      : 0;
  const monthlyLimit = profileResponse.data?.monthly_limit ?? 3;
  const role = profileResponse.data?.role ?? "member";

  const { error: upsertError } = await serviceSupabase
    .from("profiles")
    .upsert({
      id: userId,
      email,
      role,
      monthly_limit: monthlyLimit,
      monthly_count: carryOverCount,
      month_key: monthKey,
      status: "active",
    });

  if (upsertError) {
    throw new InviteSyncError("PROFILE_UPSERT_FAILED");
  }

  const { error: inviteUpdateError } = await serviceSupabase
    .from("invites")
    .update({
      used_by: userId,
      used_at: new Date().toISOString(),
      status: "used",
    })
    .eq("id", inviteId);

  if (inviteUpdateError) {
    throw new InviteSyncError("INVITE_UPDATE_FAILED");
  }
}

export async function submitInviteRequest(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const invite = await supabase
    .from("invites")
    .select("id, code, status")
    .eq("code", parsed.data.code)
    .maybeSingle();

  if (invite.error || !invite.data || invite.data.status !== "active") {
    return { error: "Convite inválido ou já utilizado." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")}/auth/callback?invite=${parsed.data.code}`,
    },
  });

  if (error) {
    return { error: "Não foi possível enviar o link mágico." };
  }

  return { success: true };
}

export async function handleAuthCallback(
  searchParams: URLSearchParams
): Promise<AuthCallbackResult> {
  const inviteCode = searchParams.get("invite");
  const code = searchParams.get("code");
  const supabase = createSupabaseServerClient();

  if (!code) {
    return { redirectTo: "/login?error=invalid" };
  }

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    return { redirectTo: "/login?error=invalid" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !inviteCode) {
    return { redirectTo: "/login?error=invalid" };
  }

  const invite = await supabase
    .from("invites")
    .select("id, status")
    .eq("code", inviteCode)
    .maybeSingle();

  if (!invite.data || invite.data.status === "used") {
    return { redirectTo: "/login?error=invite" };
  }

  const email = user.email;

  if (!email) {
    return { redirectTo: "/login?error=profile" };
  }

  const monthKey = getMonthKey();

  try {
    await syncInviteAndProfile({
      inviteId: invite.data.id,
      inviteCode,
      userId: user.id,
      email,
      monthKey,
    });
  } catch (error) {
    if (error instanceof InviteSyncError && error.code === "INVITE_INVALID") {
      return { redirectTo: "/login?error=invite" };
    }

    return { redirectTo: "/login?error=profile" };
  }

  return { redirectTo: "/dashboard" };
}

export async function createReservation(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const parsed = reservationSchema.safeParse({
    dropId: formData.get("dropId"),
    size: formData.get("size"),
  });

  if (!parsed.success) {
    return { error: "Seleção inválida." };
  }

  const monthKey = getMonthKey();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Autenticação necessária." };
  }

  const profile = await supabase
    .from("profiles")
    .select("monthly_limit, monthly_count, month_key, status")
    .eq("id", user.id)
    .single();

  if (profile.error || !profile.data) {
    return { error: "Perfil não encontrado." };
  }

  const currentCount = profile.data.month_key === monthKey ? profile.data.monthly_count : 0;
  if (profile.data.status !== "active") {
    return { error: "Conta inativa." };
  }
  if (currentCount >= profile.data.monthly_limit) {
    return { error: "Limite mensal atingido." };
  }

  const { error } = await supabase.rpc("create_reservation_with_limit", {
    p_drop_id: parsed.data.dropId,
    p_size: parsed.data.size,
    p_month_key: monthKey,
  });

  if (error) {
    return { error: "Não foi possível criar a reserva." };
  }

  revalidatePath("/dashboard");
  revalidatePath('/drops/[slug]', 'page');
  revalidatePath("/proximos-drops");
  return { success: true };
}

export async function upsertDrop(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const parsed = dropSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    image_url: formData.get("image_url"),
    price: Number(formData.get("price")),
    drop_date: formData.get("drop_date"),
    active: formData.get("active") === "on",
    sizes: String(formData.get("sizes") ?? "")
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const { error } = await supabase.from("drops").upsert({
    id: parsed.data.id,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    image_url: parsed.data.image_url,
    price: parsed.data.price,
    drop_date: parsed.data.drop_date,
    active: parsed.data.active,
    sizes: parsed.data.sizes,
  });

  if (error) {
    return { error: "Erro ao guardar drop." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/proximos-drops");
  return { success: true };
}

export async function updateReservationStatus(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const parsed = reservationStatusSchema.safeParse({
    reservationId: formData.get("reservationId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const { error } = await supabase
    .from("reservations")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.reservationId);

  if (error) {
    return { error: "Erro ao atualizar reserva." };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function generateInvites(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const parsed = inviteAdminSchema.safeParse({
    email: formData.get("email") || undefined,
    amount: Number(formData.get("amount")),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const { error } = await supabase.rpc("generate_invites", {
    p_amount: parsed.data.amount,
    p_email: parsed.data.email ?? null,
  });

  if (error) {
    return { error: "Erro ao gerar convites." };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/login");
}

export async function toggleUserStatus(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const id = formData.get("userId");
  const status = formData.get("status");

  if (!id || typeof id !== "string" || !status || typeof status !== "string") {
    return { error: "Dados inválidos." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { error: "Erro ao atualizar utilizador." };
  }

  revalidatePath("/admin");
  return { success: true };
}
