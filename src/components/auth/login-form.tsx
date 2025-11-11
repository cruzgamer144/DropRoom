"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { submitInviteRequest, signInWithPassword, sendPasswordReset } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

const initialState = { error: "", success: false };

export function LoginForm() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [view, setView] = useState<"invite" | "password">("invite");
  const [showReset, setShowReset] = useState(false);

  const inviteReducer = async (_prevState: typeof initialState, formData: FormData) => {
    const result = await submitInviteRequest(formData);
    return {
      error: result?.error ?? "",
      success: Boolean(result?.success),
    };
  };

  const passwordReducer = async (_prevState: typeof initialState, formData: FormData) => {
    const result = await signInWithPassword(formData);
    return {
      error: result?.error ?? "",
      success: Boolean(result?.success),
    };
  };

  const resetReducer = async (_prevState: typeof initialState, formData: FormData) => {
    const result = await sendPasswordReset(formData);
    return {
      error: result?.error ?? "",
      success: Boolean(result?.success),
    };
  };

  const [inviteState, inviteAction] = useFormState(inviteReducer, initialState);

  const [passwordState, passwordAction] = useFormState(passwordReducer, initialState);

  const [resetState, resetAction] = useFormState(resetReducer, initialState);

  useEffect(() => {
    if (inviteState.error) {
      pushToast({
        title: "Convite inválido",
        description: inviteState.error,
        variant: "destructive",
      });
    } else if (inviteState.success) {
      pushToast({
        title: "Link enviado",
        description: "Verifica o teu e-mail para aceder ao DropRoom.",
      });
    }
  }, [inviteState, pushToast]);

  useEffect(() => {
    if (passwordState.error) {
      pushToast({
        title: "Não foi possível entrar",
        description: passwordState.error,
        variant: "destructive",
      });
    } else if (passwordState.success) {
      pushToast({
        title: "Bem-vindo de volta",
        description: "Acesso concedido à sala DropRoom.",
      });
      router.replace("/dashboard");
      router.refresh();
    }
  }, [passwordState, pushToast, router]);

  useEffect(() => {
    if (resetState.error) {
      pushToast({
        title: "Recuperação falhou",
        description: resetState.error,
        variant: "destructive",
      });
    } else if (resetState.success) {
      pushToast({
        title: "Email enviado",
        description: "Consulta a caixa de entrada para redefinir a tua senha.",
      });
      setShowReset(false);
      setView("password");
    }
  }, [resetState, pushToast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => {
              setView("invite");
              setShowReset(false);
            }}
            className={`rounded-full px-4 py-2 transition ${
              view === "invite"
                ? "bg-white text-slate-900 shadow-premium"
                : "hover:text-slate-900"
            }`}
          >
            Entrar com convite
          </button>
          <button
            type="button"
            onClick={() => {
              setView("password");
              setShowReset(false);
            }}
            className={`rounded-full px-4 py-2 transition ${
              view === "password"
                ? "bg-white text-slate-900 shadow-premium"
                : "hover:text-slate-900"
            }`}
          >
            Entrar com senha
          </button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {view === "invite" ? (
          <motion.form
            key="invite"
            action={inviteAction}
            className="space-y-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="tu@exemplo.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-slate-700">
                Código de Convite
              </label>
              <Input
                id="code"
                name="code"
                placeholder="DROP-XXXX"
                required
                autoComplete="one-time-code"
              />
            </div>
            <Button type="submit" className="w-full">
              Enviar Magic Link
            </Button>
            {inviteState.error ? (
              <p className="rounded-premium border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {inviteState.error}
              </p>
            ) : null}
            {inviteState.success ? (
              <p className="rounded-premium border border-champagne/40 bg-champagne/10 p-3 text-sm text-slate-700">
                Link enviado. Confirma a tua caixa de entrada.
              </p>
            ) : null}
          </motion.form>
        ) : showReset ? (
          <motion.form
            key="reset"
            action={resetAction}
            className="space-y-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="space-y-2">
              <label htmlFor="resetEmail" className="text-sm font-medium text-slate-700">
                Email associado à conta
              </label>
              <Input
                id="resetEmail"
                type="email"
                name="email"
                placeholder="tu@exemplo.com"
                required
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full">
              Enviar link de recuperação
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-slate-600 hover:text-slate-900"
              onClick={() => setShowReset(false)}
            >
              ← Voltar ao login com senha
            </Button>
            {resetState.error ? (
              <p className="rounded-premium border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {resetState.error}
              </p>
            ) : null}
            {resetState.success ? (
              <p className="rounded-premium border border-champagne/40 bg-champagne/10 p-3 text-sm text-slate-700">
                Email enviado. Segue o link para definir uma nova senha.
              </p>
            ) : null}
          </motion.form>
        ) : (
          <motion.form
            key="password"
            action={passwordAction}
            className="space-y-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="space-y-2">
              <label htmlFor="loginEmail" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <Input
                id="loginEmail"
                type="email"
                name="email"
                placeholder="tu@exemplo.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="loginPassword" className="text-sm font-medium text-slate-700">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-champagne transition hover:text-slate-900"
                  onClick={() => setShowReset(true)}
                >
                  Esqueceu a senha?
                </button>
              </div>
              <Input
                id="loginPassword"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
            {passwordState.error ? (
              <p className="rounded-premium border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {passwordState.error}
              </p>
            ) : null}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
