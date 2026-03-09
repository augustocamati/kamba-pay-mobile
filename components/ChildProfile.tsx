import { Award, TrendingUp, Target, Trophy, Star, Calendar } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  date?: string;
}

export function ChildProfile() {
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Primeira Poupança',
      description: 'Guardou dinheiro pela primeira vez',
      emoji: '🏦',
      unlocked: true,
      date: '15 Jan 2026',
    },
    {
      id: '2',
      name: 'Ajudante Solidário',
      description: 'Doou para uma causa social',
      emoji: '❤️',
      unlocked: true,
      date: '10 Jan 2026',
    },
    {
      id: '3',
      name: 'Missão Completa',
      description: 'Completou 10 tarefas',
      emoji: '⭐',
      unlocked: true,
      date: '8 Jan 2026',
    },
    {
      id: '4',
      name: 'Estudante Kamba',
      description: 'Assistiu 5 vídeos educativos',
      emoji: '📚',
      unlocked: false,
    },
    {
      id: '5',
      name: 'Poupador Expert',
      description: 'Poupou 10.000 Kz',
      emoji: '💎',
      unlocked: false,
    },
    {
      id: '6',
      name: 'Mestre das Finanças',
      description: 'Completou todas as lições',
      emoji: '🏆',
      unlocked: false,
    },
  ];

  const stats = [
    { label: 'Nível', value: '5', icon: Star, color: 'from-yellow-400 to-orange-500' },
    { label: 'Tarefas Completas', value: '23', icon: Target, color: 'from-green-400 to-green-500' },
    { label: 'Dias Consecutivos', value: '7', icon: Calendar, color: 'from-blue-400 to-blue-500' },
    { label: 'Total Poupado', value: '4.3K', icon: TrendingUp, color: 'from-purple-400 to-purple-500' },
  ];

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 kids-font">
      <div className="relative max-w-md mx-auto px-6 py-8">
        {/* Header com Avatar Grande */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-1 mb-4 shadow-xl">
            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="relative inline-block mb-4">
                <div className="text-7xl">👧🏾</div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                  <Star className="w-5 h-5 fill-yellow-600 text-yellow-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1 kids-heading">Kiala Mendes</h1>
              <p className="text-sm text-gray-500 mb-3">9 anos • Luanda, Angola 🇦🇴</p>
              
              {/* Barra de XP */}
              <div className="bg-gray-100 rounded-full h-3 overflow-hidden mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: '65%' }} />
              </div>
              <p className="text-xs text-gray-600">650 / 1000 XP para Nível 6</p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 kids-heading">Minhas Estatísticas 📊</h3>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-4 shadow-md"
                >
                  <div className={`bg-gradient-to-br ${stat.color} rounded-xl p-2 w-fit mb-3`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-800 mb-1 kids-money">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conquistas */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 kids-heading">Conquistas 🏆</h3>
            <span className="text-sm text-gray-500">3 de 6</span>
          </div>

          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`rounded-2xl p-4 transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-md'
                    : 'bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`text-4xl ${
                      achievement.unlocked ? '' : 'grayscale opacity-40'
                    }`}
                  >
                    {achievement.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`font-bold ${
                          achievement.unlocked ? 'text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        {achievement.name}
                      </h4>
                      {achievement.unlocked && (
                        <Award className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    <p
                      className={`text-xs ${
                        achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {achievement.description}
                    </p>
                    {achievement.unlocked && achievement.date && (
                      <p className="text-xs text-yellow-700 font-medium mt-1">
                        Desbloqueada em {achievement.date}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 shadow-xl">
          <div className="text-center mb-4">
            <span className="text-5xl mb-2 block">🏅</span>
            <h3 className="text-xl font-bold text-white mb-1 kids-heading">Ranking Kamba Kids</h3>
            <p className="text-purple-100 text-sm">Entre crianças da sua idade</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm">Sua posição</span>
              <div className="bg-white rounded-full px-4 py-2">
                <span className="text-3xl font-bold text-purple-600 kids-money">#12</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">De 500 crianças em Luanda</span>
              <Trophy className="w-5 h-5 text-yellow-300" />
            </div>
          </div>

          <div className="mt-4 text-center">
            <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 hover:scale-105 transition-all">
              Ver Ranking Completo
            </button>
          </div>
        </div>

        {/* Personalização */}
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-md">
          <h4 className="font-bold text-gray-800 mb-4">Configurações</h4>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all">
              <span className="text-sm font-medium text-gray-700">✏️ Editar Perfil</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all">
              <span className="text-sm font-medium text-gray-700">🔔 Notificações</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all">
              <span className="text-sm font-medium text-gray-700">🎨 Tema do App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}