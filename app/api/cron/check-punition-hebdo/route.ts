import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendPushToUser } from '@/lib/push';
import { nowParis } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = nowParis();
  const dow = now.getDay();
  if (dow !== 0) return NextResponse.json({ skipped: 'pas dimanche' });

  const users = await query<{
    user_id: string; prenom: string; xp_total: number; streak_actuel: number;
  }>(
    'SELECT user_id, prenom, xp_total, streak_actuel FROM profil_chasseur'
  );

  let punished = 0;
  for (const u of users) {
    const coursesWeek = await query<{ id: string }>(
      `SELECT id FROM strava_activites
       WHERE user_id = $1 AND date >= date_trunc('week', CURRENT_DATE)
       AND date < CURRENT_DATE`,
      [u.user_id]
    );

    if (coursesWeek.length < 6) {
      // Punition
      const newXP = Math.max(0, u.xp_total - 20);
      await query(
        `UPDATE profil_chasseur SET xp_total = $1, streak_actuel = 0 WHERE user_id = $2`,
        [newXP, u.user_id]
      );

      await sendPushToUser(
        u.user_id,
        '⚠ PUNITION HEBDOMADAIRE',
        `${u.prenom}, seulement ${coursesWeek.length}/6 courses cette semaine. -20 XP. Streak brisé.`
      );
      punished++;
    }
  }

  return NextResponse.json({ success: true, punished });
}
