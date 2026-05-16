export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#000000" }}
    >
      <div className="flex flex-col items-center gap-6">
        <div
          className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-violet-500 border-b-transparent border-l-transparent animate-spin"
          style={{ boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)" }}
        />
        <p
          className="font-orbitron text-xs uppercase tracking-[0.3em]"
          style={{ color: "#7c3aed", textShadow: "0 0 12px #7c3aed" }}
        >
          Chargement du Système...
        </p>
      </div>
    </div>
  );
}
