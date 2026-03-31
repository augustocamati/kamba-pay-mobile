import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { router } from 'expo-router';

export default function ChildTasksScreen() {
  const insets = useSafeAreaInsets();
  const { tarefas } = useApp();
  const webTop = Platform.OS === 'web' ? 67 : 0;

  const paraFazer = tarefas.filter(t => t.status === 'pendente');
  const aguardando = tarefas.filter(t => t.status === 'aguardando_aprovacao');
  const concluidas = tarefas.filter(t => t.status === 'concluida');

  return (
    <View style={styles.container}>
      {/* Back button */}
      <View style={[styles.topBar, { paddingTop: (insets.top || webTop) + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FF6B00" />
        </Pressable>
        <Text style={styles.topBarTitle}>Minhas Tarefas 📋</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Complete e ganhe recompensas!</Text>

        {/* Para Fazer */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Para Fazer 🎯</Text>
        </View>

        {paraFazer.map(task => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={styles.taskIconBg}>
                <MaterialCommunityIcons name={task.icone as any || 'clipboard-text'} size={24} color="#FF9900" />
              </View>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{task.titulo}</Text>
                <Text style={styles.taskDesc}>{task.descricao}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.rewardBadge}>
                    <Text style={styles.rewardText}>💰 {task.recompensa} Kz</Text>
                  </View>
                  <Text style={styles.statusLabelPendente}>
                    {task.status === 'pendente' ? 'Para fazer' : 'Pendente'}
                  </Text>
                </View>
              </View>
            </View>
            <Pressable 
              style={styles.sendButton}
              onPress={() => router.push({ pathname: '/child/submit-task', params: { taskId: task.id } })}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.sendButtonText}>Enviar Foto da Tarefa</Text>
            </Pressable>
          </View>
        ))}

        {/* Aguardando Aprovação */}
        {aguardando.length > 0 && (
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Aguardando Aprovação ⌛</Text>
          </View>
        )}

        {aguardando.map(task => (
          <View key={task.id} style={styles.awaitingCard}>
            <View style={styles.taskHeader}>
              <View style={[styles.taskIconBg, { backgroundColor: '#E1F5FE' }]}>
                <MaterialCommunityIcons name={task.icone as any || 'pencil'} size={24} color="#3498DB" />
              </View>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{task.titulo}</Text>
                <Text style={styles.taskDesc}>{task.descricao}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.rewardBadge, { backgroundColor: '#FFE082' }]}>
                    <Text style={styles.rewardText}>💰 {task.recompensa} Kz</Text>
                  </View>
                  <Text style={styles.statusLabelAguardando}>Aguardando Aprovação</Text>
                </View>
              </View>
            </View>
            {task.foto_url && (
              <Image source={{ uri: task.foto_url }} style={styles.proofImage} />
            )}
          </View>
        ))}

        {/* Concluídas */}
        {concluidas.length > 0 && (
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Concluídas 🎉</Text>
          </View>
        )}

        {concluidas.map(task => (
          <View key={task.id} style={styles.completedItem}>
            <View style={styles.completedIconCard}>
              <MaterialCommunityIcons name="magnify" size={24} color="#000" />
            </View>
            <Text style={styles.completedTitle}>{task.titulo}</Text>
            <View style={styles.concluidaBadge}>
               <Text style={styles.concluidaText}>✅ +{task.recompensa} Kz</Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFCE8' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#FFFCE8',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF5E8', alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#1A1A2E' },
  scrollContent: { paddingHorizontal: 20 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  taskHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  taskIconBg: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center' },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  taskDesc: { fontSize: 13, color: '#64748B', marginTop: 2, lineHeight: 18 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  rewardBadge: { backgroundColor: '#FFEE58', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  rewardText: { fontSize: 12, fontWeight: '800', color: '#000' },
  statusLabelPendente: { fontSize: 12, fontWeight: '700', color: '#F44336' },
  statusLabelAguardando: { fontSize: 12, fontWeight: '700', color: '#2196F3' },
  sendButton: {
    backgroundColor: '#FF6F00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  sendButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  awaitingCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  proofImage: { width: '100%', height: 160, borderRadius: 16, marginTop: 4 },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F9F1',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  completedIconCard: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  completedTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#2E7D32' },
  concluidaBadge: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#A5D6A7' },
  concluidaText: { fontSize: 12, fontWeight: '800', color: '#2E7D32' },
});
