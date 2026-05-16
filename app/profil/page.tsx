export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { queryOne } from '@/lib/db';
import { getGradeFromXP } from '@/lib/grades';
import ProfilClient from './ProfilClient';

const USER_ID = 'anne-lise';

export default async function ProfilPage() {
  const profil = await queryOne<{
    prenom: string; xp_total: number; grade_actuel: string;
    streak_actuel: number; streak_record: number;
    heure_rappel_quotidien: string; sons_actifs: boolean;
    notifs_repas_actives: boolean; notifs_eau_actives: boolean;
    phase_entrainement: number; created_at: string;
  }>(
    'SELECT * FROM profil_chasseur WHERE user_id = $1',
    [USER_ID]
  );

  if (!profil) redirect('/onboarding');

  const grade = getGradeFromXP(profil.xp_total);

  const stravaToken = await queryOne<{ athlete_id: number }>(
    'SELECT athlete_id FROM strava_tokens WHERE user_id = $1',
    [USER_ID]
  );

  const statsGlobales = await queryOne<{
    total_sessions: string; total_xp: string; jours_actifs: string;
  }>(
    `SELECT
       COUNT(*) as total_sessions,
       COALESCE(SUM(xp_gagne), 0) as total_xp,
       COUNT(DISTINCT date) as jours_actifs
     FROM sessions WHERE user_id = $1 AND statut = 'complete'`,
    [USER_ID]
  );

  return (
    <ProfilClient
      prenom={profil.prenom}
      grade={grade}
      xp={profil.xp_total}
      streak={profil.streak_actuel}
      streakRecord={profil.streak_record}
      heureRappel={profil.heure_rappel_quotidien}
      sonsActifs={profil.sons_actifs}
      notifsRepas={profil.notifs_repas_actives}
      notifsEau={profil.notifs_eau_actives}
      phase={profil.phase_entrainement}
      stravaConnected={!!stravaToken}
      stravaAthleteId={stravaToken?.athlete_id}
      totalSessions={parseInt(statsGlobales?.total_sessions || '0')}
      joursActifs={parseInt(statsGlobales?.jours_actifs || '0')}
      membreDepuis={profil.created_at}
    />
  );
}
