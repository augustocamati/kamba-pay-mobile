import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export default function ChildTasksScreen() {
  const insets = useSafeAreaInsets();
  const { user, tasks } = useAuth();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const myTasks = tasks.filter(t => t.assignedTo === user?.id);
  const sortedTasks = [...myTasks].sort((a, b) => {
    const order = { pending: 0, submitted: 1, rejected: 2, approved: 3 };
    return (order[a.status] || 0) - (order[b.status] || 0);
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Para Fazer', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' };
      case 'submitted': return { label: 'Enviada', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' };
      case 'approved': return { label: 'Aprovada', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' };
      case 'rejected': return { label: 'Refazer', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' };
      default: return { label: status, color: '#999', bg: '#f0f0f0' };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: (insets.top || webTopInset) + 12 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.child.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Minhas Tarefas</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={sortedTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: (insets.bottom || webBottomInset) + 20 }]}
        scrollEnabled={sortedTasks.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={Colors.child.textSecondary} />
            <Text style={styles.emptyTitle}>Sem tarefas</Text>
            <Text style={styles.emptyText}>Peca aos seus pais para criar tarefas</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusInfo = getStatusInfo(item.status);
          const canSubmit = item.status === 'pending' || item.status === 'rejected';
          return (
            <Pressable
              style={({ pressed }) => [styles.taskCard, pressed && canSubmit && styles.cardPressed]}
              onPress={() => {
                if (canSubmit) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/child/submit-task', params: { taskId: item.id } });
                }
              }}
              disabled={!canSubmit}
            >
              <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>
              </View>
              <Text style={styles.taskReward}>{item.reward} Kz</Text>
              {canSubmit && <Ionicons name="chevron-forward" size={18} color={Colors.child.textSecondary} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.child.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.child.text },
  list: { paddingHorizontal: 20, gap: 10 },
  taskCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.child.border,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  taskInfo: { flex: 1, gap: 4 },
  taskTitle: { fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: Colors.child.text },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontFamily: 'Nunito_600SemiBold' },
  taskReward: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#FF8C00' },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.child.text },
  emptyText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.child.textSecondary },
});
