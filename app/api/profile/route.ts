import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

const USER_ID = 'anne-lise';

export async function POST(req: NextRequest) {
  const { prenom } = await req.json();

  await query(
    `INSERT INTO profil_chasseur (user_id, prenom)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET prenom = $2`,
    [USER_ID, prenom || 'Anne-Lise']
  );

  const exercices = ['pompes', 'abdos', 'squats', 'poignets'];
  for (const ex of exercices) {
    await query(
      `INSERT INTO progression_exercice (user_id, type_exercice, niveau_actuel)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, type_exercice) DO NOTHING`,
      [USER_ID, ex]
    );
  }

  return NextResponse.json({ success: true });
}

export async function GET(_req: NextRequest) {
  const profil = await queryOne(
    'SELECT * FROM profil_chasseur WHERE user_id = $1',
    [USER_ID]
  );

  if (!profil) return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });

  return NextResponse.json(profil);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed = ['prenom', 'sons_actifs', 'notifs_repas_actives', 'notifs_eau_actives', 'heure_rappel_quotidien'];
  for (const key of allowed) {
    if (key in body) {
      fields.push(`${key} = $${idx++}`);
      values.push(body[key]);
    }
  }

  if (fields.length === 0) return NextResponse.json({ error: 'Rien à mettre à jour' });

  values.push(USER_ID);
  await query(
    `UPDATE profil_chasseur SET ${fields.join(', ')} WHERE user_id = $${idx}`,
    values
  );

  return NextResponse.json({ success: true });
}
