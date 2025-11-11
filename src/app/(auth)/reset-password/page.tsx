import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=invalid");
  }

  const profileResponse = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();

  const email = profileResponse.data?.email ?? user.email ?? undefined;

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-16">
      <div className="mx-auto w-full max-w-xl space-y-8 rounded-premium border border-white/60 bg-white/90 p-10 shadow-2xl shadow-black/5">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-champagne">Segurança DropRoom</p>
          <h1 className="font-display text-3xl font-semibold text-slate-900">Redefinir senha</h1>
          <p className="text-sm text-slate-600">
            Escolhe uma nova senha para continuares a desfrutar dos lançamentos exclusivos DropRoom.
          </p>
        </header>
        <ResetPasswordForm email={email} />
        <p className="text-center text-xs text-slate-500">
          Se não fizeste este pedido, termina a sessão imediatamente e contacta o nosso suporte dedicado.
        </p>
      </div>
    </div>
  );
}
