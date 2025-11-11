"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getMonthKey } from "@/lib/utils";
import { revalidatePath } from "next/cache";
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

export async function handleAuthCallback(searchParams: URLSearchParams) {
  const inviteCode = searchParams.get("invite");
  const code = searchParams.get("code");
  const supabase = createSupabaseServerClient();

  if (!code) {
    redirect("/login?error=invalid");
  }

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    redirect("/login?error=invalid");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !inviteCode) {
    redirect("/login?error=invalid");
  }

  const invite = await supabase
    .from("invites")
    .select("id, status")
    .eq("code", inviteCode)
    .maybeSingle();

  if (!invite.data || invite.data.status === "used") {
    redirect("/login?error=invite");
  }

  const monthKey = getMonthKey();

  const serviceSupabase = createSupabaseServiceRoleClient();

  const { error } = await serviceSupabase.rpc("use_invite_and_sync_profile", {
    invite_code: inviteCode,
    user_id: user.id,
    email: user.email,
    month_key: monthKey,
  });

  if (error) {
    redirect("/login?error=profile");
  }

  redirect("/dashboard");
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
