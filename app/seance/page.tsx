export const dynamic = 'force-dynamic';
import { stackServerApp } from '@/lib/stack';
import { redirect } from 'next/navigation';
import { queryOne, query } from '@/lib/db';
import { todayISO } from '@/lib/utils';
import SeanceClient from './SeanceClient';

export default async function SeancePage() {
  const user = await stackServerApp.getUser({ or: 'redirect' });
  const today = todayISO();

  const profil = await queryOne<{
    prenom: string; grade_actuel: string; xp_total: number;
    phase_entrainement: number; sons_actifs: boolean;
  }>(
    'SELECT prenom, grade_actuel, xp_total, phase_entrainement, sons_actifs FROM profil_chasseur WHERE user_id = $1',
    [user.id]
  );

  if (!profil) redirect('/onboarding');

  const joursOff = await query<{ date: string }>(
    'SELECT date FROM jours_repos WHERE (user_id = $1 OR user_id IS NULL)',
    [user.id]
  );
  const isOff = joursOff.some(j => j.date === today);

  const progressions = await query<{ type_exercice: string; niveau_actuel: number }>(
    'SELECT type_exercice, niveau_actuel FROM progression_exercice WHERE user_id = $1',
    [user.id]
  );

  const niveaux: Record<string, number> = {};
  for (const p of progressions) {
    niveaux[p.type_exercice] = p.niveau_actuel;
  }

  const douleurs3j = await query<{ exercice: string; count: string }>(
    `SELECT exercice, COUNT(*) as count FROM douleurs_historique
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '3 days'
     GROUP BY exercice`,
    [user.id]
  );

  const alerteDouleur: string[] = douleurs3j
    .filter(d => parseInt(d.count) >= 3)
    .map(d => d.exercice);

  const sessionToday = await queryOne<{ id: string; statut: string; completion_pct: number; xp_gagne: number }>(
    'SELECT * FROM sessions WHERE user_id = $1 AND date = $2 ORDER BY created_at DESC LIMIT 1',
    [user.id, today]
  );

  const stravaToday = await queryOne<{ distance_m: number; duree_secondes: number; allure_moyenne: number }>(
    'SELECT distance_m, duree_secondes, allure_moyenne FROM strava_activites WHERE user_id = $1 AND date = $2',
    [user.id, today]
  );

  return (
    <SeanceClient
      userId={user.id}
      prenom={profil.prenom}
      grade={profil.grade_actuel as any}
      xp={profil.xp_total}
      phase={profil.phase_entrainement}
      sonsActifs={profil.sons_actifs}
      isOff={isOff}
      niveaux={niveaux}
      alerteDouleur={alerteDouleur}
      sessionToday={sessionToday}
      stravaToday={stravaToday}
    />
  );
}
