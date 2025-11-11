import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { SetPasswordForm } from "@/components/auth/set-password-form";

export default async function SetPasswordPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileResponse = await supabase
    .from("profiles")
    .select("email, has_password, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileResponse.error || !profileResponse.data) {
    redirect("/login?error=profile");
  }

  if (profileResponse.data.has_password) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-16">
      <div className="mx-auto w-full max-w-xl space-y-8 rounded-premium border border-white/60 bg-white/90 p-10 shadow-2xl shadow-black/5">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-champagne">Convite DropRoom</p>
          <h1 className="font-display text-3xl font-semibold text-slate-900">Define a tua senha exclusiva</h1>
          <p className="text-sm text-slate-600">
            Cria uma senha premium para aceder ao DropRoom com total segurança. Mantém a experiência convidada protegida.
          </p>
        </header>
        <SetPasswordForm email={profileResponse.data.email ?? user.email ?? undefined} />
        <p className="text-center text-xs text-slate-500">
          A tua sessão está protegida com encriptação de nível supremo. Precisas de ajuda? Contacta o concierge DropRoom.
        </p>
      </div>
    </div>
  );
}
