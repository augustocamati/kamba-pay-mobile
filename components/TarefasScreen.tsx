import { useState } from 'react';
import { Camera, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

export function TarefasScreen() {
  const { tarefas, enviarFotoTarefa } = useApp();
  const [selectedTarefa, setSelectedTarefa] = useState<string | null>(null);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pendente':
        return {
          color: 'orange',
          bgClass: 'bg-orange-50 border-orange-200',
          iconBgClass: 'bg-orange-100',
          textClass: 'text-orange-600',
          icon: <Clock className="w-5 h-5" />,
          label: 'Pendente'
        };
      case 'aguardando_aprovacao':
        return {
          color: 'blue',
          bgClass: 'bg-blue-50 border-blue-200',
          iconBgClass: 'bg-blue-100',
          textClass: 'text-blue-600',
          icon: <Clock className="w-5 h-5" />,
          label: 'Aguardando Aprovação'
        };
      case 'concluida':
        return {
          color: 'green',
          bgClass: 'bg-green-50 border-green-200',
          iconBgClass: 'bg-green-100',
          textClass: 'text-green-600',
          icon: <CheckCircle className="w-5 h-5" />,
          label: 'Concluída'
        };
      case 'rejeitada':
        return {
          color: 'red',
          bgClass: 'bg-red-50 border-red-200',
          iconBgClass: 'bg-red-100',
          textClass: 'text-red-600',
          icon: <XCircle className="w-5 h-5" />,
          label: 'Rejeitada'
        };
      default:
        return {
          color: 'gray',
          bgClass: 'bg-gray-50 border-gray-200',
          iconBgClass: 'bg-gray-100',
          textClass: 'text-gray-600',
          icon: <Clock className="w-5 h-5" />,
          label: 'Desconhecido'
        };
    }
  };

  const getIconeEmoji = (icone: string) => {
    const iconeMap: Record<string, string> = {
      bed: '🛏️',
      book: '📚',
      utensils: '🍳',
      pencil: '✏️',
      broom: '🧹',
      shirt: '👕',
      trash: '🗑️',
      plant: '🌱'
    };
    return iconeMap[icone] || '✅';
  };

  const handleEnviarFoto = (tarefaId: string) => {
    // Simulando upload de foto
    const fotoSimulada = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400';
    enviarFotoTarefa(tarefaId, fotoSimulada);
    toast.success('Foto enviada com sucesso! ✅', {
      description: 'Aguarde a aprovação dos seus pais.'
    });
    setSelectedTarefa(null);
  };

  // Agrupar tarefas por status
  const tarefasPendentes = tarefas.filter(t => t.status === 'pendente');
  const tarefasAguardando = tarefas.filter(t => t.status === 'aguardando_aprovacao');
  const tarefasConcluidas = tarefas.filter(t => t.status === 'concluida');
  const tarefasRejeitadas = tarefas.filter(t => t.status === 'rejeitada');

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 kids-heading">Minhas Tarefas 📋</h1>
          <p className="text-gray-600">Complete e ganhe recompensas!</p>
        </div>

        {/* Tarefas Pendentes */}
        {tarefasPendentes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 kids-heading">Para Fazer 🎯</h2>
            <div className="space-y-4">
              {tarefasPendentes.map((tarefa) => {
                const statusConfig = getStatusConfig(tarefa.status);
                return (
                  <div
                    key={tarefa.id}
                    className={`rounded-3xl p-5 border-2 shadow-lg hover:scale-105 transition-all ${statusConfig.bgClass}`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`rounded-2xl p-3 ${statusConfig.iconBgClass}`}>
                        <span className="text-3xl">{getIconeEmoji(tarefa.icone)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">{tarefa.titulo}</h3>
                        <p className="text-sm text-gray-600 mb-2">{tarefa.descricao}</p>
                        <div className="flex items-center gap-2">
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                            💰 {tarefa.recompensa} Kz
                          </span>
                          <span className={`${statusConfig.textClass} text-xs font-medium px-3 py-1 rounded-full bg-white/50`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botão de Enviar Foto */}
                    {tarefa.status === 'pendente' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl py-6"
                            onClick={() => setSelectedTarefa(tarefa.id)}
                          >
                            <Camera className="w-5 h-5 mr-2" />
                            Enviar Foto da Tarefa
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl">
                          <DialogHeader>
                            <DialogTitle className="kids-heading text-2xl">Enviar Prova da Tarefa</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-gray-600">
                              Tire uma foto mostrando que você completou: <strong>{tarefa.titulo}</strong>
                            </p>
                            <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-2xl p-8 text-center">
                              <Camera className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                              <p className="text-sm text-gray-600 mb-4">Clique para tirar uma foto</p>
                              <Button 
                                onClick={() => handleEnviarFoto(tarefa.id)}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                              >
                                Simular Envio de Foto
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tarefas Aguardando Aprovação */}
        {tarefasAguardando.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 kids-heading">Aguardando Aprovação ⏳</h2>
            <div className="space-y-4">
              {tarefasAguardando.map((tarefa) => {
                const statusConfig = getStatusConfig(tarefa.status);
                return (
                  <div
                    key={tarefa.id}
                    className={`rounded-3xl p-5 border-2 shadow-lg ${statusConfig.bgClass}`}
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`rounded-2xl p-3 ${statusConfig.iconBgClass}`}>
                        <span className="text-3xl">{getIconeEmoji(tarefa.icone)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">{tarefa.titulo}</h3>
                        <p className="text-sm text-gray-600 mb-2">{tarefa.descricao}</p>
                        <div className="flex items-center gap-2">
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                            💰 {tarefa.recompensa} Kz
                          </span>
                          <span className={`${statusConfig.textClass} text-xs font-medium px-3 py-1 rounded-full bg-white/50`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    {tarefa.foto_url && (
                      <div className="mt-3 rounded-2xl overflow-hidden border-2 border-blue-200">
                        <img src={tarefa.foto_url} alt="Prova da tarefa" className="w-full h-32 object-cover" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tarefas Concluídas */}
        {tarefasConcluidas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 kids-heading">Concluídas 🎉</h2>
            <div className="space-y-4">
              {tarefasConcluidas.map((tarefa) => {
                const statusConfig = getStatusConfig(tarefa.status);
                return (
                  <div
                    key={tarefa.id}
                    className={`rounded-3xl p-5 border-2 shadow-lg ${statusConfig.bgClass}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-2xl p-3 ${statusConfig.iconBgClass}`}>
                        <span className="text-3xl">{getIconeEmoji(tarefa.icone)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">{tarefa.titulo}</h3>
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                            ✅ +{tarefa.recompensa} Kz
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tarefas Rejeitadas */}
        {tarefasRejeitadas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 kids-heading">Tente Novamente 🔄</h2>
            <div className="space-y-4">
              {tarefasRejeitadas.map((tarefa) => {
                const statusConfig = getStatusConfig(tarefa.status);
                return (
                  <div
                    key={tarefa.id}
                    className={`rounded-3xl p-5 border-2 shadow-lg ${statusConfig.bgClass}`}
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`rounded-2xl p-3 ${statusConfig.iconBgClass}`}>
                        <span className="text-3xl">{getIconeEmoji(tarefa.icone)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">{tarefa.titulo}</h3>
                        <p className="text-sm text-red-600 mb-2">Tente fazer novamente com mais atenção!</p>
                        <div className="flex items-center gap-2">
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                            💰 {tarefa.recompensa} Kz
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mensagem quando não há tarefas */}
        {tarefas.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhuma tarefa ainda</h3>
            <p className="text-gray-500">Os seus pais irão adicionar tarefas em breve!</p>
          </div>
        )}
      </div>
    </div>
  );
}
