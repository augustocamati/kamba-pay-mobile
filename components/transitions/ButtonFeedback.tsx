import { motion } from 'motion/react';
import { ReactNode, useState } from 'react';

interface ButtonFeedbackProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

// Partícula de brilho dourado premium
function GoldenSparkle({ x, y, index }: { x: number; y: number; index: number }) {
  const angle = (Math.PI * 2 * index) / 12 + (Math.random() - 0.5) * 0.3;
  const distance = 60 + Math.random() * 60;
  const targetX = x + Math.cos(angle) * distance;
  const targetY = y + Math.sin(angle) * distance;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      initial={{
        x,
        y,
        scale: 0,
        opacity: 1,
        rotate: 0
      }}
      animate={{
        x: targetX,
        y: targetY,
        scale: [0, 2, 1.5, 0],
        opacity: [1, 1, 0.8, 0],
        rotate: rotation
      }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="absolute pointer-events-none z-50"
    >
      <div 
        className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600"
        style={{
          boxShadow: '0 0 15px rgba(255, 215, 0, 0.9), 0 0 30px rgba(255, 193, 7, 0.7), inset 0 1px 3px rgba(255, 255, 255, 0.8)'
        }}
      />
    </motion.div>
  );
}

export function ButtonFeedback({ children, onClick, className = '', disabled = false }: ButtonFeedbackProps) {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; index: number }[]>([]);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // Efeito de bounce elástico
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 300);

    // Vibração háptica (mobile)
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    // Criar partículas de brilho (12 partículas em círculo)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparkles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      index: i
    }));

    setSparkles(prev => [...prev, ...newSparkles]);

    // Limpar partículas antigas
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.includes(s)));
    }, 800);

    // Chamar onClick original
    onClick?.();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-visible ${className}`}
      animate={{
        scale: isPressed ? 0.92 : 1
      }}
      whileHover={{
        scale: disabled ? 1 : 1.03,
        boxShadow: disabled ? undefined : '0 15px 50px rgba(59, 130, 246, 0.4)'
      }}
      whileTap={{
        scale: disabled ? 1 : 0.95
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 15,
        mass: 0.5
      }}
    >
      {/* Brilho de fundo ao clicar - mais intenso */}
      {isPressed && (
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-radial from-amber-300/60 via-yellow-200/40 to-transparent rounded-3xl"
          style={{ 
            filter: 'blur(8px)',
            mixBlendMode: 'screen'
          }}
        />
      )}

      {children}

      {/* Partículas de brilho */}
      <div className="absolute inset-0 pointer-events-none">
        {sparkles.map(sparkle => (
          <GoldenSparkle key={sparkle.id} x={sparkle.x} y={sparkle.y} index={sparkle.index} />
        ))}
      </div>
    </motion.button>
  );
}