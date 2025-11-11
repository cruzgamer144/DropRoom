"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Drop } from "@/types/database";

interface UpcomingDropGridProps {
  drops: Drop[];
}

export function UpcomingDropGrid({ drops }: UpcomingDropGridProps) {
  if (!drops.length) {
    return (
      <motion.div
        className="rounded-premium border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center text-slate-500"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="font-medium">Sem próximos drops. Volta em breve.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-12 md:grid-cols-3">
      {drops.map((drop) => (
        <motion.article
          key={drop.id}
          className="group flex flex-col overflow-hidden rounded-premium border border-slate-100 bg-white"
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
            />
            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" aria-hidden>
              <div className="absolute inset-0 bg-sheen bg-[length:200%_200%] mix-blend-screen" />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="space-y-2">
              <h2 className="font-display text-xl text-slate-900">{drop.name}</h2>
              <p className="text-sm text-slate-600 line-clamp-3">{drop.description}</p>
            </div>
            <div className="text-sm text-slate-500">
              <p>
                <span className="font-medium text-slate-900">Preço:</span> {formatPrice(drop.price)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Data:</span>{" "}
                {new Date(drop.drop_date).toLocaleDateString("pt-PT")}
              </p>
              <p>
                <span className="font-medium text-slate-900">Tamanhos:</span> {drop.sizes.join(", ")}
              </p>
            </div>
            <Link href={`/drops/${drop.slug}`} className="mt-auto">
              <Button className="w-full">Reservar</Button>
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
