import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Crianca, Tarefa, Missao, Campanha, ConteudoEducativo, ItemLoja, HistoricoTransacao } from '../types';
import { 
  mockCrianca, 
  mockTarefas, 
  mockMissoes, 
  mockCampanhas, 
  mockConteudoEducativo, 
  mockItensLoja,
  mockHistorico,
  mockCrianca2
} from '../data/mockData';

interface AppContextType {
  crianca: Crianca;
  dependentes: Crianca[]; // Add list of children
  tarefas: Tarefa[];
  missoes: Missao[];
  campanhas: Campanha[];
  conteudoEducativo: ConteudoEducativo[];
  itensLoja: ItemLoja[];
  historico: HistoricoTransacao[];
  
  // Ações para Criança
  atualizarSaldo: (tipo: 'gastar' | 'poupar' | 'ajudar', valor: number) => void;
  enviarFotoTarefa: (tarefaId: string, fotoUrl: string) => void;
  realizarDoacao: (campanhaId: string, valor: number) => void;
  comprarItem: (itemId: string) => void;
  atualizarAvatar: (parte: string, valor: string) => void;
  marcarConteudoCompleto: (conteudoId: string) => void;
  
  // Ações para Pai
  criarTarefa: (tarefa: Omit<Tarefa, 'id' | 'criado_em'>) => void;
  aprovarTarefa: (tarefaId: string) => void;
  rejeitarTarefa: (tarefaId: string) => void;
  adicionarSaldo: (valor: number, pote: 'gastar' | 'poupar' | 'ajudar') => void;
  atualizarDadosCrianca: (nome: string, idade: number) => void;
  criarCampanha: (campanha: Omit<Campanha, 'id' | 'criado_em' | 'valor_arrecadado'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dependentes, setDependentes] = useState<Crianca[]>([
    {
      ...mockCrianca,
      tarefas: mockTarefas,
      missoes: mockMissoes,
      historico: mockHistorico
    },
    mockCrianca2
  ]);
  
  const [crianca, setCrianca] = useState<Crianca>(dependentes[0]);
  
  const [tarefas, setTarefas] = useState<Tarefa[]>(mockTarefas);
  const [missoes, setMissoes] = useState<Missao[]>(mockMissoes);
  const [campanhas, setCampanhas] = useState<Campanha[]>(mockCampanhas);
  const [conteudoEducativo, setConteudoEducativo] = useState<ConteudoEducativo[]>(mockConteudoEducativo);
  const [itensLoja, setItensLoja] = useState<ItemLoja[]>(mockItensLoja);
  const [historico, setHistorico] = useState<HistoricoTransacao[]>(mockHistorico);

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
        data: new Date(),
        pote_afetado: 'ajudar'
      }, ...prev]);
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
  const criarTarefa = (novaTarefa: Omit<Tarefa, 'id' | 'criado_em'>) => {
    const tarefa: Tarefa = {
      ...novaTarefa,
      id: `tarefa-${Date.now()}`,
      criado_em: new Date()
    };
    setTarefas(prev => [tarefa, ...prev]);
  };

  // Aprovar tarefa (ação do pai)
  const aprovarTarefa = (tarefaId: string) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (tarefa) {
      setTarefas(prev => prev.map(t => 
        t.id === tarefaId 
          ? { ...t, status: 'concluida', aprovado_em: new Date() }
          : t
      ));
      
      // Adicionar recompensa
      atualizarSaldo('gastar', tarefa.recompensa);
      
      // Adicionar ao histórico
      setHistorico(prev => [{
        id: `hist-${Date.now()}`,
        tipo: 'tarefa',
        descricao: tarefa.titulo,
        valor: tarefa.recompensa,
        data: new Date(),
        pote_afetado: 'gastar'
      }, ...prev]);
    }
  };

  // Rejeitar tarefa (ação do pai)
  const rejeitarTarefa = (tarefaId: string) => {
    setTarefas(prev => prev.map(t => 
      t.id === tarefaId 
        ? { ...t, status: 'rejeitada', foto_url: undefined }
        : t
    ));
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
      criarCampanha
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