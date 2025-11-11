"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Drop } from "@/types/database";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";

export function CardDrop({ drop }: { drop: Drop }) {
  return (
    <motion.article
      className="group flex h-full flex-col overflow-hidden rounded-premium border border-slate-100 bg-white shadow-sm"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={drop.image_url}
          alt={`Sneaker ${drop.name}`}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          priority={false}
        />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" aria-hidden>
          <div className="absolute inset-0 bg-sheen bg-[length:200%_200%] mix-blend-screen" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-slate-900">{drop.name}</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wide text-slate-600">
            {format(new Date(drop.drop_date), "d MMM", { locale: pt })}
          </span>
        </div>
        <p className="flex-1 text-sm text-slate-600 line-clamp-3">{drop.description}</p>
        <div className="mt-auto flex items-center justify-between text-sm text-slate-500">
          <span className="text-base font-semibold text-slate-900">{formatPrice(drop.price)}</span>
          <span>Tamanhos: {drop.sizes.join(", ")}</span>
        </div>
        <Link href={`/drops/${drop.slug}`} className="mt-4">
          <Button className="w-full">Reservar Agora</Button>
        </Link>
      </div>
    </motion.article>
  );
}
