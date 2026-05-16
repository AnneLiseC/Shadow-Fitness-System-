import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { todayISO } from '@/lib/utils';

const USER_ID = 'anne-lise';

export async function POST(req: NextRequest) {
  const { repas_type, statut, date } = await req.json();
  const targetDate = date || todayISO();

  await query(
    `INSERT INTO nutrition_logs (user_id, date, repas_type, statut)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, date, repas_type)
     DO UPDATE SET statut = $4`,
    [USER_ID, targetDate, repas_type, statut]
  );

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || todayISO();

  const logs = await query(
    'SELECT * FROM nutrition_logs WHERE user_id = $1 AND date = $2',
    [USER_ID, date]
  );

  return NextResponse.json(logs);
}
