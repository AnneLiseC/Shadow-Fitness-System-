'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Grade } from '@/lib/grades';
import { GRADE_TITLES, GRADE_COLORS } from '@/lib/grades';
import { formatDistance, formatAllure, formatDuration } from '@/lib/utils';
import AvatarSVG from '@/components/svgs/AvatarSVG';
import CrystalSVG from '@/components/svgs/CrystalSVG';
import RunesBg from '@/components/svgs/RunesBg';
import ShadowsSilhouettes from '@/components/svgs/ShadowsSilhouettes';
import SystemWindow from '@/components/ui/SystemWindow';
import XPBar from '@/components/ui/XPBar';
import WaterTracker from '@/components/ui/WaterTracker';
import BottomNav from '@/components/ui/BottomNav';
import { SoundProvider, useSound } from '@/components/ui/SoundManager';
  
interface DashboardClientProps {
  prenom: string;
  grade: Grade;
  xp: number;
  streak: number;
  streakRecord: number;
  sonsActifs: boolean;
  isOff: boolean;
  sessionToday: { id: string; statut: string; completion_pct: number; xp_gagne: number } | null;
  derniereCourse: { date: string; distance_m: number; duree_secondes: number; allure_moyenne: number } | null;
  coursesWeek: { date: string; distance_m: number }[];
  stravaConnected: boolean;
  stravaAthleteId?: number;
  totalEau: number;
  queteUrgente: { id: string; description: string; xp_recompense: number; expire_at: string } | null;
  phase: number;
}

