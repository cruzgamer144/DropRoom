import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { DropCard } from '../components/DropCard';
import { Footer } from '../components/Footer';
import { SectionHeading } from '../components/SectionHeading';
import { sampleCurrentDrops, sampleUpcomingDrops } from '../data/drops';
import type { Drop } from '../lib/types';

export default function LandingPage() {
  const [currentDrops, setCurrentDrops] = useState<Drop[]>(sampleCurrentDrops as Drop[]);
  const [upcomingDrops, setUpcomingDrops] = useState<Drop[]>(sampleUpcomingDrops as Drop[]);

  useEffect(() => {
    const loadDrops = async () => {
      try {
        const response = await fetch('/api/public-drops');
        if (!response.ok) return;
        const data = await response.json();
        setCurrentDrops(data.current ?? []);
        setUpcomingDrops(data.upcoming ?? []);
      } catch (error) {
        console.error(error);
      }
    };

    loadDrops();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="relative overflow-hidden bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-20 md:flex-row md:items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="text-xs uppercase tracking-[0.4em] text-ink/50">DropRoom</p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-ink md:text-5xl">
                Acesso Limitado. Autenticidade Garantida.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-ink/60">
                Uma curadoria privada de sneakers premium. Reserva os lançamentos mais cobiçados com acesso por convite e
                limite mensal controlado.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/login">
                  <Button>Entrar com Convite</Button>
                </Link>
                <Link href="#drops">
                  <Button variant="ghost">Explorar Drops</Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              className="relative flex flex-1 justify-end"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.1 }}
            >
              <div className="relative h-96 w-full max-w-lg overflow-hidden rounded-[3rem] border border-ink/5 bg-white/70 p-8 shadow-xl">
                <div className="gradient-border absolute inset-0 rounded-[3rem] opacity-70" aria-hidden />
                <div className="relative flex h-full flex-col justify-between">
                  <span className="text-xs uppercase tracking-[0.3em] text-ink/40">Concierge</span>
                  <h2 className="text-3xl font-semibold text-ink">Reserva antecipada, apenas para membros.</h2>
                  <p className="text-sm text-ink/50">
                    A DropRoom desbloqueia séries limitadas, inspeções certificadas e entregas expressas. Uma experiência
                    feita para colecionadores.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="drops" className="bg-white py-20">
          <div className="mx-auto w-full max-w-6xl px-6">
            <SectionHeading
              eyebrow="Agora"
              title="Drops Atuais"
              description="Reservas imediatas para membros ativos. Quantidades extremamente limitadas."
            />
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {currentDrops.map((drop) => (
                <DropCard
                  key={drop.id}
                  title={drop.name}
                  price={new Intl.NumberFormat('pt-PT', { style: 'currency', currency: drop.currency || 'EUR' }).format(
                    drop.price
                  )}
                  imageUrl={drop.image_url}
                  status="Autenticado"
                  onAction={() => (window.location.href = '/login')}
                  actionLabel="Reservar Agora"
                />
              ))}
            </div>
            <div className="mt-16 flex items-center justify-between gap-4">
              <SectionHeading
                eyebrow="Brevemente"
                title="Próximos Drops"
                description="Reserva antecipada com garantia DropRoom. Recebe alertas privados antes de cada lançamento."
              />
              <Link href="/proximos-drops" className="text-sm font-semibold text-ink transition hover:text-champagne">
                Ver todos
              </Link>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {upcomingDrops.map((drop) => (
                <DropCard
                  key={drop.id}
                  title={drop.name}
                  price={new Intl.NumberFormat('pt-PT', { style: 'currency', currency: drop.currency || 'EUR' }).format(
                    drop.price
                  )}
                  imageUrl={drop.image_url}
                  status="Em Breve"
                  onAction={() => (window.location.href = '/login')}
                  actionLabel="Reservar"
                  subtle
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
