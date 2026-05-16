export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { query, queryOne } from '@/lib/db';
import { todayISO } from '@/lib/utils';
import NutritionClient from './NutritionClient';

const USER_ID = 'anne-lise';

export default async function NutritionPage() {
  const today = todayISO();

  const profil = await queryOne<{ prenom: string }>(
    'SELECT prenom FROM profil_chasseur WHERE user_id = $1',
    [USER_ID]
  );

  if (!profil) redirect('/onboarding');

  const recettes = await query<{
    id: string; nom: string; temps_preparation: number;
    calories_approx: number; proteines_approx: number;
    glucides_approx: number; lipides_approx: number;
    ingredients: string; etapes: string; type_repas: string;
  }>(
    'SELECT * FROM recettes ORDER BY type_repas, nom'
  );

  const logsAujourd = await query<{ repas_type: string; statut: string; verres_eau: number }>(
    'SELECT repas_type, statut, verres_eau FROM nutrition_logs WHERE user_id = $1 AND date = $2',
    [USER_ID, today]
  );

  const totalEau = logsAujourd.reduce((s, l) => s + (l.verres_eau || 0), 0);
  const repasAujourd = logsAujourd.reduce((acc, l) => {
    acc[l.repas_type] = l.statut;
    return acc;
  }, {} as Record<string, string>);

  return (
    <NutritionClient
      prenom={profil.prenom}
      recettes={recettes}
      repasStatuts={repasAujourd}
      totalEau={totalEau}
    />
  );
}
