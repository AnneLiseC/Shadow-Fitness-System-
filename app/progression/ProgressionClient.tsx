"use client";
import { motion } from "motion/react";
import type { Grade } from "@/lib/grades";
import { GRADE_COLORS } from "@/lib/grades";
import { formatDistance, formatAllure } from "@/lib/utils";
import SystemWindow from "@/components/ui/SystemWindow";
import BottomNav from "@/components/ui/BottomNav";
import RunesBg from "@/components/svgs/RunesBg";
import CrystalSVG from "@/components/svgs/CrystalSVG";
import XPBar from "@/components/ui/XPBar";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const EXO_LABELS: Record<string, string> = {
  pompes: "Pompes",
  abdos: "Abdominaux",
  squats: "Squats",
  poignets: "Renforcement poignets",
};

const tooltipStyle = {
  backgroundColor: "#0a0a1a",
  border: "1px solid #7c3aed",
  color: "#06b6d4",
  fontFamily: "var(--font-rajdhani), sans-serif",
  fontSize: "12px",
};

interface ProgressionClientProps {
  prenom: string;
  grade: Grade;
  xp: number;
  streak: number;
  streakRecord: number;
  phase: number;
  sessions: {
    date: string;
    completion_pct: number;
    xp_gagne: number;
    statut: string;
  }[];
  courses: {
    date: string;
    distance_m: number;
    allure_moyenne: number;
  }[];
  douleurs: { date: string; exercice: string; intensite: number }[];
  progressions: {
    type_exercice: string;
    niveau_actuel: number;
    date_derniere_progression: string;
  }[];
  stravaAthleteId?: number;
}

const SESSIONS_FICTIVES = [
  { date: "2026-05-09", completion_pct: 80, xp_gagne: 40, statut: "complete" },
  { date: "2026-05-10", completion_pct: 100, xp_gagne: 50, statut: "complete" },
  { date: "2026-05-11", completion_pct: 60, xp_gagne: 30, statut: "partiel" },
  { date: "2026-05-12", completion_pct: 100, xp_gagne: 50, statut: "complete" },
  { date: "2026-05-13", completion_pct: 0, xp_gagne: 0, statut: "manquee" },
  { date: "2026-05-14", completion_pct: 90, xp_gagne: 45, statut: "complete" },
  { date: "2026-05-15", completion_pct: 100, xp_gagne: 50, statut: "complete" },
];

