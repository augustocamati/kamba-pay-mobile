import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Pressable, Dimensions, Platform, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Users, TrendingUp, Wallet, Award, MapPin, Zap, UserCheck } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api';

const ADMIN_ACTIVITY = [
  { name: 'João Manuel', action: 'Completou Quiz "Poupar é Legal"', time: '1 min atrás', color: '#3B82F6' },
  { name: 'Maria Silva', action: 'Transferiu Kz 5.000 para o filho', time: '18 min atrás', color: '#F59E0B' },
  { name: 'Pedro Kamba', action: 'Assistiu vídeo "O Que é Poupar?"', time: '1 hora atrás', color: '#22C55E' },
  { name: 'Ana Costa', action: 'Criou nova meta de poupança', time: '2 horas atrás', color: '#8B5CF6' },
  { name: 'Carlos Neto', action: 'Concluiu tarefa "Arrumar a Cama"', time: '3 horas atrás', color: '#EF4444' },
];

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

type ChartBar = { label: string; users: number; tx: number };

const MONTHLY: ChartBar[] = [
  { label: 'Jan', users: 180, tx: 320 },
  { label: 'Fev', users: 260, tx: 490 },
  { label: 'Mar', users: 310, tx: 700 },
  { label: 'Abr', users: 310, tx: 1100 },
];

const MAX_TX = Math.max(...MONTHLY.map(m => m.tx));
const MAX_USERS = Math.max(...MONTHLY.map(m => m.users));

