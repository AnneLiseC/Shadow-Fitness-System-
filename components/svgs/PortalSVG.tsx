'use client';
import { useRef } from 'react';

export default function PortalSVG({ size = 200, active = false }: { size?: number; active?: boolean }) {
  const runeRef = useRef<SVGGElement>(null);

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className="portal-svg">
      <defs>
        <radialGradient id="portalGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="60%" stopColor="#1a0033" />
          <stop offset="100%" stopColor="#0a001a" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="strongGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Fond portail */}
      <circle cx="100" cy="100" r="95" fill="url(#portalGrad)" />

      {/* Cercle extérieur de runes */}
      <g ref={runeRef} style={{ transformOrigin: '100px 100px', animation: 'spin 12s linear infinite' }}>
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 100 + 80 * Math.cos(rad);
          const y = 100 + 80 * Math.sin(rad);
          const rune = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ'][i];
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fontSize="12" fill="#7c3aed" filter="url(#glow)" opacity={0.9}
              style={{ fontFamily: 'serif' }}>
              {rune}
            </text>
          );
        })}
      </g>

      {/* Anneau intérieur (sens inverse) */}
      <g style={{ transformOrigin: '100px 100px', animation: 'spin 8s linear infinite reverse' }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 100 + 60 * Math.cos(rad);
          const y = 100 + 60 * Math.sin(rad);
          return (
            <circle key={i} cx={x} cy={y} r="3" fill="#06b6d4" filter="url(#glow)"
              opacity={active ? 1 : 0.6}>
              <animate attributeName="opacity" values={active ? "0.4;1;0.4" : "0.3;0.7;0.3"}
                dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
      </g>

      {/* Cercle central pulsant */}
      <circle cx="100" cy="100" r="35" fill="#000" stroke="#7c3aed" strokeWidth="2" filter="url(#strongGlow)">
        <animate attributeName="r" values="33;37;33" dur="2s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Éclairs violets */}
      {active && [0, 72, 144, 216, 288].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 100 + 35 * Math.cos(rad);
        const y1 = 100 + 35 * Math.sin(rad);
        const x2 = 100 + 65 * Math.cos(rad + 0.3);
        const y2 = 100 + 65 * Math.sin(rad + 0.3);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#a855f7" strokeWidth="1.5" filter="url(#glow)">
            <animate attributeName="opacity" values="0;1;0" dur={`${0.8 + i * 0.15}s`}
              repeatCount="indefinite" begin={`${i * 0.15}s`} />
          </line>
        );
      })}

      {/* Symbole central */}
      <text x="100" y="107" textAnchor="middle" fontSize="28" fill="#c4b5fd"
        filter="url(#strongGlow)" style={{ fontFamily: 'serif' }}>⬡</text>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </svg>
  );
}
