"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { changePassword } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";

type ChangePasswordState = {
  error: string;
  success: boolean;
};

const initialState: ChangePasswordState = { error: "", success: false };

interface ChangePasswordFormProps {
  onClose: () => void;
}

export function ChangePasswordForm({ onClose }: ChangePasswordFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const passwordReducer = async (
    _prevState: ChangePasswordState,
    formData: FormData,
  ): Promise<ChangePasswordState> => {
    const result = await changePassword(formData);
    return {
      error: result?.error ?? "",
      success: Boolean(result?.success),
    };
  };

  const [state, formAction] = useFormState<ChangePasswordState>(passwordReducer, initialState);

  useEffect(() => {
    if (state.error) {
      pushToast({
        title: "Não foi possível atualizar",
        description: state.error,
        variant: "destructive",
      });
    } else if (state.success) {
      pushToast({
        title: "Senha atualizada",
        description: "As tuas credenciais foram renovadas com sucesso.",
      });
      router.refresh();
      onClose();
    }
  }, [state, pushToast, router, onClose]);

  return (
    <motion.form
      action={formAction}
      className="space-y-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="space-y-2">
        <label htmlFor="currentPassword" className="text-sm font-semibold text-slate-800">
          Senha atual
        </label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-semibold text-slate-800">
          Nova senha
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="••••••••"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-800">
          Confirmar nova senha
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="••••••••"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          Atualizar senha
        </Button>
      </div>
      {state.error ? (
        <p className="rounded-premium border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
      ) : null}
    </motion.form>
  );
}
