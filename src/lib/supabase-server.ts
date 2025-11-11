import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig } from "@/lib/supabase-config";

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

export const createSupabaseServerClient = () => {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // noop - setting cookies is only supported inside route handlers or server actions
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.delete({ name, ...options });
        } catch {
          // noop - deleting cookies is only supported inside route handlers or server actions
        }
      },
    },
  });
};

