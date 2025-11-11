"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { createReservation } from "@/lib/actions";

export function ReservationForm({ dropId, sizes, disabled }: { dropId: string; sizes: string[]; disabled: boolean }) {
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleReservation = (formData: FormData) => {
    startTransition(async () => {
      const result = await createReservation(formData);
      if (result?.error) {
        pushToast({ title: "Não foi possível reservar", description: result.error, variant: "destructive" });
      } else {
        pushToast({ title: "Reserva confirmada", description: "Verifica o dashboard para detalhes." });
      }
    });
  };

  return (
    <form
      className="flex flex-col gap-3"
      action={handleReservation}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        handleReservation(formData);
      }}
    >
      <input type="hidden" name="dropId" value={dropId} />
      <label className="text-sm font-medium text-slate-700" htmlFor={`size-${dropId}`}>
        Seleciona o tamanho
      </label>
      <select
        id={`size-${dropId}`}
        name="size"
        className="rounded-premium border border-slate-200 px-4 py-3 text-sm focus:border-champagne focus:ring-champagne"
        disabled={disabled || isPending}
        required
      >
        <option value="">Escolhe uma opção</option>
        {sizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={disabled || isPending}>
        {disabled ? "Limite atingido" : isPending ? "A reservar..." : "Reservar Agora"}
      </Button>
    </form>
  );
}
