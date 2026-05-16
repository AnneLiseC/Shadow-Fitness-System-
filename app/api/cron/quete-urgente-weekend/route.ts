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

  const now = nowParis();
  const today = todayISO();
  const hour = now.getHours();
  const dow = now.getDay();

  const isWeekend = dow === 0 || dow === 6;
  if (!isWeekend) return NextResponse.json({ skipped: 'pas weekend' });

  const joursOff = await query<{ date: string }>(
    'SELECT date FROM jours_repos WHERE user_id IS NULL'
  );
  if (joursOff.some(j => j.date === today)) {
    return NextResponse.json({ skipped: 'jour off' });
  }

  const expireAt = new Date(now.getTime() + 2 * 3600 * 1000).toISOString();

  const users = await query<{ user_id: string; prenom: string }>(
    'SELECT user_id, prenom FROM profil_chasseur'
  );

  let created = 0;
  for (const u of users) {
    const existing = await queryOne(
      `SELECT id FROM quetes WHERE user_id = $1 AND date = $2 AND type = 'urgente' AND created_at > NOW() - INTERVAL '2 hours'`,
      [u.user_id, today]
    );
    if (existing) continue;

    await query(
      `INSERT INTO quetes (user_id, date, type, statut, description, xp_recompense, expire_at)
       VALUES ($1, $2, 'urgente', 'en_cours', $3, 200, $4)`,
      [
        u.user_id, today,
        'Quête urgente weekend ! Complète ta séance dans les 2h pour XP x2.',
        expireAt,
      ]
    );

    await sendPushToUser(
      u.user_id,
      '🌀 QUÊTE URGENTE Weekend',
      `${u.prenom}, un donjon weekend ! 2h pour doubler tes XP.`
    );
    created++;
  }

  return NextResponse.json({ success: true, created });
}
