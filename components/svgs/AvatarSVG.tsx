'use client';
import { Grade } from '@/lib/grades';

interface AvatarSVGProps {
  grade: Grade;
  size?: number;
  idle?: boolean;
}

const R = {
  E:        { main: '#94a3b8', accent: '#e2e8f0', eye: '#5c3d2a', aura: '#94a3b8', op: 0,    t: 0 },
  D:        { main: '#22c55e', accent: '#86efac', eye: '#166534', aura: '#22c55e', op: 0.25, t: 1 },
  C:        { main: '#7c3aed', accent: '#c4b5fd', eye: '#7c3aed', aura: '#7c3aed', op: 0.4,  t: 2 },
  B:        { main: '#a855f7', accent: '#d8b4fe', eye: '#a855f7', aura: '#a855f7', op: 0.55, t: 3 },
  A:        { main: '#f59e0b', accent: '#fde68a', eye: '#b45309', aura: '#f59e0b', op: 0.7,  t: 4 },
  S:        { main: '#06b6d4', accent: '#67e8f9', eye: '#06b6d4', aura: '#06b6d4', op: 0.85, t: 5 },
  National: { main: '#dc2626', accent: '#fca5a5', eye: '#ef4444', aura: '#dc2626', op: 1.0,  t: 6 },
  Monarque: { main: '#7c3aed', accent: '#c084fc', eye: '#c084fc', aura: '#7c3aed', op: 1.0,  t: 7 },
} as const;

