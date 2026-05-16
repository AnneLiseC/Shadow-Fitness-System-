import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendPushToUser } from '@/lib/push';
import { nowParis, todayISO } from '@/lib/utils';

export const runtime = 'nodejs';

const EAU_HOURS = [8, 10, 14, 16, 18, 20, 22];

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = nowParis();
  const today = todayISO();
  const hour = now.getHours();

  if (!EAU_HOURS.includes(hour)) {
    return NextResponse.json({ skipped: 'heure non planifiée' });
  }

  const joursOff = await query<{ date: string }>(
    'SELECT date FROM jours_repos WHERE user_id IS NULL'
  );
  if (joursOff.some(j => j.date === today)) {
    return NextResponse.json({ skipped: 'jour off' });
  }

  const users = await query<{ user_id: string; prenom: string; notifs_eau_actives: boolean }>(
    'SELECT user_id, prenom, notifs_eau_actives FROM profil_chasseur WHERE notifs_eau_actives = true'
  );

  let sent = 0;
  for (const u of users) {
    await sendPushToUser(
      u.user_id,
      '💧 Hydratation',
      `${u.prenom}, hydratation insuffisante détectée. Bois maintenant.`
    );
    sent++;
  }

  return NextResponse.json({ success: true, sent });
}
