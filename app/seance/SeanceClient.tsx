'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Grade } from '@/lib/grades';
import {
  getPompesLevel, getAbdosLevel, getSquatsLevel,
} from '@/lib/progression';
import { formatDistance, formatAllure } from '@/lib/utils';
import BodyMapSVG from '@/components/svgs/BodyMapSVG';
import SystemWindow from '@/components/ui/SystemWindow';
import BottomNav from '@/components/ui/BottomNav';
import RunesBg from '@/components/svgs/RunesBg';
import { SoundProvider, useSound } from '@/components/ui/SoundManager';

type ExerciceType = 'pompes' | 'abdos' | 'squats' | 'course' | 'poignets';

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
  sessionToday: { id: string; statut: string; completion_pct: number; xp_gagne: number } | null;
  stravaToday: { distance_m: number; duree_secondes: number; allure_moyenne: number } | null;
}

function SeanceInner({ prenom, grade, isOff, niveaux, alerteDouleur, sessionToday, stravaToday }: SeanceClientProps) {
  const { play } = useSound();

  const pompesNiveau = niveaux['pompes'] || 1;
  const abdosNiveau = niveaux['abdos'] || 1;
  const squatsNiveau = niveaux['squats'] || 1;

  const pompesLevel = getPompesLevel(pompesNiveau);
  const abdosLevel = getAbdosLevel(abdosNiveau);
  const squatsLevel = getSquatsLevel(squatsNiveau);

  function initSets(obj: number, count: number) {
    return Array.from({ length: count }, () => ({ realise: obj, objectif: obj }));
  }

  const [logs, setLogs] = useState<Record<ExerciceType, ExerciceLog>>({
    poignets: { type: 'poignets', sets: initSets(15, 2), douleur: false, done: false },
    pompes: { type: 'pompes', sets: initSets(pompesLevel.reps_objectif || 10, pompesLevel.sets), douleur: false, done: false },
    abdos: { type: 'abdos', sets: initSets(abdosLevel.reps_objectif || 10, abdosLevel.sets), douleur: false, done: false },
    squats: { type: 'squats', sets: initSets(squatsLevel.reps_objectif || 10, squatsLevel.sets), douleur: false, done: false },
    course: { type: 'course', sets: [], douleur: false, done: !!stravaToday },
  });

  const [activeExo, setActiveExo] = useState<ExerciceType>('poignets');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(sessionToday?.statut === 'complete');
  const [xpGagne, setXpGagne] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const EXERCICES: { type: ExerciceType; label: string; icon: string; canDouleur: boolean }[] = [
    { type: 'poignets', label: 'Renforcement poignets', icon: '🤝', canDouleur: true },
    { type: 'pompes', label: 'Pompes', icon: '💪', canDouleur: true },
    { type: 'abdos', label: 'Abdominaux', icon: '🔥', canDouleur: false },
    { type: 'squats', label: 'Squats', icon: '⬆', canDouleur: false },
    { type: 'course', label: 'Course', icon: '🏃', canDouleur: false },
  ];

  function updateReps(type: ExerciceType, setIdx: number, value: number) {
    setLogs(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        sets: prev[type].sets.map((s, i) => i === setIdx ? { ...s, realise: value } : s),
      },
    }));
  }

  function markDone(type: ExerciceType) {
    play('xp');
    setLogs(prev => ({ ...prev, [type]: { ...prev[type], done: true } }));
  }

  function signalDouleur(type: ExerciceType) {
    setLogs(prev => ({ ...prev, [type]: { ...prev[type], douleur: true, done: true } }));
    fetch('/api/session/douleur', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercice: type }),
    });
  }

  async function saveSeance() {
    setSaving(true);
    try {
      const res = await fetch('/api/session/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
      });
      const data = await res.json();
      if (data.success) {
        play('complete');
        setXpGagne(data.xp_gagne);
        setSaved(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } finally {
      setSaving(false);
    }
  }

  const totalDone = Object.values(logs).filter(l => l.done).length;
  const totalExo = EXERCICES.length;
  const pct = Math.round((totalDone / totalExo) * 100);

  const activeLog = logs[activeExo];
  const activeExoInfo = EXERCICES.find(e => e.type === activeExo)!;

  function getLevelLabel(type: ExerciceType) {
    if (type === 'pompes') return `${pompesLevel.label} — ${pompesLevel.sets}x${pompesLevel.reps_objectif}`;
    if (type === 'abdos') return `${abdosLevel.label} — ${abdosLevel.sets}x${abdosLevel.reps_objectif}`;
    if (type === 'squats') return `${squatsLevel.label} — ${squatsLevel.sets}x${squatsLevel.reps_objectif}`;
    if (type === 'poignets') return `Rotations & flexions — 2x15`;
    return 'Via Strava';
  }

  if (isOff) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <RunesBg />
        <SystemWindow title="JOUR DE REPOS" className="w-full max-w-sm">
          <p className="text-center text-gray-300 py-4">
            Le Système t'accorde du repos aujourd'hui.<br />
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

      <div className="relative z-10 pt-12 px-4 safe-bottom">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="font-orbitron text-base uppercase tracking-widest text-cyan-400">
            Séance du Jour
          </h1>
          <p className="text-xs text-gray-500 font-rajdhani">{prenom} — Rang {grade}</p>
        </div>

        {/* Progress bar global */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span className="font-orbitron">{pct}% complété</span>
            <span>{totalDone}/{totalExo} exercices</span>
          </div>
          <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${pct}%` }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }} />
          </div>
        </div>

        {/* Alerte douleur 3 séances consécutives */}
        {alerteDouleur.length > 0 && (
          <div className="mb-3 p-3 bg-red-950 border border-red-700 rounded">
            <p className="text-red-400 text-xs font-orbitron uppercase">⚠ Alerte douleur</p>
            <p className="text-gray-300 text-xs mt-1">
              3 séances consécutives de douleur aux {alerteDouleur.join(', ')}.
              Consulte un professionnel de santé.
            </p>
          </div>
        )}

        {/* SVG corps + muscles actifs */}
        <div className="flex justify-center mb-4">
          <BodyMapSVG activeExercices={[activeExo]} size={140} />
        </div>

        {/* Liste exercices */}
        <div className="grid grid-cols-5 gap-1 mb-4">
          {EXERCICES.map(exo => (
            <button
              key={exo.type}
              onClick={() => setActiveExo(exo.type)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded border transition-all ${
                activeExo === exo.type
                  ? 'border-cyan-500 bg-cyan-950 text-cyan-300'
                  : logs[exo.type].done
                    ? 'border-green-800 bg-green-950 text-green-400'
                    : 'border-gray-800 bg-gray-950 text-gray-500'
              }`}>
              <span className="text-lg">{exo.icon}</span>
              <span className="text-xs leading-tight text-center"
                style={{ fontSize: '9px' }}>
                {exo.type === 'poignets' ? 'Poig.' : exo.label.split(' ')[0]}
              </span>
              {logs[exo.type].done && <span className="text-green-400 text-xs">✓</span>}
              {logs[exo.type].douleur && <span className="text-red-400 text-xs">!</span>}
            </button>
          ))}
        </div>

        {/* Détail exercice actif */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeExo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}>
            <SystemWindow title={`${activeExoInfo.icon} ${activeExoInfo.label}`} className="w-full mb-4">
              {activeExo === 'course' ? (
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
                            {Math.round(Number(stravaToday.duree_secondes) / 60)}min
                          </p>
                          <p className="text-xs text-gray-500">Durée</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                        <div className="w-3 h-3 rounded-full bg-[#FC4C02]" />
                        <p className="text-xs text-gray-500">Données fournies par Strava</p>
                      </div>
                      {!logs.course.done && (
                        <button onClick={() => markDone('course')}
                          className="w-full py-2 mt-2 bg-green-900 border border-green-600 text-green-300 text-sm font-orbitron uppercase rounded">
                          ✓ Valider la course
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-400 text-sm">
                        Aucune course Strava importée aujourd'hui.
                      </p>
                      <p className="text-xs text-gray-500">Logger manuellement :</p>
                      <ManualRunLogger onSave={(dist, dur) => {
                        fetch('/api/session/course-manuelle', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ distance_m: dist * 1000, duree_secondes: dur }),
                        }).then(() => markDone('course'));
                      }} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-cyan-400 font-orbitron uppercase tracking-wider">
                    {getLevelLabel(activeExo)}
                  </p>
                  {activeExo !== 'poignets' && (
                    <p className="text-xs text-gray-400">
                      {activeExo === 'pompes' ? pompesLevel.description :
                        activeExo === 'abdos' ? abdosLevel.description :
                        squatsLevel.description}
                    </p>
                  )}

                  {activeLog.douleur ? (
                    <div className="py-3 text-center">
                      <p className="text-red-400 text-sm font-orbitron">⚠ Douleur signalée</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Les {activeExo === 'poignets' ? 'exercices poignets' : 'pompes'} sont suspendus.
                        Le reste de ta quête t'attend, {prenom}.
                      </p>
                    </div>
                  ) : activeLog.done ? (
                    <div className="py-3 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-400 text-2xl mb-1">✓</motion.div>
                      <p className="text-green-400 text-sm font-orbitron">Exercice complété</p>
                    </div>
                  ) : (
                    <>
                      {/* Séries */}
                      <div className="space-y-2">
                        {activeLog.sets.map((set, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 w-12">Série {i + 1}</span>
                            <div className="flex items-center gap-2 flex-1">
                              <button onClick={() => updateReps(activeExo, i, Math.max(0, set.realise - 1))}
                                className="w-8 h-8 rounded bg-gray-800 border border-gray-700 text-white font-bold">-</button>
                              <span className="flex-1 text-center font-orbitron text-lg text-white">
                                {set.realise}
                              </span>
                              <button onClick={() => updateReps(activeExo, i, set.realise + 1)}
                                className="w-8 h-8 rounded bg-gray-800 border border-gray-700 text-white font-bold">+</button>
                            </div>
                            <span className="text-xs text-gray-600">/ {set.objectif}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => markDone(activeExo)}
                          className="flex-1 py-2.5 bg-violet-800 border border-violet-500 text-white text-sm font-orbitron uppercase rounded hover:bg-violet-700">
                          ✓ Terminé
                        </button>
                        {activeExoInfo.canDouleur && (
                          <button
                            onClick={() => signalDouleur(activeExo)}
                            className="px-3 py-2.5 bg-red-950 border border-red-700 text-red-400 text-xs font-orbitron uppercase rounded hover:bg-red-900">
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
            className="w-full py-4 mb-6 bg-gradient-to-r from-violet-800 to-cyan-900 border border-violet-500 text-white font-orbitron uppercase tracking-widest rounded pulse-glow disabled:opacity-40 hover:from-violet-700">
            {saving ? 'Enregistrement...' : `Soumettre la quête (${pct}%)`}
          </button>
        ) : (
          <SystemWindow title="QUÊTE VALIDÉE" className="w-full mb-6">
            <div className="text-center">
              <p className="text-green-400 font-orbitron text-sm">✓ Séance enregistrée</p>
              <p className="text-gold text-sm mt-1">+{xpGagne} XP gagnés</p>
              <p className="text-xs text-gray-400 mt-2">
                "Le Système enregistre ta progression, {prenom}. Tu mérites ce rang."
              </p>
            </div>
          </SystemWindow>
        )}

        {/* Message système selon progression */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-24 left-4 right-4 z-50">
              <SystemWindow title="SYSTÈME" className="w-full">
                <p className="text-white text-sm text-center font-rajdhani">
                  {pct >= 95
                    ? '"Objectif atteint. L\'ombre en toi grandit."'
                    : '"Le Système enregistre ta progression, ' + prenom + '."'}
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

function ManualRunLogger({ onSave }: { onSave: (distKm: number, durSec: number) => void }) {
  const [dist, setDist] = useState(3);
  const [min, setMin] = useState(22);
  const [sec, setSec] = useState(0);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <label className="text-xs text-gray-400 w-20">Distance (km)</label>
        <input type="number" value={dist} min="0.1" step="0.1"
          onChange={e => setDist(Number(e.target.value))}
          className="flex-1 py-1.5 px-2 bg-black border border-gray-700 text-white rounded text-sm" />
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-xs text-gray-400 w-20">Durée</label>
        <input type="number" value={min} min="0"
          onChange={e => setMin(Number(e.target.value))}
          className="w-16 py-1.5 px-2 bg-black border border-gray-700 text-white rounded text-sm" />
        <span className="text-gray-500 text-xs">min</span>
        <input type="number" value={sec} min="0" max="59"
          onChange={e => setSec(Number(e.target.value))}
          className="w-16 py-1.5 px-2 bg-black border border-gray-700 text-white rounded text-sm" />
        <span className="text-gray-500 text-xs">sec</span>
      </div>
      <button onClick={() => onSave(dist, min * 60 + sec)}
        className="w-full py-2 bg-orange-900 border border-orange-600 text-orange-300 text-sm font-orbitron uppercase rounded">
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
