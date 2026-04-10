import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';
import { CriarCampanha } from '../../../components/CriarCampanha';

export default function CampaignsScreen() {
  const insets = useSafeAreaInsets();
  const { campanhas, criarCampanha, isLoading } = useApp();
  const [novaCampanhaModal, setNovaCampanhaModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCriarCampanha = async (dados: any) => {
    setCreating(true);
    try {
      await criarCampanha(dados);
      Alert.alert('Sucesso ❤️', `${dados.titulo} foi criada com sucesso!`);
      setNovaCampanhaModal(false);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível criar a campanha.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a']} style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.title}>Campanhas de Solidariedade</Text>
        <Text style={styles.subtitle}>Ensine o valor de ajudar o próximo</Text>

        {/* Criar Nova Campanha */}
        <LinearGradient colors={['#ec4899', '#dc2626']} style={[styles.actionCard, { marginBottom: 24 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionCardTitle}>Criar Campanha</Text>
            <Text style={styles.actionCardSubtitle}>Ajude novas causas sociais</Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setNovaCampanhaModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="heart" size={18} color="#be185d" />
              <Text style={[styles.actionBtnText, { color: '#be185d' }]}>Criar Agora</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 52 }}>🌍</Text>
        </LinearGradient>

        <Text style={[styles.title, { fontSize: 20, marginBottom: 12 }]}>Campanhas Ativas</Text>

        {isLoading ? (
          <ActivityIndicator color="#ec4899" style={{ marginTop: 30 }} />
        ) : campanhas.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 40 }}>🌍</Text>
            <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 14, textAlign: 'center' }}>
              Nenhuma campanha ativa.{'\n'}Crie uma agora!
            </Text>
          </View>
        ) : (
          campanhas.map((campanha) => {
            const metaValor = campanha.meta_valor || 10000;
            const valorArrecadado = campanha.valor_arrecadado || 0;
            const progresso = Math.min(Math.round((valorArrecadado / metaValor) * 100), 100);
            return (
              <View key={campanha.id} style={styles.card}>
                {campanha.imagem_url ? (
                  <Image source={{ uri: campanha.imagem_url }} style={styles.cardImage} />
                ) : (
                  <LinearGradient colors={['#ec4899', '#dc2626']} style={[styles.cardImage, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 48 }}>🌍</Text>
                  </LinearGradient>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.cardOrg}>{campanha.organizacao}</Text>
                  <Text style={styles.cardTitle}>{campanha.titulo}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{campanha.descricao}</Text>
                  
                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressBar, { width: `${progresso}%` }]} />
                    </View>
                    <Text style={styles.percentText}>{progresso}%</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.footerText}>Meta: {metaValor.toLocaleString()} Kz</Text>
                    <Text style={styles.raisedText}>{valorArrecadado.toLocaleString()} Kz arrecadados</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <CriarCampanha
        open={novaCampanhaModal}
        onOpenChange={setNovaCampanhaModal}
        onCriar={handleCriarCampanha}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 14, color: '#93c5fd', marginBottom: 24 },
  actionCard: {
    borderRadius: 20, padding: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  actionCardTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  actionCardSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 14 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 16,
    alignSelf: 'flex-start', gap: 6,
  },
  actionBtnText: { fontWeight: '700', fontSize: 14 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20, overflow: 'hidden', marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  cardImage: { width: '100%', height: 150 },
  cardBody: { padding: 16 },
  cardOrg: { fontSize: 12, color: '#f472b6', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#94a3b8', marginBottom: 16 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  progressTrack: {
    flex: 1, height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4, overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: '#ec4899', borderRadius: 4 },
  percentText: { fontSize: 12, fontWeight: '700', color: '#fff', minWidth: 35 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 12, color: '#94a3b8' },
  raisedText: { fontSize: 12, color: '#fff', fontWeight: '600' },
});
