-- Allow members to create their profile record the first time they sign in
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Profiles self insert'
  ) then
    create policy "Profiles self insert" on public.profiles
      for insert with check (id = auth.uid());
  end if;
end $$;
