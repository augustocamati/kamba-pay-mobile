import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, X, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface PinValidationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinValidation({ onSuccess, onCancel }: PinValidationProps) {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [tentativas, setTentativas] = useState(0);
  const [erro, setErro] = useState(false);

  const PIN_CORRETO = '1234'; // Em produção, isso viria do backend
  const MAX_TENTATIVAS = 3;

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setErro(false);

    // Auto-focus no próximo campo
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Validar quando o último dígito for preenchido
    if (index === 3 && value) {
      const pinCompleto = newPin.join('');
      validatePin(pinCompleto);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const validatePin = (pinCompleto: string) => {
    if (pinCompleto === PIN_CORRETO) {
      toast.success('Acesso autorizado!');
      setTimeout(() => {
        onSuccess();
      }, 500);
    } else {
      setErro(true);
      setTentativas(tentativas + 1);
      
      if (tentativas + 1 >= MAX_TENTATIVAS) {
        toast.error('Número máximo de tentativas atingido!', {
          description: 'Por segurança, o acesso foi bloqueado.'
        });
        setTimeout(() => {
          onCancel();
        }, 2000);
      } else {
        toast.error('PIN incorreto!', {
          description: `Tentativa ${tentativas + 1} de ${MAX_TENTATIVAS}`
        });
        // Limpar PIN após erro
        setTimeout(() => {
          setPin(['', '', '', '']);
          const firstInput = document.getElementById('pin-0');
          firstInput?.focus();
        }, 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-3">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Área dos Pais</h2>
              <p className="text-sm text-gray-600">Acesso restrito</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mensagem */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-6">
          <p className="text-gray-700 text-center">
            Digite o PIN de 4 dígitos para acessar o Dashboard dos Pais
          </p>
        </div>

        {/* PIN Input */}
        <div className="flex justify-center gap-4 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-16 h-16 text-center text-2xl font-bold rounded-2xl border-2 transition-all ${
                erro
                  ? 'border-red-400 bg-red-50 shake'
                  : 'border-gray-300 focus:border-blue-500 focus:bg-blue-50'
              } outline-none`}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Erro */}
        {erro && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 justify-center text-red-600 mb-4"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              PIN incorreto. Tentativa {tentativas} de {MAX_TENTATIVAS}
            </span>
          </motion.div>
        )}

        {/* Info */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-xs text-gray-600 text-center">
            🔒 Esta área contém informações sensíveis sobre finanças e gestão de tarefas das crianças.
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            PIN padrão para demonstração: <span className="font-mono font-bold">1234</span>
          </p>
        </div>

        {/* Botão Cancelar */}
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full rounded-2xl py-6"
        >
          Cancelar
        </Button>
      </motion.div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
