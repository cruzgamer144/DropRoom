alter table public.profiles
  add column if not exists has_password boolean not null default false;

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

  insert into public.profiles (id, email, role, month_key, monthly_count, status, has_password)
  values (user_id, email, 'member', month_key, 0, 'active', false)
  on conflict (id) do update set
    email = excluded.email,
    month_key = excluded.month_key,
    monthly_count = case when public.profiles.month_key = excluded.month_key then public.profiles.monthly_count else 0 end,
    electronics_month_key = excluded.month_key,
    electronics_monthly_count = case when public.profiles.electronics_month_key = excluded.month_key then public.profiles.electronics_monthly_count else 0 end,
    status = 'active';
end;
$$;
