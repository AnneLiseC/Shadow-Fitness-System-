import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const USER_ID = 'anne-lise';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json({ error: 'Params from et to requis' }, { status: 400 });
  }

  const rows = await query<{
    date: string;
    completion_pct: number;
    xp_gagne: number;
    statut: string;
  }>(
    `SELECT date::text, completion_pct, xp_gagne, statut
     FROM sessions
     WHERE user_id = $1
       AND date >= $2
       AND date <= $3
     ORDER BY date ASC`,
    [USER_ID, from, to]
  );

  const result: Record<string, { completion_pct: number; xp: number; statut: string }> = {};
  for (const row of rows) {
    result[row.date] = {
      completion_pct: Number(row.completion_pct),
      xp: row.xp_gagne,
      statut: row.statut,
    };
  }

  return NextResponse.json(result);
}