const PROVINCES = [
  { label: 'Luanda', pct: 45, color: '#F59E0B' },
  { label: 'Benguela', pct: 18, color: '#EF4444' },
  { label: 'Huíla', pct: 15, color: '#22C55E' },
  { label: 'Huambo', pct: 12, color: '#8B5CF6' },
  { label: 'Outros', pct: 10, color: '#3B82F6' },
];

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboard(),
  });

  const resumo = dashboardData?.resumo || {
    total_responsaveis: 0,
    total_criancas: 0,
    total_tarefas_mes: 0,
    total_missoes_completas: 0,
    total_doacoes: 0,
    total_campanhas_ativas: 0,
  };

  const chartData = useMemo(() => {
    if (!dashboardData?.graficos) return MONTHLY;
    const { tarefas_por_mes, meses } = dashboardData.graficos;
    // Map last 4 months for the chart
    return meses.slice(-4).map((m: string, i: number) => ({
      label: m,
      users: 0, // Not in API summary currently
      tx: tarefas_por_mes[meses.length - 4 + i] || 0,
    }));
  }, [dashboardData]);

  const maxTx = Math.max(...chartData.map((m: any) => m.tx), 1);
  const maxUsers = Math.max(...chartData.map((m: any) => m.users), 1);

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={['#0D1526', '#111C30']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSub}>Visão geral da plataforma</Text>
          </View>
          <View style={styles.adminPill}>
            <UserCheck size={20} color="#FF8C00" />
            <View>
              <Text style={styles.adminPillName}>Admin</Text>
              <Text style={styles.adminPillRole}>Super Admin</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FF8C00" />
          </View>
        ) : (
          <>
            {/* KPI Cards */}
            <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.kpiGrid}>
              <KpiCard
                Icon={Users} label="Pais Registados" value={String(resumo.total_responsaveis)}
                change="Total" color="#3B82F6" colorSoft="rgba(59,130,246,0.15)"
              />
              <KpiCard
                Icon={TrendingUp} label="Crianças Ativas" value={String(resumo.total_criancas)}
                change="Total" color="#F59E0B" colorSoft="rgba(245,158,11,0.15)"
              />
              <KpiCard
                Icon={Wallet} label="Doações (Kz)" value={resumo.total_doacoes.toLocaleString()}
                change="Total" color="#22C55E" colorSoft="rgba(34,197,94,0.15)"
              />
              <KpiCard
                Icon={Award} label="Missões Concluídas" value={String(resumo.total_missoes_completas)}
                change="Total" color="#8B5CF6" colorSoft="rgba(139,92,246,0.15)"
              />
            </Animated.View>

            {/* Growth Chart */}
            <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.chartCard}>
              <View style={styles.sectionHeaderRow}>
                <TrendingUp size={18} color="#F0F4FF" />
                <Text style={styles.sectionTitle}>Atividade de Tarefas</Text>
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.legendLabel}>Tarefas</Text>
                </View>
              </View>

              <View style={styles.barChart}>
                {chartData.map((m, i) => (
                  <View key={i} style={styles.barGroup}>
                    <View style={styles.barsRow}>
                      {/* Tx bar */}
                      <View style={styles.barColumn}>
                        <Animated.View
                          entering={FadeInUp.delay(360 + i * 80).duration(500)}
                          style={[
                            styles.bar,
                            { height: (m.tx / maxTx) * 100, backgroundColor: '#F59E0B' },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.barLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </>
        )}

        {/* Province Distribution */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.chartCard}>
          <View style={styles.sectionHeaderRow}>
            <MapPin size={18} color="#F0F4FF" />
            <Text style={styles.sectionTitle}>Distribuição por Província</Text>
          </View>
          <View style={styles.provinceList}>
            {PROVINCES.map((p, i) => (
              <View key={i} style={styles.provinceRow}>
                <View style={styles.provinceLabelRow}>
                  <View style={[styles.provinceDot, { backgroundColor: p.color }]} />
                  <Text style={styles.provinceLabel}>{p.label}</Text>
                </View>
                <View style={styles.provinceBarWrap}>
                  <Animated.View
                    entering={FadeInUp.delay(400 + i * 60).duration(500)}
                    style={[styles.provinceBar, { width: `${p.pct}%` as any, backgroundColor: p.color }]}
                  />
                </View>
                <Text style={styles.provincePct}>{p.pct}%</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.activityCard}>
          <View style={styles.sectionHeaderRow}>
            <Zap size={18} color="#F0F4FF" />
            <Text style={styles.sectionTitle}>Atividade Recente</Text>
          </View>
          {ADMIN_ACTIVITY.map((item, i) => (
            <View key={i} style={[styles.activityItem, i < ADMIN_ACTIVITY.length - 1 && styles.activityBorder]}>
              <View style={[styles.activityAvatar, { backgroundColor: item.color }]}>
                <Text style={styles.activityAvatarText}>{item.name[0]}</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{item.name}</Text>
                <Text style={styles.activityDesc}>{item.action}</Text>
              </View>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* ── KPI Card ───────────────────────────── */
function KpiCard({
  Icon, label, value, change, color, colorSoft,
}: {
  Icon: any; label: string; value: string;
  change: string; color: string; colorSoft: string;
}) {
  return (
    <View style={[styles.kpiCard, { width: CARD_W }]}>
      <View style={[styles.kpiIconWrap, { backgroundColor: colorSoft }]}>
        <Icon size={22} color={color} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      <View style={[styles.kpiBadge, { backgroundColor: colorSoft }]}>
        <Text style={[styles.kpiBadgeText, { color }]}>{change}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1222' },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 24, fontFamily: 'Nunito_800ExtraBold', color: '#F0F4FF' },
  headerSub: { fontSize: 12, color: '#4A5F8A', fontFamily: 'Nunito_400Regular', marginTop: 2 },

  adminPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,140,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,140,0,0.2)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  adminPillIcon: { fontSize: 22 },
  adminPillName: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#FF8C00' },
  adminPillRole: { fontSize: 10, color: '#4A5F8A', fontFamily: 'Nunito_400Regular' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  kpiCard: {
    backgroundColor: '#111C30',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 6,
  },
  kpiIconWrap: {
    width: 44, height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiEmoji: { fontSize: 22 },
  kpiValue: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: '#F0F4FF' },
  kpiLabel: { fontSize: 11, fontFamily: 'Nunito_400Regular', color: '#4A5F8A', lineHeight: 15 },
  kpiBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  kpiBadgeText: { fontSize: 11, fontFamily: 'Nunito_700Bold' },

  // Charts
  chartCard: {
    backgroundColor: '#111C30',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#F0F4FF' },

  chartLegend: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: '#8FA1C7', fontFamily: 'Nunito_400Regular' },

  barChart: {
    flexDirection: 'row',
    gap: 8,
    height: 120,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barGroup: { flex: 1, alignItems: 'center', gap: 6 },
  barsRow: { flexDirection: 'row', gap: 4, alignItems: 'flex-end', height: 100 },
  barColumn: { width: 18, justifyContent: 'flex-end', height: 100 },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, color: '#4A5F8A', fontFamily: 'Nunito_600SemiBold' },

  // Province
  provinceList: { gap: 12 },
  provinceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  provinceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 90 },
  provinceDot: { width: 8, height: 8, borderRadius: 4 },
  provinceLabel: { fontSize: 12, color: '#8FA1C7', fontFamily: 'Nunito_400Regular', flex: 1 },
  provinceBarWrap: {
    flex: 1,
    height: 8, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4, overflow: 'hidden',
  },
  provinceBar: { height: '100%', borderRadius: 4 },
  provincePct: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#F0F4FF', width: 34, textAlign: 'right' },

  // Activity
  activityCard: {
    backgroundColor: '#111C30',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  activityAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  activityAvatarText: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: '#F0F4FF' },
  activityDesc: { fontSize: 12, color: '#8FA1C7', fontFamily: 'Nunito_400Regular', marginTop: 2 },
  activityTime: { fontSize: 11, color: '#4A5F8A', fontFamily: 'Nunito_400Regular' },
});
