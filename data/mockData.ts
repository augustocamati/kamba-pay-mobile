// Dados mock para o protótipo Kamba Kid Pay

import type { 
  Crianca, 
  Tarefa, 
  Missao, 
  Campanha, 
  ConteudoEducativo, 
  ItemLoja,
  HistoricoTransacao
} from '../types';

export const mockCrianca: Crianca = {
  id: 'crianca-1',
  nome: 'Kiala',
  idade: 9,
  nivel: 5,
  xp: 120,
  paiId: 'pai-1',
  avatar: {
    id: 'avatar-1',
    cabelo: 'afro',
    roupa: 'casual_colorida',
    acessorio: 'oculos_sol',
    cor_pele: 'marrom',
    expressao: 'feliz'
  },
  potes: {
    saldo_gastar: 3200,
    saldo_poupar: 4300,
    saldo_ajudar: 1000,
    total: 8500,
    config: {
      gastar: {
        label: 'Pote Gastar',
        descricao: 'Para uso imediato',
        cor: ['#FF6B00', '#FF8C00'],
        icone: 'cart-outline'
      },
      poupar: {
        label: 'Pote Poupar',
        descricao: 'Metas futuras',
        cor: ['#4BD37B', '#2ECC71'],
        icone: 'target'
      },
      ajudar: {
        label: 'Pote Ajudar',
        descricao: 'Solidariedade',
        cor: ['#FFD130', '#FBC02D'],
        icone: 'heart-outline'
      }
    }
  },
  tarefas: [],
  missoes: [],
  historico: []
};

export const mockTarefas: Tarefa[] = [
  {
    id: 'tarefa-1',
    titulo: 'Arrumar o quarto',
    descricao: 'Organizar a cama, guardar os brinquedos e limpar a mesa de estudos',
    recompensa: 150,
    status: 'pendente',
    crianca_id: 'crianca-1',
    criado_em: new Date('2026-01-23'),
    icone: 'bed',
    categoria: 'casa'
  },
  {
    id: 'tarefa-2',
    titulo: 'Ler 10 páginas',
    descricao: 'Ler 10 páginas de qualquer livro da biblioteca',
    recompensa: 200,
    status: 'pendente',
    crianca_id: 'crianca-1',
    criado_em: new Date('2026-01-23'),
    icone: 'book',
    categoria: 'educacao'
  },
  {
    id: 'tarefa-3',
    titulo: 'Ajudar na cozinha',
    descricao: 'Ajudar a preparar o almoço e lavar a louça',
    recompensa: 100,
    status: 'concluida',
    crianca_id: 'crianca-1',
    criado_em: new Date('2026-01-22'),
    concluido_em: new Date('2026-01-22'),
    aprovado_em: new Date('2026-01-22'),
    icone: 'utensils',
    categoria: 'casa',
    foto_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400'
  },
  {
    id: 'tarefa-4',
    titulo: 'Fazer dever de casa',
    descricao: 'Completar todas as tarefas de matemática',
    recompensa: 250,
    status: 'aguardando_aprovacao',
    crianca_id: 'crianca-1',
    criado_em: new Date('2026-01-23'),
    concluido_em: new Date('2026-01-23'),
    icone: 'pencil',
    categoria: 'educacao',
    foto_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400'
  }
];

export const mockMissoes: Missao[] = [
  {
    id: 'missao-1',
    titulo: 'Meta: Novo Jogo',
    descricao: 'Economize 6.000 Kz para comprar um novo jogo',
    tipo: 'poupanca',
    objetivo_valor: 6000,
    progresso_atual: 4300,
    recompensa: 500,
    icone: '🎮',
    cor: ['#BF5AF2', '#A335EE'],
    tipo_label: 'Poupança',
    icone_nome: 'trending-up',
    ativa: true,
    crianca_id: 'crianca-1'
  },
  {
    id: 'missao-2',
    titulo: 'Consumidor Consciente',
    descricao: 'Gaste com sabedoria e não exceda 4.000 Kz este mês',
    tipo: 'consumo',
    objetivo_valor: 4000,
    progresso_atual: 3200,
    recompensa: 300,
    icone: '🛒',
    cor: ['#0984E3', '#0652DD'],
    tipo_label: 'Consumo',
    icone_nome: 'cart',
    ativa: true,
    crianca_id: 'crianca-1'
  },
  {
    id: 'missao-3',
    titulo: 'Herói da Solidariedade',
    descricao: 'Doe 1.500 Kz para ajudar crianças necessitadas',
    tipo: 'solidariedade',
    objetivo_valor: 1500,
    progresso_atual: 1000,
    recompensa: 400,
    icone: '❤️',
    cor: ['#E84393', '#D63031'],
    tipo_label: 'Solidariedade',
    icone_nome: 'heart',
    ativa: true,
    crianca_id: 'crianca-1'
  }
];

export const mockCampanhas: Campanha[] = [
  {
    id: 'campanha-1',
    titulo: 'Merenda Escolar',
    descricao: 'Ajude a fornecer merenda para crianças em escolas rurais de Angola',
    meta_valor: 50000,
    valor_arrecadado: 32500,
    imagem_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600',
    ativa: true,
    organizacao: 'ONG Kamba Solidário',
    causa: 'educacao'
  },
  {
    id: 'campanha-2',
    titulo: 'Livros para Todos',
    descricao: 'Campanha para criar bibliotecas comunitárias em Luanda',
    meta_valor: 30000,
    valor_arrecadado: 18900,
    imagem_url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600',
    ativa: true,
    organizacao: 'Biblioteca Comunitária',
    causa: 'educacao'
  },
  {
    id: 'campanha-3',
    titulo: 'Água Potável',
    descricao: 'Ajude a construir poços de água em comunidades sem acesso',
    meta_valor: 100000,
    valor_arrecadado: 45000,
    imagem_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600',
    ativa: true,
    organizacao: 'Água para Angola',
    causa: 'saude'
  }
];

