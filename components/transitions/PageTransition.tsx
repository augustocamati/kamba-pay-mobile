import { motion, AnimatePresence } from 'motion/react';
import { ReactNode, useState, useEffect } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
}

// Componente de moeda individual
function CurrencyCoin({ delay }: { delay: number }) {
  const isNote = Math.random() > 0.5;
  const randomX = Math.random() * 100;
  const randomRotation = Math.random() * 720 - 360;
  const randomScale = 0.5 + Math.random() * 0.5;

  return (
    <motion.div
      initial={{ 
        x: `${randomX}vw`, 
        y: '-10vh',
        opacity: 0,
        rotate: 0,
        scale: 0
      }}
      animate={{ 
        x: `${randomX + (Math.random() * 20 - 10)}vw`,
        y: '110vh',
        opacity: [0, 1, 1, 0],
        rotate: randomRotation,
        scale: randomScale
      }}
      transition={{
        duration: 1.5,
        delay: delay,
        ease: [0.33, 1, 0.68, 1]
      }}
      className="absolute pointer-events-none"
      style={{
        filter: 'drop-shadow(0 4px 12px rgba(255, 193, 7, 0.4))'
      }}
    >
      {isNote ? (
        // Cédula de Kwanza estilizada
        <div 
          className="w-16 h-10 rounded-md bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 border-2 border-yellow-600 flex items-center justify-center shadow-xl"
          style={{
            boxShadow: '0 0 20px rgba(255, 193, 7, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="text-white font-black text-xs tracking-tight">AOA</div>
        </div>
      ) : (
        // Moeda de Kwanza
        <div 
          className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border-4 border-yellow-500 flex items-center justify-center shadow-xl"
          style={{
            boxShadow: '0 0 20px rgba(255, 193, 7, 0.6), inset 0 2px 8px rgba(255, 255, 255, 0.5)'
          }}
        >
          <div className="text-yellow-900 font-black text-sm">Kz</div>
        </div>
      )}
    </motion.div>
  );
}

export function PageTransition({ children, pageKey }: PageTransitionProps) {
  const [coins, setCoins] = useState<number[]>([]);

  useEffect(() => {
    // Gerar moedas com delays staggered
    const coinCount = 25;
    const newCoins = Array.from({ length: coinCount }, (_, i) => i * 0.05);
    setCoins(newCoins);
  }, [pageKey]);

  return (
    <div className="relative">
      {/* Container de moedas */}
      <AnimatePresence>
        {coins.length > 0 && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {coins.map((delay, index) => (
              <CurrencyCoin key={`${pageKey}-coin-${index}`} delay={delay} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Conteúdo da página com transição */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pageKey}
          initial={{ 
            opacity: 0,
            x: 100,
            filter: 'blur(10px)'
          }}
          animate={{ 
            opacity: 1,
            x: 0,
            filter: 'blur(0px)'
          }}
          exit={{ 
            opacity: 0,
            x: -100,
            filter: 'blur(10px)'
          }}
          transition={{
            duration: 0.5,
            ease: [0.33, 1, 0.68, 1]
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
