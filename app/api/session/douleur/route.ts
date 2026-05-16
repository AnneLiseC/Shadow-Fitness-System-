import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { todayISO } from '@/lib/utils';

const USER_ID = 'anne-lise';

export async function POST(req: NextRequest) {
  const { exercice, intensite = 3 } = await req.json();
  const today = todayISO();

  await query(
    `INSERT INTO douleurs_historique (user_id, date, exercice, intensite)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT DO NOTHING`,
    [USER_ID, today, exercice, intensite]
  );

  return NextResponse.json({ success: true });
}
