import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, TextInput, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api';
import { 
  Smile, Pencil, Trash2, X, Plus, Save, Palette, MessageSquare, Star, LayoutDashboard
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { MASCOT_ASSETS } from '@/lib/mascot-assets';

interface AdminMascote {
  id_mascote: number;
  nome: string;
  tagline: string;
  descricao: string;
  tipo: string;
  emoji: string;
  imagem_url?: string;
  bg_color: string;
  preco: number;
  ordem: number;
  msg_greeting: string;
  msg_correct: string;
  msg_wrong: string;
  msg_drag: string;
  ativo: boolean;
}

const DEFAULT_FORM: Partial<AdminMascote> = {
  nome: '',
  tagline: '',
  descricao: '',
  tipo: '',
  emoji: '🤖',
  imagem_url: '',
  bg_color: '#DBEAFE',
  preco: 0,
  ordem: 0,
  msg_greeting: '["Olá! 😊"]',
  msg_correct: '["Muito bem! 🎉"]',
  msg_wrong: '["Quase lá! 💪"]',
  msg_drag: '["Arrasta a resposta! 🤔"]',
  ativo: true,
};

export default function AdminMascotes() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<AdminMascote>>(DEFAULT_FORM);

  // Queries
  const { data: mascotes, isLoading } = useQuery({
    queryKey: ['admin', 'mascotes'],
    queryFn: () => adminService.getMascotes(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createMascote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'mascotes'] });
      setModal(false);
      Alert.alert('Sucesso', 'Mascote criado com sucesso');
    },
    onError: () => Alert.alert('Erro', 'Falha ao criar mascote'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => adminService.updateMascote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'mascotes'] });
      setModal(false);
      Alert.alert('Sucesso', 'Mascote atualizado com sucesso');
    },
    onError: () => Alert.alert('Erro', 'Falha ao atualizar mascote'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteMascote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'mascotes'] });
      Alert.alert('Sucesso', 'Mascote removido com sucesso');
    },
    onError: () => Alert.alert('Erro', 'Falha ao remover mascote'),
  });

  const openAdd = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setModal(true);
  };

  const openEdit = (m: AdminMascote) => {
    setEditId(m.id_mascote);
    setForm({
      ...m,
      msg_greeting: typeof m.msg_greeting === 'string' ? m.msg_greeting : JSON.stringify(m.msg_greeting),
      msg_correct: typeof m.msg_correct === 'string' ? m.msg_correct : JSON.stringify(m.msg_correct),
      msg_wrong: typeof m.msg_wrong === 'string' ? m.msg_wrong : JSON.stringify(m.msg_wrong),
      msg_drag: typeof m.msg_drag === 'string' ? m.msg_drag : JSON.stringify(m.msg_drag),
    });
    setModal(true);
  };

  const handleSave = () => {
    if (!form.nome || !form.emoji) {
      return Alert.alert('Aviso', 'Nome e Emoji são obrigatórios.');
    }

    if (editId) {
      updateMutation.mutate({ id: editId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar Mascote', 'Tem a certeza que deseja eliminar este mascote?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Gestão de Mascotes</Text>
          <Text style={styles.pageSub}>Total: {mascotes?.length || 0} personagens cadastrados</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.85}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Plus size={16} color="#fff" />
            <Text style={styles.addBtnText}>Adicionar</Text>
          </View>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FF8C00" />
          <Text style={styles.loadingText}>Carregando mascotes...</Text>
        </View>
      ) : (
        <FlatList
          data={mascotes}
          keyExtractor={m => String(m.id_mascote)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item: m, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 60).duration(400)} style={{ flex: 1 }}>
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.emojiWrap, { backgroundColor: m.bg_color || 'rgba(255,255,255,0.05)' }]}>
                    {m.imagem_url && MASCOT_ASSETS[m.imagem_url] ? (
                      <Image 
                        source={MASCOT_ASSETS[m.imagem_url]} 
                        style={{ width: 44, height: 44 }} 
                        contentFit="contain"
                      />
                    ) : (
                      <Text style={styles.emojiText}>{m.emoji}</Text>
                    )}
                  </View>
                  <View style={styles.cardStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: m.ativo ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }]}>
                       <Text style={[styles.statusText, { color: m.ativo ? '#22C55E' : '#EF4444' }]}>
                         {m.ativo ? 'Ativo' : 'Inativo'}
                       </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{m.nome}</Text>
                <Text style={styles.cardType} numberOfLines={1}>{m.tipo || 'Personagem'}</Text>

                <View style={styles.cardStats}>
                  <View style={styles.statItem}>
                    <Star size={12} color="#F59E0B" />
                    <Text style={styles.statValue}>{m.preco} XP</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <LayoutDashboard size={12} color="#8FA1C7" />
                    <Text style={styles.statValue}>Pos: {m.ordem}</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(m)} activeOpacity={0.8}>
                    <Pencil size={14} color="#8FA1C7" style={{ marginRight: 6 }} />
                    <Text style={styles.editBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.delBtn, deleteMutation.isPending && { opacity: 0.5 }]} 
                    onPress={() => handleDelete(m.id_mascote)}
                    disabled={deleteMutation.isPending}
                    activeOpacity={0.8}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Smile size={48} color="#4A5F8A" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>Nenhum mascote cadastrado</Text>
            </View>
          )}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editId ? 'Editar Mascote' : 'Adicionar Novo Mascote'}</Text>
              <TouchableOpacity onPress={() => setModal(false)} style={styles.closeBtn}>
                <X size={20} color="#8FA1C7" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.row2}>
                <Field label="Emoji *" flex={0.3}>
                  <TextInput
                    style={[styles.input, { textAlign: 'center', fontSize: 24 }]}
                    placeholder="🤖"
                    placeholderTextColor="#4A5F8A"
                    value={form.emoji}
                    onChangeText={v => setForm(p => ({ ...p, emoji: v }))}
                  />
                </Field>
                <Field label="Nome *" flex={1}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Kamba Azul"
                    placeholderTextColor="#4A5F8A"
                    value={form.nome}
                    onChangeText={v => setForm(p => ({ ...p, nome: v }))}
                  />
                </Field>
              </View>

              <Field label="URL do SVG (Asset) *">
                <TextInput
                  style={styles.input}
                  placeholder="Ex: kamba_azul.svg"
                  placeholderTextColor="#4A5F8A"
                  value={form.imagem_url}
                  onChangeText={v => setForm(p => ({ ...p, imagem_url: v }))}
                />
                <Text style={{ fontSize: 10, color: '#8FA1C7', marginTop: 4 }}>
                  Mapeie para um dos ficheiros em assets/images/personagens
                </Text>
              </Field>

              <Field label="Tipo / Categoria">
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Robô Explorador"
                  placeholderTextColor="#4A5F8A"
                  value={form.tipo}
                  onChangeText={v => setForm(p => ({ ...p, tipo: v }))}
                />
              </Field>

              <Field label="Tagline (Frase Curta)">
                <TextInput
                  style={styles.input}
                  placeholder="Ex: O teu melhor amigo nas aulas!"
                  placeholderTextColor="#4A5F8A"
                  value={form.tagline}
                  onChangeText={v => setForm(p => ({ ...p, tagline: v }))}
                />
              </Field>

              <Field label="Descrição">
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Conte um pouco sobre este mascote..."
                  placeholderTextColor="#4A5F8A"
                  multiline
                  value={form.descricao}
                  onChangeText={v => setForm(p => ({ ...p, descricao: v }))}
                />
              </Field>

              <View style={styles.row3}>
                <Field label="Preço (XP)" flex={1}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(form.preco)}
                    onChangeText={v => setForm(p => ({ ...p, preco: Number(v) || 0 }))}
                  />
                </Field>
                <Field label="Ordem" flex={1}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(form.ordem)}
                    onChangeText={v => setForm(p => ({ ...p, ordem: Number(v) || 0 }))}
                  />
                </Field>
                <Field label="Cor de Fundo" flex={1.2}>
                  <View style={styles.colorRow}>
                    <View style={[styles.colorSquare, { backgroundColor: form.bg_color }]} />
                    <TextInput
                      style={[styles.input, { flex: 1, paddingHorizontal: 8 }]}
                      value={form.bg_color}
                      onChangeText={v => setForm(p => ({ ...p, bg_color: v }))}
                      placeholder="#HEX"
                    />
                  </View>
                </Field>
              </View>

              <Text style={styles.sectionHeader}>Mensagens Dinâmicas (JSON)</Text>
              
              <Field label="Saudação">
                <TextInput
                  style={[styles.input, styles.mono]}
                  value={form.msg_greeting}
                  onChangeText={v => setForm(p => ({ ...p, msg_greeting: v }))}
                />
              </Field>

              <Field label="Quando Acerta">
                <TextInput
                  style={[styles.input, styles.mono]}
                  value={form.msg_correct}
                  onChangeText={v => setForm(p => ({ ...p, msg_correct: v }))}
                />
              </Field>

              <Field label="Quando Erra">
                <TextInput
                  style={[styles.input, styles.mono]}
                  value={form.msg_wrong}
                  onChangeText={v => setForm(p => ({ ...p, msg_wrong: v }))}
                />
              </Field>

              <Field label="Ao Arrastar">
                <TextInput
                  style={[styles.input, styles.mono]}
                  value={form.msg_drag}
                  onChangeText={v => setForm(p => ({ ...p, msg_drag: v }))}
                />
              </Field>

              <View style={[styles.row2, { marginTop: 10, marginBottom: 30 }]}>
                <Field label="Status" flex={1}>
                  <View style={styles.segRow}>
                    {[true, false].map(v => (
                      <TouchableOpacity
                        key={String(v)}
                        style={[styles.seg, form.ativo === v && styles.segActive]}
                        onPress={() => setForm(p => ({ ...p, ativo: v }))}
                      >
                        <Text style={[styles.segText, form.ativo === v && { color: '#FF8C00' }]}>
                          {v ? 'Ativo' : 'Inativo'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Field>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModal(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnSave, (createMutation.isPending || updateMutation.isPending) && { opacity: 0.7 }]} 
                onPress={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  { (createMutation.isPending || updateMutation.isPending) ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Save size={16} color="#fff" />
                  )}
                  <Text style={styles.btnSaveText}>{editId ? 'Salvar Alterações' : 'Salvar Mascote'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Field({ label, children, flex }: { label: string; children: React.ReactNode; flex?: number }) {
  return (
    <View style={[styles.fieldWrap, flex !== undefined && { flex }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const S = {
  bg: '#0B1222', card: '#111C30', sidebar: '#0D1526',
  border: 'rgba(255,255,255,0.07)', text: '#F0F4FF',
  sub: '#8FA1C7', muted: '#4A5F8A', orange: '#FF8C00',
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: S.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: S.border,
  },
  pageTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: S.text },
  pageSub: { fontSize: 12, color: S.muted, fontFamily: 'Nunito_400Regular', marginTop: 2 },
  addBtn: {
    backgroundColor: S.orange, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: S.orange, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  addBtnText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 13 },

  listContent: { padding: 14, paddingBottom: 24 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: S.sub, fontFamily: 'Nunito_600SemiBold', marginTop: 12 },

  card: {
    backgroundColor: S.card, borderRadius: 20,
    padding: 14, borderWidth: 1, borderColor: S.border,
    marginBottom: 0,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  emojiWrap: {
    width: 54, height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: S.border,
  },
  emojiText: { fontSize: 28 },
  cardStatus: {},
  statusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 9, fontFamily: 'Nunito_700Bold' },

  cardTitle: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: S.text, marginBottom: 2 },
  cardType: { fontSize: 11, color: S.muted, fontFamily: 'Nunito_600SemiBold', marginBottom: 12 },

  cardStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: S.sidebar, borderRadius: 12, padding: 10, marginBottom: 12,
  },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  statValue: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: S.text },
  statDivider: { width: 1, height: 16, backgroundColor: S.border },

  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flex: 1, backgroundColor: S.sidebar, borderRadius: 10, padding: 9,
    borderWidth: 1, borderColor: S.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'
  },
  editBtnText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: S.sub },
  delBtn: {
    width: 36, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', alignItems: 'center', justifyContent: 'center',
  },

  empty: { flex: 1, alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: S.muted, fontFamily: 'Nunito_600SemiBold' },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#111C30',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    maxHeight: '94%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: S.border,
  },
  modalTitle: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: S.text },
  closeBtn: { padding: 6 },
  modalBody: { paddingHorizontal: 20, paddingTop: 16 },
  modalFooter: {
    flexDirection: 'row', gap: 10, padding: 20,
    borderTopWidth: 1, borderTopColor: S.border,
  },

  fieldWrap: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 11, color: S.sub, fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  input: {
    backgroundColor: S.sidebar, borderRadius: 10,
    borderWidth: 1, borderColor: S.border,
    color: S.text, fontFamily: 'Nunito_400Regular', fontSize: 14,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  row2: { flexDirection: 'row', gap: 12 },
  row3: { flexDirection: 'row', gap: 10 },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorSquare: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: S.border },
  
  sectionHeader: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: S.orange, marginTop: 12, marginBottom: 16, textTransform: 'uppercase' },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12 },

  segRow: { flexDirection: 'row', gap: 6 },
  seg: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border, alignItems: 'center',
  },
  segActive: { backgroundColor: 'rgba(255,140,0,0.15)', borderColor: 'rgba(255,140,0,0.3)' },
  segText: { fontSize: 11, color: S.sub, fontFamily: 'Nunito_600SemiBold' },

  btnCancel: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border, alignItems: 'center',
  },
  btnCancelText: { color: S.sub, fontFamily: 'Nunito_600SemiBold', fontSize: 14 },
  btnSave: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: S.orange, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 14 },
});
