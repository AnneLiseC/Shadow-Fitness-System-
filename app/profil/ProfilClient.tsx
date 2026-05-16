'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStackApp } from '@stackframe/stack';
import type { Grade } from '@/lib/grades';
import { GRADE_COLORS, GRADE_TITLES } from '@/lib/grades';
import AvatarSVG from '@/components/svgs/AvatarSVG';
import CrystalSVG from '@/components/svgs/CrystalSVG';
import SystemWindow from '@/components/ui/SystemWindow';
import BottomNav from '@/components/ui/BottomNav';
import RunesBg from '@/components/svgs/RunesBg';

interface ProfilClientProps {
  prenom: string;
  email: string;
  grade: Grade;
  xp: number;
  streak: number;
  streakRecord: number;
  heureRappel: string;
  sonsActifs: boolean;
  notifsRepas: boolean;
  notifsEau: boolean;
  phase: number;
  stravaConnected: boolean;
  stravaAthleteId?: number;
  totalSessions: number;
  joursActifs: number;
  membreDepuis: string;
}

export default function ProfilClient({
  prenom, email, grade, xp, streak, streakRecord,
  heureRappel, sonsActifs, notifsRepas, notifsEau, phase,
  stravaConnected, stravaAthleteId, totalSessions, membreDepuis
}: ProfilClientProps) {
  const [prenomEdit, setPrenomEdit] = useState(prenom);
  const [heureEdit, setHeureEdit] = useState(heureRappel);
  const [sons, setSons] = useState(sonsActifs);
  const [repas, setRepas] = useState(notifsRepas);
  const [eau, setEau] = useState(notifsEau);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const router = useRouter();
  const app = useStackApp();
  const gradeColor = GRADE_COLORS[grade];

  async function saveSettings() {
    setSaving(true);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prenom: prenomEdit,
        heure_rappel_quotidien: heureEdit,
        sons_actifs: sons,
        notifs_repas_actives: repas,
        notifs_eau_actives: eau,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const membreDate = new Date(membreDepuis).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-black relative">
      <RunesBg />

      <div className="relative z-10 pt-12 px-4 safe-bottom">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="font-orbitron text-base uppercase tracking-widest text-cyan-400">
            Profil Chasseur
          </h1>
        </div>

        {/* Avatar + Info */}
        <div className="flex items-center gap-4 mb-4 p-4 bg-gray-900 bg-opacity-80 border border-gray-800 rounded">
          <AvatarSVG grade={grade} size={100} idle />
          <div className="flex-1">
            <p className="font-orbitron text-base" style={{ color: gradeColor }}>
              {prenom}
            </p>
            <p className="text-xs text-gray-400">Chasseuse Rang {grade}</p>
            <p className="text-xs text-violet-400 mt-0.5">{GRADE_TITLES[grade]}</p>
            <div className="flex items-center gap-2 mt-2">
              <CrystalSVG grade={grade} size={32} />
              <div>
                <p className="text-xs text-gold font-orbitron">{xp.toLocaleString()} XP</p>
                <p className="text-xs text-gray-600">Phase {phase}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { value: totalSessions, label: 'Séances', color: 'text-cyan-400' },
            { value: `🔥 ${streak}`, label: 'Streak', color: 'text-orange-400' },
            { value: streakRecord, label: 'Record', color: 'text-gold' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded p-2 text-center">
              <p className={`font-orbitron text-lg ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Strava */}
        <SystemWindow title="CONNEXION STRAVA" className="w-full mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FC4C02] flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <div>
                <p className="text-sm text-white">Strava</p>
                <p className="text-xs text-gray-500">
                  {stravaConnected ? '✓ Connecté' : 'Non connecté'}
                </p>
              </div>
            </div>
            {stravaConnected ? (
              <a href={`https://www.strava.com/athletes/${stravaAthleteId}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#FC4C02] underline">
                Voir profil ↗
              </a>
            ) : (
              <a href="/api/strava/auth"
                className="px-3 py-1.5 bg-[#FC4C02] text-white text-xs font-orbitron uppercase rounded">
                Connecter
              </a>
            )}
          </div>
        </SystemWindow>

        {/* Paramètres */}
        <SystemWindow title="PARAMÈTRES" className="w-full mb-4">
          <div className="space-y-4">
            {/* Prénom */}
            <div>
              <label className="text-xs text-cyan-400 font-orbitron uppercase block mb-1">Prénom</label>
              <input
                type="text"
                value={prenomEdit}
                onChange={e => setPrenomEdit(e.target.value)}
                className="w-full py-2 px-3 bg-black border border-gray-700 rounded text-white text-sm" />
            </div>

            {/* Heure rappel */}
            <div>
              <label className="text-xs text-cyan-400 font-orbitron uppercase block mb-1">
                Heure rappel séance
              </label>
              <input
                type="time"
                value={heureEdit}
                onChange={e => setHeureEdit(e.target.value)}
                className="py-2 px-3 bg-black border border-gray-700 rounded text-white text-sm" />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {[
                { label: '🔊 Sons', value: sons, onChange: setSons },
                { label: '🍱 Notifs repas', value: repas, onChange: setRepas },
                { label: '💧 Notifs hydratation', value: eau, onChange: setEau },
              ].map(({ label, value, onChange }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{label}</span>
                  <button
                    onClick={() => onChange(!value)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-violet-600' : 'bg-gray-700'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Bouton sauvegarder */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={saveSettings}
              disabled={saving}
              className="w-full py-3 bg-violet-800 border border-violet-500 text-white font-orbitron uppercase tracking-wider rounded hover:bg-violet-700 transition-colors disabled:opacity-50">
              {saved ? '✓ Sauvegardé' : saving ? '...' : 'Sauvegarder'}
            </motion.button>
          </div>
        </SystemWindow>

        {/* Infos compte */}
        <div className="mb-4 bg-gray-900 bg-opacity-80 border border-gray-800 rounded p-3">
          <p className="text-xs text-gray-500">Email: {email}</p>
          <p className="text-xs text-gray-500 mt-1">Membre depuis: {membreDate}</p>
        </div>

        {/* Déconnexion */}
        <button
          onClick={() => app.signOut()}
          className="w-full py-3 mb-6 border border-red-900 text-red-600 font-orbitron uppercase tracking-wider rounded hover:bg-red-950 transition-colors text-sm">
          Déconnexion
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
