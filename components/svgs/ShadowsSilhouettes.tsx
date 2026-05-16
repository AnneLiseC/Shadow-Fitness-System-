'use client';

interface Shadow {
  x: number;
  scale: number;
  dur: number;
  delay: number;
}

const SHADOWS: Shadow[] = Array.from({ length: 12 }, (_, i) => ({
  x: (i / 12) * 100,
  scale: 0.6 + (i * 0.07) % 0.5,
  dur: 20 + i * 3,
  delay: -i * 2,
}));

export default function ShadowsSilhouettes() {
  return (
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-0 h-64" aria-hidden>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {SHADOWS.map((s, i) => (
          <g key={i} transform={`translate(${s.x}, 20) scale(${s.scale})`}
            opacity="0.03"
            style={{ animation: `shadowWave ${s.dur}s ${s.delay}s ease-in-out infinite` }}>
            {/* Silhouette simplifiée de Jin-Woo */}
            <ellipse cx="5" cy="0" rx="3" ry="3.5" fill="#7c3aed" />
            <rect x="2" y="3" width="6" height="15" rx="2" fill="#7c3aed" />
            <rect x="0" y="4" width="3" height="10" rx="1.5" fill="#7c3aed" />
            <rect x="7" y="4" width="3" height="10" rx="1.5" fill="#7c3aed" />
            <rect x="2.5" y="17" width="3" height="12" rx="1.5" fill="#7c3aed" />
            <rect x="5.5" y="17" width="3" height="12" rx="1.5" fill="#7c3aed" />
          </g>
        ))}
        <style>{`
          @keyframes shadowWave {
            0%, 100% { transform: translateX(0px) scaleX(1); }
            50% { transform: translateX(5px) scaleX(0.95); }
          }
        `}</style>
      </svg>
    </div>
  );
}
