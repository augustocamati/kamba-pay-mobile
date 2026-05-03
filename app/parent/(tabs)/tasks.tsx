import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Alert, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../../context/AppContext';
import { NovaTarefaModal } from '../../../components/NovaTarefaModal';
import type { StatusTarefa } from '../../../types';

export default function ParentTasksScreen() {
  const insets = useSafeAreaInsets();
  const { tarefas, criarTarefa, dependentes, aprovarTarefa, rejeitarTarefa } = useApp();
  const [novaTarefaModal, setNovaTarefaModal] = useState(false);
  const [formTarefa, setFormTarefa] = useState({
    titulo: '',
    descricao: '',
    recompensa: '',
    icone: 'bed',
    categoria: 'casa',
    crianca_id: '',
    prazo_dias: '1',
  });
  const [rejeicaoModal, setRejeicaoModal] = useState<{ visible: boolean; taskId: string; motivo: string }>({
    visible: false,
    taskId: '',
    motivo: ''
  });

  useEffect(() => {
    if (dependentes.length > 0 && !formTarefa.crianca_id) {
      setFormTarefa(prev => ({ ...prev, crianca_id: dependentes[0].id }));
    }
  }, [dependentes]);
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente': return { label: 'Pendente', color: '#F59E0B', icon: 'time-outline' as const };
      case 'aguardando_aprovacao': return { label: 'Enviada', color: '#3B82F6', icon: 'cloud-upload-outline' as const };
      case 'aprovada': return { label: 'Aprovada', color: '#22C55E', icon: 'checkmark-circle-outline' as const };
      case 'rejeitada': return { label: 'Rejeitada', color: '#EF4444', icon: 'close-circle-outline' as const };
      default: return { label: status, color: '#999', icon: 'help-circle-outline' as const };
    }
  };

  const sortedTasks = [...tarefas].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
  const pendentesAprovacao = sortedTasks.filter((t) => t.status === 'aguardando_aprovacao');

  const handleCriarTarefa = async () => {
    if (!formTarefa.titulo || !formTarefa.descricao || !formTarefa.recompensa || !formTarefa.crianca_id) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    await criarTarefa({
      titulo: formTarefa.titulo,
      descricao: formTarefa.descricao,
      recompensa: parseFloat(formTarefa.recompensa),
      status: 'pendente' as StatusTarefa,
      crianca_id: formTarefa.crianca_id,
      icone: formTarefa.icone,
      categoria: formTarefa.categoria,
      data_limite: formTarefa.prazo_dias ? new Date(Date.now() + parseInt(formTarefa.prazo_dias) * 24 * 60 * 60 * 1000) : undefined,
    } as any);

    Alert.alert('Sucesso ✅', 'Tarefa criada com sucesso!');
    setFormTarefa({ 
      titulo: '', 
      descricao: '', 
      recompensa: '', 
      icone: 'bed', 
      categoria: 'casa',
      crianca_id: dependentes[0]?.id || '',
      prazo_dias: '1'
    });
    setNovaTarefaModal(false);
  };

  const handleAprovar = async (tarefaId: string) => {
    try {
      await aprovarTarefa(tarefaId);
      Alert.alert('Sucesso', 'Tarefa aprovada com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível aprovar a tarefa.');
    }
  };

  const handleRejeitar = async () => {
    if (!rejeicaoModal.motivo) {
        Alert.alert('Aviso', 'Explique o motivo da rejeição para a criança entender.');
        return;
    }
    try {
      await rejeitarTarefa(rejeicaoModal.taskId, rejeicaoModal.motivo);
      Alert.alert('Atualizado', 'Tarefa rejeitada. A criança recebeu o motivo.');
      setRejeicaoModal({ visible: false, taskId: '', motivo: '' });
    } catch {
      Alert.alert('Erro', 'Não foi possível rejeitar a tarefa.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Gestão de Tarefas</Text>
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
          <>
            <LinearGradient 
              colors={['#3b82f6', '#7c3aed']} 
              style={[styles.actionCard, { marginBottom: 16 }]} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.actionCardTitle}>Criar Nova Tarefa</Text>
                <Text style={styles.actionCardSubtitle}>Defina o que precisa ser feito</Text>
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

            {pendentesAprovacao.length > 0 && (
              <View style={styles.approvalSection}>
                <Text style={styles.approvalTitle}>Aguardando sua aprovação</Text>
                {pendentesAprovacao.map((item) => {
                  const criancaAtribuida = dependentes.find(d => d.id === item.crianca_id);
                  return (
                    <TouchableOpacity 
                      key={`approval-${item.id}`} 
                      style={styles.approvalCard}
                      onPress={() => router.push(`/parent/task-details/${item.id}`)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.taskTitle}>{item.titulo}</Text>
                        <Text style={styles.taskChild}>{criancaAtribuida?.nome || 'Filho'}</Text>
                      </View>
                      <View style={styles.approvalActions}>
                        <Pressable style={styles.rejectBtn} onPress={() => setRejeicaoModal({ visible: true, taskId: item.id, motivo: '' })}>
                          <Text style={styles.rejectBtnText}>Rejeitar</Text>
                        </Pressable>
                        <Pressable style={styles.approveBtn} onPress={() => handleAprovar(item.id)}>
                          <Text style={styles.approveBtnText}>Aprovar</Text>
                        </Pressable>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
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
          const criancaAtribuida = dependentes.find(d => d.id === item.crianca_id);
          return (
            <TouchableOpacity 
              style={styles.taskCard}
              onPress={() => router.push(`/parent/task-details/${item.id}`)}
            >
              <View style={styles.taskLeft}>
                <Text style={styles.taskTitle}>{item.titulo}</Text>
                <Text style={styles.taskChild}>{criancaAtribuida?.nome || 'Filho'}</Text>
              </View>
              <View style={styles.taskRight}>
                <Text style={styles.taskReward}>{item.recompensa} Kz</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                  <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <NovaTarefaModal
        visible={novaTarefaModal}
        onClose={() => setNovaTarefaModal(false)}
        onCriar={handleCriarTarefa}
        form={formTarefa}
        setForm={setFormTarefa}
        dependentes={dependentes}
      />

      {/* Rejection Reason Modal */}
      <Modal visible={rejeicaoModal.visible} transparent animationType="fade">
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: '#1e293b', padding: 24, borderRadius: 24, width: '90%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="alert-circle" size={24} color="#ef4444" />
                </View>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Motivo da Rejeição</Text>
              </View>
              <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20, lineHeight: 20 }}>
                Explique de forma clara o que a criança precisa melhorar para que a tarefa seja aprovada.
              </Text>
              
              <TextInput
                style={styles.rejectionInput}
                placeholder="Ex: A foto está tremida, tire outra por favor."
                placeholderTextColor="#64748b"
                value={rejeicaoModal.motivo}
                onChangeText={(t) => setRejeicaoModal(prev => ({ ...prev, motivo: t }))}
                multiline
              />
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <TouchableOpacity 
                  onPress={() => setRejeicaoModal({ visible: false, taskId: '', motivo: '' })}
                  style={[styles.modalBtn, { backgroundColor: 'rgba(255,255,255,0.05)', flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}
                >
                  <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleRejeitar}
                  style={[styles.modalBtn, { backgroundColor: '#ef4444', flex: 1, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}
                >
                  <Text style={{ color: '#fff', fontWeight: '800' }}>Enviar Rejeição</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        ) : (
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
             <View style={[styles.modalContent, { backgroundColor: '#1e293b', padding: 24, borderRadius: 24, width: '90%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="alert-circle" size={24} color="#ef4444" />
                </View>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Motivo da Rejeição</Text>
              </View>
              <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20, lineHeight: 20 }}>
                Explique de forma clara o que a criança precisa melhorar para que a tarefa seja aprovada.
              </Text>
              
              <TextInput
                style={styles.rejectionInput}
                placeholder="Ex: A foto está tremida, tire outra por favor."
                placeholderTextColor="#64748b"
                value={rejeicaoModal.motivo}
                onChangeText={(t) => setRejeicaoModal(prev => ({ ...prev, motivo: t }))}
                multiline
              />
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <TouchableOpacity 
                  onPress={() => setRejeicaoModal({ visible: false, taskId: '', motivo: '' })}
                  style={[styles.modalBtn, { backgroundColor: 'rgba(255,255,255,0.05)', flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}
                >
                  <Text style={{ color: '#e2e8f0', fontWeight: '700' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleRejeitar}
                  style={[styles.modalBtn, { backgroundColor: '#ef4444', flex: 1, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}
                >
                  <Text style={{ color: '#fff', fontWeight: '800' }}>Enviar Rejeição</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
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
  approvalSection: { marginBottom: 16, gap: 10 },
  approvalTitle: { color: '#BFDBFE', fontSize: 14, fontWeight: '700' },
  approvalCard: {
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  approvalActions: { flexDirection: 'row', gap: 8 },
  rejectBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  rejectBtnText: { color: '#FCA5A5', fontSize: 12, fontWeight: '700' },
  approveBtn: {
    backgroundColor: 'rgba(34,197,94,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.35)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  approveBtnText: { color: '#86EFAC', fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  rejectionInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#fff',
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  modalBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
