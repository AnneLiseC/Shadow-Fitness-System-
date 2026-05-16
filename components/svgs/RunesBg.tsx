'use client';

const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ'];

interface RuneItem {
  rune: string;
  x: number;
  y: number;
  dur: number;
  delay: number;
  size: number;
}

const RUNE_POSITIONS: RuneItem[] = Array.from({ length: 30 }, (_, i) => ({
  rune: RUNES[i % RUNES.length],
  x: (i * 37) % 100,
  y: (i * 53) % 100,
  dur: 15 + (i * 7) % 20,
  delay: -(i * 3) % 15,
  size: 12 + (i * 3) % 12,
}));

export default function RunesBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      <svg width="100%" height="100%" className="absolute inset-0">
        {RUNE_POSITIONS.map((r, i) => (
          <text key={i} x={`${r.x}%`} y={`${r.y}%`} fontSize={r.size}
            fill="#7c3aed" opacity="0.05" fontFamily="serif"
            style={{ animation: `float${i % 3} ${r.dur}s ${r.delay}s linear infinite` }}>
            {r.rune}
          </text>
        ))}
        <style>{`
          @keyframes float0 {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(10deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          @keyframes float1 {
            0% { transform: translateY(0px) translateX(0px); }
            33% { transform: translateY(-20px) translateX(15px); }
            66% { transform: translateY(10px) translateX(-10px); }
            100% { transform: translateY(0px) translateX(0px); }
          }
          @keyframes float2 {
            0% { transform: rotate(0deg) translateY(0px); }
            100% { transform: rotate(360deg) translateY(-20px); }
          }
        `}</style>
      </svg>
    </div>
  );
}
