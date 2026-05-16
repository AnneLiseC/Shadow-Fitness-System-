import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { sendPushToUser } from '@/lib/push';
import { nowParis, todayISO } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = todayISO();
  const now = nowParis();
  const hour = now.getHours();

  if (hour < 23) return NextResponse.json({ skipped: 'trop tôt' });

  const joursOff = await query<{ date: string }>(
    'SELECT date FROM jours_repos WHERE user_id IS NULL'
  );
  if (joursOff.some(j => j.date === today)) {
    return NextResponse.json({ skipped: 'jour off' });
  }

  const users = await query<{ user_id: string; prenom: string }>(
    'SELECT user_id, prenom FROM profil_chasseur'
  );

  let warned = 0;
  for (const u of users) {
    const session = await queryOne(
      'SELECT id FROM sessions WHERE user_id = $1 AND date = $2',
      [u.user_id, today]
    );
    if (session) continue;

    await sendPushToUser(
      u.user_id,
      '⚠ Aucune activité',
      `${u.prenom}, aucune séance enregistrée. La punition approche si tu n'agis pas.`
    );
    warned++;
  }

  return NextResponse.json({ success: true, warned });
}
