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
  imagem_url?: string;
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
  getRandomContextMessage: (screen: string) => string;
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export function MascotProvider({ children }: { children: ReactNode }) {
  const [mascotes, setMascotes] = useState<Mascot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMascotes = async () => {
    try {
      setLoading(true);
      const data = await mascoteService.list();
      if (data && Array.isArray(data.mascotes)) {
        setMascotes(data.mascotes);
      } else {
        console.error('Invalid mascot data received:', data);
      }
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

  const getRandomContextMessage = (screen: string) => {
    const contextMsgs: Record<string, string[]> = {
      home: [
        'Olá! Pronto para ganhar mais Kz?',
        'Dá uma olhadinha nas tuas tarefas hoje!',
        'Como vai a tua poupança?',
        'Estás a ir muito bem!'
      ],
      missions: [
        'Falta pouco para completares a tua missão!',
        'Juntar dinheiro é como plantar uma semente.',
        'Qual é o teu próximo objetivo?',
        'Adiciona progresso para chegares mais perto!'
      ],
      school: [
        'Aprender sobre dinheiro é super divertido!',
        'Assiste aos vídeos para ganhares XP.',
        'Pronto para o próximo quiz?',
        'Conhecimento é o melhor investimento!'
      ],
      tasks: [
        'Mãos à obra! Tens tarefas pendentes.',
        'Completa as tarefas para encheres os teus potes.',
        'Os teus pais vão ficar orgulhosos!',
        'Não te esqueças de tirar a foto da prova.'
      ],
      shop: [
        'Uau! Tantos personagens fixes!',
        'Qual deles gostas mais?',
        'Poupa os teus pontos para desbloqueares todos.',
        'Eu fico bem com qualquer visual, não achas?'
      ],
      help: [
        'Ajudar os outros faz-nos sentir muito bem!',
        'Escolhe uma causa para apoiares hoje.',
        'Até uma pequena doação faz a diferença.',
        'És um herói por ajudares quem precisa!'
      ]
    };

    const msgs = contextMsgs[screen] || contextMsgs['home'];
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
      getRandomContextMessage,
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
