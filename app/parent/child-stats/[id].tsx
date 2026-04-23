import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { parentService } from '../../../lib/api';
import { useApp } from '../../../context/AppContext';

export default function ChildStatsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { dependentes } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const child = dependentes.find(c => c.id === id) || stats?.crianca;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    parentService.getChildStats(id as string)
      .then(data => setStats(data))
      .catch(e => console.error('Erro ao buscar stats:', e))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExportarWhatsApp = () => {
    const tarefasConcluidas = stats?.tarefas_concluidas_mes || 0;
    const taxaPoupanca = Math.round((potes.saldo_poupar / potes.total) * 100);

    const mensagem =
      `📊 *Relatório Kamba Kid Pay - ${nome}*\n\n` +
      `💰 Saldo Total: ${totalSaldo.toLocaleString()} Kz\n` +
      `✅ Tarefas Concluídas: ${tarefasConcluidas}\n` +
      `💚 Taxa de Poupança: ${taxaPoupanca}%\n\n` +
      `📦 Distribuição:\n` +
      `• Gastar: ${potes.saldo_gastar.toLocaleString()} Kz\n` +
      `• Poupar: ${potes.saldo_poupar.toLocaleString()} Kz\n` +
      `• Ajudar: ${potes.saldo_ajudar.toLocaleString()} Kz\n\n` +
      `Continue incentivando a educação financeira! 🎯`;

    const encoded = encodeURIComponent(mensagem);
    Linking.openURL(`https://wa.me/?text=${encoded}`);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0f172a', '#1e3a8a']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#93c5fd', marginTop: 12 }}>A carregar dados...</Text>
      </LinearGradient>
    );
  }

  if (!child && !stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Criança não encontrada</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const potes = stats?.crianca?.potes || child?.potes || { saldo_gastar: 0, saldo_poupar: 0, saldo_ajudar: 0, total: 0 };
  const nome = stats?.crianca?.nome || child?.nome || '?';
  const nivel = stats?.crianca?.nivel || child?.nivel || 1;
  const totalSaldo = potes.total || 0;
  const tarefasMes = stats?.tarefas_concluidas_mes || 0;
  const missoesCompletas = stats?.missoes_completas || 0;
  const doacoes = stats?.doacoes_realizadas || 0;
  const historicoRecente: any[] = stats?.historico_recente || [];
  const desempenhoSemanal: any[] = stats?.desempenho_semanal || [];

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a']} style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estatísticas de {nome}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Summary */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
          <Text style={styles.childName}>{nome}</Text>
          <Text style={styles.childLevel}>Nível {nivel}</Text>
        </View>

        {/* Exportar Relatório */}
        <View style={[ { marginBottom: 32 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { marginBottom: 4 }]}>Relatórios Mensais</Text>
              <Text style={{ color: '#93c5fd', fontSize: 13 }}>Compartilhe o progresso no WhatsApp</Text>
            </View>
            <TouchableOpacity onPress={handleExportarWhatsApp} activeOpacity={0.85}>
              <LinearGradient colors={['#16a34a', '#15803d']} style={styles.whatsappBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="share-social" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Compartilhar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Financial Overview */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Ionicons name="wallet" size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{totalSaldo.toLocaleString()} Kz</Text>
            <Text style={styles.statLabel}>Saldo Total</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <Ionicons name="trending-up" size={24} color="#22c55e" />
            <Text style={styles.statValue}>{potes.saldo_poupar?.toLocaleString()} Kz</Text>
            <Text style={styles.statLabel}>Poupado</Text>
          </View>
        </View>

        {/* KPIs */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: 'rgba(251, 146, 60, 0.1)' }]}>
            <Ionicons name="checkmark-circle" size={24} color="#fb923c" />
            <Text style={styles.statValue}>{tarefasMes}</Text>
            <Text style={styles.statLabel}>Tarefas/mês</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
            <Ionicons name="flag" size={24} color="#a855f7" />
            <Text style={styles.statValue}>{missoesCompletas}</Text>
            <Text style={styles.statLabel}>Missões</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Ionicons name="heart" size={24} color="#ef4444" />
            <Text style={styles.statValue}>{doacoes}</Text>
            <Text style={styles.statLabel}>Doações</Text>
          </View>
        </View>

        {/* Potes Breakdown */}
        {totalSaldo > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distribuição do Dinheiro</Text>
            {[
              { label: '🛍️ Gastar', value: potes.saldo_gastar, color: '#fb923c' },
              { label: '💰 Poupar', value: potes.saldo_poupar, color: '#22c55e' },
              { label: '❤️ Ajudar', value: potes.saldo_ajudar, color: '#ef4444' },
            ].map(p => (
              <View key={p.label} style={styles.poteItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={styles.poteName}>{p.label}</Text>
                  <Text style={styles.poteValue}>{p.value?.toLocaleString() || 0} Kz</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { 
                    width: `${totalSaldo > 0 ? ((p.value || 0) / totalSaldo) * 100 : 0}%`, 
                    backgroundColor: p.color 
                  }]} />
                </View>
              </View>
            ))}
          </View>
        )}

      
        {/* Recent Activity */}
        {historicoRecente.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Atividade Recente</Text>
            {historicoRecente.slice(0, 5).map((item: any) => (
              <View key={item.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: item.valor > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                  <Ionicons name={item.valor > 0 ? 'arrow-up' : 'arrow-down'} size={18} color={item.valor > 0 ? '#22c55e' : '#ef4444'} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.activityDesc}>{item.descricao}</Text>
                  <Text style={styles.activityDate}>{new Date(item.data).toLocaleDateString('pt-AO')}</Text>
                </View>
                <Text style={[styles.activityAmt, { color: item.valor > 0 ? '#22c55e' : '#fff' }]}>
                  {item.valor > 0 ? '+' : ''}{item.valor?.toLocaleString()} Kz
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
   cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
   whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  profileCard: { alignItems: 'center', marginBottom: 24, padding: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  childName: { fontSize: 24, fontWeight: '800', color: '#fff' },
  childLevel: { fontSize: 14, color: '#93c5fd', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', gap: 8 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#fff', textAlign: 'center' },
  statLabel: { fontSize: 11, color: '#94a3b8', textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 16 },
  poteItem: { marginBottom: 16 },
  poteName: { fontSize: 14, color: '#fff', fontWeight: '600' },
  poteValue: { fontSize: 14, color: '#93c5fd' },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  weekBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  weekLabel: { fontSize: 12, color: '#93c5fd', fontWeight: '700' },
  weekTasks: { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 4 },
  weekTasksLabel: { fontSize: 10, color: '#64748b' },
  weekGanhou: { fontSize: 11, color: '#4ade80', fontWeight: '700', marginTop: 2 },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, marginBottom: 10 },
  activityIcon: { padding: 8, borderRadius: 10 },
  activityDesc: { fontSize: 14, color: '#fff', fontWeight: '600' },
  activityDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  activityAmt: { fontSize: 14, fontWeight: '700' },
  errorContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#fff', fontSize: 18, marginBottom: 10 },
  backLink: { color: '#3b82f6', fontSize: 16 },
});
