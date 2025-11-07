import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '../../components/Button';
import { useSupabase } from '../../lib/supabase-context';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { session, isLoading } = useSupabase();
  const invite =
    typeof router.query.invite === 'string' ? router.query.invite.trim().toUpperCase() : '';

  useEffect(() => {
    const finalize = async () => {
      if (!session?.access_token || !invite) return;

      try {
        const response = await fetch('/api/complete-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ inviteCode: invite })
        });

        if (!response.ok) {
          const result = await response.json();
          toast.error(result.message || 'Erro ao validar convite.');
        } else {
          toast.success('Convite validado. Bem-vindo à DropRoom.');
        }
      } catch (error) {
        console.error(error);
        toast.error('Não foi possível concluir o login.');
      } finally {
        router.replace('/dashboard');
      }
    };

    finalize();
  }, [invite, router, session?.access_token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <Head>
        <title>DropRoom · A validar convite</title>
      </Head>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/50">DropRoom</p>
        <h1 className="mt-4 text-2xl font-semibold text-ink">A validar o teu acesso exclusivo…</h1>
        <p className="mt-3 text-sm text-ink/60">
          Estamos a confirmar o teu convite e a preparar o teu dashboard personalizado.
        </p>
        <Button className="mt-8" disabled>
          {isLoading ? 'Aguarda…' : 'A concluir sessão'}
        </Button>
      </motion.div>
    </div>
  );
}
