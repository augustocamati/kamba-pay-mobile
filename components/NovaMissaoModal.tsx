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
  dependentes?: any[];
}

export function NovaMissaoModal({ visible, onClose, onCriar, dependentes = [] }: NovaMissaoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [recompensa, setRecompensa] = useState('');
  const [tipo, setTipo] = useState<{ key: string, label: string, color: string[], icone_nome: string }>({ key: 'poupanca', label: 'Meta', color: ['#3b82f6', '#7c3aed'], icone_nome: 'trending-up' });
  const [criancaId, setCriancaId] = useState('');

  const missionTypes = [
    { key: 'poupanca', label: 'Poupança', icon: '💰', color: ['#3b82f6', '#22c55e'], icone_nome: 'trending-up' },
    { key: 'estudo', label: 'Estudo', icon: '📚', color: ['#7c3aed', '#3b82f6'], icone_nome: 'book' },
    { key: 'comportamento', label: 'Comp.', icon: '⭐', color: ['#f59e0b', '#ef4444'], icone_nome: 'star' },
    { key: 'autonomia', label: 'Autonomia', icon: '☀️', color: ['#10b981', '#3b82f6'], icone_nome: 'flash' },
    { key: 'saude', label: 'Saúde', icon: '❤️', color: ['#ef4444', '#f43f5e'], icone_nome: 'heart' },
    { key: 'solidariedade', label: 'Social', icon: '🤝', color: ['#ec4899', '#f43f5e'], icone_nome: 'hand-heart' },
  ];

  React.useEffect(() => {
    if (dependentes.length > 0 && (!criancaId || !dependentes.find(d => d.id === criancaId))) {
      setCriancaId(dependentes[0].id);
    }
  }, [dependentes, visible]);

  const handleCriar = () => {
    onCriar({
      titulo,
      descricao,
      objetivo_valor: parseFloat(valor),
      recompensa: parseFloat(recompensa),
      tipo: tipo.key,
      crianca_id: criancaId,
      icone: missionTypes.find(t => t.key === tipo.key)?.icon || '🎯',
      cor: tipo.color,
      tipo_label: tipo.label,
      icone_nome: tipo.icone_nome
    });
    setTitulo('');
    setDescricao('');
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

            {dependentes.length > 0 && (
              <>
                <Text style={styles.fieldLabel}>Atribuir a</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {dependentes.map((dep) => (
                    <TouchableOpacity
                      key={dep.id}
                      onPress={() => setCriancaId(dep.id)}
                      style={[
                        styles.chipBtn,
                        criancaId === dep.id && styles.chipBtnActive,
                      ]}
                    >
                      <Text style={[styles.chipText, criancaId === dep.id && styles.chipTextActive]}>
                        {dep.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={styles.fieldLabel}>Título da Missão</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Comprar Bicicleta"
              placeholderTextColor="#94a3b8"
              value={titulo}
              onChangeText={setTitulo}
            />

            <Text style={styles.fieldLabel}>Descrição</Text>
            <TextInput
              style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Detalhes da missão"
              placeholderTextColor="#94a3b8"
              value={descricao}
              onChangeText={setDescricao}
              multiline
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {missionTypes.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.chipBtn,
                    tipo.key === t.key && styles.chipBtnActive,
                  ]}
                  onPress={() => setTipo(t)}
                >
                  <Text style={[styles.chipText, tipo.key === t.key && styles.chipTextActive]}>
                    {t.icon} {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

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
  chipBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBtnActive: {
    backgroundColor: 'rgba(59,130,246,0.3)',
    borderColor: '#3b82f6',
  },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 10 },
  gradientBtn: { paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
