import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { useApp } from '@/context/AppContext';
import { API_HOST } from '@/lib/api';
import Colors from '@/constants/colors';

export default function ChildTaskDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { tarefas } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const tarefaId = Array.isArray(id) ? id[0] : id;
  const tarea = tarefas.find(t => String(t.id) === String(tarefaId));

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

  const statusMap = {
    pendente: { label: 'Aguardando', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: 'time-outline' },
    aguardando_aprovacao: { label: 'Em Revisão', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: 'eye-outline' },
    aprovada: { label: 'Concluída!', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', icon: 'checkmark-done-circle-outline' },
    rejeitada: { label: 'Precisa Corrigir', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: 'refresh-outline' },
  };

  const status = statusMap[tarea.status as keyof typeof statusMap] || statusMap.pendente;
  const fotoUrl = tarea.foto_url ? (tarea.foto_url.startsWith('http') ? tarea.foto_url : `${API_HOST}${tarea.foto_url}`) : null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.child.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Minha Tarefa</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: status.bg || (status.color + '20') }]}>
                <Ionicons name={status.icon as any} size={14} color={status.color} />
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
              {tarea.data_limite && (
                  <View style={styles.deadlineRow}>
                      <Ionicons name="calendar-outline" size={14} color={Colors.child.textSecondary} />
                      <Text style={styles.deadlineText}>Até {new Date(tarea.data_limite).toLocaleDateString()}</Text>
                  </View>
              )}
          </View>

          <Text style={styles.title}>{tarea.titulo}</Text>
          <Text style={styles.description}>{tarea.descricao || 'Sem descrição'}</Text>

          <View style={styles.rewardBox}>
             <MaterialCommunityIcons name="cash" size={24} color="#FF8C00" />
             <View>
                <Text style={styles.rewardLabel}>Recompensa</Text>
                <Text style={styles.rewardValue}>{tarea.recompensa.toLocaleString()} Kz</Text>
             </View>
          </View>
          
          {tarea.status === 'rejeitada' && tarea.motivo_rejeicao && (
             <View style={styles.rejectionBox}>
                <View style={styles.rejectionHeader}>
                   <Ionicons name="alert-circle" size={18} color="#EF4444" />
                   <Text style={styles.rejectionTitle}>O que corrigir:</Text>
                </View>
                <Text style={styles.rejectionText}>{tarea.motivo_rejeicao}</Text>
             </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Sua Prova de Execução</Text>
        {fotoUrl ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: fotoUrl }} style={styles.image} contentFit="contain" />
          </View>
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="camera-outline" size={48} color={Colors.child.textSecondary} />
            <Text style={styles.noImageText}>Ainda não enviaste uma foto</Text>
          </View>
        )}
      </ScrollView>

      {(tarea.status === 'pendente' || tarea.status === 'rejeitada') && (
        <View style={[styles.footer, { paddingBottom: (insets.bottom || 20) + 12 }]}>
          <Pressable 
            style={styles.submitBtn} 
            onPress={() => router.push({ pathname: '/child/submit-task', params: { taskId: tarea.id } })}
          >
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.submitBtnText}>
                {tarea.status === 'rejeitada' ? 'Tentar Novamente' : 'Enviar Prova'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.child.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.child.border
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  headerTitle: { fontSize: 18, fontFamily: 'Fredoka_700Bold', color: Colors.child.text },
  scroll: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 13, fontFamily: 'Fredoka_700Bold' },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadlineText: { fontSize: 12, color: Colors.child.textSecondary, fontFamily: 'Fredoka_600SemiBold' },
  title: { fontSize: 24, fontFamily: 'Fredoka_700Bold', color: Colors.child.text, marginBottom: 8 },
  description: { fontSize: 16, color: Colors.child.textSecondary, fontFamily: 'Fredoka_400Regular', lineHeight: 22, marginBottom: 20 },
  rewardBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,140,0,0.05)', padding: 16, borderRadius: 16 },
  rewardLabel: { fontSize: 12, color: Colors.child.textSecondary, fontFamily: 'Fredoka_600SemiBold', textTransform: 'uppercase' },
  rewardValue: { fontSize: 20, fontFamily: 'Fredoka_700Bold', color: '#FF8C00' },
  sectionTitle: { fontSize: 16, fontFamily: 'Fredoka_700Bold', color: Colors.child.text, marginBottom: 12, marginLeft: 4 },
  imageContainer: { width: '100%', height: 300, backgroundColor: '#f8fafc', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: Colors.child.border },
  image: { width: '100%', height: '100%' },
  noImage: { width: '100%', height: 200, backgroundColor: '#f8fafc', borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#e2e8f0' },
  noImageText: { color: Colors.child.textSecondary, marginTop: 12, fontSize: 14, fontFamily: 'Fredoka_600SemiBold' },
  footer: { padding: 20, backgroundColor: Colors.child.background },
  submitBtn: { height: 60, borderRadius: 20, backgroundColor: '#8B5CF6', flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  submitBtnText: { color: '#fff', fontSize: 18, fontFamily: 'Fredoka_700Bold' },
  errorContainer: { flex: 1, backgroundColor: Colors.child.background, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: Colors.child.text, fontSize: 18, marginBottom: 20 },
  link: { color: '#3b82f6', fontSize: 16 },
  rejectionBox: { marginTop: 20, padding: 16, backgroundColor: '#FEF2F2', borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  rejectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  rejectionTitle: { color: '#EF4444', fontFamily: 'Fredoka_700Bold', fontSize: 15 },
  rejectionText: { color: '#B91C1C', fontSize: 14, fontFamily: 'Fredoka_400Regular', fontStyle: 'italic' }
});
