import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { API_HOST } from '@/lib/api';
import Colors from '@/constants/colors';
import { ModalMotivoRejeicao } from '@/components/ModalMotivoRejeicao';

export default function ParentTaskDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { tarefas, aprovarTarefa, rejeitarTarefa, dependentes } = useApp();
  const [modalRejeicao, setModalRejeicao] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const tarefaId = Array.isArray(id) ? id[0] : id;
  const tarea = tarefas.find(t => String(t.id) === String(tarefaId));
  const crianca = dependentes.find(d => String(d.id) === String(tarea?.crianca_id));

  if (!tarea) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tarefa não encontrada</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const handleAprovar = async () => {
    Alert.alert(
      'Aprovar Tarefa',
      'Tem certeza que deseja aprovar esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim, Aprovar', 
          onPress: async () => {
            await aprovarTarefa(tarea.id);
            router.back();
          } 
        }
      ]
    );
  };

  const handleRejeitar = async (motivo: string) => {
    await rejeitarTarefa(tarea.id, motivo);
    setModalRejeicao(false);
    router.back();
  };

  const statusMap = {
    pendente: { label: 'Pendente', color: '#94a3b8', icon: 'time-outline' },
    aguardando_aprovacao: { label: 'Aguardando Aprovação', color: '#3b82f6', icon: 'eye-outline' },
    aprovada: { label: 'Aprovada', color: '#22c55e', icon: 'checkmark-circle-outline' },
    rejeitada: { label: 'Rejeitada', color: '#ef4444', icon: 'close-circle-outline' },
  };

  const status = statusMap[tarea.status as keyof typeof statusMap] || statusMap.pendente;
  const fotoUrl = tarea.foto_url ? (tarea.foto_url.startsWith('http') ? tarea.foto_url : `${API_HOST}${tarea.foto_url}`) : null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Detalhes da Tarefa</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.childInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
            <Text style={styles.childName}>{crianca?.nome || 'Criança'}</Text>
          </View>

          <Text style={styles.title}>{tarea.titulo}</Text>
          <Text style={styles.description}>{tarea.descricao || 'Sem descrição'}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Recompensa</Text>
              <Text style={styles.statValue}>{tarea.recompensa} Kz</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                <Ionicons name={status.icon as any} size={14} color={status.color} />
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>
          </View>
          
          {tarea.motivo_rejeicao && (
             <View style={styles.rejectionBox}>
                <Text style={styles.rejectionTitle}>Motivo da Rejeição:</Text>
                <Text style={styles.rejectionText}>{tarea.motivo_rejeicao}</Text>
             </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Prova de Execução</Text>
        {fotoUrl ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: fotoUrl }} style={styles.image} contentFit="contain" />
          </View>
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={48} color="#475569" />
            <Text style={styles.noImageText}>Nenhuma foto enviada ainda</Text>
          </View>
        )}
      </ScrollView>

      {tarea.status === 'aguardando_aprovacao' && (
        <View style={[styles.footer, { paddingBottom: (insets.bottom || 20) + 12 }]}>
          <Pressable style={styles.rejectBtn} onPress={() => setModalRejeicao(true)}>
            <Text style={styles.rejectBtnText}>Rejeitar</Text>
          </Pressable>
          <Pressable style={styles.approveBtn} onPress={handleAprovar}>
            <Text style={styles.approveBtnText}>Aprovar</Text>
          </Pressable>
        </View>
      )}

      <ModalMotivoRejeicao
        visible={modalRejeicao}
        onClose={() => setModalRejeicao(false)}
        onConfirm={handleRejeitar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  scroll: { padding: 20 },
  card: { backgroundColor: '#1e293b', borderRadius: 24, padding: 20, marginBottom: 24 },
  childInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  childName: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 },
  description: { fontSize: 16, color: '#94a3b8', lineHeight: 22, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 24 },
  stat: { gap: 4 },
  statLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#f59e0b' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12, marginLeft: 4 },
  imageContainer: { width: '100%', height: 300, backgroundColor: '#1e293b', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  image: { width: '100%', height: '100%' },
  noImage: { width: '100%', height: 200, backgroundColor: '#1e293b', borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#334155' },
  noImageText: { color: '#64748b', marginTop: 12, fontSize: 14 },
  footer: { flexDirection: 'row', gap: 12, padding: 20, backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  rejectBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: 'rgba(239,68,68,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  rejectBtnText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
  approveBtn: { flex: 2, height: 56, borderRadius: 16, backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center' },
  approveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  errorContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#fff', fontSize: 18, marginBottom: 20 },
  link: { color: '#3b82f6', fontSize: 16 },
  rejectionBox: { marginTop: 20, padding: 16, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  rejectionTitle: { color: '#ef4444', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  rejectionText: { color: '#fca5a5', fontSize: 14, fontStyle: 'italic' }
});
