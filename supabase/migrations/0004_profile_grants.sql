-- Ensure authenticated users can create and update their own profile records under RLS
begin;

  grant usage on schema public to authenticated;

  grant select, insert, update on table public.profiles to authenticated;

commit;
