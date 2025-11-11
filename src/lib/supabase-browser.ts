import { createBrowserClient, SupabaseClient } from "@supabase/auth-helpers-nextjs";

import { getSupabaseConfig } from "@/lib/supabase-config";

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

export const createSupabaseBrowserClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);

export type TypedSupabaseClient = SupabaseClient;

