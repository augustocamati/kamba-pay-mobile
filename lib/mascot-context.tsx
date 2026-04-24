import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mascoteService } from './api';

// ── Mascot Type ───────────────────────────────────────────────────────────────
export interface Mascot {
  id: number;
  nome: string;
  tagline: string;
  descricao: string;
  tipo: string;
  emoji: string;
  bg_color: string;
  preco: number;
  ativo: boolean;
  desbloqueado: boolean;
  messages: {
    correct: string[];
    wrong: string[];
    greeting: string[];
    drag: string[];
  };
}

interface MascotContextType {
  mascotes: Mascot[];
  activeMascot: Mascot | null;
  loading: boolean;
  fetchMascotes: () => Promise<void>;
  setActiveMascot: (id: number) => Promise<void>;
  unlockMascot: (id: number) => Promise<void>;
  getRandomMessage: (type: 'correct' | 'wrong' | 'greeting' | 'drag') => string;
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export function MascotProvider({ children }: { children: ReactNode }) {
  const [mascotes, setMascotes] = useState<Mascot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMascotes = async () => {
    try {
      setLoading(true);
      const data = await mascoteService.list();
      setMascotes(data.mascotes);
    } catch (e) {
      console.error('Failed to load mascots from API', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMascotes();
  }, []);

  const activeMascot = mascotes.find(m => m.ativo) || mascotes[0] || null;

  const setActiveMascot = async (id: number) => {
    try {
      await mascoteService.ativar(id);
      setMascotes(prev => prev.map(m => ({
        ...m,
        ativo: m.id === id
      })));
    } catch (e) {
      console.error('Failed to activate mascot', e);
    }
  };

  const unlockMascot = async (id: number) => {
    try {
      await mascoteService.buy(id);
      await fetchMascotes(); // Refresh to get updated status
    } catch (e) {
      console.error('Failed to buy mascot', e);
      throw e;
    }
  };

  const getRandomMessage = (type: 'correct' | 'wrong' | 'greeting' | 'drag') => {
    if (!activeMascot) return '...';
    const msgs = activeMascot.messages[type];
    if (!msgs || msgs.length === 0) return '...';
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  return (
    <MascotContext.Provider value={{
      mascotes,
      activeMascot,
      loading,
      fetchMascotes,
      setActiveMascot,
      unlockMascot,
      getRandomMessage,
    }}>
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const ctx = useContext(MascotContext);
  if (!ctx) throw new Error('useMascot must be used within MascotProvider');
  return ctx;
}
