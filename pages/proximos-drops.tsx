import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '../components/Button';
import { DropCard } from '../components/DropCard';
import { Footer } from '../components/Footer';
import { NavBar } from '../components/NavBar';
import { SectionHeading } from '../components/SectionHeading';
import { sampleUpcomingDrops } from '../data/drops';
import type { Drop } from '../lib/types';

export default function UpcomingDropsPage() {
  const [drops, setDrops] = useState<Drop[]>(sampleUpcomingDrops as Drop[]);
  const [selected, setSelected] = useState<Drop | null>(drops[0] ?? null);
  const { session } = useSessionContext();

  useEffect(() => {
    const loadDrops = async () => {
      try {
        const response = await fetch('/api/public-drops');
        if (!response.ok) return;
        const data = await response.json();
        const upcoming = data.upcoming ?? [];
        setDrops(upcoming);
        setSelected(upcoming[0] ?? null);
      } catch (error) {
        console.error(error);
      }
    };

    loadDrops();
  }, []);

  useEffect(() => {
    if (!selected && drops.length > 0) {
      setSelected(drops[0]);
    }
  }, [drops, selected]);

  const detailId = 'detalhe';

  const formattedDropDate = useMemo(() => {
    if (!selected?.drop_date) return 'Data a anunciar';
    return new Date(selected.drop_date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }, [selected?.drop_date]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Head>
        <title>DropRoom · Próximos Drops</title>
      </Head>
      <NavBar minimal={!session} />
      <main className="flex-1 bg-white">
        <div className="gradient-border">
          <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16">
            <SectionHeading
              align="center"
              eyebrow="Calendário"
              title="Reserva o futuro da tua coleção"
              description="Conhece antecipadamente os sneakers que entram na DropRoom. Seleciona um drop para detalhes e reserva com prioridade premium."
            />
            <div className="mt-16 grid gap-10 lg:grid-cols-[2fr,1fr]">
              <div className="grid gap-8 md:grid-cols-2">
                {drops.map((drop) => (
                  <DropCard
                    key={drop.id}
                    title={drop.name}
                    price={new Intl.NumberFormat('pt-PT', { style: 'currency', currency: drop.currency || 'EUR' }).format(
                      drop.price
                    )}
                    imageUrl={drop.image_url}
                    status="Em Breve"
                    onAction={() => {
                      setSelected(drop);
                      const anchor = document.getElementById(detailId);
                      if (anchor) {
                        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    actionLabel={selected?.id === drop.id ? 'Selecionado' : 'Ver Detalhe'}
                    subtle
                  />
                ))}
              </div>
              <motion.aside
                id={detailId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="sticky top-28 h-fit rounded-3xl border border-ink/5 bg-white/90 p-8 shadow-xl"
              >
                {selected ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-ink/40">Drop Selecionado</p>
                      <h2 className="mt-3 text-2xl font-semibold text-ink">{selected.name}</h2>
                      <p className="mt-2 text-sm text-ink/60">{selected.description}</p>
                    </div>
                    <dl className="space-y-3 text-sm text-ink/70">
                      <div className="flex items-center justify-between">
                        <dt>Data</dt>
                        <dd>{formattedDropDate}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt>Investimento</dt>
                        <dd>
                          {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: selected.currency || 'EUR' }).format(
                            selected.price
                          )}
                        </dd>
                      </div>
                    </dl>
                    <Button
                      onClick={() => {
                        if (!session?.access_token) {
                          toast('Precisas de iniciar sessão para reservar.', {
                            icon: '🔐'
                          });
                          return;
                        }
                        toast.success('Seleciona "Reservar" no dashboard para finalizar.');
                        window.location.href = '/dashboard';
                      }}
                    >
                      Reservar prioridade
                    </Button>
                    <p className="text-xs text-ink/50">
                      Reservas limitadas a 3 pares/mês. O concierge DropRoom confirma o tamanho e entrega após reserva.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ink/60">Seleciona um drop para ver os detalhes.</p>
                )}
              </motion.aside>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
