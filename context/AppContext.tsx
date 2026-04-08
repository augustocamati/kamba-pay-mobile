import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Crianca, Tarefa, Missao, Campanha, ConteudoEducativo, ItemLoja, HistoricoTransacao } from '../types';

interface AppContextType {
  crianca: Crianca;
  dependentes: Crianca[]; // Add list of children
  tarefas: Tarefa[];
  missoes: Missao[];
  campanhas: Campanha[];
  conteudoEducativo: ConteudoEducativo[];
  itensLoja: ItemLoja[];
  historico: HistoricoTransacao[];
  aulaVistaHoje: boolean;
  
  // Ações para Criança
  atualizarSaldo: (tipo: 'gastar' | 'poupar' | 'ajudar', valor: number) => void;
  enviarFotoTarefa: (tarefaId: string, fotoUrl: string) => void;
  realizarDoacao: (campanhaId: string, valor: number) => void;
  comprarItem: (itemId: string) => void;
  atualizarAvatar: (parte: string, valor: string) => void;
  marcarConteudoCompleto: (conteudoId: string) => void;
  adicionarXP: (valor: number) => void;
  
  // Ações para Pai
  criarTarefa: (tarefa: Omit<Tarefa, 'id' | 'criado_em'>) => void;
  aprovarTarefa: (tarefaId: string) => void;
  rejeitarTarefa: (tarefaId: string) => void;
  adicionarSaldo: (valor: number, pote: 'gastar' | 'poupar' | 'ajudar') => void;
  atualizarDadosCrianca: (nome: string, idade: number) => void;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // Hook directly

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

  const carregarDadosAPI = async () => {
    if (!user) return;
    try {
      if (user.role === 'parent') {
          const res = await parentService.getDashboard();
          if (res.dependentes) {
            setDependentes(res.dependentes.map((d: any) => ({
              id: d.id,
              nome: d.nome,
              idade: d.idade,
              nivel: d.nivel,
              xp: 0,
              paiId: user.id,
              potes: d.potes,
              avatar: { id: '', cabelo: 'padrao', roupa: 'padrao', acessorio: '', cor_pele: 'marrom', expressao: 'feliz' },
              tarefas: [], missoes: [], historico: []
            })));
            if (res.dependentes.length > 0) {
              setCrianca((prev: any) => ({ ...prev, ...res.dependentes[0] }));
            }
          }
          if (res.tarefas_pendentes_aprovacao) {
             setTarefas(res.tarefas_pendentes_aprovacao.map((t: any) => ({
               ...t,
               id: t.id, titulo: t.titulo, descricao: t.descricao, recompensa: t.recompensa,
               status: t.status, crianca_id: t.crianca_id, foto_url: t.foto_url,
               criado_em: new Date(), concluido_em: t.concluido_em ? new Date(t.concluido_em) : undefined,
               icone: t.icone || 'bed', categoria: t.categoria || 'save'
             })));
          }
          if (res.campanhas_ativas) {
             setCampanhas(res.campanhas_ativas.map((c: any) => ({
                id: c.id, titulo: c.titulo, descricao: c.descricao || '',
                meta_valor: 10000, valor_arrecadado: 0, ativa: true, organizacao: c.organizacao, causa: 'outro'
             })));
          }
          if(res.missoes_ativas) {
             setMissoes(res.missoes_ativas.map((m: any) => ({
                id: m.id, titulo: m.titulo, descricao: '', tipo: 'poupanca', objetivo_valor: m.objetivo_valor,
                progresso_atual: m.progresso_atual, recompensa: 0, icone: '🎯', cor: ['#000', '#000'],
                tipo_label: 'Poupança', icone_nome: 'trending-up', ativa: true, crianca_id: m.crianca_id
             })));
          }
        } else {
          // Criança
          const res = await childService.getDashboard();
          if (res.crianca) {
             setCrianca((prev: any) => ({ ...prev, ...res.crianca }));
          }
          if(res.tarefas_do_dia) {
             setTarefas(res.tarefas_do_dia.map((t: any) => ({ ...t, criado_em: new Date() })));
          }
          if(res.missao_destaque) {
             setMissoes([{ ...res.missao_destaque, ativa: true, tipo: 'poupanca', cor: ['#BF5AF2', '#A335EE'] }]);
          }
        }
    } catch (error) {
      console.error("Erro ao carregar dados da API:", error);
    }
  };

  React.useEffect(() => {
    carregarDadosAPI();
  }, [user]);

