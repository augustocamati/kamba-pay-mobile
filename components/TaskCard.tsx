import { useState } from 'react';
import { Bed, Book, Utensils, Check, Camera, Clock, CheckCircle, X, Pencil } from 'lucide-react';
import type { Tarefa } from '../types';
import { useApp } from '../context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';

interface TaskCardProps {
  tarefa: Tarefa;
}

export function TaskCard({ tarefa }: TaskCardProps) {
  const { enviarFotoTarefa } = useApp();
  const [mostrandoDialog, setMostrandoDialog] = useState(false);
  const [simulandoUpload, setSimulandoUpload] = useState(false);

  // Mapear ícones
  const getIcon = () => {
    const iconMap: Record<string, any> = {
      'bed': Bed,
      'book': Book,
      'utensils': Utensils,
      'pencil': Pencil,
    };
    return iconMap[tarefa.icone] || Check;
  };

  const Icon = getIcon();

  // Cores baseadas no status
  const getStatusColors = () => {
    switch (tarefa.status) {
      case 'concluida':
        return {
          bg: 'bg-gradient-to-r from-green-100 to-green-50',
          border: 'border-2 border-green-400',
          iconBg: 'bg-green-200',
          iconColor: 'text-green-600',
          badge: 'bg-green-500',
          badgeText: 'Concluída'
        };
      case 'aguardando_aprovacao':
        return {
          bg: 'bg-gradient-to-r from-blue-100 to-blue-50',
          border: 'border-2 border-blue-400',
          iconBg: 'bg-blue-200',
          iconColor: 'text-blue-600',
          badge: 'bg-blue-500',
          badgeText: 'Aguardando'
        };
      case 'rejeitada':
        return {
          bg: 'bg-gradient-to-r from-red-100 to-red-50',
          border: 'border-2 border-red-400',
          iconBg: 'bg-red-200',
          iconColor: 'text-red-600',
          badge: 'bg-red-500',
          badgeText: 'Rejeitada'
        };
      default:
        return {
          bg: 'bg-white',
          border: '',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          badge: 'bg-orange-500',
          badgeText: 'Pendente'
        };
    }
  };

  const colors = getStatusColors();

  // Simular upload de foto
  const handleUploadFoto = () => {
    setSimulandoUpload(true);
    // Simular delay de upload
    setTimeout(() => {
      // Gerar URL de imagem mock do Unsplash baseada na categoria
      const fotoUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=400`;
      enviarFotoTarefa(tarefa.id, fotoUrl);
      setSimulandoUpload(false);
      setMostrandoDialog(false);
    }, 1500);
  };

  return (
    <div className={`rounded-2xl p-4 shadow-md transition-all ${colors.bg} ${colors.border}`}>
      <div className="flex items-start gap-4">
        {/* Ícone */}
        <div className={`rounded-xl p-3 ${colors.iconBg} flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.iconColor}`} />
        </div>
        
        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-gray-800 text-sm">{tarefa.titulo}</h4>
            {tarefa.status === 'concluida' && (
              <CheckCircle className="w-4 h-4 text-green-500 fill-green-500 flex-shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{tarefa.descricao}</p>
          
          {/* Badge de status */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`${colors.badge} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
              {colors.badgeText}
            </span>
            <span className="text-xs text-gray-500">
              Recompensa: <span className="font-bold text-yellow-600">{tarefa.recompensa} Kz</span>
            </span>
          </div>
          
          {/* Foto se já tiver sido enviada */}
          {tarefa.foto_url && (
            <div className="mb-3">
              <img 
                src={tarefa.foto_url} 
                alt="Prova da tarefa" 
                className="w-full h-24 object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Botão de ação */}
          {tarefa.status === 'pendente' && (
            <Dialog open={mostrandoDialog} onOpenChange={setMostrandoDialog}>
              <DialogTrigger asChild>
                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold py-2 px-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" />
                  Enviar Foto
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="kids-heading">Enviar Prova da Tarefa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Tire uma foto mostrando que você completou a tarefa: <strong>{tarefa.titulo}</strong>
                  </p>
                  
                  {/* Simulação de área de upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">
                      {simulandoUpload ? 'Enviando foto...' : 'Clique para tirar/escolher foto'}
                    </p>
                    <Button 
                      onClick={handleUploadFoto}
                      disabled={simulandoUpload}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {simulandoUpload ? 'Enviando...' : 'Selecionar Foto'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {tarefa.status === 'aguardando_aprovacao' && (
            <div className="flex items-center gap-2 text-blue-600 text-xs">
              <Clock className="w-4 h-4" />
              <span>Aguardando aprovação dos pais...</span>
            </div>
          )}
          
          {tarefa.status === 'rejeitada' && (
            <div className="flex items-center gap-2 text-red-600 text-xs">
              <X className="w-4 h-4" />
              <span>Tarefa rejeitada. Tente novamente!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
