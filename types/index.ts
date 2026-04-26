// Tipos de dados completos do Kamba Kid Pay

export type StatusTarefa = 'pendente' | 'aguardando_aprovacao' | 'aprovada' | 'rejeitada';
export type TipoMissao = 'poupanca' | 'consumo' | 'solidariedade' | 'estudo' | 'saude' | 'autonomia' | 'comportamento';
export type FaixaEtaria = '6-8' | '9-10' | '11-12';

export interface Usuario {
  id: string;
  nome: string;
  tipo: 'crianca' | 'pai';
  email?: string;
  criancas?: Crianca[];
}

export interface Crianca {
  id: string;
  nome: string;
  idade: number;
  nivel: number;
  xp: number;
  paiId: string;
  avatar: Avatar;
  potes: Potes;
  tarefas: Tarefa[];
  missoes: Missao[];
  historico: HistoricoTransacao[];
}

export interface Avatar {
  id: string;
  cabelo: string;
  roupa: string;
  acessorio: string;
  cor_pele: string;
  expressao: string;
}

export interface PoteInfo {
  valor: number;
  label: string;
  descricao: string;
  cor: string[];
  icone: string;
}

export interface Potes {
  saldo_gastar: number;
  saldo_poupar: number;
  saldo_ajudar: number;
  total: number;
  config?: {
    gastar: Omit<PoteInfo, 'valor'>;
    poupar: Omit<PoteInfo, 'valor'>;
    ajudar: Omit<PoteInfo, 'valor'>;
  }
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  recompensa: number;
  status: StatusTarefa;
  crianca_id: string;
  foto_url?: string;
  criado_em: Date;
  concluido_em?: Date;
  aprovado_em?: Date;
  icone: string;
  categoria: string;
  motivo_rejeicao?: string;
  data_limite?: Date;
}

export interface Missao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoMissao;
  objetivo_valor: number;
  progresso_atual: number;
  recompensa: number;
  icone: string;
  cor: string[];
  tipo_label: string;
  icone_nome: string;
  ativa: boolean;
  crianca_id: string;
}

export interface Campanha {
  id: string;
  titulo: string;
  descricao: string;
  meta_valor: number;
  valor_arrecadado: number;
  imagem_url?: string;
  ativa: boolean;
  organizacao: string;
  causa: string;
  criado_em?: Date;
}

export interface ConteudoEducativo {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'video' | 'animacao' | 'jogo';
  faixa_etaria: FaixaEtaria;
  thumbnail_url?: string;
  video_url?: string;
  duracao?: string;
  topico?: string;
  id_missao?: string | number;
  completo: boolean;
}

export interface ItemLoja {
  id: string;
  nome: string;
  tipo: 'cabelo' | 'roupa' | 'acessorio';
  preco: number;
  imagem_url?: string;
  desbloqueado: boolean;
  nivel_necessario: number;
}

export interface HistoricoTransacao {
  id: string;
  tipo: 'tarefa' | 'compra' | 'doacao' | 'missao' | 'bonus_gestao' | 'escola';
  descricao: string;
  valor: number;
  xp_ganho?: number;
  data: Date;
  pote_afetado?: 'gastar' | 'poupar' | 'ajudar';
}

export interface RelatorioProgresso {
  crianca_id: string;
  periodo: string;
  tarefas_concluidas: number;
  total_ganho: number;
  missoes_completas: number;
  doacoes_realizadas: number;
  meta_poupanca_progresso: number;
}