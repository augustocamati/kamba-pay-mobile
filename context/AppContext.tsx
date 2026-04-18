import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Crianca, Tarefa, Missao, Campanha, ConteudoEducativo, ItemLoja, HistoricoTransacao } from '../types';

interface AppContextType {
  crianca: Crianca;
  dependentes: Crianca[];
  tarefas: Tarefa[];
  missoes: Missao[];
  campanhas: Campanha[];
  conteudoEducativo: ConteudoEducativo[];
  itensLoja: ItemLoja[];
  historico: HistoricoTransacao[];
  aulaVistaHoje: boolean;
  isLoading: boolean;
  
  // Ações para Criança
  atualizarSaldo: (tipo: 'gastar' | 'poupar' | 'ajudar', valor: number) => void;
  enviarFotoTarefa: (tarefaId: string, fotoUrl: string) => void;
  realizarDoacao: (campanhaId: string, valor: number) => Promise<void>;
  comprarItem: (itemId: string) => void;
  atualizarAvatar: (parte: string, valor: string) => void;
  marcarConteudoCompleto: (conteudoId: string) => void;
  adicionarXP: (valor: number) => void;
  
  // Ações para Pai
  criarTarefa: (tarefa: Omit<Tarefa, 'id' | 'criado_em'>) => Promise<void>;
  criarMissao: (missao: Omit<Missao, 'id' | 'progresso_atual' | 'ativa'>) => Promise<void>;
  aprovarTarefa: (tarefaId: string) => void;
  rejeitarTarefa: (tarefaId: string) => void;
  adicionarSaldo: (valor: number, pote: 'gastar' | 'poupar' | 'ajudar') => void;
  atualizarDadosCrianca: (nome: string, idade: number) => void;
  selecionarCrianca: (criancaId: string) => void;
  criarCampanha: (campanha: Omit<Campanha, 'id' | 'criado_em' | 'valor_arrecadado'>) => void;
  concluirAula: () => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

import { 
  parentService, childService, taskService, missionService, campaignService,
  educationalService, shopService, api 
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  DEMO_CHILDREN, DEMO_TAREFAS, DEMO_MISSOES, DEMO_CAMPANHAS,
  DEMO_CONTEUDO, DEMO_HISTORICO,
} from '@/lib/demo-data';

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isDemo } = useAuth();

  const fallbackCrianca: Crianca = {
    id: 'novo',
    nome: 'ninguém (adicione um filho)',
    idade: 0,
    nivel: 1,
    xp: 0,
    paiId: '',
    potes: { saldo_gastar: 0, saldo_poupar: 0, saldo_ajudar: 0, total: 0 },
    avatar: { id: '', cabelo: 'padrao', roupa: 'padrao', acessorio: '', cor_pele: 'marrom', expressao: 'feliz' },
    tarefas: [], missoes: [], historico: []
  };

  const [dependentes, setDependentes] = useState<Crianca[]>([]);
  const [crianca, setCrianca] = useState<Crianca>(fallbackCrianca);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [conteudoEducativo, setConteudoEducativo] = useState<ConteudoEducativo[]>([]);
  const [itensLoja, setItensLoja] = useState<ItemLoja[]>([]);
  const [historico, setHistorico] = useState<HistoricoTransacao[]>([]);
  const [aulaVistaHoje, setAulaVistaHoje] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mapTarefa = (t: any): Tarefa => ({
    id: t.id,
    titulo: t.titulo,
    descricao: t.descricao || '',
    recompensa: parseFloat(t.recompensa),
    status: t.status,
    crianca_id: t.crianca_id,
    foto_url: t.foto_url,
    icone: t.icone || 'bed',
    categoria: t.categoria || 'casa',
    criado_em: t.criado_em ? new Date(t.criado_em) : new Date(),
    concluido_em: t.concluido_em ? new Date(t.concluido_em) : undefined,
    aprovado_em: t.aprovado_em ? new Date(t.aprovado_em) : undefined,
  });

  const mapMissao = (m: any): Missao => ({
    id: m.id,
    titulo: m.titulo,
    descricao: m.descricao || '',
    tipo: m.tipo || 'poupanca',
    objetivo_valor: parseFloat(m.objetivo_valor),
    progresso_atual: parseFloat(m.progresso_atual || 0),
    recompensa: parseFloat(m.recompensa || 0),
    icone: m.icone || '🎯',
    cor: m.cor || ['#3b82f6', '#7c3aed'],
    tipo_label: m.tipo_label || 'Poupança',
    icone_nome: m.icone_nome || 'trending-up',
    ativa: m.ativa !== false,
    crianca_id: m.crianca_id,
  });

  const mapCampanha = (c: any): Campanha => ({
    id: c.id,
    titulo: c.titulo || c.nome,
    descricao: c.descricao || '',
    organizacao: c.organizacao || 'Kamba Kid Pay',
    meta_valor: parseFloat(c.meta_valor || 10000),
    valor_arrecadado: parseFloat(c.valor_arrecadado || 0),
    ativa: c.ativa !== false,
    imagem_url: c.imagem_url,
    causa: c.causa || 'outro',
  });

  const mapHistorico = (h: any): HistoricoTransacao => ({
    id: h.id,
    tipo: h.tipo,
    descricao: h.descricao || '',
    valor: parseFloat(h.valor),
    data: h.data ? new Date(h.data) : new Date(),
    pote_afetado: h.pote_afetado || h.tipo,
    xp_ganho: h.xp_ganho,
  });

  const carregarDadosAPI = async () => {
    if (!user) return;

    // ── MODO DEMO ──────────────────────────────────────────────
    if (isDemo) {
      setIsLoading(true);
      setTimeout(() => {
        setDependentes(DEMO_CHILDREN);
        
        // Se for pai, mantém a criança selecionada ou pega a primeira
        if (user.role === 'parent') {
          const idParaSelecionar = crianca.id !== 'novo' ? crianca.id : DEMO_CHILDREN[0].id;
          const criancaAtiva = DEMO_CHILDREN.find(c => c.id === idParaSelecionar) || DEMO_CHILDREN[0];
          setCrianca(criancaAtiva);
          
          // Pai vê todas as tarefas e missões
          setTarefas(DEMO_TAREFAS);
          setMissoes(DEMO_MISSOES);
        } else {
          // Se for criança, pega os dados da criança logada (simulado com a primeira do demo)
          setCrianca(DEMO_CHILDREN[0]);
          setTarefas(DEMO_TAREFAS.filter(t => t.crianca_id === DEMO_CHILDREN[0].id));
          setMissoes(DEMO_MISSOES.filter(m => m.crianca_id === DEMO_CHILDREN[0].id));
        }

        setCampanhas(DEMO_CAMPANHAS);
        setConteudoEducativo(DEMO_CONTEUDO);
        setHistorico(DEMO_HISTORICO);
        setIsLoading(false);
      }, 800); // simula latência
      return;
    }
    // ───────────────────────────────────────────────────────────

    setIsLoading(true);
    try {
      if (user.role === 'parent') {
        // Dashboard principal (dependentes, tarefas pendentes, campanhas, missões)
        const [dashRes, tasksRes, campaignsRes] = await Promise.all([
          parentService.getDashboard(),
          taskService.getTasks(),
          campaignService.getCampaigns(true).catch(() => ({ campanhas: [] })),
        ]);

        if (dashRes.dependentes) {
          const deps = dashRes.dependentes.map((d: any): Crianca => ({
            id: d.id,
            nome: d.nome,
            idade: d.idade,
            nivel: d.nivel,
            xp: 0,
            paiId: user.id,
            potes: d.potes,
            avatar: { id: '', cabelo: 'padrao', roupa: 'padrao', acessorio: '', cor_pele: 'marrom', expressao: 'feliz' },
            tarefas: [], missoes: [], historico: []
          }));
          setDependentes(deps);
          if (deps.length > 0) {
            setCrianca(prev => ({ ...prev, ...deps[0] }));
          }
        }

        // Todas as tarefas
        if (tasksRes.tarefas) {
          setTarefas(tasksRes.tarefas.map(mapTarefa));
        }

        if (campaignsRes.campanhas) {
          setCampanhas(campaignsRes.campanhas.map(mapCampanha));
        }

        if (dashRes.missoes_ativas) {
          setMissoes(dashRes.missoes_ativas.map(mapMissao));
        }

      } else {
        // Criança
        const [dashRes, campaignsRes, contentRes] = await Promise.all([
          childService.getDashboard(),
          campaignService.getCampaigns(true).catch(() => ({ campanhas: [] })),
          educationalService.getContent().catch(() => ({ conteudos: [] })),
        ]);

        if (dashRes.crianca) {
          const c = dashRes.crianca;
          setCrianca({
            id: c.id,
            nome: c.nome,
            idade: c.idade,
            nivel: c.nivel,
            xp: c.xp || 0,
            paiId: '',
            potes: c.potes || fallbackCrianca.potes,
            avatar: c.avatar || fallbackCrianca.avatar,
            tarefas: [], missoes: [], historico: []
          });
        }

        if (dashRes.tarefas_do_dia) {
          setTarefas(dashRes.tarefas_do_dia.map(mapTarefa));
        }

        if (dashRes.missoes) {
          setMissoes(dashRes.missoes.map(mapMissao));
        } else if (dashRes.missao_destaque) {
          setMissoes([mapMissao({ ...dashRes.missao_destaque, ativa: true })]);
        }

        if (campaignsRes.campanhas) {
          setCampanhas(campaignsRes.campanhas.map(mapCampanha));
        }

        if (contentRes.conteudos) {
          setConteudoEducativo(contentRes.conteudos.map((c: any): ConteudoEducativo => ({
            id: c.id,
            titulo: c.titulo,
            tipo: c.tipo,
            thumbnail_url: c.thumbnail_url || `https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800`,
            video_url: c.video_url,
            duracao: c.duracao || '5',
            descricao: c.descricao || '',
            faixa_etaria: c.faixa_etaria || '6-12',
            completo: c.completo || false,
          })));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados da API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    carregarDadosAPI();
  }, [user, isDemo]);

  // Atualizar saldo dos potes
  const atualizarSaldo = (tipo: 'gastar' | 'poupar' | 'ajudar', valor: number) => {
    setCrianca(prev => {
      const novosPotes = { ...prev.potes };
      (novosPotes as any)[`saldo_${tipo}`] += valor;
      novosPotes.total = novosPotes.saldo_gastar + novosPotes.saldo_poupar + novosPotes.saldo_ajudar;
      return { ...prev, potes: novosPotes };
    });
  };

  // Enviar foto de prova da tarefa
  const enviarFotoTarefa = (tarefaId: string, fotoUrl: string) => {
    setTarefas(prev => prev.map(t => 
      t.id === tarefaId 
        ? { ...t, foto_url: fotoUrl, status: 'aguardando_aprovacao', concluido_em: new Date() }
        : t
    ));
  };

  // Realizar doação para campanha (via API real)
  const realizarDoacao = async (campanhaId: string, valor: number) => {
    if (crianca.potes.saldo_ajudar < valor) return;
    try {
      await campaignService.donate(campanhaId, valor);
      atualizarSaldo('ajudar', -valor);
      setCampanhas(prev => prev.map(c => 
        c.id === campanhaId 
          ? { ...c, valor_arrecadado: c.valor_arrecadado + valor }
          : c
      ));
      setHistorico(prev => [{
        id: `hist-${Date.now()}`,
        tipo: 'doacao',
        descricao: campanhas.find(c => c.id === campanhaId)?.titulo || 'Doação',
        valor: -valor,
        xp_ganho: valor * 2,
        data: new Date(),
        pote_afetado: 'ajudar'
      }, ...prev]);
      adicionarXP(valor * 2);
    } catch (e) {
      console.error('Erro ao fazer doação:', e);
    }
  };

  // Comprar item da loja
  const comprarItem = (itemId: string) => {
    const item = itensLoja.find(i => i.id === itemId);
    if (item && crianca.potes.saldo_gastar >= item.preco) {
      setItensLoja(prev => prev.map(i => i.id === itemId ? { ...i, desbloqueado: true } : i));
      atualizarSaldo('gastar', -item.preco);
      setHistorico(prev => [{
        id: `hist-${Date.now()}`,
        tipo: 'compra',
        descricao: item.nome,
        valor: -item.preco,
        data: new Date(),
        pote_afetado: 'gastar'
      }, ...prev]);
    }
  };

  const atualizarAvatar = (parte: string, valor: string) => {
    setCrianca(prev => ({ ...prev, avatar: { ...prev.avatar, [parte]: valor } }));
  };

  const marcarConteudoCompleto = (conteudoId: string) => {
    setConteudoEducativo(prev => prev.map(c => c.id === conteudoId ? { ...c, completo: true } : c));
  };

  // Criar nova tarefa (ação do pai) — API real ou demo
  const criarTarefa = async (novaTarefa: Omit<Tarefa, 'id' | 'criado_em'>) => {
    if (isDemo) {
      const tarefa: Tarefa = {
        ...novaTarefa,
        id: `demo-t${Date.now()}`,
        criado_em: new Date(),
      };
      setTarefas(prev => [tarefa, ...prev]);
      return;
    }
    try {
      const res = await taskService.createTask({
        titulo: novaTarefa.titulo,
        descricao: novaTarefa.descricao,
        recompensa: novaTarefa.recompensa,
        categoria: novaTarefa.categoria,
        crianca_id: novaTarefa.crianca_id,
        icone: novaTarefa.icone
      });
      const tarefa: Tarefa = {
        ...novaTarefa,
        id: res.id || `tarefa-${Date.now()}`,
        criado_em: res.criado_em ? new Date(res.criado_em) : new Date()
      };
      setTarefas(prev => [tarefa, ...prev]);
    } catch(e) {
      console.error('Erro ao criar tarefa:', e);
      throw e;
    }
  };

  // Criar missão (ação do pai)
  const criarMissao = async (novaMissao: Omit<Missao, 'id' | 'progresso_atual' | 'ativa'>) => {
    if (isDemo) {
      const missao: Missao = {
        ...novaMissao,
        id: `demo-m${Date.now()}`,
        progresso_atual: 0,
        ativa: true,
      };
      setMissoes(prev => [missao, ...prev]);
      return;
    }
    try {
      const res = await missionService.createMission(novaMissao);
      const missao: Missao = {
        ...novaMissao,
        id: res.id || `missao-${Date.now()}`,
        progresso_atual: 0,
        ativa: true,
      };
      setMissoes(prev => [missao, ...prev]);
    } catch(e) {
      console.error('Erro ao criar missão:', e);
      throw e;
    }
  };

  // Aprovar tarefa — demo ou API real
  const aprovarTarefa = async (tarefaId: string) => {
    if (isDemo) {
      const tarefa = tarefas.find(t => t.id === tarefaId);
      setTarefas(prev => prev.map(t =>
        t.id === tarefaId ? { ...t, status: 'concluida', aprovado_em: new Date() } : t
      ));
      if (tarefa) atualizarSaldo('gastar', tarefa.recompensa * 0.6);
      return;
    }
    try {
      const res = await taskService.approveTask(tarefaId);
      setTarefas(prev => prev.map(t =>
        t.id === tarefaId ? { ...t, status: 'concluida', aprovado_em: new Date() } : t
      ));
      if (res?.recompensa_creditada?.detalhes) {
        const { gastar, poupar, ajudar } = res.recompensa_creditada.detalhes;
        setCrianca(prev => ({
          ...prev,
          potes: { saldo_gastar: gastar, saldo_poupar: poupar, saldo_ajudar: ajudar, total: gastar + poupar + ajudar }
        }));
      }
    } catch(e) { console.error('Erro ao aprovar tarefa:', e); }
  };

  // Rejeitar tarefa — demo ou API real
  const rejeitarTarefa = async (tarefaId: string) => {
    if (isDemo) {
      setTarefas(prev => prev.map(t =>
        t.id === tarefaId ? { ...t, status: 'rejeitada', foto_url: undefined } : t
      ));
      return;
    }
    try {
      await taskService.rejectTask(tarefaId, 'Rejeitada pelo Responsável');
      setTarefas(prev => prev.map(t =>
        t.id === tarefaId ? { ...t, status: 'rejeitada', foto_url: undefined } : t
      ));
    } catch(e) { console.error('Erro ao rejeitar tarefa:', e); }
  };

  // Adicionar saldo — demo ou API real
  const adicionarSaldo = async (valor: number, pote: 'gastar' | 'poupar' | 'ajudar') => {
    if (isDemo) {
      atualizarSaldo(pote, valor);
      setHistorico(prev => [{
        id: `demo-h${Date.now()}`, tipo: 'tarefa',
        descricao: 'Mesada (Demo)', valor, data: new Date(), pote_afetado: pote
      }, ...prev]);
      return;
    }
    try {
      if (crianca.id && crianca.id !== 'novo') {
        await parentService.addBalance(crianca.id, valor, pote, 'Mesada adicionada pelos pais');
      }
      atualizarSaldo(pote, valor);
      setHistorico(prev => [{
        id: `hist-${Date.now()}`, tipo: 'tarefa',
        descricao: 'Mesada adicionada pelos pais', valor, data: new Date(), pote_afetado: pote
      }, ...prev]);
    } catch (e) {
      console.error('Erro ao adicionar saldo:', e);
    }
  };

  const atualizarDadosCrianca = (nome: string, idade: number) => {
    setCrianca(prev => ({ ...prev, nome, idade }));
  };

  const selecionarCrianca = (criancaId: string) => {
    const selecionada = dependentes.find(d => d.id === criancaId);
    if (selecionada) {
      setCrianca(selecionada);
      // Recarregar dados específicos desta criança
      carregarDadosAPI();
    }
  };

  // Criar campanha — API real
  const criarCampanha = async (novaCampanha: Omit<Campanha, 'id' | 'criado_em' | 'valor_arrecadado'>) => {
    try {
      const res = await campaignService.createCampaign({
        nome: novaCampanha.titulo,
        descricao: novaCampanha.descricao,
        organizacao: novaCampanha.organizacao,
        meta_valor: novaCampanha.meta_valor,
        causa: novaCampanha.causa,
      });
      const campanha: Campanha = {
        ...novaCampanha,
        id: res.id || `campanha-${Date.now()}`,
        valor_arrecadado: 0,
      };
      setCampanhas(prev => [campanha, ...prev]);
    } catch (e) {
      console.error('Erro ao criar campanha:', e);
      // Fallback local
      setCampanhas(prev => [{
        ...novaCampanha,
        id: `campanha-${Date.now()}`,
        valor_arrecadado: 0,
      }, ...prev]);
    }
  };

  const adicionarXP = (valor: number) => {
    setCrianca(prev => ({
      ...prev,
      xp: (prev.xp || 0) + valor,
      nivel: Math.floor(((prev.xp || 0) + valor) / 100) + 1
    }));
  };

  const concluirAula = () => {
    setAulaVistaHoje(true);
  };

  return (
    <AppContext.Provider value={{
      crianca,
      dependentes,
      tarefas,
      missoes,
      campanhas,
      conteudoEducativo,
      itensLoja,
      historico,
      aulaVistaHoje,
      isLoading,
      atualizarSaldo,
      enviarFotoTarefa,
      realizarDoacao,
      comprarItem,
      atualizarAvatar,
      marcarConteudoCompleto,
      criarTarefa,
      criarMissao,
      aprovarTarefa,
      rejeitarTarefa,
      adicionarSaldo,
      atualizarDadosCrianca,
      selecionarCrianca,
      criarCampanha,
      adicionarXP,
      concluirAula,
      refreshData: carregarDadosAPI
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}