import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/queries";
import { ProgressBar } from "@/components/ui/progress";
import Link from "next/link";
import { ReservationForm } from "@/components/dashboard/reservation-form";
import { getMonthKey } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { profile, reservations, drops } = data;

  if (!profile) {
    redirect("/login");
  }

  const monthKey = getMonthKey();
  const currentCount = profile.month_key === monthKey ? profile.monthly_count : 0;
  const limitReached = currentCount >= profile.monthly_limit;

  const activeReservations = reservations.filter((reservation: any) => reservation.status !== "cancelado");

  return (
    <div className="space-y-12 px-6 pb-24 pt-16 sm:px-12">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-slate-900">Bem-vindo de volta</h1>
        <p className="text-sm text-slate-600">Gere as tuas reservas e acompanha os próximos lançamentos.</p>
      </header>
      <section className="grid gap-8 md:grid-cols-3">
        <div className="rounded-premium border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Limite Mensal</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{currentCount}/{profile.monthly_limit}</p>
          <ProgressBar value={currentCount} max={profile.monthly_limit} />
          {limitReached && (
            <p className="mt-4 text-sm text-red-600">Limite de reservas atingido. Aguarda o próximo mês.</p>
          )}
        </div>
        <div className="rounded-premium border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Estado da conta</p>
          <p className="mt-2 text-xl font-semibold capitalize text-slate-900">{profile.status}</p>
          <p className="text-sm text-slate-600">Reservas renovam no início de cada mês.</p>
        </div>
        <div className="rounded-premium border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Convites exclusivos</p>
          <p className="mt-2 text-sm text-slate-600">Partilha a tua experiência DropRoom com amigos selecionados.</p>
          <Link href="/proximos-drops" className="mt-4 inline-flex text-sm font-semibold text-slate-900">
            Explorar próximos drops →
          </Link>
        </div>
      </section>
      <section className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-premium border border-slate-100 bg-white p-8 shadow-sm">
          <h2 className="font-display text-2xl text-slate-900">Reservas Ativas</h2>
          <div className="mt-6 space-y-4">
            {activeReservations.length ? (
              activeReservations.map((reservation: any) => (
                <div key={reservation.id} className="rounded-premium border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                    <div>
                      <p className="font-semibold text-slate-900">{reservation.drop?.name}</p>
                      <p>Tamanho: {reservation.size}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase">
                      {reservation.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Ainda não tens reservas ativas.</p>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-premium border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl text-slate-900">Próximo Drop</h2>
            {drops.length ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">{drops[0].name}</p>
                <ReservationForm dropId={drops[0].id} sizes={drops[0].sizes} disabled={limitReached} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Em breve anunciaremos novos drops.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