  // Atualizar saldo dos potes
  const atualizarSaldo = (tipo: 'gastar' | 'poupar' | 'ajudar', valor: number) => {
    setCrianca(prev => {
      const novosPotes = { ...prev.potes };
      novosPotes[`saldo_${tipo}`] += valor;
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

  // Realizar doação para campanha
  const realizarDoacao = (campanhaId: string, valor: number) => {
    if (crianca.potes.saldo_ajudar >= valor) {
      // Atualizar saldo
      atualizarSaldo('ajudar', -valor);
      
      // Atualizar campanha
      setCampanhas(prev => prev.map(c => 
        c.id === campanhaId 
          ? { ...c, valor_arrecadado: c.valor_arrecadado + valor }
          : c
      ));
      
      // Atualizar progresso da missão de solidariedade
      setMissoes(prev => prev.map(m => 
        m.tipo === 'solidariedade' 
          ? { ...m, progresso_atual: m.progresso_atual + valor }
          : m
      ));
      
      // Adicionar ao histórico
      const campanhaEncontrada = campanhas.find(c => c.id === campanhaId);
      setHistorico(prev => [{
        id: `hist-${Date.now()}`,
        tipo: 'doacao',
        descricao: campanhaEncontrada?.titulo || 'Doação',
        valor: -valor,
        xp_ganho: valor * 2, // XP em Dobro
        data: new Date(),
        pote_afetado: 'ajudar'
      }, ...prev]);
      
      // Ganhar XP em dobro
      adicionarXP(valor * 2);
    }
  };

  // Comprar item da loja
  const comprarItem = (itemId: string) => {
    const item = itensLoja.find(i => i.id === itemId);
    if (item && crianca.potes.saldo_gastar >= item.preco) {
      // Desbloquear item
      setItensLoja(prev => prev.map(i => 
        i.id === itemId ? { ...i, desbloqueado: true } : i
      ));
      
      // Atualizar saldo
      atualizarSaldo('gastar', -item.preco);
      
      // Adicionar ao histórico
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

  // Atualizar avatar
  const atualizarAvatar = (parte: string, valor: string) => {
    setCrianca(prev => ({
      ...prev,
      avatar: { ...prev.avatar, [parte]: valor }
    }));
  };

  // Marcar conteúdo educativo como completo
  const marcarConteudoCompleto = (conteudoId: string) => {
    setConteudoEducativo(prev => prev.map(c => 
      c.id === conteudoId ? { ...c, completo: true } : c
    ));
  };

  // Criar nova tarefa (ação do pai)
  const criarTarefa = async (novaTarefa: Omit<Tarefa, 'id' | 'criado_em'>) => {
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
      console.error(e);
    }
  };

  // Aprovar tarefa (ação do pai)
  const aprovarTarefa = async (tarefaId: string) => {
    try {
       await taskService.approveTask(tarefaId);
       // Fallback mock style update for reactivity
       const tarefa = tarefas.find(t => t.id === tarefaId);
       if (tarefa) {
        setTarefas(prev => prev.map(t => 
          t.id === tarefaId 
            ? { ...t, status: 'concluida', aprovado_em: new Date() }
            : t
        ));
        const gastarPct = crianca?.potes?.config?.gastar?.label ? 60 : 60;
        const pouparPct = crianca?.potes?.config?.poupar?.label ? 30 : 30;
        const ajudarPct = 100 - gastarPct - pouparPct;
        const valGastar = Math.round((tarefa.recompensa * gastarPct) / 100);
        const valPoupar = Math.round((tarefa.recompensa * pouparPct) / 100);
        const valAjudar = tarefa.recompensa - valGastar - valPoupar;
        setCrianca(prev => {
          const np = { ...prev.potes };
          np.saldo_gastar += valGastar;
          np.saldo_poupar += valPoupar;
          np.saldo_ajudar += valAjudar;
          np.total = np.saldo_gastar + np.saldo_poupar + np.saldo_ajudar;
          return { ...prev, potes: np };
        });
       }
    } catch(e) { console.error(e); }
  };

  // Rejeitar tarefa (ação do pai)
  const rejeitarTarefa = async (tarefaId: string) => {
    try {
      await taskService.rejectTask(tarefaId, 'Rejeitada pelo Responsável');
      setTarefas(prev => prev.map(t => 
        t.id === tarefaId 
          ? { ...t, status: 'rejeitada', foto_url: undefined }
          : t
      ));
    } catch(e) { console.error(e); }
  };

  // Adicionar saldo (ação do pai)
  const adicionarSaldo = (valor: number, pote: 'gastar' | 'poupar' | 'ajudar') => {
    atualizarSaldo(pote, valor);
    setHistorico(prev => [{
      id: `hist-${Date.now()}`,
      tipo: 'tarefa',
      descricao: 'Mesada adicionada pelos pais',
      valor: valor,
      data: new Date(),
      pote_afetado: pote
    }, ...prev]);
  };

  // Atualizar dados da criança (nome e idade)
  const atualizarDadosCrianca = (nome: string, idade: number) => {
    setCrianca(prev => ({
      ...prev,
      nome,
      idade
    }));
  };

  // Criar nova campanha
  const criarCampanha = (novaCampanha: Omit<Campanha, 'id' | 'criado_em' | 'valor_arrecadado'>) => {
    const campanha: Campanha = {
      ...novaCampanha,
      id: `campanha-${Date.now()}`,
      valor_arrecadado: 0,
      criado_em: new Date()
    };
    setCampanhas(prev => [campanha, ...prev]);
  };

  // Adicionar XP
  const adicionarXP = (valor: number) => {
    setCrianca(prev => ({
      ...prev,
      xp: (prev.xp || 0) + valor,
      nivel: Math.floor(((prev.xp || 0) + valor) / 100) + 1 // Regra simples: 1 nível a cada 100 XP
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
      atualizarSaldo,
      enviarFotoTarefa,
      realizarDoacao,
      comprarItem,
      atualizarAvatar,
      marcarConteudoCompleto,
      criarTarefa,
      aprovarTarefa,
      rejeitarTarefa,
      adicionarSaldo,
      atualizarDadosCrianca,
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