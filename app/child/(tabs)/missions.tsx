import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { router } from 'expo-router';

const CATEGORIES = [
  { id: 'todas', label: 'Todas', icon: 'apps' },
  { id: 'poupanca', label: 'Poupança', icon: 'trending-up' },
  { id: 'saude', label: 'Saúde', icon: 'heart' },
  { id: 'social', label: 'Social', icon: 'hand-heart' },
  { id: 'estudo', label: 'Estudo', icon: 'book' },
  { id: 'comportamento', label: 'Comportamento', icon: 'star' },
];

export default function ChildMissionsScreen() {
  const insets = useSafeAreaInsets();
  const { missoes } = useApp();
  const [activeTab, setActiveTab] = useState('todas');
  const webTop = Platform.OS === 'web' ? 67 : 0;
console.log("missoes",missoes);
  const filteredMissions = activeTab === 'todas' 
    ? missoes 
    : missoes.filter(m => m.tipo === activeTab);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (insets.top || webTop) + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FF6B00" />
        </Pressable>
        <Text style={styles.topBarTitle}>Missões 🎯</Text>
        <View style={{ width: 40 }} />
      </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabsContainer}
        >
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              onPress={() => setActiveTab(cat.id)}
              style={[
                styles.tab,
                activeTab === cat.id && styles.tabActive
              ]}
            >
              <MaterialCommunityIcons 
                name={cat.icon as any} 
                size={18} 
                color={activeTab === cat.id ? '#fff' : '#64748B'} 
              />
              <Text style={[
                styles.tabLabel,
                activeTab === cat.id && styles.tabLabelActive
              ]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredMissions.map(mission => {
         
          const colors = mission.cor;
          const percent = Math.round((mission.progresso_atual / mission.objetivo_valor) * 100);
          const missing = mission.objetivo_valor - mission.progresso_atual;

          return (
            <View key={mission.id} style={[styles.missionCard, { backgroundColor: colors[0] }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.missionIconEmoji}>{mission.icone}</Text>
                <View style={styles.typeBadge}>
                   <Text style={styles.typeText}>{mission.tipo}</Text>
                </View>
              </View>

              <Text style={styles.missionTitle}>{mission.titulo}</Text>
              <Text style={styles.missionDesc}>{mission.descricao}</Text>

              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  {mission.progresso_atual.toLocaleString()} / {mission.objetivo_valor.toLocaleString()} Kz
                </Text>
                <Text style={styles.percentText}>{percent}%</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.max(percent, 2)}%` }]} />
              </View>

              <Text style={styles.missingHint}>
                Faltam {missing.toLocaleString()} Kz para completar
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFCE8' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF5E8', alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#1A1A2E' },
  tabsWrap: {},
  tabsContainer: { paddingHorizontal: 20, gap: 10, paddingBottom: 10 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabActive: { backgroundColor: '#FF6F00', borderColor: '#FF6F00' },
  tabLabel: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  tabLabelActive: { color: '#fff' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  missionCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  missionIconEmoji: { fontSize: 32 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  missionTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 6 },
  missionDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600', marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  percentText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  progressTrack: { height: 12, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 6 },
  missingHint: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700', textAlign: 'center' },
});
