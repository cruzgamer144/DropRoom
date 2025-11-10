import { createSupabaseServerClient } from "@/lib/supabase-client";
import { getMonthKey, parseNumber } from "@/lib/utils";
import { Drop, Invite, Profile, Reservation } from "@/types/database";

const normalizeDropRecord = (drop: any): Drop => ({
  ...drop,
  price: parseNumber(drop?.price),
});

export async function getActiveDrops() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("drops")
    .select("id, name, slug, description, image_url, price, drop_date, active, sizes")
    .eq("active", true)
    .order("drop_date", { ascending: true });
  return (data ?? []).map((drop) => normalizeDropRecord(drop));
}

export async function getUpcomingDrops() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("drops")
    .select("id, name, slug, description, image_url, price, drop_date, active, sizes")
    .order("drop_date", { ascending: true });
  return (data ?? []).map((drop) => normalizeDropRecord(drop));
}

export async function getDropBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("drops")
    .select("id, name, slug, description, image_url, price, drop_date, active, sizes")
    .eq("slug", slug)
    .maybeSingle();
  return data ? normalizeDropRecord(data) : null;
}

export async function getDashboardData() {
  const supabase = createSupabaseServerClient();
  const [{ data: userData }, drops] = await Promise.all([
    supabase.auth.getUser(),
    getUpcomingDrops(),
  ]);

  if (!userData.user) {
    return { profile: null, reservations: [] as Reservation[], drops };
  }

  const monthKey = getMonthKey();

  const [profile, reservations] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, role, monthly_limit, monthly_count, month_key, status")
      .eq("id", userData.user.id)
      .maybeSingle(),
    supabase
      .from("reservations")
      .select("id, user_id, drop_id, size, status, created_at, month_key, drops(name, slug, image_url, price)")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const formattedReservations = (reservations.data ?? []).map((reservation) => ({
    id: reservation.id,
    user_id: reservation.user_id,
    drop_id: reservation.drop_id,
    size: reservation.size,
    status: reservation.status,
    created_at: reservation.created_at,
    month_key: reservation.month_key,
    drop: reservation.drops
      ? {
          ...reservation.drops,
          price: parseNumber(reservation.drops.price),
        }
      : null,
  }));

  return {
    profile: (profile.data as Profile | null) ?? null,
    reservations: formattedReservations,
    drops,
    monthKey,
  };
}

export async function getAdminData() {
  const supabase = createSupabaseServerClient();
  const [drops, invites, reservations, users] = await Promise.all([
    supabase.from("drops").select("*"),
    supabase.from("invites").select("*"),
    supabase
      .from("reservations")
      .select("*, profiles(email), drops(name)")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("*"),
  ]);

  return {
    drops: (drops.data ?? []).map((drop) => normalizeDropRecord(drop)),
    invites: (invites.data ?? []) as Invite[],
    reservations: reservations.data ?? [],
    users: (users.data ?? []) as Profile[],
  };
}
