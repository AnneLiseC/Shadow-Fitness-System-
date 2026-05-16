export interface ExerciceLevel {
  niveau: number;
  label: string;
  reps_objectif?: number;
  sets: number;
  description: string;
}

export const PROGRESSION_POMPES: ExerciceLevel[] = [
  { niveau: 1, label: 'Mur', sets: 3, reps_objectif: 5, description: 'Pompes contre le mur, bras à hauteur d\'épaule' },
  { niveau: 2, label: 'Mur', sets: 3, reps_objectif: 10, description: 'Pompes contre le mur, bras à hauteur d\'épaule' },
  { niveau: 3, label: 'Mur', sets: 3, reps_objectif: 15, description: 'Pompes contre le mur, bras à hauteur d\'épaule' },
  { niveau: 4, label: 'Incliné table haute', sets: 3, reps_objectif: 8, description: 'Mains sur une table haute (comptoir)' },
  { niveau: 5, label: 'Incliné table haute', sets: 3, reps_objectif: 12, description: 'Mains sur une table haute (comptoir)' },
  { niveau: 6, label: 'Incliné table basse', sets: 3, reps_objectif: 8, description: 'Mains sur une table basse ou une chaise' },
  { niveau: 7, label: 'Incliné table basse', sets: 3, reps_objectif: 12, description: 'Mains sur une table basse ou une chaise' },
  { niveau: 8, label: 'Sur les genoux', sets: 3, reps_objectif: 8, description: 'Pompes sur les genoux, dos droit' },
  { niveau: 9, label: 'Sur les genoux', sets: 3, reps_objectif: 15, description: 'Pompes sur les genoux, dos droit' },
  { niveau: 10, label: 'Sur les genoux', sets: 3, reps_objectif: 20, description: 'Pompes sur les genoux, dos droit' },
  { niveau: 11, label: 'Standard', sets: 3, reps_objectif: 5, description: 'Pompes standard sur orteils' },
  { niveau: 12, label: 'Standard', sets: 3, reps_objectif: 10, description: 'Pompes standard sur orteils' },
  { niveau: 13, label: 'Standard', sets: 3, reps_objectif: 20, description: 'Pompes standard sur orteils' },
  { niveau: 14, label: 'Standard', sets: 3, reps_objectif: 30, description: 'Pompes standard sur orteils' },
  { niveau: 15, label: 'Standard', sets: 4, reps_objectif: 25, description: 'Pompes standard sur orteils' },
  { niveau: 16, label: 'Standard', sets: 5, reps_objectif: 20, description: 'Objectif : 100 pompes total' },
];

export const PROGRESSION_ABDOS: ExerciceLevel[] = [
  { niveau: 1, label: 'Relevés de tête', sets: 3, reps_objectif: 10, description: 'Allongée, lever uniquement la tête' },
  { niveau: 2, label: 'Crunchs', sets: 3, reps_objectif: 10, description: 'Lever épaules et tête, bas du dos au sol' },
  { niveau: 3, label: 'Crunchs', sets: 3, reps_objectif: 20, description: 'Lever épaules et tête, bas du dos au sol' },
  { niveau: 4, label: 'Crunchs complets', sets: 3, reps_objectif: 15, description: 'Monter jusqu\'aux genoux, contrôle complet' },
  { niveau: 5, label: 'Crunchs complets', sets: 3, reps_objectif: 25, description: 'Monter jusqu\'aux genoux, contrôle complet' },
  { niveau: 6, label: 'Jambes tendues', sets: 3, reps_objectif: 10, description: 'Crunchs avec jambes tendues à 45°' },
  { niveau: 7, label: 'Jambes tendues', sets: 3, reps_objectif: 20, description: 'Crunchs avec jambes tendues à 45°' },
  { niveau: 8, label: 'Série complète', sets: 4, reps_objectif: 25, description: 'Objectif : 100 abdos total' },
];

export const PROGRESSION_SQUATS: ExerciceLevel[] = [
  { niveau: 1, label: 'Squats lents', sets: 3, reps_objectif: 10, description: 'Squats lents et contrôlés, pieds largeur épaules' },
  { niveau: 2, label: 'Squats lents', sets: 3, reps_objectif: 20, description: 'Squats lents et contrôlés, pieds largeur épaules' },
  { niveau: 3, label: 'Squats rythmés', sets: 3, reps_objectif: 25, description: 'Squats à rythme modéré' },
  { niveau: 4, label: 'Squats rythmés', sets: 4, reps_objectif: 25, description: 'Squats à rythme modéré' },
  { niveau: 5, label: 'Série complète', sets: 5, reps_objectif: 20, description: 'Objectif : 100 squats total' },
];

export const RENFORCEMENT_POIGNETS: ExerciceLevel[] = [
  { niveau: 1, label: 'Rotations', sets: 2, reps_objectif: 15, description: 'Rotations lentes des poignets dans les deux sens' },
  { niveau: 2, label: 'Flexions/extensions', sets: 2, reps_objectif: 15, description: 'Flexions et extensions douces sans charge' },
  { niveau: 3, label: 'Appui poings', sets: 2, reps_objectif: 10, description: 'Appui sur les poings fermés, charge progressive' },
];

export function getPompesLevel(niveau: number): ExerciceLevel {
  return PROGRESSION_POMPES[Math.min(niveau - 1, PROGRESSION_POMPES.length - 1)];
}

export function getAbdosLevel(niveau: number): ExerciceLevel {
  return PROGRESSION_ABDOS[Math.min(niveau - 1, PROGRESSION_ABDOS.length - 1)];
}

export function getSquatsLevel(niveau: number): ExerciceLevel {
  return PROGRESSION_SQUATS[Math.min(niveau - 1, PROGRESSION_SQUATS.length - 1)];
}

export function getPoignetsLevel(niveau: number): ExerciceLevel {
  return RENFORCEMENT_POIGNETS[Math.min(niveau - 1, RENFORCEMENT_POIGNETS.length - 1)];
}

export function calculateRunDistance(semaine: number, phase: number): number {
  const base = 3;
  const increment = Math.floor((semaine - 1) / 2);
  const distance = base + increment;
  if (phase >= 3) return Math.min(distance, 10);
  if (phase === 2) return Math.min(distance, 8);
  return Math.min(distance, 6);
}

export function shouldProgressExercice(
  recentSessions: Array<{ reps_realise: number; reps_objectif: number }>,
  niveau: number
): boolean {
  if (recentSessions.length < 3) return false;
  const last3 = recentSessions.slice(-3);
  return last3.every(s => s.reps_realise >= s.reps_objectif);
}
