import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { query } from '@/lib/db';
import { todayISO } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { repas_type, statut, date } = await req.json();
  const targetDate = date || todayISO();

  await query(
    `INSERT INTO nutrition_logs (user_id, date, repas_type, statut)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, date, repas_type)
     DO UPDATE SET statut = $4`,
    [user.id, targetDate, repas_type, statut]
  );

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || todayISO();

  const logs = await query(
    'SELECT * FROM nutrition_logs WHERE user_id = $1 AND date = $2',
    [user.id, date]
  );

  return NextResponse.json(logs);
}
