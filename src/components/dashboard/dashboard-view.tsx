"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

import { Profile, Reservation, Drop } from "@/types/database";
import { ProgressBar } from "@/components/ui/progress";
import { ReservationForm } from "@/components/dashboard/reservation-form";
import { formatPrice } from "@/lib/utils";

interface DashboardViewProps {
  profile: Profile;
  reservations: Reservation[];
  drops: Drop[];
  monthKey: string;
}

export function DashboardView({ profile, reservations, drops, monthKey }: DashboardViewProps) {
  const [showAllReservations, setShowAllReservations] = useState(false);

  const { currentCount, limitReached, activeReservations, accountStatusLabel } = useMemo(() => {
    const active = reservations.filter((reservation) => reservation.status !== "cancelado");
    const current = active.filter((reservation) => (reservation.month_key ?? monthKey) === monthKey).length;
    const limit = current >= profile.monthly_limit;
    const accountLabel =
      profile.status === "active" ? "Ativa" : profile.status === "suspended" ? "Suspensa" : "Pendente";
    return {
      activeReservations: active,
      currentCount: current,
      limitReached: limit,
      accountStatusLabel: accountLabel,
    };
  }, [reservations, profile, monthKey]);

  const reservationsToDisplay = showAllReservations ? activeReservations : activeReservations.slice(0, 3);
  const hasMoreReservations = activeReservations.length > 3;
  const upcomingDrops = drops.slice(0, 4);
  const nextDrop = upcomingDrops[0];

  return (
    <div className="space-y-12 px-6 pb-24 pt-12 sm:px-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-premium border border-champagne/40 bg-champagne/10 px-6 py-4 text-sm text-slate-800"
      >
        <p className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-black px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white">
            Notificação
          </span>
          {nextDrop ? (
            <span>
              Novo drop <strong>{nextDrop.name}</strong> chega em {new Date(nextDrop.drop_date).toLocaleDateString("pt-PT")}. Garante a
              tua reserva antecipada.
            </span>
          ) : (
            <span>Fica atento: novos drops exclusivos serão anunciados em breve.</span>
          )}
        </p>
      </motion.div>

      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        className="space-y-2"
      >
        <h1 className="font-display text-3xl font-semibold text-slate-900">Dashboard exclusivo</h1>
        <p className="text-sm text-slate-600">Controla limites, reservas e novos lançamentos num só lugar.</p>
      </motion.header>

      <section className="grid gap-6 md:grid-cols-3">
        {["Limite mensal", "Estado da conta", "Convites e perks"].map((title, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 * index }}
            whileHover={{ y: -6, boxShadow: "0 20px 45px -30px rgba(15, 23, 42, 0.45)" }}
            className="rounded-premium border border-slate-100 bg-white p-8 shadow-sm"
          >
            {title === "Limite mensal" && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Limite deste mês</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {currentCount}
                    <span className="text-base text-slate-500">/{profile.monthly_limit}</span>
                  </p>
                </div>
                <ProgressBar value={currentCount} max={profile.monthly_limit} />
                {limitReached ? (
                  <p className="text-xs font-medium text-red-500">Limite de reservas atingido. As contagens reiniciam no próximo mês.</p>
                ) : (
                  <p className="text-xs text-slate-500">Tens {profile.monthly_limit - currentCount} reservas disponíveis este mês.</p>
                )}
              </div>
            )}
            {title === "Estado da conta" && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Estado da conta</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{accountStatusLabel}</p>
                </div>
                <p className="text-sm text-slate-600">
                  Mantém-te ativo realizando reservas mensais e confirmações de pagamento atempadas.
                </p>
                <Link
                  href="/proximos-drops"
                  className="inline-flex items-center text-sm font-semibold text-slate-900 transition hover:text-black"
                >
                  Explorar próximos drops →
                </Link>
              </div>
            )}
            {title === "Convites e perks" && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Rede premium</p>
                  <p className="mt-2 text-base text-slate-600">
                    Partilha o DropRoom com pessoas selecionadas e desbloqueia perks exclusivos.
                  </p>
                </div>
                <Link
                  href="mailto:concierge@droproom.club"
                  className="inline-flex text-sm font-semibold text-slate-900 transition hover:text-black"
                >
                  Falar com o concierge →
                </Link>
              </div>
            )}
          </motion.div>
        ))}
      </section>

      <section className="grid gap-10 lg:grid-cols-[2fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="rounded-premium border border-slate-100 bg-white p-8 shadow-sm"
          id="reservas-ativas"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-slate-900">Reservas ativas</h2>
              <p className="text-sm text-slate-500">Acompanha cada etapa dos teus pares reservados.</p>
            </div>
            {hasMoreReservations ? (
              <button
                type="button"
                onClick={() => setShowAllReservations((value) => !value)}
                className="rounded-full border border-champagne/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-800 transition hover:border-champagne hover:bg-champagne/20"
              >
                {showAllReservations ? "Ver menos" : "Ver todas"}
              </button>
            ) : null}
          </div>
          <div className="mt-6 space-y-4">
            <AnimatePresence initial={false}>
              {reservationsToDisplay.length ? (
                reservationsToDisplay.map((reservation) => (
                  <motion.div
                    key={reservation.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="rounded-premium border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{reservation.drop?.name ?? "Drop exclusivo"}</p>
                        <p>Tamanho: {reservation.size}</p>
                        <p className="text-xs text-slate-400">
                          Reservado em {new Date(reservation.created_at).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase text-slate-700">
                        {reservation.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-premium border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500"
                >
                  Ainda não tens reservas ativas. Explora os próximos drops para garantir o teu par.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="space-y-6"
        >
          <div className="rounded-premium border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl text-slate-900">Reserva rápida</h2>
            {nextDrop ? (
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900">{nextDrop.name}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {new Date(nextDrop.drop_date).toLocaleDateString("pt-PT")}
                </p>
                <ReservationForm dropId={nextDrop.id} sizes={nextDrop.sizes} disabled={limitReached} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Em breve anunciaremos novos drops premium.</p>
            )}
          </div>
          <div className="rounded-premium border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl text-slate-900">Limite mensal</h2>
            <p className="mt-2 text-sm text-slate-600">Reservas renovam automaticamente a cada mês.</p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">Membro desde</p>
            <p className="text-sm font-semibold text-slate-900">
              {new Date(profile.created_at).toLocaleDateString("pt-PT")}
            </p>
          </div>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-slate-900">Próximos drops</h2>
            <p className="text-sm text-slate-500">Seleciona o drop que queres garantir.</p>
          </div>
          <Link
            href="/proximos-drops"
            className="rounded-full border border-champagne/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-800 transition hover:border-champagne hover:bg-champagne/20"
          >
            Ver todos os drops
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {upcomingDrops.length ? (
            upcomingDrops.map((drop) => (
              <motion.article
                key={drop.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -6, boxShadow: "0 26px 55px -35px rgba(15, 23, 42, 0.55)" }}
                className="flex flex-col gap-3 rounded-premium border border-slate-100 bg-white p-6 shadow-sm"
              >
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {new Date(drop.drop_date).toLocaleDateString("pt-PT")}
                  </p>
                  <h3 className="font-display text-lg text-slate-900">{drop.name}</h3>
                  <p className="text-sm text-slate-500">{formatPrice(drop.price)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>Sizes: {drop.sizes.slice(0, 4).join(", ")}{drop.sizes.length > 4 ? "…" : ""}</span>
                  <Link
                    href={`/drops/${drop.slug}`}
                    className="group relative inline-flex items-center gap-2 rounded-full border border-champagne/60 bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:-translate-y-0.5 hover:shadow-premium"
                  >
                    <span className="relative z-10">Reservar</span>
                    <span
                      className="pointer-events-none absolute inset-0 rounded-full bg-sheen bg-[length:250%_250%] opacity-0 transition duration-500 group-hover:opacity-100 group-hover:animate-sheen"
                      aria-hidden
                    />
                  </Link>
                </div>
              </motion.article>
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-premium border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500"
            >
              Em breve anunciaremos novos drops exclusivos. Mantém-te atento ao teu e-mail DropRoom.
            </motion.p>
          )}
        </div>
      </motion.section>
    </div>
  );
}
