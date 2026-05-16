"use client";
import { useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

async function particlesInit(engine: Parameters<typeof loadSlim>[0]) {
  await loadSlim(engine);
}

export default function RunesParticles() {
  const options = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: -1 },
      particles: {
        number: { value: 12 },
        color: { value: "#7c3aed" },
        opacity: { value: { min: 0.03, max: 0.07 } },
        size: { value: { min: 10, max: 16 } },
        move: {
          enable: true,
          speed: 0.4,
          direction: "top" as const,
          random: true,
          straight: false,
          outModes: { default: "out" as const },
        },
        shape: {
          type: "char",
          options: {
            char: {
              value: ["ᚱ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛏ", "ᛒ"],
              font: "serif",
              style: "",
              weight: "400",
              fill: true,
            },
          },
        },
      },
      background: { color: "transparent" },
      detectRetina: false,
    }),
    []
  );

  return (
    <ParticlesProvider init={particlesInit}>
      <Particles id="runes-bg" options={options} />
    </ParticlesProvider>
  );
}
