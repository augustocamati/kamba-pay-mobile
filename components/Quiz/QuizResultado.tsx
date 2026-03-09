import { motion } from 'motion/react';
import { Trophy, Star, Coins, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import type { QuizResultado as QuizResultadoType } from '../../types/quiz';

interface QuizResultadoProps {
  resultado: QuizResultadoType;
  onContinuar: () => void;
  onJogarNovamente: () => void;
}

export function QuizResultado({ resultado, onContinuar, onJogarNovamente }: QuizResultadoProps) {
  const { pontuacaoTotal, acertos, erros, percentualAcerto, recompensaKz } = resultado;

  // Determinar mensagem e emoji baseado no desempenho
  const getDesempenho = () => {
    if (percentualAcerto >= 90) {
      return {
        titulo: 'Incrível!',
        mensagem: 'Você é um expert em educação financeira! 🌟',
        emoji: '🏆',
        cor: 'from-yellow-400 to-orange-500'
      };
    } else if (percentualAcerto >= 70) {
      return {
        titulo: 'Muito Bem!',
        mensagem: 'Você está aprendendo muito sobre dinheiro! 💪',
        emoji: '🎉',
        cor: 'from-green-400 to-emerald-500'
      };
    } else if (percentualAcerto >= 50) {
      return {
        titulo: 'Bom Trabalho!',
        mensagem: 'Continue praticando e vai ficar ainda melhor! 👍',
        emoji: '😊',
        cor: 'from-blue-400 to-indigo-500'
      };
    } else {
      return {
        titulo: 'Continue Tentando!',
        mensagem: 'Cada quiz é uma oportunidade de aprender! 💡',
        emoji: '🌱',
        cor: 'from-orange-400 to-pink-500'
      };
    }
  };

  const desempenho = getDesempenho();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 kids-font py-8">
      {/* Padrão Samakaka discreto */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,0.1) 35px, rgba(0,0,0,0.1) 70px)`
        }}
      />

      <div className="relative max-w-md mx-auto px-6">
        {/* Confetes animados */}
        {percentualAcerto >= 70 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ 
                  top: -20, 
                  left: `${Math.random() * 100}%`,
                  rotate: 0 
                }}
                animate={{ 
                  top: '100%', 
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1) 
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity
                }}
              >
                {['🎉', '⭐', '💫', '✨', '🎊'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        )}

        {/* Header com troféu */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className={`inline-block bg-gradient-to-br ${desempenho.cor} rounded-full p-6 shadow-2xl mb-4`}>
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 0.6,
                delay: 0.3
              }}
              className="text-7xl"
            >
              {desempenho.emoji}
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-800 mb-2 kids-heading"
          >
            {desempenho.titulo}
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-lg"
          >
            {desempenho.mensagem}
          </motion.p>
        </motion.div>

        {/* Card de Estatísticas */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mb-6"
        >
          {/* Pontuação Total */}
          <div className="text-center mb-6 pb-6 border-b-2 border-gray-100">
            <p className="text-gray-600 text-sm mb-2 kids-heading">Sua Pontuação</p>
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 kids-money">
              {Math.round(percentualAcerto)}%
            </div>
          </div>

          {/* Estatísticas detalhadas */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-green-500 rounded-full p-1.5">
                  <Star className="w-4 h-4 text-white" fill="white" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Acertos</span>
              </div>
              <p className="text-3xl font-bold text-green-600 kids-money">{acertos}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-orange-500 rounded-full p-1.5">
                  <RotateCcw className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Erros</span>
              </div>
              <p className="text-3xl font-bold text-orange-600 kids-money">{erros}</p>
            </div>
          </div>

          {/* Pontos ganhos */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-700 font-medium">Pontos Conquistados</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 kids-heading">{pontuacaoTotal} pontos</p>
          </div>
        </motion.div>

        {/* Recompensa em Kwanzas */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-6 shadow-2xl mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1 kids-heading">Você Ganhou!</p>
              <div className="flex items-center gap-2">
                <Coins className="w-8 h-8 text-yellow-300" />
                <span className="text-4xl font-bold text-white kids-money">
                  {recompensaKz} Kz
                </span>
              </div>
              <p className="text-orange-100 text-xs mt-1">Adicionado ao pote Gastar 🎯</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-5xl"
            >
              🪙
            </motion.div>
          </div>
        </motion.div>

        {/* Dica motivacional */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 mb-8"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0">💡</span>
            <div>
              <h4 className="font-bold text-gray-800 mb-1 kids-heading">Dica do Kamba!</h4>
              <p className="text-gray-700 text-sm">
                {percentualAcerto >= 70 
                  ? 'Continue praticando! Quanto mais você aprende sobre dinheiro, melhor fica em gerenciar suas economias.'
                  : 'Tente novamente! Cada quiz é uma chance de aprender mais sobre educação financeira. Você consegue!'
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={onContinuar}
              type="button"
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-6 rounded-2xl text-lg shadow-xl kids-heading"
            >
              Continuar Aprendendo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={onJogarNovamente}
              type="button"
              variant="outline"
              className="w-full border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 font-bold py-6 rounded-2xl text-lg kids-heading"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Jogar Novamente
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
