import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdminClient } from '../../lib/supabase-admin';
import { getUserFromRequest } from '../../lib/get-user-from-token';
import { startOfCurrentMonth } from '../../lib/month';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  const { inviteCode } = req.body as { inviteCode?: string };
  if (!inviteCode) {
    return res.status(400).json({ message: 'Código de convite é obrigatório.' });
  }

  const supabase = getSupabaseAdminClient();
  const normalizedCode = inviteCode.trim().toUpperCase();

  const { data: invite, error } = await supabase
    .from('invites')
    .select('*')
    .eq('code', normalizedCode)
    .maybeSingle();

  if (error || !invite) {
    return res.status(400).json({ message: 'Convite inválido.' });
  }

  if (invite.used_by && invite.used_by !== user.id) {
    return res.status(409).json({ message: 'Convite já utilizado.' });
  }

  const now = new Date().toISOString();
  const { error: updateInviteError } = await supabase
    .from('invites')
    .update({ used_by: user.id, used_at: now })
    .eq('code', normalizedCode);

  if (updateInviteError) {
    return res.status(500).json({ message: 'Não foi possível marcar convite como usado.' });
  }

  const { error: upsertProfileError } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      monthly_limit: 3,
      items_this_month: 0,
      limit_refreshed_at: startOfCurrentMonth(),
      updated_at: now,
      created_at: now
    },
    { onConflict: 'id' }
  );

  if (upsertProfileError) {
    return res.status(500).json({ message: 'Não foi possível sincronizar o perfil.' });
  }

  return res.status(200).json({ message: 'Convite validado com sucesso.' });
}
