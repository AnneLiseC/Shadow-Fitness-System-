'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SystemWindow from '@/components/ui/SystemWindow';
import WaterTracker from '@/components/ui/WaterTracker';
import BottomNav from '@/components/ui/BottomNav';
import RunesBg from '@/components/svgs/RunesBg';

type RepasType = 'petit_dejeuner' | 'dejeuner' | 'collation' | 'diner';

interface Recette {
  id: string;
  nom: string;
  temps_preparation: number;
  calories_approx: number;
  proteines_approx: number;
  glucides_approx: number;
  lipides_approx: number;
  ingredients: string;
  etapes: string;
  type_repas: string;
}

const REPAS_LABELS: Record<RepasType, { label: string; heure: string; icon: string; kcal: number }> = {
  petit_dejeuner: { label: 'Petit-déjeuner', heure: '7h00', icon: '🌅', kcal: 480 },
  dejeuner: { label: 'Déjeuner', heure: '12h00', icon: '🍱', kcal: 530 },
  collation: { label: 'Collation', heure: '18h15', icon: '🔥', kcal: 230 },
  diner: { label: 'Dîner', heure: '20h30', icon: '🌙', kcal: 510 },
};

const REPAS_ORDER: RepasType[] = ['petit_dejeuner', 'dejeuner', 'collation', 'diner'];

interface NutritionClientProps {
  prenom: string;
  recettes: Recette[];
  repasStatuts: Record<string, string>;
  totalEau: number;
}

