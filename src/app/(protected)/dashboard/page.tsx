import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/queries";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { profile, reservations, drops, monthKey, isAuthenticated } = data;

  if (!isAuthenticated || !profile) {
    redirect("/login");
  }

  return <DashboardView profile={profile} reservations={reservations} drops={drops} monthKey={monthKey} />;
}
