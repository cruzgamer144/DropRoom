import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../lib/get-user-from-token';
import { getSupabaseAdminClient } from '../../lib/supabase-admin';
import { currentMonthKey, startOfCurrentMonth } from '../../lib/month';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  const { dropId, size } = req.body as { dropId?: string; size?: string };
  if (!dropId) {
    return res.status(400).json({ message: 'Drop é obrigatório.' });
  }

  const supabase = getSupabaseAdminClient();

  const {
    data: profile,
    error: profileError
  } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

  if (profileError || !profile) {
    return res.status(400).json({ message: 'Perfil não encontrado.' });
  }

  if (profile.items_this_month >= profile.monthly_limit) {
    return res.status(403).json({ message: 'Limite mensal atingido.' });
  }

  const monthKey = currentMonthKey();

  const { data: drop, error: dropError } = await supabase
    .from('drops')
    .select('*')
    .eq('id', dropId)
    .maybeSingle();

  if (dropError || !drop) {
    return res.status(404).json({ message: 'Drop não encontrado.' });
  }

  if (drop.status === 'upcoming' || drop.status === 'current') {
    const { error: insertError } = await supabase.from('reservations').insert({
      user_id: user.id,
      drop_id: dropId,
      size: size ?? null,
      status: 'reserved',
      month_key: monthKey
    });

    if (insertError) {
      return res.status(500).json({ message: 'Não foi possível criar a reserva.' });
    }

    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ items_this_month: profile.items_this_month + 1 })
      .eq('id', user.id);

    if (updateProfileError) {
      return res.status(500).json({ message: 'Reserva criada, mas houve erro ao atualizar o perfil.' });
    }

    return res.status(201).json({ message: 'Reserva confirmada.' });
  }

  return res.status(400).json({ message: 'Este drop não está disponível para reserva.' });
}
