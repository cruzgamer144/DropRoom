"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export type Toast = {
  id: number;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

const ToastContext = createContext<{
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
} | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, pushToast, dismiss }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function Toaster() {
  const context = useContext(ToastContext);

  if (!context) return null;

  const { toasts, dismiss } = context;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-[100] flex flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex max-w-sm items-start gap-3 rounded-premium border px-5 py-4 shadow-lg",
            toast.variant === "destructive"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-slate-200 bg-white text-slate-900"
          )}
        >
          <div>
            {toast.title && <p className="font-semibold">{toast.title}</p>}
            {toast.description && <p className="text-sm text-slate-600">{toast.description}</p>}
          </div>
          <button
            type="button"
            className="ml-auto text-xs text-slate-500 underline"
            onClick={() => dismiss(toast.id)}
          >
            Fechar
          </button>
        </div>
      ))}
    </div>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser utilizado dentro de ToastProvider");
  }
  return context;
};
