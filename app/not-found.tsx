import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
      <div className="text-6xl mb-6 opacity-20">⬡</div>
      <h1 className="font-orbitron text-cyan-400 text-2xl uppercase tracking-widest mb-4">
        404
      </h1>
      <p className="text-gray-400 font-rajdhani mb-8">
        Le Système ne trouve pas cette page, Chasseuse.
      </p>
      <Link href="/dashboard"
        className="px-6 py-3 bg-violet-800 border border-violet-500 text-white font-orbitron uppercase tracking-wider rounded hover:bg-violet-700">
        Retour à la base
      </Link>
    </div>
  );
}
