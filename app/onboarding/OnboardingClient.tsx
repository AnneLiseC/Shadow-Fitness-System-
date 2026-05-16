'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PortalSVG from '@/components/svgs/PortalSVG';
import RunesBg from '@/components/svgs/RunesBg';
import SystemWindow from '@/components/ui/SystemWindow';

type Step = 'welcome' | 'profile' | 'pwa' | 'notifications' | 'strava' | 'complete';

export default function OnboardingClient() {
  const [step, setStep] = useState<Step>('welcome');
  const [prenom, setPrenom] = useState('Anne-Lise');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleProfile() {
    setLoading(true);
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom }),
      });
      setStep('pwa');
    } finally {
      setLoading(false);
    }
  }

  async function requestNotifications() {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        await registerPushSubscription();
      }
    }
    setStep('strava');
  }

  async function registerPushSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
    } catch {
      // Push not available
    }
  }

  const steps = {
    welcome: (
      <motion.div key="welcome" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center gap-8 text-center px-6">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <PortalSVG size={180} active />
        </motion.div>
        <SystemWindow title="SYSTÈME D'ÉVEIL DÉTECTÉ" className="w-full max-w-sm">
          <div className="space-y-3 text-center">
            <p className="text-violet-300 font-orbitron text-xs uppercase tracking-widest">Shadow Fitness System</p>
            <p className="text-gray-300 leading-relaxed">
              Le Système t&apos;a choisie, Chasseuse.<br />Ton éveil commence maintenant.
            </p>
            <p className="text-xs text-gray-500">
              Programme adaptatif Solo Leveling<br />100 pompes / 100 abdos / 100 squats / 10km
            </p>
          </div>
        </SystemWindow>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setStep('profile')}
          className="w-full max-w-xs py-4 bg-violet-700 border border-violet-400 text-white font-orbitron uppercase tracking-widest rounded pulse-glow hover:bg-violet-600 transition-colors">
          Commencer l&apos;Éveil
        </motion.button>
      </motion.div>
    ),

    profile: (
      <motion.div key="profile" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }} className="flex flex-col items-center gap-6 px-6 w-full max-w-sm">
        <SystemWindow title="IDENTITÉ CHASSEUSE" className="w-full">
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">Comment le Système doit-il t&apos;appeler ?</p>
            <div>
              <label className="text-xs text-cyan-400 font-orbitron uppercase tracking-wider block mb-2">Prénom</label>
              <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)}
                className="w-full py-3 px-4 bg-black border border-violet-700 text-white rounded font-rajdhani text-base focus:border-cyan-400 focus:outline-none"
                placeholder="Anne-Lise" />
            </div>
            <div className="text-center py-2">
              <p className="text-violet-400 font-orbitron text-sm">{prenom} — Chasseuse Rang E</p>
              <p className="text-xs text-gray-500 mt-1">Ton éveil commence ici</p>
            </div>
          </div>
        </SystemWindow>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleProfile}
          disabled={loading || !prenom.trim()}
          className="w-full py-4 bg-violet-700 border border-violet-400 text-white font-orbitron uppercase tracking-widest rounded pulse-glow disabled:opacity-50">
          {loading ? '...' : 'Confirmer'}
        </motion.button>
      </motion.div>
    ),

    pwa: (
      <motion.div key="pwa" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }} className="flex flex-col items-center gap-6 px-6 w-full max-w-sm">
        <SystemWindow title="INSTALLATION PWA" className="w-full">
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">Installe Shadow Fitness System sur ton iPhone pour une expérience optimale.</p>
            <div className="bg-gray-900 rounded p-3 space-y-2">
              {[
                ['1.', 'Ouvre ce site dans Safari'],
                ['2.', 'Appuie sur le bouton Partager ↑'],
                ['3.', 'Sélectionne "Sur l\'écran d\'accueil"'],
                ['4.', 'Appuie sur Ajouter'],
              ].map(([num, text]) => (
                <div key={num} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-cyan-400">{num}</span>
                  <span dangerouslySetInnerHTML={{ __html: text }} />
                </div>
              ))}
            </div>
          </div>
        </SystemWindow>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setStep('notifications')}
          className="w-full py-4 bg-violet-700 border border-violet-400 text-white font-orbitron uppercase tracking-widest rounded pulse-glow">
          Continuer
        </motion.button>
      </motion.div>
    ),

    notifications: (
      <motion.div key="notifications" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }} className="flex flex-col items-center gap-6 px-6 w-full max-w-sm">
        <SystemWindow title="ALERTES DU SYSTÈME" className="w-full">
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">Le Système t&apos;envoie des alertes pour tes quêtes, repas et hydratation.</p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-2"><span className="text-violet-400">⚔</span> Rappels d&apos;entraînement</li>
              <li className="flex items-center gap-2"><span className="text-yellow-400">🌀</span> Quêtes urgentes (XP x2)</li>
              <li className="flex items-center gap-2"><span className="text-cyan-400">🍱</span> Rappels repas (optionnel)</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">💧</span> Rappels hydratation</li>
            </ul>
          </div>
        </SystemWindow>
        <motion.button whileTap={{ scale: 0.95 }} onClick={requestNotifications}
          className="w-full py-4 bg-cyan-800 border border-cyan-400 text-white font-orbitron uppercase tracking-widest rounded glow-cyan hover:bg-cyan-700 transition-colors">
          Activer les alertes
        </motion.button>
        <button onClick={() => setStep('strava')} className="text-sm text-gray-500 underline">
          Passer pour l&apos;instant
        </button>
      </motion.div>
    ),

    strava: (
      <motion.div key="strava" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }} className="flex flex-col items-center gap-6 px-6 w-full max-w-sm">
        <SystemWindow title="CONNEXION STRAVA" className="w-full">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FC4C02] flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <p className="text-white font-rajdhani font-semibold">Strava</p>
                <p className="text-xs text-gray-400">Import automatique de tes courses</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Connecte Strava pour que le Système importe automatiquement tes courses et valide ta progression.
            </p>
            <p className="text-xs text-gray-500">Tu peux connecter Strava plus tard dans les Paramètres.</p>
          </div>
        </SystemWindow>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => window.location.href = '/api/strava/auth'}
          className="w-full py-4 bg-[#FC4C02] text-white font-orbitron uppercase tracking-widest rounded hover:bg-[#e34400] transition-colors">
          Connecter Strava
        </motion.button>
        <button onClick={() => setStep('complete')} className="text-sm text-gray-500 underline">
          Passer, connecter plus tard
        </button>
      </motion.div>
    ),

    complete: (
      <motion.div key="complete" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }} className="flex flex-col items-center gap-8 text-center px-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, ease: 'easeOut' }}>
          <PortalSVG size={160} active />
        </motion.div>
        <SystemWindow title="ÉVEIL CONFIRMÉ" className="w-full max-w-sm">
          <div className="text-center space-y-3">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-cyan-400 font-orbitron uppercase tracking-widest text-sm">
              ÉVEIL DÉTECTÉ
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="text-white text-base leading-relaxed">
              {prenom} est passée au rang E.<br />Ta quête commence maintenant.
            </motion.p>
          </div>
        </SystemWindow>
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          whileTap={{ scale: 0.95 }} onClick={() => router.push('/dashboard')}
          className="w-full max-w-xs py-4 bg-violet-700 border border-violet-400 text-white font-orbitron uppercase tracking-widest rounded pulse-glow">
          Entrer dans le Système
        </motion.button>
      </motion.div>
    ),
  };

  const stepOrder: Step[] = ['welcome', 'profile', 'pwa', 'notifications', 'strava', 'complete'];
  const currentIdx = stepOrder.indexOf(step);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <RunesBg />
      <div className="absolute top-12 left-0 right-0 flex justify-center gap-2 z-10">
        {stepOrder.map((s, i) => (
          <div key={s} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i <= currentIdx ? 'bg-violet-500' : 'bg-gray-800'}`} />
        ))}
      </div>
      <div className="w-full max-w-md px-4 z-10">
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
      </div>
    </div>
  );
}
