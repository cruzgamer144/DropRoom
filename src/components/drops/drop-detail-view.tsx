"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { Drop, Profile } from "@/types/database";
import { ReservationForm } from "@/components/dashboard/reservation-form";
import { formatPrice } from "@/lib/utils";

interface DropDetailViewProps {
  drop: Drop;
  profile: Profile;
  limitReached: boolean;
  currentCount: number;
}

export function DropDetailView({ drop, profile, limitReached, currentCount }: DropDetailViewProps) {
  const accountLimit = profile.monthly_limit;

  return (
    <div className="relative space-y-10 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-[calc(var(--header-height)+12px)] z-20 mx-6 sm:mx-12"
        style={{ maxWidth: "68rem" }}
      >
        <Link
          href="/proximos-drops"
          className="group relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-champagne hover:bg-white"
        >
          <span className="text-lg">←</span>
          <span className="relative z-10">Voltar</span>
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-sheen bg-[length:240%_240%] opacity-0 transition duration-500 group-hover:opacity-100 group-hover:animate-sheen"
            aria-hidden
          />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mx-auto grid max-w-6xl gap-12 px-6 pt-8 sm:px-12 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="group relative overflow-hidden rounded-premium border border-slate-100 bg-white shadow-sm">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={drop.image_url}
              alt={`Imagem do drop ${drop.name}`}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.02]"
              priority
            />
            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" aria-hidden>
              <div className="absolute inset-0 bg-sheen bg-[length:220%_220%] mix-blend-screen" />
            </div>
          </div>
        </div>
        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="space-y-6 rounded-premium border border-slate-100 bg-white p-8 shadow-sm"
        >
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-semibold text-slate-900">{drop.name}</h1>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Drop exclusivo DropRoom</p>
          </div>
          <p className="text-base text-slate-600">{drop.description}</p>
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-900">Preço:</span> {formatPrice(drop.price)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Data:</span> {new Date(drop.drop_date).toLocaleDateString("pt-PT")}
            </p>
            <p>
              <span className="font-medium text-slate-900">Tamanhos:</span> {drop.sizes.join(", ")}
            </p>
          </div>
          <div className="rounded-premium border border-champagne/50 bg-champagne/10 p-4 text-sm text-slate-700">
            <p>
              Limite mensal: <span className="font-semibold text-slate-900">{currentCount}/{accountLimit}</span>
            </p>
            <p>Reservas renovam a cada mês.</p>
          </div>
          <ReservationForm dropId={drop.id} sizes={drop.sizes} disabled={limitReached} />
        </motion.aside>
      </motion.div>
    </div>
  );
}