export default function AvatarSVG({ grade, size = 200, idle = true }: AvatarSVGProps) {
  const c = R[grade] ?? R.E;
  const t = c.t;
  const g = `g${grade}`;   // glow filter id
  const sg = `sg${grade}`; // strong glow filter id
  const isM = grade === 'Monarque';
  const isN = grade === 'National';

  return (
    <svg
      width={size}
      height={Math.round(size * 1.62)}
      viewBox="0 0 200 324"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft glow */}
        <filter id={g} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Strong glow */}
        <filter id={sg} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Skin */}
        <radialGradient id="skin" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fce8d0"/>
          <stop offset="100%" stopColor="#e0b890"/>
        </radialGradient>

        {/* Eye iris — rank-tinted */}
        <radialGradient id={`ir${grade}`} cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor={t >= 2 ? c.accent : '#a07040'}/>
          <stop offset="50%" stopColor={t >= 2 ? c.eye   : '#6a4020'}/>
          <stop offset="100%" stopColor={t >= 2 ? c.main  : '#3a1808'}/>
        </radialGradient>

        {/* Dark hair */}
        <linearGradient id="hair" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#3d1a60"/>
          <stop offset="45%" stopColor="#1e0e35"/>
          <stop offset="100%" stopColor="#0a0618"/>
        </linearGradient>

        {/* Ground aura */}
        <radialGradient id={`au${grade}`} cx="50%" cy="85%" r="55%">
          <stop offset="0%" stopColor={c.aura} stopOpacity={c.op * 0.7}/>
          <stop offset="100%" stopColor={c.aura} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* ── GROUND AURA ───────────────────────────── */}
      {c.op > 0 && (
        <ellipse cx="100" cy="306" rx="74" ry="18" fill={`url(#au${grade})`}>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.8s" repeatCount="indefinite"/>
        </ellipse>
      )}

      {/* ── MONARQUE: dark vortex backdrop ─────────── */}
      {isM && (
        <g>
          <ellipse cx="100" cy="210" rx="70" ry="105" fill="#06000f" opacity="0.82">
            <animate attributeName="rx" values="70;76;70" dur="3.2s" repeatCount="indefinite"/>
          </ellipse>
          {[0,1,2,3,4,5].map(i => {
            const a = (i/6)*Math.PI*2, rx = 64+i*4, ry = 48+i*3;
            const px = 100+rx*Math.cos(a), py = 210+ry*Math.sin(a)*0.5;
            return <ellipse key={i} cx={px} cy={py} rx="5" ry="9"
              fill="#2a005a" opacity="0.5"
              transform={`rotate(${a*57.3+30} ${px} ${py})`}>
              <animate attributeName="opacity" values="0.3;0.65;0.3"
                dur={`${2.2+i*0.4}s`} repeatCount="indefinite"/>
            </ellipse>;
          })}
        </g>
      )}

      {/* ── MAIN CHARACTER GROUP (idle breathing) ──── */}
      <g style={idle ? { animation:'breathe 4s ease-in-out infinite', transformOrigin:'100px 185px' } : {}}>

        {/* CAPE — National & Monarque */}
        {(isN || isM) && (
          <path
            d={isM
              ? "M56 132 Q42 178 40 244 Q44 278 66 298 Q82 312 100 314 Q118 312 134 298 Q156 278 160 244 Q158 178 144 132 Q122 154 100 152 Q78 154 56 132Z"
              : "M62 134 Q50 174 48 232 Q52 268 72 288 Q87 302 100 304 Q113 302 128 288 Q148 268 152 232 Q150 174 138 134 Q118 154 100 152 Q82 154 62 134Z"
            }
            fill={isM ? "#07000e" : "#0c0618"}
            stroke={c.main} strokeWidth={isM ? "1.8" : "1.2"} opacity={isM ? "0.94" : "0.90"}>
            <animate attributeName="d"
              values={isM
                ? "M56 132 Q42 178 40 244 Q44 278 66 298 Q82 312 100 314 Q118 312 134 298 Q156 278 160 244 Q158 178 144 132 Q122 154 100 152 Q78 154 56 132Z;M56 132 Q40 180 38 246 Q42 280 64 300 Q80 314 100 316 Q120 314 136 300 Q158 280 162 246 Q160 180 144 132 Q122 156 100 154 Q78 156 56 132Z;M56 132 Q42 178 40 244 Q44 278 66 298 Q82 312 100 314 Q118 312 134 298 Q156 278 160 244 Q158 178 144 132 Q122 154 100 152 Q78 154 56 132Z"
                : "M62 134 Q50 174 48 232 Q52 268 72 288 Q87 302 100 304 Q113 302 128 288 Q148 268 152 232 Q150 174 138 134 Q118 154 100 152 Q82 154 62 134Z;M62 134 Q48 176 46 234 Q50 270 70 290 Q85 304 100 306 Q115 304 130 290 Q150 270 154 234 Q152 176 138 134 Q118 156 100 154 Q82 156 62 134Z;M62 134 Q50 174 48 232 Q52 268 72 288 Q87 302 100 304 Q113 302 128 288 Q148 268 152 232 Q150 174 138 134 Q118 154 100 152 Q82 154 62 134Z"
              }
              dur={isM ? "3.5s" : "5s"} repeatCount="indefinite"/>
          </path>
        )}

        {/* ── LEGS ──────────────────────────────────── */}
        {/* Left thigh */}
        <path d={t >= 2
          ? "M77 198 Q72 212 70 234 Q70 252 72 262 L87 263 Q89 252 89 234 Q89 212 87 198Z"
          : "M78 198 Q73 212 72 234 Q72 252 74 262 L88 263 Q90 252 90 234 Q90 212 88 198Z"
        } fill={t >= 2 ? "#1c1440" : (t >= 1 ? "#1a2535" : "#374151")}/>
        {/* Right thigh */}
        <path d={t >= 2
          ? "M123 198 Q128 212 130 234 Q130 252 128 262 L113 263 Q111 252 111 234 Q111 212 113 198Z"
          : "M122 198 Q127 212 128 234 Q128 252 126 262 L112 263 Q110 252 110 234 Q110 212 112 198Z"
        } fill={t >= 2 ? "#1c1440" : (t >= 1 ? "#1a2535" : "#374151")}/>

        {/* Left calf */}
        <path d="M72 260 Q69 276 70 292 Q71 300 77 304 L87 304 Q90 300 90 292 Q89 276 87 260Z"
          fill={t >= 1 ? "#0f1424" : "#1f2937"}/>
        {/* Right calf */}
        <path d="M113 260 Q111 276 110 292 Q111 300 117 304 L127 304 Q130 300 130 292 Q129 276 127 260Z"
          fill={t >= 1 ? "#0f1424" : "#1f2937"}/>

        {/* Boots / shoes */}
        {t >= 1 ? (
          <>
            <path d="M68 300 Q66 308 69 312 Q74 318 84 318 Q90 317 93 313 Q95 308 93 300 Z"
              fill={t >= 2 ? c.main : '#2d3748'} opacity={t >= 2 ? "0.85" : "1"}
              filter={t >= 3 ? `url(#${g})` : undefined}/>
            <path d="M107 300 Q105 308 108 312 Q113 318 123 318 Q129 317 132 313 Q134 308 132 300 Z"
              fill={t >= 2 ? c.main : '#2d3748'} opacity={t >= 2 ? "0.85" : "1"}
              filter={t >= 3 ? `url(#${g})` : undefined}/>
            {/* Boot trim line */}
            {t >= 2 && <>
              <path d="M68 300 Q80 296 93 300" stroke={c.accent} strokeWidth="0.8" opacity="0.6"/>
              <path d="M107 300 Q120 296 132 300" stroke={c.accent} strokeWidth="0.8" opacity="0.6"/>
            </>}
          </>
        ) : (
          <>
            <path d="M67 298 Q65 306 69 310 Q75 314 85 314 Q91 313 93 309 Q95 304 93 298Z" fill="#232d3f"/>
            <path d="M68 302 L93 302" stroke="#374151" strokeWidth="1.5" opacity="0.7"/>
            <path d="M107 298 Q105 306 109 310 Q115 314 125 314 Q131 313 133 309 Q135 304 133 298Z" fill="#232d3f"/>
            <path d="M108 302 L133 302" stroke="#374151" strokeWidth="1.5" opacity="0.7"/>
          </>
        )}

        {/* Knee guards B+ */}
        {t >= 3 && <>
          <path d="M70 252 Q74 247 88 247 Q90 256 89 263 Q74 263 70 252Z"
            fill={c.main} opacity="0.72" filter={`url(#${g})`}/>
          <path d="M112 247 Q126 247 130 252 Q126 263 112 263 Q111 256 112 247Z"
            fill={c.main} opacity="0.72" filter={`url(#${g})`}/>
        </>}

        {/* ── TORSO ─────────────────────────────────── */}
        {/* Body silhouette — feminine waist */}
        <path d="M71 126 Q63 136 61 153 Q60 170 63 184 Q66 195 75 200 Q88 204 100 204 Q112 204 125 200 Q134 195 137 184 Q140 170 139 153 Q137 136 129 126 Q114 120 100 120 Q86 120 71 126Z"
          fill={t >= 2 ? "#1c1440" : (t >= 1 ? "#1a2535" : "#374151")}/>

        {/* ─ E: jacket + t-shirt ─ */}
        {t === 0 && <>
          {/* White t-shirt */}
          <path d="M78 130 Q100 122 122 130 Q120 162 100 168 Q80 162 78 130Z" fill="#f0f4f8" opacity="0.92"/>
          {/* Dark jacket sides */}
          <path d="M61 152 Q63 136 71 126 Q76 123 83 122 L80 134 Q75 138 73 152Z" fill="#1e293b"/>
          <path d="M139 152 Q137 136 129 126 Q124 123 117 122 L120 134 Q125 138 127 152Z" fill="#1e293b"/>
          {/* Jacket lapels */}
          <path d="M83 122 Q100 130 100 138 L96 142 Q89 132 80 134Z" fill="#2d3e54"/>
          <path d="M117 122 Q100 130 100 138 L104 142 Q111 132 120 134Z" fill="#2d3e54"/>
          {/* Jacket lower body */}
          <path d="M63 165 Q66 188 75 198 L63 195 Q60 180 63 165Z" fill="#1e293b"/>
          <path d="M137 165 Q134 188 125 198 L137 195 Q140 180 137 165Z" fill="#1e293b"/>
        </>}

        {/* ─ D: hunter vest ─ */}
        {t === 1 && <>
          <path d="M78 130 Q100 122 122 130 Q120 162 100 168 Q80 162 78 130Z" fill="#0d2010" opacity="0.92"/>
          <path d="M83 131 Q100 124 117 131 Q115 159 100 164 Q85 159 83 131Z" fill="#183520" opacity="0.88"/>
          <rect x="83" y="150" width="13" height="11" rx="2" fill="#112518" stroke="#22c55e" strokeWidth="0.8" opacity="0.75"/>
          <rect x="104" y="150" width="13" height="11" rx="2" fill="#112518" stroke="#22c55e" strokeWidth="0.8" opacity="0.75"/>
          <path d="M100 126 L100 164" stroke="#22c55e" strokeWidth="0.8" opacity="0.55"/>
          <path d="M83 131 L78 130" stroke="#22c55e" strokeWidth="1" opacity="0.4"/>
          <path d="M117 131 L122 130" stroke="#22c55e" strokeWidth="1" opacity="0.4"/>
        </>}

        {/* ─ C: light purple armor ─ */}
        {t === 2 && <>
          <path d="M76 126 Q100 116 124 126 Q122 160 100 168 Q78 160 76 126Z"
            fill="#220f50" stroke="#7c3aed" strokeWidth="1" opacity="0.95"/>
          <path d="M82 130 Q100 120 118 130 Q116 154 100 160 Q84 154 82 130Z"
            fill="#361668" opacity="0.85" filter={`url(#${g})`}/>
          {/* Chest gem */}
          <ellipse cx="100" cy="144" rx="5.5" ry="6.5" fill="#7c3aed" opacity="0.92" filter={`url(#${g})`}/>
          <ellipse cx="100" cy="144" rx="3" ry="4" fill="#c4b5fd" opacity="0.75"/>
          {/* Small shoulder guards */}
          <path d="M63 130 Q70 122 80 126 Q78 140 71 146 Q63 142 63 130Z"
            fill="#220f50" stroke="#7c3aed" strokeWidth="0.9" opacity="0.88"/>
          <path d="M137 130 Q130 122 120 126 Q122 140 129 146 Q137 142 137 130Z"
            fill="#220f50" stroke="#7c3aed" strokeWidth="0.9" opacity="0.88"/>
          {/* Collar details */}
          <path d="M82 130 Q100 122 118 130" stroke="#c4b5fd" strokeWidth="0.8" opacity="0.5"/>
        </>}

        {/* ─ B: reinforced armor ─ */}
        {t === 3 && <>
          <path d="M73 124 Q100 112 127 124 Q125 160 100 168 Q75 160 73 124Z"
            fill="#180840" stroke="#a855f7" strokeWidth="1.4" opacity="0.96"/>
          <path d="M78 127 Q100 115 122 127 Q120 157 100 164 Q80 157 78 127Z"
            fill="#2a1060" opacity="0.88"/>
          {/* Hexagonal chest plate */}
          <path d="M84 132 L100 124 L116 132 L114 152 L100 158 L86 152Z"
            fill="#38156e" stroke="#a855f7" strokeWidth="1.2" opacity="0.95" filter={`url(#${g})`}/>
          <path d="M91 135 L100 129 L109 135" stroke="#a855f7" strokeWidth="0.9" opacity="0.75"/>
          <path d="M89 143 L100 138 L111 143" stroke="#a855f7" strokeWidth="0.9" opacity="0.55"/>
          {/* Rhombus chest crystal */}
          <polygon points="100,135 105,142 100,149 95,142" fill="#a855f7" opacity="0.92" filter={`url(#${g})`}/>
          <polygon points="100,137 104,142 100,147 96,142" fill="#d8b4fe" opacity="0.8"/>
          {/* Shoulder guards */}
          <path d="M60 128 Q68 118 80 122 Q78 138 70 146 Q60 142 60 128Z"
            fill="#2a1060" stroke="#a855f7" strokeWidth="1.2" opacity="0.92"/>
          <path d="M140 128 Q132 118 120 122 Q122 138 130 146 Q140 142 140 128Z"
            fill="#2a1060" stroke="#a855f7" strokeWidth="1.2" opacity="0.92"/>
          {/* Shoulder trim */}
          <path d="M61 136 Q65 130 76 130" stroke="#d8b4fe" strokeWidth="0.8" opacity="0.55"/>
          <path d="M139 136 Q135 130 124 130" stroke="#d8b4fe" strokeWidth="0.8" opacity="0.55"/>
        </>}

        {/* ─ A: elite armor with gold ─ */}
        {t === 4 && <>
          <path d="M69 122 Q100 108 131 122 Q129 162 100 170 Q71 162 69 122Z"
            fill="#150a00" stroke="#f59e0b" strokeWidth="1.6" opacity="0.97"/>
          <path d="M74 125 Q100 112 126 125 Q123 158 100 166 Q77 158 74 125Z"
            fill="#241400" opacity="0.9"/>
          <path d="M81 130 Q100 118 119 130" stroke="#f59e0b" strokeWidth="1.6" opacity="0.85" filter={`url(#${g})`}/>
          <path d="M79 142 Q100 133 121 142" stroke="#f59e0b" strokeWidth="1.1" opacity="0.65" filter={`url(#${g})`}/>
          <path d="M80 154 Q100 147 120 154" stroke="#f59e0b" strokeWidth="0.9" opacity="0.45"/>
          {/* Star medallion */}
          <circle cx="100" cy="143" r="9" fill="#150a00" stroke="#f59e0b" strokeWidth="1.6" filter={`url(#${g})`}/>
          <polygon points="100,136 102,141 107,141 103,144 105,149 100,146 95,149 97,144 93,141 98,141"
            fill="#f59e0b" opacity="0.95"/>
          {/* Shoulder guards — large */}
          <path d="M58 122 Q66 110 80 118 Q77 136 67 146 Q56 140 58 122Z"
            fill="#150a00" stroke="#f59e0b" strokeWidth="1.6" opacity="0.97" filter={`url(#${g})`}/>
          <path d="M142 122 Q134 110 120 118 Q123 136 133 146 Q144 140 142 122Z"
            fill="#150a00" stroke="#f59e0b" strokeWidth="1.6" opacity="0.97" filter={`url(#${g})`}/>
          <path d="M59 130 Q64 124 76 124" stroke="#fde68a" strokeWidth="1" opacity="0.65"/>
          <path d="M141 130 Q136 124 124 124" stroke="#fde68a" strokeWidth="1" opacity="0.65"/>
        </>}

        {/* ─ S: black armor + cyan runes ─ */}
        {t === 5 && <>
          <path d="M66 120 Q100 104 134 120 Q132 164 100 173 Q68 164 66 120Z"
            fill="#030c14" stroke="#06b6d4" strokeWidth="2" opacity="0.99"/>
          <path d="M71 123 Q100 108 129 123 Q126 159 100 167 Q74 159 71 123Z"
            fill="#04111e" opacity="0.96"/>
          {/* Rune engravings */}
          <path d="M79 128 L84 122 L100 116 L116 122 L121 128" stroke="#06b6d4" strokeWidth="1.6" opacity="0.92" filter={`url(#${g})`}/>
          <path d="M75 141 L80 133 L100 128 L120 133 L125 141" stroke="#06b6d4" strokeWidth="1.2" opacity="0.72" filter={`url(#${g})`}/>
          <path d="M77 153 L81 147 L100 143 L119 147 L123 153" stroke="#06b6d4" strokeWidth="0.9" opacity="0.52" filter={`url(#${g})`}/>
          {/* Central sigil */}
          <path d="M96 128 L104 128 M100 124 L100 132" stroke="#06b6d4" strokeWidth="2.2" opacity="0.96" filter={`url(#${sg})`}/>
          <circle cx="100" cy="128" r="5.5" fill="none" stroke="#67e8f9" strokeWidth="1.2" opacity="0.75"/>
          {/* Shoulder guards — very large */}
          <path d="M55 118 Q63 104 80 114 Q77 134 64 146 Q53 140 55 118Z"
            fill="#030c14" stroke="#06b6d4" strokeWidth="2" opacity="0.99" filter={`url(#${g})`}/>
          <path d="M145 118 Q137 104 120 114 Q123 134 136 146 Q147 140 145 118Z"
            fill="#030c14" stroke="#06b6d4" strokeWidth="2" opacity="0.99" filter={`url(#${g})`}/>
          <path d="M57 126 Q62 120 76 120" stroke="#67e8f9" strokeWidth="1" opacity="0.65"/>
          <path d="M143 126 Q138 120 124 120" stroke="#67e8f9" strokeWidth="1" opacity="0.65"/>
        </>}

        {/* ─ National: dark crimson armor ─ */}
        {t === 6 && <>
          <path d="M64 118 Q100 102 136 118 Q134 164 100 174 Q66 164 64 118Z"
            fill="#0d0000" stroke="#dc2626" strokeWidth="2.2" opacity="0.99"/>
          <path d="M69 122 Q100 107 131 122 Q128 159 100 169 Q72 159 69 122Z"
            fill="#160000" opacity="0.92"/>
          <path d="M77 128 Q100 116 123 128" stroke="#dc2626" strokeWidth="2.2" opacity="0.92" filter={`url(#${g})`}/>
          <path d="M74 141 Q100 131 126 141" stroke="#dc2626" strokeWidth="1.6" opacity="0.72" filter={`url(#${g})`}/>
          <path d="M76 153 Q100 145 124 153" stroke="#dc2626" strokeWidth="1" opacity="0.52"/>
          {/* Cross sigil */}
          <path d="M95 133 L105 133 M100 128 L100 138" stroke="#dc2626" strokeWidth="2.5" opacity="0.97" filter={`url(#${sg})`}/>
          <circle cx="100" cy="133" r="7" fill="none" stroke="#dc2626" strokeWidth="1.8" opacity="0.82" filter={`url(#${g})`}/>
          {/* Massive shoulder armor */}
          <path d="M53 116 Q60 100 80 112 Q77 134 61 148 Q50 142 53 116Z"
            fill="#0d0000" stroke="#dc2626" strokeWidth="2.2" opacity="0.99" filter={`url(#${g})`}/>
          <path d="M147 116 Q140 100 120 112 Q123 134 139 148 Q150 142 147 116Z"
            fill="#0d0000" stroke="#dc2626" strokeWidth="2.2" opacity="0.99" filter={`url(#${g})`}/>
          {/* Shoulder spikes */}
          <path d="M56 114 L51 102 L58 110Z" fill="#dc2626" opacity="0.82" filter={`url(#${g})`}/>
          <path d="M144 114 L149 102 L142 110Z" fill="#dc2626" opacity="0.82" filter={`url(#${g})`}/>
        </>}

        {/* ─ Monarque: shadow-rune armor ─ */}
        {t === 7 && <>
          <path d="M62 116 Q100 98 138 116 Q136 166 100 177 Q64 166 62 116Z"
            fill="#050008" stroke="#7c3aed" strokeWidth="2.8" opacity="0.99"/>
          <path d="M67 120 Q100 103 133 120 Q130 162 100 172 Q70 162 67 120Z"
            fill="#0c0018" opacity="0.92"/>
          {/* Purple rune lines */}
          <path d="M74 126 L80 118 L100 112 L120 118 L126 126" stroke="#7c3aed" strokeWidth="2.2" opacity="0.96" filter={`url(#${g})`}/>
          <path d="M71 139 L77 130 L100 124 L123 130 L129 139" stroke="#7c3aed" strokeWidth="1.6" opacity="0.80" filter={`url(#${g})`}/>
          <path d="M72 151 L78 144 L100 138 L122 144 L128 151" stroke="#7c3aed" strokeWidth="1.2" opacity="0.62" filter={`url(#${g})`}/>
          <path d="M73 163 L79 157 L100 151 L121 157 L127 163" stroke="#7c3aed" strokeWidth="0.8" opacity="0.42" filter={`url(#${g})`}/>
          {/* Central runic eye */}
          <text x="100" y="140" fontSize="16" fill="#7c3aed" fontFamily="serif" textAnchor="middle"
            filter={`url(#${sg})`} opacity="0.98">ᚱ</text>
          {/* Corrupted shoulder armor with shadow spikes */}
          <path d="M51 114 Q58 96 80 110 Q77 134 58 150 Q46 144 51 114Z"
            fill="#050008" stroke="#7c3aed" strokeWidth="2.8" opacity="0.99" filter={`url(#${g})`}/>
          <path d="M149 114 Q142 96 120 110 Q123 134 142 150 Q154 144 149 114Z"
            fill="#050008" stroke="#7c3aed" strokeWidth="2.8" opacity="0.99" filter={`url(#${g})`}/>
          {/* Shadow spikes */}
          <path d="M53 108 L46 94 L55 104 L48 92 L57 102Z" fill="#7c3aed" opacity="0.72" filter={`url(#${sg})`}/>
          <path d="M147 108 L154 94 L145 104 L152 92 L143 102Z" fill="#7c3aed" opacity="0.72" filter={`url(#${sg})`}/>
        </>}

        {/* ── BELT ────────────────────────────────── */}
        {t === 0 && <rect x="74" y="196" width="52" height="7" rx="3" fill="#1e293b"/>}
        {t >= 1 && (
          <path d="M73 197 Q100 193 127 197 L127 204 Q100 208 73 204Z"
            fill={t >= 2 ? c.main : '#374151'} opacity={t >= 2 ? "0.82" : "1"}
            filter={t >= 3 ? `url(#${g})` : undefined}/>
        )}
        {t >= 2 && (
          <rect x="96" y="195" width="8" height="9" rx="2"
            fill={c.accent} opacity="0.85" filter={`url(#${g})`}/>
        )}

        {/* ── ARMS ────────────────────────────────── */}
        {/* Left upper arm */}
        <path d="M63 130 Q56 134 52 150 Q50 164 54 178 Q58 185 65 186 L72 182 Q70 172 68 162 Q66 148 65 134Z"
          fill={t >= 2 ? "#1c1440" : (t >= 1 ? "#1a2535" : "#374151")}/>
        {/* Right upper arm */}
        <path d="M137 130 Q144 134 148 150 Q150 164 146 178 Q142 185 135 186 L128 182 Q130 172 132 162 Q134 148 135 134Z"
          fill={t >= 2 ? "#1c1440" : (t >= 1 ? "#1a2535" : "#374151")}/>

        {/* Left forearm */}
        <path d="M54 176 Q49 184 49 196 Q49 207 53 213 Q57 217 64 215 Q69 211 70 202 Q70 191 66 182Z"
          fill={t >= 1 ? "#0f1424" : "#1f2937"}/>
        {/* Right forearm */}
        <path d="M146 176 Q151 184 151 196 Q151 207 147 213 Q143 217 136 215 Q131 211 130 202 Q130 191 134 182Z"
          fill={t >= 1 ? "#0f1424" : "#1f2937"}/>

        {/* Gauntlets B+ */}
        {t >= 3 && <>
          <path d="M47 195 Q49 188 53 186 Q60 184 65 188 Q68 194 68 203 Q66 212 61 214 Q55 214 51 209 Q47 203 47 195Z"
            fill="#1c1440" stroke={c.main} strokeWidth="1.3" opacity="0.92" filter={`url(#${g})`}/>
          <path d="M153 195 Q151 188 147 186 Q140 184 135 188 Q132 194 132 203 Q134 212 139 214 Q145 214 149 209 Q153 203 153 195Z"
            fill="#1c1440" stroke={c.main} strokeWidth="1.3" opacity="0.92" filter={`url(#${g})`}/>
          <path d="M49 199 L66 199" stroke={c.main} strokeWidth="0.9" opacity="0.58"/>
          <path d="M134 199 L151 199" stroke={c.main} strokeWidth="0.9" opacity="0.58"/>
        </>}

        {/* Hands (visible for lower tiers) */}
        {t < 3 && <>
          <ellipse cx="58" cy="216" rx="8" ry="5" fill="url(#skin)"/>
          <ellipse cx="142" cy="216" rx="8" ry="5" fill="url(#skin)"/>
        </>}

        {/* ── BACK HAIR ───────────────────────────── */}
        <path d={
          t <= 1
            ? "M63 76 Q66 98 63 126 Q74 148 100 150 Q126 148 137 126 Q134 98 137 76 Q118 108 100 110 Q82 108 63 76Z"
            : t <= 3
            ? "M58 72 Q60 100 55 130 Q66 158 100 162 Q134 158 145 130 Q140 100 142 72 Q120 112 100 114 Q80 112 58 72Z"
            : t <= 5
            ? "M53 68 Q53 100 47 134 Q57 165 100 170 Q143 165 153 134 Q147 100 147 68 Q122 118 100 120 Q78 118 53 68Z"
            : "M47 64 Q45 98 39 138 Q47 170 100 176 Q153 170 161 138 Q155 98 153 64 Q124 124 100 126 Q76 124 47 64Z"
        } fill="url(#hair)"/>

        {/* ── NECK ────────────────────────────────── */}
        <path d="M92 106 Q96 104 100 104 Q104 104 108 106 L110 124 Q104 126 100 127 Q96 126 90 124Z"
          fill="url(#skin)"/>
        <path d="M97 106 L100 104 L103 106 L104 110 L100 111 L96 110Z" fill="#d4a880" opacity="0.35"/>

        {/* ── FACE ────────────────────────────────── */}
        <path d="M100 24 Q120 24 132 38 Q141 50 140 67 Q139 80 134 90 Q129 101 121 108 Q112 114 100 116 Q88 114 79 108 Q71 101 66 90 Q61 80 60 67 Q59 50 68 38 Q80 24 100 24Z"
          fill="url(#skin)"/>
        {/* Cheek shadow */}
        <path d="M67 70 Q64 82 66 91 Q69 87 73 88 Q71 80 67 70Z" fill="#d0946a" opacity="0.18"/>
        <path d="M133 70 Q136 82 134 91 Q131 87 127 88 Q129 80 133 70Z" fill="#d0946a" opacity="0.18"/>
        {/* Ears */}
        <path d="M61 63 Q57 66 57 72 Q57 79 61 82 Q64 80 65 75 Q65 69 61 63Z" fill="#e8c0a0"/>
        <path d="M139 63 Q143 66 143 72 Q143 79 139 82 Q136 80 135 75 Q135 69 139 63Z" fill="#e8c0a0"/>

        {/* ── EYEBROWS ────────────────────────────── */}
        <path d={t >= 5 ? "M69 56 Q78 50 89 52" : "M70 57 Q79 52 89 54"}
          stroke="#18082a" strokeWidth={t >= 4 ? "2.8" : "2.2"} fill="none" strokeLinecap="round"/>
        <path d={t >= 5 ? "M111 52 Q122 50 131 56" : "M111 54 Q121 52 130 57"}
          stroke="#18082a" strokeWidth={t >= 4 ? "2.8" : "2.2"} fill="none" strokeLinecap="round"/>
        {/* Eyebrow highlight */}
        <path d="M72 57 Q79 53 87 55" stroke="#3a1a5a" strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M113 55 Q121 53 128 57" stroke="#3a1a5a" strokeWidth="0.8" fill="none" opacity="0.5"/>

        {/* ── LEFT EYE ────────────────────────────── */}
        {/* Eye white */}
        <path d="M70 66 Q78 59 90 62 Q95 66 94 73 Q92 80 85 83 Q78 84 72 80 Q67 75 70 66Z" fill="white"/>
        {/* Iris */}
        <ellipse cx="81" cy="72" rx="6.5" ry="7.5" fill={`url(#ir${grade})`}/>
        {/* Upper lid shadow */}
        <path d="M70 66 Q79 59 90 62 Q89 67 81 66 Q73 65 70 66Z" fill="#08061a" opacity="0.42"/>
        {/* Pupil */}
        <ellipse cx="81" cy="73" rx="3.2" ry="3.8" fill="#03000a"/>
        {/* Main reflection */}
        <ellipse cx="84.5" cy="67" rx="2.2" ry="1.6" fill="white" opacity="0.96"/>
        {/* Secondary reflection */}
        <circle cx="77.5" cy="70" r="1.1" fill="white" opacity="0.55"/>
        {/* Upper lid */}
        <path d="M69 66 Q79 58 91 62" stroke="#08061a" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        {/* Lower lid */}
        <path d="M70 77 Q80 84 92 79" stroke="#08061a" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.65"/>
        {/* Eyelashes — upper */}
        <path d="M69 66 Q67 61 65 59" stroke="#04000e" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M72 62 Q71 57 70 55" stroke="#04000e" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M76 60 Q76 55 76 53" stroke="#04000e" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M81 59 Q82 54 82 52" stroke="#04000e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M86 60 Q87 55 88 53" stroke="#04000e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M90 63 Q92 59 93 57" stroke="#04000e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

        {/* ── RIGHT EYE ───────────────────────────── */}
        <path d="M130 66 Q122 59 110 62 Q105 66 106 73 Q108 80 115 83 Q122 84 128 80 Q133 75 130 66Z" fill="white"/>
        <ellipse cx="119" cy="72" rx="6.5" ry="7.5" fill={`url(#ir${grade})`}/>
        <path d="M130 66 Q121 59 110 62 Q111 67 119 66 Q127 65 130 66Z" fill="#08061a" opacity="0.42"/>
        <ellipse cx="119" cy="73" rx="3.2" ry="3.8" fill="#03000a"/>
        <ellipse cx="122.5" cy="67" rx="2.2" ry="1.6" fill="white" opacity="0.96"/>
        <circle cx="115.5" cy="70" r="1.1" fill="white" opacity="0.55"/>
        <path d="M131 66 Q121 58 109 62" stroke="#08061a" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M130 77 Q120 84 108 79" stroke="#08061a" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.65"/>
        <path d="M131 66 Q133 61 135 59" stroke="#04000e" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M128 62 Q129 57 130 55" stroke="#04000e" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M124 60 Q124 55 124 53" stroke="#04000e" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M119 59 Q118 54 118 52" stroke="#04000e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M114 60 Q113 55 112 53" stroke="#04000e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M110 63 Q108 59 107 57" stroke="#04000e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

        {/* Eye color glow — C+ */}
        {t >= 2 && <>
          <ellipse cx="81" cy="72" rx="8" ry="9" fill={c.eye} opacity="0.14" filter={`url(#${g})`}>
            <animate attributeName="opacity" values="0.08;0.22;0.08" dur="2.6s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="119" cy="72" rx="8" ry="9" fill={c.eye} opacity="0.14" filter={`url(#${g})`}>
            <animate attributeName="opacity" values="0.08;0.22;0.08" dur="2.6s" repeatCount="indefinite"/>
          </ellipse>
        </>}
        {/* Intense glow — S+ */}
        {t >= 5 && <>
          <ellipse cx="81" cy="72" rx="10" ry="11" fill={c.eye} opacity="0.32" filter={`url(#${sg})`}>
            <animate attributeName="opacity" values="0.2;0.48;0.2" dur="1.8s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="119" cy="72" rx="10" ry="11" fill={c.eye} opacity="0.32" filter={`url(#${sg})`}>
            <animate attributeName="opacity" values="0.2;0.48;0.2" dur="1.8s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="81" cy="72" rx="3.5" ry="4" fill={c.accent} opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.72;0.3" dur="1.5s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="119" cy="72" rx="3.5" ry="4" fill={c.accent} opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.72;0.3" dur="1.5s" repeatCount="indefinite"/>
          </ellipse>
        </>}

        {/* ── NOSE ────────────────────────────────── */}
        <path d="M97 81 Q100 84 103 81" stroke="#c4886a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <circle cx="97.5" cy="84" r="1.1" fill="#c4886a" opacity="0.55"/>
        <circle cx="102.5" cy="84" r="1.1" fill="#c4886a" opacity="0.55"/>

        {/* ── MOUTH ───────────────────────────────── */}
        <path d="M93 93 Q100 98 107 93" stroke="#b06858" strokeWidth="1.9" fill="none" strokeLinecap="round"/>
        <path d="M94 93 Q100 95 106 93" stroke="#cc8070" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
        <path d="M97 96 Q100 98 103 96" stroke="#d4a090" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.5"/>

        {/* ── FRONT HAIR ──────────────────────────── */}
        {/* Forehead center bang */}
        <path d="M84 24 Q88 18 100 16 Q112 18 116 24 Q108 28 100 26 Q92 28 84 24Z" fill="url(#hair)"/>

        {/* E: natural flowing side locks */}
        {t === 0 && <>
          <path d="M62 50 Q63 64 63 82 Q63 94 65 100 Q62 88 60 74 Q58 60 60 44Z" fill="url(#hair)"/>
          <path d="M138 50 Q137 64 137 82 Q137 94 135 100 Q138 88 140 74 Q142 60 140 44Z" fill="url(#hair)"/>
          <path d="M63 52 Q68 46 76 42 Q72 50 69 60 Q66 70 63 78 Q61 64 63 52Z" fill="#2c1850"/>
          <path d="M137 52 Q132 46 124 42 Q128 50 131 60 Q134 70 137 78 Q139 64 137 52Z" fill="#2c1850"/>
        </>}

        {/* D: partial ponytail with strands */}
        {t === 1 && <>
          <path d="M62 50 Q63 65 63 84 Q63 96 65 103 Q62 90 60 76 Q58 62 60 44Z" fill="url(#hair)"/>
          <path d="M138 50 Q137 65 137 84 Q137 96 135 103 Q138 90 140 76 Q142 62 140 44Z" fill="url(#hair)"/>
          {/* Ponytail strap */}
          <path d="M88 36 Q100 33 112 36 L112 42 Q100 39 88 42Z" fill="#180e28"/>
          <path d="M88 38 Q100 35 112 38" stroke="#22c55e" strokeWidth="0.9" opacity="0.55"/>
        </>}

        {/* C/B: fuller, decorated */}
        {(t === 2 || t === 3) && <>
          <path d="M59 46 Q59 66 56 88 Q56 100 60 108 Q57 94 56 78 Q55 62 57 42Z" fill="url(#hair)"/>
          <path d="M141 46 Q141 66 144 88 Q144 100 140 108 Q143 94 144 78 Q145 62 143 42Z" fill="url(#hair)"/>
          <path d="M59 54 Q64 48 71 46 Q67 56 62 68 Q59 78 58 86 Q56 70 59 54Z" fill="#2c1850"/>
          <path d="M141 54 Q136 48 129 46 Q133 56 138 68 Q141 78 142 86 Q144 70 141 54Z" fill="#2c1850"/>
          {/* Hair ornament */}
          {t === 2
            ? <circle cx="68" cy="49" r="4.5" fill={c.main} opacity="0.85" filter={`url(#${g})`}/>
            : <polygon points="68,43 73,52 63,52" fill={c.main} opacity="0.88" filter={`url(#${g})`}/>
          }
        </>}

        {/* A: wind-blown dramatic */}
        {t === 4 && <>
          <path d="M57 42 Q55 64 52 88 Q51 102 55 112 Q53 96 52 80 Q51 63 53 44Z" fill="url(#hair)"/>
          <path d="M143 42 Q145 64 148 88 Q149 102 145 112 Q147 96 148 80 Q149 63 147 44Z" fill="url(#hair)"/>
          <path d="M57 50 Q62 44 70 42 Q66 54 61 66 Q57 78 55 88 Q53 72 57 50Z" fill="#2c1850"/>
          <path d="M143 50 Q138 44 130 42 Q134 54 139 66 Q143 78 145 88 Q147 72 143 50Z" fill="#2c1850"/>
          {/* Wind-displaced strand */}
          <path d="M56 62 Q48 72 45 85" stroke="#2c1850" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8"/>
          <path d="M144 62 Q152 72 155 85" stroke="#2c1850" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8"/>
          <path d="M56 62 Q48 72 45 85" stroke="#4a2a74" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
        </>}

        {/* S: energy-tipped hair */}
        {t === 5 && <>
          <path d="M54 40 Q50 65 45 92 Q44 108 48 118 Q46 102 47 84 Q48 66 51 42Z" fill="url(#hair)"/>
          <path d="M146 40 Q150 65 155 92 Q156 108 152 118 Q154 102 153 84 Q152 66 149 42Z" fill="url(#hair)"/>
          <path d="M55 48 Q60 42 68 40 Q63 54 57 68 Q52 80 50 90 Q48 74 55 48Z" fill="#2c1850"/>
          <path d="M145 48 Q140 42 132 40 Q137 54 143 68 Q148 80 150 90 Q152 74 145 48Z" fill="#2c1850"/>
          {/* Glowing tips */}
          <path d="M45 104 Q43 114 41 122" stroke={c.main} strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.75" filter={`url(#${g})`}/>
          <path d="M48 108 Q46 116 45 122" stroke={c.accent} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.65"/>
          <path d="M155 104 Q157 114 159 122" stroke={c.main} strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.75" filter={`url(#${g})`}/>
          <path d="M152 108 Q154 116 155 122" stroke={c.accent} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.65"/>
        </>}

        {/* National / Monarque: dramatic floating */}
        {t >= 6 && <>
          <path d={t === 7
            ? "M49 36 Q43 64 36 95 Q34 114 38 126"
            : "M51 38 Q45 62 40 92 Q38 110 42 124"
          } stroke="#2c1850" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.9"/>
          <path d={t === 7
            ? "M151 36 Q157 64 164 95 Q166 114 162 126"
            : "M149 38 Q155 62 160 92 Q162 110 158 124"
          } stroke="#2c1850" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.9"/>
          <path d={t === 7
            ? "M49 36 Q43 64 36 95 Q34 114 38 126"
            : "M51 38 Q45 62 40 92 Q38 110 42 124"
          } stroke="#4a2a74" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55"/>
          <path d={t === 7
            ? "M151 36 Q157 64 164 95 Q166 114 162 126"
            : "M149 38 Q155 62 160 92 Q162 110 158 124"
          } stroke="#4a2a74" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55"/>
          {/* Extra wild Monarque strands */}
          {t === 7 && <>
            <path d="M42 80 Q34 94 30 112" stroke={c.main} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.65" filter={`url(#${g})`}/>
            <path d="M158 80 Q166 94 170 112" stroke={c.main} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.65" filter={`url(#${g})`}/>
          </>}
          {/* Energy tips */}
          <path d="M37 116 Q34 126 32 134" stroke={c.main} strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.82" filter={`url(#${sg})`}/>
          <path d="M163 116 Q166 126 168 134" stroke={c.main} strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.82" filter={`url(#${sg})`}/>
          <path d="M41 120 Q38 128 37 135" stroke={c.accent} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.72"/>
          <path d="M159 120 Q162 128 163 135" stroke={c.accent} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.72"/>
        </>}

        {/* Hair highlights */}
        <path d="M86 18 Q100 14 114 18 Q109 24 100 22 Q91 24 86 18Z" fill="#4e2a84" opacity="0.48"/>
        <path d="M68 40 Q72 34 80 32 Q76 40 72 46Z" fill="#3e1e6a" opacity="0.42"/>
        <path d="M132 40 Q128 34 120 32 Q124 40 128 46Z" fill="#3e1e6a" opacity="0.42"/>

        {/* ── HIGH-TIER BODY AURA WISPS ────────────── */}
        {t >= 5 && <>
          <ellipse cx="64" cy="175" rx="13" ry="22" fill={c.aura} opacity="0.12" filter={`url(#${g})`}>
            <animate attributeName="opacity" values="0.07;0.2;0.07" dur="2.4s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="136" cy="175" rx="13" ry="22" fill={c.aura} opacity="0.12" filter={`url(#${g})`}>
            <animate attributeName="opacity" values="0.07;0.2;0.07" dur="3s" repeatCount="indefinite"/>
          </ellipse>
        </>}

      </g>{/* end main group */}

      {/* ── S RANK: floating runes ───────────────── */}
      {t === 5 && (
        <g filter={`url(#${g})`}>
          {['ᚠ','ᚢ','ᚦ','ᚨ'].map((r, i) => (
            <text key={i} x={54+i*32} y="185" fontSize="11"
              fill={c.main} fontFamily="serif" textAnchor="middle" opacity="0.82">
              {r}
              <animate attributeName="y" values="185;174;185"
                dur={`${2.6+i*0.4}s`} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.45;0.92;0.45"
                dur={`${2.2+i*0.35}s`} repeatCount="indefinite"/>
            </text>
          ))}
        </g>
      )}

      {/* ── NATIONAL: orbiting crystals ─────────── */}
      {t === 6 && [0,1,2,3].map(i => {
        const a = (i/4)*Math.PI*2 + Math.PI/10;
        const cx = 100+65*Math.cos(a), cy = 174+40*Math.sin(a);
        return (
          <g key={i} filter={`url(#${g})`}>
            <polygon
              points={`${cx},${cy-11} ${cx+7},${cy-3} ${cx+11},${cy+3} ${cx},${cy+11} ${cx-11},${cy+3} ${cx-7},${cy-3}`}
              fill="none" stroke={c.main} strokeWidth="1.9" opacity="0.92">
              <animate attributeName="opacity" values="0.4;1;0.4"
                dur={`${2.1+i*0.4}s`} repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="rotate"
                from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`}
                dur={`${5.5+i*0.9}s`} repeatCount="indefinite"/>
            </polygon>
            <circle cx={cx} cy={cy} r="3.8" fill={c.accent} opacity="0.88">
              <animate attributeName="r" values="2.8;4.8;2.8"
                dur={`${1.9+i*0.3}s`} repeatCount="indefinite"/>
            </circle>
          </g>
        );
      })}

      {/* ── MONARQUE: orbiting rune sigils ──────── */}
      {t === 7 && [...Array(8)].map((_, i) => {
        const a = (i/8)*Math.PI*2;
        const r = 66+(i%3)*12;
        const px = 100+r*Math.cos(a), py = 196+r*0.44*Math.sin(a);
        return (
          <text key={i} x={px} y={py} fontSize="10"
            fill={c.accent} fontFamily="serif" opacity="0.72"
            textAnchor="middle" filter={`url(#${sg})`}>
            {['ᚱ','ᛏ','ᚨ','ᛊ','ᚠ','ᛟ','ᚦ','ᚢ'][i]}
            <animate attributeName="opacity" values="0.3;0.88;0.3"
              dur={`${1.7+i*0.25}s`} repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="rotate"
              from="0 100 196" to="360 100 196"
              dur="15s" repeatCount="indefinite"/>
          </text>
        );
      })}

      {/* ── MONARQUE: rune crown ─────────────────── */}
      {t === 7 && (
        <g filter={`url(#${sg})`}>
          <path d="M76 20 L87 10 L100 6 L113 10 L124 20 L120 25 L100 15 L80 25Z"
            fill="none" stroke={c.main} strokeWidth="2.2">
            <animate attributeName="stroke-opacity" values="0.45;1;0.45" dur="1.6s" repeatCount="indefinite"/>
          </path>
          {[80,90,100,110,120].map((x,i) => (
            <circle key={i} cx={x} cy={18+Math.sin(i*1.2)*4} r="2.8" fill={c.accent}>
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