export const mockConteudoEducativo: ConteudoEducativo[] = [
  {
    id: 'conteudo-1',
    titulo: 'O que é Kwanza?',
    descricao: 'Aprenda sobre a moeda de Angola',
    tipo: 'video',
    faixa_etaria: '6-8',
    thumbnail_url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
    duracao: '3:45',
    topico: 'moeda',
    completo: true
  },
  {
    id: 'conteudo-2',
    titulo: 'Poupar ou Gastar?',
    descricao: 'Decisões inteligentes com dinheiro',
    tipo: 'animacao',
    faixa_etaria: '6-8',
    thumbnail_url: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400',
    duracao: '5:20',
    topico: 'poupanca',
    completo: false
  },
  {
    id: 'conteudo-3',
    titulo: 'Como fazer orçamento',
    descricao: 'Planeje seus gastos mensais',
    tipo: 'video',
    faixa_etaria: '9-10',
    thumbnail_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    duracao: '6:15',
    topico: 'orcamento',
    completo: false
  },
  {
    id: 'conteudo-4',
    titulo: 'Jogo da Economia',
    descricao: 'Pratique gestão financeira de forma divertida',
    tipo: 'jogo',
    faixa_etaria: '9-10',
    thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
    duracao: '10:00',
    topico: 'jogo',
    completo: false
  },
  {
    id: 'conteudo-5',
    titulo: 'Investimentos para crianças',
    descricao: 'Conceitos básicos de investimento',
    tipo: 'video',
    faixa_etaria: '11-12',
    thumbnail_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400',
    duracao: '8:30',
    topico: 'investimento',
    completo: false
  }
];

export const mockItensLoja: ItemLoja[] = [
  {
    id: 'item-1',
    nome: 'Cabelo Afro com Tranças',
    tipo: 'cabelo',
    preco: 500,
    nivel_necessario: 3,
    desbloqueado: true
  },
  {
    id: 'item-2',
    nome: 'Roupa Samakaka',
    tipo: 'roupa',
    preco: 800,
    nivel_necessario: 5,
    desbloqueado: true
  },
  {
    id: 'item-3',
    nome: 'Óculos de Sol',
    tipo: 'acessorio',
    preco: 300,
    nivel_necessario: 2,
    desbloqueado: true
  },
  {
    id: 'item-4',
    nome: 'Coroa Tradicional',
    tipo: 'acessorio',
    preco: 1200,
    nivel_necessario: 8,
    desbloqueado: false
  },
  {
    id: 'item-5',
    nome: 'Traje de Super-Herói',
    tipo: 'roupa',
    preco: 1500,
    nivel_necessario: 10,
    desbloqueado: false
  }
];

export const mockHistorico: HistoricoTransacao[] = [
  {
    id: 'hist-1',
    tipo: 'tarefa',
    descricao: 'Ajudar na cozinha',
    valor: 100,
    data: new Date('2026-01-22'),
    pote_afetado: 'gastar'
  },
  {
    id: 'hist-2',
    tipo: 'compra',
    descricao: 'Óculos de Sol',
    valor: -300,
    data: new Date('2026-01-20'),
    pote_afetado: 'gastar'
  },
  {
    id: 'hist-3',
    tipo: 'doacao',
    descricao: 'Campanha Merenda Escolar',
    valor: -200,
    data: new Date('2026-01-18'),
    pote_afetado: 'ajudar'
  },
  {
    id: 'hist-4',
    tipo: 'tarefa',
    descricao: 'Ler 10 páginas',
    valor: 200,
    data: new Date('2026-01-17'),
    pote_afetado: 'poupar'
  },
  {
    id: 'hist-5',
    tipo: 'missao',
    descricao: 'Bônus: Meta de Poupança',
    valor: 500,
    data: new Date('2026-01-15'),
    pote_afetado: 'poupar'
  }
];

export const mockCrianca2: Crianca = {
  id: 'crianca-2',
  nome: 'Ngola',
  idade: 7,
  nivel: 3,
  xp: 45,
  paiId: 'pai-1',
  avatar: {
    id: 'avatar-2',
    cabelo: 'curto',
    roupa: 'esportiva',
    acessorio: 'nenhum',
    cor_pele: 'marrom_escuro',
    expressao: 'feliz'
  },
  potes: {
    saldo_gastar: 1500,
    saldo_poupar: 2000,
    saldo_ajudar: 500,
    total: 4000,
    config: {
      gastar: {
        label: 'Pote Gastar',
        descricao: 'Para uso imediato',
        cor: ['#FF6B00', '#FF8C00'],
        icone: 'cart-outline'
      },
      poupar: {
        label: 'Pote Poupar',
        descricao: 'Metas futuras',
        cor: ['#4BD37B', '#2ECC71'],
        icone: 'target'
      },
      ajudar: {
        label: 'Pote Ajudar',
        descricao: 'Solidariedade',
        cor: ['#FFD130', '#FBC02D'],
        icone: 'heart-outline'
      }
    }
  },
  tarefas: [],
  missoes: [],
  historico: []
};
