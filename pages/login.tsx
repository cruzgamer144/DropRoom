import { FormEvent, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inviteCode })
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || 'Não foi possível enviar o Magic Link.');
      } else {
        toast.success(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Head>
        <title>DropRoom · Entrar</title>
      </Head>
      <main className="flex flex-1 flex-col">
        <div className="relative flex flex-1 items-center justify-center px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md rounded-3xl border border-ink/5 bg-white/90 p-10 shadow-lg"
          >
            <div className="mb-8 text-center">
              <Link href="/" className="text-xl font-semibold tracking-tight text-ink">
                DropRoom
              </Link>
              <p className="mt-3 text-sm text-ink/60">
                Acesso apenas por convite. Introduz o teu email e código para receber um Magic Link.
              </p>
            </div>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm font-medium text-ink">
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-base text-ink shadow-sm transition focus:border-champagne focus:outline-none"
                  placeholder="tu@exemplo.com"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-ink">
                Código de Convite
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  className="uppercase tracking-[0.4em] rounded-2xl border border-ink/10 bg-white px-4 py-3 text-base text-ink shadow-sm transition focus:border-champagne focus:outline-none"
                  placeholder="XXXX-XXXX"
                />
              </label>
              <Button type="submit" loading={loading} disabled={loading || !email || !inviteCode}>
                Enviar Magic Link
              </Button>
              <p className="text-center text-xs text-ink/50">
                O acesso é exclusivo. Caso não possuas convite, contacta o concierge DropRoom.
              </p>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
