import Image from "next/image";
import { notFound } from "next/navigation";
import { getDropBySlug, getDashboardData } from "@/lib/queries";
import { ReservationForm } from "@/components/dashboard/reservation-form";
import { formatPrice, getMonthKey } from "@/lib/utils";

interface DropPageProps {
  params: { slug: string };
}

export default async function DropDetailPage({ params }: DropPageProps) {
  const drop = await getDropBySlug(params.slug);
  if (!drop) {
    notFound();
  }

  const dashboardData = await getDashboardData();
  const { profile } = dashboardData;
  const monthKey = getMonthKey();
  const currentCount = profile?.month_key === monthKey ? profile.monthly_count : 0;
  const limitReached = currentCount >= (profile?.monthly_limit ?? 3);

  return (
    <div className="grid gap-12 px-6 pb-24 pt-20 sm:px-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative overflow-hidden rounded-premium border border-slate-100 bg-white shadow-sm">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={drop.image_url}
            alt={`Imagem do drop ${drop.name}`}
            fill
            className="object-cover transition duration-700 hover:scale-[1.02]"
            priority
          />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition hover:opacity-100" aria-hidden>
            <div className="absolute inset-0 bg-sheen bg-[length:220%_220%] mix-blend-screen" />
          </div>
        </div>
      </div>
      <aside className="space-y-6 rounded-premium border border-slate-100 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold text-slate-900">{drop.name}</h1>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Drop exclusivo DropRoom</p>
        </div>
        <p className="text-base text-slate-600">{drop.description}</p>
        <div className="space-y-1 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-900">Preço:</span> {formatPrice(drop.price)}
          </p>
          <p><span className="font-medium text-slate-900">Data:</span> {new Date(drop.drop_date).toLocaleDateString("pt-PT")}</p>
          <p><span className="font-medium text-slate-900">Tamanhos:</span> {drop.sizes.join(", ")}</p>
        </div>
        <div className="rounded-premium border border-champagne/50 bg-champagne/10 p-4 text-sm text-slate-700">
          <p>
            Limite mensal: <span className="font-semibold text-slate-900">{currentCount}/
            {profile?.monthly_limit ?? 3}</span>
          </p>
          <p>Reservas renovam a cada mês.</p>
        </div>
        <ReservationForm dropId={drop.id} sizes={drop.sizes} disabled={limitReached} />
      </aside>
    </div>
  );
}
