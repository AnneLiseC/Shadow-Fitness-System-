import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { todayISO } from '@/lib/utils';

const USER_ID = 'anne-lise';

export async function POST(req: NextRequest) {
  const { distance_m, duree_secondes } = await req.json();
  const today = todayISO();
  const allure = duree_secondes / (distance_m / 1000);

  await query(
    `INSERT INTO strava_activites (user_id, strava_id, date, distance_m, duree_secondes, allure_moyenne, type_activite)
     VALUES ($1, $2, $3, $4, $5, $6, 'ManualRun')
     ON CONFLICT (strava_id) DO NOTHING`,
    [USER_ID, -Date.now(), today, distance_m, duree_secondes, allure]
  );

  return NextResponse.json({ success: true });
}
