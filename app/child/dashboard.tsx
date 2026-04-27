import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

function WalletPillar({ label, value, icon, color, bgColor }: { label: string; value: number; icon: string; color: string; bgColor: string }) {
  return (
    <View style={[pillarStyles.card, { borderColor: `${color}30` }]}>
      <View style={[pillarStyles.iconWrap, { backgroundColor: bgColor }]}>
        {icon === 'piggy-bank' ? (
          <MaterialCommunityIcons name="piggy-bank" size={22} color={color} />
        ) : (
          <Ionicons name={icon as any} size={22} color={color} />
        )}
      </View>
      <Text style={[pillarStyles.value, { color }]}>{value.toLocaleString()} Kz</Text>
      <Text style={pillarStyles.label}>{label}</Text>
    </View>
  );
}

const pillarStyles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 6, borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 16, fontFamily: 'Fredoka_700Bold' },
  label: { fontSize: 11, fontFamily: 'Fredoka_600SemiBold', color: Colors.child.textSecondary },
});

export default function ChildDashboard() {
  const insets = useSafeAreaInsets();
  const { user, tasks, missions, logout, getWallet, getChildBalance, getMonthlyStats } = useAuth();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const [refreshing, setRefreshing] = React.useState(false);

  const wallet = user ? getWallet(user.id) : { save: 0, spend: 0, help: 0 };
  const balance = user ? getChildBalance(user.id) : 0;
  const stats = user ? getMonthlyStats(user.id) : { tasksCompleted: 0, savingsRate: 0, totalEarned: 0 };
  const myTasks = tasks.filter(t => t.assignedTo === user?.id);
  const pendingTasks = myTasks.filter(t => t.status === 'pending');
  const myMissions = missions.filter(m => m.childId === user?.id);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (insets.bottom || webBottomInset) + 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF8C00" />}
      >
        <LinearGradient colors={['#FF8C00', '#FFB347', '#FFD700']} style={[styles.heroSection, { paddingTop: (insets.top || webTopInset) + 16 }]}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroGreeting}>Ola, {user?.name}!</Text>
              <View style={styles.levelBadge}>
                <MaterialCommunityIcons name="star-four-points" size={14} color="#FF8C00" />
                <Text style={styles.levelText}>Nivel {user?.level || 1}</Text>
              </View>
            </View>
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="rgba(11,26,46,0.5)" />
            </Pressable>
          </View>

          <View style={styles.balanceCard}>
            <MaterialCommunityIcons name="wallet" size={28} color="#FF8C00" />
            <Text style={styles.balanceLabel}>Meu Saldo</Text>
            <Text style={styles.balanceValue}>{balance.toLocaleString()} Kz</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Minha Carteira</Text>
          <View style={styles.pillarsRow}>
            <WalletPillar label="Poupar" value={wallet.save} icon="piggy-bank" color={Colors.chart.save} bgColor="rgba(34,197,94,0.12)" />
            <WalletPillar label="Gastar" value={wallet.spend} icon="cart-outline" color={Colors.chart.spend} bgColor="rgba(255,140,0,0.12)" />
            <WalletPillar label="Ajudar" value={wallet.help} icon="heart-outline" color={Colors.chart.help} bgColor="rgba(255,215,0,0.12)" />
          </View>

          {pendingTasks.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Tarefas para Fazer</Text>
              {pendingTasks.slice(0, 3).map(task => (
                <Pressable
                  key={task.id}
                  style={({ pressed }) => [styles.taskCard, pressed && styles.cardPressed]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: '/child/submit-task', params: { taskId: task.id } }); }}
                >
                  <View style={styles.taskIcon}>
                    <MaterialCommunityIcons name="clipboard-check-outline" size={22} color="#8B5CF6" />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.description ? <Text style={styles.taskDesc} numberOfLines={1}>{task.description}</Text> : null}
                  </View>
                  <View style={styles.taskReward}>
                    <Text style={styles.taskRewardText}>{task.reward} Kz</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.child.textSecondary} />
                  </View>
                </Pressable>
              ))}
              {pendingTasks.length > 3 && (
                <Pressable style={styles.seeAllBtn} onPress={() => router.push('/child/tasks')}>
                  <Text style={styles.seeAllText}>Ver todas ({pendingTasks.length})</Text>
                </Pressable>
              )}
            </>
          )}

          {pendingTasks.length === 0 && (
            <View style={styles.emptyTasks}>
              <MaterialCommunityIcons name="check-circle-outline" size={36} color={Colors.child.textSecondary} />
              <Text style={styles.emptyTitle}>Nenhuma tarefa pendente</Text>
              <Text style={styles.emptyText}>Fale com seus pais para novas tarefas</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Progresso Este Mes</Text>
          <View style={styles.monthStats}>
            <View style={styles.monthStatItem}>
              <Text style={styles.monthStatValue}>{stats.tasksCompleted}</Text>
              <Text style={styles.monthStatLabel}>Tarefas</Text>
            </View>
            <View style={styles.monthStatDivider} />
            <View style={styles.monthStatItem}>
              <Text style={styles.monthStatValue}>{stats.totalEarned.toLocaleString()} Kz</Text>
              <Text style={styles.monthStatLabel}>Ganhou</Text>
            </View>
            <View style={styles.monthStatDivider} />
            <View style={styles.monthStatItem}>
              <Text style={[styles.monthStatValue, { color: Colors.chart.save }]}>{stats.savingsRate}%</Text>
              <Text style={styles.monthStatLabel}>Poupou</Text>
            </View>
          </View>

          {myMissions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Minhas Missoes</Text>
              {myMissions.map(mission => {
                const progress = mission.targetAmount > 0 ? Math.min((mission.currentAmount / mission.targetAmount) * 100, 100) : 0;
                return (
                  <View key={mission.id} style={styles.missionCard}>
                    <View style={styles.missionHeader}>
                      <MaterialCommunityIcons name="target" size={20} color="#22C55E" />
                      <Text style={styles.missionTitle}>{mission.title}</Text>
                      <Text style={styles.missionPercent}>{Math.round(progress)}%</Text>
                    </View>
                    <View style={styles.missionTrack}>
                      <LinearGradient
                        colors={['#22C55E', '#4ADE80']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[styles.missionFill, { width: `${Math.max(progress, 3)}%` }]}
                      />
                    </View>
                    <Text style={styles.missionValues}>{mission.currentAmount.toLocaleString()} / {mission.targetAmount.toLocaleString()} Kz</Text>
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.child.background },
  heroSection: { paddingHorizontal: 20, paddingBottom: 30, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  heroGreeting: { fontSize: 24, fontFamily: 'Fredoka_700Bold', color: '#0B1A2E' },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6,
    alignSelf: 'flex-start',
  },
  levelText: { fontSize: 12, fontFamily: 'Fredoka_700Bold', color: '#0B1A2E' },
  logoutBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: 20,
    alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  balanceLabel: { fontSize: 13, fontFamily: 'Fredoka_600SemiBold', color: Colors.child.textSecondary },
  balanceValue: { fontSize: 32, fontFamily: 'Fredoka_700Bold', color: '#0B1A2E' },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 17, fontFamily: 'Fredoka_700Bold', color: Colors.child.text, marginBottom: 12, marginTop: 8 },
  pillarsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  taskCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.child.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  taskIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)', justifyContent: 'center', alignItems: 'center',
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontFamily: 'Fredoka_600SemiBold', color: Colors.child.text },
  taskDesc: { fontSize: 12, fontFamily: 'Fredoka_400Regular', color: Colors.child.textSecondary, marginTop: 2 },
  taskReward: { alignItems: 'flex-end', gap: 2 },
  taskRewardText: { fontSize: 14, fontFamily: 'Fredoka_700Bold', color: '#FF8C00' },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  seeAllBtn: { alignItems: 'center', paddingVertical: 10 },
  seeAllText: { fontSize: 14, fontFamily: 'Fredoka_600SemiBold', color: '#FF8C00' },
  emptyTasks: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 30,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.child.border, marginBottom: 8,
  },
  emptyTitle: { fontSize: 15, fontFamily: 'Fredoka_600SemiBold', color: Colors.child.text },
  emptyText: { fontSize: 13, fontFamily: 'Fredoka_400Regular', color: Colors.child.textSecondary },
  monthStats: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: Colors.child.border, marginBottom: 8,
  },
  monthStatItem: { flex: 1, alignItems: 'center', gap: 4 },
  monthStatValue: { fontSize: 18, fontFamily: 'Fredoka_700Bold', color: Colors.child.text },
  monthStatLabel: { fontSize: 11, fontFamily: 'Fredoka_400Regular', color: Colors.child.textSecondary },
  monthStatDivider: { width: 1, backgroundColor: Colors.child.border },
  missionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.child.border, marginBottom: 10,
  },
  missionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  missionTitle: { flex: 1, fontSize: 14, fontFamily: 'Fredoka_600SemiBold', color: Colors.child.text },
  missionPercent: { fontSize: 14, fontFamily: 'Fredoka_700Bold', color: '#22C55E' },
  missionTrack: { height: 10, backgroundColor: '#F0F0F0', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  missionFill: { height: '100%', borderRadius: 5 },
  missionValues: { fontSize: 12, fontFamily: 'Fredoka_400Regular', color: Colors.child.textSecondary },
});
