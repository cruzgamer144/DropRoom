"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { completePasswordReset } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";

const initialState = { error: "", success: false };

interface ResetPasswordFormProps {
  email?: string;
}

export function ResetPasswordForm({ email }: ResetPasswordFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [state, formAction] = useFormState(async (_prevState, formData) => {
    const result = await completePasswordReset(formData);
    return {
      error: result?.error ?? "",
      success: Boolean(result?.success),
    };
  }, initialState);

  useEffect(() => {
    if (state.error) {
      pushToast({
        title: "Erro ao redefinir",
        description: state.error,
        variant: "destructive",
      });
    } else if (state.success) {
      pushToast({
        title: "Senha atualizada",
        description: "A tua nova senha está ativa. Redirecionando para o dashboard.",
      });
      router.replace("/dashboard");
      router.refresh();
    }
  }, [state, pushToast, router]);

  return (
    <motion.form
      action={formAction}
      className="space-y-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {email ? (
        <p className="rounded-premium border border-slate-200 bg-white/60 p-3 text-xs text-slate-600">
          Conta DropRoom: <span className="font-medium text-slate-900">{email}</span>
        </p>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-slate-800">
          Nova senha
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-800">
          Confirmar senha
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" className="w-full">
        Atualizar senha
      </Button>
      {state.error ? (
        <p className="rounded-premium border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
      ) : null}
    </motion.form>
  );
}
