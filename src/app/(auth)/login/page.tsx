import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const error = typeof searchParams?.error === "string" ? searchParams?.error : undefined;
  const messages: Record<string, string> = {
    invalid: "Sessão inválida. Tenta novamente.",
    invite: "Este convite é inválido ou já foi usado.",
    profile: "Não foi possível criar o teu perfil. Contacta o suporte.",
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-16">
      <Suspense fallback={<p>Carregando…</p>}>
        <div className="mx-auto max-w-lg space-y-8 rounded-premium border border-slate-100 bg-white/90 p-10 shadow-sm">
          <header className="space-y-2 text-center">
            <h1 className="font-display text-3xl font-semibold text-slate-900">Acesso por Convite</h1>
            <p className="text-sm text-slate-600">Insere o teu e-mail e código exclusivo para receber o Magic Link.</p>
          </header>
          {error && (
            <p className="rounded-premium border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {messages[error] ?? "Não foi possível entrar."}
            </p>
          )}
          <LoginForm />
          <p className="text-center text-xs text-slate-500">
            Ao continuar estás a concordar com os Termos exclusivos DropRoom.
          </p>
        </div>
      </Suspense>
    </div>
  );
}