function DashboardInner(props: DashboardClientProps) {
  const { prenom, grade, xp, streak, streakRecord, sonsActifs, isOff, sessionToday,
    derniereCourse, coursesWeek, stravaConnected, stravaAthleteId, totalEau, queteUrgente, phase } = props;

  const [eau, setEau] = useState(totalEau);
  const [soundEnabled, setSoundEnabled] = useState(sonsActifs);
  const { play } = useSound();

  const gradeColor = GRADE_COLORS[grade];
  const gradeTitle = GRADE_TITLES[grade];

  const targetEau = 10; // 2.5L = 10 verres de 250ml (3L jours entrainement = 12)
  const seanceComplete = sessionToday?.statut === 'complete';

  async function addEau() {
    const newEau = eau + 1;
    setEau(newEau);
    play('water');
    await fetch('/api/nutrition/eau', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verres: 1 }),
    });
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <RunesBg />
      <ShadowsSilhouettes />

      {/* Header */}
      <div className="relative z-10 pt-12 px-4">
        {/* Titre dynamique */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2">
          <p className="text-xs text-gray-500 font-orbitron uppercase tracking-widest mb-1">
            Système d'Éveil
          </p>
          <h1 className="font-orbitron text-lg font-bold"
            style={{ color: gradeColor, textShadow: `0 0 12px ${gradeColor}` }}>
            {prenom} — Chasseuse Rang {grade}
          </h1>
          <p className="text-xs text-gray-400 font-rajdhani">{gradeTitle}</p>
        </motion.div>

        {/* Avatar + Cristal */}
        <div className="flex items-center justify-center gap-4 my-4">
          <AvatarSVG grade={grade} size={130} idle />
          <div className="flex flex-col items-center gap-2">
            <CrystalSVG grade={grade} size={80} />
            <div className="text-center">
              <p className="text-xs text-gray-400 font-orbitron">Rang</p>
              <p className="font-orbitron text-xl font-bold" style={{ color: gradeColor }}>
                {grade}
              </p>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-4">
          <XPBar xp={xp} grade={grade} />
        </div>

        {/* Stats streak + phase */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-900 bg-opacity-80 border border-gray-800 rounded p-2 text-center">
            <p className="text-orange-400 text-lg font-orbitron font-bold">🔥 {streak}</p>
            <p className="text-xs text-gray-500">Streak</p>
          </div>
          <div className="bg-gray-900 bg-opacity-80 border border-gray-800 rounded p-2 text-center">
            <p className="text-gold text-lg font-orbitron font-bold">{streakRecord}</p>
            <p className="text-xs text-gray-500">Record</p>
          </div>
          <div className="bg-gray-900 bg-opacity-80 border border-gray-800 rounded p-2 text-center">
            <p className="text-cyan-400 text-lg font-orbitron font-bold">P{phase}</p>
            <p className="text-xs text-gray-500">Phase</p>
          </div>
        </div>

        {/* Quête urgente */}
        {queteUrgente && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.05, 1] }}
            transition={{ duration: 0.5 }}
            className="mb-4">
            <SystemWindow title="⚡ QUÊTE URGENTE — XP x2" urgent className="w-full">
              <p className="text-white text-sm leading-relaxed">{queteUrgente.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gold text-xs font-orbitron">+{queteUrgente.xp_recompense * 2} XP</span>
                <Link href="/seance"
                  className="px-4 py-1.5 bg-red-800 border border-red-500 text-white text-xs font-orbitron uppercase rounded hover:bg-red-700">
                  Relever le défi
                </Link>
              </div>
            </SystemWindow>
          </motion.div>
        )}

        {/* Quête du jour */}
        {isOff ? (
          <SystemWindow title="JOUR DE REPOS" className="w-full mb-4">
            <p className="text-gray-400 text-sm text-center">
              Le Système t'accorde du repos aujourd'hui, Chasseuse.
              <br />Récupère. Demain, la quête reprend.
            </p>
          </SystemWindow>
        ) : (
          <SystemWindow title="QUÊTE DU JOUR" className="w-full mb-4">
            <div className="space-y-2">
              {seanceComplete ? (
                <div className="text-center py-2">
                  <p className="text-green-400 font-orbitron text-sm">✓ QUÊTE COMPLÈTE</p>
                  <p className="text-gray-400 text-xs mt-1">+{sessionToday?.xp_gagne || 0} XP gagnés</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-300 text-sm">Ta séance t'attend, Chasseuse.</p>
                  <div className="flex gap-1 text-xs text-gray-500">
                    <span className="text-violet-400">⚔</span> Pompes ·
                    <span className="text-cyan-400">▲</span> Abdos ·
                    <span className="text-blue-400">◆</span> Squats ·
                    <span className="text-orange-400">🏃</span> Course
                  </div>
                  <Link href="/seance"
                    className="block w-full text-center py-3 mt-2 bg-violet-800 border border-violet-500 text-white font-orbitron uppercase tracking-wider rounded pulse-glow hover:bg-violet-700">
                    Commencer la quête
                  </Link>
                </>
              )}
            </div>
          </SystemWindow>
        )}

        {/* Dernière course Strava */}
        {derniereCourse && (
          <SystemWindow title="DERNIÈRE COURSE" className="w-full mb-4">
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-orange-400 font-orbitron text-sm">{formatDistance(Number(derniereCourse.distance_m))}</p>
                  <p className="text-xs text-gray-500">Distance</p>
                </div>
                <div>
                  <p className="text-cyan-400 font-orbitron text-sm">{formatAllure(Number(derniereCourse.allure_moyenne))}</p>
                  <p className="text-xs text-gray-500">Allure</p>
                </div>
                <div>
                  <p className="text-violet-400 font-orbitron text-sm">{formatDuration(Number(derniereCourse.duree_secondes))}</p>
                  <p className="text-xs text-gray-500">Durée</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1 pt-2 border-t border-gray-800">
                <div className="w-4 h-4 rounded-full bg-[#FC4C02] flex-shrink-0" />
                <p className="text-xs text-gray-500">Données fournies par Strava</p>
                {stravaAthleteId && (
                  <a href={`https://www.strava.com/athletes/${stravaAthleteId}`}
                    target="_blank" rel="noopener noreferrer"
                    className="ml-auto text-xs text-[#FC4C02] underline">
                    Voir profil
                  </a>
                )}
              </div>
            </div>
          </SystemWindow>
        )}

        {/* Courses cette semaine */}
        {coursesWeek.length > 0 && (
          <div className="mb-4 bg-gray-900 bg-opacity-80 border border-gray-800 rounded p-3">
            <p className="text-xs text-gray-400 font-orbitron uppercase tracking-wider mb-2">
              Courses cette semaine: {coursesWeek.length}/6
            </p>
            <div className="flex gap-1">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i}
                  className={`flex-1 h-2 rounded-full ${i < coursesWeek.length ? 'bg-orange-500' : 'bg-gray-800'}`}
                  style={i < coursesWeek.length ? { boxShadow: '0 0 4px #f97316' } : {}} />
              ))}
            </div>
          </div>
        )}

        {/* Tracker eau */}
        <div className="mb-4 bg-gray-900 bg-opacity-80 border border-gray-800 rounded p-3">
          <WaterTracker glasses={eau} target={targetEau} onAdd={addEau} />
        </div>

        {/* Connexion Strava manquante */}
        {!stravaConnected && (
          <div className="mb-4 bg-gray-900 bg-opacity-80 border border-orange-900 rounded p-3">
            <p className="text-xs text-orange-400 font-orbitron uppercase tracking-wider mb-2">
              Strava non connecté
            </p>
            <p className="text-xs text-gray-400 mb-2">
              Connecte Strava pour importer tes courses automatiquement.
            </p>
            <a href="/api/strava/auth"
              className="block w-full text-center py-2 bg-[#FC4C02] text-white text-xs font-orbitron uppercase rounded">
              Connecter Strava
            </a>
          </div>
        )}

        {/* Son toggle */}
        <div className="mb-20 flex justify-center">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sons_actifs: !soundEnabled }),
              });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded border text-xs font-orbitron uppercase tracking-wider transition-colors ${soundEnabled ? 'border-violet-500 text-violet-400' : 'border-gray-700 text-gray-600'}`}>
            {soundEnabled ? '🔊 Sons actifs' : '🔇 Sons désactivés'}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default function DashboardClient(props: DashboardClientProps) {
  const [soundEnabled, setSoundEnabled] = useState(props.sonsActifs);
  return (
    <SoundProvider enabled={soundEnabled} onToggle={setSoundEnabled}>
      <DashboardInner {...props} />
    </SoundProvider>
  );
}
