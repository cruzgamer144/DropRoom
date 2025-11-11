import { Drop } from "@/types/database";
import { CardDrop } from "@/components/landing/card-drop";
import { motion } from "framer-motion";

export function CurrentDrops({ drops }: { drops: Drop[] }) {
  if (!drops.length) {
    return (
      <motion.div
        className="rounded-premium border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center text-slate-500"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="font-medium">Sem drops ativos no momento. Subscreve para seres o primeiro a saber.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-3">
      {drops.map((drop) => (
        <CardDrop key={drop.id} drop={drop} />
      ))}
    </div>
  );
}
