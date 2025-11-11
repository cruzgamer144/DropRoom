insert into public.drops (id, slug, name, description, image_url, price, drop_date, active, sizes)
values
  (uuid_generate_v4(), 'aurum-elite', 'Aurum Elite', 'Sneaker premium com detalhes em ouro champanhe para colecionadores exigentes.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 329.00, current_date + interval '7 days', true, array['EU 40', 'EU 41', 'EU 42', 'EU 43']),
  (uuid_generate_v4(), 'noir-mirage', 'Noir Mirage', 'Edição limitada com cabedal em pele italiana e acabamento matte.', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b', 289.00, current_date + interval '14 days', true, array['EU 40', 'EU 41', 'EU 42']),
  (uuid_generate_v4(), 'crystal-volt', 'Crystal Volt', 'Design translúcido com toques elétricos e amortecimento responsivo.', 'https://images.unsplash.com/photo-1549298916-b41d501d3772', 349.00, current_date + interval '30 days', false, array['EU 39', 'EU 40', 'EU 41', 'EU 42']);

insert into public.invites (code, email, status)
values
  ('DROP-GOLD01', 'vip@droproom.com', 'active'),
  ('DROP-GOLD02', null, 'active')
on conflict (code) do nothing;
