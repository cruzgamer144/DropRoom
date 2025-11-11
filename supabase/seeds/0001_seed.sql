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

insert into public.electronics_products (slug, name, description, image_url, price, status, brand, category, highlight)
values
  ('airpods-pro-gold', 'AirPods Pro Gold Edition', 'Cancelamento de ruído ativo com acabamento champanhe exclusivo.', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad', 279.00, 'available', 'Apple', 'true-wireless', true),
  ('airpods-max-onyx', 'AirPods Max Onyx', 'Som espacial premium com banda acolchoada em couro italiano.', 'https://images.unsplash.com/photo-1603573355603-85d18d2d70aa', 629.00, 'reserve', 'Apple', 'over-ear', true),
  ('beats-luxe', 'Beats Luxe Studio', 'Fones over-ear com assinatura sonora potente e detalhes dourados.', 'https://images.unsplash.com/photo-1511367461989-f85a21fda167', 349.00, 'available', 'Beats', 'over-ear', false),
  ('airpods-lite', 'AirPods Lite', 'Versão minimalista com case em alumínio polido.', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04', 189.00, 'sold_out', 'Apple', 'true-wireless', false)
on conflict (slug) do nothing;
