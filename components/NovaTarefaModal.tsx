import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';

interface NovaTarefaModalProps {
  visible: boolean;
  onClose: () => void;
  onCriar: () => void;
  form: { 
    titulo: string; 
    descricao: string; 
    recompensa: string; 
    icone: string; 
    categoria: string; 
    crianca_id: string;
    prazo_dias?: string;
  };
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

  if (!visible) return null;

  const ModalContent = () => (
    <Animated.View entering={SlideInDown.duration(400).springify()} style={styles.modalContainer}>
      <View style={styles.dragHandle} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Criar Nova Tarefa</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Ionicons name="close" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.modalSubtitle}>Defina uma tarefa para seu filho e recompense o esforço!</Text>

        {/* Selecionar Criança */}
        <Text style={styles.fieldLabel}>Para quem é esta tarefa?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {dependentes.map((dep) => (
            <TouchableOpacity
              key={dep.id}
              onPress={() => setForm({ ...form, crianca_id: dep.id })}
              style={[
                styles.chipBtn,
                form.crianca_id === dep.id && styles.chipBtnActive,
              ]}
              activeOpacity={0.7}
            >
              <View style={[styles.avatarPlaceholder, form.crianca_id === dep.id && styles.avatarActive]}>
                <Text style={styles.avatarText}>{dep.nome[0]}</Text>
              </View>
              <Text style={[styles.chipText, form.crianca_id === dep.id && styles.chipTextActive]}>
                {dep.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Título */}
        <Text style={styles.fieldLabel}>O que precisa ser feito?</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Arrumar o quarto"
            placeholderTextColor="#64748b"
            value={form.titulo}
            onChangeText={(t) => setForm({ ...form, titulo: t })}
          />
        </View>

        {/* Descrição */}
        <Text style={styles.fieldLabel}>Detalhes adicionais (opcional)</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Ex: Guardar os brinquedos na caixa e arrumar a cama."
            placeholderTextColor="#64748b"
            value={form.descricao}
            onChangeText={(t) => setForm({ ...form, descricao: t })}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Recompensa & Prazo */}
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.fieldLabel}>Recompensa (Kz)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="cash-outline" size={20} color="#fbbf24" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="150"
                placeholderTextColor="#64748b"
                value={form.recompensa}
                onChangeText={(t) => setForm({ ...form, recompensa: t })}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.fieldLabel}>Prazo (Dias)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Ex: 3"
                placeholderTextColor="#64748b"
                value={form.prazo_dias}
                onChangeText={(t) => setForm({ ...form, prazo_dias: t })}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Ícone Selector */}
        <Text style={styles.fieldLabel}>Escolha um ícone</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {ICONES.map((ic) => (
            <TouchableOpacity
              key={ic.value}
              onPress={() => setForm({ ...form, icone: ic.value })}
              style={[
                styles.iconChip,
                form.icone === ic.value && styles.iconChipActive,
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.iconChipText}>{ic.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Categoria Selector */}
        <Text style={styles.fieldLabel}>Categoria</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setForm({ ...form, categoria: cat.value })}
              style={[
                styles.catBtn,
                form.categoria === cat.value && styles.catBtnActive,
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.catText, form.categoria === cat.value && styles.catTextActive]}>
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
          activeOpacity={0.8}
        >
          <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.primaryBtnText}>{isSubmitting ? 'A criar tarefa...' : 'Confirmar e Criar Tarefa'}</Text>
            {!isSubmitting && <Ionicons name="arrow-forward" size={20} color="#fff" />}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.modalOverlay}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
            <View style={styles.wrapper}>
               <ModalContent />
            </View>
          </BlurView>
        ) : (
          <View style={styles.androidOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
            <View style={styles.wrapper}>
              <ModalContent />
            </View>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  androidOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalCloseBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 10,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingRight: 16,
    paddingVertical: 6,
    paddingLeft: 6,
    marginRight: 10,
    gap: 10,
  },
  chipBtnActive: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderColor: '#3b82f6',
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActive: {
    backgroundColor: '#3b82f6',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#bfdbfe',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  inputIcon: {
    paddingLeft: 16,
  },
  textInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  iconChip: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
  },
  iconChipActive: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderColor: '#8b5cf6',
  },
  iconChipText: {
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  catBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  catBtnActive: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderColor: '#f59e0b',
  },
  catText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  catTextActive: {
    color: '#fcd34d',
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientBtn: {
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
