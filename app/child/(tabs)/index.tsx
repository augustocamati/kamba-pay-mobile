import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { useApp } from '@/context/AppContext';
import { router, useFocusEffect } from 'expo-router';

export default function ChildDashboard() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { crianca, tarefas, missoes, aulaVistaHoje } = useApp();

  useFocusEffect(
    React.useCallback(() => {
      if (!aulaVistaHoje) {
        // Redireciona logo caso ainda não tenha feito a aula/quiz diário
        router.replace('/child/aula');
      }
    }, [aulaVistaHoje])
  );

  // For the demo/image fidelity, we use the 'crianca' from AppContext if it matches the name
  // or just use the mock data since the image is very specific.
  const name = user?.name || crianca.nome;
  const saldoTotal = crianca.potes.total;
  const saldoGastar = crianca.potes.saldo_gastar;
  const saldoPoupar = crianca.potes.saldo_poupar;
  const saldoAjudar = crianca.potes.saldo_ajudar;

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Olá, Kiala! */}
        <View style={styles.header}>
          <View style={styles.avatarBorder}>
            <Image 
              source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kiala' }} 
              style={styles.avatar} 
            />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{crianca.nivel}</Text>
            </View>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Olá, {name}! 👋</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.xpTextStatus}>{crianca.xp || 0} XP</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={async () => {
              await logout();
              router.replace('/');
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF6B00" />
          </TouchableOpacity>
        </View>

        {/* Saldo Total Card */}
        <LinearGradient
          colors={['#FF6B00', '#FF9900']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <MaterialCommunityIcons name="wallet-outline" size={20} color="#fff" />
            <Text style={styles.balanceLabel}>Saldo Total</Text>
          </View>
          <Text style={styles.balanceValue}>{saldoTotal.toLocaleString()} Kz</Text>
          <Text style={styles.balanceHint}>Continue economizando! 🎯</Text>
        </LinearGradient>

        {/* Meus Potes Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meus Potes 🏺</Text>
        </View>

        {/* Pote Gastar (Full Width) */}
        {crianca.potes.config?.gastar && (
          <LinearGradient
            colors={crianca.potes.config.gastar.cor as any}
            style={styles.poteFull}
          >
            <View style={styles.poteHeader}>
              <View style={styles.poteIconBg}>
                <MaterialCommunityIcons 
                  name={crianca.potes.config.gastar.icone as any} 
                  size={24} 
                  color={crianca.potes.config.gastar.cor[0]} 
                />
              </View>
              <View style={styles.poteBadge}>
                <Text style={styles.poteBadgeText}>50%</Text>
              </View>
            </View>
            <Text style={styles.poteLabel}>{crianca.potes.config.gastar.label}</Text>
            <Text style={styles.poteValue}>{saldoGastar.toLocaleString()} Kz</Text>
            <Text style={styles.poteDesc}>{crianca.potes.config.gastar.descricao}</Text>
          </LinearGradient>
        )}

        {/* Potes (Double Column) */}
        <View style={styles.poteRow}>
          {crianca.potes.config?.poupar && (
            <LinearGradient
              colors={crianca.potes.config.poupar.cor as any}
              style={styles.poteHalf}
            >
              <View style={styles.poteIconBg}>
                <MaterialCommunityIcons 
                  name={crianca.potes.config.poupar.icone as any} 
                  size={24} 
                  color={crianca.potes.config.poupar.cor[0]} 
                />
              </View>
              <Text style={styles.poteLabel}>{crianca.potes.config.poupar.label}</Text>
              <Text style={styles.poteHalfValue}>{saldoPoupar.toLocaleString()} Kz</Text>
              <Text style={styles.poteDesc}>{crianca.potes.config.poupar.descricao}</Text>
            </LinearGradient>
          )}

          {crianca.potes.config?.ajudar && (
            <LinearGradient
              colors={crianca.potes.config.ajudar.cor as any}
              style={styles.poteHalf}
            >
              <View style={styles.poteIconBg}>
                <Ionicons 
                  name={crianca.potes.config.ajudar.icone as any} 
                  size={24} 
                  color={crianca.potes.config.ajudar.cor[0]} 
                />
              </View>
              <Text style={styles.poteLabel}>{crianca.potes.config.ajudar.label}</Text>
              <Text style={styles.poteHalfValue}>{saldoAjudar.toLocaleString()} Kz</Text>
              <Text style={styles.poteDesc}>{crianca.potes.config.ajudar.descricao}</Text>
            </LinearGradient>
          )}
        </View>

        {/* Tarefas do Dia Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Tarefas do Dia ⭐</Text>
          <Text style={styles.sectionSubtitle}>1/3 aguardando</Text>
        </View>

        {/* Task Cards */}
        {tarefas.filter(t => t.status !== 'concluida').map((task, index) => (
          <View 
            key={task.id} 
            style={[
              styles.taskCard,
              task.status === 'aguardando_aprovacao' && styles.taskCardAwaiting
            ]}
          >
            <View style={styles.taskIconBg}>
              <MaterialCommunityIcons 
                name={task.icone as any || 'clipboard-text'} 
                size={24} 
                color="#FF9900" 
              />
            </View>
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>{task.titulo}</Text>
              <Text style={styles.taskDesc} numberOfLines={2}>{task.descricao}</Text>
              <View style={styles.taskFooter}>
                <Text style={styles.taskReward}>Recompensa: <Text style={styles.taskRewardAmt}>{task.recompensa} Kz</Text></Text>
                {task.status === 'aguardando_aprovacao' && (
                  <View style={styles.awaitingBadge}>
                    <MaterialCommunityIcons name="timer-sand" size={14} color="#3498DB" />
                    <Text style={styles.awaitingText}>Aguardando aprovação</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}

        {/* Meta Link (From data) */}
        {missoes.length > 0 && (
          <LinearGradient
            colors={['#BF5AF2', '#A335EE']}
            style={styles.metaCard}
          >
            <View style={styles.metaIconBg}>
              <Text style={{ fontSize: 24 }}>{missoes[0].icone}</Text>
            </View>
            <View style={styles.metaContent}>
              <Text style={styles.metaTitle}>{missoes[0].titulo}</Text>
              <Text style={styles.metaDesc}>
                Faltam {(missoes[0].objetivo_valor - missoes[0].progresso_atual).toLocaleString()} Kz
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </LinearGradient>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFCE8' },
  scrollContent: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarBorder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  avatar: { width: 64, height: 64, borderRadius: 12 },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFCE8',
  },
  levelText: { fontSize: 14, fontWeight: '800', color: '#000' },
  headerText: {
    flex: 1,
    marginLeft: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 2,
  },
  xpTextStatus: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '700',
    marginLeft: 4,
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginLeft: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
  },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  balanceLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  balanceValue: { color: '#fff', fontSize: 44, fontWeight: '900' },
  balanceHint: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  sectionHeader: { marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#000' },
  sectionSubtitle: { fontSize: 13, color: '#b5b5b5', fontWeight: '600' },
  poteFull: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  poteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  poteIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  poteBadge: { backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  poteBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  poteLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  poteValue: { color: '#fff', fontSize: 32, fontWeight: '900' },
  poteDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  poteRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  poteHalf: { flex: 1, borderRadius: 28, padding: 20 },
  poteHalfValue: { color: '#fff', fontSize: 22, fontWeight: '900' },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  taskCardAwaiting: {
    borderColor: '#3498DB',
    backgroundColor: '#F0F9FF',
  },
  taskIconBg: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#FFF5E6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 17, fontWeight: '800', color: '#000', marginBottom: 4 },
  taskDesc: { fontSize: 13, color: '#b5b5b5', lineHeight: 18, marginBottom: 8 },
  taskFooter: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  taskReward: { fontSize: 12, color: '#b5b5b5', fontWeight: '600' },
  taskRewardAmt: { color: '#FF9900', fontWeight: '800' },
  awaitingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  awaitingText: { fontSize: 12, fontWeight: '700', color: '#3498DB' },
  metaCard: {
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaIconBg: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  metaContent: { flex: 1 },
  metaTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  metaDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginTop: 2 },
});
