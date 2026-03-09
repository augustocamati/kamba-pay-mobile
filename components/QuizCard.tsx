import { motion } from 'motion/react';
import { Brain, Star, Sparkles } from 'lucide-react';

interface QuizCardProps {
  onClick: () => void;
}

export function QuizCard({ onClick }: QuizCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-3xl p-6 shadow-2xl border-2 border-white/20 overflow-hidden relative kids-font"
    >
      {/* Pattern decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 text-6xl">🧠</div>
        <div className="absolute bottom-4 left-4 text-4xl">✨</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl opacity-20">🎯</div>
      </div>

      {/* Conteúdo */}
      <div className="relative flex items-center gap-4">
        {/* Ícone animado */}
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
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex-shrink-0"
        >
          <Brain className="w-10 h-10 text-white" />
        </motion.div>

        {/* Texto */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white kids-heading">Quiz Kamba!</h3>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <p className="text-white/90 text-sm mb-2">
            Teste seus conhecimentos sobre dinheiro
          </p>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-300" fill="currentColor" />
              <span className="text-xs text-white font-medium">Ganhe até 200 Kz</span>
            </div>
          </div>
        </div>

        {/* Seta */}
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-3xl flex-shrink-0"
        >
          →
        </motion.div>
      </div>
    </motion.button>
  );
}
