export const GRADES = ['E', 'D', 'C', 'B', 'A', 'S', 'National', 'Monarque'] as const;
export type Grade = typeof GRADES[number];

export const XP_THRESHOLDS: Record<Grade, number> = {
  E: 0,
  D: 500,
  C: 1500,
  B: 3500,
  A: 7000,
  S: 15000,
  National: 30000,
  Monarque: 60000,
};

export const GRADE_TITLES: Record<Grade, string> = {
  E: 'Éveillée',
  D: 'Soldate de l\'Ombre',
  C: 'Gardienne',
  B: 'Gardienne Supérieure',
  A: 'Chasseuse d\'Élite',
  S: 'Chasseuse Rang S',
  National: 'Chasseuse Nationale',
  Monarque: 'Monarque des Ombres',
};

export const GRADE_COLORS: Record<Grade, string> = {
  E: '#94a3b8',
  D: '#22c55e',
  C: '#3b82f6',
  B: '#a855f7',
  A: '#f59e0b',
  S: '#06b6d4',
  National: '#dc2626',
  Monarque: '#7c3aed',
};

export function getGradeFromXP(xp: number): Grade {
  let grade: Grade = 'E';
  for (const [g, threshold] of Object.entries(XP_THRESHOLDS) as [Grade, number][]) {
    if (xp >= threshold) grade = g;
  }
  return grade;
}

export function getNextGrade(grade: Grade): Grade | null {
  const idx = GRADES.indexOf(grade);
  return idx < GRADES.length - 1 ? GRADES[idx + 1] : null;
}

export function getXPForNextGrade(grade: Grade): number {
  const next = getNextGrade(grade);
  if (!next) return XP_THRESHOLDS.Monarque;
  return XP_THRESHOLDS[next];
}

export function getXPProgress(xp: number, grade: Grade): number {
  const current = XP_THRESHOLDS[grade];
  const next = getXPForNextGrade(grade);
  if (next === current) return 100;
  return Math.round(((xp - current) / (next - current)) * 100);
}
