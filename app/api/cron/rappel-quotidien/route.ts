import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendPushToUser } from '@/lib/push';
import { nowParis, todayISO } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = nowParis();
  const today = todayISO();
  const hour = now.getHours();

  const joursOff = await query<{ date: string }>(
    'SELECT date FROM jours_repos WHERE user_id IS NULL'
  );
  if (joursOff.some(j => j.date === today)) {
    return NextResponse.json({ skipped: 'jour off' });
  }

  const users = await query<{
    user_id: string; prenom: string;
    heure_rappel_quotidien: string;
  }>(
    'SELECT user_id, prenom, heure_rappel_quotidien FROM profil_chasseur'
  );

  let sent = 0;
  for (const u of users) {
    const rappelHour = parseInt(u.heure_rappel_quotidien?.split(':')[0] || '19');
    if (rappelHour !== hour) continue;

    const sessionDone = await query(
      `SELECT id FROM sessions WHERE user_id = $1 AND date = $2 AND statut = 'complete'`,
      [u.user_id, today]
    );
    if (sessionDone.length > 0) continue;

    await sendPushToUser(
      u.user_id,
      '⚔ Shadow Fitness System',
      `${u.prenom}, ta quête t'attend. Le Système ne pardonne pas l'inaction.`
    );
    sent++;
  }

  return NextResponse.json({ success: true, sent });
}
