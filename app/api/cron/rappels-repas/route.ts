import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendPushToUser } from '@/lib/push';
import { nowParis, todayISO } from '@/lib/utils';

export const runtime = 'nodejs';

const REPAS_SCHEDULE: Record<number, { type: string; label: string }> = {
  7: { type: 'petit_dejeuner', label: 'Petit-déjeuner' },
  12: { type: 'dejeuner', label: 'Déjeuner' },
  18: { type: 'collation', label: 'Collation pré-entraînement' },
  20: { type: 'diner', label: 'Dîner post-entraînement' },
};

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = nowParis();
  const today = todayISO();
  const hour = now.getHours();

  const repas = REPAS_SCHEDULE[hour];
  if (!repas) return NextResponse.json({ skipped: 'heure non planifiée' });

  const joursOff = await query<{ date: string }>(
    'SELECT date FROM jours_repos WHERE user_id IS NULL'
  );
  if (joursOff.some(j => j.date === today)) {
    return NextResponse.json({ skipped: 'jour off' });
  }

  const users = await query<{ user_id: string; prenom: string; notifs_repas_actives: boolean }>(
    'SELECT user_id, prenom, notifs_repas_actives FROM profil_chasseur WHERE notifs_repas_actives = true'
  );

  let sent = 0;
  for (const u of users) {
    await sendPushToUser(
      u.user_id,
      '🍱 Le Système ordonne',
      `⚡ ${u.prenom}, ravitaille-toi. ${repas.label} maintenant.`
    );
    sent++;
  }

  return NextResponse.json({ success: true, sent, repas: repas.type });
}
