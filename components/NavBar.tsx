import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Button } from './Button';
import { useSupabase } from '../lib/supabase-context';

interface NavBarProps {
  minimal?: boolean;
}

export function NavBar({ minimal }: NavBarProps) {
  const router = useRouter();
  const { supabase } = useSupabase();

  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Não foi possível terminar sessão.');
      return;
    }
    toast.success('Sessão terminada com sucesso.');
    router.push('/');
  }, [router, supabase]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
          DropRoom
        </Link>
        {!minimal && (
          <div className="flex items-center gap-4">
            <Link href="/proximos-drops" className="text-sm text-ink/70 transition hover:text-ink">
              Próximos Drops
            </Link>
            <Button variant="ghost" onClick={handleSignOut}>
              Sair
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
