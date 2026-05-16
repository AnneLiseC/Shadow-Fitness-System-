'use client';
import { motion } from 'framer-motion';
import type { Grade } from '@/lib/grades';
import { GRADE_COLORS, getXPProgress, getXPForNextGrade, XP_THRESHOLDS } from '@/lib/grades';
import { formatDistance, formatAllure } from '@/lib/utils';
import SystemWindow from '@/components/ui/SystemWindow';
import BottomNav from '@/components/ui/BottomNav';
import RunesBg from '@/components/svgs/RunesBg';
import CrystalSVG from '@/components/svgs/CrystalSVG';
import XPBar from '@/components/ui/XPBar';

const EXO_LABELS: Record<string, string> = {
  pompes: 'Pompes',
  abdos: 'Abdominaux',
  squats: 'Squats',
  poignets: 'Renforcement poignets',
};

interface ProgressionClientProps {
  prenom: string;
  grade: Grade;
  xp: number;
  streak: number;
  streakRecord: number;
  phase: number;
  sessions: { date: string; completion_pct: number; xp_gagne: number; statut: string }[];
  courses: { date: string; distance_m: number; allure_moyenne: number }[];
  douleurs: { date: string; exercice: string; intensite: number }[];
  progressions: { type_exercice: string; niveau_actuel: number; date_derniere_progression: string }[];
  stravaAthleteId?: number;
}

