import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase-config";

const { supabaseUrl } = getSupabaseConfig();

const createClientWithKey = (serviceRoleKey: string) =>
  createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

export const createSupabaseServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Variável SUPABASE_SERVICE_ROLE_KEY em falta. Define-a para permitir operações privilegiadas no servidor."
    );
  }

  return createClientWithKey(serviceRoleKey);
};

export const tryCreateSupabaseServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return null;
  }

  return createClientWithKey(serviceRoleKey);
};

