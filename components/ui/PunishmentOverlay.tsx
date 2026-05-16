'use client';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

interface PunishmentOverlayProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export default function PunishmentOverlay({ visible, message, onClose }: PunishmentOverlayProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onClose, 6000);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-95"
          onClick={onClose}>

          {/* Flash rouge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0, 0.3, 0] }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-red-600 pointer-events-none" />

          {/* Yeux violets qui s'ouvrent */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 0.8, 1] }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-8">
            <svg width="160" height="60" viewBox="0 0 160 60">
              {/* Œil gauche */}
              <ellipse cx="45" cy="30" rx="35" ry="22" fill="#0a0014" stroke="#7c3aed" strokeWidth="2" />
              <ellipse cx="45" cy="30" rx="18" ry="15" fill="#7c3aed">
                <animate attributeName="ry" values="15;12;15" dur="2s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="45" cy="30" rx="8" ry="9" fill="#000000" />
              <ellipse cx="40" cy="26" rx="3" ry="2" fill="#a855f7" opacity="0.6" />

              {/* Œil droit */}
              <ellipse cx="115" cy="30" rx="35" ry="22" fill="#0a0014" stroke="#7c3aed" strokeWidth="2" />
              <ellipse cx="115" cy="30" rx="18" ry="15" fill="#7c3aed">
                <animate attributeName="ry" values="15;12;15" dur="2s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="115" cy="30" rx="8" ry="9" fill="#000000" />
              <ellipse cx="110" cy="26" rx="3" ry="2" fill="#a855f7" opacity="0.6" />
            </svg>
          </motion.div>

          {/* Message punition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center px-6">
            <div className="font-orbitron text-red-500 text-lg uppercase tracking-widest mb-4">
              ⚠ PUNITION ⚠
            </div>
            <TypewriterText text={message} className="font-rajdhani text-white text-base leading-relaxed" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="mt-8 text-gray-600 text-xs font-rajdhani">
            Appuyer pour fermer
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TypewriterText({ text, className }: { text: string; className: string }) {
  return (
    <motion.p className={className}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 + i * 0.04 }}>
          {char}
        </motion.span>
      ))}
    </motion.p>
  );
}
