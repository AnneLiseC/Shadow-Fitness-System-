export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { queryOne, query } from '@/lib/db';
import { getGradeFromXP } from '@/lib/grades';
import { todayISO } from '@/lib/utils';
import DashboardClient from './DashboardClient';

const USER_ID = 'anne-lise';

export default async function DashboardPage() {
  const today = todayISO();

  const profil = await queryOne<{
    prenom: string; grade_actuel: string; xp_total: number;
    streak_actuel: number; streak_record: number; sons_actifs: boolean;
    notifs_repas_actives: boolean; notifs_eau_actives: boolean;
    phase_entrainement: number;
  }>(
    'SELECT * FROM profil_chasseur WHERE user_id = $1',
    [USER_ID]
  );

  if (!profil) {
    redirect('/onboarding');
  }

  const grade = getGradeFromXP(profil.xp_total);

  const joursOff = await query<{ date: string }>(
    'SELECT date FROM jours_repos WHERE (user_id = $1 OR user_id IS NULL)',
    [USER_ID]
  );
  const offDates = joursOff.map(j => j.date);
  const isOff = offDates.includes(today);

  const sessionToday = await queryOne<{ id: string; statut: string; completion_pct: number; xp_gagne: number }>(
    'SELECT * FROM sessions WHERE user_id = $1 AND date = $2 ORDER BY created_at DESC LIMIT 1',
    [USER_ID, today]
  );

  const derniereCourse = await queryOne<{
    date: string; distance_m: number; duree_secondes: number; allure_moyenne: number;
  }>(
    'SELECT * FROM strava_activites WHERE user_id = $1 ORDER BY date DESC LIMIT 1',
    [USER_ID]
  );

  const coursesWeek = await query<{ date: string; distance_m: number }>(
    `SELECT date, distance_m FROM strava_activites
     WHERE user_id = $1 AND date >= date_trunc('week', CURRENT_DATE)
     ORDER BY date DESC`,
    [USER_ID]
  );

  const stravaConnected = await queryOne<{ athlete_id: number }>(
    'SELECT athlete_id FROM strava_tokens WHERE user_id = $1',
    [USER_ID]
  );

  const nutritionToday = await query<{ repas_type: string; statut: string; verres_eau: number }>(
    'SELECT repas_type, statut, verres_eau FROM nutrition_logs WHERE user_id = $1 AND date = $2',
    [USER_ID, today]
  );

  const totalEau = nutritionToday.reduce((sum, n) => sum + (n.verres_eau || 0), 0);

  const queteUrgente = await queryOne<{ id: string; description: string; xp_recompense: number; expire_at: string }>(
    `SELECT * FROM quetes WHERE user_id = $1 AND date = $2 AND type = 'urgente' AND statut = 'en_cours'
     AND expire_at > NOW() LIMIT 1`,
    [USER_ID, today]
  );

  return (
    <DashboardClient
      prenom={profil.prenom}
      grade={grade}
      xp={profil.xp_total}
      streak={profil.streak_actuel}
      streakRecord={profil.streak_record}
      sonsActifs={profil.sons_actifs}
      isOff={isOff}
      sessionToday={sessionToday}
      derniereCourse={derniereCourse}
      coursesWeek={coursesWeek}
      stravaConnected={!!stravaConnected}
      stravaAthleteId={stravaConnected?.athlete_id}
      totalEau={totalEau}
      queteUrgente={queteUrgente}
      phase={profil.phase_entrainement}
    />
  );
}
