import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { QuizPerguntaDragDrop } from './Quiz/QuizPerguntaDragDrop';
import { QuizEntrada } from './Quiz/QuizEntrada';
import { QuizResultado } from './Quiz/QuizResultado';
import { perguntasQuiz } from '../data/quizData';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner@2.0.3';
import type { QuizPergunta as QuizPerguntaType, QuizResposta, QuizResultado as QuizResultadoType } from '../types/quiz';

// Função auxiliar para calcular recompensa
function calcularRecompensa(acertos: number, total: number): number {
  const percentual = (acertos / total) * 100;
  
  if (percentual >= 90) return 500;
  if (percentual >= 70) return 300;
  if (percentual >= 50) return 200;
  return 100;
}

interface QuizScreenProps {
  onVoltar?: () => void;
}

type EstadoQuiz = 'entrada' | 'jogando' | 'resultado';

export function QuizScreen({ onVoltar }: QuizScreenProps) {
  const { adicionarSaldo } = useApp();
  const [estado, setEstado] = useState<EstadoQuiz>('entrada');
  const [perguntas, setPerguntas] = useState<QuizPerguntaType[]>([]);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState<QuizResposta[]>([]);
  const [resultado, setResultado] = useState<QuizResultadoType | null>(null);

  const iniciarQuiz = () => {
    const perguntasSelecionadas = perguntasQuiz.slice(0, 5);
    setPerguntas(perguntasSelecionadas);
    setPerguntaAtual(0);
    setRespostas([]);
    setResultado(null);
    setEstado('jogando');
    
    toast.success('Quiz iniciado! 🎯', {
      description: 'Boa sorte com as perguntas!'
    });
  };

  const handleResponder = (opcaoId: string, correta: boolean) => {
    const novaResposta: QuizResposta = {
      perguntaId: perguntas[perguntaAtual].id,
      opcaoSelecionada: opcaoId,
      correta,
      tempo: 0
    };

    const novasRespostas = [...respostas, novaResposta];
    setRespostas(novasRespostas);

    // Se ainda há perguntas, avança
    if (perguntaAtual < perguntas.length - 1) {
      setPerguntaAtual(perguntaAtual + 1);
    } else {
      // Quiz finalizado - calcular resultado
      finalizarQuiz(novasRespostas);
    }
  };

  const finalizarQuiz = (respostasFinais: QuizResposta[]) => {
    const acertos = respostasFinais.filter(r => r.correta).length;
    const erros = respostasFinais.length - acertos;
    const percentualAcerto = (acertos / respostasFinais.length) * 100;
    
    // Calcular pontuação total
    let pontuacaoTotal = 0;
    respostasFinais.forEach((resposta, index) => {
      if (resposta.correta) {
        pontuacaoTotal += perguntas[index].pontos;
      }
    });

    // Calcular recompensa em Kwanzas
    const recompensaKz = calcularRecompensa(acertos, respostasFinais.length);

    // Adicionar recompensa ao pote Gastar
    adicionarSaldo(recompensaKz, 'gastar');

    const resultadoFinal: QuizResultadoType = {
      pontuacaoTotal,
      acertos,
      erros,
      percentualAcerto,
      categoriasMelhorDesempenho: [],
      recompensaKz
    };

    setResultado(resultadoFinal);
    setEstado('resultado');

    // Toast de parabenização
    if (percentualAcerto >= 80) {
      toast.success('🏆 Excelente! Você arrasou!', {
        description: `Ganhou ${recompensaKz} Kz pela sua performance incrível!`
      });
    } else if (percentualAcerto >= 60) {
      toast.success('🎉 Muito bem!', {
        description: `Ganhou ${recompensaKz} Kz! Continue praticando!`
      });
    } else {
      toast('💪 Bom esforço!', {
        description: `Ganhou ${recompensaKz} Kz! Tente novamente para melhorar!`
      });
    }
  };

  const handleContinuar = () => {
    if (onVoltar) {
      onVoltar();
    } else {
      setEstado('entrada');
    }
  };

  const handleJogarNovamente = () => {
    iniciarQuiz();
  };

  return (
    <div className="relative">
      {/* Botão Voltar - apenas quando não está no resultado */}
      {estado !== 'resultado' && onVoltar && (
        <button
          onClick={onVoltar}
          type="button"
          className="fixed top-6 left-6 z-50 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Renderizar tela baseada no estado */}
      {estado === 'entrada' && (
        <QuizEntrada onIniciar={iniciarQuiz} />
      )}

      {estado === 'jogando' && perguntas.length > 0 && (
        <AnimatePresence mode="wait">
          <QuizPerguntaDragDrop
            key={`pergunta-${perguntaAtual}`}
            pergunta={perguntas[perguntaAtual]}
            numeroPergunta={perguntaAtual + 1}
            totalPerguntas={perguntas.length}
            onResponder={handleResponder}
          />
        </AnimatePresence>
      )}

      {estado === 'resultado' && resultado && (
        <QuizResultado
          resultado={resultado}
          onContinuar={handleContinuar}
          onJogarNovamente={handleJogarNovamente}
        />
      )}
    </div>
  );
}