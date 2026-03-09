import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';
import type { QuizPergunta as QuizPerguntaType } from '../../types/quiz';

interface QuizPerguntaProps {
  pergunta: QuizPerguntaType;
  numeroPergunta: number;
  totalPerguntas: number;
  onResponder: (opcaoId: string, correta: boolean) => void;
}

export function QuizPergunta({ pergunta, numeroPergunta, totalPerguntas, onResponder }: QuizPerguntaProps) {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<string | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [respostaCorreta, setRespostaCorreta] = useState(false);
  const [personagemEmocao, setPersonagemEmocao] = useState<'neutro' | 'feliz' | 'triste'>('neutro');
  const [estaNarrando, setEstaNarrando] = useState(false);
  const [audioHabilitado, setAudioHabilitado] = useState(true);

  // Narração automática ao carregar a pergunta
  useEffect(() => {
    if (audioHabilitado) {
      narrarTexto(pergunta.pergunta);
    }
  }, [pergunta.id, audioHabilitado]);

  const narrarTexto = (texto: string) => {
    // Cancelar qualquer narração anterior
    window.speechSynthesis.cancel();

    if (!audioHabilitado) return;

    const utterance = new SpeechSynthesisUtterance(texto);
    
    // Configurações de voz em Português
    utterance.lang = 'pt-PT'; // Português de Portugal (mais próximo de Angola)
    utterance.rate = 0.9; // Velocidade um pouco mais lenta para crianças
    utterance.pitch = 1.1; // Tom um pouco mais agudo/amigável
    utterance.volume = 1;

    // Tentar usar uma voz em português
    const vozes = window.speechSynthesis.getVoices();
    const vozPortugues = vozes.find(voz => 
      voz.lang.includes('pt') || voz.lang.includes('PT')
    );
    if (vozPortugues) {
      utterance.voice = vozPortugues;
    }

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

  const handleSelecionarOpcao = (opcaoId: string) => {
    if (mostrarFeedback) return;
    
    const opcao = pergunta.opcoes.find(o => o.id === opcaoId);
    if (!opcao) return;

    setOpcaoSelecionada(opcaoId);
    setRespostaCorreta(opcao.correta);
    setMostrarFeedback(true);
    setPersonagemEmocao(opcao.correta ? 'feliz' : 'triste');

    // Parar narração da pergunta
    window.speechSynthesis.cancel();

    // Narrar feedback
    if (audioHabilitado) {
      const feedback = opcao.correta 
        ? `Parabéns! Resposta correta! ${pergunta.explicacao}`
        : `Quase lá! Vamos aprender: ${pergunta.explicacao}`;
      
      setTimeout(() => narrarTexto(feedback), 500);
    }

    // Feedback sonoro visual
    if (opcao.correta) {
      // Vibração de sucesso (se disponível)
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }
    }
  };

  const handleProxima = () => {
    onResponder(opcaoSelecionada!, respostaCorreta);
    setOpcaoSelecionada(null);
    setMostrarFeedback(false);
    setPersonagemEmocao('neutro');
  };

  const progresso = (numeroPergunta / totalPerguntas) * 100;

  // Cores por categoria
  const coresCategorias = {
    poupanca: { from: 'from-green-400', to: 'to-emerald-500', text: 'text-green-600' },
    gastos: { from: 'from-orange-400', to: 'to-amber-500', text: 'text-orange-600' },
    doacao: { from: 'from-pink-400', to: 'to-red-500', text: 'text-pink-600' },
    planejamento: { from: 'from-blue-400', to: 'to-indigo-500', text: 'text-blue-600' }
  };

  const coresCat = coresCategorias[pergunta.categoria];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 kids-font pb-8">
      {/* Padrão Samakaka discreto */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,0.1) 35px, rgba(0,0,0,0.1) 70px)`
        }}
      />

      <div className="relative max-w-md mx-auto px-6 pt-8">
        {/* Barra de Progresso */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 kids-heading">
              Pergunta {numeroPergunta} de {totalPerguntas}
            </span>
            <span className="text-sm font-bold text-orange-600 kids-heading">
              {Math.round(progresso)}%
            </span>
          </div>
          <div className="bg-white/60 rounded-full h-3 overflow-hidden shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-orange-400 to-yellow-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Personagem + Balão de Fala */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative mb-8"
        >
          {/* Personagem */}
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              animate={{
                scale: personagemEmocao === 'feliz' ? [1, 1.1, 1] : personagemEmocao === 'triste' ? [1, 0.95, 1] : estaNarrando ? [1, 1.05, 1] : 1,
                rotate: personagemEmocao === 'feliz' ? [0, -5, 5, 0] : 0
              }}
              transition={{ 
                duration: 0.5,
                repeat: estaNarrando ? Infinity : 0,
                repeatType: 'reverse'
              }}
              className={`bg-gradient-to-br ${coresCat.from} ${coresCat.to} rounded-3xl p-4 shadow-xl flex-shrink-0 relative`}
            >
              {/* Indicador de som quando está narrando */}
              {estaNarrando && (
                <motion.div
                  className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Volume2 className="w-4 h-4 text-white" />
                </motion.div>
              )}
              <div className="text-5xl">
                {personagemEmocao === 'feliz' ? '😊' : personagemEmocao === 'triste' ? '����' : '🤓'}
              </div>
            </motion.div>

            {/* Balão de Fala */}
            <div className="flex-1 relative">
              <div className="absolute -left-3 top-6 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[16px] border-r-white" />
              <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${coresCat.text} bg-gradient-to-r ${coresCat.from} ${coresCat.to} bg-opacity-20`}>
                    {pergunta.categoria === 'poupanca' && '💰 Poupança'}
                    {pergunta.categoria === 'gastos' && '🛍️ Gastos'}
                    {pergunta.categoria === 'doacao' && '❤️ Ajudar'}
                    {pergunta.categoria === 'planejamento' && '📊 Planejamento'}
                  </span>
                </div>
                <p className="text-gray-800 font-medium text-lg leading-relaxed kids-heading">
                  {pergunta.pergunta}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Opções de Resposta */}
        <div className="space-y-3 mb-6">
          {pergunta.opcoes.map((opcao, index) => {
            const isSelected = opcaoSelecionada === opcao.id;
            const isCorrect = opcao.correta;
            const showCorrect = mostrarFeedback && isCorrect;
            const showIncorrect = mostrarFeedback && isSelected && !isCorrect;

            return (
              <motion.button
                key={opcao.id}
                type="button"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelecionarOpcao(opcao.id)}
                disabled={mostrarFeedback}
                className={`
                  w-full text-left p-5 rounded-2xl font-medium text-base
                  transition-all duration-300 transform
                  ${!mostrarFeedback && 'hover:scale-[1.02] active:scale-[0.98]'}
                  ${!mostrarFeedback && !isSelected && 'bg-white border-2 border-gray-200 shadow-md hover:shadow-lg hover:border-orange-300'}
                  ${!mostrarFeedback && isSelected && 'bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-400 shadow-lg'}
                  ${showCorrect && 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-500 shadow-lg'}
                  ${showIncorrect && 'bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-500 shadow-lg'}
                  ${mostrarFeedback && !isSelected && !isCorrect && 'opacity-40'}
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Letra da opção */}
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg kids-heading flex-shrink-0
                    ${!mostrarFeedback && 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'}
                    ${showCorrect && 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'}
                    ${showIncorrect && 'bg-gradient-to-br from-red-500 to-pink-600 text-white'}
                  `}>
                    {opcao.id.toUpperCase()}
                  </div>

                  {/* Texto da opção */}
                  <span className="flex-1 text-gray-800">
                    {opcao.texto}
                  </span>

                  {/* Ícone de feedback */}
                  {showCorrect && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                    >
                      <CheckCircle className="w-7 h-7 text-green-600" />
                    </motion.div>
                  )}
                  {showIncorrect && (
                    <motion.div
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                    >
                      <XCircle className="w-7 h-7 text-red-600" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Explicação (aparece após responder) */}
        <AnimatePresence>
          {mostrarFeedback && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className={`
                rounded-2xl p-5 border-2
                ${respostaCorreta 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                  : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300'
                }
              `}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">
                    {respostaCorreta ? '✅' : '💡'}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-2 kids-heading">
                      {respostaCorreta ? 'Parabéns! Resposta correta!' : 'Quase lá! Vamos aprender:'}
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {pergunta.explicacao}
                    </p>
                  </div>
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
              <button
                onClick={handleProxima}
                type="button"
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-6 rounded-2xl text-lg shadow-xl kids-heading flex items-center justify-center gap-2"
              >
                {numeroPergunta === totalPerguntas ? 'Ver Resultado 🎉' : 'Próxima Pergunta'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controles de Áudio */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleAudio}
            className="bg-white/80 rounded-full p-2 shadow-md"
          >
            {audioHabilitado ? (
              <Volume2 className="w-5 h-5 text-gray-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Botão para Repetir Pergunta */}
        <div className="absolute top-4 left-4">
          <button
            onClick={repetirPergunta}
            className="bg-white/80 rounded-full p-2 shadow-md"
            disabled={estaNarrando}
          >
            <Volume2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}