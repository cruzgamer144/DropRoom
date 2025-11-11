import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getMonthKey, parseNumber } from "@/lib/utils";
import {
  Drop,
  Invite,
  Profile,
  Reservation,
  ElectronicsProduct,
} from "@/types/database";

const PROFILE_FIELDS =
  "id, email, full_name, avatar_url, role, monthly_limit, monthly_count, month_key, electronics_monthly_limit, electronics_monthly_count, electronics_month_key, status, created_at, has_password";

const normalizeDropRecord = (drop: any): Drop => ({
  ...drop,
  price: parseNumber(drop?.price),
});

const normalizeElectronicsRecord = (product: any): ElectronicsProduct => ({
  ...product,
  price: parseNumber(product?.price),
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

  const fetchProfile = () =>
    supabase
      .from("profiles")
      .select(PROFILE_FIELDS)
      .eq("id", userData.user!.id)
      .maybeSingle();

  const [profile, reservations] = await Promise.all([
    fetchProfile(),
    supabase
      .from("reservations")
      .select("id, user_id, drop_id, size, status, created_at, month_key, drops(name, slug, image_url, price)")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  let profileRecord = (profile.data as Profile | null) ?? null;

  if (!profileRecord && userData.user.email) {
    const monthKeyForInsert = monthKey;
    const { error: insertError } = await supabase.from("profiles").upsert({
      id: userData.user.id,
      email: userData.user.email,
      status: "active",
      month_key: monthKeyForInsert,
      electronics_month_key: monthKeyForInsert,
    });

    if (!insertError) {
      const refreshedProfile = await fetchProfile();
      profileRecord = (refreshedProfile.data as Profile | null) ?? null;
    }
  }

  const formattedReservations: Reservation[] = (reservations.data ?? []).map((reservation) => {
    const relatedDrop = Array.isArray(reservation.drops)
      ? reservation.drops[0]
      : reservation.drops;

    return {
      id: reservation.id,
      user_id: reservation.user_id,
      drop_id: reservation.drop_id,
      size: reservation.size,
      status: reservation.status,
      created_at: reservation.created_at,
      month_key: reservation.month_key,
      drop: relatedDrop
        ? {
            name: relatedDrop.name,
            slug: relatedDrop.slug,
            image_url: relatedDrop.image_url ?? null,
            price: parseNumber(relatedDrop.price),
          }
        : null,
    };
  });

  return {
    profile: profileRecord,
    reservations: formattedReservations,
    drops,
    monthKey,
  };
}

export async function getElectronicsPageData() {
  const supabase = createSupabaseServerClient();
  const [{ data: userData }, productsResponse] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("electronics_products")
      .select(
        "id, slug, name, description, image_url, price, status, brand, category, highlight, created_at"
      )
      .order("highlight", { ascending: false })
      .order("created_at", { ascending: true }),
  ]);

  if (!userData.user) {
    return { profile: null, products: [] as ElectronicsProduct[] };
  }

  const profileResponse = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("id", userData.user.id)
    .maybeSingle();

  let profileRecord = (profileResponse.data as Profile | null) ?? null;

  if (!profileRecord && userData.user.email) {
    const monthKeyForInsert = getMonthKey();
    const { error: insertError } = await supabase.from("profiles").upsert({
      id: userData.user.id,
      email: userData.user.email,
      status: "active",
      month_key: monthKeyForInsert,
      electronics_month_key: monthKeyForInsert,
    });

    if (!insertError) {
      const refreshedProfile = await supabase
        .from("profiles")
        .select(PROFILE_FIELDS)
        .eq("id", userData.user.id)
        .maybeSingle();

      profileRecord = (refreshedProfile.data as Profile | null) ?? null;
    }
  }

  return {
    profile: profileRecord,
    products: (productsResponse.data ?? []).map((product) =>
      normalizeElectronicsRecord(product)
    ),
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
