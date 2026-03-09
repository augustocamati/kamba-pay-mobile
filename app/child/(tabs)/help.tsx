import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';

export default function ChildHelpScreen() {
  const insets = useSafeAreaInsets();
  const { campanhas, crianca, realizarDoacao } = useApp();

  const handleDoar = (campanhaId: string, titulo: string) => {
    Alert.alert(
      "Fazer Doação ❤️",
      `Deseja doar 200 Kz para a campanha "${titulo}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Doar", 
          onPress: () => {
            if (crianca.potes.saldo_ajudar >= 200) {
              realizarDoacao(campanhaId, 200);
              Alert.alert("Sucesso! ✨", "Sua doação foi realizada. Você é um herói!");
            } else {
              Alert.alert("Saldo Insuficiente", "Seu pote Ajudar não tem saldo suficiente.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Campanhas de Solidariedade ❤️</Text>
        <Text style={styles.subtitle}>Use seu Pote Ajudar para fazer a diferença!</Text>

        {/* Available Balance Card */}
        {crianca.potes.config?.ajudar && (
          <View style={[styles.balanceCard, { backgroundColor: crianca.potes.config.ajudar.cor[0] }]}>
            <View>
              <Text style={styles.balanceLabel}>Pote Ajudar Disponível</Text>
              <Text style={styles.balanceValue}>{crianca.potes.saldo_ajudar.toLocaleString()} Kz</Text>
            </View>
            <Ionicons name="heart" size={60} color="rgba(255,255,255,0.3)" />
          </View>
        )}

        {/* Campaigns */}
        {campanhas.map(campanha => {
          const percent = Math.round((campanha.valor_arrecadado / campanha.meta_valor) * 100);
          return (
            <View key={campanha.id} style={styles.card}>
              <Image source={{ uri: campanha.imagem_url }} style={styles.cardImage} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{campanha.titulo}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{campanha.descricao}</Text>
                <Text style={styles.cardOrg}>Por: {campanha.organizacao}</Text>

                <View style={[styles.progressHeader, { marginTop: 16 }]}>
                  <Text style={styles.progressLabel}>Arrecadado</Text>
                  <Text style={styles.progressValue}>
                    {campanha.valor_arrecadado.toLocaleString()} / {campanha.meta_valor.toLocaleString()} Kz
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
                  style={styles.donateButton}
                  onPress={() => handleDoar(campanha.id, campanha.titulo)}
                >
                  <Ionicons name="heart" size={18} color="#fff" />
                  <Text style={styles.donateButtonText}>Fazer Doação</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFCE8' },
  scrollContent: { paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: '900', color: '#1E293B', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  balanceCard: {
    backgroundColor: '#FFBD00',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  balanceValue: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
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
  progressFill: { height: '100%', backgroundColor: '#000', borderRadius: 5 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  metaText: { fontSize: 12, fontWeight: '700', color: '#45D37B' },
  donateButton: {
    backgroundColor: '#2965FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  donateButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
