"use client";
import { useState, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TypeAnimation } from "react-type-animation";
import type { Grade } from "@/lib/grades";
import {
  getPompesLevel,
  getAbdosLevel,
  getSquatsLevel,
  getPoignetsLevel,
  PROGRESSION_COURSE,
} from "@/lib/progression";
import { formatDistance, formatAllure } from "@/lib/utils";
import BottomNav from "@/components/ui/BottomNav";
import RunesBg from "@/components/svgs/RunesBg";
import { SoundProvider, useSound } from "@/components/ui/SoundManager";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import type { Slug } from "react-muscle-highlighter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppStore } from "@/lib/store";
import gsap from "gsap";

const Body = dynamic(() => import("react-muscle-highlighter"), { ssr: false });

type ExerciceType = "pompes" | "abdos" | "squats" | "course" | "poignets";

interface ExerciceLog {
  type: ExerciceType;
  sets: { realise: number; objectif: number }[];
  douleur: boolean;
  done: boolean;
}

interface SeanceClientProps {
  userId: string;
  prenom: string;
  grade: Grade;
  xp: number;
  phase: number;
  sonsActifs: boolean;
  isOff: boolean;
  niveaux: Record<string, number>;
  alerteDouleur: string[];
  sessionToday: {
    id: string;
    statut: string;
    completion_pct: number;
    xp_gagne: number;
  } | null;
  stravaToday: {
    distance_m: number;
    duree_secondes: number;
    allure_moyenne: number;
  } | null;
}

const MUSCLES_PAR_EXERCICE: Record<
  string,
  { slug: Slug; intensity: number; side: "front" | "back" }[]
> = {
  poignets: [
    { slug: "forearm", intensity: 3, side: "front" },
    { slug: "biceps", intensity: 1, side: "front" },
  ],
  pompes: [
    { slug: "chest", intensity: 3, side: "front" },
    { slug: "deltoids", intensity: 2, side: "front" },
    { slug: "triceps", intensity: 1, side: "back" },
  ],
  abdos: [
    { slug: "abs", intensity: 3, side: "front" },
    { slug: "obliques", intensity: 1, side: "front" },
  ],
  squats: [
    { slug: "quadriceps", intensity: 3, side: "front" },
    { slug: "gluteal", intensity: 3, side: "back" },
    { slug: "hamstring", intensity: 1, side: "back" },
    { slug: "calves", intensity: 1, side: "back" },
  ],
  course: [
    { slug: "quadriceps", intensity: 3, side: "front" },
    { slug: "calves", intensity: 2, side: "back" },
    { slug: "hamstring", intensity: 1, side: "back" },
  ],
};

const EXERCICE_INFOS = [
  { type: "poignets" as ExerciceType, nom: "Renforcement poignets", labelCourt: "Poig.", emoji: "🤝", canDouleur: true },
  { type: "pompes" as ExerciceType, nom: "Pompes", labelCourt: "Pompes", emoji: "💪", canDouleur: true },
  { type: "abdos" as ExerciceType, nom: "Abdominaux", labelCourt: "Abdos", emoji: "🔥", canDouleur: false },
  { type: "squats" as ExerciceType, nom: "Squats", labelCourt: "Squats", emoji: "⬆", canDouleur: false },
  { type: "course" as ExerciceType, nom: "Course", labelCourt: "Course", emoji: "🏃", canDouleur: false },
];

const BodyMap = memo(function BodyMap({ activeExo }: { activeExo: ExerciceType }) {
  const muscles = MUSCLES_PAR_EXERCICE[activeExo] || [];
  const bodyData = muscles.map((m) => ({
    slug: m.slug,
    intensity: m.intensity,
    color: m.side === "front" ? "#06b6d4" : "#7c3aed",
  }));

  return (
    <div className="flex gap-2 justify-center">
      <div className="flex flex-col items-center">
        <Body data={bodyData} gender="female" side="front" scale={0.85} />
        <span className="text-gray-500 text-xs mt-1">Face</span>
      </div>
      <div className="flex flex-col items-center">
        <Body data={bodyData} gender="female" side="back" scale={0.85} />
        <span className="text-gray-500 text-xs mt-1">Dos</span>
      </div>
    </div>
  );
});

