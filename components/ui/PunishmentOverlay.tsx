"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface PunishmentOverlayProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export default function PunishmentOverlay({
  visible,
  message,
  onClose,
}: PunishmentOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(onClose, 6000);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);

  useGSAP(
    () => {
      if (!visible || !overlayRef.current) return;
      navigator.vibrate?.([500]);
      gsap
        .timeline()
        .to(".screen-overlay-red", { opacity: 0.5, duration: 0.1 })
        .to(".screen-overlay-red", { opacity: 0, duration: 0.4, delay: 0.1 })
        .to(
          ".punition-eyes",
          { scaleY: 1, opacity: 1, duration: 0.8, ease: "power4.out" },
          "-=0.2"
        )
        .to(
          ".punition-text span",
          { opacity: 1, duration: 0.03, stagger: 0.04 },
          "-=0.2"
        );
    },
    { dependencies: [visible], scope: overlayRef }
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-95"
          onClick={onClose}
        >
          {/* Flash rouge */}
          <div
            className="screen-overlay-red absolute inset-0 pointer-events-none"
            style={{ opacity: 0, background: "#dc2626" }}
          />

          {/* Yeux violets */}
          <div
            className="punition-eyes mb-8"
            style={{ transform: "scaleY(0)", opacity: 0 }}
          >
            <svg width="160" height="60" viewBox="0 0 160 60">
              <ellipse cx="45" cy="30" rx="35" ry="22" fill="#0a0014" stroke="#7c3aed" strokeWidth="2" />
              <ellipse cx="45" cy="30" rx="18" ry="15" fill="#7c3aed">
                <animate attributeName="ry" values="15;12;15" dur="2s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="45" cy="30" rx="8" ry="9" fill="#000000" />
              <ellipse cx="40" cy="26" rx="3" ry="2" fill="#a855f7" opacity="0.6" />
              <ellipse cx="115" cy="30" rx="35" ry="22" fill="#0a0014" stroke="#7c3aed" strokeWidth="2" />
              <ellipse cx="115" cy="30" rx="18" ry="15" fill="#7c3aed">
                <animate attributeName="ry" values="15;12;15" dur="2s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="115" cy="30" rx="8" ry="9" fill="#000000" />
              <ellipse cx="110" cy="26" rx="3" ry="2" fill="#a855f7" opacity="0.6" />
            </svg>
          </div>

          {/* Texte lettre par lettre */}
          <div className="text-center px-6">
            <div className="font-orbitron text-red-500 text-lg uppercase tracking-widest mb-4">
              ⚠ PUNITION ⚠
            </div>
            <p className="punition-text font-rajdhani text-white text-base leading-relaxed">
              {message.split("").map((char, i) => (
                <span key={i} style={{ opacity: 0 }}>
                  {char}
                </span>
              ))}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="mt-8 text-gray-600 text-xs font-rajdhani"
          >
            Appuyer pour fermer
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
