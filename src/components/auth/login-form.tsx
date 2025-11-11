"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { submitInviteRequest } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

const initialState = { error: "", success: false };

export function LoginForm() {
  const { pushToast } = useToast();
  const [state, formAction] = useFormState(async (_prev, formData) => {
    const result = await submitInviteRequest(formData);
    return {
      error: result?.error ?? "",
      success: Boolean(result?.success),
    };
  }, initialState);

  useEffect(() => {
    if (state.error) {
      pushToast({ title: "Convite inválido", description: state.error, variant: "destructive" });
    } else if (state.success) {
      pushToast({ title: "Link enviado", description: "Verifica o teu e-mail para aceder ao DropRoom." });
    }
  }, [state, pushToast]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <Input id="email" type="email" name="email" placeholder="tu@exemplo.com" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <label htmlFor="code" className="text-sm font-medium text-slate-700">
          Código de Convite
        </label>
        <Input id="code" name="code" placeholder="DROP-XXXX" required autoComplete="one-time-code" />
      </div>
      <Button type="submit" className="w-full">
        Enviar Magic Link
      </Button>
      {state.error && (
        <p className="rounded-premium border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-premium border border-champagne/50 bg-champagne/10 p-3 text-sm text-slate-700">
          Link enviado. Confirma a tua caixa de entrada.
        </p>
      )}
    </form>
  );
}
