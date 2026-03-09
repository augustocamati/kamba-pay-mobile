import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';

export default function ChildStatsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { dependentes, historico } = useApp();
  
  const child = dependentes.find(c => c.id === id);

  if (!child) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Criança não encontrada</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Filter transactions for this child (mock assumes all for 'crianca-1' or similar)
  // For now we'll just show the global history but in a real app we'd filter by child.id

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a']} style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estatísticas de {child.nome}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Summary */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
             <Ionicons name="person" size={50} color="#fff" />
          </View>
          <Text style={styles.childName}>{child.nome}</Text>
          <Text style={styles.childLevel}>Nível {child.nivel}</Text>
        </View>

        {/* Financial Overview */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Ionicons name="wallet" size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{child.potes.total.toLocaleString()} Kz</Text>
            <Text style={styles.statLabel}>Saldo Total</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <Ionicons name="trending-up" size={24} color="#22c55e" />
            <Text style={styles.statValue}>{child.potes.saldo_poupar.toLocaleString()} Kz</Text>
            <Text style={styles.statLabel}>Poupado</Text>
          </View>
        </View>

        {/* Potes Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribuição do Dinheiro</Text>
          <View style={styles.poteItem}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
               <Text style={styles.poteName}>🛍️ Gastar</Text>
               <Text style={styles.poteValue}>{child.potes.saldo_gastar.toLocaleString()} Kz</Text>
             </View>
             <View style={styles.progressTrack}>
               <View style={[styles.progressBar, { width: `${(child.potes.saldo_gastar / child.potes.total) * 100}%`, backgroundColor: '#fb923c' }]} />
             </View>
          </View>
          <View style={styles.poteItem}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
               <Text style={styles.poteName}>💰 Poupar</Text>
               <Text style={styles.poteValue}>{child.potes.saldo_poupar.toLocaleString()} Kz</Text>
             </View>
             <View style={styles.progressTrack}>
               <View style={[styles.progressBar, { width: `${(child.potes.saldo_poupar / child.potes.total) * 100}%`, backgroundColor: '#22c55e' }]} />
             </View>
          </View>
          <View style={styles.poteItem}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
               <Text style={styles.poteName}>❤️ Ajudar</Text>
               <Text style={styles.poteValue}>{child.potes.saldo_ajudar.toLocaleString()} Kz</Text>
             </View>
             <View style={styles.progressTrack}>
               <View style={[styles.progressBar, { width: `${(child.potes.saldo_ajudar / child.potes.total) * 100}%`, backgroundColor: '#ef4444' }]} />
             </View>
          </View>
        </View>

        {/* Performance Chart Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desempenho Semanal</Text>
          <View style={styles.chartPlaceholder}>
             <MaterialCommunityIcons name="chart-bar" size={60} color="rgba(255,255,255,0.2)" />
             <Text style={{ color: '#94a3b8', marginTop: 10 }}>Gráfico de evolução</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          {historico.slice(0, 3).map((item) => (
             <View key={item.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: item.valor > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                   <Ionicons name={item.valor > 0 ? 'arrow-up' : 'arrow-down'} size={18} color={item.valor > 0 ? '#22c55e' : '#ef4444'} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                   <Text style={styles.activityDesc}>{item.descricao}</Text>
                   <Text style={styles.activityDate}>{new Date(item.data).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.activityAmt, { color: item.valor > 0 ? '#22c55e' : '#fff' }]}>
                  {item.valor > 0 ? '+' : ''}{item.valor.toLocaleString()} Kz
                </Text>
             </View>
          ))}
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  content: { padding: 20 },
  profileCard: { alignItems: 'center', marginBottom: 24, padding: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  childName: { fontSize: 24, fontWeight: '800', color: '#fff' },
  childLevel: { fontSize: 14, color: '#93c5fd', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', gap: 8 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 12, color: '#94a3b8' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 16 },
  poteItem: { marginBottom: 16 },
  poteName: { fontSize: 14, color: '#fff', fontWeight: '600' },
  poteValue: { fontSize: 14, color: '#93c5fd' },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  chartPlaceholder: { height: 180, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed' },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, marginBottom: 10 },
  activityIcon: { padding: 8, borderRadius: 10 },
  activityDesc: { fontSize: 14, color: '#fff', fontWeight: '600' },
  activityDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  activityAmt: { fontSize: 14, fontWeight: '700' },
  errorContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#fff', fontSize: 18, marginBottom: 10 },
  backLink: { color: '#3b82f6', fontSize: 16 },
});
