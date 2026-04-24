import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Mascot data ───────────────────────────────────────────────────────────────
export const MASCOTS = [
  {
    id: 'kamba-azul',
    nome: 'Kamba Azul',
    tagline: 'O mascote original!',
    descricao: 'O teu companheiro clássico, sempre animado para te ajudar a aprender!',
    tipo: 'Robô Espacial',
    emoji: '🤖',
    bgColor: '#DBEAFE',
    preco: 0, // free / default
    messages: {
      correct: ['Isso mesmo! Tu és incrível! ⭐', 'Acertaste! Tens muito talento! 🎉', 'Fantástico! Continua assim! 🚀'],
      wrong: ['Quase lá! Tenta outra vez! 💪', 'Não desistas! Tu consegues! 🌟', 'Aprende com o erro e vai em frente! 🤗'],
      greeting: ['Olá! Estou aqui para te ajudar! 😊', 'Hoje vais aprender coisas incríveis! 🎓', 'Vamos estudar juntos? 📚'],
      drag: ['Arrasta com cuidado! 😄', 'Qual é a resposta certa? 🤔', 'Pensa bem antes de arrastar! 🧠'],
    },
  },
  {
    id: 'kamba-verde',
    nome: 'Kamba Verde',
    tagline: 'Cheio de energia!',
    descricao: 'O guerreiro da natureza que adora tanto poupar dinheiro como o planeta!',
    tipo: 'Explorador Verde',
    emoji: '🦕',
    bgColor: '#DCFCE7',
    preco: 180,
    messages: {
      correct: ['RAWR! Que resposta incrível! 🦕', 'Sim! O dinosauro aprova! 🌿', 'Parabéns! Voa mais alto! 🦅'],
      wrong: ['ROAR! Quase! Tenta de novo! 🦕', 'O dinossauro não desiste, e tu também não! 💚', 'É assim que se aprende! 🌱'],
      greeting: ['ROAR! Pronto para aventura? 🦕', 'O Kamba Verde te saúda! 🌿', 'Hoje somos exploradores do saber! 🗺️'],
      drag: ['ROAR! Arrasta para a área certa! 🦕', 'O dinossauro está a observar! 👀', 'Mostra-me a tua sabedoria! 🧠'],
    },
  },
  {
    id: 'kamba-rosa',
    nome: 'Kamba Rosa',
    tagline: 'Super fofa!',
    descricao: 'A princesa do aprendizado que transforma cada lição numa festa!',
    tipo: 'Unicórnio Mágico',
    emoji: '🦄',
    bgColor: '#FCE7F3',
    preco: 200,
    messages: {
      correct: ['Xiiii que bonito! Acertaste! ✨', 'A magia da aprendizagem! 🌈', 'Lindíssimo! Tu és brilhante! 💖'],
      wrong: ['Aiiiii quase! Nada de desistir! 🦄', 'Ups! Mas tu vais conseguir! 🌸', 'Até os unicórnios erram às vezes! 🌷'],
      greeting: ['Olá linda/o! Hoje aprendemos! 🦄', 'A festa do aprendizado começa! 🎊', 'Pronta/o para voar? 🌈'],
      drag: ['Arrasta com magia! ✨', 'Qual a moeda encantada? 🪄', 'A magia da resposta certa! 💫'],
    },
  },
  {
    id: 'nutty-laranja',
    nome: 'Nutty Laranja',
    tagline: 'Esquilosamente esperto!',
    descricao: 'O esquilo ninja que guarda poupanças tão bem quanto as nozes!',
    tipo: 'Esquilo Ninja',
    emoji: '🐿️',
    bgColor: '#FED7AA',
    preco: 250,
    messages: {
      correct: ['NUT-CRACKER! Resposta correcta! 🐿️', 'Sou tão bom em guardar nozes quanto tu em saber! 🌰', 'ESQUILO APROVA! Bravo! 🐿️✨'],
      wrong: ['Ó querido... Quase! 🐿️', 'Nenhum esquilo desiste de uma noz! 💪', 'The nuts não param aqui! Tenta de novo! 🌰'],
      greeting: ['NUT-HELLO! Hora de aprender! 🐿️', 'O esquilo mais esperto chegou! 🌰', 'Hoje guardamos conhecimento! 🧠'],
      drag: ['Arrasta como um esquilo ágil! 🐿️', 'Guarda a resposta certa! 🌰', 'O esquilo fareja a resposta! 👃'],
    },
  },
  {
    id: 'captain-koin',
    nome: 'Captain Koin',
    tagline: 'Herói das Finanças!',
    descricao: 'O super-herói das poupanças que protege o teu dinheiro!',
    tipo: 'Super Herói',
    emoji: '🦸',
    bgColor: '#FEF3C7',
    preco: 350,
    messages: {
      correct: ['SUPER RESPOSTA! O herói aprova! 🦸', 'Com grandes poderes, grandes respostas! ⚡', 'KOIN POWER! Incrível! 💰'],
      wrong: ['Até super-heróis erram! Tenta de novo! 🦸', 'O Koin acredita em ti! 💪⚡', 'Todo herói precisa de treino! 🌟'],
      greeting: ['O Captain Koin chegou! 🦸⚡', 'KOIN POWER activado! Hora de aprender! 💰', 'O guardião do teu dinheiro está aqui! 🛡️'],
      drag: ['KOIN POWER! Arrasta com força! 🦸', 'Usa o teu super-poder! ⚡', 'O herói espera a tua resposta! 💰'],
    },
  },
  {
    id: 'luna-cósmica',
    nome: 'Luna Cósmica',
    tagline: 'Vinda das estrelas!',
    descricao: 'A astronauta das finanças que explora o universo do conhecimento!',
    tipo: 'Astronauta Cósmica',
    emoji: '👩‍🚀',
    bgColor: '#EDE9FE',
    preco: 400,
    messages: {
      correct: ['Houston, temos uma resposta correcta! 🚀', 'Missão cumprida! Tu és um astronauta do saber! ⭐', 'LAUNCH! Fantástico! 🌙'],
      wrong: ['Missão incompleta... Mas continua! 🚀', 'Os astronautas também aprendem com os erros! 🌙', 'Recalculando a rota! Tenta de novo! 🛸'],
      greeting: ['Houston, temos uma criança brilhante! 🚀', 'Missão de aprendizado: INICIADA! ⭐', 'Pronta/o para explorar o universo? 🌙'],
      drag: ['Arrasta com a precisão de um astronauta! 🚀', 'No espaço a gravidade é diferente... usa bem! 🌙', 'Missão: encontrar a resposta certa! ⭐'],
    },
  },
] as const;

