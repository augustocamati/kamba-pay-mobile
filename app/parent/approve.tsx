import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export default function ApproveTasksScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, children, approveTask, rejectTask } = useAuth();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const pendingTasks = tasks.filter(t => t.status === 'submitted');

  const getChildName = (childId: string) => {
    return children.find(c => c.id === childId)?.name || 'Filho';
  };

  const handleApprove = async (taskId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await approveTask(taskId);
  };

  const handleReject = async (taskId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await rejectTask(taskId);
  };

  const getCategoryInfo = (cat: string) => {
    switch (cat) {
      case 'save': return { label: 'Poupar', color: Colors.chart.save };
      case 'spend': return { label: 'Gastar', color: Colors.chart.spend };
      case 'help': return { label: 'Ajudar', color: Colors.chart.help };
      default: return { label: cat, color: '#999' };
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0B1A2E', '#0F1F3D']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Aprovacoes</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={pendingTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: (insets.bottom || webBottomInset) + 20 }]}
        scrollEnabled={pendingTasks.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="check-circle-outline" size={48} color={Colors.parent.textMuted} />
            <Text style={styles.emptyTitle}>Tudo em dia!</Text>
            <Text style={styles.emptyText}>Nenhuma tarefa pendente de aprovacao</Text>
          </View>
        }
        renderItem={({ item }) => {
          const catInfo = getCategoryInfo(item.category);
          return (
            <View style={styles.taskCard}>
              {item.photoUri && (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: item.photoUri }} style={styles.photo} contentFit="cover" />
                  <View style={styles.photoOverlay}>
                    <View style={styles.rewardTag}>
                      <Text style={styles.rewardTagText}>{item.reward} Kz</Text>
                    </View>
                    <View style={[styles.categoryTag, { backgroundColor: catInfo.color }]}>
                      <Text style={styles.categoryTagText}>{catInfo.label}</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskChild}>Enviada por {getChildName(item.assignedTo)}</Text>
              </View>

              <View style={styles.actionRow}>
                <Pressable style={({ pressed }) => [styles.rejectBtn, pressed && styles.btnPressed]} onPress={() => handleReject(item.id)}>
                  <Ionicons name="close" size={22} color="#EF4444" />
                  <Text style={styles.rejectText}>Rejeitar</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.approveBtn, pressed && styles.btnPressed]} onPress={() => handleApprove(item.id)}>
                  <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                  <Text style={styles.approveText}>Aprovar</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1A2E' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
  list: { paddingHorizontal: 20, gap: 14 },
  taskCard: {
    backgroundColor: Colors.parent.surface, borderRadius: 18,
    borderWidth: 1, borderColor: Colors.parent.border, overflow: 'hidden',
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
  rewardTagText: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
  categoryTag: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  categoryTagText: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: '#FFFFFF' },
  taskInfo: { padding: 16 },
  taskTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
  taskChild: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.parent.textSecondary, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10, padding: 16, paddingTop: 0 },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)', borderRadius: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  rejectText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: '#EF4444' },
  approveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#22C55E', borderRadius: 12, paddingVertical: 14,
  },
  approveText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: '#FFFFFF' },
  btnPressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
  emptyText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.parent.textSecondary },
});
