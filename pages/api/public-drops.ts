import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdminClient } from '../../lib/supabase-admin';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = getSupabaseAdminClient();
    const { data: drops, error } = await supabase
      .from('drops')
      .select('*')
      .in('status', ['current', 'upcoming'])
      .order('drop_date', { ascending: true });

    if (error) {
      throw error;
    }

    const current = drops?.filter((drop) => drop.status === 'current') ?? [];
    const upcoming = drops?.filter((drop) => drop.status === 'upcoming') ?? [];

    return res.status(200).json({ current, upcoming });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Não foi possível carregar os drops.' });
  }
}
