import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase-config";

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

export const createSupabaseBrowserClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);

export type TypedSupabaseClient = SupabaseClient;

