create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role text not null default 'member',
  monthly_limit integer not null default 3,
  monthly_count integer not null default 0,
  month_key text not null default to_char(timezone('utc', now()), 'YYYY-MM'),
  electronics_monthly_limit integer not null default 3,
  electronics_monthly_count integer not null default 0,
  electronics_month_key text not null default to_char(timezone('utc', now()), 'YYYY-MM'),
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  email text,
  created_by uuid references public.profiles (id),
  used_by uuid references public.profiles (id),
  used_at timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.drops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  image_url text not null,
  price numeric(10,2) not null,
  drop_date date not null,
  active boolean not null default true,
  sizes text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  drop_id uuid not null references public.drops (id) on delete cascade,
  size text not null,
  status text not null default 'reservado',
  month_key text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, drop_id, month_key)
);

create index if not exists idx_reservations_user_month on public.reservations (user_id, month_key);
create index if not exists idx_drops_active_date on public.drops (active, drop_date);

create table if not exists public.electronics_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  image_url text not null,
  price numeric(10,2) not null,
  status text not null default 'available',
  brand text,
  category text,
  highlight boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.electronics_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.electronics_products (id) on delete cascade,
  status text not null default 'pending',
  month_key text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_electronics_orders_user_month on public.electronics_orders (user_id, month_key);
create index if not exists idx_electronics_products_status on public.electronics_products (status);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.use_invite_and_sync_profile(
  invite_code text,
  user_id uuid,
  email text,
  month_key text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_record public.invites%rowtype;
begin
  select * into invite_record from public.invites where code = invite_code for update;
  if not found then
    raise exception 'Convite inexistente';
  end if;
  if invite_record.status <> 'active' then
    raise exception 'Convite já utilizado';
  end if;

  update public.invites
    set used_by = user_id,
        used_at = timezone('utc', now()),
        status = 'used'
    where id = invite_record.id;

  insert into public.profiles (id, email, role, month_key, monthly_count, status)
  values (user_id, email, 'member', month_key, 0, 'active')
  on conflict (id) do update set
    email = excluded.email,
    month_key = excluded.month_key,
    monthly_count = case when public.profiles.month_key = excluded.month_key then public.profiles.monthly_count else 0 end,
    electronics_month_key = excluded.month_key,
    electronics_monthly_count = case when public.profiles.electronics_month_key = excluded.month_key then public.profiles.electronics_monthly_count else 0 end,
    status = 'active';
end;
$$;

grant execute on function public.use_invite_and_sync_profile(text, uuid, text, text) to authenticated;

create or replace function public.create_reservation_with_limit(
  p_drop_id uuid,
  p_size text,
  p_month_key text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_record public.profiles%rowtype;
begin
  select * into profile_record from public.profiles where id = auth.uid() for update;
  if not found then
    raise exception 'Perfil inexistente';
  end if;
  if profile_record.status <> 'active' then
    raise exception 'Conta inativa';
  end if;
  if profile_record.month_key = p_month_key then
    if profile_record.monthly_count >= profile_record.monthly_limit then
      raise exception 'Limite mensal atingido';
    end if;
  else
    update public.profiles
      set month_key = p_month_key,
          monthly_count = 0
      where id = profile_record.id;
  end if;

  insert into public.reservations (user_id, drop_id, size, month_key)
  values (profile_record.id, p_drop_id, p_size, p_month_key);

  update public.profiles
    set monthly_count = monthly_count + 1,
        month_key = p_month_key
    where id = profile_record.id;
end;
$$;

create or replace function public.create_electronics_order_with_limit(
  p_product_id uuid,
  p_month_key text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_record public.profiles%rowtype;
begin
  select * into profile_record from public.profiles where id = auth.uid() for update;
  if not found then
    raise exception 'Perfil inexistente';
  end if;
  if profile_record.status <> 'active' then
    raise exception 'Conta inativa';
  end if;
  if profile_record.electronics_month_key = p_month_key then
    if profile_record.electronics_monthly_count >= profile_record.electronics_monthly_limit then
      raise exception 'Limite mensal de eletrónicos atingido';
    end if;
  else
    update public.profiles
      set electronics_month_key = p_month_key,
          electronics_monthly_count = 0
      where id = profile_record.id;
  end if;

  insert into public.electronics_orders (user_id, product_id, month_key)
  values (profile_record.id, p_product_id, p_month_key);

  update public.profiles
    set electronics_monthly_count = electronics_monthly_count + 1,
        electronics_month_key = p_month_key
    where id = profile_record.id;
end;
$$;

create or replace function public.generate_invites(
  p_amount integer,
  p_email text
) returns setof public.invites
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_check boolean;
  counter integer := 0;
  new_invite public.invites%rowtype;
  generated_code text;
begin
  select public.is_admin() into admin_check;
  if not admin_check then
    raise exception 'Apenas administradores podem gerar convites';
  end if;
  if p_amount < 1 or p_amount > 20 then
    raise exception 'Quantidade inválida';
  end if;
  for counter in 1..p_amount loop
    generated_code := upper('DROP-' || substr(replace(uuid_generate_v4()::text, '-', ''), 1, 8));
    insert into public.invites (code, email, created_by, status)
    values (generated_code, coalesce(p_email, null), auth.uid(), 'active')
    returning * into new_invite;
    return next new_invite;
  end loop;
  return;
end;
$$;

alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.drops enable row level security;
alter table public.reservations enable row level security;
alter table public.electronics_products enable row level security;
alter table public.electronics_orders enable row level security;

create policy "Profiles self access" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "Profiles self update" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "Profiles admin update" on public.profiles
  for update using (public.is_admin())
  with check (public.is_admin());

create policy "Invites public read" on public.invites
  for select using (true);

create policy "Invites admin manage" on public.invites
  for all using (public.is_admin())
  with check (public.is_admin());

create policy "Drops public read" on public.drops
  for select using (true);

create policy "Drops admin manage" on public.drops
  for all using (public.is_admin())
  with check (public.is_admin());

create policy "Reservations user read" on public.reservations
  for select using (user_id = auth.uid() or public.is_admin());

create policy "Reservations admin update" on public.reservations
  for update using (public.is_admin())
  with check (public.is_admin());

create policy "Reservations admin insert" on public.reservations
  for insert with check (public.is_admin());

create policy "Reservations admin delete" on public.reservations
  for delete using (public.is_admin());

create policy "Electronics products public read" on public.electronics_products
  for select using (true);

create policy "Electronics products admin manage" on public.electronics_products
  for all using (public.is_admin())
  with check (public.is_admin());

create policy "Electronics orders user read" on public.electronics_orders
  for select using (user_id = auth.uid() or public.is_admin());

create policy "Electronics orders admin manage" on public.electronics_orders
  for all using (public.is_admin())
  with check (public.is_admin());
