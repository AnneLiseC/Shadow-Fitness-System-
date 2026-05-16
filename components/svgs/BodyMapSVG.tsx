'use client';
import { useState } from 'react';

interface MuscleGroup {
  id: string;
  label: string;
  pathFront?: string;
  pathBack?: string;
  primary?: string[];
  secondary?: string[];
}

const MUSCLES: MuscleGroup[] = [
  {
    id: 'pectoraux',
    label: 'Pectoraux',
    pathFront: 'M82,105 Q100,112 118,105 L115,128 Q100,133 85,128 Z',
    primary: ['pompes'],
    secondary: ['renforcement'],
  },
  {
    id: 'epaules',
    label: 'Épaules',
    pathFront: 'M70,108 Q80,102 85,115 Q78,120 70,118 Z M115,108 Q120,102 130,108 Q130,118 122,120 Q120,112 115,108 Z',
    primary: ['pompes'],
    secondary: ['renforcement'],
  },
  {
    id: 'biceps',
    label: 'Biceps',
    pathFront: 'M63,120 Q70,118 73,140 Q68,142 63,140 Z M127,120 Q130,118 137,120 Q137,140 132,142 Q129,140 127,120 Z',
    secondary: ['pompes'],
  },
  {
    id: 'abdominaux',
    label: 'Abdominaux',
    pathFront: 'M84,130 Q100,136 116,130 L114,185 Q100,190 86,185 Z',
    primary: ['abdos'],
  },
  {
    id: 'quadriceps',
    label: 'Quadriceps',
    pathFront: 'M83,198 Q92,195 97,250 Q88,252 82,250 Z M103,195 Q108,195 118,198 Q118,250 112,252 Q107,250 103,195 Z',
    primary: ['squats', 'course'],
    secondary: [],
  },
  {
    id: 'mollets',
    label: 'Mollets',
    pathFront: 'M85,255 Q92,252 94,280 Q88,282 84,280 Z M106,252 Q112,252 115,255 Q116,280 112,282 Q108,280 106,252 Z',
    primary: ['course'],
  },
  {
    id: 'dorsaux',
    label: 'Dorsaux',
    pathBack: 'M82,105 Q100,110 118,105 L116,170 Q100,175 84,170 Z',
    secondary: ['pompes'],
  },
  {
    id: 'fessiers',
    label: 'Fessiers',
    pathBack: 'M83,185 Q100,188 117,185 L115,210 Q100,215 85,210 Z',
    primary: ['squats', 'course'],
  },
  {
    id: 'ischio',
    label: 'Ischio-jambiers',
    pathBack: 'M84,212 Q93,210 97,255 Q88,258 83,255 Z M103,210 Q108,210 116,212 Q117,255 112,258 Q108,255 103,210 Z',
    primary: ['squats'],
    secondary: ['course'],
  },
];

interface BodyMapSVGProps {
  activeExercices?: string[];
  size?: number;
}

export default function BodyMapSVG({ activeExercices = [], size = 200 }: BodyMapSVGProps) {
  const [view, setView] = useState<'front' | 'back'>('front');

  function getMuscleColor(muscle: MuscleGroup): string {
    const isPrimary = muscle.primary?.some(e => activeExercices.includes(e));
    const isSecondary = muscle.secondary?.some(e => activeExercices.includes(e));
    if (isPrimary) return '#06b6d4';
    if (isSecondary) return '#7c3aed';
    return '#374151';
  }

  function getMuscleOpacity(muscle: MuscleGroup): number {
    const isPrimary = muscle.primary?.some(e => activeExercices.includes(e));
    const isSecondary = muscle.secondary?.some(e => activeExercices.includes(e));
    if (isPrimary) return 0.85;
    if (isSecondary) return 0.5;
    return 0.3;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Toggle */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setView('front')}
          className={`px-3 py-1 text-xs rounded border ${view === 'front' ? 'border-cyan-400 text-cyan-400' : 'border-gray-600 text-gray-500'}`}>
          Face
        </button>
        <button
          onClick={() => setView('back')}
          className={`px-3 py-1 text-xs rounded border ${view === 'back' ? 'border-cyan-400 text-cyan-400' : 'border-gray-600 text-gray-500'}`}>
          Dos
        </button>
      </div>

      <svg width={size} height={size * 1.4} viewBox="0 0 200 280">
        <defs>
          <filter id="muscleGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Silhouette de base féminine */}
        <g opacity="0.4" stroke="#4b5563" strokeWidth="1" fill="none">
          <ellipse cx="100" cy="70" rx="22" ry="25" />
          <path d="M78 90 Q65 95 62 140 L68 140 Q72 115 80 110" />
          <path d="M122 90 Q135 95 138 140 L132 140 Q128 115 120 110" />
          <path d="M80 110 L85 190 L95 190 L100 140 L105 190 L115 190 L120 110" />
          <path d="M85 190 L83 255 L90 255 L95 220 L100 255 L105 220 L110 255 L117 255 L115 190" />
        </g>

        {/* Muscles actifs */}
        {MUSCLES.filter(m => view === 'front' ? m.pathFront : m.pathBack).map(muscle => {
          const path = view === 'front' ? muscle.pathFront : muscle.pathBack;
          if (!path) return null;
          const color = getMuscleColor(muscle);
          const opacity = getMuscleOpacity(muscle);
          return (
            <path key={muscle.id} d={path} fill={color} opacity={opacity}
              filter={opacity > 0.4 ? "url(#muscleGlow)" : undefined}>
              {opacity > 0.4 && (
                <animate attributeName="opacity" values={`${opacity*0.7};${opacity};${opacity*0.7}`}
                  dur="2s" repeatCount="indefinite" />
              )}
            </path>
          );
        })}
      </svg>

      {/* Légende */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-cyan-400" />
          <span className="text-gray-400">Principal</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span className="text-gray-400">Secondaire</span>
        </div>
      </div>
    </div>
  );
}
