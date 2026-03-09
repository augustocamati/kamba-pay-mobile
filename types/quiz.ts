// Tipos para o módulo de Quiz de Educação Financeira

export interface QuizPergunta {
  id: string;
  pergunta: string;
  opcoes: QuizOpcao[];
  categoria: 'poupanca' | 'gastos' | 'doacao' | 'planejamento';
  dificuldade: 'facil' | 'medio' | 'dificil';
  explicacao: string;
  pontos: number;
}

export interface QuizOpcao {
  id: string;
  texto: string;
  correta: boolean;
}

export interface QuizSessao {
  id: string;
  perguntas: QuizPergunta[];
  perguntaAtual: number;
  respostas: QuizResposta[];
  pontuacaoTotal: number;
  iniciado: boolean;
  finalizado: boolean;
}

export interface QuizResposta {
  perguntaId: string;
  opcaoSelecionada: string;
  correta: boolean;
  tempo: number;
}

export interface QuizResultado {
  pontuacaoTotal: number;
  acertos: number;
  erros: number;
  percentualAcerto: number;
  categoriasMelhorDesempenho: string[];
  recompensaKz: number;
}
