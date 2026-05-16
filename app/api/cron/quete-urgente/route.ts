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

  // Quêtes urgentes en semaine 18h-20h (UTC = 17h-19h)
  const dow = now.getDay();
  const isWeekday = dow >= 1 && dow <= 5;
  const isValidHour = hour >= 18 && hour <= 20;

  if (!isWeekday || !isValidHour) {
    return NextResponse.json({ skipped: 'hors plage' });
  }

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
      `SELECT id FROM quetes WHERE user_id = $1 AND date = $2 AND type = 'urgente'`,
      [u.user_id, today]
    );
    if (existing) continue;

    await query(
      `INSERT INTO quetes (user_id, date, type, statut, description, xp_recompense, expire_at)
       VALUES ($1, $2, 'urgente', 'en_cours', $3, 200, $4)`,
      [
        u.user_id, today,
        'Un donjon d\'urgence est apparu ! Complète ta séance dans les 2 prochaines heures pour doubler tes XP.',
        expireAt,
      ]
    );

    await sendPushToUser(
      u.user_id,
      '🌀 QUÊTE URGENTE',
      `${u.prenom}, un donjon est apparu ! 2h pour doubler tes XP. Le Système attend.`
    );
    created++;
  }

  return NextResponse.json({ success: true, created });
}
