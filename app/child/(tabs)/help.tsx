import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Alert, ActivityIndicator, Pressable, Platform, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { router } from 'expo-router';

export default function ChildHelpScreen() {
  const insets = useSafeAreaInsets();
  const { campanhas, crianca, realizarDoacao, isLoading } = useApp();
  const [donating, setDonating] = useState<string | null>(null);
  const [selectedCampanha, setSelectedCampanha] = useState<{ id: string; titulo: string } | null>(null);
  const [valorDoacao, setValorDoacao] = useState('');

  const handleDoar = (campanhaId: string, titulo: string) => {
    setSelectedCampanha({ id: campanhaId, titulo });
    setValorDoacao('');
  };

  const confirmarDoacao = async () => {
    if (!selectedCampanha) return;
    const valor = Number(valorDoacao);

    if (!Number.isFinite(valor) || valor <= 0) {
      Alert.alert('Valor inválido', 'Escolhe um valor maior que zero.');
      return;
    }
    if (valor > crianca.potes.saldo_ajudar) {
      Alert.alert('Saldo insuficiente', 'O teu pote Ajudar não tem saldo suficiente.');
      return;
    }

    setDonating(selectedCampanha.id);
    try {
      await realizarDoacao(selectedCampanha.id, valor);
      setSelectedCampanha(null);
      setValorDoacao('');
      Alert.alert('Sucesso! ✨', `Doação de ${valor.toLocaleString()} Kz realizada com sucesso.`);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível completar a doação.');
    } finally {
      setDonating(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (insets.top || (Platform.OS === 'web' ? 67 : 0)) + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FF6B00" />
        </Pressable>
        <Text style={styles.topBarTitle}>Ajudar ❤️</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Usa o teu Pote Ajudar para fazer a diferença!</Text>

        {/* Available Balance Card */}
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Pote Ajudar Disponível</Text>
            <Text style={styles.balanceValue}>{crianca.potes.saldo_ajudar.toLocaleString()} Kz</Text>
          </View>
          <Ionicons name="heart" size={60} color="rgba(255,255,255,0.3)" />
        </View>

        {/* Campaigns */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 40 }} />
        ) : campanhas.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 40 }}>🌍</Text>
            <Text style={{ color: '#64748B', marginTop: 12, fontSize: 14, textAlign: 'center' }}>
              Ainda não há campanhas disponíveis.
            </Text>
          </View>
        ) : (
          campanhas.map(campanha => {
            const metaValor = campanha.meta_valor || 10000;
            const valorArrecadado = campanha.valor_arrecadado || 0;
            const percent = Math.min(Math.round((valorArrecadado / metaValor) * 100), 100);
            const isDonating = donating === campanha.id;
            return (
              <View key={campanha.id} style={styles.card}>
                {campanha.imagem_url ? (
                  <Image source={{ uri: campanha.imagem_url }} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImage, { backgroundColor: '#FFE4E1', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 48 }}>🌍</Text>
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{campanha.titulo}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{campanha.descricao}</Text>
                  <Text style={styles.cardOrg}>Por: {campanha.organizacao}</Text>

                  <View style={[styles.progressHeader, { marginTop: 16 }]}>
                    <Text style={styles.progressLabel}>Arrecadado</Text>
                    <Text style={styles.progressValue}>
                      {valorArrecadado.toLocaleString()} / {metaValor.toLocaleString()} Kz
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${percent}%` }]} />
                  </View>
                  <View style={styles.metaBadge}>
                    <MaterialCommunityIcons name="trending-up" size={16} color="#45D37B" />
                    <Text style={styles.metaText}>{percent}% da meta alcançada</Text>
                  </View>

                  <Pressable 
                    style={[styles.donateButton, isDonating && { opacity: 0.7 }]}
                    onPress={() => !isDonating && handleDoar(campanha.id, campanha.titulo)}
                    disabled={isDonating}
                  >
                    {isDonating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="heart" size={18} color="#fff" />
                        <Text style={styles.donateButtonText}>Fazer Doação (200 Kz)</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={!!selectedCampanha} transparent animationType="slide" onRequestClose={() => setSelectedCampanha(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Escolher valor da doação</Text>
            <Text style={styles.modalCampanha}>{selectedCampanha?.titulo}</Text>
            <Text style={styles.modalSaldo}>Saldo no pote Ajudar: {crianca.potes.saldo_ajudar.toLocaleString()} Kz</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Quanto queres doar? (Kz)"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={valorDoacao}
              onChangeText={setValorDoacao}
            />
            <View style={styles.suggestedRow}>
              {[100, 200, 500, 1000].map((v) => (
                <Pressable
                  key={v}
                  style={[styles.suggestedBtn, v > crianca.potes.saldo_ajudar && { opacity: 0.4 }]}
                  onPress={() => setValorDoacao(String(v))}
                  disabled={v > crianca.potes.saldo_ajudar}
                >
                  <Text style={styles.suggestedText}>{v} Kz</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setSelectedCampanha(null)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmBtn, (!!donating || !valorDoacao) && { opacity: 0.7 }]}
                onPress={confirmarDoacao}
                disabled={!!donating || !valorDoacao}
              >
                {donating ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmBtnText}>Doar agora</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFCE8' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FFFCE8',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF5E8', alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#1A1A2E' },
  scrollContent: { paddingHorizontal: 20 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  balanceCard: {
    backgroundColor: '#FF6B00',
    borderRadius: 24, padding: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  balanceLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  balanceValue: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 28, overflow: 'hidden', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3,
  },
  cardImage: { width: '100%', height: 180 },
  cardBody: { padding: 20 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  cardDesc: { fontSize: 14, color: '#64748B', marginTop: 6, lineHeight: 20 },
  cardOrg: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  progressValue: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  progressTrack: { height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#FF6B00', borderRadius: 5 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  metaText: { fontSize: 12, fontWeight: '700', color: '#45D37B' },
  donateButton: {
    backgroundColor: '#2965FF', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 14, borderRadius: 16, gap: 8,
  },
  donateButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  modalCampanha: { fontSize: 14, fontWeight: '700', color: '#334155' },
  modalSaldo: { fontSize: 13, color: '#64748B' },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    marginTop: 4,
  },
  suggestedRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  suggestedBtn: { backgroundColor: '#F8FAFC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  suggestedText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  cancelBtnText: { color: '#64748B', fontWeight: '700' },
  confirmBtn: { flex: 1.5, backgroundColor: '#2563EB', borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  confirmBtnText: { color: '#fff', fontWeight: '800' },
});