export default function ProgressionClient({
  prenom,
  grade,
  xp,
  streak,
  streakRecord,
  phase,
  sessions,
  courses,
  douleurs,
  progressions,
  stravaAthleteId,
}: ProgressionClientProps) {
  const gradeColor = GRADE_COLORS[grade];

  const displaySessions = sessions.length > 0 ? sessions : SESSIONS_FICTIVES;
  const completedSessions = displaySessions.filter(
    (s) => s.statut === "complete"
  ).length;

  const sessionChartData = displaySessions.slice(-14).map((s) => ({
    date: new Date(s.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    }),
    xp: s.xp_gagne,
    completion: s.completion_pct,
  }));

  const coursesChartData = courses.slice(0, 7).reverse().map((c) => ({
    date: new Date(c.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    }),
    km: Math.round(Number(c.distance_m) / 100) / 10,
    allure: Math.round(Number(c.allure_moyenne)),
  }));

  const isEmpty = sessions.length === 0;

  return (
    <div className="min-h-screen bg-black relative">
      <RunesBg />

      <div className="relative z-10 pt-12 px-4 safe-bottom">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="font-orbitron text-base uppercase tracking-widest text-cyan-400">
            Progression
          </h1>
          <p className="text-xs text-gray-500">
            {prenom} — Phase {phase}
          </p>
        </div>

        {/* Crystal + Grade */}
        <div className="flex justify-center mb-4">
          <div className="flex flex-col items-center gap-2">
            <CrystalSVG grade={grade} size={80} />
            <p className="font-orbitron text-lg" style={{ color: gradeColor }}>
              Rang {grade}
            </p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-4">
          <XPBar xp={xp} grade={grade} />
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-900 border border-gray-800 rounded p-2 text-center">
            <p className="text-cyan-400 font-orbitron text-lg">
              {completedSessions}
            </p>
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

        {/* Message état vide */}
        {isEmpty && (
          <div className="mb-4 p-3 border border-violet-900 rounded bg-violet-950 bg-opacity-30">
            <p className="text-violet-400 text-xs font-rajdhani italic text-center">
              Aucune donnée encore, Chasseuse. Lance ta première quête.
            </p>
          </div>
        )}

        {/* Graphique XP / séances (14 derniers jours) */}
        <SystemWindow title="XP — 14 DERNIERS JOURS" className="w-full mb-4">
          {sessionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={sessionChartData}>
                <defs>
                  <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3e" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fontSize: 9 }}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="#06b6d4"
                  fill="url(#gradCyan)"
                  strokeWidth={2}
                  name="XP"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-xs text-center py-8 italic">
              Aucune donnée encore, Chasseuse. Lance ta première quête.
            </p>
          )}
        </SystemWindow>

        {/* Niveaux exercices */}
        <SystemWindow title="NIVEAUX EXERCICES" className="w-full mb-4">
          <div className="space-y-3">
            {progressions.length > 0 ? (
              progressions.map((p) => {
                const maxLevel =
                  p.type_exercice === "pompes"
                    ? 16
                    : p.type_exercice === "abdos"
                      ? 8
                      : p.type_exercice === "squats"
                        ? 5
                        : 3;
                const pct = Math.round((p.niveau_actuel / maxLevel) * 100);
                return (
                  <div key={p.type_exercice}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">
                        {EXO_LABELS[p.type_exercice] || p.type_exercice}
                      </span>
                      <span className="text-violet-400">
                        Niv. {p.niveau_actuel}/{maxLevel}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.2 }}
                        className="h-full rounded-full bg-violet-600"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-600 text-xs italic text-center py-2">
                Commence ta première séance pour débloquer les niveaux.
              </p>
            )}
          </div>
        </SystemWindow>

        {/* Objectif final */}
        <SystemWindow title="OBJECTIF FINAL 18-24 MOIS" className="w-full mb-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "100 Pompes",
                current:
                  progressions.find((p) => p.type_exercice === "pompes")
                    ?.niveau_actuel || 1,
                max: 16,
              },
              {
                label: "100 Abdos",
                current:
                  progressions.find((p) => p.type_exercice === "abdos")
                    ?.niveau_actuel || 1,
                max: 8,
              },
              {
                label: "100 Squats",
                current:
                  progressions.find((p) => p.type_exercice === "squats")
                    ?.niveau_actuel || 1,
                max: 5,
              },
              { label: "10km Course", current: courses.length, max: 50 },
            ].map((obj) => (
              <div key={obj.label} className="bg-gray-900 rounded p-2">
                <p className="text-xs text-gray-400 mb-1">{obj.label}</p>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{
                      width: `${Math.min((obj.current / obj.max) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {Math.min(Math.round((obj.current / obj.max) * 100), 100)}%
                </p>
              </div>
            ))}
          </div>
        </SystemWindow>

        {/* Graphique courses Strava */}
        {courses.length > 0 && (
          <SystemWindow title="COURSES — DISTANCE (km)" className="w-full mb-4">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={coursesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3e" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fontSize: 9 }}
                />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 9 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`${v} km`, "Distance"]}
                />
                <Bar
                  dataKey="km"
                  fill="#7c3aed"
                  radius={[2, 2, 0, 0]}
                  name="Distance"
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-800 mt-2">
              <div className="w-4 h-4 rounded-full bg-[#FC4C02] flex-shrink-0" />
              <p className="text-xs text-gray-500">Données Strava</p>
              {stravaAthleteId && (
                <a
                  href={`https://www.strava.com/athletes/${stravaAthleteId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-[#FC4C02] underline"
                >
                  Voir profil ↗
                </a>
              )}
            </div>
          </SystemWindow>
        )}

        {/* Heatmap activité style GitHub */}
        <SystemWindow title="HEATMAP ACTIVITÉ" className="w-full mb-4">
          <div className="grid grid-flow-col grid-rows-7 gap-0.5">
            {Array.from({ length: 28 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (27 - i));
              const dateStr = d.toISOString().split("T")[0];
              const session = displaySessions.find((s) => s.date === dateStr);
              const intensity = session
                ? session.completion_pct >= 100
                  ? 4
                  : session.completion_pct >= 75
                    ? 3
                    : session.completion_pct >= 50
                      ? 2
                      : 1
                : 0;
              const colors = [
                "#111827",
                "#4c1d95",
                "#6d28d9",
                "#7c3aed",
                "#06b6d4",
              ];
              return (
                <div
                  key={i}
                  className="w-4 h-4 rounded-sm"
                  style={{ background: colors[intensity] }}
                  title={`${dateStr}: ${session?.completion_pct || 0}%`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
            <span>Moins</span>
            {["#111827", "#4c1d95", "#6d28d9", "#7c3aed", "#06b6d4"].map(
              (c) => (
                <div
                  key={c}
                  className="w-3 h-3 rounded-sm"
                  style={{ background: c }}
                />
              )
            )}
            <span>Plus</span>
          </div>
        </SystemWindow>

        {/* Historique douleurs */}
        {douleurs.length > 0 && (
          <SystemWindow
            title="HISTORIQUE DOULEURS"
            className="w-full mb-6"
          >
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-2">
                Signalements récents poignets
              </p>
              {douleurs.slice(0, 5).map((d, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    {new Date(d.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  <span className="text-red-400">
                    {EXO_LABELS[d.exercice] || d.exercice}
                  </span>
                  <span className="text-gray-500">
                    Intensité {d.intensite}/5
                  </span>
                </div>
              ))}
              {douleurs.some((d) => d.exercice === "pompes") && (
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
