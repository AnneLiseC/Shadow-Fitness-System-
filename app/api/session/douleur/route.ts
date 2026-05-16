import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { query } from '@/lib/db';
import { todayISO } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { exercice, intensite = 3 } = await req.json();
  const today = todayISO();

  await query(
    `INSERT INTO douleurs_historique (user_id, date, exercice, intensite)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT DO NOTHING`,
    [user.id, today, exercice, intensite]
  );

  return NextResponse.json({ success: true });
}
