import React, { createContext, useContext, useEffect, useState } from 'react';
import { soundManager } from './sound-manager';

interface SoundContextType {
  playSound: (name: 'click' | 'correct' | 'wrong' | 'success') => void;
  toggleBgMusic: (on: boolean) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    soundManager.setMute(isMuted);
  }, [isMuted]);

  const playSound = (name: 'click' | 'correct' | 'wrong' | 'success') => {
    soundManager.play(name);
  };

  const toggleBgMusic = (on: boolean) => {
    if (on) {
      soundManager.startBgMusic();
    } else {
      soundManager.stopBgMusic();
    }
  };

  return (
    <SoundContext.Provider value={{ playSound, toggleBgMusic, isMuted, setIsMuted }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
