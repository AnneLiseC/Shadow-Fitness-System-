'use client';
import { motion } from 'framer-motion';
import { Grade, getXPProgress, getXPForNextGrade } from '@/lib/grades';

interface XPBarProps {
  xp: number;
  grade: Grade;
}

export default function XPBar({ xp, grade }: XPBarProps) {
  const progress = getXPProgress(xp, grade);
  const nextXP = getXPForNextGrade(grade);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1 font-rajdhani">
        <span>XP {xp.toLocaleString()}</span>
        <span>Prochain rang: {nextXP.toLocaleString()}</span>
      </div>
      <div className="h-3 bg-gray-900 rounded-full border border-gray-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="h-full rounded-full relative"
          style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }}>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full"
            style={{ boxShadow: '0 0 8px #06b6d4, 0 0 16px #7c3aed' }} />
          {/* Shimmer */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 animate-shimmer"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }} />
          </div>
        </motion.div>
      </div>
      <div className="text-center text-xs text-violet-400 mt-1 font-rajdhani">
        {progress}% vers rang suivant
      </div>
    </div>
  );
}
