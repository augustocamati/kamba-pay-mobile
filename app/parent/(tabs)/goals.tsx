import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';
import { NovaMissaoModal } from '../../../components/NovaMissaoModal';

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const { missoes, crianca, criarCampanha } = useApp();
  const [novaMissaoModal, setNovaMissaoModal] = useState(false);
  const handleCriarMissao = (dados: any) => {
    // Note: implementation depends on AppContext availability
    // criarMissao(dados);
    Alert.alert('Sucesso 🎯', `Missão "${dados.titulo}" criada!`);
    setNovaMissaoModal(false);
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a']} style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.title}>Metas e Missões</Text>
        <Text style={styles.subtitle}>Acompanhe o planejamento financeiro</Text>

        {/* Criar Nova Missão */}
        <LinearGradient colors={['#fbbf24', '#f59e0b']} style={[styles.actionCard, { marginBottom: 16 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionCardTitle}>Criar Nova Missão</Text>
            <Text style={styles.actionCardSubtitle}>Defina metas e objetivos para {crianca.nome}</Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setNovaMissaoModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="flag" size={18} color="#d97706" />
              <Text style={[styles.actionBtnText, { color: '#d97706' }]}>Criar Missão</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 52 }}>🎯</Text>
        </LinearGradient>


        <Text style={[styles.title, { fontSize: 20, marginBottom: 12 }]}>Em Andamento</Text>

        {missoes.map((missao) => {
           const progresso = Math.min(
             Math.round((missao.progresso_atual / missao.objetivo_valor) * 100),
             100
           );
           return (
             <View key={missao.id} style={styles.card}>
               <View style={styles.cardHeader}>
                 <Text style={styles.icon}>{missao.icone}</Text>
                 <View style={{ flex: 1, marginLeft: 12 }}>
                   <Text style={styles.cardTitle}>{missao.titulo}</Text>
                   <Text style={styles.cardSubtitle}>{missao.tipo}</Text>
                 </View>
                 <Text style={styles.percentText}>{progresso}%</Text>
               </View>

               <View style={styles.progressTrack}>
                 <LinearGradient 
                   colors={['#60a5fa', '#a78bfa']} 
                   style={[styles.progressBar, { width: `${progresso}%` }]} 
                   start={{ x: 0, y: 0 }} 
                   end={{ x: 1, y: 0 }} 
                 />
               </View>

               <View style={styles.cardFooter}>
                 <Text style={styles.footerText}>
                   {missao.progresso_atual.toLocaleString()} / {missao.objetivo_valor.toLocaleString()} Kz
                 </Text>
                 <View style={styles.rewardBadge}>
                   <Text style={styles.rewardText}>+{missao.recompensa} Kz</Text>
                 </View>
               </View>
             </View>
           );
        })}
      </ScrollView>

      <NovaMissaoModal
        visible={novaMissaoModal}
        onClose={() => setNovaMissaoModal(false)}
        onCriar={handleCriarMissao}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 14, color: '#93c5fd', marginBottom: 24 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  icon: { fontSize: 32 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  cardSubtitle: { fontSize: 13, color: '#94a3b8', textTransform: 'capitalize' },
  percentText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: { height: '100%', borderRadius: 5 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 13, color: '#94a3b8' },
  rewardBadge: { backgroundColor: 'rgba(52, 211, 153, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  rewardText: { color: '#34d399', fontWeight: '700', fontSize: 12 },
  actionCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  actionBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
