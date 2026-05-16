'use client';
import { Grade, GRADE_COLORS } from '@/lib/grades';

const GRADE_GLOW: Record<string, string> = {
  E: '#94a3b8',
  D: '#22c55e',
  C: '#3b82f6',
  B: '#a855f7',
  A: '#f59e0b',
  S: '#06b6d4',
  National: '#dc2626',
  Monarque: '#7c3aed',
};

export default function CrystalSVG({ grade, size = 120 }: { grade: Grade; size?: number }) {
  const color = GRADE_COLORS[grade];
  const glow = GRADE_GLOW[grade];
  const isHigh = ['S', 'National', 'Monarque'].includes(grade);

  const pts = {
    top: `${size/2},${size * 0.05}`,
    topRight: `${size * 0.85},${size * 0.3}`,
    botRight: `${size * 0.75},${size * 0.85}`,
    bot: `${size/2},${size * 0.95}`,
    botLeft: `${size * 0.25},${size * 0.85}`,
    topLeft: `${size * 0.15},${size * 0.3}`,
    midRight: `${size * 0.88},${size * 0.5}`,
    midLeft: `${size * 0.12},${size * 0.5}`,
    center: `${size/2},${size/2}`,
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: `drop-shadow(0 0 12px ${glow})` }}>
      <defs>
        <linearGradient id={`cg-${grade}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
        <filter id={`cf-${grade}`}>
          <feGaussianBlur stdDeviation={isHigh ? "4" : "2"} result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Corps principal du cristal hexagonal */}
      <polygon
        points={`${pts.top} ${pts.topRight} ${pts.botRight} ${pts.bot} ${pts.botLeft} ${pts.topLeft}`}
        fill={`url(#cg-${grade})`}
        stroke={color}
        strokeWidth="1.5"
        filter={`url(#cf-${grade})`}
      >
        <animateTransform attributeName="transform" type="rotate"
          from={`0 ${size/2} ${size/2}`} to={`360 ${size/2} ${size/2}`}
          dur="8s" repeatCount="indefinite" />
      </polygon>

      {/* Reflet supérieur */}
      <polygon
        points={`${pts.top} ${pts.topRight} ${pts.center}`}
        fill="#ffffff"
        opacity="0.2"
      >
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
      </polygon>

      {/* Éclat central */}
      <circle cx={size/2} cy={size/2} r={size * 0.1} fill="#ffffff" opacity="0.4">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values={`${size*0.08};${size*0.13};${size*0.08}`} dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Grade letter */}
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize={size * 0.25}
        fill="#ffffff" fontWeight="bold" fontFamily="'Orbitron', monospace"
        style={{ textShadow: `0 0 10px ${glow}` }}>
        {grade === 'National' ? 'N' : grade === 'Monarque' ? 'M' : grade}
      </text>

      {/* Particules pour hauts grades */}
      {isHigh && [0, 1, 2, 3, 4].map(i => {
        const angle = (i / 5) * Math.PI * 2;
        const cx = size/2 + size * 0.42 * Math.cos(angle);
        const cy = size/2 + size * 0.42 * Math.sin(angle);
        return (
          <circle key={i} cx={cx} cy={cy} r="3" fill={glow} opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur={`${1 + i * 0.3}s`}
              repeatCount="indefinite" begin={`${i * 0.2}s`} />
          </circle>
        );
      })}
    </svg>
  );
}
