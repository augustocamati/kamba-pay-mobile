import { motion } from 'motion/react';
import { Brain, Star, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface QuizEntradaProps {
  onIniciar: () => void;
}

export function QuizEntrada({ onIniciar }: QuizEntradaProps) {
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
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, -5, 5, -5, 5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="text-8xl mb-4"
          >
            🧠
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 kids-heading">
            Quiz Kamba!
          </h1>
          <p className="text-gray-600 text-lg">
            Teste seus conhecimentos sobre dinheiro
          </p>
        </motion.div>

        {/* Card Principal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-100 mb-6"
        >
          {/* Ilustração */}
          <div className="flex justify-center gap-2 mb-6">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              className="bg-gradient-to-br from-orange-400 to-yellow-500 rounded-2xl p-4 shadow-lg"
            >
              <span className="text-4xl">💰</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 shadow-lg"
            >
              <span className="text-4xl">📊</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              className="bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl p-4 shadow-lg"
            >
              <span className="text-4xl">❤️</span>
            </motion.div>
          </div>

          {/* Descrição */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 kids-heading">
              Como Funciona?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Responda perguntas sobre educação financeira e ganhe Kwanzas! 
              Quanto melhor seu desempenho, maior a recompensa! 🎯
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border-2 border-purple-200"
            >
              <div className="bg-purple-500 rounded-xl p-2 flex-shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm kids-heading">5 Perguntas</p>
                <p className="text-gray-600 text-xs">Sobre poupança, gastos e solidariedade</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-yellow-200"
            >
              <div className="bg-yellow-500 rounded-xl p-2 flex-shrink-0">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm kids-heading">Ganhe Pontos</p>
                <p className="text-gray-600 text-xs">Cada resposta correta vale pontos</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200"
            >
              <div className="bg-green-500 rounded-xl p-2 flex-shrink-0">
                <Star className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm kids-heading">Recompensa em Kz</p>
                <p className="text-gray-600 text-xs">Ganhe até 200 Kz por quiz completo!</p>
              </div>
            </motion.div>
          </div>

          {/* Botão Iniciar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              onClick={onIniciar}
              type="button"
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-7 rounded-2xl text-xl shadow-2xl kids-heading group"
            >
              <Sparkles className="w-6 h-6 mr-2 group-hover:animate-spin" />
              Começar Quiz
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Dica */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0">💡</span>
            <div>
              <h4 className="font-bold text-gray-800 mb-1 kids-heading">Dica!</h4>
              <p className="text-gray-700 text-sm">
                Não tenha pressa! Leia bem cada pergunta e pense antes de responder. 
                Você vai aprender muito sobre dinheiro! 🚀
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
