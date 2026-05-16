'use client';
import { motion } from 'motion/react';

interface WaterTrackerProps {
  glasses: number;
  target: number;
  onAdd: () => void;
}

export default function WaterTracker({ glasses, target, onAdd }: WaterTrackerProps) {
  const pct = Math.min((glasses / target) * 100, 100);
  const liters = (glasses * 0.25).toFixed(2);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-cyan-400 font-orbitron text-xs uppercase tracking-wider">💧 Hydratation</span>
        <span className="text-white text-sm font-rajdhani">{liters}L / {(target * 0.25).toFixed(1)}L</span>
      </div>
      <div className="h-4 bg-gray-900 rounded-full border border-cyan-900 overflow-hidden mb-2">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #0891b2, #06b6d4)' }} />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {Array.from({ length: Math.min(target, 12) }, (_, i) => (
            <div key={i}
              className={`w-3 h-5 rounded-sm border ${i < glasses ? 'bg-cyan-400 border-cyan-300' : 'bg-gray-800 border-gray-700'}`}
              style={i < glasses ? { boxShadow: '0 0 4px #06b6d4' } : {}} />
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onAdd}
          className="ml-auto px-3 py-1 bg-cyan-900 border border-cyan-500 text-cyan-300 text-xs rounded font-orbitron uppercase tracking-wider hover:bg-cyan-800 transition-colors"
          style={{ boxShadow: '0 0 8px rgba(6,182,212,0.3)' }}>
          +1 verre
        </motion.button>
      </div>
    </div>
  );
}
