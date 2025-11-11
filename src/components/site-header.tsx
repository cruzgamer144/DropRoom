import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { UserMenu } from "@/components/header/user-menu";

export async function SiteHeader() {
  const supabase = createSupabaseServerClient();

  const [{ data: authData }, upcomingDrops] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("drops")
      .select("id, name, drop_date")
      .eq("active", true)
      .gte("drop_date", new Date().toISOString())
      .order("drop_date", { ascending: true })
      .limit(1),
  ]);

  const user = authData.user;

  const profile = user
    ? await supabase
        .from("profiles")
        .select("full_name, avatar_url, email")
        .eq("id", user.id)
        .maybeSingle()
        .then((result) => result.data ?? null)
    : null;

  const nextDrop = upcomingDrops.data?.[0] ?? null;
  const hasNewDrop = Boolean(nextDrop);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-[var(--header-height)] w-full max-w-6xl items-center justify-between px-6 sm:px-12">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-slate-900 transition hover:text-black"
        >
          DropRoom
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          {hasNewDrop ? (
            <Link
              href="/proximos-drops"
              className="inline-flex rounded-full border border-champagne/60 bg-champagne/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-800 transition hover:border-champagne hover:bg-champagne/25"
            >
              Novo Drop · {new Date(nextDrop.drop_date).toLocaleDateString("pt-PT")}
            </Link>
          ) : null}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center gap-2 rounded-premium border border-champagne/60 bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium"
              >
                <span className="relative z-10">Dashboard</span>
                <span
                  className="pointer-events-none absolute inset-0 rounded-premium bg-sheen bg-[length:250%_250%] opacity-0 transition duration-500 group-hover:opacity-100 group-hover:animate-sheen"
                  aria-hidden
                />
              </Link>
              <UserMenu email={profile?.email ?? user.email ?? ""} name={profile?.full_name} avatarUrl={profile?.avatar_url} />
            </>
          ) : (
            <Link
              href="/login"
              className="relative inline-flex items-center gap-2 rounded-premium border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-champagne hover:text-slate-900"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
