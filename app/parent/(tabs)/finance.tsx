import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const { crianca, historico } = useApp();

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a']} style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.title}>Finanças</Text>
        <Text style={styles.subtitle}>Gestão de dinheiro e histórico</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Text style={styles.balanceValue}>{crianca.potes.total.toLocaleString()} Kz</Text>
          <View style={styles.potesRow}>
            <View style={styles.poteItem}>
              <View style={[styles.poteDot, { backgroundColor: '#fb923c' }]} />
              <Text style={styles.poteLabel}>Gastar:</Text>
              <Text style={styles.poteValue}>{crianca.potes.saldo_gastar} Kz</Text>
            </View>
            <View style={styles.poteItem}>
              <View style={[styles.poteDot, { backgroundColor: '#4ade80' }]} />
              <Text style={styles.poteLabel}>Poupar:</Text>
              <Text style={styles.poteValue}>{crianca.potes.saldo_poupar} Kz</Text>
            </View>
            <View style={styles.poteItem}>
              <View style={[styles.poteDot, { backgroundColor: '#facc15' }]} />
              <Text style={styles.poteLabel}>Ajudar:</Text>
              <Text style={styles.poteValue}>{crianca.potes.saldo_ajudar} Kz</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Histórico Recente</Text>
        {historico.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.historyIconBox}>
               <Ionicons 
                name={item.tipo === 'tarefa' ? 'cash' : item.tipo === 'compra' ? 'cart' : 'heart'} 
                size={20} 
                color="#fff" 
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.historyDesc}>{item.descricao}</Text>
              <Text style={styles.historyDate}>{new Date(item.data).toLocaleDateString('pt-AO')}</Text>
            </View>
            <Text style={[styles.historyValue, { color: item.valor > 0 ? '#4ade80' : '#ef4444' }]}>
               {item.valor > 0 ? '+' : ''}{item.valor} Kz
            </Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 14, color: '#93c5fd', marginBottom: 24 },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  balanceLabel: { fontSize: 14, color: '#93c5fd', marginBottom: 8 },
  balanceValue: { fontSize: 34, fontWeight: '900', color: '#fff', marginBottom: 24 },
  potesRow: { gap: 10 },
  poteItem: { flexDirection: 'row', alignItems: 'center' },
  poteDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  poteLabel: { fontSize: 13, color: '#94a3b8', flex: 1 },
  poteValue: { fontSize: 14, fontWeight: '700', color: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 16 },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  historyIconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  historyDesc: { fontSize: 15, fontWeight: '700', color: '#fff' },
  historyDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  historyValue: { fontSize: 15, fontWeight: '800' },
});
