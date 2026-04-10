// ──────────────────────────────────────────────
// Dados simulados para o modo Demo
// Pai: Manuel Ferreira com 2 filhos
// ──────────────────────────────────────────────

import type { Crianca, Tarefa, Missao, Campanha, ConteudoEducativo, HistoricoTransacao } from '../types';

export const DEMO_PARENT = {
  id: 'demo-pai',
  name: 'Manuel Ferreira',
  email: 'manuel@demo.kamba',
  role: 'parent' as const,
};

export const DEMO_CHILD_USER = {
  id: 'demo-crianca-1',
  name: 'Kiala',
  role: 'child' as const,
};

export const DEMO_CHILDREN: Crianca[] = [
  {
    id: 'demo-crianca-1',
    nome: 'Kiala',
    idade: 10,
    nivel: 5,
    xp: 430,
    paiId: 'demo-pai',
    potes: {
      saldo_gastar: 4800,
      saldo_poupar: 9600,
      saldo_ajudar: 1600,
      total: 16000,
    },
    avatar: { id: '', cabelo: 'padrao', roupa: 'padrao', acessorio: '', cor_pele: 'marrom', expressao: 'feliz' },
    tarefas: [], missoes: [], historico: [],
  },
  {
    id: 'demo-crianca-2',
    nome: 'Lenda',
    idade: 8,
    nivel: 3,
    xp: 210,
    paiId: 'demo-pai',
    potes: {
      saldo_gastar: 2000,
      saldo_poupar: 3000,
      saldo_ajudar: 500,
      total: 5500,
    },
    avatar: { id: '', cabelo: 'padrao', roupa: 'padrao', acessorio: '', cor_pele: 'marrom', expressao: 'feliz' },
    tarefas: [], missoes: [], historico: [],
  },
];

export const DEMO_TAREFAS: Tarefa[] = [
  {
    id: 'demo-t1',
    titulo: 'Arrumar o quarto',
    descricao: 'Organiza a cama, varra o chão e arruma os brinquedos.',
    recompensa: 500,
    status: 'aguardando_aprovacao',
    crianca_id: 'demo-crianca-1',
    foto_url: 'https://images.unsplash.com/photo-1588058365548-9efe1bfb064a?w=400',
    icone: 'bed',
    categoria: 'casa',
    criado_em: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'demo-t2',
    titulo: 'Estudar matemática',
    descricao: 'Fazer os exercícios do livro, páginas 40-45.',
    recompensa: 800,
    status: 'pendente',
    crianca_id: 'demo-crianca-1',
    icone: 'book',
    categoria: 'escola',
    criado_em: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-t3',
    titulo: 'Lavar a loiça',
    descricao: 'Lavar e secar todos os pratos e talheres.',
    recompensa: 400,
    status: 'concluida',
    crianca_id: 'demo-crianca-1',
    icone: 'utensils',
    categoria: 'casa',
    criado_em: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    concluido_em: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    aprovado_em: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-t4',
    titulo: 'Regar as plantas',
    descricao: 'Regar todas as plantas do quintal.',
    recompensa: 300,
    status: 'pendente',
    crianca_id: 'demo-crianca-2',
    icone: 'plant',
    categoria: 'casa',
    criado_em: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

export const DEMO_MISSOES: Missao[] = [
  {
    id: 'demo-m1',
    titulo: 'Poupar para uma bicicleta 🚲',
    descricao: 'Juntar dinheiro para comprar a bicicleta dos sonhos.',
    tipo: 'poupanca',
    objetivo_valor: 25000,
    progresso_atual: 9600,
    recompensa: 1000,
    icone: '🚲',
    cor: ['#3b82f6', '#7c3aed'],
    tipo_label: 'Poupança',
    icone_nome: 'trending-up',
    ativa: true,
    crianca_id: 'demo-crianca-1',
  },
  {
    id: 'demo-m2',
    titulo: 'Ajudar 3 campanhas ❤️',
    descricao: 'Fazer doações a pelo menos 3 causas sociais.',
    tipo: 'solidariedade',
    objetivo_valor: 3,
    progresso_atual: 1,
    recompensa: 500,
    icone: '❤️',
    cor: ['#ec4899', '#dc2626'],
    tipo_label: 'Solidariedade',
    icone_nome: 'heart',
    ativa: true,
    crianca_id: 'demo-crianca-1',
  },
];

export const DEMO_CAMPANHAS: Campanha[] = [
  {
    id: 'demo-c1',
    titulo: 'Escola para Todas as Crianças',
    descricao: 'Ajuda a construir salas de aula em zonas rurais de Angola para que todas as crianças possam estudar.',
    organizacao: 'Fundação Kamba Educa',
    meta_valor: 500000,
    valor_arrecadado: 312000,
    imagem_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600',
    ativa: true,
    causa: 'educacao',
  },
  {
    id: 'demo-c2',
    titulo: 'Alimentação Infantil Saudável',
    descricao: 'Fornece refeições nutritivas a crianças carenciadas em Luanda e Malanje.',
    organizacao: 'ONG Nutri Angola',
    meta_valor: 200000,
    valor_arrecadado: 87500,
    imagem_url: 'https://images.unsplash.com/photo-1593113630400-ea4288922559?w=600',
    ativa: true,
    causa: 'alimentacao',
  },
];

export const DEMO_CONTEUDO: ConteudoEducativo[] = [
  {
    id: 'demo-edu1',
    titulo: 'O que é o dinheiro? 💰',
    descricao: 'Aprende a história do dinheiro e por que ele é importante.',
    tipo: 'video',
    faixa_etaria: '6-8',
    thumbnail_url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600',
    video_url: '',
    duracao: '8',
    topico: 'introducao',
    completo: true,
  },
  {
    id: 'demo-edu2',
    titulo: 'Os 3 Potes Mágicos 🫙',
    descricao: 'Descobre como dividir o teu dinheiro em Gastar, Poupar e Ajudar.',
    tipo: 'animacao',
    faixa_etaria: '9-10',
    thumbnail_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
    video_url: '',
    duracao: '5',
    topico: 'potes',
    completo: false,
  },
  {
    id: 'demo-edu3',
    titulo: 'Poupar para um Objetivo 🎯',
    descricao: 'Como definir metas e juntar dinheiro para as alcançar.',
    tipo: 'video',
    faixa_etaria: '9-10',
    thumbnail_url: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=600',
    video_url: '',
    duracao: '10',
    topico: 'poupanca',
    completo: false,
  },
];

export const DEMO_HISTORICO: HistoricoTransacao[] = [
  {
    id: 'demo-h1',
    tipo: 'tarefa',
    descricao: 'Recompensa: Lavar a loiça',
    valor: 400,
    xp_ganho: 40,
    data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    pote_afetado: 'gastar',
  },
  {
    id: 'demo-h2',
    tipo: 'tarefa',
    descricao: 'Recompensa: Arrumar o quarto',
    valor: 500,
    xp_ganho: 50,
    data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    pote_afetado: 'poupar',
  },
  {
    id: 'demo-h3',
    tipo: 'doacao',
    descricao: 'Doação: Escola para Todas as Crianças',
    valor: -200,
    xp_ganho: 400,
    data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    pote_afetado: 'ajudar',
  },
  {
    id: 'demo-h4',
    tipo: 'bonus_gestao',
    descricao: 'Bónus de Gestão — poupança do mês',
    valor: 480,
    xp_ganho: 100,
    data: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    pote_afetado: 'poupar',
  },
];
