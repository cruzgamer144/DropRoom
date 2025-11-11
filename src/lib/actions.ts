"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { tryCreateSupabaseServiceRoleClient } from "@/lib/supabase-service-role";
import { getMonthKey } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6),
});

const reservationSchema = z.object({
  dropId: z.string().uuid(),
  size: z.string().min(1),
});

const electronicsOrderSchema = z.object({
  productId: z.string().uuid(),
});

const passwordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const passwordResetSchema = z.object({
  email: z.string().email(),
});

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "A nova senha deve ser diferente da atual.",
  });

const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const extractValidationMessage = (issues: z.ZodIssue[]) =>
  issues[0]?.message ?? "Dados inválidos.";

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

async function syncInviteAndProfile(
  {
    inviteId,
    inviteCode,
    userId,
    email,
    monthKey,
  }: SyncInviteParams,
  supabase: ReturnType<typeof createSupabaseServerClient>
) {
  const { error: rpcError } = await supabase.rpc(
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

  const normalizedError = rpcError.message?.toLowerCase() ?? "";

  if (
    normalizedError.includes("convite inexistente") ||
    normalizedError.includes("convite já utilizado")
  ) {
    throw new InviteSyncError("INVITE_INVALID");
  }

  const serviceSupabase = tryCreateSupabaseServiceRoleClient();

  if (!serviceSupabase) {
    throw new InviteSyncError("PROFILE_UPSERT_FAILED");
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
    .select(
      "role, monthly_limit, monthly_count, month_key, electronics_monthly_limit, electronics_monthly_count, electronics_month_key, has_password"
    )
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
  const electronicsCarryOver =
    profileResponse.data?.electronics_month_key === monthKey
      ? profileResponse.data?.electronics_monthly_count ?? 0
      : 0;
  const electronicsLimit =
    profileResponse.data?.electronics_monthly_limit ?? 3;
  const hasPassword = profileResponse.data?.has_password ?? false;

  const { error: upsertError } = await serviceSupabase
    .from("profiles")
    .upsert({
      id: userId,
      email,
      role,
      monthly_limit: monthlyLimit,
      monthly_count: carryOverCount,
      month_key: monthKey,
      electronics_monthly_limit: electronicsLimit,
      electronics_monthly_count: electronicsCarryOver,
      electronics_month_key: monthKey,
      status: "active",
      has_password: hasPassword,
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
      emailRedirectTo: `${getSiteUrl()}/auth/callback?invite=${parsed.data.code}`,
    },
  });

  if (error) {
    return { error: "Não foi possível enviar o link mágico." };
  }

  return { success: true };
}

async function applyPasswordUpdate(password: string) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Autenticação necessária." } as const;
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password,
  });

  if (updateError) {
    return { error: "Não foi possível atualizar a senha." } as const;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ has_password: true })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Senha atualizada mas o perfil não foi sincronizado." } as const;
  }

  revalidatePath("/dashboard");
  return { success: true } as const;
}

export async function completePasswordSetup(formData: FormData) {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: extractValidationMessage(parsed.error.issues) };
  }

  return applyPasswordUpdate(parsed.data.password);
}

export async function completePasswordReset(formData: FormData) {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: extractValidationMessage(parsed.error.issues) };
  }

  return applyPasswordUpdate(parsed.data.password);
}

export async function signInWithPassword(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Credenciais inválidas." };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Email ou senha incorretos." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function sendPasswordReset(formData: FormData) {
  const parsed = passwordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "Email inválido." };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/callback?type=recovery`,
  });

  if (error) {
    return { error: "Não foi possível enviar o email de recuperação." };
  }

  return { success: true };
}

export async function changePassword(formData: FormData) {
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: extractValidationMessage(parsed.error.issues) };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    return { error: "Autenticação necessária." };
  }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (authError) {
    return { error: "A senha atual está incorreta." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (updateError) {
    return { error: "Não foi possível atualizar a senha." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ has_password: true })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Senha atualizada mas o perfil não foi sincronizado." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function handleAuthCallback(
  searchParams: URLSearchParams
): Promise<AuthCallbackResult> {
  const inviteCode = searchParams.get("invite");
  const code = searchParams.get("code");
  const type = searchParams.get("type") ?? "invite";
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

  if (!user) {
    return { redirectTo: "/login?error=invalid" };
  }

  if (type === "recovery") {
    return { redirectTo: "/reset-password" };
  }

  if (!inviteCode) {
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
    await syncInviteAndProfile(
      {
        inviteId: invite.data.id,
        inviteCode,
        userId: user.id,
        email,
        monthKey,
      },
      supabase
    );
  } catch (error) {
    if (error instanceof InviteSyncError && error.code === "INVITE_INVALID") {
      return { redirectTo: "/login?error=invite" };
    }

    return { redirectTo: "/login?error=profile" };
  }

  const profile = await supabase
    .from("profiles")
    .select("has_password")
    .eq("id", user.id)
    .maybeSingle();

  if (profile.error) {
    return { redirectTo: "/login?error=profile" };
  }

  const hasPassword = profile.data?.has_password ?? false;

  return { redirectTo: hasPassword ? "/dashboard" : "/set-password" };
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

export async function createElectronicsOrder(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const parsed = electronicsOrderSchema.safeParse({
    productId: formData.get("productId"),
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
    .select(
      "status, electronics_monthly_limit, electronics_monthly_count, electronics_month_key"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profile.error || !profile.data) {
    return { error: "Perfil não encontrado." };
  }

  if (profile.data.status !== "active") {
    return { error: "Conta inativa." };
  }

  const currentCount =
    profile.data.electronics_month_key === monthKey
      ? profile.data.electronics_monthly_count ?? 0
      : 0;

  if (currentCount >= (profile.data.electronics_monthly_limit ?? 3)) {
    return { error: "Limite mensal de eletrónicos atingido." };
  }

  const product = await supabase
    .from("electronics_products")
    .select("status")
    .eq("id", parsed.data.productId)
    .maybeSingle();

  if (product.error || !product.data) {
    return { error: "Produto indisponível." };
  }

  if (product.data.status === "sold_out") {
    return { error: "Produto esgotado." };
  }

  const { error } = await supabase.rpc("create_electronics_order_with_limit", {
    p_product_id: parsed.data.productId,
    p_month_key: monthKey,
  });

  if (error) {
    const message =
      error.message && error.message.includes("eletrónicos")
        ? "Limite mensal de eletrónicos atingido."
        : "Não foi possível processar o pedido.";
    return { error: message };
  }

  revalidatePath("/eletronicos");
  revalidatePath("/dashboard");
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
