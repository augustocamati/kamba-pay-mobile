// ═══════════════════════════════════════════════════════════════
// Admin Mock Data — Kamba Kid Pay
// ═══════════════════════════════════════════════════════════════

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  tipo: 'pai' | 'crianca';
  provincia: string;
  municipio: string;
  saldo: number;
  status: 'ativo' | 'inativo';
  dataCadastro: string;
}

export interface AdminTask {
  id: string;
  icone: string;
  titulo: string;
  descricao: string;
  categoria: string;
  dificuldade: string;
  recompensa: number;
  tempo: string;
  status: 'ativo' | 'inativo';
  completadas: number;
  ativas: number;
}

export interface AdminVideo {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
  thumbnail: string;
  categoria: string;
  duracao: string;
  visualizacoes: number;
}

export interface AdminCampaign {
  id: string;
  titulo: string;
  descricao: string;
  organizacao: string;
  causa: string;
  meta: number;
  arrecadado: number;
  pct: number;
  ativa: boolean;
}

export interface AdminActivityItem {
  name: string;
  action: string;
  time: string;
  color: string;
}

// ── USERS ──────────────────────────────────────────────────────
export const ADMIN_USERS: AdminUser[] = [
  {
    id: 'u-1', nome: 'João Manuel', email: 'joao.manuel@email.com',
    telefone: '+244 923 456 789', tipo: 'pai', provincia: 'Luanda', municipio: 'Talatona',
    saldo: 45000, status: 'ativo', dataCadastro: '2024-01-15',
  },
  {
    id: 'u-2', nome: 'Maria Silva', email: 'maria.silva@email.com',
    telefone: '+244 912 370 270', tipo: 'pai', provincia: 'Benguela', municipio: 'Lobito',
    saldo: 32500, status: 'ativo', dataCadastro: '2024-01-20',
  },
  {
    id: 'u-3', nome: 'Pedro Kamba', email: 'pedro.kamba@email.com',
    telefone: '+244 943 611 311', tipo: 'crianca', provincia: 'Huíla', municipio: 'Lubango',
    saldo: 8500, status: 'ativo', dataCadastro: '2024-02-01',
  },
  {
    id: 'u-4', nome: 'Ana Costa', email: 'ana.costa@email.com',
    telefone: '+244 923 109 321', tipo: 'pai', provincia: 'Huambo', municipio: 'Caála',
    saldo: 58000, status: 'ativo', dataCadastro: '2024-02-10',
  },
  {
    id: 'u-5', nome: 'Carlos Neto', email: 'carlos.neto@email.com',
    telefone: '+244 931 234 56', tipo: 'crianca', provincia: 'Luanda', municipio: 'Viana',
    saldo: 1500, status: 'inativo', dataCadastro: '2024-02-15',
  },
  {
    id: 'u-6', nome: 'Luísa António', email: 'luisa.antonio@email.com',
    telefone: '+244 943 498 788', tipo: 'pai', provincia: 'Benguela', municipio: 'Benguela',
    saldo: 42000, status: 'ativo', dataCadastro: '2024-03-01',
  },
  {
    id: 'u-7', nome: 'Miguel Fernando', email: 'miguel.fernando@email.com',
    telefone: '+244 913 457 391', tipo: 'crianca', provincia: 'Cabinda', municipio: 'Cabinda',
    saldo: 12000, status: 'ativo', dataCadastro: '2024-03-10',
  },
  {
    id: 'u-8', nome: 'Teresa João', email: 'teresa.joao@email.com',
    telefone: '+244 946 222 111', tipo: 'pai', provincia: 'Huíla', municipio: 'Matala',
    saldo: 37500, status: 'ativo', dataCadastro: '2024-03-15',
  },
];

// ── TASKS ──────────────────────────────────────────────────────
export const ADMIN_TASKS: AdminTask[] = [
  {
    id: 'task-1', icone: '🛏️', titulo: 'Arrumar a Cama',
    descricao: 'Organize sua cama todos os dias ao acordar',
    categoria: 'Casa', dificuldade: 'Fácil', recompensa: 100,
    tempo: '5 min', status: 'ativo', completadas: 245, ativas: 3,
  },
  {
    id: 'task-2', icone: '📚', titulo: 'Fazer Lição de Casa',
    descricao: 'Complete todas as tarefas escolares do dia antes de brincar',
    categoria: 'Escola', dificuldade: 'Médio', recompensa: 500,
    tempo: '60 min', status: 'ativo', completadas: 180, ativas: 2,
  },
  {
    id: 'task-3', icone: '🍽️', titulo: 'Lavar a Louça',
    descricao: 'Ajuda lavando os pratos após as refeições',
    categoria: 'Casa', dificuldade: 'Médio', recompensa: 300,
    tempo: '15 min', status: 'ativo', completadas: 156, ativas: 4,
  },
  {
    id: 'task-4', icone: '📖', titulo: 'Ler 30 Minutos',
    descricao: 'Dedique tempo para leitura diária de um livro à sua escolha',
    categoria: 'Escola', dificuldade: 'Fácil', recompensa: 400,
    tempo: '30 min', status: 'ativo', completadas: 98, ativas: 1,
  },
  {
    id: 'task-5', icone: '🌱', titulo: 'Regar as Plantas',
    descricao: 'Cuide das plantas da casa regando-as com a quantidade certa de água',
    categoria: 'Casa', dificuldade: 'Fácil', recompensa: 150,
    tempo: '10 min', status: 'inativo', completadas: 67, ativas: 0,
  },
  {
    id: 'task-6', icone: '⚽', titulo: 'Treino de Futebol',
    descricao: 'Pratique suas habilidades de futebol por 1 hora',
    categoria: 'Esporte', dificuldade: 'Médio', recompensa: 350,
    tempo: '60 min', status: 'ativo', completadas: 120, ativas: 2,
  },
];

