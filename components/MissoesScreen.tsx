import { useApp } from '../context/AppContext';
import { ArrowLeft, TrendingUp, ShoppingBag, Heart } from 'lucide-react';
import { useState } from 'react';

interface MissoesScreenProps {
  onVoltar: () => void;
}

export function MissoesScreen({ onVoltar }: MissoesScreenProps) {
  const { missoes, crianca } = useApp();
  const [filtroAtivo, setFiltroAtivo] = useState<'todas' | 'poupanca' | 'consumo' | 'solidariedade'>('todas');

  const missoesFiltradas = filtroAtivo === 'todas' 
    ? missoes 
    : missoes.filter(m => m.tipo === filtroAtivo);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'poupanca':
        return <TrendingUp className="w-5 h-5" />;
      case 'consumo':
        return <ShoppingBag className="w-5 h-5" />;
      case 'solidariedade':
        return <Heart className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getTipoCor = (tipo: string) => {
    switch (tipo) {
      case 'poupanca':
        return {
          bg: 'from-green-500 to-emerald-600',
          badge: 'bg-green-500',
          text: 'text-green-600'
        };
      case 'consumo':
        return {
          bg: 'from-blue-500 to-cyan-600',
          badge: 'bg-blue-500',
          text: 'text-blue-600'
        };
      case 'solidariedade':
        return {
          bg: 'from-red-500 to-pink-600',
          badge: 'bg-red-500',
          text: 'text-red-600'
        };
      default:
        return {
          bg: 'from-purple-500 to-pink-600',
          badge: 'bg-purple-500',
          text: 'text-purple-600'
        };
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
        <button 
          onClick={onVoltar}
          className="mb-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        
        <h1 className="text-3xl font-bold mb-2 kids-heading">Minhas Missões 🎯</h1>
        <p className="text-orange-100 text-sm">Complete suas missões e ganhe recompensas incríveis!</p>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFiltroAtivo('todas')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filtroAtivo === 'todas' 
                ? 'bg-orange-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltroAtivo('poupanca')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              filtroAtivo === 'poupanca' 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Poupança
          </button>
          <button
            onClick={() => setFiltroAtivo('consumo')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              filtroAtivo === 'consumo' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Consumo
          </button>
          <button
            onClick={() => setFiltroAtivo('solidariedade')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              filtroAtivo === 'solidariedade' 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            Solidariedade
          </button>
        </div>

        {/* Lista de Missões */}
        <div className="space-y-4">
          {missoesFiltradas.map(missao => {
            const progresso = Math.round((missao.progresso_atual / missao.objetivo_valor) * 100);
            const faltam = missao.objetivo_valor - missao.progresso_atual;
            const cores = getTipoCor(missao.tipo);
            const completa = progresso >= 100;

            return (
              <div 
                key={missao.id}
                className={`bg-gradient-to-br ${cores.bg} rounded-3xl p-6 shadow-xl relative overflow-hidden ${
                  completa ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                {/* Badge de tipo */}
                <div className={`absolute top-4 right-4 ${cores.badge} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                  {getTipoIcon(missao.tipo)}
                  <span className="capitalize">{missao.tipo}</span>
                </div>

                {/* Conteúdo */}
                <div className="mb-4">
                  <div className="text-4xl mb-3">{missao.icone}</div>
                  <h3 className="text-white text-xl font-bold mb-2 kids-heading">{missao.titulo}</h3>
                  <p className="text-white/90 text-sm mb-3">{missao.descricao}</p>
                </div>

                {/* Progresso */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/90 text-sm font-medium">
                      {missao.progresso_atual.toLocaleString()} / {missao.objetivo_valor.toLocaleString()} Kz
                    </span>
                    <span className="text-white text-sm font-bold">{progresso}%</span>
                  </div>
                  
                  <div className="bg-white/20 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progresso, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Status */}
                {completa ? (
                  <div className="bg-yellow-400 text-yellow-900 rounded-xl p-3 text-center font-bold">
                    🎉 Missão Completa! Recompensa: {missao.recompensa} Kz
                  </div>
                ) : (
                  <div className="text-white/80 text-sm">
                    {faltam > 0 ? `Faltam ${faltam.toLocaleString()} Kz para completar` : 'Quase lá!'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {missoesFiltradas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">Nenhuma missão encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
