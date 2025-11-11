"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <motion.section
      className="relative overflow-hidden rounded-premium border border-slate-100 bg-gradient-to-br from-white to-slate-50 px-10 py-20 shadow-sm"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(230,194,0,0.15),transparent_55%)]" aria-hidden />
      <div className="mx-auto flex max-w-4xl flex-col gap-8 text-center">
        <div className="space-y-6">
          <span className="inline-flex items-center justify-center rounded-full border border-champagne/40 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-700">
            Premium Sneaker Club
          </span>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            DropRoom
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Acesso Limitado. Autenticidade Garantida. Descobre os drops privados de sneakers com curadoria de luxo, acesso por convite e reservas controladas.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/login">
            <Button>Entrar com Convite</Button>
          </Link>
          <Link href="#proximos-drops" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Ver Próximos Drops
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
