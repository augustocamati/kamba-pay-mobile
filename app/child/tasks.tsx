import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { useApp } from '@/context/AppContext';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

type FilterType = 'all' | 'pendente' | 'aguardando_aprovacao' | 'aprovada' | 'rejeitada';

export default function ChildTasksScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { tarefas: allTasks } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const myTasks = allTasks.filter(t => String(t.crianca_id) === String(user?.id));
  const filteredTasks = myTasks.filter(t => filter === 'all' || t.status === filter);
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const order: Record<string, number> = { pendente: 0, rejeitada: 1, aguardando_aprovacao: 2, aprovada: 3 };
    return (order[a.status] || 0) - (order[b.status] || 0);
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente': return { label: 'Para Fazer', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: 'time-outline' };
      case 'aguardando_aprovacao': return { label: 'Em Revisão', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: 'eye-outline' };
      case 'aprovada': return { label: 'Aprovada!', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', icon: 'checkmark-done-circle-outline' };
      case 'rejeitada': return { label: 'Refazer', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: 'refresh-outline' };
      default: return { label: status, color: '#999', bg: '#f0f0f0', icon: 'help-circle-outline' };
    }
  };

  const FilterBtn = ({ type, label }: { type: FilterType, label: string }) => (
    <Pressable
      style={[styles.filterBtn, filter === type && styles.filterBtnActive]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFilter(type);
      }}
    >
      <Text style={[styles.filterBtnText, filter === type && styles.filterBtnTextActive]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: (insets.top || webTopInset) + 12 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.child.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Minhas Tarefasssssssss</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <FilterBtn type="all" label="Todas" />
          <FilterBtn type="pendente" label="Para Fazer" />
          <FilterBtn type="rejeitada" label="Refazer" />
          <FilterBtn type="aguardando_aprovacao" label="Em Revisão" />
          <FilterBtn type="aprovada" label="Concluídas" />
        </ScrollView>
      </View>

      <FlatList
        data={sortedTasks}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: (insets.bottom || webBottomInset) + 20 }]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={Colors.child.textSecondary} />
            <Text style={styles.emptyTitle}>Sem tarefas</Text>
            <Text style={styles.emptyText}>Não encontramos tarefas com este filtro.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusInfo = getStatusInfo(item.status);
          const canSubmit = item.status === 'pendente' || item.status === 'rejeitada';
          const deadline = item.data_limite ? new Date(item.data_limite) : null;
          const isOverdue = deadline && deadline < new Date() && item.status !== 'aprovada';

          return (
            <Pressable
              style={({ pressed }) => [
                styles.taskCard, 
                pressed && canSubmit && styles.cardPressed,
                item.status === 'rejeitada' && styles.cardRejected
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: '/child/task-details/[id]', params: { id: item.id } });
              }}
              disabled={!canSubmit}
            >
              <View style={[styles.typeIconBox, { backgroundColor: statusInfo.bg }]}>
                  <Ionicons name={item.icone as any || 'clipboard-outline'} size={24} color={statusInfo.color} />
              </View>

              <View style={styles.taskContent}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{item.titulo}</Text>
                  <Text style={styles.taskReward}>{item.recompensa} Kz</Text>
                </View>

                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.color} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                  </View>

                  {deadline && (
                    <View style={styles.deadlineRow}>
                      <Ionicons name="calendar-outline" size={12} color={isOverdue ? '#EF4444' : '#64748B'} />
                      <Text style={[styles.deadlineText, isOverdue && { color: '#EF4444' }]}>
                        Até {deadline.toLocaleDateString('pt-PT')}
                      </Text>
                    </View>
                  )}
                </View>

                {item.status === 'rejeitada' && item.motivo_rejeicao && (
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>Motivo da revisão:</Text>
                    <Text style={styles.reasonText}>"{item.motivo_rejeicao}"</Text>
                  </View>
                )}
              </View>

              {canSubmit && (
                <View style={styles.actionIcon}>
                   <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: '#1E293B' },
  
  filterContainer: { marginBottom: 16 },
  filterScroll: { paddingHorizontal: 20, gap: 8 },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0',
  },
  filterBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filterBtnText: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#64748B' },
  filterBtnTextActive: { color: '#fff' },

  list: { paddingHorizontal: 20, gap: 12 },
  taskCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  cardRejected: { borderColor: '#FEE2E2', backgroundColor: '#FFFDFD' },
  typeIconBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  taskContent: { flex: 1 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  taskTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#1E293B', flex: 1, marginRight: 8 },
  taskReward: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: '#D97706' },
  
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontFamily: 'Nunito_700Bold' },
  
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadlineText: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: '#64748B' },

  reasonBox: {
    marginTop: 10, padding: 10, backgroundColor: '#FEF2F2', borderRadius: 10,
    borderLeftWidth: 3, borderLeftColor: '#EF4444',
  },
  reasonLabel: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: '#B91C1C', marginBottom: 2 },
  reasonText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: '#DC2626', fontStyle: 'italic' },

  actionIcon: { justifyContent: 'center', marginLeft: 8 },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: '#1E293B' },
  emptyText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: '#64748B', textAlign: 'center', paddingHorizontal: 40 },
});