// ── Schéma Zod pour le logger course ─────────────────────────────────
const runSchema = z.object({
  distance_km: z.number().min(0.1, "Min 0.1 km").max(50, "Max 50 km"),
  duree_minutes: z.number().min(1, "Min 1 min").max(300, "Max 300 min"),
  duree_secondes: z.number().min(0).max(59),
});
type RunForm = z.infer<typeof runSchema>;

function ManualRunLogger({ onSave }: { onSave: (distKm: number, durSec: number) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RunForm>({
    resolver: zodResolver(runSchema),
    defaultValues: { distance_km: 3, duree_minutes: 22, duree_secondes: 0 },
  });

  return (
    <form onSubmit={handleSubmit((d) => onSave(d.distance_km, d.duree_minutes * 60 + d.duree_secondes))} className="space-y-2">
      <div className="flex gap-2 items-start">
        <label className="text-xs text-gray-400 w-20 pt-2">Distance (km)</label>
        <div className="flex-1">
          <input
            type="number"
            step="0.1"
            {...register("distance_km", { valueAsNumber: true })}
            className="w-full py-1.5 px-2 bg-black border border-gray-700 text-white rounded text-sm"
          />
          {errors.distance_km && <p className="text-red-400 text-xs mt-0.5">{errors.distance_km.message}</p>}
        </div>
      </div>
      <div className="flex gap-2 items-start">
        <label className="text-xs text-gray-400 w-20 pt-2">Durée</label>
        <div className="flex gap-1 items-center">
          <input
            type="number"
            {...register("duree_minutes", { valueAsNumber: true })}
            className="w-16 py-1.5 px-2 bg-black border border-gray-700 text-white rounded text-sm"
          />
          <span className="text-gray-500 text-xs">min</span>
          <input
            type="number"
            {...register("duree_secondes", { valueAsNumber: true })}
            className="w-14 py-1.5 px-2 bg-black border border-gray-700 text-white rounded text-sm"
          />
          <span className="text-gray-500 text-xs">sec</span>
        </div>
      </div>
      {errors.duree_minutes && <p className="text-red-400 text-xs">{errors.duree_minutes.message}</p>}
      <button
        type="submit"
        className="w-full py-2 font-orbitron text-xs uppercase rounded"
        style={{ background: "#7c2d12", border: "1px solid #ea580c", color: "#fdba74" }}
      >
        Logger la course
      </button>
    </form>
  );
}

function SeanceInner({
  prenom,
  grade,
  isOff,
  niveaux,
  alerteDouleur,
  sessionToday,
  stravaToday,
}: SeanceClientProps) {
  const { play } = useSound();

  // Niveaux depuis la BDD
  const poignetsNiveau = niveaux["poignets"] || 1;
  const pompesNiveau = niveaux["pompes"] || 1;
  const abdosNiveau = niveaux["abdos"] || 1;
  const squatsNiveau = niveaux["squats"] || 1;
  const courseNiveau = niveaux["course"] || 1;

  const poignetsLevel = getPoignetsLevel(poignetsNiveau);
  const pompesLevel = getPompesLevel(pompesNiveau);
  const abdosLevel = getAbdosLevel(abdosNiveau);
  const squatsLevel = getSquatsLevel(squatsNiveau);
  const courseLevel = PROGRESSION_COURSE[Math.min(courseNiveau - 1, PROGRESSION_COURSE.length - 1)];

  function initSets(obj: number, count: number) {
    return Array.from({ length: count }, () => ({ realise: obj, objectif: obj }));
  }

  const [logs, setLogs] = useState<Record<ExerciceType, ExerciceLog>>({
    poignets: {
      type: "poignets",
      sets: initSets(poignetsLevel.reps_objectif || 15, poignetsLevel.sets),
      douleur: false,
      done: false,
    },
    pompes: {
      type: "pompes",
      sets: initSets(pompesLevel.reps_objectif || 10, pompesLevel.sets),
      douleur: false,
      done: false,
    },
    abdos: {
      type: "abdos",
      sets: initSets(abdosLevel.reps_objectif || 10, abdosLevel.sets),
      douleur: false,
      done: false,
    },
    squats: {
      type: "squats",
      sets: initSets(squatsLevel.reps_objectif || 10, squatsLevel.sets),
      douleur: false,
      done: false,
    },
    course: { type: "course", sets: [], douleur: false, done: !!stravaToday },
  });

  const [activeExo, setActiveExo] = useState<ExerciceType>("poignets");
  const [exerciceOuvert, setExerciceOuvert] = useState<ExerciceType | null>("poignets");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(sessionToday?.statut === "complete");
  const [xpGagne, setXpGagne] = useState(0);

  // Totaux progression
  const totalDone = Object.values(logs).filter((l) => l.done).length;
  const completionPct = Math.round((totalDone / EXERCICE_INFOS.length) * 100);

  // Course
  const courseKmDone = stravaToday ? Math.round(Number(stravaToday.distance_m) / 100) / 10 : 0;
  const courseKmTotal = courseLevel.distance;

  function getRepsRealisees(type: ExerciceType): number {
    if (type === "course") return courseKmDone;
    return logs[type].sets.reduce((s, set) => s + set.realise, 0);
  }

  function getRepsTotal(type: ExerciceType): number {
    if (type === "course") return courseKmTotal;
    return logs[type].sets.reduce((s, set) => s + set.objectif, 0);
  }

  function getLevelLabel(type: ExerciceType): string {
    if (type === "pompes") return `${pompesLevel.label} — ${pompesLevel.sets}×${pompesLevel.reps_objectif}`;
    if (type === "abdos") return `${abdosLevel.label} — ${abdosLevel.sets}×${abdosLevel.reps_objectif}`;
    if (type === "squats") return `${squatsLevel.label} — ${squatsLevel.sets}×${squatsLevel.reps_objectif}`;
    if (type === "poignets") return `${poignetsLevel.label} — ${poignetsLevel.sets}×${poignetsLevel.reps_objectif}`;
    return courseLevel.label;
  }

  function updateReps(type: ExerciceType, setIdx: number, value: number) {
    setLogs((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        sets: prev[type].sets.map((s, i) =>
          i === setIdx ? { ...s, realise: value } : s
        ),
      },
    }));
  }

  function markDone(type: ExerciceType) {
    play("xp");
    navigator.vibrate?.([100, 50, 100]);
    setLogs((prev) => ({ ...prev, [type]: { ...prev[type], done: true } }));
    const info = EXERCICE_INFOS.find((e) => e.type === type);
    toast(`⚔️ ${info?.nom} complété !`, {
      style: { background: "#0a0a1a", color: "#06b6d4", border: "1px solid #7c3aed" },
    });
  }

  function signalDouleur(type: ExerciceType) {
    setLogs((prev) => ({
      ...prev,
      [type]: { ...prev[type], douleur: true, done: true },
    }));
    fetch("/api/session/douleur", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercice: type }),
    });
    toast("⚠️ Douleur signalée. Consulte un professionnel.", {
      style: { background: "#0a0a1a", color: "#dc2626", border: "1px solid #dc2626" },
    });
  }

  async function soumettreQuete() {
    setSaving(true);
    try {
      const res = await fetch("/api/session/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs }),
      });
      const data = await res.json();
      if (data.success) {
        play("complete");
        navigator.vibrate?.([100, 100, 100, 100, 300]);
        setXpGagne(data.xp_gagne);
        setSaved(true);
        useAppStore.getState().addXP(data.xp_gagne);
        gsap
          .timeline()
          .to(".grade-crystal", { scale: 1.5, rotation: 360, duration: 0.5, ease: "power2.out" })
          .to(".grade-crystal", { scale: 1, duration: 0.3, ease: "back.out" });
        toast(`⚔️ Quête validée ! +${data.xp_gagne} XP`, {
          style: { background: "#0a0a1a", color: "#06b6d4", border: "1px solid #7c3aed" },
        });
      }
    } finally {
      setSaving(false);
    }
  }

  if (isOff) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <RunesBg />
        <div
          className="w-full max-w-sm p-6 text-center"
          style={{
            background: "#0a0a1a",
            border: "1px solid #06b6d4",
            outline: "2px solid #7c3aed",
            outlineOffset: "3px",
            clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          }}
        >
          <p className="font-orbitron text-cyan-400 tracking-widest mb-3">JOUR DE REPOS</p>
          <p className="text-gray-300 text-sm">
            Le Système t&apos;accorde du repos aujourd&apos;hui.
            <br />
            Récupère. Demain, la quête reprend.
          </p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      <RunesBg />

      <div className="relative z-10 pt-10 pb-24">
        {/* ── SECTION 1 — Header ── */}
        <div className="px-4 mb-4">
          <h1 className="font-orbitron text-lg uppercase tracking-widest" style={{ color: "#06b6d4" }}>
            SÉANCE DU JOUR
          </h1>
          <p className="text-sm text-white font-rajdhani">
            {prenom} — Rang {grade}
          </p>
          <div
            className="mt-2 h-2 rounded-full overflow-hidden"
            style={{ background: "#111827" }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
                boxShadow: "0 0 8px #06b6d4",
              }}
            />
          </div>
          <span className="text-xs text-gray-400 mt-1 block font-rajdhani">
            {completionPct}% complété — {totalDone}/5 exercices
          </span>
        </div>

        {/* Alerte douleur */}
        {alerteDouleur.length > 0 && (
          <div className="mx-4 mb-3 p-3 rounded" style={{ background: "#450a0a", border: "1px solid #b91c1c" }}>
            <p className="text-red-400 text-xs font-orbitron uppercase">⚠ Alerte douleur</p>
            <p className="text-gray-300 text-xs mt-1">
              3 séances consécutives de douleur aux {alerteDouleur.join(", ")}.
              Consulte un professionnel de santé.
            </p>
          </div>
        )}

        {/* ── SECTION 2 — Bloc Quête intégré (PAS un dialog) ── */}
        <div
          className="mx-4 mb-4 p-4"
          style={{
            background: "#0a0a1a",
            border: "1px solid #06b6d4",
            outline: "2px solid #7c3aed",
            outlineOffset: "3px",
            clipPath:
              "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          }}
        >
          {/* Header quête */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "#06b6d4", color: "#000" }}
            >
              !
            </span>
            <h2
              className="font-orbitron text-sm tracking-widest"
              style={{ color: "#06b6d4" }}
            >
              QUÊTE QUOTIDIENNE
            </h2>
          </div>

          {/* Typewriter */}
          <TypeAnimation
            sequence={["[Quête journalière : L'Éveil commence.]"]}
            speed={60}
            className="text-xs text-gray-400 italic mb-3 block"
            cursor={false}
          />

          {/* Objectifs */}
          <h3 className="font-orbitron text-xs tracking-widest text-white mb-2">
            OBJECTIFS
          </h3>
          <div className="space-y-0.5">
            {EXERCICE_INFOS.map((exoInfo) => {
              const isOpen = exerciceOuvert === exoInfo.type;
              const log = logs[exoInfo.type];
              const repsR = getRepsRealisees(exoInfo.type);
              const repsT = getRepsTotal(exoInfo.type);
              const isCourse = exoInfo.type === "course";

              return (
                <div key={exoInfo.type}>
                  {/* Ligne cliquable */}
                  <button
                    className="w-full flex items-center justify-between gap-2 py-2 px-1 rounded transition-colors hover:bg-white/5"
                    onClick={() =>
                      setExerciceOuvert(isOpen ? null : exoInfo.type)
                    }
                  >
                    <span className="text-sm text-gray-300 font-rajdhani text-left flex-1">
                      {exoInfo.nom}
                    </span>
                    <span
                      className="font-orbitron text-xs whitespace-nowrap"
                      style={{ color: log.done ? "#22c55e" : "#06b6d4" }}
                    >
                      [{isCourse ? `${repsR}/${repsT}km` : `${repsR}/${repsT}`}]
                    </span>
                    <span
                      className="text-base"
                      style={{ color: log.done ? "#22c55e" : "#94a3b8" }}
                    >
                      {log.done ? "☑" : "□"}
                    </span>
                  </button>

                  {/* Accordion — s'ouvre DANS le bloc quête */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="py-3 px-3 ml-2 mb-1"
                          style={{ borderLeft: "2px solid #1e4d5a" }}
                        >
                          {isCourse ? (
                            /* ── Course ── */
                            <div className="space-y-2">
                              <p className="text-cyan-400 text-xs font-orbitron">
                                {courseLevel.label}
                              </p>
                              {stravaToday ? (
                                <div>
                                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                                    <div>
                                      <p
                                        className="font-orbitron text-sm"
                                        style={{ color: "#fb923c" }}
                                      >
                                        {formatDistance(
                                          Number(stravaToday.distance_m)
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Distance
                                      </p>
                                    </div>
                                    <div>
                                      <p
                                        className="font-orbitron text-sm"
                                        style={{ color: "#06b6d4" }}
                                      >
                                        {formatAllure(
                                          Number(stravaToday.allure_moyenne)
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Allure
                                      </p>
                                    </div>
                                    <div>
                                      <p
                                        className="font-orbitron text-sm"
                                        style={{ color: "#a78bfa" }}
                                      >
                                        {Math.round(
                                          Number(stravaToday.duree_secondes) / 60
                                        )}
                                        min
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Durée
                                      </p>
                                    </div>
                                  </div>
                                  {!log.done && (
                                    <button
                                      onClick={() => markDone("course")}
                                      className="w-full py-2 rounded font-orbitron text-xs uppercase"
                                      style={{
                                        background: "#14532d",
                                        border: "1px solid #16a34a",
                                        color: "#86efac",
                                      }}
                                    >
                                      ✓ Valider la course
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-gray-400 text-xs">
                                    Aucune course Strava. Logger manuellement :
                                  </p>
                                  <ManualRunLogger
                                    onSave={(dist, dur) => {
                                      fetch("/api/session/course-manuelle", {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          distance_m: dist * 1000,
                                          duree_secondes: dur,
                                        }),
                                      }).then(() => markDone("course"));
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ) : log.douleur ? (
                            /* ── Douleur signalée ── */
                            <div className="py-2 text-center">
                              <p
                                className="text-sm font-orbitron"
                                style={{ color: "#f87171" }}
                              >
                                ⚠ Douleur signalée
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                L&apos;exercice est suspendu. Continue ta quête.
                              </p>
                            </div>
                          ) : log.done ? (
                            /* ── Terminé ── */
                            <div className="py-2 text-center">
                              <motion.p
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 15,
                                }}
                                className="font-orbitron text-sm"
                                style={{ color: "#22c55e" }}
                              >
                                ✓ Exercice complété
                              </motion.p>
                            </div>
                          ) : (
                            /* ── Séries ── */
                            <div className="space-y-2">
                              <p className="text-cyan-400 text-xs font-orbitron">
                                {getLevelLabel(exoInfo.type)}
                              </p>
                              {log.sets.map((set, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3"
                                >
                                  <span className="text-xs text-gray-500 w-12">
                                    Série {i + 1}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateReps(
                                        exoInfo.type,
                                        i,
                                        Math.max(0, set.realise - 1)
                                      )
                                    }
                                    className="w-8 h-8 rounded font-bold text-white"
                                    style={{
                                      background: "#1f2937",
                                      border: "1px solid #374151",
                                    }}
                                  >
                                    -
                                  </button>
                                  <span className="flex-1 text-center font-orbitron text-lg text-white">
                                    {set.realise}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateReps(
                                        exoInfo.type,
                                        i,
                                        set.realise + 1
                                      )
                                    }
                                    className="w-8 h-8 rounded font-bold text-white"
                                    style={{
                                      background: "#1f2937",
                                      border: "1px solid #374151",
                                    }}
                                  >
                                    +
                                  </button>
                                  <span className="text-xs text-gray-600">
                                    / {set.objectif}
                                  </span>
                                </div>
                              ))}

                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => markDone(exoInfo.type)}
                                  className="flex-1 py-2 font-orbitron text-xs uppercase text-white"
                                  style={{
                                    background: "#7c3aed",
                                    border: "1px solid #06b6d4",
                                    padding: "8px 16px",
                                  }}
                                >
                                  ✓ TERMINÉ
                                </button>
                                {exoInfo.canDouleur && (
                                  <button
                                    onClick={() => signalDouleur(exoInfo.type)}
                                    className="px-3 py-2 font-orbitron text-xs uppercase"
                                    style={{
                                      background: "#7f1d1d",
                                      color: "#dc2626",
                                      border: "1px solid #dc2626",
                                      padding: "8px 16px",
                                    }}
                                  >
                                    DOULEUR
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Avertissement */}
          <p className="text-xs mt-4 leading-relaxed" style={{ color: "#dc2626" }}>
            AVERTISSEMENT : L&apos;échec à compléter la quête entraînera une
            punition du Système.
          </p>

          {/* Bouton soumettre */}
          {!saved ? (
            <button
              onClick={soumettreQuete}
              disabled={saving || completionPct < 95}
              className="w-full mt-4 font-orbitron text-sm uppercase tracking-widest text-white"
              style={{
                background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
                border: "1px solid #06b6d4",
                padding: "14px",
                clipPath:
                  "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                opacity: saving || completionPct < 95 ? 0.4 : 1,
                cursor:
                  saving || completionPct < 95 ? "not-allowed" : "pointer",
              }}
            >
              {saving
                ? "Enregistrement..."
                : `SOUMETTRE LA QUÊTE (${completionPct}%)`}
            </button>
          ) : (
            <div
              className="mt-4 p-3 text-center"
              style={{ border: "1px solid #16a34a", background: "#052e16" }}
            >
              <p className="text-green-400 font-orbitron text-sm">
                ✓ Séance enregistrée
              </p>
              <p className="text-yellow-400 text-sm mt-1">
                +{xpGagne} XP gagnés
              </p>
              <p className="text-xs text-gray-400 mt-1">
                &quot;Le Système enregistre ta progression, {prenom}. Tu mérites
                ce rang.&quot;
              </p>
            </div>
          )}
        </div>

        {/* ── SECTION 3 — Bodymap face + dos côte à côte ── */}
        <div className="px-4 mb-4">
          <BodyMap activeExo={activeExo} />
        </div>

        {/* ── SECTION 4 — Sélecteur exercice ── */}
        <div className="px-4">
          {/* Ligne 1 : 4 boutons */}
          <div className="grid grid-cols-4 gap-2">
            {(
              ["poignets", "pompes", "abdos", "squats"] as ExerciceType[]
            ).map((type) => {
              const info = EXERCICE_INFOS.find((e) => e.type === type)!;
              const isActive = activeExo === type;
              const isDone = logs[type].done;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setActiveExo(type);
                    setExerciceOuvert(type);
                  }}
                  className="flex flex-col items-center gap-1 py-3 rounded transition-all"
                  style={{
                    border: isActive
                      ? "2px solid #06b6d4"
                      : isDone
                        ? "1px solid #166534"
                        : "1px solid #1f2937",
                    background: isActive
                      ? "rgba(124, 58, 237, 0.3)"
                      : isDone
                        ? "rgba(20, 83, 45, 0.5)"
                        : "#030712",
                    boxShadow: isActive
                      ? "0 0 12px rgba(6, 182, 212, 0.5)"
                      : "none",
                  }}
                >
                  <span className="text-lg">{info.emoji}</span>
                  <span
                    className="font-orbitron"
                    style={{
                      fontSize: "9px",
                      color: isActive
                        ? "#06b6d4"
                        : isDone
                          ? "#22c55e"
                          : "#6b7280",
                    }}
                  >
                    {info.labelCourt}
                  </span>
                  {isDone && (
                    <span className="text-green-400 text-xs">✓</span>
                  )}
                  {logs[type].douleur && (
                    <span className="text-red-400 text-xs">!</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Ligne 2 : Course centré */}
          <div className="flex justify-center mt-2">
            <button
              onClick={() => {
                setActiveExo("course");
                setExerciceOuvert("course");
              }}
              className="flex flex-col items-center gap-1 py-3 px-10 rounded transition-all"
              style={{
                border:
                  activeExo === "course"
                    ? "2px solid #06b6d4"
                    : logs.course.done
                      ? "1px solid #166534"
                      : "1px solid #1f2937",
                background:
                  activeExo === "course"
                    ? "rgba(124, 58, 237, 0.3)"
                    : logs.course.done
                      ? "rgba(20, 83, 45, 0.5)"
                      : "#030712",
                boxShadow:
                  activeExo === "course"
                    ? "0 0 12px rgba(6, 182, 212, 0.5)"
                    : "none",
              }}
            >
              <span className="text-lg">🏃</span>
              <span
                className="font-orbitron"
                style={{
                  fontSize: "9px",
                  color:
                    activeExo === "course"
                      ? "#06b6d4"
                      : logs.course.done
                        ? "#22c55e"
                        : "#6b7280",
                }}
              >
                Course
              </span>
              {logs.course.done && (
                <span className="text-green-400 text-xs">✓</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default function SeanceClient(props: SeanceClientProps) {
  const [soundEnabled, setSoundEnabled] = useState(props.sonsActifs);
  return (
    <SoundProvider enabled={soundEnabled} onToggle={setSoundEnabled}>
      <SeanceInner {...props} />
    </SoundProvider>
  );
}
