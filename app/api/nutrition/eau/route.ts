import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { todayISO } from '@/lib/utils';

const USER_ID = 'anne-lise';

export async function POST(req: NextRequest) {
  const { verres = 1 } = await req.json();
  const today = todayISO();

  await query(
    `INSERT INTO nutrition_logs (user_id, date, repas_type, verres_eau)
     VALUES ($1, $2, 'hydratation', $3)
     ON CONFLICT (user_id, date, repas_type)
     DO UPDATE SET verres_eau = nutrition_logs.verres_eau + $3`,
    [USER_ID, today, verres]
  );

  return NextResponse.json({ success: true });
}

export async function GET(_req: NextRequest) {
  const today = todayISO();
  const result = await query<{ verres_eau: number }>(
    `SELECT COALESCE(SUM(verres_eau), 0) as verres_eau FROM nutrition_logs
     WHERE user_id = $1 AND date = $2`,
    [USER_ID, today]
  );

  return NextResponse.json({ verres: result[0]?.verres_eau || 0 });
}
