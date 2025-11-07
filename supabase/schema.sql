-- DropRoom schema
create extension if not exists "uuid-ossp";

create table if not exists public.invites (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  email text,
  used_by uuid references auth.users (id),
  used_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  monthly_limit integer not null default 3,
  items_this_month integer not null default 0,
  limit_refreshed_at timestamptz not null default date_trunc('month', timezone('utc', now())),
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.drops (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  status text not null check (status in ('current', 'upcoming', 'archived')),
  price numeric(10,2) not null,
  currency text not null default 'EUR',
  image_url text not null,
  drop_date date,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.reservations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  drop_id uuid not null references public.drops (id) on delete cascade,
  size text,
  status text not null default 'reserved',
  month_key date not null default date_trunc('month', timezone('utc', now())),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_reservations_user_month on public.reservations (user_id, month_key);
create index if not exists idx_drops_status on public.drops (status);

alter table public.invites enable row level security;
alter table public.profiles enable row level security;
alter table public.drops enable row level security;
alter table public.reservations enable row level security;

-- Invites: leitura pública para validação, escrita apenas via serviço
create policy "Public invite lookup" on public.invites for select using (true);
create policy "Only service role can update invites" on public.invites for update using (auth.jwt() ->> 'role' = 'service_role');

-- Profiles: utilizador apenas lê/atualiza o seu registo
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Service role manages profiles" on public.profiles for all using (auth.jwt() ->> 'role' = 'service_role');

-- Drops: leitura pública
create policy "Public drops" on public.drops for select using (true);
create policy "Service manages drops" on public.drops for all using (auth.jwt() ->> 'role' = 'service_role');

-- Reservations: utilizador vê e insere as suas reservas
create policy "Users manage own reservations" on public.reservations for all using (auth.uid() = user_id);
create policy "Service manages reservations" on public.reservations for all using (auth.jwt() ->> 'role' = 'service_role');

-- Trigger to update profile updated_at
create or replace function public.touch_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated
before update on public.profiles
for each row execute function public.touch_profiles_updated_at();

-- Helper function to enforce monthly limit at database level (optional)
create or replace function public.check_reservation_limit()
returns trigger as $$
declare
  limit_value integer;
  total_count integer;
  current_month_key date;
begin
  select monthly_limit into limit_value from public.profiles where id = new.user_id;
  if limit_value is null then
    return new;
  end if;
  current_month_key := date_trunc('month', timezone('utc', now()));
  select count(*)
    into total_count
    from public.reservations
   where user_id = new.user_id
     and month_key = current_month_key;
  if total_count >= limit_value then
    raise exception 'Monthly limit reached';
  end if;
  new.month_key = current_month_key;
  return new;
end;
$$ language plpgsql;

create trigger trg_reservations_limit
before insert on public.reservations
for each row execute function public.check_reservation_limit();
