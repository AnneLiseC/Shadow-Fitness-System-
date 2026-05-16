export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-violet-400 font-orbitron text-xs uppercase tracking-widest">Chargement...</p>
      </div>
    </div>
  );
}
