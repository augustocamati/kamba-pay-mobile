import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';
import { parentService } from '../../../lib/api';

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const { crianca, dependentes, historico, isLoading } = useApp();
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [childFinance, setChildFinance] = useState<any>(null);
  const [loadingFinance, setLoadingFinance] = useState(false);

  // Default to first child
  useEffect(() => {
    if (dependentes.length > 0 && !selectedChildId) {
      setSelectedChildId(dependentes[0].id);
    }
  }, [dependentes]);

  // Fetch finance data for selected child
  useEffect(() => {
    if (!selectedChildId) return;
    setLoadingFinance(true);
    parentService.getChildFinance(selectedChildId)
      .then(data => setChildFinance(data))
      .catch(e => {
        console.error('Erro ao buscar finanças:', e);
        setChildFinance(null);
      })
      .finally(() => setLoadingFinance(false));
  }, [selectedChildId]);

  const selectedChild = dependentes.find(d => d.id === selectedChildId);
  const potes = childFinance?.potes || selectedChild?.potes || crianca.potes;
  const apiHistorico: any[] = childFinance?.historico || [];

  const getIconForTipo = (tipo: string) => {
    switch (tipo) {
      case 'tarefa': return 'cash';
      case 'compra': return 'cart';
      case 'doacao':
      case 'doar': return 'heart';
      case 'bonus_gestao': return 'star';
      case 'poupar': return 'trending-up';
      default: return 'swap-horizontal';
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a']} style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.title}>Finanças</Text>
        <Text style={styles.subtitle}>Gestão de dinheiro e histórico</Text>

        {/* Child selector */}
        {dependentes.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {dependentes.map(dep => (
              <Text
                key={dep.id}
                onPress={() => setSelectedChildId(dep.id)}
                style={[
                  styles.childChip,
                  selectedChildId === dep.id && styles.childChipActive
                ]}
              >
                {dep.nome}
              </Text>
            ))}
          </ScrollView>
        )}

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Total — {selectedChild?.nome || crianca.nome}</Text>
          <Text style={styles.balanceValue}>{(potes.total || 0).toLocaleString()} Kz</Text>
          <View style={styles.potesRow}>
            {[
              { label: 'Gastar', key: 'saldo_gastar', color: '#fb923c' },
              { label: 'Poupar', key: 'saldo_poupar', color: '#4ade80' },
              { label: 'Ajudar', key: 'saldo_ajudar', color: '#facc15' },
            ].map(p => (
              <View key={p.label} style={styles.poteItem}>
                <View style={[styles.poteDot, { backgroundColor: p.color }]} />
                <Text style={styles.poteLabel}>{p.label}:</Text>
                <Text style={styles.poteValue}>{((potes as any)[p.key] || 0).toLocaleString()} Kz</Text>
              </View>
            ))}
          </View>
          {/* Progress bars */}
          {potes.total > 0 && (
            <View style={{ marginTop: 16 }}>
              <View style={styles.stackedBar}>
                <View style={{ flex: Math.max(potes.saldo_gastar || 0, 0.1), backgroundColor: '#fb923c', borderRadius: 4 }} />
                <View style={{ flex: Math.max(potes.saldo_poupar || 0, 0.1), backgroundColor: '#4ade80', borderRadius: 4 }} />
                <View style={{ flex: Math.max(potes.saldo_ajudar || 0, 0.1), backgroundColor: '#facc15', borderRadius: 4 }} />
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Histórico Recente</Text>

        {loadingFinance ? (
          <ActivityIndicator color="#3b82f6" style={{ marginTop: 20 }} />
        ) : apiHistorico.length > 0 ? (
          apiHistorico.map((item: any, i: number) => (
            <View key={item.id || i} style={styles.historyCard}>
              <View style={styles.historyIconBox}>
                <Ionicons name={getIconForTipo(item.tipo) as any} size={20} color="#fff" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.historyDesc}>{item.descricao}</Text>
                <Text style={styles.historyDate}>
                  {item.data ? new Date(item.data).toLocaleDateString('pt-AO') : ''}
                  {item.pote_afetado ? ` • ${item.pote_afetado}` : ''}
                </Text>
              </View>
              <Text style={[styles.historyValue, { color: item.valor > 0 ? '#4ade80' : '#ef4444' }]}>
                {item.valor > 0 ? '+' : ''}{(item.valor || 0).toLocaleString()} Kz
              </Text>
            </View>
          ))
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="receipt-outline" size={48} color="#334155" />
            <Text style={{ color: '#64748b', marginTop: 12, fontSize: 14 }}>Sem histórico disponível</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 14, color: '#93c5fd', marginBottom: 24 },
  childChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)', color: '#94a3b8',
    fontSize: 13, fontWeight: '600', marginRight: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  childChipActive: {
    backgroundColor: 'rgba(59,130,246,0.25)', color: '#93c5fd',
    borderColor: '#3b82f6',
  },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24, padding: 24, marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  balanceLabel: { fontSize: 13, color: '#93c5fd', marginBottom: 8 },
  balanceValue: { fontSize: 34, fontWeight: '900', color: '#fff', marginBottom: 20 },
  potesRow: { gap: 8 },
  poteItem: { flexDirection: 'row', alignItems: 'center' },
  poteDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  poteLabel: { fontSize: 13, color: '#94a3b8', flex: 1 },
  poteValue: { fontSize: 14, fontWeight: '700', color: '#fff' },
  stackedBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 16 },
  historyCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
    padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  historyIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  historyDesc: { fontSize: 15, fontWeight: '700', color: '#fff' },
  historyDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  historyValue: { fontSize: 15, fontWeight: '800' },
});
