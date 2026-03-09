import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, LogIn } from 'lucide-react';
import { Button } from './ui/button';

interface WelcomeScreenProps {
  onLogin: () => void;
  onCriarContaResponsavel: () => void;
}

export function WelcomeScreen({ onLogin, onCriarContaResponsavel }: WelcomeScreenProps) {
  const [etapa, setEtapa] = useState<'inicial' | 'opcoes'>('inicial');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-400 to-red-400 relative overflow-hidden">
      {/* Padrão Samakaka animado */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,0.3) 35px, rgba(0,0,0,0.3) 70px)`
        }}
      />

      {/* Elementos decorativos flutuantes */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-10 text-6xl"
      >
        💰
      </motion.div>

      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-32 left-10 text-5xl"
      >
        🎯
      </motion.div>

      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 10, 0]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/3 left-12 text-4xl"
      >
        ⭐
      </motion.div>

      <motion.div
        animate={{
          y: [0, 15, 0],
          rotate: [0, -8, 0]
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/4 right-16 text-5xl"
      >
        ❤️
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div className="max-w-md w-full text-center flex flex-col min-h-screen justify-between py-8">
          {/* Conteúdo Principal */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Logo/Ícone Principal */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.2
              }}
              className="mb-8"
            >
              <div className="inline-block bg-white rounded-full p-8 shadow-2xl">
                <div className="text-7xl">🦁</div>
              </div>
            </motion.div>

            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className="text-5xl font-bold text-white mb-3 kids-heading drop-shadow-lg">
                Kamba Kid Pay
              </h1>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-yellow-200" />
                <p className="text-xl text-white/90 font-medium">
                  Educação Financeira Infantil
                </p>
                <Sparkles className="w-5 h-5 text-yellow-200" />
              </div>
            </motion.div>
          </div>

          {/* Rodapé com Botões */}
          {etapa === 'inicial' ? (
            <div className="space-y-4">
              {/* Botão Avançar - Tela Inicial */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
              >
                <Button
                  onClick={() => setEtapa('opcoes')}
                  type="button"
                  className="w-full bg-white text-orange-600 hover:bg-orange-50 text-xl font-bold py-8 rounded-3xl shadow-2xl hover:scale-105 transition-all kids-heading"
                >
                  Começar Agora
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </motion.div>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-white/70 text-sm kids-font"
              >
                🇦🇴 Feito com amor para crianças angolanas
              </motion.p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Botão Entrar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={onLogin}
                  type="button"
                  className="w-full bg-white text-orange-600 hover:bg-orange-50 text-xl font-bold py-8 rounded-3xl shadow-2xl hover:scale-105 transition-all kids-heading"
                >
                  <LogIn className="w-6 h-6 mr-2" />
                  Entrar
                </Button>
              </motion.div>

              {/* Botão Criar Conta de Responsável */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={onCriarContaResponsavel}
                  type="button"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 text-lg font-bold py-7 rounded-3xl shadow-2xl hover:scale-105 transition-all kids-heading border-2 border-blue-400"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Criar conta de Responsável
                </Button>
              </motion.div>

              {/* Botão Voltar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={() => setEtapa('inicial')}
                  className="w-full text-white/80 hover:text-white text-sm font-medium py-3 transition-colors"
                >
                  ← Voltar
                </button>
              </motion.div>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/70 text-sm kids-font"
              >
                🇦🇴 Feito com amor para crianças angolanas
              </motion.p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}