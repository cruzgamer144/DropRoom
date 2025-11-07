import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../lib/get-user-from-token';
import { getSupabaseAdminClient } from '../../lib/supabase-admin';
import { isBeforeCurrentMonth, startOfCurrentMonth } from '../../lib/month';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  const supabase = getSupabaseAdminClient();
  const {
    data: profile,
    error: profileError
  } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

  if (profileError) {
    return res.status(500).json({ message: 'Erro ao carregar perfil.' });
  }

  if (!profile) {
    return res.status(404).json({ message: 'Perfil não encontrado.' });
  }

  let itemsThisMonth = profile.items_this_month ?? 0;
  const limitRefreshedAt = profile.limit_refreshed_at as string | null;

  if (isBeforeCurrentMonth(limitRefreshedAt)) {
    const startMonth = startOfCurrentMonth();
    await supabase
      .from('profiles')
      .update({ items_this_month: 0, limit_refreshed_at: startMonth })
      .eq('id', user.id);
    itemsThisMonth = 0;
  }

  const { data: reservations } = await supabase
    .from('reservations')
    .select('id, status, size, created_at, drops ( id, name, slug, description, image_url, price, currency, drop_date, status )')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: upcomingDrops } = await supabase
    .from('drops')
    .select('*')
    .in('status', ['current', 'upcoming'])
    .order('drop_date', { ascending: true });

  return res.status(200).json({
    profile: { ...profile, items_this_month: itemsThisMonth },
    reservations: reservations ?? [],
    drops: upcomingDrops ?? []
  });
}
