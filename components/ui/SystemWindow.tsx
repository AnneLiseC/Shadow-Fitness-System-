'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';

interface SystemWindowProps {
  title: string;
  children: ReactNode;
  visible?: boolean;
  className?: string;
  typewriter?: boolean;
  urgent?: boolean;
}

export default function SystemWindow({
  title,
  children,
  visible = true,
  className = '',
  typewriter = false,
  urgent = false,
}: SystemWindowProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`relative ${className}`}>
          {/* Coin angulaires Solo Leveling */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

          {/* Bordure double */}
          <div className={`border ${urgent ? 'border-red-500' : 'border-violet-700'} bg-black bg-opacity-90 backdrop-blur-sm p-4`}>
            <div className={`border-b ${urgent ? 'border-red-800' : 'border-violet-900'} pb-2 mb-3`}>
              <div className="flex items-center gap-2">
                {urgent && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-red-500" />
                )}
                <h2 className={`font-orbitron uppercase text-sm tracking-widest ${urgent ? 'text-red-400' : 'text-cyan-400'}`}>
                  {title}
                </h2>
              </div>
            </div>
            <div className="font-rajdhani text-white text-sm">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
