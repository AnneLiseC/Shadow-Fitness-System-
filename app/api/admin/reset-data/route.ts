import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  try {
    await db.query(`
      DELETE FROM exercice_logs WHERE session_id IN (
        SELECT id FROM sessions WHERE user_id = 'anne-lise'
      )
    `);
    await db.query(`DELETE FROM sessions WHERE user_id = 'anne-lise'`);
    await db.query(`DELETE FROM strava_activites WHERE user_id = 'anne-lise'`);
    await db.query(`DELETE FROM quetes WHERE user_id = 'anne-lise'`);
    await db.query(`
      DELETE FROM recettes
      WHERE id NOT IN (
        SELECT MIN(id) FROM recettes GROUP BY nom
      )
    `);

    return NextResponse.json({
      success: true,
      message: 'Données fictives supprimées. Stats affiche maintenant l\'état vide.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
