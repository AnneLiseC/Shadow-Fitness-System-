export const dynamic = 'force-dynamic';
import { stackServerApp } from '@/lib/stack';
import { redirect } from 'next/navigation';
import { queryOne, query } from '@/lib/db';
import { getGradeFromXP, GRADE_TITLES } from '@/lib/grades';
import ProfilClient from './ProfilClient';

export default async function ProfilPage() {
  const user = await stackServerApp.getUser({ or: 'redirect' });

  const profil = await queryOne<{
    prenom: string; xp_total: number; grade_actuel: string;
    streak_actuel: number; streak_record: number;
    heure_rappel_quotidien: string; sons_actifs: boolean;
    notifs_repas_actives: boolean; notifs_eau_actives: boolean;
    phase_entrainement: number; created_at: string;
  }>(
    'SELECT * FROM profil_chasseur WHERE user_id = $1',
    [user.id]
  );

  if (!profil) redirect('/onboarding');

  const grade = getGradeFromXP(profil.xp_total);

  const stravaToken = await queryOne<{ athlete_id: number }>(
    'SELECT athlete_id FROM strava_tokens WHERE user_id = $1',
    [user.id]
  );

  const statsGlobales = await queryOne<{
    total_sessions: string; total_xp: string; jours_actifs: string;
  }>(
    `SELECT
       COUNT(*) as total_sessions,
       COALESCE(SUM(xp_gagne), 0) as total_xp,
       COUNT(DISTINCT date) as jours_actifs
     FROM sessions WHERE user_id = $1 AND statut = 'complete'`,
    [user.id]
  );

  return (
    <ProfilClient
      prenom={profil.prenom}
      email={user.primaryEmail || ''}
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
