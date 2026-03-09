import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../../context/AppContext';
import { NovaTarefaModal } from '../../../components/NovaTarefaModal';
import type { StatusTarefa } from '../../../types';

export default function ParentTasksScreen() {
  const insets = useSafeAreaInsets();
  const { tarefas, crianca, criarTarefa } = useApp();
  const [novaTarefaModal, setNovaTarefaModal] = useState(false);
  const [formTarefa, setFormTarefa] = useState({
    titulo: '',
    descricao: '',
    recompensa: '',
    icone: 'bed',
    categoria: 'casa',
  });
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente': return { label: 'Pendente', color: '#F59E0B', icon: 'time-outline' as const };
      case 'aguardando_aprovacao': return { label: 'Enviada', color: '#3B82F6', icon: 'cloud-upload-outline' as const };
      case 'concluida': return { label: 'Aprovada', color: '#22C55E', icon: 'checkmark-circle-outline' as const };
      case 'rejeitada': return { label: 'Rejeitada', color: '#EF4444', icon: 'close-circle-outline' as const };
      default: return { label: status, color: '#999', icon: 'help-circle-outline' as const };
    }
  };

  const sortedTasks = [...tarefas].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

  const handleCriarTarefa = () => {
    if (!formTarefa.titulo || !formTarefa.descricao || !formTarefa.recompensa) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    criarTarefa({
      titulo: formTarefa.titulo,
      descricao: formTarefa.descricao,
      recompensa: parseFloat(formTarefa.recompensa),
      status: 'pendente' as StatusTarefa,
      crianca_id: crianca.id,
      icone: formTarefa.icone,
      categoria: formTarefa.categoria,
    });

    Alert.alert('Sucesso ✅', 'Tarefa criada com sucesso!');
    setFormTarefa({ titulo: '', descricao: '', recompensa: '', icone: 'bed', categoria: 'casa' });
    setNovaTarefaModal(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Todas as Tarefas</Text>
        <Pressable onPress={() => setNovaTarefaModal(true)}>
          <Ionicons name="add-circle" size={28} color="#fb923c" />
        </Pressable>
      </View>
      

      <FlatList
        data={sortedTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
        scrollEnabled={sortedTasks.length > 0}
        ListHeaderComponent={
          <LinearGradient 
            colors={['#3b82f6', '#7c3aed']} 
            style={[styles.actionCard, { marginBottom: 16 }]} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.actionCardTitle}>Criar Nova Tarefa</Text>
              <Text style={styles.actionCardSubtitle}>Atribua tarefas e recompense {crianca.nome}</Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setNovaTarefaModal(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={18} color="#2563eb" />
                <Text style={[styles.actionBtnText, { color: '#2563eb' }]}>Criar Tarefa</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 52 }}>✅</Text>
          </LinearGradient>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Sem tarefas</Text>
            <Text style={styles.emptyText}>Crie sua primeira tarefa</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusInfo = getStatusInfo(item.status);
          return (
            <View style={styles.taskCard}>
              <View style={styles.taskLeft}>
                <Text style={styles.taskTitle}>{item.titulo}</Text>
                <Text style={styles.taskChild}>{crianca.nome}</Text>
              </View>
              <View style={styles.taskRight}>
                <Text style={styles.taskReward}>{item.recompensa} Kz</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                  <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      <NovaTarefaModal
        visible={novaTarefaModal}
        onClose={() => setNovaTarefaModal(false)}
        onCriar={handleCriarTarefa}
        form={formTarefa}
        setForm={setFormTarefa}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  list: { paddingHorizontal: 20, gap: 10, paddingTop: 10 },
  taskCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  taskLeft: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  taskChild: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  taskRight: { alignItems: 'flex-end', gap: 6 },
  taskReward: { fontSize: 14, fontWeight: '800', color: '#fde047' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  emptyText: { fontSize: 14, color: '#94a3b8' },
  actionCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  actionBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
