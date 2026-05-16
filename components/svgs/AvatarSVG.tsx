'use client';
import { Grade } from '@/lib/grades';

interface AvatarSVGProps {
  grade: Grade;
  size?: number;
  idle?: boolean;
}

const AVATAR_CONFIG: Record<string, { color: string; aura: string; hasArmor: boolean; auraIntensity: number }> = {
  E: { color: '#94a3b8', aura: 'transparent', hasArmor: false, auraIntensity: 0 },
  D: { color: '#22c55e', aura: '#22c55e', hasArmor: false, auraIntensity: 0.2 },
  C: { color: '#7c3aed', aura: '#7c3aed', hasArmor: true, auraIntensity: 0.4 },
  B: { color: '#a855f7', aura: '#a855f7', hasArmor: true, auraIntensity: 0.6 },
  A: { color: '#f59e0b', aura: '#f59e0b', hasArmor: true, auraIntensity: 0.8 },
  S: { color: '#06b6d4', aura: '#06b6d4', hasArmor: true, auraIntensity: 1 },
  National: { color: '#dc2626', aura: '#dc2626', hasArmor: true, auraIntensity: 1 },
  Monarque: { color: '#7c3aed', aura: '#7c3aed', hasArmor: true, auraIntensity: 1 },
};

export default function AvatarSVG({ grade, size = 200, idle = true }: AvatarSVGProps) {
  const cfg = AVATAR_CONFIG[grade] || AVATAR_CONFIG.E;
  const isMonarque = grade === 'Monarque';
  const isNational = grade === 'National';
  const isHighGrade = ['S', 'National', 'Monarque'].includes(grade);

  return (
    <svg width={size} height={size} viewBox="0 0 200 280" fill="none">
      <defs>
        <filter id="avatarGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="auraGrad" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor={cfg.aura} stopOpacity={cfg.auraIntensity * 0.3} />
          <stop offset="100%" stopColor={cfg.aura} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Aura de fond */}
      {cfg.auraIntensity > 0 && (
        <ellipse cx="100" cy="220" rx="70" ry="40" fill={`url(#auraGrad)`}>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Corps de base — silhouette féminine */}
      <g style={idle ? { animation: 'breathe 3s ease-in-out infinite', transformOrigin: '100px 140px' } : {}}>

        {/* Jambes */}
        <rect x="82" y="195" width="16" height="55" rx="6"
          fill={cfg.hasArmor ? '#1e1b4b' : '#374151'} />
        <rect x="102" y="195" width="16" height="55" rx="6"
          fill={cfg.hasArmor ? '#1e1b4b' : '#374151'} />

        {/* Bottes / pieds */}
        <rect x="78" y="242" width="22" height="10" rx="4"
          fill={cfg.hasArmor ? cfg.color : '#1f2937'} />
        <rect x="100" y="242" width="22" height="10" rx="4"
          fill={cfg.hasArmor ? cfg.color : '#1f2937'} />

        {/* Corps / torse */}
        <rect x="75" y="130" width="50" height="68" rx="10"
          fill={cfg.hasArmor ? '#1e1b4b' : '#374151'} />

        {/* Armure torse */}
        {cfg.hasArmor && (
          <path d="M75 140 L100 133 L125 140 L122 165 L100 170 L78 165 Z"
            fill={cfg.color} opacity="0.7" filter="url(#avatarGlow)" />
        )}

        {/* Ceinture */}
        <rect x="74" y="190" width="52" height="8" rx="3"
          fill={cfg.hasArmor ? cfg.color : '#4b5563'} />

        {/* Bras gauche */}
        <rect x="55" y="132" width="20" height="50" rx="8"
          fill={cfg.hasArmor ? '#1e1b4b' : '#374151'} />
        <rect x="53" y="175" width="24" height="12" rx="4"
          fill={cfg.hasArmor ? cfg.color : '#374151'} />

        {/* Bras droit */}
        <rect x="125" y="132" width="20" height="50" rx="8"
          fill={cfg.hasArmor ? '#1e1b4b' : '#374151'} />
        <rect x="123" y="175" width="24" height="12" rx="4"
          fill={cfg.hasArmor ? cfg.color : '#374151'} />

        {/* Cou */}
        <rect x="92" y="110" width="16" height="22" rx="6"
          fill="#e8d5c4" />

        {/* Tête */}
        <ellipse cx="100" cy="92" rx="26" ry="30" fill="#e8d5c4" />

        {/* Cheveux */}
        <path d="M74 85 Q100 55 126 85 Q122 72 100 65 Q78 72 74 85Z"
          fill="#1a1a2e" />
        <path d="M74 85 Q70 100 72 115 Q76 105 78 98 Q76 88 74 85Z"
          fill="#1a1a2e" />
        <path d="M126 85 Q130 100 128 115 Q124 105 122 98 Q124 88 126 85Z"
          fill="#1a1a2e" />

        {/* Yeux */}
        <ellipse cx="91" cy="92" rx="5" ry="6" fill={isHighGrade ? cfg.color : '#1a1a2e'} />
        <ellipse cx="109" cy="92" rx="5" ry="6" fill={isHighGrade ? cfg.color : '#1a1a2e'} />
        {isHighGrade && (
          <>
            <ellipse cx="91" cy="92" rx="3" ry="4" fill="#ffffff" opacity="0.9">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="109" cy="92" rx="3" ry="4" fill="#ffffff" opacity="0.9">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
            </ellipse>
          </>
        )}

        {/* Pupilles */}
        <circle cx="91" cy="92" r="2" fill={isHighGrade ? '#ffffff' : '#374151'} />
        <circle cx="109" cy="92" r="2" fill={isHighGrade ? '#ffffff' : '#374151'} />

        {/* Cape Monarque */}
        {isMonarque && (
          <path d="M55 140 Q50 180 55 240 Q80 250 100 248 Q120 250 145 240 Q150 180 145 140 Q125 160 100 155 Q75 160 55 140Z"
            fill="#0d0020" stroke={cfg.color} strokeWidth="1" opacity="0.85">
            <animate attributeName="d"
              values="M55 140 Q50 180 55 240 Q80 250 100 248 Q120 250 145 240 Q150 180 145 140 Q125 160 100 155 Q75 160 55 140Z;M55 140 Q48 182 53 242 Q80 252 100 250 Q120 252 147 242 Q152 182 145 140 Q125 162 100 157 Q75 162 55 140Z;M55 140 Q50 180 55 240 Q80 250 100 248 Q120 250 145 240 Q150 180 145 140 Q125 160 100 155 Q75 160 55 140Z"
              dur="4s" repeatCount="indefinite" />
          </path>
        )}

        {/* Couronne runes Monarque */}
        {isMonarque && (
          <g>
            {[0, 1, 2, 3, 4].map(i => (
              <text key={i} x={78 + i * 12} y={72} fontSize="10"
                fill={cfg.color} filter="url(#avatarGlow)" fontFamily="serif">
                ᚱ
              </text>
            ))}
          </g>
        )}

        {/* Grade S — runes flottantes sur corps */}
        {grade === 'S' && (
          <g opacity="0.6">
            {['ᚠ', 'ᚢ', 'ᚦ'].map((r, i) => (
              <text key={i} x={60 + i * 30} y={155} fontSize="10"
                fill={cfg.color} filter="url(#avatarGlow)" fontFamily="serif">
                {r}
                <animate attributeName="y" values="155;148;155" dur={`${2 + i * 0.5}s`}
                  repeatCount="indefinite" />
              </text>
            ))}
          </g>
        )}

        {/* Cristaux flottants National */}
        {isNational && [0, 1, 2].map(i => {
          const angle = (i / 3) * Math.PI * 2 - Math.PI / 6;
          const cx = 100 + 45 * Math.cos(angle);
          const cy = 140 + 30 * Math.sin(angle);
          return (
            <polygon key={i} points={`${cx},${cy-8} ${cx+6},${cy+4} ${cx-6},${cy+4}`}
              fill={cfg.color} opacity="0.8" filter="url(#avatarGlow)">
              <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.5 + i * 0.4}s`}
                repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="rotate"
                from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`}
                dur={`${3 + i}s`} repeatCount="indefinite" />
            </polygon>
          );
        })}
      </g>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.02); }
        }
      `}</style>
    </svg>
  );
}
