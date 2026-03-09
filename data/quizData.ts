import type { QuizPergunta } from '../types/quiz';

export const perguntasQuiz: QuizPergunta[] = [
  // POUPANÇA
  {
    id: 'q1',
    pergunta: 'O que significa poupar dinheiro?',
    opcoes: [
      { id: 'a', texto: 'Gastar tudo o que eu ganho', correta: false },
      { id: 'b', texto: 'Guardar um pouco do dinheiro para o futuro', correta: true },
      { id: 'c', texto: 'Dar todo o dinheiro aos amigos', correta: false },
      { id: 'd', texto: 'Esconder o dinheiro e nunca usar', correta: false }
    ],
    categoria: 'poupanca',
    dificuldade: 'facil',
    explicacao: 'Poupar é guardar uma parte do dinheiro que ganhamos para usar no futuro quando precisarmos!',
    pontos: 10
  },
  {
    id: 'q2',
    pergunta: 'Se você ganhar 500 Kz e guardar 150 Kz no pote "Poupar", quanto você poupou?',
    opcoes: [
      { id: 'a', texto: '350 Kz', correta: false },
      { id: 'b', texto: '500 Kz', correta: false },
      { id: 'c', texto: '150 Kz', correta: true },
      { id: 'd', texto: '100 Kz', correta: false }
    ],
    categoria: 'poupanca',
    dificuldade: 'facil',
    explicacao: 'Você poupou exatamente 150 Kz! É sempre bom guardar pelo menos uma parte do que ganhamos.',
    pontos: 10
  },
  {
    id: 'q3',
    pergunta: 'Por que é importante ter um pote de poupança?',
    opcoes: [
      { id: 'a', texto: 'Para realizar sonhos e ter dinheiro em emergências', correta: true },
      { id: 'b', texto: 'Para mostrar aos amigos que tenho dinheiro', correta: false },
      { id: 'c', texto: 'Porque meus pais mandam', correta: false },
      { id: 'd', texto: 'Para nunca gastar dinheiro', correta: false }
    ],
    categoria: 'poupanca',
    dificuldade: 'medio',
    explicacao: 'Poupar nos ajuda a realizar nossos sonhos e ter segurança quando algo inesperado acontecer!',
    pontos: 15
  },

  // GASTOS
  {
    id: 'q4',
    pergunta: 'Qual é a diferença entre NECESSIDADE e DESEJO?',
    opcoes: [
      { id: 'a', texto: 'Não há diferença, são a mesma coisa', correta: false },
      { id: 'b', texto: 'Necessidade é o que precisamos, desejo é o que queremos', correta: true },
      { id: 'c', texto: 'Desejo é mais importante que necessidade', correta: false },
      { id: 'd', texto: 'Necessidade é só para adultos', correta: false }
    ],
    categoria: 'gastos',
    dificuldade: 'medio',
    explicacao: 'Necessidades são coisas essenciais como comida e roupa. Desejos são coisas que queremos mas não são essenciais!',
    pontos: 15
  },
  {
    id: 'q5',
    pergunta: 'Você tem 200 Kz. Um brinquedo custa 150 Kz e um lanche 80 Kz. O que fazer?',
    opcoes: [
      { id: 'a', texto: 'Comprar os dois mesmo sem dinheiro suficiente', correta: false },
      { id: 'b', texto: 'Escolher um e poupar o restante', correta: true },
      { id: 'c', texto: 'Pedir mais dinheiro aos pais', correta: false },
      { id: 'd', texto: 'Não comprar nada', correta: false }
    ],
    categoria: 'gastos',
    dificuldade: 'medio',
    explicacao: 'É importante fazer escolhas inteligentes! Você pode escolher o que mais precisa e guardar o que sobrar.',
    pontos: 15
  },
  {
    id: 'q6',
    pergunta: 'Antes de comprar algo, o que devemos perguntar?',
    opcoes: [
      { id: 'a', texto: 'Só preciso saber se é bonito', correta: false },
      { id: 'b', texto: 'Eu realmente preciso? Tenho dinheiro? Vale a pena?', correta: true },
      { id: 'c', texto: 'Meus amigos têm?', correta: false },
      { id: 'd', texto: 'Nada, só comprar', correta: false }
    ],
    categoria: 'gastos',
    dificuldade: 'facil',
    explicacao: 'Sempre devemos pensar bem antes de gastar! Pergunte: preciso disso? Tenho dinheiro? Vale a pena?',
    pontos: 10
  },

  // DOAÇÃO/SOLIDARIEDADE
  {
    id: 'q7',
    pergunta: 'Por que é bom ajudar outras pessoas com doações?',
    opcoes: [
      { id: 'a', texto: 'Para aparecer na TV', correta: false },
      { id: 'b', texto: 'Porque ajudar faz bem e melhora a vida de quem precisa', correta: true },
      { id: 'c', texto: 'Porque sou obrigado', correta: false },
      { id: 'd', texto: 'Para ficar rico', correta: false }
    ],
    categoria: 'doacao',
    dificuldade: 'facil',
    explicacao: 'Ajudar os outros faz bem para nós e para quem recebe! Pequenas doações podem fazer grande diferença.',
    pontos: 10
  },
  {
    id: 'q8',
    pergunta: 'Você ganhou 300 Kz de mesada. Quanto colocar no pote "Ajudar"?',
    opcoes: [
      { id: 'a', texto: 'Nada, vou gastar tudo', correta: false },
      { id: 'b', texto: 'Um pouco, como 30 Kz (10%)', correta: true },
      { id: 'c', texto: 'Todo o dinheiro', correta: false },
      { id: 'd', texto: 'Só quando sobrar muito', correta: false }
    ],
    categoria: 'doacao',
    dificuldade: 'medio',
    explicacao: 'É legal separar uma pequena parte (como 10%) para ajudar! Mesmo pouco pode fazer diferença.',
    pontos: 15
  },

  // PLANEJAMENTO
  {
    id: 'q9',
    pergunta: 'O que é fazer um planejamento financeiro?',
    opcoes: [
      { id: 'a', texto: 'Decidir o que vou comprar sem pensar', correta: false },
      { id: 'b', texto: 'Organizar meu dinheiro para alcançar objetivos', correta: true },
      { id: 'c', texto: 'Contar o dinheiro todos os dias', correta: false },
      { id: 'd', texto: 'Gastar tudo agora', correta: false }
    ],
    categoria: 'planejamento',
    dificuldade: 'medio',
    explicacao: 'Planejar é organizar nosso dinheiro para conseguir realizar nossos sonhos e objetivos!',
    pontos: 15
  },
  {
    id: 'q10',
    pergunta: 'Você quer comprar uma bicicleta de 5000 Kz. Como conseguir?',
    opcoes: [
      { id: 'a', texto: 'Esperar ganhar tudo de uma vez', correta: false },
      { id: 'b', texto: 'Fazer um plano: poupar toda semana até juntar', correta: true },
      { id: 'c', texto: 'Pedir emprestado e não devolver', correta: false },
      { id: 'd', texto: 'Desistir do sonho', correta: false }
    ],
    categoria: 'planejamento',
    dificuldade: 'facil',
    explicacao: 'Com planejamento e poupança regular, podemos alcançar nossos sonhos! Cada Kwanza guardado conta.',
    pontos: 10
  },
  {
    id: 'q11',
    pergunta: 'Qual é a melhor forma de usar os 3 potes (Gastar, Poupar, Ajudar)?',
    opcoes: [
      { id: 'a', texto: 'Colocar todo dinheiro só no pote Gastar', correta: false },
      { id: 'b', texto: 'Dividir o dinheiro entre os 3 potes de forma equilibrada', correta: true },
      { id: 'c', texto: 'Usar só o pote Poupar', correta: false },
      { id: 'd', texto: 'Misturar tudo sem organizar', correta: false }
    ],
    categoria: 'planejamento',
    dificuldade: 'medio',
    explicacao: 'O ideal é equilibrar! Um pouco para gastar agora, outro para guardar, e outro para ajudar.',
    pontos: 15
  },

  // CONCEITOS AVANÇADOS
  {
    id: 'q12',
    pergunta: 'Se você completar tarefas e ganhar Kwanzas, o que é isso?',
    opcoes: [
      { id: 'a', texto: 'Sorte', correta: false },
      { id: 'b', texto: 'Recompensa pelo trabalho', correta: true },
      { id: 'c', texto: 'Um presente', correta: false },
      { id: 'd', texto: 'Dinheiro fácil', correta: false }
    ],
    categoria: 'planejamento',
    dificuldade: 'facil',
    explicacao: 'Quando fazemos tarefas, recebemos uma recompensa pelo nosso esforço e trabalho!',
    pontos: 10
  }
];

// Função para selecionar perguntas aleatórias
export function selecionarPerguntasAleatorias(quantidade: number = 5): QuizPergunta[] {
  const shuffled = [...perguntasQuiz].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, quantidade);
}

// Função para calcular recompensa baseada no desempenho
export function calcularRecompensa(acertos: number, total: number): number {
  const percentual = (acertos / total) * 100;
  
  if (percentual >= 90) return 200; // Excelente
  if (percentual >= 70) return 150; // Muito bom
  if (percentual >= 50) return 100; // Bom
  if (percentual >= 30) return 50;  // Regular
  return 25; // Participação
}
