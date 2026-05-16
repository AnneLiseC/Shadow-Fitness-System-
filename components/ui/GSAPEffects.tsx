"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin();

export default function GSAPEffects() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Scan line au chargement de chaque page
    gsap.fromTo(
      ".scan-line",
      { y: "-100%", opacity: 0.7 },
      { y: "100vh", opacity: 0, duration: 1.0, ease: "power2.in" }
    );

    // Glow pulsant sur les éléments importants
    gsap.to(".glow-element", {
      boxShadow: "0 0 30px #7c3aed, 0 0 60px rgba(124,58,237,0.3)",
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-50" aria-hidden>
      {/* Scan line */}
      <div
        className="scan-line absolute left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #06b6d4, #7c3aed, #06b6d4, transparent)",
          boxShadow: "0 0 8px #06b6d4",
          top: 0,
        }}
      />
    </div>
  );
}
