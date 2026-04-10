import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { campaignService } from '@/lib/api';
import { router } from 'expo-router';

export default function ChildHelpScreen() {
  const insets = useSafeAreaInsets();
  const { campanhas, crianca, realizarDoacao, isLoading } = useApp();
  const [donating, setDonating] = useState<string | null>(null);

  const handleDoar = (campanhaId: string, titulo: string) => {
    const valorDoacao = 200;
    Alert.alert(
      "Fazer Doação ❤️",
      `Deseja doar ${valorDoacao} Kz para a campanha "${titulo}"?\n\nPote Ajudar disponível: ${crianca.potes.saldo_ajudar.toLocaleString()} Kz`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Doar",
          style: "default",
          onPress: async () => {
            if (crianca.potes.saldo_ajudar < valorDoacao) {
              Alert.alert("Saldo Insuficiente", "O teu pote Ajudar não tem saldo suficiente.");
              return;
            }
            setDonating(campanhaId);
            try {
              await realizarDoacao(campanhaId, valorDoacao);
              Alert.alert("Sucesso! ✨", "A tua doação foi realizada. És um herói!");
            } catch (e) {
              Alert.alert("Erro", "Não foi possível completar a doação.");
            } finally {
              setDonating(null);
            }
          }
        }
      ]
    );
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
});
