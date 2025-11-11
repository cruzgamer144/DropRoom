import { redirect } from "next/navigation";

import { ElectronicsPageView } from "@/components/electronics/electronics-page";
import { getElectronicsPageData } from "@/lib/queries";
import { getMonthKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ElectronicsPage() {
  const { profile, products } = await getElectronicsPageData();

  if (!profile) {
    redirect("/login");
  }

  const monthKey = getMonthKey();

  return <ElectronicsPageView profile={profile} products={products} monthKey={monthKey} />;
}