// ── VIDEOS ──────────────────────────────────────────────────────
export const ADMIN_VIDEOS: AdminVideo[] = [
  {
    id: 'vid-1', titulo: 'O Que é Poupar?',
    descricao: 'Aprenda a importância de guardar dinheiro para o futuro',
    url: 'https://youtube.com/watch?v=demo1',
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80',
    categoria: 'Poupar', duracao: '4:30', visualizacoes: 1240,
  },
  {
    id: 'vid-2', titulo: 'Como Gastar com Sabedoria',
    descricao: 'Dicas para fazer boas escolhas na hora de comprar',
    url: 'https://youtube.com/watch?v=demo2',
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80',
    categoria: 'Gastar', duracao: '3:15', visualizacoes: 890,
  },
  {
    id: 'vid-3', titulo: 'Ajudar Quem Precisa',
    descricao: 'Por que compartilhar faz bem para todos',
    url: 'https://youtube.com/watch?v=demo3',
    thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80',
    categoria: 'Ajudar', duracao: '5:00', visualizacoes: 670,
  },
  {
    id: 'vid-4', titulo: 'O Que É Investir?',
    descricao: 'Entenda como fazer o dinheiro trabalhar para você',
    url: 'https://youtube.com/watch?v=demo4',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    categoria: 'Investir', duracao: '6:20', visualizacoes: 430,
  },
  {
    id: 'vid-5', titulo: 'Planeja teu Orçamento',
    descricao: 'Como organizar o dinheiro que você tem para não faltar',
    url: 'https://youtube.com/watch?v=demo5',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
    categoria: 'Planejamento', duracao: '5:45', visualizacoes: 560,
  },
];

// ── CAMPAIGNS ──────────────────────────────────────────────────
export const ADMIN_CAMPAIGNS: AdminCampaign[] = [
  {
    id: 'camp-1', titulo: 'Merenda Escolar',
    descricao: 'Ajude a fornecer merenda para crianças em escolas rurais de Angola',
    organizacao: 'ONG Kamba Solidário', causa: 'educacao',
    meta: 500000, arrecadado: 312000, pct: 62, ativa: true,
  },
  {
    id: 'camp-2', titulo: 'Água Limpa para Todos',
    descricao: 'Construção de poços e sistemas de filtragem de água em comunidades rurais',
    organizacao: 'UNICEF Angola', causa: 'saude',
    meta: 800000, arrecadado: 540000, pct: 68, ativa: true,
  },
  {
    id: 'camp-3', titulo: 'Árvores para Luanda',
    descricao: 'Plantação de 10.000 árvores na capital para recuperar áreas degradadas',
    organizacao: 'Verde Angola', causa: 'ambiente',
    meta: 200000, arrecadado: 186000, pct: 93, ativa: true,
  },
  {
    id: 'camp-4', titulo: 'Cesta Básica de Natal',
    descricao: 'Distribuição de cestas básicas para famílias necessitadas no Natal',
    organizacao: 'Caritas Angola', causa: 'alimentacao',
    meta: 300000, arrecadado: 300000, pct: 100, ativa: false,
  },
];

// ── ACTIVITY ──────────────────────────────────────────────────
export const ADMIN_ACTIVITY: AdminActivityItem[] = [
  { name: 'João Manuel', action: 'Completou Quiz "Poupar é Legal"', time: '1 min atrás', color: '#3B82F6' },
  { name: 'Maria Silva', action: 'Transferiu Kz 5.000 para o filho', time: '18 min atrás', color: '#F59E0B' },
  { name: 'Pedro Kamba', action: 'Assistiu vídeo "O Que é Poupar?"', time: '1 hora atrás', color: '#22C55E' },
  { name: 'Ana Costa', action: 'Criou nova meta de poupança', time: '2 horas atrás', color: '#8B5CF6' },
  { name: 'Carlos Neto', action: 'Concluiu tarefa "Arrumar a Cama"', time: '3 horas atrás', color: '#EF4444' },
];

// ── STATS ──────────────────────────────────────────────────────
export const ADMIN_STATS = {
  totalUsers: 1247,
  transactions: 8542,
  volume: 'Kz 2,8M',
  quizzes: 3456,
};
