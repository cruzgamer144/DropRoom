import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/queries";
import { getMonthKey } from "@/lib/utils";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { profile, reservations, drops } = data;

  if (!profile) {
    redirect("/login");
  }

  const monthKey = getMonthKey();

  return <DashboardView profile={profile} reservations={reservations} drops={drops} monthKey={monthKey} />;
}
