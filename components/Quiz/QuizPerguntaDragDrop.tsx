import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, RotateCcw, ArrowRight } from 'lucide-react';
import { SuccessParticles } from './SuccessParticles';
import { ButtonFeedback } from '../transitions/ButtonFeedback';
import type { QuizPergunta as QuizPerguntaType } from '../../types/quiz';

interface QuizPerguntaDragDropProps {
  pergunta: QuizPerguntaType;
  numeroPergunta: number;
  totalPerguntas: number;
  onResponder: (opcaoId: string, correta: boolean) => void;
}

export function QuizPerguntaDragDrop({ pergunta, numeroPergunta, totalPerguntas, onResponder }: QuizPerguntaDragDropProps) {
  const [draggedOption, setDraggedOption] = useState<string | null>(null);
  const [droppedOption, setDroppedOption] = useState<string | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [respostaCorreta, setRespostaCorreta] = useState(false);
  const [personagemEmocao, setPersonagemEmocao] = useState<'neutro' | 'feliz' | 'triste'>('neutro');
  const [estaNarrando, setEstaNarrando] = useState(false);
  const [audioHabilitado, setAudioHabilitado] = useState(true);
  const [showSuccessParticles, setShowSuccessParticles] = useState(false);

  // Narração automática
  useEffect(() => {
    if (audioHabilitado) {
      narrarTexto(pergunta.pergunta);
    }
    // Resetar estados ao mudar de pergunta
    setDraggedOption(null);
    setDroppedOption(null);
    setMostrarFeedback(false);
    setPersonagemEmocao('neutro');
    setShowSuccessParticles(false);
  }, [pergunta.id, audioHabilitado]);

  const narrarTexto = (texto: string) => {
    window.speechSynthesis.cancel();
    if (!audioHabilitado) return;

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-PT';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    const vozes = window.speechSynthesis.getVoices();
    const vozPortugues = vozes.find(voz => voz.lang.includes('pt') || voz.lang.includes('PT'));
    if (vozPortugues) utterance.voice = vozPortugues;

    utterance.onstart = () => setEstaNarrando(true);
    utterance.onend = () => setEstaNarrando(false);
    utterance.onerror = () => setEstaNarrando(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleAudio = () => {
    if (audioHabilitado) {
      window.speechSynthesis.cancel();
      setEstaNarrando(false);
    }
    setAudioHabilitado(!audioHabilitado);
  };

  const repetirPergunta = () => {
    narrarTexto(pergunta.pergunta);
  };

  const handleDragStart = (opcaoId: string) => {
    setDraggedOption(opcaoId);
  };

  const handleDragEnd = () => {
    setDraggedOption(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedOption || mostrarFeedback) return;

    const opcao = pergunta.opcoes.find(o => o.id === draggedOption);
    if (!opcao) return;

    setDroppedOption(draggedOption);
    setRespostaCorreta(opcao.correta);
    setMostrarFeedback(true);
    setPersonagemEmocao(opcao.correta ? 'feliz' : 'triste');

    // Parar narração
    window.speechSynthesis.cancel();

    // Efeito de sucesso
    if (opcao.correta) {
      setShowSuccessParticles(true);
      if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
    }

    // Narrar feedback
    if (audioHabilitado) {
      const feedback = opcao.correta 
        ? `Parabéns! Resposta correta! ${pergunta.explicacao}`
        : `Quase lá! Vamos aprender: ${pergunta.explicacao}`;
      setTimeout(() => narrarTexto(feedback), 500);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleProxima = () => {
    if (droppedOption) {
      const opcao = pergunta.opcoes.find(o => o.id === droppedOption);
      if (opcao) {
        onResponder(droppedOption, opcao.correta);
      }
    }
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0, scale: 0.85 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: -300, opacity: 0, scale: 0.85 }}
      transition={{
        type: 'spring',
        stiffness: 180,
        damping: 22,
        mass: 0.8
      }}
      className="relative min-h-screen pb-16 px-3 pt-4"
    >
      {/* Controles minimalistas - só áudio */}
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={toggleAudio}
          className="p-4 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
        >
          {audioHabilitado ? (
            <Volume2 className="w-6 h-6 text-green-600" />
          ) : (
            <VolumeX className="w-6 h-6 text-gray-400" />
          )}
        </button>
      </div>

      {/* Progresso minimalista */}
      <div className="mb-6">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${(numeroPergunta / totalPerguntas) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Card Principal GRANDE - 70% da área útil */}
      <motion.div
        className="relative mb-8 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-2xl rounded-[40px] p-10 shadow-2xl border-4"
        style={{
          borderImage: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B35) 1',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.18), inset 0 2px 30px rgba(255, 255, 255, 0.6)',
          minHeight: '65vh'
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 250,
          damping: 20,
          delay: 0.1
        }}
      >
        {/* Personagem GRANDE + Pergunta */}
        <div className="flex items-start gap-6 mb-10">
          <motion.div
            animate={{
              scale: personagemEmocao === 'feliz' ? [1, 1.2, 1] : personagemEmocao === 'triste' ? [1, 0.92, 1] : estaNarrando ? [1, 1.1, 1] : 1,
              rotate: personagemEmocao === 'feliz' ? [0, -10, 10, 0] : 0
            }}
            transition={{ 
              duration: 0.7,
              repeat: estaNarrando ? Infinity : 0,
              repeatType: 'reverse'
            }}
            className="bg-gradient-to-br from-amber-400 to-orange-600 rounded-[35px] p-8 shadow-2xl flex-shrink-0 relative"
          >
            {estaNarrando && (
              <motion.div
                className="absolute -top-3 -right-3 bg-green-500 rounded-full p-3 shadow-lg"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              >
                <Volume2 className="w-6 h-6 text-white" />
              </motion.div>
            )}
            <div className="text-8xl">
              {personagemEmocao === 'feliz' ? '😊' : personagemEmocao === 'triste' ? '😢' : '🤓'}
            </div>
          </motion.div>

          <div className="flex-1">
            <h3 className="text-3xl font-black text-gray-900 kids-heading leading-snug">
              {pergunta.pergunta}
            </h3>
          </div>
        </div>

        {/* Zona de Drop GRANDE */}
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`
            min-h-48 rounded-3xl border-[6px] border-dashed flex items-center justify-center p-10
            transition-all duration-300
            ${droppedOption 
              ? respostaCorreta 
                ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-600' 
                : 'bg-gradient-to-br from-red-100 to-pink-100 border-red-600'
              : draggedOption 
                ? 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-600 scale-105' 
                : 'bg-gray-100/60 border-gray-400'
            }
          `}
          animate={{
            scale: draggedOption && !droppedOption ? [1, 1.03, 1] : 1
          }}
          transition={{
            repeat: draggedOption && !droppedOption ? Infinity : 0,
            duration: 1.2
          }}
        >
          {droppedOption ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center"
            >
              <div className={`text-8xl mb-4 ${respostaCorreta ? 'animate-bounce' : ''}`}>
                {respostaCorreta ? '✅' : '❌'}
              </div>
              <p className={`font-black text-2xl ${respostaCorreta ? 'text-green-800' : 'text-red-800'}`}>
                {pergunta.opcoes.find(o => o.id === droppedOption)?.texto}
              </p>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-7xl mb-3">🎯</div>
              <p className="font-black text-xl">Arrasta aqui</p>
            </div>
          )}
        </motion.div>

        {/* Partículas de Sucesso */}
        <SuccessParticles trigger={showSuccessParticles} />
      </motion.div>

      {/* Opções de Resposta - Cards Arrastáveis GRANDES */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        {pergunta.opcoes.map((opcao, index) => (
          <motion.div
            key={opcao.id}
            draggable={!mostrarFeedback}
            onDragStart={() => handleDragStart(opcao.id)}
            onDragEnd={handleDragEnd}
            initial={{ y: 60, opacity: 0, scale: 0.8 }}
            animate={{ 
              y: 0, 
              opacity: droppedOption === opcao.id ? 0.3 : 1,
              scale: droppedOption === opcao.id ? 0.9 : 1
            }}
            transition={{ 
              delay: index * 0.12,
              type: 'spring',
              stiffness: 200,
              damping: 18
            }}
            className={`
              relative bg-gradient-to-br from-white via-gray-50 to-white rounded-[28px] p-8 shadow-xl
              border-[4px] cursor-grab active:cursor-grabbing
              ${draggedOption === opcao.id ? 'scale-110 shadow-2xl z-10' : ''}
              ${droppedOption === opcao.id ? 'pointer-events-none' : 'hover:scale-105'}
              transition-all duration-250
            `}
            style={{
              borderColor: mostrarFeedback && opcao.correta ? '#10B981' : '#E5E7EB',
              touchAction: 'none',
              boxShadow: draggedOption === opcao.id 
                ? '0 25px 60px rgba(0, 0, 0, 0.25)' 
                : '0 12px 30px rgba(0, 0, 0, 0.12)'
            }}
            whileHover={{ 
              scale: mostrarFeedback || droppedOption === opcao.id ? 1 : 1.08,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Indicador visual se é a resposta correta após feedback */}
            {mostrarFeedback && opcao.correta && (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="absolute -top-4 -right-4 bg-green-500 rounded-full p-3 shadow-xl"
              >
                <div className="text-white text-2xl font-black">✓</div>
              </motion.div>
            )}

            <div className="text-center">
              <div className="text-6xl mb-4">{opcao.icone || '💡'}</div>
              <p className="font-black text-gray-900 text-lg leading-snug">
                {opcao.texto}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feedback e Explicação */}
      <AnimatePresence>
        {mostrarFeedback && !respostaCorreta && (
          <motion.div
            initial={{ y: 20, opacity: 0, height: 0 }}
            animate={{ y: 0, opacity: 1, height: 'auto' }}
            exit={{ y: 20, opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="rounded-2xl p-6 shadow-xl bg-gradient-to-br from-orange-100 to-yellow-100 border-4 border-orange-400">
              <div className="flex items-start gap-4">
                <div className="text-5xl flex-shrink-0">💡</div>
                <p className="text-gray-800 leading-relaxed text-lg font-medium flex-1">
                  {pergunta.explicacao}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão Próxima */}
      <AnimatePresence>
        {mostrarFeedback && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <ButtonFeedback
              onClick={handleProxima}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white font-black py-7 rounded-[32px] text-2xl shadow-2xl kids-heading flex items-center justify-center gap-3"
            >
              {numeroPergunta === totalPerguntas ? 'Ver Resultado 🎉' : 'Próxima'}
              <ArrowRight className="w-7 h-7" />
            </ButtonFeedback>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}