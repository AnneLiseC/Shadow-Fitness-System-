'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Grade } from '@/lib/grades';

interface AvatarSVGProps {
  grade: Grade;
  size?: number;
  idle?: boolean;
}

/* Rangs E/D/C/B → image statique Leonardo AI */
const IMAGE_GRADES: Partial<Record<Grade, string>> = {
  E: '/avatars/rangE.jpg',
  D: '/avatars/rangD.jpg',
  C: '/avatars/rangC.jpg',
  B: '/avatars/rangB.jpg',
};

/* ─── Composant image ─────────────────────────────────────────── */
function AvatarImage({ grade, size }: { grade: Grade; size: number }) {
  const [failed, setFailed] = useState(false);
  const src = IMAGE_GRADES[grade]!;
  const h = Math.round(size * 1.62);

  if (failed) {
    return <AvatarSVGAnimated grade={grade} size={size} idle />;
  }

  return (
    <div style={{ width: size, height: h, position: 'relative', flexShrink: 0 }}>
      <Image
        src={src}
        alt={`Avatar Rang ${grade}`}
        fill
        style={{ objectFit: 'contain', objectPosition: 'top' }}
        onError={() => setFailed(true)}
        priority
      />
    </div>
  );
}

/* ─── Config SVG rangs A → Monarque ──────────────────────────── */
const SVG_CFG = {
  A:        { main: '#7c3aed', accent: '#c4b5fd', eye: '#a855f7', aura: '#7c3aed', op: 0.6,  t: 0 },
  S:        { main: '#7c3aed', accent: '#06b6d4', eye: '#06b6d4', aura: '#7c3aed', op: 0.82, t: 1 },
  National: { main: '#7c3aed', accent: '#c084fc', eye: '#c084fc', aura: '#7c3aed', op: 0.95, t: 2 },
  Monarque: { main: '#000000', accent: '#7c3aed', eye: '#c084fc', aura: '#7c3aed', op: 1.0,  t: 3 },
} as const;

