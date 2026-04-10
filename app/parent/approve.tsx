import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Platform, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';

export default function ApproveTasksScreen() {
  const insets = useSafeAreaInsets();
  const { tarefas, dependentes, aprovarTarefa, rejeitarTarefa, isLoading } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const pendingTasks = tarefas.filter(t => t.status === 'aguardando_aprovacao');

  const getChildName = (childId: string) => {
    return dependentes.find(c => c.id === childId)?.nome || 'Filho';
  };

  const handleApprove = async (tarefaId: string, titulo: string) => {
    Alert.alert(
      'Aprovar Tarefa ✅',
      `Tem a certeza que quer aprovar "${titulo}"? A recompensa será creditada.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aprovar', onPress: async () => {
          try {
            await aprovarTarefa(tarefaId);
            Alert.alert('Aprovada! 🎉', 'Parabéns ao teu filho! A recompensa foi creditada.');
          } catch (e) {
            Alert.alert('Erro', 'Não foi possível aprovar a tarefa.');
          }
        }}
      ]
    );
  };

  const handleReject = async (tarefaId: string, titulo: string) => {
    Alert.alert(
      'Rejeitar Tarefa',
      `Quer rejeitar "${titulo}"? O filho poderá tentar novamente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Rejeitar', style: 'destructive', onPress: async () => {
          try {
            await rejeitarTarefa(tarefaId);
          } catch (e) {
            Alert.alert('Erro', 'Não foi possível rejeitar a tarefa.');
          }
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0B1A2E', '#0F1F3D']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Aprovações</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ color: '#93c5fd', marginTop: 12 }}>A carregar tarefas...</Text>
        </View>
      ) : (
        <FlatList
          data={pendingTasks}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: (insets.bottom || webBottomInset) + 20 }]}
          scrollEnabled={pendingTasks.length > 0}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="check-circle-outline" size={64} color="#334155" />
              <Text style={styles.emptyTitle}>Tudo em dia! ✅</Text>
              <Text style={styles.emptyText}>Nenhuma tarefa pendente de aprovação</Text>
            </View>
          }
          renderItem={({ item }) => {
            return (
              <View style={styles.taskCard}>
                {item.foto_url && (
                  <View style={styles.photoContainer}>
                    <Image source={{ uri: item.foto_url }} style={styles.photo} contentFit="cover" />
                    <View style={styles.photoOverlay}>
                      <View style={styles.rewardTag}>
                        <Text style={styles.rewardTagText}>{item.recompensa} Kz</Text>
                      </View>
                      <View style={[styles.categoryTag, { backgroundColor: '#3b82f6' }]}>
                        <Text style={styles.categoryTagText}>{item.categoria}</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{item.titulo}</Text>
                  <Text style={styles.taskDesc} numberOfLines={2}>{item.descricao}</Text>
                  <View style={styles.taskMeta}>
                    <Ionicons name="person-outline" size={14} color="#64748b" />
                    <Text style={styles.taskChild}>Enviada por {getChildName(item.crianca_id)}</Text>
                    {!item.foto_url && (
                      <View style={[styles.rewardInline]}>
                        <Text style={styles.rewardInlineText}>{item.recompensa} Kz</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <Pressable 
                    style={({ pressed }) => [styles.rejectBtn, pressed && styles.btnPressed]} 
                    onPress={() => handleReject(item.id, item.titulo)}
                  >
                    <Ionicons name="close" size={22} color="#EF4444" />
                    <Text style={styles.rejectText}>Rejeitar</Text>
                  </Pressable>
                  <Pressable 
                    style={({ pressed }) => [styles.approveBtn, pressed && styles.btnPressed]} 
                    onPress={() => handleApprove(item.id, item.titulo)}
                  >
                    <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                    <Text style={styles.approveText}>Aprovar</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1A2E' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  list: { paddingHorizontal: 20, gap: 14, paddingTop: 10 },
  taskCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
  },
  photoContainer: { height: 200, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  photoOverlay: {
    position: 'absolute', bottom: 10, left: 10, right: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  rewardTag: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  rewardTagText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  categoryTag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  categoryTagText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF', textTransform: 'capitalize' },
  taskInfo: { padding: 16 },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  taskDesc: { fontSize: 13, color: '#94a3b8', marginTop: 4, lineHeight: 18 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  taskChild: { fontSize: 13, color: '#94a3b8', flex: 1 },
  rewardInline: { backgroundColor: 'rgba(52,211,153,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  rewardInlineText: { color: '#34d399', fontSize: 13, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 10, padding: 16, paddingTop: 0 },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)', borderRadius: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  rejectText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  approveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#22C55E', borderRadius: 12, paddingVertical: 14,
  },
  approveText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  btnPressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  emptyText: { fontSize: 14, color: '#64748b' },
});
