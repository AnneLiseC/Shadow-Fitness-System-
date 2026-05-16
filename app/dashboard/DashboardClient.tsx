"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import type { Grade } from "@/lib/grades";
import { GRADE_TITLES, GRADE_COLORS, getXPForNextGrade, getXPProgress } from "@/lib/grades";
import { formatDistance, formatAllure, formatDuration } from "@/lib/utils";
import AvatarSVG from "@/components/svgs/AvatarSVG";
import CrystalSVG from "@/components/svgs/CrystalSVG";
import ShadowsSilhouettes from "@/components/svgs/ShadowsSilhouettes";
import SystemWindow from "@/components/ui/SystemWindow";
import WaterTracker from "@/components/ui/WaterTracker";
import BottomNav from "@/components/ui/BottomNav";
import { SoundProvider, useSound } from "@/components/ui/SoundManager";
import Countdown from "react-countdown";
import { toZonedTime } from "date-fns-tz";
import toast from "react-hot-toast";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface DashboardClientProps {
  prenom: string;
  grade: Grade;
  xp: number;
  streak: number;
  streakRecord: number;
  sonsActifs: boolean;
  isOff: boolean;
  sessionToday: {
    id: string;
    statut: string;
    completion_pct: number;
    xp_gagne: number;
  } | null;
  derniereCourse: {
    date: string;
    distance_m: number;
    duree_secondes: number;
    allure_moyenne: number;
  } | null;
  coursesWeek: { date: string; distance_m: number }[];
  stravaConnected: boolean;
  stravaAthleteId?: number;
  totalEau: number;
  queteUrgente: {
    id: string;
    description: string;
    xp_recompense: number;
    expire_at: string;
  } | null;
  phase: number;
}

function getTodayDeadline() {
  const now = toZonedTime(new Date(), "Europe/Paris");
  const deadline = new Date(now);
  deadline.setHours(23, 59, 59, 999);
  return deadline;
}

