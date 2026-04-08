import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface NovaTarefaModalProps {
  visible: boolean;
  onClose: () => void;
  onCriar: () => void;
  form: { titulo: string; descricao: string; recompensa: string; icone: string; categoria: string; crianca_id: string };
  setForm: (f: any) => void;
  dependentes: any[];
}

const ICONES = [
  { value: 'bed', label: '🛏️ Quarto' },
  { value: 'book', label: '📚 Leitura' },
  { value: 'utensils', label: '🍳 Cozinha' },
  { value: 'pencil', label: '✏️ Estudos' },
  { value: 'broom', label: '🧹 Limpeza' },
  { value: 'plant', label: '🌱 Jardim' },
];

const CATEGORIAS = [
  { value: 'casa', label: 'Casa' },
  { value: 'educacao', label: 'Educação' },
  { value: 'saude', label: 'Saúde' },
];

export function NovaTarefaModal({ visible, onClose, onCriar, form, setForm, dependentes }: NovaTarefaModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handlePressCriar = async () => {
    setIsSubmitting(true);
    try {
      await onCriar();
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Tarefa</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Selecionar Criança */}
            <Text style={styles.fieldLabel}>Atribuir a</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {dependentes.map((dep) => (
                <TouchableOpacity
                  key={dep.id}
                  onPress={() => setForm({ ...form, crianca_id: dep.id })}
                  style={[
                    styles.chipBtn,
                    form.crianca_id === dep.id && styles.chipBtnActive,
                  ]}
                >
                  <Text style={[styles.chipText, form.crianca_id === dep.id && styles.chipTextActive]}>
                    {dep.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Título */}
            <Text style={styles.fieldLabel}>Título</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Arrumar o quarto"
              placeholderTextColor="#94a3b8"
              value={form.titulo}
              onChangeText={(t) => setForm({ ...form, titulo: t })}
            />

            {/* Descrição */}
            <Text style={styles.fieldLabel}>Descrição</Text>
            <TextInput
              style={[styles.textInput, { height: 90, textAlignVertical: 'top', paddingTop: 12 }]}
              placeholder="Descreva os detalhes da tarefa"
              placeholderTextColor="#94a3b8"
              value={form.descricao}
              onChangeText={(t) => setForm({ ...form, descricao: t })}
              multiline
            />

            {/* Recompensa */}
            <Text style={styles.fieldLabel}>Recompensa (Kz)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="150"
              placeholderTextColor="#94a3b8"
              value={form.recompensa}
              onChangeText={(t) => setForm({ ...form, recompensa: t })}
              keyboardType="numeric"
            />

            {/* Ícone Selector */}
            <Text style={styles.fieldLabel}>Ícone</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {ICONES.map((ic) => (
                <TouchableOpacity
                  key={ic.value}
                  onPress={() => setForm({ ...form, icone: ic.value })}
                  style={[
                    styles.chipBtn,
                    form.icone === ic.value && styles.chipBtnActive,
                  ]}
                >
                  <Text style={[styles.chipText, form.icone === ic.value && styles.chipTextActive]}>
                    {ic.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Categoria Selector */}
            <Text style={styles.fieldLabel}>Categoria</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  onPress={() => setForm({ ...form, categoria: cat.value })}
                  style={[
                    styles.chipBtn,
                    form.categoria === cat.value && styles.chipBtnActive,
                    { flexGrow: 1 },
                  ]}
                >
                  <Text style={[styles.chipText, form.categoria === cat.value && styles.chipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Botão */}
            <TouchableOpacity 
              onPress={handlePressCriar} 
              style={[styles.primaryBtn, isSubmitting && { opacity: 0.7 }]}
              disabled={isSubmitting}
            >
              <LinearGradient colors={['#3b82f6', '#7c3aed']} style={styles.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.primaryBtnText}>{isSubmitting ? 'A criar...' : 'Criar Tarefa'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  modalCloseBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#93c5fd',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
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
  chipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#93c5fd',
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 14,
  },
  gradientBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