export default function ProgressionClient({
  prenom, grade, xp, streak, streakRecord, phase,
  sessions, courses, douleurs, progressions, stravaAthleteId
}: ProgressionClientProps) {
  const gradeColor = GRADE_COLORS[grade];
  const completedSessions = sessions.filter(s => s.statut === 'complete').length;
  const totalXP = sessions.reduce((s, se) => s + (se.xp_gagne || 0), 0);

  const maxDist = courses.length > 0 ? Math.max(...courses.map(c => Number(c.distance_m))) : 1;

  return (
    <div className="min-h-screen bg-black relative">
      <RunesBg />

      <div className="relative z-10 pt-12 px-4 safe-bottom">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="font-orbitron text-base uppercase tracking-widest text-cyan-400">
            Progression
          </h1>
          <p className="text-xs text-gray-500">{prenom} — Phase {phase}</p>
        </div>

        {/* Crystal + Grade */}
        <div className="flex justify-center mb-4">
          <div className="flex flex-col items-center gap-2">
            <CrystalSVG grade={grade} size={80} />
            <p className="font-orbitron text-lg" style={{ color: gradeColor }}>Rang {grade}</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-4">
          <XPBar xp={xp} grade={grade} />
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-900 border border-gray-800 rounded p-2 text-center">
            <p className="text-cyan-400 font-orbitron text-lg">{completedSessions}</p>
            <p className="text-xs text-gray-500">Séances</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-2 text-center">
            <p className="text-orange-400 font-orbitron text-lg">🔥 {streak}</p>
            <p className="text-xs text-gray-500">Streak</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-2 text-center">
            <p className="text-gold font-orbitron text-lg">{streakRecord}</p>
            <p className="text-xs text-gray-500">Record</p>
          </div>
        </div>

        {/* Graphique séances 30j */}
        {sessions.length > 0 && (
          <SystemWindow title="SÉANCES — 30 DERNIERS JOURS" className="w-full mb-4">
            <div className="flex items-end gap-0.5 h-16">
              {sessions.map((s, i) => {
                const h = Math.max(4, Math.round((s.completion_pct / 100) * 64));
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    className="flex-1 rounded-t"
                    style={{
                      background: s.statut === 'complete'
                        ? 'linear-gradient(to top, #7c3aed, #06b6d4)'
                        : '#374151',
                    }}
                    title={`${s.date}: ${s.completion_pct}%`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Il y a 30j</span>
              <span>Aujourd'hui</span>
            </div>
          </SystemWindow>
        )}

        {/* Niveaux exercices */}
        <SystemWindow title="NIVEAUX EXERCICES" className="w-full mb-4">
          <div className="space-y-3">
            {progressions.map(p => {
              const maxLevel = p.type_exercice === 'pompes' ? 16 :
                p.type_exercice === 'abdos' ? 8 :
                p.type_exercice === 'squats' ? 5 : 3;
              const pct = Math.round((p.niveau_actuel / maxLevel) * 100);
              return (
                <div key={p.type_exercice}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{EXO_LABELS[p.type_exercice] || p.type_exercice}</span>
                    <span className="text-violet-400">Niv. {p.niveau_actuel}/{maxLevel}</span>
                  </div>
                  <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.2 }}
                      className="h-full rounded-full bg-violet-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </SystemWindow>

        {/* Objectif final */}
        <SystemWindow title="OBJECTIF FINAL 18-24 MOIS" className="w-full mb-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '100 Pompes', current: progressions.find(p => p.type_exercice === 'pompes')?.niveau_actuel || 1, max: 16 },
              { label: '100 Abdos', current: progressions.find(p => p.type_exercice === 'abdos')?.niveau_actuel || 1, max: 8 },
              { label: '100 Squats', current: progressions.find(p => p.type_exercice === 'squats')?.niveau_actuel || 1, max: 5 },
              { label: '10km Course', current: courses.length, max: 50 },
            ].map(obj => (
              <div key={obj.label} className="bg-gray-900 rounded p-2">
                <p className="text-xs text-gray-400 mb-1">{obj.label}</p>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${Math.min((obj.current / obj.max) * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {Math.min(Math.round((obj.current / obj.max) * 100), 100)}%
                </p>
              </div>
            ))}
          </div>
        </SystemWindow>

        {/* Données Strava */}
        {courses.length > 0 && (
          <SystemWindow title="COURSES STRAVA" className="w-full mb-4">
            <div className="space-y-2">
              <div className="flex items-end gap-0.5 h-12 mb-2">
                {courses.slice(0, 14).reverse().map((c, i) => {
                  const h = Math.max(4, Math.round((Number(c.distance_m) / maxDist) * 48));
                  return (
                    <div key={i}
                      className="flex-1 rounded-t bg-orange-600"
                      style={{ height: h, opacity: 0.7 + i * 0.02 }}
                      title={`${formatDistance(Number(c.distance_m))}`} />
                  );
                })}
              </div>

              {courses.slice(0, 5).map((c, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-gray-400">{new Date(c.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                  <span className="text-orange-400">{formatDistance(Number(c.distance_m))}</span>
                  <span className="text-gray-500">{formatAllure(Number(c.allure_moyenne))}</span>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                <div className="w-4 h-4 rounded-full bg-[#FC4C02] flex-shrink-0" />
                <p className="text-xs text-gray-500">Données fournies par Strava</p>
                {stravaAthleteId && (
                  <a href={`https://www.strava.com/athletes/${stravaAthleteId}`}
                    target="_blank" rel="noopener noreferrer"
                    className="ml-auto text-xs text-[#FC4C02] underline">
                    Voir profil Strava ↗
                  </a>
                )}
              </div>
            </div>
          </SystemWindow>
        )}

        {/* Historique douleurs */}
        {douleurs.length > 0 && (
          <SystemWindow title="HISTORIQUE DOULEURS" className="w-full mb-6">
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-2">Signalements récents poignets</p>
              {douleurs.slice(0, 5).map((d, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    {new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="text-red-400">{EXO_LABELS[d.exercice] || d.exercice}</span>
                  <span className="text-gray-500">Intensité {d.intensite}/5</span>
                </div>
              ))}
              {douleurs.some(d => d.exercice === 'pompes') && (
                <p className="text-xs text-yellow-500 mt-2">
                  ⚠ Si douleurs persistantes, consulte ton kinésithérapeute.
                </p>
              )}
            </div>
          </SystemWindow>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
