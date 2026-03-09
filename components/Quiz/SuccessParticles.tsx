import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  type: 'star' | 'coin' | 'gem' | 'sparkle' | 'shine';
  color?: string;
}

interface SuccessParticlesProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function SuccessParticles({ trigger, onComplete }: SuccessParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    // Criar explosão de tesouro com mais partículas e variedade
    const newParticles: Particle[] = Array.from({ length: 35 }, (_, i) => ({
      id: Date.now() + i,
      x: 50, // Centro horizontal
      y: 50, // Centro vertical
      type: ['star', 'coin', 'gem', 'sparkle', 'shine'][Math.floor(Math.random() * 5)] as Particle['type'],
      color: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'][Math.floor(Math.random() * 4)] // Verde vibrante
    }));

    setParticles(newParticles);

    // Limpar após animação
    const timeout = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [trigger, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {/* Flash de brilho verde inicial */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0.6, 0], scale: [0.5, 2.5, 3] }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute inset-0 bg-green-400 rounded-3xl"
        style={{ mixBlendMode: 'screen' }}
      />

      {particles.map((particle, index) => {
        const angle = (Math.PI * 2 * index) / particles.length + (Math.random() - 0.5) * 0.5;
        const distance = 120 + Math.random() * 150;
        const targetX = particle.x + Math.cos(angle) * distance;
        const targetY = particle.y + Math.sin(angle) * distance - 30; // Bias para cima

        return (
          <motion.div
            key={particle.id}
            initial={{
              x: `${particle.x}%`,
              y: `${particle.y}%`,
              scale: 0,
              opacity: 1,
              rotate: 0
            }}
            animate={{
              x: `${targetX}%`,
              y: `${targetY}%`,
              scale: [0, 1.8, 0.8, 0],
              opacity: [1, 1, 1, 0],
              rotate: Math.random() * 1080 - 540
            }}
            transition={{
              duration: 1.5 + Math.random() * 0.5,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            {particle.type === 'star' && (
              <div className="text-4xl drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 10px #FFD700)' }}>
                ⭐
              </div>
            )}
            {particle.type === 'coin' && (
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-700 border-3 border-yellow-500 flex items-center justify-center relative"
                style={{
                  boxShadow: '0 0 25px rgba(255, 193, 7, 0.9), inset 0 2px 12px rgba(255, 255, 255, 0.7)',
                  background: 'radial-gradient(circle at 30% 30%, #FDE68A, #F59E0B, #D97706)'
                }}
              >
                <span className="text-yellow-900 font-black text-sm">Kz</span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
              </div>
            )}
            {particle.type === 'gem' && (
              <div 
                className="w-8 h-10 relative"
                style={{ 
                  filter: `drop-shadow(0 0 12px ${particle.color})`,
                }}
              >
                {/* Gema estilo diamante */}
                <svg viewBox="0 0 24 32" className="w-full h-full">
                  <defs>
                    <linearGradient id={`gem-${particle.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: particle.color, stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: particle.color, stopOpacity: 0.6 }} />
                    </linearGradient>
                  </defs>
                  <polygon 
                    points="12,2 22,12 12,30 2,12" 
                    fill={`url(#gem-${particle.id})`}
                    stroke={particle.color}
                    strokeWidth="1.5"
                  />
                  <polygon 
                    points="12,2 22,12 12,16 2,12" 
                    fill="rgba(255,255,255,0.4)"
                  />
                </svg>
              </div>
            )}
            {particle.type === 'sparkle' && (
              <div 
                className="w-4 h-4 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${particle.color}, transparent)`,
                  boxShadow: `0 0 15px ${particle.color}, 0 0 30px ${particle.color}`
                }}
              />
            )}
            {particle.type === 'shine' && (
              <div className="relative w-6 h-6">
                {/* Estrela de 4 pontas (brilho) */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300 to-transparent"
                  style={{ 
                    height: '2px', 
                    top: '50%',
                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
                  }}
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-300 to-transparent"
                  style={{ 
                    width: '2px', 
                    left: '50%',
                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
                  }}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}