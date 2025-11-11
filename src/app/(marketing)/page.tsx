import { Hero } from "@/components/landing/hero";
import { CurrentDrops } from "@/components/landing/current-drops";
import { getActiveDrops } from "@/lib/queries";
import Link from "next/link";

const highlightPoints = [
  "Autenticidade verificada",
  "Limite mensal de 3 reservas",
  "Pagamentos seguros",
];

export default async function HomePage() {
  const drops = await getActiveDrops();

  return (
    <div className="space-y-24 px-6 pb-24 pt-20 sm:px-12">
      <Hero />
      <section className="space-y-10" id="drops-atuais">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-slate-900">Drops Atuais</h2>
            <p className="text-sm text-slate-600">Reservas limitadas com entrega garantida.</p>
          </div>
          <Link href="/proximos-drops" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Próximos Drops →
          </Link>
        </div>
        <CurrentDrops drops={drops} />
      </section>
      <section className="relative overflow-hidden rounded-premium border border-champagne/40 bg-white p-12 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-[length:400%_100%] bg-[linear-gradient(120deg,_rgba(230,194,0,0.7),_rgba(230,194,0,0.1))] animate-[sheen_5s_ease-in-out_infinite]" aria-hidden />
        <div className="relative z-10 grid gap-12 md:grid-cols-3">
          {highlightPoints.map((item) => (
            <div key={item} className="space-y-2">
              <h3 className="font-display text-xl text-slate-900">{item}</h3>
              <p className="text-sm text-slate-600">
                O DropRoom garante experiências premium com curadoria dedicada e suporte personalizado.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
