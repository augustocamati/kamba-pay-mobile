import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface NovaMissaoModalProps {
  visible: boolean;
  onClose: () => void;
  onCriar: (dados: any) => void;
}

export function NovaMissaoModal({ visible, onClose, onCriar }: NovaMissaoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [recompensa, setRecompensa] = useState('');
  const [tipo, setTipo] = useState('poupanca');

  const handleCriar = () => {
    onCriar({
      titulo,
      objetivo_valor: parseFloat(valor),
      recompensa: parseFloat(recompensa),
      tipo,
      icone: tipo === 'poupanca' ? '💰' : '🎯',
    });
    setTitulo('');
    setValor('');
    setRecompensa('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Missão</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Título da Missão</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Comprar Bicicleta"
              placeholderTextColor="#94a3b8"
              value={titulo}
              onChangeText={setTitulo}
            />

            <Text style={styles.fieldLabel}>Valor do Objetivo (Kz)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="15000"
              placeholderTextColor="#94a3b8"
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Recompensa ao completar (Kz)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="500"
              placeholderTextColor="#94a3b8"
              value={recompensa}
              onChangeText={setRecompensa}
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Tipo de Missão</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.chip, tipo === 'poupanca' && styles.chipActive]}
                onPress={() => setTipo('poupanca')}
              >
                <Text style={[styles.chipText, tipo === 'poupanca' && styles.chipTextActive]}>💰 Poupança</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, tipo === 'estudo' && styles.chipActive]}
                onPress={() => setTipo('estudo')}
              >
                <Text style={[styles.chipText, tipo === 'estudo' && styles.chipTextActive]}>📚 Estudo</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleCriar} style={styles.primaryBtn}>
              <LinearGradient colors={['#3b82f6', '#7c3aed']} style={styles.gradientBtn}>
                <Text style={styles.primaryBtnText}>Criar Missão</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#1e293b', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  modalCloseBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#93c5fd', marginBottom: 8 },
  textInput: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 14, color: '#fff', fontSize: 15, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  chip: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chipActive: { backgroundColor: 'rgba(59,130,246,0.2)', borderColor: '#3b82f6' },
  chipText: { color: '#94a3b8', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 10 },
  gradientBtn: { paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
