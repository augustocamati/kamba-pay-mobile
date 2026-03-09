import { Coins, Target, Heart } from 'lucide-react';
import type { Potes } from '../types';

interface PotesFinanceirosProps {
  potes: Potes;
  onPoteClick?: (tipo: 'gastar' | 'poupar' | 'ajudar') => void;
}

export function PotesFinanceiros({ potes, onPoteClick }: PotesFinanceirosProps) {
  const calcularPercentagem = (valor: number) => {
    return potes.total > 0 ? Math.round((valor / potes.total) * 100) : 0;
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4 kids-heading">Meus Potes 🏺</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Pote Gastar - Ocupa 2 colunas */}
        <div 
          onClick={() => onPoteClick?.('gastar')}
          className="col-span-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white/30 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-xs font-bold text-white">{calcularPercentagem(potes.saldo_gastar)}%</span>
            </div>
          </div>
          <h4 className="text-white/90 text-sm font-medium mb-2 kids-heading">Pote Gastar</h4>
          <p className="text-3xl font-bold text-white mb-1 kids-money">{potes.saldo_gastar.toLocaleString()} Kz</p>
          <p className="text-orange-100 text-xs">Para uso imediato</p>
        </div>

        {/* Pote Poupar */}
        <div 
          onClick={() => onPoteClick?.('poupar')}
          className="bg-gradient-to-br from-green-400 to-green-500 rounded-3xl p-5 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2.5 w-fit mb-3">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h4 className="text-white/90 text-sm font-medium mb-2 kids-heading">Pote Poupar</h4>
          <p className="text-2xl font-bold text-white mb-1 kids-money">{potes.saldo_poupar.toLocaleString()} Kz</p>
          <p className="text-green-100 text-xs">Metas futuras</p>
        </div>

        {/* Pote Ajudar */}
        <div 
          onClick={() => onPoteClick?.('ajudar')}
          className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl p-5 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2.5 w-fit mb-3">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h4 className="text-white/90 text-sm font-medium mb-2 kids-heading">Pote Ajudar</h4>
          <p className="text-2xl font-bold text-white mb-1 kids-money">{potes.saldo_ajudar.toLocaleString()} Kz</p>
          <p className="text-yellow-100 text-xs">Solidariedade</p>
        </div>
      </div>
    </div>
  );
}
