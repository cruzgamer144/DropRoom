insert into public.invites (code, email)
values
  ('DROP-ELITE-01', 'vip@droproom.club'),
  ('DROP-ELITE-02', null)
on conflict (code) do nothing;

insert into public.drops (slug, name, description, status, price, currency, image_url, drop_date)
values
  (
    'nike-air-max-paragon',
    'Nike Air Max Paragon',
    'Couro italiano, palmilha memory foam e detalhes champagne exclusivos DropRoom.',
    'current',
    320,
    'EUR',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
    current_date
  ),
  (
    'adidas-consortium-aurum',
    'Adidas Consortium Aurum',
    'Silhueta futurista com acabamentos metálicos e edição numerada para membros.',
    'upcoming',
    280,
    'EUR',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1600&q=80',
    current_date + interval '7 days'
  ),
  (
    'nike-elite-shadow',
    'Nike Elite Shadow',
    'Detalhes em camurça premium e tecnologia de amortecimento responsivo.',
    'upcoming',
    295,
    'EUR',
    'https://images.unsplash.com/photo-1616128726324-5c7c57a97dc0?auto=format&fit=crop&w=1600&q=80',
    current_date + interval '14 days'
  )
on conflict (slug) do nothing;
