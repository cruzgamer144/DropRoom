import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { tryCreateSupabaseServiceRoleClient } from "@/lib/supabase-service-role";
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

const normalizeProfileRecord = (record: any, fallbackMonthKey: string): Profile => ({
  id: record.id,
  email: record.email ?? "",
  full_name: record.full_name ?? null,
  avatar_url: record.avatar_url ?? null,
  role: (record.role as Profile["role"]) ?? "member",
  monthly_limit: parseNumber(record.monthly_limit, 3),
  monthly_count: parseNumber(record.monthly_count, 0),
  month_key: record.month_key ?? fallbackMonthKey,
  electronics_monthly_limit: parseNumber(record.electronics_monthly_limit, 3),
  electronics_monthly_count: parseNumber(record.electronics_monthly_count, 0),
  electronics_month_key: record.electronics_month_key ?? fallbackMonthKey,
  status: (record.status as Profile["status"]) ?? "active",
  created_at: record.created_at ?? new Date().toISOString(),
  has_password: Boolean(record.has_password),
});

const buildProfileFallback = (user: User, monthKey: string): Profile =>
  normalizeProfileRecord(
    {
      id: user.id,
      email: user.email ?? "",
      full_name: user.user_metadata?.full_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      role: "member",
      monthly_limit: 3,
      monthly_count: 0,
      month_key: monthKey,
      electronics_monthly_limit: 3,
      electronics_monthly_count: 0,
      electronics_month_key: monthKey,
      status: "active",
      created_at: user.created_at ?? new Date().toISOString(),
      has_password: user.user_metadata?.has_password ?? false,
    },
    monthKey
  );

const ensureProfileForUser = async (
  supabase: ReturnType<typeof createSupabaseServerClient>,
  user: User,
  monthKey: string
): Promise<Profile> => {
  const fetchProfile = async () => {
    const response = await supabase
      .from("profiles")
      .select(PROFILE_FIELDS)
      .eq("id", user.id)
      .maybeSingle();

    if (response?.data) {
      return normalizeProfileRecord(response.data, monthKey);
    }

    return null;
  };

  let profile = await fetchProfile();

  if (profile) {
    return profile;
  }

  const baseProfilePayload = {
    id: user.id,
    email: user.email ?? "",
    status: "active",
    month_key: monthKey,
    electronics_month_key: monthKey,
  };

  if (user.email) {
    const { error: insertError } = await supabase.from("profiles").upsert(baseProfilePayload);

    if (insertError) {
      const serviceRoleClient = tryCreateSupabaseServiceRoleClient();

      if (serviceRoleClient) {
        await serviceRoleClient
          .from("profiles")
          .upsert(
            {
              ...baseProfilePayload,
              created_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
      }
    }

    profile = await fetchProfile();
  }

  if (profile) {
    return profile;
  }

  return buildProfileFallback(user, monthKey);
};

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

  const monthKey = getMonthKey();

  if (!userData.user) {
    return { profile: null, reservations: [] as Reservation[], drops, monthKey, isAuthenticated: false };
  }

  const [profile, reservations] = await Promise.all([
    ensureProfileForUser(supabase, userData.user, monthKey),
    supabase
      .from("reservations")
      .select("id, user_id, drop_id, size, status, created_at, month_key, drops(name, slug, image_url, price)")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

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
    profile,
    reservations: formattedReservations,
    drops,
    monthKey,
    isAuthenticated: true,
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

  const monthKey = getMonthKey();

  if (!userData.user) {
    return { profile: null, products: [] as ElectronicsProduct[], isAuthenticated: false, monthKey };
  }

  const profile = await ensureProfileForUser(supabase, userData.user, monthKey);

  return {
    profile,
    products: (productsResponse.data ?? []).map((product) => normalizeElectronicsRecord(product)),
    isAuthenticated: true,
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