export default function NutritionClient({ prenom, recettes, repasStatuts, totalEau }: NutritionClientProps) {
  const [statuts, setStatuts] = useState<Record<string, string>>(repasStatuts);
  const [eau, setEau] = useState(totalEau);
  const [activeRecette, setActiveRecette] = useState<Recette | null>(null);
  const [activeRepas, setActiveRepas] = useState<RepasType>('petit_dejeuner');

  const recettesParType = (type: string) => recettes.filter(r => r.type_repas === type);

  const totalKcal = REPAS_ORDER.reduce((sum, repas) => {
    if (statuts[repas] === 'fait') return sum + REPAS_LABELS[repas].kcal;
    return sum;
  }, 0);

  const kcalTarget = 2000;
  const kcalPct = Math.min((totalKcal / kcalTarget) * 100, 100);

  async function toggleRepas(type: RepasType) {
    const newStatut = statuts[type] === 'fait' ? 'pas_fait' : 'fait';
    setStatuts(prev => ({ ...prev, [type]: newStatut }));
    await fetch('/api/nutrition/repas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repas_type: type, statut: newStatut }),
    });
  }

  async function addEau() {
    setEau(e => e + 1);
    await fetch('/api/nutrition/eau', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verres: 1 }),
    });
  }

  return (
    <div className="min-h-screen bg-black relative">
      <RunesBg />

      <div className="relative z-10 pt-12 px-4 safe-bottom">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="font-orbitron text-base uppercase tracking-widest text-cyan-400">
            Nutrition
          </h1>
          <p className="text-xs text-gray-500">{prenom} — Plan alimentaire</p>
        </div>

        {/* Compteur calories */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gold font-orbitron">{totalKcal} kcal</span>
            <span className="text-gray-400">Objectif: {kcalTarget}–2200 kcal</span>
          </div>
          <div className="h-3 bg-gray-900 rounded-full border border-gray-700 overflow-hidden">
            <motion.div
              animate={{ width: `${kcalPct}%` }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
          </div>
          <p className="text-xs text-center text-gray-500 mt-1">
            {totalKcal < 1800 ? '⬇ Trop faible pour la prise de masse' :
              totalKcal > 2400 ? '⬆ Léger surplus' : '✓ Dans la cible'}
          </p>
        </div>

        {/* Tracker eau */}
        <div className="mb-4 bg-gray-900 bg-opacity-80 border border-gray-800 rounded p-3">
          <WaterTracker glasses={eau} target={10} onAdd={addEau} />
        </div>

        {/* Onglets repas */}
        <div className="grid grid-cols-4 gap-1 mb-4">
          {REPAS_ORDER.map(type => (
            <button
              key={type}
              onClick={() => setActiveRepas(type)}
              className={`flex flex-col items-center gap-0.5 py-2 rounded border transition-all ${
                activeRepas === type
                  ? 'border-cyan-500 bg-cyan-950 text-cyan-300'
                  : 'border-gray-800 bg-gray-950 text-gray-500'
              }`}>
              <span className="text-base">{REPAS_LABELS[type].icon}</span>
              <span className="text-xs" style={{ fontSize: '9px' }}>
                {REPAS_LABELS[type].heure}
              </span>
            </button>
          ))}
        </div>

        {/* Détail repas actif */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRepas}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}>
            <SystemWindow title={`${REPAS_LABELS[activeRepas].icon} ${REPAS_LABELS[activeRepas].label} — ${REPAS_LABELS[activeRepas].heure}`} className="w-full mb-4">
              <div className="space-y-3">
                {/* Statut */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">~{REPAS_LABELS[activeRepas].kcal} kcal</span>
                  <button
                    onClick={() => toggleRepas(activeRepas)}
                    className={`px-4 py-1.5 rounded text-xs font-orbitron uppercase border transition-colors ${
                      statuts[activeRepas] === 'fait'
                        ? 'bg-green-900 border-green-600 text-green-300'
                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-violet-600'
                    }`}>
                    {statuts[activeRepas] === 'fait' ? '✓ Fait' : 'Marquer fait'}
                  </button>
                </div>

                {/* Recettes disponibles */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Recettes proposées :</p>
                  <div className="space-y-2">
                    {recettesParType(activeRepas).map(recette => (
                      <div key={recette.id}>
                        <button
                          onClick={() => setActiveRecette(activeRecette?.id === recette.id ? null : recette)}
                          className="w-full text-left p-2.5 bg-black border border-gray-800 rounded hover:border-violet-700 transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-white font-rajdhani">{recette.nom}</span>
                            <span className="text-xs text-gold">{recette.calories_approx} kcal</span>
                          </div>
                          <div className="flex gap-3 mt-1 text-xs text-gray-500">
                            <span>P: {recette.proteines_approx}g</span>
                            <span>G: {recette.glucides_approx}g</span>
                            <span>L: {recette.lipides_approx}g</span>
                            <span>⏱ {recette.temps_preparation}min</span>
                          </div>
                        </button>

                        {/* Détail recette */}
                        <AnimatePresence>
                          {activeRecette?.id === recette.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden">
                              <RecetteDetail recette={recette} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SystemWindow>
          </motion.div>
        </AnimatePresence>

        {/* Planning semaine */}
        <SystemWindow title="PLANNING SEMAINE" className="w-full mb-6">
          <div className="space-y-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((jour, i) => (
              <div key={jour} className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 w-8">{jour}</span>
                <div className="flex-1 grid grid-cols-4 gap-1">
                  {REPAS_ORDER.map(type => {
                    const opts = recettesParType(type);
                    const rec = opts[i % opts.length];
                    return (
                      <div key={type} className="text-xs text-gray-400 truncate">
                        {rec?.nom.split(' ')[0] || '—'}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SystemWindow>
      </div>

      <BottomNav />
    </div>
  );
}

function RecetteDetail({ recette }: { recette: Recette }) {
  let ingredients: string[] = [];
  let etapes: string[] = [];

  try {
    ingredients = typeof recette.ingredients === 'string'
      ? JSON.parse(recette.ingredients)
      : recette.ingredients as unknown as string[];
    etapes = typeof recette.etapes === 'string'
      ? JSON.parse(recette.etapes)
      : recette.etapes as unknown as string[];
  } catch {
    ingredients = [];
    etapes = [];
  }

  return (
    <div className="mt-1 p-3 bg-gray-950 border border-gray-800 rounded space-y-3">
      <div>
        <p className="text-xs text-cyan-400 font-orbitron uppercase tracking-wider mb-1">Ingrédients</p>
        <ul className="space-y-0.5">
          {ingredients.map((ing, i) => (
            <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
              <span className="text-violet-500 flex-shrink-0">•</span>
              {ing}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs text-cyan-400 font-orbitron uppercase tracking-wider mb-1">Préparation</p>
        <ol className="space-y-1">
          {etapes.map((etape, i) => (
            <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
              <span className="text-violet-500 flex-shrink-0">{i + 1}.</span>
              {etape}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-800">
        <span className="text-xs text-green-400">✓ Sans lactose</span>
        <span className="text-xs text-green-400">✓ Sans saumon</span>
      </div>
    </div>
  );
}
