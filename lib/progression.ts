export interface ExerciceLevel {
  niveau: number;
  label: string;
  reps_objectif?: number;
  sets: number;
  description: string;
}

export interface CourseLevel {
  niveau: number;
  distance: number;
  label: string;
}

export const PROGRESSION_POMPES: ExerciceLevel[] = [
  { niveau: 1, label: 'Mur 3×5', sets: 3, reps_objectif: 5, description: 'Pompes contre le mur, bras à hauteur d\'épaule' },
  { niveau: 2, label: 'Mur 3×10', sets: 3, reps_objectif: 10, description: 'Pompes contre le mur, bras à hauteur d\'épaule' },
  { niveau: 3, label: 'Incliné haut 3×8', sets: 3, reps_objectif: 8, description: 'Mains sur une table haute (comptoir)' },
  { niveau: 4, label: 'Incliné bas 3×8', sets: 3, reps_objectif: 8, description: 'Mains sur une table basse ou une chaise' },
  { niveau: 5, label: 'Genoux 3×8', sets: 3, reps_objectif: 8, description: 'Pompes sur les genoux, dos droit' },
  { niveau: 6, label: 'Genoux 3×15', sets: 3, reps_objectif: 15, description: 'Pompes sur les genoux, dos droit' },
  { niveau: 7, label: 'Standard 3×5', sets: 3, reps_objectif: 5, description: 'Pompes standard sur orteils' },
  { niveau: 8, label: 'Standard 3×10', sets: 3, reps_objectif: 10, description: 'Pompes standard sur orteils' },
  { niveau: 9, label: 'Standard 3×15', sets: 3, reps_objectif: 15, description: 'Pompes standard sur orteils' },
  { niveau: 10, label: 'Standard 3×20', sets: 3, reps_objectif: 20, description: 'Pompes standard sur orteils' },
  { niveau: 11, label: 'Standard 4×20', sets: 4, reps_objectif: 20, description: 'Pompes standard sur orteils' },
  { niveau: 12, label: 'Standard 4×25', sets: 4, reps_objectif: 25, description: 'Objectif : 100 pompes total' },
];

export const PROGRESSION_ABDOS: ExerciceLevel[] = [
  { niveau: 1, label: 'Relevés tête 3×10', sets: 3, reps_objectif: 10, description: 'Allongée, lever uniquement la tête' },
  { niveau: 2, label: 'Crunchs 3×15', sets: 3, reps_objectif: 15, description: 'Lever épaules et tête, bas du dos au sol' },
  { niveau: 3, label: 'Crunchs complets 3×15', sets: 3, reps_objectif: 15, description: 'Monter jusqu\'aux genoux, contrôle complet' },
  { niveau: 4, label: 'Jambes tendues 3×10', sets: 3, reps_objectif: 10, description: 'Crunchs avec jambes tendues à 45°' },
  { niveau: 5, label: 'Jambes tendues 3×15', sets: 3, reps_objectif: 15, description: 'Crunchs avec jambes tendues à 45°' },
  { niveau: 6, label: 'Jambes tendues 4×15', sets: 4, reps_objectif: 15, description: 'Crunchs avec jambes tendues à 45°' },
  { niveau: 7, label: 'Abdos complets 3×20', sets: 3, reps_objectif: 20, description: 'Série complète, contrôle total' },
  { niveau: 8, label: 'Abdos complets 4×25', sets: 4, reps_objectif: 25, description: 'Objectif : 100 abdos total' },
];

export const PROGRESSION_SQUATS: ExerciceLevel[] = [
  { niveau: 1, label: 'Squats lents 3×10', sets: 3, reps_objectif: 10, description: 'Squats lents et contrôlés, pieds largeur épaules' },
  { niveau: 2, label: 'Squats 3×15', sets: 3, reps_objectif: 15, description: 'Squats à rythme modéré' },
  { niveau: 3, label: 'Squats 3×20', sets: 3, reps_objectif: 20, description: 'Squats à rythme modéré' },
  { niveau: 4, label: 'Squats 4×20', sets: 4, reps_objectif: 20, description: 'Squats à rythme modéré' },
  { niveau: 5, label: 'Squats 4×25', sets: 4, reps_objectif: 25, description: 'Objectif : 100 squats total' },
];

export const RENFORCEMENT_POIGNETS: ExerciceLevel[] = [
  { niveau: 1, label: 'Rotations & flexions 2×15', sets: 2, reps_objectif: 15, description: 'Rotations lentes et flexions douces des poignets' },
  { niveau: 2, label: 'Rotations & flexions 3×15', sets: 3, reps_objectif: 15, description: 'Rotations et flexions/extensions sans charge' },
  { niveau: 3, label: 'Appui poings 2×10', sets: 2, reps_objectif: 10, description: 'Appui sur les poings fermés, charge progressive' },
];

export const PROGRESSION_COURSE: CourseLevel[] = [
  { niveau: 1, distance: 3, label: '3km à 7:20/km' },
  { niveau: 2, distance: 4, label: '4km' },
  { niveau: 3, distance: 5, label: '5km' },
  { niveau: 4, distance: 6, label: '6km' },
  { niveau: 5, distance: 7, label: '7km' },
  { niveau: 6, distance: 8, label: '8km' },
  { niveau: 7, distance: 9, label: '9km' },
  { niveau: 8, distance: 10, label: '10km' },
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

export function getCourseLevel(niveau: number): CourseLevel {
  return PROGRESSION_COURSE[Math.min(niveau - 1, PROGRESSION_COURSE.length - 1)];
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
  _niveau: number
): boolean {
  if (recentSessions.length < 3) return false;
  const last3 = recentSessions.slice(-3);
  return last3.every(s => s.reps_realise >= s.reps_objectif);
}
