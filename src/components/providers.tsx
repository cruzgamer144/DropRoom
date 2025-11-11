"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  createSupabaseBrowserClient,
  TypedSupabaseClient,
} from "@/lib/supabase-browser";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toaster";

const SupabaseContext = createContext<TypedSupabaseClient | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  return (
    <SupabaseContext.Provider value={supabase}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const client = useContext(SupabaseContext);
  if (!client) {
    throw new Error("useSupabase deve ser utilizado dentro de Providers");
  }
  return client;
};
