import { Coins, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarDisplay } from './AvatarDisplay';
import { PotesFinanceiros } from './PotesFinanceiros';

interface ChildHomeProps {
  onNavigateToProfile?: () => void;
}

export function ChildHome({ onNavigateToProfile }: ChildHomeProps) {
  const { crianca, missoes, tarefas } = useApp();
  
  // Filtrar tarefas ativas (pendentes ou aguardando aprovação)
  const tarefasAtivas = tarefas.filter(t => t.status === 'pendente' || t.status === 'aguardando_aprovacao').slice(0, 3);
  const tarefasConcluidas = tarefasAtivas.filter(t => t.status === 'aguardando_aprovacao').length;

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 kids-font">
      {/* Padrão Samakaka discreto */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,0.1) 35px, rgba(0,0,0,0.1) 70px)`
        }}
      />

      <div className="relative max-w-md mx-auto px-6 py-8">
        {/* Header com Avatar */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-6">
            <button 
              onClick={onNavigateToProfile}
              className="shrink-0 hover:scale-105 transition-transform"
            >
              <AvatarDisplay 
                avatar={crianca.avatar}
                nivel={crianca.nivel}
                nome={crianca.nome}
                size="medium"
              />
            </button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-1 kids-heading">Olá, {crianca.nome}! 👋</h1>
              <p className="text-sm text-gray-500">Bem-vinda ao Kamba Kid Pay</p>
            </div>
          </div>

          {/* Saldo Total */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-300" />
              <p className="text-orange-100 text-sm font-medium kids-heading">Saldo Total</p>
            </div>
            <h2 className="text-5xl font-bold text-white mb-1 kids-money">
              {crianca.potes.total.toLocaleString()} Kz
            </h2>
            <p className="text-orange-200 text-sm">Continue economizando! 🎯</p>
          </div>
        </div>

        {/* Potes de Gestão Financeira - Bento Grid */}
        <div className="mb-8">
          <PotesFinanceiros potes={crianca.potes} />
        </div>

        {/* Missões do Dia (Tarefas) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 kids-heading">Tarefas do Dia ⭐</h3>
            <span className="text-sm text-gray-500">{tarefasConcluidas}/{tarefasAtivas.length} aguardando</span>
          </div>

          <div className="space-y-3">
            {tarefasAtivas.length > 0 ? (
              tarefasAtivas.map((tarefa) => (
                <a
                  key={tarefa.id}
                  href="#tarefas"
                  className={`block w-full rounded-2xl p-4 shadow-md hover:scale-105 transition-all ${
                    tarefa.status === 'aguardando_aprovacao'
                      ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-400'
                      : 'bg-white hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-3 ${
                      tarefa.status === 'aguardando_aprovacao' ? 'bg-blue-200' : 'bg-orange-100'
                    }`}>
                      <span className="text-2xl">{tarefa.icone === 'bed' ? '🛏️' : tarefa.icone === 'book' ? '📚' : tarefa.icone === 'utensils' ? '🍳' : tarefa.icone === 'pencil' ? '✏️' : '✅'}</span>
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-gray-800 mb-1">{tarefa.titulo}</h4>
                      <p className="text-xs text-gray-500 mb-2">{tarefa.descricao}</p>
                      <p className="text-xs text-gray-500">
                        Recompensa: <span className="font-bold text-yellow-600">{tarefa.recompensa} Kz</span>
                      </p>
                      {tarefa.status === 'aguardando_aprovacao' && (
                        <p className="text-xs text-blue-600 font-medium mt-1">⏳ Aguardando aprovação</p>
                      )}
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-2xl mb-2">🎉</p>
                <p>Nenhuma tarefa pendente!</p>
              </div>
            )}
          </div>
        </div>

        {/* Meta de Poupança - Primeira Missão Ativa */}
        {missoes.filter(m => m.ativa && m.tipo === 'poupanca')[0] && (
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <span className="text-2xl">{missoes.filter(m => m.ativa && m.tipo === 'poupanca')[0].icone}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold mb-1 kids-heading">{missoes.filter(m => m.ativa && m.tipo === 'poupanca')[0].titulo}</h4>
                <p className="text-purple-100 text-sm mb-3">
                  Faltam {(missoes.filter(m => m.ativa && m.tipo === 'poupanca')[0].objetivo_valor - missoes.filter(m => m.ativa && m.tipo === 'poupanca')[0].progresso_atual).toLocaleString()} Kz
                </p>
                <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-white h-full rounded-full transition-all" 
                    style={{ width: `${Math.round((missoes.filter(m => m.ativa && m.tipo === 'poupanca')[0].progresso_atual / missoes.filter(m => m.ativa && m.tipo === 'poupanca')[0].objetivo_valor) * 100)}%` }} 
                  />
                </div>
                <p className="text-white/80 text-xs mt-2">
                  {Math.round((missoes.filter(m => m.ativa && m.tipo === 'poupanca')[0].progresso_atual / missoes.filter(m => m.ativa && m.tipo === 'poupanca')[0].objetivo_valor) * 100)}% completo
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}