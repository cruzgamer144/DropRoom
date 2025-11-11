import { UpcomingDropGrid } from "@/components/landing/upcoming-drop-grid";
import { getUpcomingDrops } from "@/lib/queries";

export default async function UpcomingDropsPage() {
  const drops = await getUpcomingDrops();

  return (
    <div className="space-y-16 px-6 pb-24 pt-20 sm:px-12">
      <header className="space-y-3">
        <h1 className="font-display text-4xl font-semibold text-slate-900">Próximos Drops</h1>
        <p className="text-sm text-slate-600">Reserva o teu par antes de esgotar. Limite de 3 reservas por mês.</p>
      </header>
      <div className="relative overflow-hidden rounded-premium border border-slate-100 bg-white p-4 shadow-sm">
        <div
          className="absolute inset-x-0 top-0 h-1 bg-[length:250%_100%] bg-[linear-gradient(135deg,_rgba(230,194,0,0.7),_rgba(230,194,0,0.1))] animate-[sheen_8s_linear_infinite]"
          aria-hidden
        />
        <UpcomingDropGrid drops={drops} />
      </div>
    </div>
  );
}
