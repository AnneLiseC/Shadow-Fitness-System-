import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppStore {
  prenom: string;
  grade: string;
  xp: number;
  xpProchain: number;
  streak: number;
  streakRecord: number;
  phase: number;
  seanceActive: boolean;
  exerciceActif: string | null;
  repsJournalieres: Record<string, number>;
  verresEau: number;
  objectifEau: number;
  setGrade: (grade: string) => void;
  addXP: (xp: number) => void;
  addVerre: () => void;
  setExerciceActif: (ex: string | null) => void;
  addReps: (exercice: string, reps: number) => void;
  resetJournee: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      prenom: "Anne-Lise",
      grade: "E",
      xp: 0,
      xpProchain: 500,
      streak: 0,
      streakRecord: 0,
      phase: 1,
      seanceActive: false,
      exerciceActif: null,
      repsJournalieres: {},
      verresEau: 0,
      objectifEau: 10,
      setGrade: (grade) => set({ grade }),
      addXP: (xp) => set((s) => ({ xp: s.xp + xp })),
      addVerre: () => set((s) => ({ verresEau: s.verresEau + 1 })),
      setExerciceActif: (ex) => set({ exerciceActif: ex }),
      addReps: (exercice, reps) =>
        set((s) => ({
          repsJournalieres: {
            ...s.repsJournalieres,
            [exercice]: (s.repsJournalieres[exercice] || 0) + reps,
          },
        })),
      resetJournee: () =>
        set({ repsJournalieres: {}, verresEau: 0, seanceActive: false }),
    }),
    { name: "shadow-fitness-store" }
  )
);
