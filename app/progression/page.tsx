export const dynamic = 'force-dynamic';
import { stackServerApp } from '@/lib/stack';
import { redirect } from 'next/navigation';
import { query, queryOne } from '@/lib/db';
import { getGradeFromXP } from '@/lib/grades';
import ProgressionClient from './ProgressionClient';

export default async function ProgressionPage() {
  const user = await stackServerApp.getUser({ or: 'redirect' });

  const profil = await queryOne<{
    prenom: string; xp_total: number; grade_actuel: string;
    streak_actuel: number; streak_record: number; phase_entrainement: number;
  }>(
    'SELECT prenom, xp_total, grade_actuel, streak_actuel, streak_record, phase_entrainement FROM profil_chasseur WHERE user_id = $1',
    [user.id]
  );

  if (!profil) redirect('/onboarding');

  const grade = getGradeFromXP(profil.xp_total);

  const sessions30j = await query<{
    date: string; completion_pct: number; xp_gagne: number; statut: string;
  }>(
    `SELECT date, completion_pct, xp_gagne, statut FROM sessions
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'
     ORDER BY date ASC`,
    [user.id]
  );

  const coursesAll = await query<{ date: string; distance_m: number; allure_moyenne: number }>(
    `SELECT date, distance_m, allure_moyenne FROM strava_activites
     WHERE user_id = $1 ORDER BY date DESC LIMIT 30`,
    [user.id]
  );

  const douleurs = await query<{ date: string; exercice: string; intensite: number }>(
    `SELECT date, exercice, intensite FROM douleurs_historique
     WHERE user_id = $1 ORDER BY date DESC LIMIT 20`,
    [user.id]
  );

  const progressions = await query<{ type_exercice: string; niveau_actuel: number; date_derniere_progression: string }>(
    'SELECT type_exercice, niveau_actuel, date_derniere_progression FROM progression_exercice WHERE user_id = $1',
    [user.id]
  );

  const stravaToken = await queryOne<{ athlete_id: number }>(
    'SELECT athlete_id FROM strava_tokens WHERE user_id = $1',
    [user.id]
  );

  return (
    <ProgressionClient
      prenom={profil.prenom}
      grade={grade}
      xp={profil.xp_total}
      streak={profil.streak_actuel}
      streakRecord={profil.streak_record}
      phase={profil.phase_entrainement}
      sessions={sessions30j}
      courses={coursesAll}
      douleurs={douleurs}
      progressions={progressions}
      stravaAthleteId={stravaToken?.athlete_id}
    />
  );
}
