import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdminClient } from '../../lib/supabase-admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { email, inviteCode } = req.body as { email?: string; inviteCode?: string };
  if (!email || !inviteCode) {
    return res.status(400).json({ message: 'Email e código de convite são obrigatórios.' });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const normalizedCode = inviteCode.trim().toUpperCase();
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('code', normalizedCode)
      .maybeSingle();

    if (inviteError || !invite) {
      return res.status(400).json({ message: 'Convite inválido ou inexistente.' });
    }

    if (invite.used_at) {
      return res.status(409).json({ message: 'Este convite já foi utilizado.' });
    }

    if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ message: 'Este convite está associado a outro email.' });
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${SITE_URL}/auth/callback?invite=${encodeURIComponent(normalizedCode)}`
      }
    });

    if (otpError) {
      return res.status(500).json({ message: 'Não foi possível enviar o Magic Link.' });
    }

    return res.status(200).json({ message: 'Enviámos o Magic Link. Verifica a tua caixa de entrada.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Ocorreu um erro ao validar o convite.' });
  }
}
