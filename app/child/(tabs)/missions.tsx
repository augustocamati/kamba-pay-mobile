import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { router } from 'expo-router';
import { MascotCompanion } from '@/components/MascotCompanion';
import { ActionSuccessPopup } from '@/components/ActionSuccessPopup';
import { useEffect } from 'react';

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
  const { missoes, updateMissionProgress, crianca } = useApp();
  const [activeTab, setActiveTab] = useState('todas');
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedMission, setCompletedMission] = useState<string | null>(null);
  
  const [missionModal, setMissionModal] = useState<{ visible: boolean; mission: any }>({ visible: false, mission: null });
  const [progressAmount, setProgressAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const webTop = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    const finished = missoes.find(m => m.progresso_atual >= m.objetivo_valor && !m.concluidaAvisada);
    if (finished) {
      setCompletedMission(finished.titulo);
      setShowSuccess(true);
      // To prevent multiple triggers, in a real app we'd mark it as notified
    }
  }, [missoes]);
  
  const filteredMissions = activeTab === 'todas' 
    ? missoes 
    : missoes.filter(m => m.tipo === activeTab);

  const handleContribute = async () => {
    const { mission } = missionModal;
    if (!mission || !progressAmount) return;
    
    const amount = parseFloat(progressAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Aviso', 'Digita um valor válido para contribuir.');
      return;
    }

    if (amount > crianca.potes.saldo_poupar && mission.tipo_label === 'Poupança') {
       Alert.alert('Aviso', 'Não tens saldo suficiente no pote Poupança.');
       return;
    }

    setIsSubmitting(true);
    try {
      await updateMissionProgress(mission.id, amount);
      setMissionModal({ visible: false, mission: null });
      setProgressAmount('');
      Alert.alert('Incrível! 🌟', 'Progresso adicionado com sucesso!');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erro', e.response?.data?.mensagem || 'Não foi possível adicionar o progresso.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
         
          const colors = mission.cor || ['#3b82f6', '#7c3aed'];
          const percent = Math.min(100, Math.round((mission.progresso_atual / mission.objetivo_valor) * 100));
          const missing = Math.max(0, mission.objetivo_valor - mission.progresso_atual);

          return (
            <View key={mission.id} style={[styles.missionCard, { backgroundColor: colors[0] }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.missionIconEmoji}>{mission.icone}</Text>
                <View style={styles.typeBadge}>
                   <Text style={styles.typeText}>{mission.tipo_label || mission.tipo}</Text>
                </View>
              </View>

              <Text style={styles.missionTitle}>{mission.titulo}</Text>
              <Text style={styles.missionDesc}>{mission.descricao}</Text>

              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  {Number(mission.progresso_atual || 0).toFixed(2)} / {Number(mission.objetivo_valor || 0).toFixed(2)} Kz
                </Text>
                <Text style={styles.percentText}>{percent}%</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.max(percent, 2)}%` }]} />
              </View>

              {missing > 0 ? (
                <>
                  <Text style={styles.missingHint}>
                    Faltam {Number(missing || 0).toFixed(2)} Kz para completar
                  </Text>
                  <Pressable 
                    style={styles.contributeBtn} 
                    onPress={() => setMissionModal({ visible: true, mission })}
                  >
                    <Text style={styles.contributeBtnText}>Adicionar Progresso</Text>
                    <Ionicons name="arrow-forward-circle" size={20} color="#FF6B00" />
                  </Pressable>
                </>
              ) : (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  <Text style={styles.completedText}>Missão Concluída!</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <MascotCompanion position="bottom-right" screen="missions" />

      <ActionSuccessPopup
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Missão Completa! 🏆"
        description={`Uau! Completaste a missão "${completedMission}". Estás a tornar-te um mestre das finanças!`}
        icon="trophy"
        buttonText="Incrível! ✨"
      />

      {/* Progress Modal */}
      {missionModal.visible && missionModal.mission && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Adicionar Progresso</Text>
                <Pressable onPress={() => setMissionModal({ visible: false, mission: null })} style={styles.closeModalBtn}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </Pressable>
              </View>
              
              <Text style={styles.modalSubtitle}>
                Quanto desejas contribuir para a missão "{missionModal.mission.titulo}"?
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.currencyPrefix}>Kz</Text>
                <TextInput
                  style={styles.amountInput}
                  value={progressAmount}
                  onChangeText={setProgressAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  autoFocus
                />
              </View>

              <Pressable 
                style={[styles.confirmBtn, (!progressAmount || isSubmitting) && { opacity: 0.7 }]} 
                onPress={handleContribute}
                disabled={!progressAmount || isSubmitting}
              >
                <Text style={styles.confirmBtnText}>{isSubmitting ? 'Aguarde...' : 'Confirmar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

import { TextInput } from 'react-native';

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
  topBarTitle: { fontSize: 18, fontFamily: 'Fredoka_700Bold', color: '#1A1A2E' },
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
  tabLabel: { fontSize: 13, fontFamily: 'Fredoka_700Bold', color: '#64748B' },
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
  typeText: { color: '#fff', fontSize: 12, fontFamily: 'Fredoka_700Bold' },
  missionTitle: { color: '#fff', fontSize: 20, fontFamily: 'Fredoka_700Bold', marginBottom: 6 },
  missionDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontFamily: 'Fredoka_600SemiBold', marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressText: { color: '#fff', fontSize: 14, fontFamily: 'Fredoka_700Bold' },
  percentText: { color: '#fff', fontSize: 18, fontFamily: 'Fredoka_700Bold' },
  progressTrack: { height: 12, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 6 },
  missingHint: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Fredoka_700Bold', textAlign: 'center' },
  contributeBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff', paddingVertical: 12, borderRadius: 16, marginTop: 16
  },
  contributeBtnText: { color: '#FF6B00', fontSize: 14, fontFamily: 'Fredoka_700Bold' },
  completedBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 12, borderRadius: 16, marginTop: 16
  },
  completedText: { color: '#fff', fontSize: 14, fontFamily: 'Fredoka_700Bold' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', borderRadius: 28, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontFamily: 'Fredoka_700Bold', color: '#1E293B' },
  closeModalBtn: { backgroundColor: '#F1F5F9', padding: 8, borderRadius: 20 },
  modalSubtitle: { fontSize: 15, fontFamily: 'Fredoka_500Medium', color: '#64748B', marginBottom: 24, lineHeight: 22 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 20, marginBottom: 24 },
  currencyPrefix: { fontSize: 18, fontFamily: 'Fredoka_700Bold', color: '#94A3B8', marginRight: 10 },
  amountInput: { flex: 1, fontSize: 24, fontFamily: 'Fredoka_700Bold', color: '#1E293B', paddingVertical: 16 },
  confirmBtn: { backgroundColor: '#FF6B00', borderRadius: 20, paddingVertical: 16, alignItems: 'center', shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Fredoka_700Bold' }
});