export type MascotId = typeof MASCOTS[number]['id'];

// ── Context ──────────────────────────────────────────────────────────────────
interface MascotContextType {
  activeMascot: MascotId;
  unlockedMascots: MascotId[];
  setActiveMascot: (id: MascotId) => void;
  unlockMascot: (id: MascotId) => void;
  getActiveMascotData: () => typeof MASCOTS[number];
  getRandomMessage: (type: 'correct' | 'wrong' | 'greeting' | 'drag') => string;
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

const STORAGE_KEY_ACTIVE = 'kamba_active_mascot';
const STORAGE_KEY_UNLOCKED = 'kamba_unlocked_mascots';

export function MascotProvider({ children }: { children: ReactNode }) {
  const [activeMascot, setActiveMascotState] = useState<MascotId>('kamba-azul');
  const [unlockedMascots, setUnlockedMascots] = useState<MascotId[]>(['kamba-azul']);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE);
        const storedUnlocked = await AsyncStorage.getItem(STORAGE_KEY_UNLOCKED);
        if (stored) setActiveMascotState(stored as MascotId);
        if (storedUnlocked) setUnlockedMascots(JSON.parse(storedUnlocked));
      } catch (e) {
        console.error('Failed to load mascot state', e);
      }
    };
    load();
  }, []);

  const setActiveMascot = async (id: MascotId) => {
    setActiveMascotState(id);
    try { await AsyncStorage.setItem(STORAGE_KEY_ACTIVE, id); } catch {}
  };

  const unlockMascot = async (id: MascotId) => {
    setUnlockedMascots(prev => {
      const next = prev.includes(id) ? prev : [...prev, id];
      AsyncStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const getActiveMascotData = () => {
    return MASCOTS.find(m => m.id === activeMascot) ?? MASCOTS[0];
  };

  const getRandomMessage = (type: 'correct' | 'wrong' | 'greeting' | 'drag') => {
    const mascot = getActiveMascotData();
    const msgs = mascot.messages[type] as readonly string[];
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  return (
    <MascotContext.Provider value={{
      activeMascot,
      unlockedMascots,
      setActiveMascot,
      unlockMascot,
      getActiveMascotData,
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
