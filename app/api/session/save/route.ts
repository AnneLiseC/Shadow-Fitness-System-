import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { query, queryOne } from '@/lib/db';
import { todayISO } from '@/lib/utils';
import { getGradeFromXP } from '@/lib/grades';

export async function POST(req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { logs } = await req.json();
  const today = todayISO();

  // Calculer complétion
  const exercices = ['poignets', 'pompes', 'abdos', 'squats', 'course'];
  const doneCount = exercices.filter(ex => logs[ex]?.done).length;
  const completionPct = exercices.length > 0
    ? Math.round((doneCount / exercices.length) * 100)
    : 0;

  let xpGagne = 100;

  // XP x2 si quête urgente
  const queteUrgente = await queryOne(
    `SELECT id FROM quetes WHERE user_id = $1 AND date = $2 AND type = 'urgente' AND statut = 'en_cours' AND expire_at > NOW()`,
    [user.id, today]
  );
  if (queteUrgente) xpGagne *= 2;

  // Streak
  const profil = await queryOne<{ xp_total: number; streak_actuel: number; streak_record: number }>(
    'SELECT xp_total, streak_actuel, streak_record FROM profil_chasseur WHERE user_id = $1',
    [user.id]
  );

  const yesterdayISO = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const sessionHier = await queryOne(
    `SELECT id FROM sessions WHERE user_id = $1 AND date = $2 AND statut = 'complete'`,
    [user.id, yesterdayISO]
  );

  const newStreak = sessionHier ? (profil?.streak_actuel || 0) + 1 : 1;
  const newRecord = Math.max(newStreak, profil?.streak_record || 0);

  // Bonus streak 7j
  if (newStreak % 7 === 0) xpGagne += 50;

  const newXP = (profil?.xp_total || 0) + xpGagne;
  const oldGrade = getGradeFromXP(profil?.xp_total || 0);
  const newGrade = getGradeFromXP(newXP);

  // Créer ou mettre à jour la session
  const existingSession = await queryOne<{ id: string }>(
    'SELECT id FROM sessions WHERE user_id = $1 AND date = $2',
    [user.id, today]
  );

  let sessionId: string;
  if (existingSession) {
    sessionId = existingSession.id;
    await query(
      `UPDATE sessions SET completion_pct = $1, xp_gagne = $2, statut = $3 WHERE id = $4`,
      [completionPct, xpGagne, completionPct >= 95 ? 'complete' : 'partiel', sessionId]
    );
  } else {
    const session = await queryOne<{ id: string }>(
      `INSERT INTO sessions (user_id, date, xp_gagne, completion_pct, statut)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [user.id, today, xpGagne, completionPct, completionPct >= 95 ? 'complete' : 'partiel']
    );
    sessionId = session!.id;
  }

  // Logs exercices
  for (const [type, log] of Object.entries(logs) as any[]) {
    if (!log || type === 'course') continue;
    const totalRealise = log.sets?.reduce((s: number, set: any) => s + set.realise, 0) || 0;
    const totalObjectif = log.sets?.reduce((s: number, set: any) => s + set.objectif, 0) || 0;

    await query(
      `INSERT INTO exercice_logs (session_id, type_exercice, reps_objectif, reps_realise, douleur)
       VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, type, totalObjectif, totalRealise, log.douleur || false]
    );
  }

  // Update profil XP + streak + grade
  await query(
    `UPDATE profil_chasseur SET xp_total = $1, streak_actuel = $2, streak_record = $3, grade_actuel = $4
     WHERE user_id = $5`,
    [newXP, newStreak, newRecord, newGrade, user.id]
  );

  // Update quête urgente si active
  if (queteUrgente) {
    await query(
      `UPDATE quetes SET statut = 'complete' WHERE id = $1`,
      [queteUrgente.id]
    );
  }

  // Progression exercice : si 3 séances successives au-dessus objectif, proposer montée
  for (const type of ['pompes', 'abdos', 'squats'] as const) {
    const log = logs[type];
    if (!log?.done || log.douleur) continue;

    const recentLogs = await query<{ reps_realise: number; reps_objectif: number }>(
      `SELECT el.reps_realise, el.reps_objectif FROM exercice_logs el
       JOIN sessions s ON s.id = el.session_id
       WHERE s.user_id = $1 AND el.type_exercice = $2 AND s.statut = 'complete'
       ORDER BY s.date DESC LIMIT 3`,
      [user.id, type]
    );

    if (recentLogs.length === 3 && recentLogs.every(l => l.reps_realise >= l.reps_objectif)) {
      await query(
        `UPDATE progression_exercice SET niveau_actuel = niveau_actuel + 1, date_derniere_progression = CURRENT_DATE
         WHERE user_id = $1 AND type_exercice = $2`,
        [user.id, type]
      );
    }
  }

  return NextResponse.json({
    success: true,
    xp_gagne: xpGagne,
    completion_pct: completionPct,
    level_up: oldGrade !== newGrade,
    new_grade: newGrade,
    new_xp: newXP,
  });
}