function DashboardInner(props: DashboardClientProps) {
  const {
    prenom, grade, xp, streak, streakRecord, sonsActifs, isOff,
    sessionToday, derniereCourse, coursesWeek, stravaConnected,
    stravaAthleteId, totalEau, queteUrgente, phase,
  } = props;

  const [soundEnabled, setSoundEnabled] = useState(sonsActifs);
  const { play } = useSound();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const silhouetteRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // ── Zustand sync ──────────────────────────────────────────────
  useEffect(() => {
    useAppStore.setState({
      prenom,
      grade,
      xp,
      xpProchain: getXPForNextGrade(grade),
      streak,
      streakRecord,
      phase,
      verresEau: totalEau,
    });
  }, [prenom, grade, xp, streak, streakRecord, phase, totalEau]);

  const { verresEau, addVerre } = useAppStore();

  // ── React Query mutation — eau ─────────────────────────────────
  const { mutate: logEau } = useMutation({
    mutationFn: () =>
      fetch("/api/nutrition/eau", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verres: 1 }),
      }).then((r) => r.json()),
    onMutate: () => {
      addVerre();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profil"] });
      if (verresEau + 1 >= 10) {
        toast("💧 Objectif hydratation atteint !", {
          style: { background: "#0a0a1a", color: "#06b6d4", border: "1px solid #7c3aed" },
        });
      }
    },
  });

  // ── GSAP animations ───────────────────────────────────────────
  useGSAP(() => {
    // Avatar respiration
    if (avatarRef.current) {
      gsap.to(avatarRef.current, {
        y: 4,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
    // Silhouettes fond
    gsap.to(".silhouette", {
      x: 30,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 2,
      opacity: 0.03,
    });
    // Crystal glow
    gsap.to(".grade-crystal", {
      filter: "drop-shadow(0 0 20px #7c3aed)",
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });

  // ── Confetti séance complète ──────────────────────────────────
  const seanceComplete = sessionToday?.statut === "complete";
  useEffect(() => {
    if (seanceComplete) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [seanceComplete]);

  const gradeColor = GRADE_COLORS[grade];
  const gradeTitle = GRADE_TITLES[grade];
  const targetEau = 10;
  const xpPct = getXPProgress(xp, grade);
  const xpProchain = getXPForNextGrade(grade);

  // ── Portail quête urgente ─────────────────────────────────────
  function animatePortal() {
    gsap
      .timeline()
      .to("body", { keyframes: { x: [-3, 3, -3, 3, 0] }, duration: 0.4 })
      .to(".portal-overlay", { opacity: 1, duration: 0.3 }, "-=0.1");
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Confetti level up / séance complète */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          colors={["#7c3aed", "#06b6d4", "#f59e0b", "#ffffff"]}
          numberOfPieces={200}
          recycle={false}
          gravity={0.2}
          style={{ position: "fixed", zIndex: 100 }}
        />
      )}

      {/* Overlay portail (caché par défaut) */}
      <div
        className="portal-overlay fixed inset-0 z-40 pointer-events-none"
        style={{ opacity: 0, background: "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)" }}
      />

      <ShadowsSilhouettes />

      <div className="relative z-10 pt-12 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2"
        >
          <p className="text-xs text-gray-500 font-orbitron uppercase tracking-widest mb-1">
            Système d&apos;Éveil
          </p>
          <h1
            className="font-orbitron text-lg font-bold"
            style={{ color: gradeColor, textShadow: `0 0 12px ${gradeColor}` }}
          >
            {prenom} — Chasseuse Rang {grade}
          </h1>
          <p className="text-xs text-gray-400 font-rajdhani">{gradeTitle}</p>
        </motion.div>

        {/* Countdown deadline */}
        {!seanceComplete && !isOff && (
          <div className="flex justify-center mb-3">
            <div className="bg-gray-950 border border-red-900 rounded px-3 py-1.5 flex items-center gap-2">
              <span className="text-red-500 text-xs">⏳</span>
              <Countdown
                date={getTodayDeadline()}
                renderer={({ hours, minutes, seconds }) => (
                  <span className="font-orbitron text-xs text-red-400">
                    {String(hours).padStart(2, "0")}h{" "}
                    {String(minutes).padStart(2, "0")}m{" "}
                    {String(seconds).padStart(2, "0")}s
                  </span>
                )}
              />
              <span className="text-xs text-gray-600">avant 23h59</span>
            </div>
          </div>
        )}

        {/* Avatar + XP circulaire + Cristal */}
        <div className="flex items-center justify-center gap-4 my-4">
          {/* Avatar avec animation respiration */}
          <div ref={avatarRef} className="avatar-container">
            <AvatarSVG grade={grade} size={120} idle />
          </div>

          {/* XP circulaire */}
          <div className="flex flex-col items-center gap-2">
            <div style={{ width: 100, height: 100 }}>
              <CircularProgressbar
                value={xpPct}
                text={`${xpPct}%`}
                styles={buildStyles({
                  pathColor: "#06b6d4",
                  textColor: "#06b6d4",
                  trailColor: "#1a1a3e",
                  pathTransitionDuration: 1.5,
                  textSize: "18px",
                })}
              />
            </div>
            <p className="text-xs text-gray-500 font-rajdhani text-center">
              {xp.toLocaleString()} / {xpProchain.toLocaleString()} XP
            </p>
          </div>

          {/* Cristal */}
          <div className="grade-crystal flex flex-col items-center gap-1">
            <CrystalSVG grade={grade} size={70} />
            <p className="font-orbitron text-lg font-bold" style={{ color: gradeColor }}>
              {grade}
            </p>
          </div>
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
            className="mb-4"
            onAnimationComplete={animatePortal}
          >
            <SystemWindow title="⚡ QUÊTE URGENTE — XP x2" urgent className="w-full">
              <p className="text-white text-sm leading-relaxed">{queteUrgente.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gold text-xs font-orbitron">
                  +{queteUrgente.xp_recompense * 2} XP
                </span>
                <Link
                  href="/seance"
                  className="px-4 py-1.5 bg-red-800 border border-red-500 text-white text-xs font-orbitron uppercase rounded hover:bg-red-700"
                >
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
              Le Système t&apos;accorde du repos aujourd&apos;hui, Chasseuse.
              <br />
              Récupère. Demain, la quête reprend.
            </p>
          </SystemWindow>
        ) : (
          <SystemWindow title="QUÊTE DU JOUR" className="w-full mb-4 glow-element">
            <div className="space-y-2">
              {seanceComplete ? (
                <div className="text-center py-2">
                  <p className="text-green-400 font-orbitron text-sm">✓ QUÊTE COMPLÈTE</p>
                  <p className="text-gray-400 text-xs mt-1">
                    +{sessionToday?.xp_gagne || 0} XP gagnés
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-300 text-sm">Ta séance t&apos;attend, Chasseuse.</p>
                  <div className="flex gap-1 text-xs text-gray-500">
                    <span className="text-violet-400">⚔</span> Pompes ·
                    <span className="text-cyan-400">▲</span> Abdos ·
                    <span className="text-blue-400">◆</span> Squats ·
                    <span className="text-orange-400">🏃</span> Course
                  </div>
                  <Link
                    href="/seance"
                    className="block w-full text-center py-3 mt-2 bg-violet-800 border border-violet-500 text-white font-orbitron uppercase tracking-wider rounded pulse-glow hover:bg-violet-700"
                  >
                    Commencer la quête
                  </Link>
                </>
              )}
            </div>
          </SystemWindow>
        )}

        {/* Dernière course */}
        {derniereCourse && (
          <SystemWindow title="DERNIÈRE COURSE" className="w-full mb-4">
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-orange-400 font-orbitron text-sm">
                    {formatDistance(Number(derniereCourse.distance_m))}
                  </p>
                  <p className="text-xs text-gray-500">Distance</p>
                </div>
                <div>
                  <p className="text-cyan-400 font-orbitron text-sm">
                    {formatAllure(Number(derniereCourse.allure_moyenne))}
                  </p>
                  <p className="text-xs text-gray-500">Allure</p>
                </div>
                <div>
                  <p className="text-violet-400 font-orbitron text-sm">
                    {formatDuration(Number(derniereCourse.duree_secondes))}
                  </p>
                  <p className="text-xs text-gray-500">Durée</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1 pt-2 border-t border-gray-800">
                <div className="w-4 h-4 rounded-full bg-[#FC4C02] flex-shrink-0" />
                <p className="text-xs text-gray-500">Données Strava</p>
                {stravaAthleteId && (
                  <a
                    href={`https://www.strava.com/athletes/${stravaAthleteId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs text-[#FC4C02] underline"
                  >
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
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${i < coursesWeek.length ? "bg-orange-500" : "bg-gray-800"}`}
                  style={i < coursesWeek.length ? { boxShadow: "0 0 4px #f97316" } : {}}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tracker eau via Zustand + React Query */}
        <div className="mb-4 bg-gray-900 bg-opacity-80 border border-gray-800 rounded p-3">
          <WaterTracker
            glasses={verresEau}
            target={targetEau}
            onAdd={() => logEau()}
          />
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
            <a
              href="/api/strava/auth"
              className="block w-full text-center py-2 bg-[#FC4C02] text-white text-xs font-orbitron uppercase rounded"
            >
              Connecter Strava
            </a>
          </div>
        )}

        {/* Son toggle */}
        <div className="mb-20 flex justify-center">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sons_actifs: !soundEnabled }),
              });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded border text-xs font-orbitron uppercase tracking-wider transition-colors ${soundEnabled ? "border-violet-500 text-violet-400" : "border-gray-700 text-gray-600"}`}
          >
            {soundEnabled ? "🔊 Sons actifs" : "🔇 Sons désactivés"}
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
