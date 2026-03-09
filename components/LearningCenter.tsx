import { useState } from 'react';
import { Play, Clock, TrendingUp, ShoppingBag, Coins, Heart, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { FaixaEtaria } from '../types';

interface LearningCenterProps {
  onNavigateToQuiz?: () => void;
}

export function LearningCenter({ onNavigateToQuiz }: LearningCenterProps) {
  const { conteudoEducativo, crianca, marcarConteudoCompleto } = useApp();
  const [filtroFaixa, setFiltroFaixa] = useState<FaixaEtaria | 'todas'>('todas');

  // Determinar faixa etária da criança
  const getFaixaEtaria = (idade: number): FaixaEtaria => {
    if (idade >= 6 && idade <= 8) return '6-8';
    if (idade >= 9 && idade <= 10) return '9-10';
    return '11-12';
  };

  const faixaCrianca = getFaixaEtaria(crianca.idade);

  // Filtrar conteúdo
  const conteudoFiltrado = filtroFaixa === 'todas' 
    ? conteudoEducativo
    : conteudoEducativo.filter(c => c.faixa_etaria === filtroFaixa);

  const conteudoCompleto = conteudoEducativo.filter(c => c.completo).length;
  const progressoPercentual = Math.round((conteudoCompleto / conteudoEducativo.length) * 100);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return '🎥';
      case 'animacao': return '🎬';
      case 'jogo': return '🎮';
      default: return '📚';
    }
  };

  const getTopicoColor = (topico: string) => {
    const colorMap: Record<string, string> = {
      moeda: 'from-orange-400 to-orange-500',
      poupanca: 'from-green-400 to-green-500',
      orcamento: 'from-blue-400 to-blue-500',
      jogo: 'from-yellow-400 to-yellow-500',
      investimento: 'from-purple-400 to-purple-500'
    };
    return colorMap[topico] || 'from-gray-400 to-gray-500';
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 kids-font">
      <div className="relative max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-3">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 kids-heading">Kamba Escola</h1>
              <p className="text-sm text-gray-500">Aprenda sobre dinheiro!</p>
            </div>
          </div>
        </div>

        {/* Progresso Geral */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 kids-heading">Seu Progresso</h3>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="bg-gray-100 rounded-full h-4 overflow-hidden mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all" 
              style={{ width: `${progressoPercentual}%` }} 
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{conteudoCompleto} de {conteudoEducativo.length} lições completas</span>
            <span className="font-bold text-purple-600">{progressoPercentual}%</span>
          </div>
        </div>

        {/* Personagem Mascote */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 mb-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🦁</div>
            <div className="flex-1">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
                <p className="text-sm font-medium text-gray-800">
                  "Olá, {crianca.nome}! Sou o Simba! Vou te ensinar tudo sobre dinheiro de forma divertida! 🌟"
                </p>
              </div>
              <div className="w-4 h-4 bg-white transform rotate-45 -mt-2 ml-4" />
            </div>
          </div>
        </div>

        {/* Filtros por Faixa Etária */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filtrar por idade:</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFiltroFaixa('todas')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filtroFaixa === 'todas' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroFaixa('6-8')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filtroFaixa === '6-8' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              6-8 anos
            </button>
            <button
              onClick={() => setFiltroFaixa('9-10')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filtroFaixa === '9-10' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              9-10 anos
            </button>
            <button
              onClick={() => setFiltroFaixa('11-12')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filtroFaixa === '11-12' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              11-12 anos
            </button>
          </div>
        </div>

        {/* Lista de Vídeos */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 kids-heading">Lições em Vídeo 🎬</h3>
          <div className="space-y-4">
            {conteudoFiltrado.map((conteudo) => {
              const colorClass = getTopicoColor(conteudo.topico);
              return (
                <button
                  key={conteudo.id}
                  onClick={() => !conteudo.completo && marcarConteudoCompleto(conteudo.id)}
                  className={`w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 transition-all ${
                    conteudo.completo ? 'ring-2 ring-green-400' : ''
                  }`}
                >
                  <div className={`bg-gradient-to-br ${colorClass} p-1`}>
                    <div className="bg-white rounded-2xl p-4">
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div className={`relative w-20 h-20 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shrink-0 shadow-md overflow-hidden`}>
                          {conteudo.thumbnail_url ? (
                            <img src={conteudo.thumbnail_url} alt={conteudo.titulo} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">{getTipoIcon(conteudo.tipo)}</span>
                          )}
                          {!conteudo.completo && (
                            <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                              <Play className="w-6 h-6 text-white fill-white" />
                            </div>
                          )}
                          {conteudo.completo && (
                            <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" fill="none" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 text-left">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-gray-800 leading-tight pr-2">
                              {conteudo.titulo}
                            </h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
                              {conteudo.faixa_etaria} anos
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 mb-2">{conteudo.descricao}</p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{conteudo.duracao}</span>
                            </div>
                            <span className="capitalize">{conteudo.tipo}</span>
                            {conteudo.completo && (
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                Completa ✓
                              </span>
                            )}
                          </div>

                          {/* Recompensa */}
                          {!conteudo.completo && (
                            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 inline-block">
                              <span className="text-xs font-bold text-yellow-700">
                                +50 Kz ao completar
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quiz Card */}
        {onNavigateToQuiz && (
          <div className="mt-6">
            <button
              onClick={onNavigateToQuiz}
              className="w-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              <div className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 p-1">
                <div className="bg-white rounded-3xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-4 shrink-0">
                      <span className="text-4xl">❓</span>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-xl font-bold text-gray-800 mb-1 kids-heading">
                        Quiz Kamba! 🎯
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Teste seus conhecimentos e ganhe Kwanzas!
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                          💰 Ganhe até 600 Kz
                        </span>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                          12 Perguntas
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Certificado */}
        <div className="mt-6 bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-dashed border-purple-300 rounded-3xl p-6 text-center">
          <span className="text-4xl mb-3 block">🏆</span>
          <h4 className="font-bold text-gray-800 mb-2">Complete Todas as Lições</h4>
          <p className="text-sm text-gray-600">
            E ganhe o certificado de <span className="font-bold text-purple-600">Expert em Finanças Kamba!</span>
          </p>
        </div>
      </div>
    </div>
  );
}