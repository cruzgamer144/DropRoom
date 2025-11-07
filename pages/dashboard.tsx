import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { DropCard } from '../components/DropCard';
import { Footer } from '../components/Footer';
import { NavBar } from '../components/NavBar';
import { ProgressBar } from '../components/ProgressBar';
import { SectionHeading } from '../components/SectionHeading';
import type { Drop, Reservation } from '../lib/types';
import { useSupabase } from '../lib/supabase-context';

interface DashboardResponse {
  profile: {
    id: string;
    email: string;
    monthly_limit: number;
    items_this_month: number;
  };
  reservations: Reservation[];
  drops: Drop[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { session, isLoading: sessionLoading } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token = session?.access_token;

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace('/login');
    }
  }, [router, session, sessionLoading]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('/api/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const result = await response.json();
        toast.error(result.message || 'Não foi possível carregar dados.');
        return;
      }
      const result = (await response.json()) as DashboardResponse;
      setData(result);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar dashboard.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const upcomingDrops = useMemo(() => data?.drops.filter((drop) => drop.status === 'upcoming') ?? [], [data?.drops]);
  const currentDrops = useMemo(() => data?.drops.filter((drop) => drop.status === 'current') ?? [], [data?.drops]);

  const handleReserve = async (dropId: string) => {
    if (!token || !data) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ dropId })
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || 'Não foi possível reservar.');
        return;
      }

      toast.success('Reserva confirmada.');
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error('Erro inesperado ao reservar.');
    } finally {
      setSubmitting(false);
    }
  };

  const limitReached = data ? data.profile.items_this_month >= data.profile.monthly_limit : false;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Head>
        <title>DropRoom · Dashboard</title>
      </Head>
      <NavBar />
      <main className="flex-1 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <SectionHeading
            eyebrow="Acesso"
            title="O teu Lounge DropRoom"
            description="Acompanha reservas, limite mensal e os próximos lançamentos reservados só para ti."
          />

          {loading && (
            <p className="mt-12 text-sm text-ink/50">A carregar experiência premium…</p>
          )}

          {data && !loading && (
            <div className="mt-12 grid gap-12">
              <section className="grid gap-8 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-3xl border border-ink/5 bg-white/80 p-8 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-ink">Limite Mensal</h3>
                  <p className="mt-2 text-sm text-ink/60">
                    Reservas disponíveis este mês: {data.profile.monthly_limit - data.profile.items_this_month}
                  </p>
                  <div className="mt-6">
                    <ProgressBar value={data.profile.items_this_month} max={data.profile.monthly_limit} />
                  </div>
                  <p className="mt-4 text-sm font-medium text-ink">
                    {data.profile.items_this_month}/{data.profile.monthly_limit} reservas utilizadas
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-3xl border border-ink/5 bg-white/80 p-8 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-ink">Reservas Ativas</h3>
                  <ul className="mt-4 space-y-4 text-sm text-ink/70">
                    {data.reservations.length === 0 && <li>Sem reservas ativas neste momento.</li>}
                    {data.reservations.map((reservation) => (
                      <li key={reservation.id} className="flex items-center justify-between rounded-2xl border border-ink/5 px-4 py-3">
                        <div>
                          <p className="font-medium text-ink">{reservation.drop.name}</p>
                          <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{reservation.status}</p>
                        </div>
                        <span className="text-sm text-ink/60">
                          {new Date(reservation.created_at).toLocaleDateString('pt-PT', {
                            day: '2-digit',
                            month: 'short'
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <SectionHeading eyebrow="Agora" title="Drops disponíveis" />
                  <span className="text-xs uppercase tracking-[0.3em] text-ink/40">Concierge Ativo</span>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {currentDrops.map((drop) => (
                    <DropCard
                      key={drop.id}
                      title={drop.name}
                      price={new Intl.NumberFormat('pt-PT', { style: 'currency', currency: drop.currency || 'EUR' }).format(
                        drop.price
                      )}
                      imageUrl={drop.image_url}
                      status="Autenticado"
                      onAction={() => handleReserve(drop.id)}
                      disabled={limitReached || submitting}
                      actionLabel={limitReached ? 'Limite Atingido' : 'Reservar Agora'}
                      subtle
                    />
                  ))}
                </div>
                {limitReached && (
                  <p className="rounded-3xl border border-champagne/40 bg-champagne/10 px-6 py-4 text-sm text-ink/70">
                    Já utilizaste as 3 reservas premium deste mês. O contador reinicia automaticamente no próximo ciclo.
                  </p>
                )}
              </section>

              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <SectionHeading eyebrow="Em breve" title="Próximos Drops" />
                  <Button variant="ghost" onClick={() => router.push('/proximos-drops')}>
                    Ver calendário completo
                  </Button>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingDrops.map((drop) => (
                    <DropCard
                      key={drop.id}
                      title={drop.name}
                      price={new Intl.NumberFormat('pt-PT', { style: 'currency', currency: drop.currency || 'EUR' }).format(
                        drop.price
                      )}
                      imageUrl={drop.image_url}
                      status="Em Breve"
                      onAction={() => handleReserve(drop.id)}
                      disabled={limitReached || submitting}
                      actionLabel={limitReached ? 'Limite Atingido' : 'Reservar Agora'}
                      subtle
                    />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
