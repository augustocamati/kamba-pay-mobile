import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface CriarCampanhaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriar: (dados: {
    titulo: string;
    descricao: string;
    meta_valor: number;
    organizacao: string;
    causa: string;
    ativa: boolean;
  }) => void;
}

const CAUSAS = [
  { value: 'educacao',     label: '📚 Educação' },
  { value: 'saude',        label: '🏥 Saúde' },
  { value: 'alimentacao',  label: '🍲 Alimentação' },
  { value: 'meio_ambiente',label: '🌱 Meio Ambiente' },
  { value: 'animais',      label: '🐾 Proteção Animal' },
  { value: 'cultura',      label: '🎨 Cultura e Arte' },
  { value: 'comunidade',   label: '🏘️ Comunidade' },
];

export function CriarCampanha({ open, onOpenChange, onCriar }: CriarCampanhaProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [metaValor, setMetaValor] = useState('');
  const [organizacao, setOrganizacao] = useState('');
  const [causa, setCausa] = useState('educacao');

  const handleSubmit = () => {
    if (!titulo || !descricao || !metaValor || !organizacao) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
      return;
    }
    const valorNumerico = parseFloat(metaValor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Erro', 'Digite um valor válido para a meta!');
      return;
    }

    onCriar({ titulo, descricao, meta_valor: valorNumerico, organizacao, causa, ativa: true });

    // Reset
    setTitulo('');
    setDescricao('');
    setMetaValor('');
    setOrganizacao('');
    setCausa('educacao');
    onOpenChange(false);
  };

  const causaLabel = CAUSAS.find((c) => c.value === causa)?.label ?? causa;

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={() => onOpenChange(false)}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={styles.header}>
              <LinearGradient colors={['#ec4899', '#dc2626']} style={styles.headerIconWrap}>
                <Ionicons name="heart" size={24} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.headerTitle}>Criar Nova Campanha</Text>
                <Text style={styles.headerSubtitle}>Adicione uma campanha de solidariedade para seu filho ajudar</Text>
              </View>
              <TouchableOpacity onPress={() => onOpenChange(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* ── Informações da Campanha ── */}
            <View style={[styles.section, { borderColor: '#f9a8d4' }]}>
              <LinearGradient colors={['#fdf2f8', '#fff1f2']} style={styles.sectionGradient}>
                <Text style={styles.sectionTitle}>❤️  Informações da Campanha</Text>

                {/* Título */}
                <Text style={styles.fieldLabel}>Título da Campanha *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="heart-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: Ajudar Crianças em Luanda"
                    placeholderTextColor="#94a3b8"
                    value={titulo}
                    onChangeText={setTitulo}
                  />
                </View>

                {/* Descrição */}
                <Text style={styles.fieldLabel}>Descrição *</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Descreva o objetivo da campanha e como as doações serão utilizadas..."
                  placeholderTextColor="#94a3b8"
                  value={descricao}
                  onChangeText={setDescricao}
                  multiline
                  textAlignVertical="top"
                />

                {/* Organização */}
                <Text style={styles.fieldLabel}>Organização Responsável *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="business-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: ONG Criança Esperança"
                    placeholderTextColor="#94a3b8"
                    value={organizacao}
                    onChangeText={setOrganizacao}
                  />
                </View>
              </LinearGradient>
            </View>

            {/* ── Meta e Categoria ── */}
            <View style={[styles.section, { borderColor: '#fed7aa' }]}>
              <LinearGradient colors={['#fff7ed', '#fefce8']} style={styles.sectionGradient}>
                <Text style={styles.sectionTitle}>🎯  Meta e Categoria</Text>

                {/* Meta de Valor */}
                <Text style={styles.fieldLabel}>Meta de Arrecadação (Kz) *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="flag-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="5000"
                    placeholderTextColor="#94a3b8"
                    value={metaValor}
                    onChangeText={setMetaValor}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.hint}>Valor total que a campanha pretende arrecadar</Text>

                {/* Categoria — chips */}
                <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Categoria da Causa *</Text>
                <View style={styles.chipsWrap}>
                  {CAUSAS.map((c) => (
                    <TouchableOpacity
                      key={c.value}
                      onPress={() => setCausa(c.value)}
                      style={[styles.chip, causa === c.value && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, causa === c.value && styles.chipTextActive]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>
            </View>

            {/* ── Pré-visualização ── */}
            <View style={[styles.section, { borderColor: '#a5b4fc' }]}>
              <LinearGradient colors={['#eef2ff', '#ede9fe']} style={styles.sectionGradient}>
                <Text style={styles.sectionTitle}>👁️  Pré-visualização</Text>
                <View style={styles.previewCard}>
                  <View style={styles.previewHeader}>
                    <LinearGradient colors={['#ec4899', '#dc2626']} style={styles.previewIconWrap}>
                      <Ionicons name="heart" size={20} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.previewTitle} numberOfLines={1}>
                        {titulo || 'Título da campanha'}
                      </Text>
                      <Text style={styles.previewOrg}>{organizacao || 'Organização'}</Text>
                    </View>
                  </View>
                  <Text style={styles.previewDesc} numberOfLines={2}>
                    {descricao || 'Descrição da campanha aparecerá aqui...'}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={styles.previewMeta}>Meta:</Text>
                    <Text style={styles.previewMetaVal}>
                      {metaValor ? parseFloat(metaValor).toLocaleString() : '0'} Kz
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={{ height: '100%', width: '0%', backgroundColor: '#ec4899', borderRadius: 99 }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={styles.previewCausa}>Categoria: {causaLabel}</Text>
                    <Text style={styles.previewCausa}>0% concluído</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* ── Botões ── */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => onOpenChange(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSubmit} style={{ flex: 1 }}>
                <LinearGradient
                  colors={['#ec4899', '#dc2626']}
                  style={styles.submitBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="heart" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Criar Campanha</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerIconWrap: {
    borderRadius: 14,
    padding: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 8,
    marginLeft: 8,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: 16,
  },
  sectionGradient: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    paddingVertical: 14,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
    minHeight: 110,
    marginBottom: 12,
  },
  hint: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#fdf2f8',
    borderColor: '#ec4899',
  },
  chipText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#be185d',
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewIconWrap: {
    borderRadius: 10,
    padding: 8,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  previewOrg: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  previewDesc: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 10,
  },
  previewMeta: {
    fontSize: 13,
    color: '#64748b',
  },
  previewMetaVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  progressTrack: {
    backgroundColor: '#e2e8f0',
    borderRadius: 99,
    height: 8,
    overflow: 'hidden',
    marginVertical: 4,
  },
  previewCausa: {
    fontSize: 11,
    color: '#94a3b8',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
