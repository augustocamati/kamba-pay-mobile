import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Platform, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { useApp } from '@/context/AppContext';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { MascotCompanion } from '@/components/MascotCompanion';

type FilterType = 'all' | 'pendente' | 'aguardando_aprovacao' | 'aprovada' | 'rejeitada';

export default function ChildTasksScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { tarefas: allTasks, refreshData, isLoading } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  // Garantia de que filtramos apenas as tarefas desta criança
  // No caso da criança logada, a API já retorna apenas as dela, 
  // então podemos ser mais flexíveis se o ID coincidir ou se for o perfil child
  const myTasks = allTasks.filter(t => {
    if (!t.crianca_id) return true; // fallback se o backend omitir o ID
    return String(t.crianca_id) === String(user?.id) || user?.role === 'child';
  });
  const filteredTasks = myTasks.filter(t => filter === 'all' || t.status === filter);
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const order: Record<string, number> = { pendente: 0, rejeitada: 1, aguardando_aprovacao: 2, aprovada: 3 };
    return (order[a.status] || 0) - (order[b.status] || 0);
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente': return { label: 'Para Fazer', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: 'time-outline' };
      case 'aguardando_aprovacao': return { label: 'Em Revisão', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: 'eye-outline' };
      case 'aprovada': return { label: 'Concluída!', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', icon: 'checkmark-done-circle-outline' };
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
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FF6F00" />
        </Pressable>
        <Text style={styles.headerTitle}>Minhas Tarefas 📋</Text>
        <View style={{ width: 40 }} />
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
        contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isLoading}
            onRefresh={async () => {
              setIsRefreshing(true);
              await refreshData();
              setIsRefreshing(false);
            }}
            tintColor="#FF6F00"
            colors={["#FF6F00"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Sem tarefas</Text>
            <Text style={styles.emptyText}>Não encontramos tarefas com este filtro.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusInfo = getStatusInfo(item.status);
          const deadline = item.data_limite ? new Date(item.data_limite) : null;
          const isOverdue = deadline && deadline < new Date() && item.status !== 'aprovada';

          return (
            <Pressable
              style={({ pressed }) => [
                styles.taskCard, 
                pressed && styles.cardPressed,
                item.status === 'rejeitada' && styles.cardRejected
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: '/child/task-details/[id]', params: { id: item.id } });
              }}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: statusInfo.bg }]}>
                  <MaterialCommunityIcons name={item.icone as any || 'clipboard-check'} size={24} color={statusInfo.color} />
                </View>
                
                <View style={styles.cardInfo}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{item.titulo}</Text>
                  
                  <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                      <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.color} />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    </View>
                    
                    {deadline && (
                      <View style={styles.deadlineBadge}>
                        <Ionicons name="time-outline" size={12} color={isOverdue ? '#EF4444' : '#64748B'} />
                        <Text style={[styles.deadlineText, isOverdue && { color: '#EF4444', fontFamily: 'Fredoka_700Bold' }]}>
                          {isOverdue ? 'Atrasada!' : `Até ${deadline.toLocaleDateString()}`}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.rewardContainer}>
                  <Text style={styles.rewardValue}>{item.recompensa.toLocaleString()}</Text>
                  <Text style={styles.rewardCurrency}>Kz</Text>
                </View>
              </View>

              {item.status === 'rejeitada' && item.motivo_rejeicao && (
                <View style={styles.rejectionBanner}>
                  <Ionicons name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.rejectionText} numberOfLines={1}>
                    Corrigir: {item.motivo_rejeicao}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />

      <MascotCompanion position="bottom-right" screen="tasks" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFCE8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF5E8', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Fredoka_700Bold', color: '#1A1A2E' },
  filterContainer: { marginBottom: 16 },
  filterScroll: { paddingHorizontal: 20, gap: 10 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  filterBtnActive: { backgroundColor: '#FF6F00', borderColor: '#FF6F00' },
  filterBtnText: { fontSize: 13, fontFamily: 'Fredoka_700Bold', color: '#64748B' },
  filterBtnTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, gap: 12 },
  taskCard: { backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#FFE0B2', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  cardRejected: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, gap: 4 },
  taskTitle: { fontSize: 16, fontFamily: 'Fredoka_700Bold', color: '#1E293B' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: 'Fredoka_700Bold' },
  deadlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  deadlineText: { fontSize: 11, color: '#64748B', fontFamily: 'Fredoka_600SemiBold' },
  rewardContainer: { alignItems: 'flex-end' },
  rewardValue: { fontSize: 16, fontFamily: 'Fredoka_700Bold', color: '#FF9900' },
  rewardCurrency: { fontSize: 10, color: '#FF9900', fontFamily: 'Fredoka_700Bold', marginTop: -2 },
  rejectionBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.1)', padding: 8, borderRadius: 10, marginTop: 10 },
  rejectionText: { flex: 1, fontSize: 12, color: '#DC2626', fontFamily: 'Fredoka_600SemiBold', fontStyle: 'italic' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontFamily: 'Fredoka_700Bold', color: '#64748B', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#94A3B8', fontFamily: 'Fredoka_400Regular', textAlign: 'center', marginTop: 4 },
});
