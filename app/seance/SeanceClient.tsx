"use client";
import { useState, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import { TypeAnimation } from "react-type-animation";
import type { Grade } from "@/lib/grades";
import {
  getPompesLevel,
  getAbdosLevel,
  getSquatsLevel,
} from "@/lib/progression";
import { formatDistance, formatAllure } from "@/lib/utils";
import SystemWindow from "@/components/ui/SystemWindow";
import BottomNav from "@/components/ui/BottomNav";
import RunesBg from "@/components/svgs/RunesBg";
import { SoundProvider, useSound } from "@/components/ui/SoundManager";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import type { Slug } from "react-muscle-highlighter";

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

const BodyMap = memo(function BodyMap({
  activeExo,
}: {
  activeExo: ExerciceType;
}) {
  const muscles = MUSCLES_PAR_EXERCICE[activeExo] || [];
  const frontMuscles = muscles.filter((m) => m.side === "front");
  const backMuscles = muscles.filter((m) => m.side === "back");

  const bodyData = [
    ...frontMuscles.map((m) => ({ slug: m.slug, intensity: m.intensity, color: "#06b6d4" })),
    ...backMuscles.map((m) => ({ slug: m.slug, intensity: m.intensity, color: "#7c3aed" })),
  ];

  return (
    <div className="flex gap-2 justify-center">
      <div className="flex flex-col items-center">
        <Body
          data={bodyData}
          gender="female"
          side="front"
          scale={1.0}
        />
        <span className="text-xs text-gray-600 mt-1">Face</span>
      </div>
      <div className="flex flex-col items-center">
        <Body
          data={bodyData}
          gender="female"
          side="back"
          scale={1.0}
        />
        <span className="text-xs text-gray-600 mt-1">Dos</span>
      </div>
    </div>
  );
});

function QuestWindow({
  exercices,
  open,
  onClose,
}: {
  exercices: {
    nom: string;
    repsRealisees: number;
    repsTotal: number;
    complete: boolean;
  }[];
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.8)" }}
        />
        <Dialog.Content
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 p-4 outline-none"
          style={{
            background: "#0a0a1a",
            border: "1px solid #06b6d4",
            outline: "2px solid #7c3aed",
            outlineOffset: "3px",
            clipPath:
              "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "#06b6d4", color: "#000" }}
              >
                !
              </span>
              <Dialog.Title
                className="font-orbitron text-sm tracking-[0.3em]"
                style={{ color: "#06b6d4" }}
              >
                QUÊTE QUOTIDIENNE
              </Dialog.Title>
            </div>
            <Dialog.Close
              className="text-gray-500 hover:text-white text-lg leading-none"
              onClick={onClose}
            >
              ✕
            </Dialog.Close>
          </div>

          {/* Sous-titre typewriter */}
          <TypeAnimation
            sequence={["[Quête journalière : L'Éveil commence.]"]}
            speed={60}
            className="text-xs text-gray-400 italic mb-4 block"
            cursor={false}
          />

          {/* Objectifs */}
          <div className="mb-4">
            <p
              className="font-orbitron text-xs tracking-widest mb-2"
              style={{ color: "#7c3aed" }}
            >
              OBJECTIFS
            </p>
            <div className="space-y-1.5">
              {exercices.map((ex) => (
                <div
                  key={ex.nom}
                  className="flex items-center justify-between gap-2 text-sm font-rajdhani"
                >
                  <span className="text-gray-300">{ex.nom}</span>
                  <span
                    style={{ color: ex.complete ? "#22c55e" : "#06b6d4" }}
                    className="font-orbitron text-xs"
                  >
                    [{ex.repsRealisees}/{ex.repsTotal}]
                  </span>
                  <span style={{ color: ex.complete ? "#22c55e" : "#94a3b8" }}>
                    {ex.complete ? "☑" : "□"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Avertissement */}
          <p
            className="text-xs leading-relaxed"
            style={{ color: "#dc2626" }}
          >
            AVERTISSEMENT : L&apos;échec à compléter la quête entraînera une
            punition du Système.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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

  const pompesNiveau = niveaux["pompes"] || 1;
  const abdosNiveau = niveaux["abdos"] || 1;
  const squatsNiveau = niveaux["squats"] || 1;

  const pompesLevel = getPompesLevel(pompesNiveau);
  const abdosLevel = getAbdosLevel(abdosNiveau);
  const squatsLevel = getSquatsLevel(squatsNiveau);

  function initSets(obj: number, count: number) {
    return Array.from({ length: count }, () => ({
      realise: obj,
      objectif: obj,
    }));
  }

  const [logs, setLogs] = useState<Record<ExerciceType, ExerciceLog>>({
    poignets: {
      type: "poignets",
      sets: initSets(15, 2),
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(sessionToday?.statut === "complete");
  const [xpGagne, setXpGagne] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [questOpen, setQuestOpen] = useState(false);

  const EXERCICES: {
    type: ExerciceType;
    label: string;
    icon: string;
    canDouleur: boolean;
  }[] = [
    { type: "poignets", label: "Renforcement poignets", icon: "🤝", canDouleur: true },
    { type: "pompes", label: "Pompes", icon: "💪", canDouleur: true },
    { type: "abdos", label: "Abdominaux", icon: "🔥", canDouleur: false },
    { type: "squats", label: "Squats", icon: "⬆", canDouleur: false },
    { type: "course", label: "Course", icon: "🏃", canDouleur: false },
  ];

  function getExerciceObjectif(type: ExerciceType) {
    if (type === "course") return null;
    const log = logs[type];
    return log.sets.reduce((s, set) => s + set.objectif, 0);
  }

  function getExerciceRealise(type: ExerciceType) {
    if (type === "course") return null;
    const log = logs[type];
    return log.sets.reduce((s, set) => s + set.realise, 0);
  }

  const questExercices = EXERCICES.filter((e) => e.type !== "course").map(
    (e) => {
      const total = getExerciceObjectif(e.type) || 0;
      const realise = getExerciceRealise(e.type) || 0;
      const pctAtteint = total > 0 ? realise / total : 0;
      return {
        nom: e.label,
        repsRealisees: realise,
        repsTotal: total,
        complete: logs[e.type].done && pctAtteint >= 0.95,
      };
    }
  );

  const courseEntry = {
    nom: "Course",
    repsRealisees: stravaToday
      ? Math.round(Number(stravaToday.distance_m) / 1000)
      : 0,
    repsTotal: 3,
    complete: logs.course.done,
  };

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
    toast(`⚔️ ${EXERCICES.find((e) => e.type === type)?.label} complété !`, {
      style: {
        background: "#0a0a1a",
        color: "#06b6d4",
        border: "1px solid #7c3aed",
      },
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
      style: {
        background: "#0a0a1a",
        color: "#dc2626",
        border: "1px solid #dc2626",
      },
    });
  }

  async function saveSeance() {
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
        setShowSuccess(true);
        toast(`⚔️ Quête validée ! +${data.xp_gagne} XP`, {
          style: {
            background: "#0a0a1a",
            color: "#06b6d4",
            border: "1px solid #7c3aed",
          },
        });
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } finally {
      setSaving(false);
    }
  }

  const totalDone = Object.values(logs).filter((l) => l.done).length;
  const totalExo = EXERCICES.length;
  const pct = Math.round((totalDone / totalExo) * 100);

  const activeLog = logs[activeExo];
  const activeExoInfo = EXERCICES.find((e) => e.type === activeExo)!;

  function getLevelLabel(type: ExerciceType) {
    if (type === "pompes")
      return `${pompesLevel.label} — ${pompesLevel.sets}x${pompesLevel.reps_objectif}`;
    if (type === "abdos")
      return `${abdosLevel.label} — ${abdosLevel.sets}x${abdosLevel.reps_objectif}`;
    if (type === "squats")
      return `${squatsLevel.label} — ${squatsLevel.sets}x${squatsLevel.reps_objectif}`;
    if (type === "poignets") return `Rotations & flexions — 2x15`;
    return "Via Strava";
  }

  if (isOff) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <RunesBg />
        <SystemWindow title="JOUR DE REPOS" className="w-full max-w-sm">
          <p className="text-center text-gray-300 py-4">
            Le Système t&apos;accorde du repos aujourd&apos;hui.
            <br />
            Récupère. Demain, la quête reprend.
          </p>
        </SystemWindow>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      <RunesBg />

      <QuestWindow
        exercices={[...questExercices, courseEntry]}
        open={questOpen}
        onClose={() => setQuestOpen(false)}
      />

      <div className="relative z-10 pt-12 px-4 safe-bottom">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-orbitron text-base uppercase tracking-widest text-cyan-400">
              Séance du Jour
            </h1>
            <p className="text-xs text-gray-500 font-rajdhani">
              {prenom} — Rang {grade}
            </p>
          </div>
          <button
            onClick={() => setQuestOpen(true)}
            className="px-3 py-1.5 border border-cyan-700 rounded text-xs font-orbitron text-cyan-400 hover:bg-cyan-950"
          >
            ! Quête
          </button>
        </div>

        {/* Progress bar global */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span className="font-orbitron">{pct}% complété</span>
            <span>
              {totalDone}/{totalExo} exercices
            </span>
          </div>
          <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
                boxShadow: "0 0 8px #06b6d4",
              }}
            />
          </div>
        </div>

        {/* Alerte douleur */}
        {alerteDouleur.length > 0 && (
          <div className="mb-3 p-3 bg-red-950 border border-red-700 rounded">
            <p className="text-red-400 text-xs font-orbitron uppercase">
              ⚠ Alerte douleur
            </p>
            <p className="text-gray-300 text-xs mt-1">
              3 séances consécutives de douleur aux {alerteDouleur.join(", ")}.
              Consulte un professionnel de santé.
            </p>
          </div>
        )}

        {/* Bodymap react-muscle-highlighter */}
        <div className="mb-4 flex justify-center">
          <BodyMap activeExo={activeExo} />
        </div>

        {/* Liste exercices */}
        <div className="grid grid-cols-5 gap-1 mb-4">
          {EXERCICES.map((exo) => (
            <button
              key={exo.type}
              onClick={() => setActiveExo(exo.type)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded border transition-all ${
                activeExo === exo.type
                  ? "border-cyan-500 bg-cyan-950 text-cyan-300"
                  : logs[exo.type].done
                    ? "border-green-800 bg-green-950 text-green-400"
                    : "border-gray-800 bg-gray-950 text-gray-500"
              }`}
            >
              <span className="text-lg">{exo.icon}</span>
              <span
                className="text-xs leading-tight text-center"
                style={{ fontSize: "9px" }}
              >
                {exo.type === "poignets" ? "Poig." : exo.label.split(" ")[0]}
              </span>
              {logs[exo.type].done && (
                <span className="text-green-400 text-xs">✓</span>
              )}
              {logs[exo.type].douleur && (
                <span className="text-red-400 text-xs">!</span>
              )}
            </button>
          ))}
        </div>

        {/* Détail exercice actif */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeExo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <SystemWindow
              title={`${activeExoInfo.icon} ${activeExoInfo.label}`}
              className="w-full mb-4"
            >
              {activeExo === "course" ? (
                <div className="space-y-3">
                  {stravaToday ? (
                    <div>
                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div>
                          <p className="text-orange-400 font-orbitron text-sm">
                            {formatDistance(Number(stravaToday.distance_m))}
                          </p>
                          <p className="text-xs text-gray-500">Distance</p>
                        </div>
                        <div>
                          <p className="text-cyan-400 font-orbitron text-sm">
                            {formatAllure(Number(stravaToday.allure_moyenne))}
                          </p>
                          <p className="text-xs text-gray-500">Allure</p>
                        </div>
                        <div>
                          <p className="text-violet-400 font-orbitron text-sm">
                            {Math.round(
                              Number(stravaToday.duree_secondes) / 60
                            )}
                            min
                          </p>
                          <p className="text-xs text-gray-500">Durée</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                        <div className="w-3 h-3 rounded-full bg-[#FC4C02]" />
                        <p className="text-xs text-gray-500">Données Strava</p>
                      </div>
                      {!logs.course.done && (
                        <button
                          onClick={() => markDone("course")}
                          className="w-full py-2 mt-2 bg-green-900 border border-green-600 text-green-300 text-sm font-orbitron uppercase rounded"
                        >
                          ✓ Valider la course
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-400 text-sm">
                        Aucune course Strava importée aujourd&apos;hui.
                      </p>
                      <p className="text-xs text-gray-500">
                        Logger manuellement :
                      </p>
                      <ManualRunLogger
                        onSave={(dist, dur) => {
                          fetch("/api/session/course-manuelle", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
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
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-cyan-400 font-orbitron uppercase tracking-wider">
                    {getLevelLabel(activeExo)}
                  </p>
                  {activeExo !== "poignets" && (
                    <p className="text-xs text-gray-400">
                      {activeExo === "pompes"
                        ? pompesLevel.description
                        : activeExo === "abdos"
                          ? abdosLevel.description
                          : squatsLevel.description}
                    </p>
                  )}

                  {activeLog.douleur ? (
                    <div className="py-3 text-center">
                      <p className="text-red-400 text-sm font-orbitron">
                        ⚠ Douleur signalée
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Les{" "}
                        {activeExo === "poignets"
                          ? "exercices poignets"
                          : "pompes"}{" "}
                        sont suspendus. Le reste de ta quête t&apos;attend,{" "}
                        {prenom}.
                      </p>
                    </div>
                  ) : activeLog.done ? (
                    <div className="py-3 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="text-green-400 text-2xl mb-1"
                      >
                        ✓
                      </motion.div>
                      <p className="text-green-400 text-sm font-orbitron">
                        Exercice complété
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {activeLog.sets.map((set, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 w-12">
                              Série {i + 1}
                            </span>
                            <div className="flex items-center gap-2 flex-1">
                              <button
                                onClick={() =>
                                  updateReps(
                                    activeExo,
                                    i,
                                    Math.max(0, set.realise - 1)
                                  )
                                }
                                className="w-8 h-8 rounded bg-gray-800 border border-gray-700 text-white font-bold"
                              >
                                -
                              </button>
                              <span className="flex-1 text-center font-orbitron text-lg text-white">
                                {set.realise}
                              </span>
                              <button
                                onClick={() =>
                                  updateReps(activeExo, i, set.realise + 1)
                                }
                                className="w-8 h-8 rounded bg-gray-800 border border-gray-700 text-white font-bold"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs text-gray-600">
                              / {set.objectif}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => markDone(activeExo)}
                          className="flex-1 py-2.5 bg-violet-800 border border-violet-500 text-white text-sm font-orbitron uppercase rounded hover:bg-violet-700"
                        >
                          ✓ Terminé
                        </button>
                        {activeExoInfo.canDouleur && (
                          <button
                            onClick={() => signalDouleur(activeExo)}
                            className="px-3 py-2.5 bg-red-950 border border-red-700 text-red-400 text-xs font-orbitron uppercase rounded hover:bg-red-900"
                          >
                            Douleur
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </SystemWindow>
          </motion.div>
        </AnimatePresence>

        {/* Bouton sauvegarder */}
        {!saved ? (
          <button
            onClick={saveSeance}
            disabled={saving || pct < 60}
            className="w-full py-4 mb-6 bg-gradient-to-r from-violet-800 to-cyan-900 border border-violet-500 text-white font-orbitron uppercase tracking-widest rounded pulse-glow disabled:opacity-40 hover:from-violet-700"
          >
            {saving ? "Enregistrement..." : `Soumettre la quête (${pct}%)`}
          </button>
        ) : (
          <SystemWindow title="QUÊTE VALIDÉE" className="w-full mb-6">
            <div className="text-center">
              <p className="text-green-400 font-orbitron text-sm">
                ✓ Séance enregistrée
              </p>
              <p className="text-gold text-sm mt-1">+{xpGagne} XP gagnés</p>
              <p className="text-xs text-gray-400 mt-2">
                &quot;Le Système enregistre ta progression, {prenom}. Tu mérites
                ce rang.&quot;
              </p>
            </div>
          </SystemWindow>
        )}

        {/* Message système */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-24 left-4 right-4 z-50"
            >
              <SystemWindow title="SYSTÈME" className="w-full">
                <p className="text-white text-sm text-center font-rajdhani">
                  {pct >= 95
                    ? "\"Objectif atteint. L'ombre en toi grandit.\""
                    : `"Le Système enregistre ta progression, ${prenom}."`}
                </p>
              </SystemWindow>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}

function ManualRunLogger({
  onSave,
}: {
  onSave: (distKm: number, durSec: number) => void;
}) {
  const [dist, setDist] = useState(3);
  const [min, setMin] = useState(22);
  const [sec, setSec] = useState(0);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <label className="text-xs text-gray-400 w-20">Distance (km)</label>
        <input
          type="number"
          value={dist}
          min="0.1"
          step="0.1"
          onChange={(e) => setDist(Number(e.target.value))}
          className="flex-1 py-1.5 px-2 bg-black border border-gray-700 text-white rounded text-sm"
        />
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-xs text-gray-400 w-20">Durée</label>
        <input
          type="number"
          value={min}
          min="0"
          onChange={(e) => setMin(Number(e.target.value))}
          className="w-16 py-1.5 px-2 bg-black border border-gray-700 text-white rounded text-sm"
        />
        <span className="text-gray-500 text-xs">min</span>
        <input
          type="number"
          value={sec}
          min="0"
          max="59"
          onChange={(e) => setSec(Number(e.target.value))}
          className="w-16 py-1.5 px-2 bg-black border border-gray-700 text-white rounded text-sm"
        />
        <span className="text-gray-500 text-xs">sec</span>
      </div>
      <button
        onClick={() => onSave(dist, min * 60 + sec)}
        className="w-full py-2 bg-orange-900 border border-orange-600 text-orange-300 text-sm font-orbitron uppercase rounded"
      >
        Logger la course
      </button>
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
