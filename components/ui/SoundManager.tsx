'use client';
import { createContext, useContext, useCallback, useRef } from 'react';

type SoundType = 'levelup' | 'quest' | 'complete' | 'punishment' | 'xp' | 'tap' | 'transform' | 'meal' | 'water' | 'strava';

interface SoundContextValue {
  play: (sound: SoundType) => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

const SoundContext = createContext<SoundContextValue>({
  play: () => {},
  enabled: true,
  setEnabled: () => {},
});

const SOUND_FREQUENCIES: Record<SoundType, { freq: number[]; type: OscillatorType; duration: number }> = {
  levelup: { freq: [440, 550, 660, 880], type: 'sine', duration: 800 },
  quest: { freq: [220, 330, 440], type: 'sawtooth', duration: 600 },
  complete: { freq: [523, 659, 784, 1047], type: 'sine', duration: 1000 },
  punishment: { freq: [150, 100, 80], type: 'sawtooth', duration: 1200 },
  xp: { freq: [880, 1047], type: 'sine', duration: 300 },
  tap: { freq: [660, 880], type: 'square', duration: 150 },
  transform: { freq: [220, 440, 880, 1760], type: 'sine', duration: 1500 },
  meal: { freq: [523, 659], type: 'sine', duration: 400 },
  water: { freq: [1047, 1319], type: 'sine', duration: 350 },
  strava: { freq: [440, 554, 659, 880], type: 'sine', duration: 700 },
};

export function SoundProvider({ children, enabled, onToggle }: {
  children: React.ReactNode;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const play = useCallback((sound: SoundType) => {
    if (!enabled) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const config = SOUND_FREQUENCIES[sound];

      config.freq.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = config.type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + config.duration / 1000);

        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + config.duration / 1000);
      });
    } catch {
      // Audio not available
    }
  }, [enabled]);

  return (
    <SoundContext.Provider value={{ play, enabled, setEnabled: onToggle }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