/* ─── SVG animé rangs A / S / National / Monarque ────────────── */
function AvatarSVGAnimated({ grade, size, idle }: { grade: Grade; size: number; idle: boolean }) {
  const cfg = SVG_CFG[grade as keyof typeof SVG_CFG];
  if (!cfg) return null;

  const { main, accent, eye, aura, op, t } = cfg;
  const h = Math.round(size * 1.62);
  const gId  = `gl-${grade}`;
  const sgId = `sgl-${grade}`;
  const isM  = grade === 'Monarque';
  const isN  = grade === 'National';

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 200 324"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={gId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={sgId} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="7" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Peau */}
        <radialGradient id={`sk-${grade}`} cx="40%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#fce8d0"/>
          <stop offset="100%" stopColor="#e0b890"/>
        </radialGradient>

        {/* Iris violet */}
        <radialGradient id={`ir-${grade}`} cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor={accent}/>
          <stop offset="50%" stopColor={eye}/>
          <stop offset="100%" stopColor={main}/>
        </radialGradient>

        {/* Cheveux noirs */}
        <linearGradient id={`hr-${grade}`} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#2a1248"/>
          <stop offset="40%" stopColor="#120820"/>
          <stop offset="100%" stopColor="#060410"/>
        </linearGradient>

        {/* Robe noire */}
        <linearGradient id={`dr-${grade}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0a2e"/>
          <stop offset="100%" stopColor="#060410"/>
        </linearGradient>

        {/* Aura sol */}
        <radialGradient id={`au-${grade}`} cx="50%" cy="90%" r="55%">
          <stop offset="0%" stopColor={aura} stopOpacity={op * 0.8}/>
          <stop offset="100%" stopColor={aura} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* ── AURA SOL ── */}
      <ellipse cx="100" cy="310" rx="78" ry="14" fill={`url(#au-${grade})`}>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2.8s" repeatCount="indefinite"/>
      </ellipse>

      {/* ── VORTEX MONARQUE ── */}
      {isM && (
        <g>
          <ellipse cx="100" cy="220" rx="80" ry="110" fill="#04000c" opacity="0.88">
            <animate attributeName="rx" values="80;86;80" dur="3s" repeatCount="indefinite"/>
          </ellipse>
          {[0,1,2,3,4,5,6].map(i => {
            const a = (i/7)*Math.PI*2;
            const rx2 = 68+(i%3)*8, ry2 = 52+(i%3)*6;
            const px = 100+rx2*Math.cos(a), py = 220+ry2*Math.sin(a)*0.5;
            return <ellipse key={i} cx={px} cy={py} rx="4" ry="8" fill="#2a005a" opacity="0.45"
              transform={`rotate(${a*57.3} ${px} ${py})`}>
              <animate attributeName="opacity" values="0.25;0.6;0.25"
                dur={`${2+i*0.4}s`} repeatCount="indefinite"/>
            </ellipse>;
          })}
        </g>
      )}

      {/* ── GROUPE PRINCIPAL (respiration) ── */}
      <g style={idle ? { animation:'breathe 4s ease-in-out infinite', transformOrigin:'100px 180px' } : {}}>

        {/* Cape longue — National & Monarque */}
        {(isN || isM) && (
          <path
            d={isM
              ? "M54 132 Q38 180 36 248 Q40 282 64 300 Q80 314 100 316 Q120 314 136 300 Q160 282 164 248 Q162 180 146 132 Q122 156 100 154 Q78 156 54 132Z"
              : "M60 134 Q46 178 44 238 Q48 270 70 290 Q86 305 100 307 Q114 305 130 290 Q152 270 156 238 Q154 178 140 134 Q120 156 100 154 Q80 156 60 134Z"
            }
            fill={isM ? "#050008" : "#08040e"}
            stroke={main === '#000000' ? accent : main}
            strokeWidth={isM ? "2" : "1.5"}
            opacity="0.95">
            <animate attributeName="d"
              values={isM
                ? "M54 132 Q38 180 36 248 Q40 282 64 300 Q80 314 100 316 Q120 314 136 300 Q160 282 164 248 Q162 180 146 132 Q122 156 100 154 Q78 156 54 132Z;M54 132 Q36 182 34 250 Q38 284 62 302 Q78 316 100 318 Q122 316 138 302 Q162 284 166 250 Q164 182 146 132 Q122 158 100 156 Q78 158 54 132Z;M54 132 Q38 180 36 248 Q40 282 64 300 Q80 314 100 316 Q120 314 136 300 Q160 282 164 248 Q162 180 146 132 Q122 156 100 154 Q78 156 54 132Z"
                : "M60 134 Q46 178 44 238 Q48 270 70 290 Q86 305 100 307 Q114 305 130 290 Q152 270 156 238 Q154 178 140 134 Q120 156 100 154 Q80 156 60 134Z;M60 134 Q44 180 42 240 Q46 272 68 292 Q84 307 100 309 Q116 307 132 292 Q154 272 158 240 Q156 180 140 134 Q120 158 100 156 Q80 158 60 134Z;M60 134 Q46 178 44 238 Q48 270 70 290 Q86 305 100 307 Q114 305 130 290 Q152 270 156 238 Q154 178 140 134 Q120 156 100 154 Q80 156 60 134Z"
              }
              dur={isM ? "3.5s" : "5s"} repeatCount="indefinite"/>
          </path>
        )}

        {/* ── JAMBES / ROBE LONGUE ── */}
        {/* Robe longue jusqu'aux chevilles pour A et S */}
        {(t === 0 || t === 1) && (
          <>
            {/* Corps de robe */}
            <path d="M70 196 Q64 220 62 258 Q62 282 66 298 Q80 308 100 308 Q120 308 134 298 Q138 282 138 258 Q136 220 130 196 Q114 200 100 200 Q86 200 70 196Z"
              fill={`url(#dr-${grade})`} stroke={main} strokeWidth="0.8" opacity="0.98"/>
            {/* Plis de robe */}
            <path d="M85 200 Q82 240 80 280" stroke="#1a0a2e" strokeWidth="1.2" opacity="0.6"/>
            <path d="M100 202 Q100 242 100 282" stroke="#1a0a2e" strokeWidth="1" opacity="0.5"/>
            <path d="M115 200 Q118 240 120 280" stroke="#1a0a2e" strokeWidth="1.2" opacity="0.6"/>
            {/* Ourlet robe */}
            <path d="M66 298 Q80 306 100 308 Q120 306 134 298" stroke={main} strokeWidth="1" opacity="0.7" fill="none"/>
            {/* Chaussures */}
            <path d="M72 300 Q68 308 72 314 Q78 318 86 316 Q92 314 94 308 Q92 302 86 300Z" fill="#080410"/>
            <path d="M108 300 Q106 308 110 314 Q116 318 124 316 Q130 314 132 308 Q130 302 124 300Z" fill="#080410"/>
            {/* Talons */}
            <path d="M74 312 L72 320" stroke="#0a0618" strokeWidth="3" strokeLinecap="round"/>
            <path d="M110 312 L108 320" stroke="#0a0618" strokeWidth="3" strokeLinecap="round"/>
          </>
        )}

        {/* Jambes pour National et Monarque (sous cape) */}
        {(t === 2 || t === 3) && (
          <>
            <path d="M78 198 Q74 222 72 250 Q72 272 74 288 L88 288 Q90 272 90 250 Q90 222 88 198Z"
              fill="#0a0618"/>
            <path d="M112 198 Q116 222 118 250 Q118 272 116 288 L102 288 Q100 272 100 250 Q100 222 102 198Z"
              fill="#0a0618"/>
            <path d="M70 284 Q68 294 72 300 Q78 306 87 306 Q93 304 94 298 L88 284Z" fill="#050010"/>
            <path d="M106 284 Q104 294 108 300 Q114 306 123 306 Q129 304 130 298 L112 284Z" fill="#050010"/>
            <path d="M72 298 L70 308" stroke="#030008" strokeWidth="3" strokeLinecap="round"/>
            <path d="M108 298 L106 308" stroke="#030008" strokeWidth="3" strokeLinecap="round"/>
          </>
        )}

        {/* ── TORSE ── */}
        {/* Bustier robe pour A/S */}
        {(t === 0 || t === 1) && (
          <>
            <path d="M72 128 Q64 138 62 156 Q61 172 64 185 Q68 196 78 200 Q89 203 100 203 Q111 203 122 200 Q132 196 136 185 Q139 172 138 156 Q136 138 128 128 Q114 120 100 120 Q86 120 72 128Z"
              fill="#0a0416"/>
            {/* Décolleté carré */}
            <path d="M82 126 L82 140 Q91 138 100 138 Q109 138 118 140 L118 126"
              fill={`url(#sk-${grade})`} opacity="0.9"/>
            <path d="M82 126 L82 140" stroke="#060312" strokeWidth="0.8"/>
            <path d="M118 126 L118 140" stroke="#060312" strokeWidth="0.8"/>
            <path d="M82 140 Q100 136 118 140" stroke="#060312" strokeWidth="0.8" fill="none"/>
            {/* Coutures bustier */}
            <path d="M82 148 Q100 144 118 148" stroke="#1a0a30" strokeWidth="1" opacity="0.7" fill="none"/>
            <path d="M80 162 Q100 158 120 162" stroke="#1a0a30" strokeWidth="0.8" opacity="0.5" fill="none"/>
          </>
        )}

        {/* Armure pour National/Monarque */}
        {t === 2 && (
          <>
            <path d="M70 124 Q62 136 60 155 Q59 172 62 186 Q66 198 76 202 Q88 206 100 206 Q112 206 124 202 Q134 198 138 186 Q141 172 140 155 Q138 136 130 124 Q114 116 100 116 Q86 116 70 124Z"
              fill="#0c0820" stroke={main} strokeWidth="1.5" opacity="0.97"/>
            <path d="M78 130 Q100 120 122 130 Q120 156 100 163 Q80 156 78 130Z"
              fill="#160c38" opacity="0.9" filter={`url(#${gId})`}/>
            <circle cx="100" cy="145" r="7" fill={main} opacity="0.85" filter={`url(#${gId})`}/>
            <circle cx="100" cy="145" r="4" fill={accent} opacity="0.7"/>
            {/* Epaulières */}
            <path d="M58 124 Q66 112 80 120 Q77 136 66 146 Q56 140 58 124Z"
              fill="#0c0820" stroke={main} strokeWidth="1.5" opacity="0.95" filter={`url(#${gId})`}/>
            <path d="M142 124 Q134 112 120 120 Q123 136 134 146 Q144 140 142 124Z"
              fill="#0c0820" stroke={main} strokeWidth="1.5" opacity="0.95" filter={`url(#${gId})`}/>
          </>
        )}

        {t === 3 && (
          <>
            <path d="M66 120 Q56 134 54 155 Q52 174 56 188 Q60 200 72 205 Q86 210 100 210 Q114 210 128 205 Q140 200 144 188 Q148 174 146 155 Q144 134 134 120 Q116 110 100 110 Q84 110 66 120Z"
              fill="#050008" stroke={accent} strokeWidth="2.5" opacity="0.98"/>
            {/* Runes gravées torse */}
            <path d="M74 128 L80 120 L100 114 L120 120 L126 128" stroke={accent} strokeWidth="2" opacity="0.9" filter={`url(#${sgId})`}/>
            <path d="M70 142 L77 134 L100 128 L123 134 L130 142" stroke={accent} strokeWidth="1.5" opacity="0.75" filter={`url(#${gId})`}/>
            <path d="M72 156 L78 149 L100 143 L122 149 L128 156" stroke={accent} strokeWidth="1" opacity="0.55" filter={`url(#${gId})`}/>
            <text x="100" y="148" fontSize="16" fill={accent} fontFamily="serif"
              textAnchor="middle" filter={`url(#${sgId})`} opacity="0.96">ᚱ</text>
            {/* Epaulières corrompues */}
            <path d="M52 118 Q60 102 80 114 Q77 136 60 150 Q48 144 52 118Z"
              fill="#050008" stroke={accent} strokeWidth="2.5" opacity="0.98" filter={`url(#${gId})`}/>
            <path d="M148 118 Q140 102 120 114 Q123 136 140 150 Q152 144 148 118Z"
              fill="#050008" stroke={accent} strokeWidth="2.5" opacity="0.98" filter={`url(#${gId})`}/>
            <path d="M55 112 L48 96 L56 106 L49 94 L58 104Z" fill={accent} opacity="0.7" filter={`url(#${sgId})`}/>
            <path d="M145 112 L152 96 L144 106 L151 94 L142 104Z" fill={accent} opacity="0.7" filter={`url(#${sgId})`}/>
          </>
        )}

        {/* ── CEINTURE / TRANSITION ── */}
        {(t === 0 || t === 1) && (
          <path d="M74 196 Q100 192 126 196 L126 202 Q100 206 74 202Z"
            fill={main} opacity="0.75" filter={`url(#${gId})`}/>
        )}

        {/* ── BRAS ── */}
        {/* Bras gauche */}
        <path d="M64 130 Q56 136 52 153 Q50 168 54 182 Q58 188 65 188 L72 184 Q70 172 68 162 Q66 148 65 134Z"
          fill={t >= 2 ? "#0a0618" : "#100828"}/>
        <path d="M52 180 Q48 188 48 200 Q48 210 52 216 Q56 220 63 218 Q68 213 69 204 Q69 194 65 186Z"
          fill={t >= 2 ? "#080410" : "#0c0620"}/>

        {/* Bras droit */}
        <path d="M136 130 Q144 136 148 153 Q150 168 146 182 Q142 188 135 188 L128 184 Q130 172 132 162 Q134 148 135 134Z"
          fill={t >= 2 ? "#0a0618" : "#100828"}/>
        <path d="M148 180 Q152 188 152 200 Q152 210 148 216 Q144 220 137 218 Q132 213 131 204 Q131 194 135 186Z"
          fill={t >= 2 ? "#080410" : "#0c0620"}/>

        {/* Gants/mains */}
        {t >= 2 ? (
          <>
            <path d="M46 198 Q48 192 52 190 Q58 188 63 192 Q66 198 66 207 Q64 216 59 218 Q53 218 49 213 Q45 207 46 198Z"
              fill="#0a0618" stroke={accent} strokeWidth="1.2" opacity="0.9" filter={`url(#${gId})`}/>
            <path d="M154 198 Q152 192 148 190 Q142 188 137 192 Q134 198 134 207 Q136 216 141 218 Q147 218 151 213 Q155 207 154 198Z"
              fill="#0a0618" stroke={accent} strokeWidth="1.2" opacity="0.9" filter={`url(#${gId})`}/>
          </>
        ) : (
          <>
            <ellipse cx="58" cy="220" rx="8" ry="5" fill={`url(#sk-${grade})`}/>
            <ellipse cx="142" cy="220" rx="8" ry="5" fill={`url(#sk-${grade})`}/>
          </>
        )}

        {/* ── CHEVEUX ARRIÈRE ── */}
        {/* Masse principale — très longs (jusqu'aux hanches+) */}
        <path d="M46 72 Q48 106 42 148 Q48 178 66 210 Q82 232 100 236 Q118 232 134 210 Q152 178 158 148 Q152 106 154 72 Q124 130 100 132 Q76 130 46 72Z"
          fill={`url(#hr-${grade})`}/>
        {/* Mèches latérales longues */}
        <path d="M46 80 Q40 110 36 148 Q34 172 38 196 Q42 182 44 162 Q46 138 46 110 Q46 94 46 80Z"
          fill="#140828"/>
        <path d="M154 80 Q160 110 164 148 Q166 172 162 196 Q158 182 156 162 Q154 138 154 110 Q154 94 154 80Z"
          fill="#140828"/>

        {/* ── COU ── */}
        <path d="M92 108 Q96 106 100 106 Q104 106 108 108 L110 126 Q104 128 100 129 Q96 128 90 126Z"
          fill={`url(#sk-${grade})`}/>
        {/* Choker / collier */}
        <rect x="88" y="118" width="24" height="4" rx="2" fill="#0a0616" stroke={main} strokeWidth="0.8" opacity="0.9"/>
        <circle cx="100" cy="120" r="2" fill={main} opacity="0.85" filter={`url(#${gId})`}/>

        {/* ── VISAGE ── */}
        <path d="M100 24 Q120 24 133 38 Q142 51 141 68 Q140 82 135 92 Q129 103 121 110 Q112 116 100 118 Q88 116 79 110 Q71 103 65 92 Q60 82 59 68 Q58 51 67 38 Q80 24 100 24Z"
          fill={`url(#sk-${grade})`}/>
        {/* Ombres joues */}
        <path d="M67 70 Q63 82 65 92 Q68 88 72 90 Q70 80 67 70Z" fill="#d0946a" opacity="0.16"/>
        <path d="M133 70 Q137 82 135 92 Q132 88 128 90 Q130 80 133 70Z" fill="#d0946a" opacity="0.16"/>
        {/* Oreilles */}
        <path d="M61 64 Q56 67 56 73 Q56 80 61 83 Q64 81 65 76 Q65 70 61 64Z" fill="#e8c0a0"/>
        <path d="M139 64 Q144 67 144 73 Q144 80 139 83 Q136 81 135 76 Q135 70 139 64Z" fill="#e8c0a0"/>
        {/* Boucles d'oreilles */}
        <circle cx="60" cy="78" r="2.5" fill={main} opacity="0.9" filter={`url(#${gId})`}/>
        <circle cx="140" cy="78" r="2.5" fill={main} opacity="0.9" filter={`url(#${gId})`}/>

        {/* ── SOURCILS ── */}
        <path d="M70 57 Q79 51 90 53" stroke="#14082a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M110 53 Q121 51 130 57" stroke="#14082a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

        {/* ── ŒIL GAUCHE ── */}
        <path d="M70 66 Q78 58 91 62 Q96 66 95 73 Q93 81 86 84 Q79 85 72 81 Q67 76 70 66Z" fill="white"/>
        <ellipse cx="82" cy="73" rx="6.5" ry="7.5" fill={`url(#ir-${grade})`}/>
        <path d="M70 66 Q79 58 91 62 Q90 67 82 66 Q74 65 70 66Z" fill="#08060e" opacity="0.4"/>
        <ellipse cx="82" cy="74" rx="3.2" ry="3.8" fill="#020006"/>
        <ellipse cx="86" cy="68" rx="2.2" ry="1.6" fill="white" opacity="0.96"/>
        <circle cx="78" cy="71" r="1.1" fill="white" opacity="0.55"/>
        <path d="M69 66 Q79 57 92 62" stroke="#08060e" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M70 78 Q80 85 93 80" stroke="#08060e" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M69 66 Q67 61 65 59" stroke="#040010" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M73 62 Q71 57 70 55" stroke="#040010" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M77 60 Q77 55 77 53" stroke="#040010" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M82 59 Q83 54 83 52" stroke="#040010" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M87 60 Q88 55 89 53" stroke="#040010" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M91 63 Q93 59 94 57" stroke="#040010" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

        {/* ── ŒIL DROIT ── */}
        <path d="M130 66 Q122 58 109 62 Q104 66 105 73 Q107 81 114 84 Q121 85 128 81 Q133 76 130 66Z" fill="white"/>
        <ellipse cx="118" cy="73" rx="6.5" ry="7.5" fill={`url(#ir-${grade})`}/>
        <path d="M130 66 Q121 58 109 62 Q110 67 118 66 Q126 65 130 66Z" fill="#08060e" opacity="0.4"/>
        <ellipse cx="118" cy="74" rx="3.2" ry="3.8" fill="#020006"/>
        <ellipse cx="122" cy="68" rx="2.2" ry="1.6" fill="white" opacity="0.96"/>
        <circle cx="114" cy="71" r="1.1" fill="white" opacity="0.55"/>
        <path d="M131 66 Q121 57 108 62" stroke="#08060e" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M130 78 Q120 85 107 80" stroke="#08060e" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M131 66 Q133 61 135 59" stroke="#040010" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M127 62 Q129 57 130 55" stroke="#040010" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M123 60 Q123 55 123 53" stroke="#040010" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M118 59 Q117 54 117 52" stroke="#040010" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M113 60 Q112 55 111 53" stroke="#040010" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M109 63 Q107 59 106 57" stroke="#040010" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

        {/* Lueur yeux — tous les rangs SVG */}
        <ellipse cx="82" cy="73" rx="8" ry="9" fill={eye} opacity="0.2" filter={`url(#${gId})`}>
          <animate attributeName="opacity" values="0.12;0.32;0.12" dur="2.4s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="118" cy="73" rx="8" ry="9" fill={eye} opacity="0.2" filter={`url(#${gId})`}>
          <animate attributeName="opacity" values="0.12;0.32;0.12" dur="2.4s" repeatCount="indefinite"/>
        </ellipse>
        {/* Lueur intense S+ */}
        {t >= 1 && <>
          <ellipse cx="82" cy="73" rx="10" ry="11" fill={eye} opacity="0.35" filter={`url(#${sgId})`}>
            <animate attributeName="opacity" values="0.22;0.52;0.22" dur="1.8s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="118" cy="73" rx="10" ry="11" fill={eye} opacity="0.35" filter={`url(#${sgId})`}>
            <animate attributeName="opacity" values="0.22;0.52;0.22" dur="1.8s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="82" cy="73" rx="3.5" ry="4" fill={accent} opacity="0.55">
            <animate attributeName="opacity" values="0.35;0.75;0.35" dur="1.5s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="118" cy="73" rx="3.5" ry="4" fill={accent} opacity="0.55">
            <animate attributeName="opacity" values="0.35;0.75;0.35" dur="1.5s" repeatCount="indefinite"/>
          </ellipse>
        </>}

        {/* ── NEZ / BOUCHE ── */}
        <path d="M97 82 Q100 85 103 82" stroke="#c4886a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <circle cx="97.5" cy="85" r="1" fill="#c4886a" opacity="0.5"/>
        <circle cx="102.5" cy="85" r="1" fill="#c4886a" opacity="0.5"/>
        <path d="M94 94 Q100 99 106 94" stroke="#b06858" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M95 94 Q100 96 105 94" stroke="#cc8070" strokeWidth="0.8" fill="none" strokeLinecap="round"/>

        {/* ── CHEVEUX AVANT ── */}
        {/* Frange droite centrale — caractéristique des images */}
        <path d="M70 34 Q78 22 100 18 Q122 22 130 34 Q120 40 100 36 Q80 40 70 34Z"
          fill={`url(#hr-${grade})`}/>
        {/* Frange qui tombe légèrement asymétrique */}
        <path d="M70 34 Q74 44 76 56 Q72 48 70 38 Z" fill="#160a2a"/>
        <path d="M130 34 Q126 44 124 56 Q128 48 130 38 Z" fill="#160a2a"/>

        {/* Mèches latérales avant — longues, tombent devant épaules */}
        <path d="M64 52 Q62 70 60 94 Q58 110 58 128 Q56 112 55 92 Q54 70 56 50Z"
          fill={`url(#hr-${grade})`}/>
        <path d="M136 52 Q138 70 140 94 Q142 110 142 128 Q144 112 145 92 Q146 70 144 50Z"
          fill={`url(#hr-${grade})`}/>
        {/* Détails mèches */}
        <path d="M64 58 Q66 50 72 46 Q68 58 64 72 Q62 84 61 94 Q60 76 64 58Z" fill="#1e0e3a"/>
        <path d="M136 58 Q134 50 128 46 Q132 58 136 72 Q138 84 139 94 Q140 76 136 58Z" fill="#1e0e3a"/>

        {/* Reflets cheveux */}
        <path d="M86 18 Q100 14 114 18 Q110 24 100 22 Q90 24 86 18Z" fill="#3e1e6a" opacity="0.5"/>
        <path d="M66 40 Q70 34 78 32 Q74 40 70 46Z" fill="#2e1255" opacity="0.45"/>

        {/* ── RUNES S RANK (sur robe) ── */}
        {t === 1 && (
          <g filter={`url(#${gId})`} opacity="0.85">
            {['ᚠ','ᚢ','ᚦ','ᚨ','ᛊ'].map((r, i) => (
              <text key={i}
                x={78 + i * 11} y={t === 1 ? 175 : 180}
                fontSize="9" fill={accent} fontFamily="serif" textAnchor="middle">
                {r}
                <animate attributeName="opacity" values="0.4;1;0.4"
                  dur={`${2.2 + i*0.3}s`} repeatCount="indefinite"/>
              </text>
            ))}
            {/* Lignes de runes verticales sur robe */}
            <path d="M85 210 Q84 240 85 270" stroke={accent} strokeWidth="0.6" opacity="0.4"/>
            <path d="M100 208 Q100 242 100 272" stroke={accent} strokeWidth="0.6" opacity="0.35"/>
            <path d="M115 210 Q116 240 115 270" stroke={accent} strokeWidth="0.6" opacity="0.4"/>
          </g>
        )}

        {/* ── AURA CORPS latérale ── */}
        {t >= 1 && <>
          <ellipse cx="56" cy="180" rx="14" ry="26" fill={aura} opacity="0.1" filter={`url(#${gId})`}>
            <animate attributeName="opacity" values="0.06;0.18;0.06" dur="2.2s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="144" cy="180" rx="14" ry="26" fill={aura} opacity="0.1" filter={`url(#${gId})`}>
            <animate attributeName="opacity" values="0.06;0.18;0.06" dur="2.8s" repeatCount="indefinite"/>
          </ellipse>
        </>}

      </g>{/* fin groupe principal */}

      {/* ── CRISTAUX NATIONAL ── */}
      {isN && [0,1,2,3,4].map(i => {
        const a = (i/5)*Math.PI*2 + Math.PI/10;
        const cx2 = 100+68*Math.cos(a), cy2 = 178+44*Math.sin(a);
        return (
          <g key={i} filter={`url(#${gId})`}>
            <polygon
              points={`${cx2},${cy2-12} ${cx2+7},${cy2-4} ${cx2+12},${cy2+3} ${cx2},${cy2+12} ${cx2-12},${cy2+3} ${cx2-7},${cy2-4}`}
              fill="none" stroke={main} strokeWidth="2" opacity="0.92">
              <animate attributeName="opacity" values="0.3;1;0.3"
                dur={`${2.2+i*0.4}s`} repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="rotate"
                from={`0 ${cx2} ${cy2}`} to={`360 ${cx2} ${cy2}`}
                dur={`${6+i*0.8}s`} repeatCount="indefinite"/>
            </polygon>
            <circle cx={cx2} cy={cy2} r="4" fill={accent} opacity="0.88">
              <animate attributeName="r" values="3;5;3"
                dur={`${2+i*0.35}s`} repeatCount="indefinite"/>
            </circle>
          </g>
        );
      })}

      {/* ── SIGILS ORBITAUX MONARQUE ── */}
      {isM && [...Array(8)].map((_, i) => {
        const a = (i/8)*Math.PI*2;
        const r = 70+(i%3)*10;
        const px = 100+r*Math.cos(a), py = 200+r*0.42*Math.sin(a);
        return (
          <text key={i} x={px} y={py} fontSize="10"
            fill={accent} fontFamily="serif" opacity="0.72"
            textAnchor="middle" filter={`url(#${sgId})`}>
            {['ᚱ','ᛏ','ᚨ','ᛊ','ᚠ','ᛟ','ᚦ','ᚢ'][i]}
            <animate attributeName="opacity" values="0.3;0.9;0.3"
              dur={`${1.6+i*0.25}s`} repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="rotate"
              from="0 100 200" to="360 100 200"
              dur="16s" repeatCount="indefinite"/>
          </text>
        );
      })}

      {/* ── COURONNE MONARQUE ── */}
      {isM && (
        <g filter={`url(#${sgId})`}>
          <path d="M77 20 L88 10 L100 6 L112 10 L123 20 L119 25 L100 15 L81 25Z"
            fill="none" stroke={accent} strokeWidth="2.2">
            <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite"/>
          </path>
          {[81,91,100,109,119].map((x, i) => (
            <circle key={i} cx={x} cy={19+Math.sin(i*1.2)*4} r="3" fill={accent}>
              <animate attributeName="opacity" values="0.4;1;0.4"
                dur={`${1.2+i*0.22}s`} repeatCount="indefinite"/>
            </circle>
          ))}
        </g>
      )}

      <style>{`
        @keyframes breathe {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
      `}</style>
    </svg>
  );
}

/* ─── Composant principal exporté ─────────────────────────────── */
export default function AvatarSVG({ grade, size = 200, idle = true }: AvatarSVGProps) {
  if (grade in IMAGE_GRADES) {
    return <AvatarImage grade={grade} size={size} />;
  }
  return <AvatarSVGAnimated grade={grade} size={size} idle={idle} />;
}
