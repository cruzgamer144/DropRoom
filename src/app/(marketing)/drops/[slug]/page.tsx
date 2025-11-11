import { notFound, redirect } from "next/navigation";

import { getDropBySlug, getDashboardData } from "@/lib/queries";
import { DropDetailView } from "@/components/drops/drop-detail-view";

interface DropPageProps {
  params: { slug: string };
}

export default async function DropDetailPage({ params }: DropPageProps) {
  const drop = await getDropBySlug(params.slug);
  if (!drop) {
    notFound();
  }

  const dashboardData = await getDashboardData();
  const { profile, monthKey, isAuthenticated } = dashboardData;

  if (!isAuthenticated || !profile) {
    redirect("/login");
  }

  const currentCount = profile.month_key === monthKey ? profile.monthly_count : 0;
  const limitReached = currentCount >= profile.monthly_limit;

  return <DropDetailView drop={drop} profile={profile} limitReached={limitReached} currentCount={currentCount} />;
}
