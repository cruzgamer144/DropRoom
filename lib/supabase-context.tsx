import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './supabase-browser';

interface SupabaseContextValue {
  supabase: SupabaseClient;
  session: Session | null;
  isLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!isMounted) return;
      setSession(session ?? null);
      setIsLoading(false);
    };

    init();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(() => ({ supabase, session, isLoading }), [supabase, session, isLoading]);

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider.');
  }
  return context;
}
