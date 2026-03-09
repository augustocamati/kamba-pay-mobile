import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Image, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const CAUSA_COLORS: Record<string, [string, string]> = {
  educacao:    ['#3b82f6', '#2563eb'],
  saude:       ['#22c55e', '#16a34a'],
  meio_ambiente: ['#10b981', '#059669'],
  default:     ['#a855f7', '#7c3aed'],
};

const VALORES_SUGERIDOS = [100, 250, 500, 1000];

export function CampanhasScreen() {
  const { campanhas, crianca, realizarDoacao } = useApp();
  const [doacaoModal, setDoacaoModal] = useState<string | null>(null);
  const [valorDoacao, setValorDoacao] = useState('');

  const campanhaAtiva = campanhas.find((c) => c.id === doacaoModal);

  const handleDoacao = () => {
    const valor = parseFloat(valorDoacao);
    if (isNaN(valor) || valor <= 0) {
      Alert.alert('Valor inválido!', 'Por favor, insira um valor válido.');
      return;
    }
    if (valor > crianca.potes.saldo_ajudar) {
      Alert.alert('Saldo insuficiente!', `Você tem apenas ${crianca.potes.saldo_ajudar} Kz no pote Ajudar.`);
      return;
    }
    realizarDoacao(doacaoModal!, valor);
    Alert.alert('Doação realizada! ❤️', `Você doou ${valor} Kz. Parabéns pela solidariedade!`);
    setValorDoacao('');
    setDoacaoModal(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff7ed' }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>Campanhas de Solidariedade ❤️</Text>
        <Text style={styles.subtitle}>Use seu Pote Ajudar para fazer a diferença!</Text>

        {/* Saldo Disponível */}
        <LinearGradient colors={['#facc15', '#eab308']} style={styles.saldoCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View>
            <Text style={styles.saldoLabel}>Pote Ajudar Disponível</Text>
            <Text style={styles.saldoValue}>{crianca.potes.saldo_ajudar.toLocaleString()} Kz</Text>
          </View>
          <Ionicons name="heart" size={48} color="rgba(255,255,255,0.3)" />
        </LinearGradient>

        {/* Lista de Campanhas */}
        {campanhas.filter((c) => c.ativa).map((campanha) => {
          const percentual = Math.min(Math.round((campanha.valor_arrecadado / campanha.meta_valor) * 100), 100);
          const colors = CAUSA_COLORS[campanha.causa] ?? CAUSA_COLORS.default;

          return (
            <View key={campanha.id} style={styles.campanhaCard}>
              {campanha.imagem_url && (
                <Image source={{ uri: campanha.imagem_url }} style={styles.campanhaImg} resizeMode="cover" />
              )}
              <View style={styles.campanhaBody}>
                <Text style={styles.campanhaTitle}>{campanha.titulo}</Text>
                <Text style={styles.campanhaDesc}>{campanha.descricao}</Text>
                <Text style={styles.campanhaOrg}>Por: {campanha.organizacao}</Text>

                {/* Progresso */}
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Arrecadado</Text>
                  <Text style={styles.progressValue}>
                    {campanha.valor_arrecadado.toLocaleString()} / {campanha.meta_valor.toLocaleString()} Kz
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={colors}
                    style={[styles.progressFill, { width: `${Math.max(percentual, 2)}%` }]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <Ionicons name="trending-up" size={14} color="#16a34a" />
                  <Text style={styles.percentText}>{percentual}% da meta alcançada</Text>
                </View>

                {/* Botão Doação */}
                <TouchableOpacity
                  onPress={() => { setDoacaoModal(campanha.id); setValorDoacao(''); }}
                  activeOpacity={0.85}
                  style={{ marginTop: 16 }}
                >
                  <LinearGradient colors={colors} style={styles.doacaoBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Ionicons name="heart" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.doacaoBtnText}>Fazer Doação</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Mensagem de Incentivo */}
        <LinearGradient colors={['#fce7f3', '#f3e8ff']} style={styles.incentivo}>
          <Text style={{ fontSize: 32 }}>🌟</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.incentivoTitle}>Seja um Herói!</Text>
            <Text style={styles.incentivoText}>
              Cada doação ajuda a fazer um mundo melhor. Continue contribuindo e complete suas missões de solidariedade!
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>

      {/* Modal de Doação */}
      <Modal visible={!!doacaoModal} transparent animationType="slide" onRequestClose={() => setDoacaoModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Fazer Doação ❤️</Text>
              <TouchableOpacity onPress={() => setDoacaoModal(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {campanhaAtiva && (
              <>
                <Text style={styles.modalLabel}>Campanha:</Text>
                <Text style={styles.modalCampanha}>{campanhaAtiva.titulo}</Text>

                <Text style={styles.modalLabel}>Saldo disponível no Pote Ajudar:</Text>
                <Text style={styles.modalSaldo}>{crianca.potes.saldo_ajudar.toLocaleString()} Kz</Text>

                <Text style={[styles.modalLabel, { marginTop: 12 }]}>Quanto você quer doar?</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Digite o valor em Kz"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={valorDoacao}
                  onChangeText={setValorDoacao}
                />

                <Text style={styles.modalLabel}>Valores sugeridos:</Text>
                <View style={styles.sugeridosRow}>
                  {VALORES_SUGERIDOS.map((v) => (
                    <TouchableOpacity
                      key={v}
                      onPress={() => setValorDoacao(String(v))}
                      disabled={v > crianca.potes.saldo_ajudar}
                      style={[
                        styles.sugeridoBtn,
                        v > crianca.potes.saldo_ajudar && { opacity: 0.4 },
                      ]}
                    >
                      <Text style={styles.sugeridoText}>{v} Kz</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={handleDoacao} activeOpacity={0.85}>
                  <LinearGradient colors={['#eab308', '#ca8a04']} style={styles.confirmBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={styles.confirmBtnText}>Confirmar Doação</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#1f2937', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  saldoCard: {
    borderRadius: 24, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24,
  },
  saldoLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  saldoValue: { fontSize: 28, fontWeight: '800', color: '#fff' },
  campanhaCard: {
    backgroundColor: '#fff', borderRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    marginBottom: 20, overflow: 'hidden',
  },
  campanhaImg: { width: '100%', height: 160 },
  campanhaBody: { padding: 20 },
  campanhaTitle: { fontSize: 18, fontWeight: '800', color: '#1f2937', marginBottom: 6 },
  campanhaDesc: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  campanhaOrg: { fontSize: 12, color: '#9ca3af', marginBottom: 14 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  progressValue: { fontSize: 13, fontWeight: '700', color: '#1f2937' },
  progressTrack: { backgroundColor: '#e5e7eb', borderRadius: 99, height: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  percentText: { fontSize: 12, fontWeight: '600', color: '#16a34a' },
  doacaoBtn: { borderRadius: 16, paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  doacaoBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  incentivo: {
    borderRadius: 24, padding: 20,
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    borderWidth: 2, borderColor: '#f9a8d4',
  },
  incentivoTitle: { fontSize: 15, fontWeight: '800', color: '#1f2937', marginBottom: 6 },
  incentivoText: { fontSize: 13, color: '#374151' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937' },
  modalCloseBtn: { backgroundColor: '#f1f5f9', borderRadius: 10, padding: 8 },
  modalLabel: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  modalCampanha: { fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  modalSaldo: { fontSize: 24, fontWeight: '800', color: '#ca8a04', marginBottom: 12 },
  modalInput: {
    backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 16, color: '#1e293b', marginBottom: 12,
  },
  sugeridosRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  sugeridoBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, paddingVertical: 10, alignItems: 'center',
  },
  sugeridoText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  confirmBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
