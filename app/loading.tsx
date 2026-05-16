export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#000000" }}
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Scan line */}
        <div
          className="absolute left-0 right-0 h-px bg-cyan-400 opacity-60 animate-scanline"
          style={{ top: "0%" }}
        />

        {/* Spinner circulaire */}
        <div className="relative">
          <div
            className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-violet-500 border-b-transparent border-l-transparent animate-spin"
            style={{ boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
        </div>

        {/* Texte Orbitron */}
        <p
          className="font-orbitron text-xs uppercase tracking-[0.3em]"
          style={{
            color: "#7c3aed",
            textShadow: "0 0 12px #7c3aed",
          }}
        >
          Chargement du Système...
        </p>

        {/* Runes décoratives */}
        <div className="flex gap-4 opacity-20 text-violet-500 text-lg">
          <span>ᚱ</span>
          <span>ᚷ</span>
          <span>ᚹ</span>
          <span>ᚾ</span>
          <span>ᛁ</span>
        </div>
      </div>
    </div>
  );
}
