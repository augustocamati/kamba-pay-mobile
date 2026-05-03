import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../lib/api';
import * as ImagePicker from 'expo-image-picker';
import { 
  BrainCircuit, Pencil, Trash2, Puzzle, X, PlusCircle, Coins, Landmark, BookOpen, Target, CheckCircle2, Image as ImageIcon, Video 
} from 'lucide-react-native';

export interface AdminQuiz {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  dificuldade: 'Fácil' | 'Média' | 'Difícil';
  pontosRecompensa: number;
  pergunta: string;
  midia_url?: string | null;
  opcoes: { id?: string; texto: string; correta: boolean }[];
  explicacao: string;
  vezesCompletado: number;
}

const CATEGORIAS = ['Poupar', 'Gastar', 'Ajudar', 'Investir', 'Planejamento'];
const DIFICULDADES = ['Fácil', 'Média', 'Difícil'] as const;

const DIFF_STYLE: Record<string, { bg: string; text: string }> = {
  'Fácil':   { bg: 'rgba(34,197,94,0.15)',  text: '#22C55E' },
  'Média':   { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  'Difícil': { bg: 'rgba(239,68,68,0.15)',  text: '#EF4444' },
};
const CAT_COLOR: Record<string, string> = {
  Poupar: '#22C55E', Gastar: '#F59E0B', Ajudar: '#EC4899',
  Investir: '#3B82F6', Planejamento: '#8B5CF6',
};

type FormState = {
  titulo: string;
  descricao: string;
  categoria: string;
  dificuldade: 'Fácil' | 'Média' | 'Difícil';
  pontosRecompensa: string;
  pergunta: string;
  midiaUri: string | null;
  midiaType: 'image' | 'video' | null;
  opcoes: { texto: string; correta: boolean }[];
  explicacao: string;
};

const blankForm = (): FormState => ({
  titulo: '', descricao: '', categoria: 'Poupar', dificuldade: 'Fácil',
  pontosRecompensa: '50', pergunta: '', midiaUri: null, midiaType: null,
  opcoes: [{ texto: '', correta: false }, { texto: '', correta: false }],
  explicacao: '',
});

export default function AdminQuizzes() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());

  // Queries
  const { data: quizzesData, isLoading } = useQuery({
    queryKey: ['admin', 'quizzes'],
    queryFn: () => adminService.getQuizzes(),
  });
  const quizzes: AdminQuiz[] = quizzesData?.quizzes || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createQuiz(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
      setModal(false);
    },
    onError: (err: any) => Alert.alert('Erro', err.response?.data?.mensagem || 'Falha ao criar quiz'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminService.updateQuiz(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
      setModal(false);
    },
    onError: (err: any) => Alert.alert('Erro', err.response?.data?.mensagem || 'Falha ao atualizar quiz'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
    },
    onError: (err: any) => Alert.alert('Erro', err.response?.data?.mensagem || 'Falha ao eliminar quiz'),
  });

  const openAdd = () => { setEditId(null); setForm(blankForm()); setModal(true); };

  const openEdit = (q: AdminQuiz) => {
    setEditId(q.id);
    const apiHost = 'http://192.168.0.103:3000'; // fallback
    setForm({
      titulo: q.titulo, 
      descricao: q.descricao, 
      categoria: q.categoria,
      dificuldade: q.dificuldade, 
      pontosRecompensa: String(q.pontosRecompensa),
      pergunta: q.pergunta,
      midiaUri: q.midia_url ? `${apiHost}${q.midia_url}` : null,
      midiaType: q.midia_url?.includes('.mp4') ? 'video' : (q.midia_url ? 'image' : null),
      opcoes: q.opcoes.map(o => ({ texto: o.texto, correta: o.correta })),
      explicacao: q.explicacao,
    });
    setModal(true);
  };

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setForm(p => ({ 
        ...p, 
        midiaUri: result.assets[0].uri,
        midiaType: result.assets[0].type === 'video' ? 'video' : 'image'
      }));
    }
  };

  const setOpcaoTexto = (i: number, txt: string) =>
    setForm(p => ({ ...p, opcoes: p.opcoes.map((o, idx) => idx === i ? { ...o, texto: txt } : o) }));

  const setOpcaoCorreta = (i: number) =>
    setForm(p => ({ ...p, opcoes: p.opcoes.map((o, idx) => ({ ...o, correta: idx === i })) }));

  const addOpcao = () => {
    if (form.opcoes.length >= 4) return;
    setForm(p => ({ ...p, opcoes: [...p.opcoes, { texto: '', correta: false }] }));
  };

  const removeOpcao = (i: number) => {
    if (form.opcoes.length <= 2) return;
    setForm(p => ({ ...p, opcoes: p.opcoes.filter((_, idx) => idx !== i) }));
  };

  const save = () => {
    if (!form.titulo || !form.pergunta || form.opcoes.filter(o => o.texto).length < 2) {
      return Alert.alert('Aviso', 'Preencha todos os campos obrigatórios e pelo menos 2 opções.');
    }
    
    // Validar se existe pelo menos uma opção correta
    if (!form.opcoes.some(o => o.correta)) {
      return Alert.alert('Aviso', 'Selecione pelo menos uma opção como correta.');
    }
    
    let payload: any = {
      titulo: form.titulo,
      descricao: form.descricao,
      categoria: form.categoria,
      dificuldade: form.dificuldade,
      pergunta: form.pergunta,
      explicacao: form.explicacao,
      pontosRecompensa: Number(form.pontosRecompensa) || 50,
    };

    if (form.midiaUri) {
      const formData = new FormData();
      formData.append('midia', {
        uri: form.midiaUri,
        name: `quiz_${Date.now()}.${form.midiaType === 'video' ? 'mp4' : 'jpg'}`,
        type: form.midiaType === 'video' ? 'video/mp4' : 'image/jpeg',
      } as any);

      Object.keys(payload).forEach(key => formData.append(key, payload[key]));
      // opcoes need to be JSON stringified for FormData
      formData.append('opcoes', JSON.stringify(form.opcoes.filter(o => o.texto)));
      
      payload = formData;
    } else {
      payload.opcoes = form.opcoes.filter(o => o.texto);
    }

    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const del = (id: string) => Alert.alert('Eliminar Quiz', 'Tem a certeza que deseja eliminar este quiz?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
  ]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Gestão de Quizzes</Text>
          <Text style={styles.pageSub}>Total: {quizzes.length} quizzes educativos</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Adicionar Quiz</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FF8C00" />
          <Text style={styles.loadingText}>Carregando quizzes...</Text>
        </View>
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={q => String(q.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item: q, index }) => {
            const diff = DIFF_STYLE[q.dificuldade] || DIFF_STYLE['Fácil'];
            const catColor = CAT_COLOR[q.categoria] || '#FF8C00';
            return (
              <Animated.View entering={FadeInDown.delay(index * 60).duration(400)} style={{ flex: 1 }}>
                <View style={styles.quizCard}>
                  {/* Top row: brain + badges */}
                  <View style={styles.quizCardTop}>
                    <View style={styles.brainWrap}>
                      <BrainCircuit size={20} color="#8B5CF6" />
                    </View>
                    <View style={styles.quizBadges}>
                      <View style={[styles.chip, { backgroundColor: `${catColor}22`, borderColor: `${catColor}44` }]}>
                        <Text style={[styles.chipText, { color: catColor }]}>{q.categoria}</Text>
                      </View>
                      <View style={[styles.chip, { backgroundColor: diff.bg }]}>
                        <Text style={[styles.chipText, { color: diff.text }]}>{q.dificuldade}</Text>
                      </View>
                    </View>
                  </View>
  
                  <Text style={styles.quizTitle}>{q.titulo}</Text>
                  <Text style={styles.quizQuestion} numberOfLines={2}>{q.pergunta}</Text>
                  <Text style={styles.quizOpcoes}>{q.opcoes.length} opções de resposta</Text>
  
                  {/* Stats */}
                  <View style={styles.quizStats}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: '#F59E0B' }]}>{q.pontosRecompensa}</Text>
                      <Text style={styles.statLabel}>Pontos</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: '#22C55E' }]}>{q.vezesCompletado}</Text>
                      <Text style={styles.statLabel}>Completados</Text>
                    </View>
                  </View>
  
                  {/* Actions */}
                  <View style={styles.quizActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(q)} activeOpacity={0.8}>
                      <Pencil size={14} color="#8FA1C7" style={{ marginRight: 6 }} />
                      <Text style={styles.editBtnText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.delBtn, deleteMutation.isPending && { opacity: 0.5 }]} 
                      onPress={() => del(String(q.id))} 
                      disabled={deleteMutation.isPending}
                      activeOpacity={0.8}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            );
          }}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Puzzle size={48} color="#4A5F8A" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>Nenhum quiz cadastrado</Text>
            </View>
          )}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editId ? 'Editar Quiz' : 'Adicionar Novo Quiz'}</Text>
              <TouchableOpacity onPress={() => setModal(false)} style={styles.closeBtn}>
                <X size={20} color="#8FA1C7" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Título */}
              <Field label="Título *">
                <TextInput
                  style={styles.input}
                  placeholder="Ex: O que é Poupar?"
                  placeholderTextColor="#4A5F8A"
                  value={form.titulo}
                  onChangeText={v => setForm(p => ({ ...p, titulo: v }))}
                />
              </Field>

              {/* Descrição */}
              <Field label="Descrição">
                <TextInput
                  style={styles.input}
                  placeholder="Breve descrição do quiz..."
                  placeholderTextColor="#4A5F8A"
                  value={form.descricao}
                  onChangeText={v => setForm(p => ({ ...p, descricao: v }))}
                />
              </Field>

              {/* Categoria + Dificuldade + Pontos */}
              <View style={styles.row3}>
                <View style={{ flex: 1 }}>
                  <Field label="Categoria *">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {CATEGORIAS.map(c => (
                        <TouchableOpacity
                          key={c}
                          style={[styles.miniChip, form.categoria === c && styles.miniChipActive]}
                          onPress={() => setForm(p => ({ ...p, categoria: c }))}
                        >
                          <Text style={[styles.miniChipText, form.categoria === c && { color: '#FF8C00' }]}>{c}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </Field>
                </View>
              </View>

              <View style={styles.row2}>
                <Field label="Dificuldade *" flex={1}>
                  <View style={styles.segRow}>
                    {DIFICULDADES.map(d => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.seg, form.dificuldade === d && styles.segActive]}
                        onPress={() => setForm(p => ({ ...p, dificuldade: d as any }))}
                      >
                        <Text style={[styles.segText, form.dificuldade === d && { color: '#FF8C00' }]}>{d}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Field>
                <Field label="Pontos" flex={0.45}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={form.pontosRecompensa}
                    onChangeText={v => setForm(p => ({ ...p, pontosRecompensa: v }))}
                    placeholderTextColor="#4A5F8A"
                    placeholder="50"
                  />
                </Field>
              </View>

              {/* Pergunta */}
              <Field label="Pergunta *">
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Escreva a pergunta do quiz..."
                  placeholderTextColor="#4A5F8A"
                  multiline
                  value={form.pergunta}
                  onChangeText={v => setForm(p => ({ ...p, pergunta: v }))}
                />
              </Field>

              {/* Mídia Opcional */}
              <Field label="Mídia (Opcional)">
                <TouchableOpacity style={styles.mediaUploadBtn} onPress={pickMedia}>
                  {form.midiaUri ? (
                    <View style={styles.mediaPreview}>
                      {form.midiaType === 'video' ? <Video size={24} color="#FF8C00" /> : <ImageIcon size={24} color="#FF8C00" />}
                      <Text style={styles.mediaPreviewText}>Mídia Selecionada</Text>
                      <TouchableOpacity onPress={() => setForm(p => ({ ...p, midiaUri: null, midiaType: null }))}>
                        <X size={18} color="#EF4444" style={{ marginLeft: 10 }} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.mediaPlaceholder}>
                      <ImageIcon size={20} color="#4A5F8A" />
                      <Text style={styles.mediaPlaceholderText}>Anexar Imagem ou Vídeo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Field>

              {/* Opções de Resposta */}
              <View style={styles.opcoeHeader}>
                <Text style={styles.fieldLabel}>Opções de Resposta (mínimo 2)</Text>
                <TouchableOpacity onPress={addOpcao} style={styles.addOpcaoBtn}>
                  <PlusCircle size={14} color="#FF8C00" />
                  <Text style={styles.addOpcaoBtnText}>Adicionar Opção</Text>
                </TouchableOpacity>
              </View>

              {form.opcoes.map((op, i) => {
                const OptionIcon = [Coins, Landmark, BookOpen, Target][i] || Puzzle;
                return (
                <View key={i} style={styles.opcaoRow}>
                  <View style={styles.opcaoIconWrap}>
                    <OptionIcon size={16} color="#8FA1C7" />
                  </View>
                  <TextInput
                    style={[styles.input, styles.opcaoInput]}
                    placeholder={`Opção ${i + 1}`}
                    placeholderTextColor="#4A5F8A"
                    value={op.texto}
                    onChangeText={v => setOpcaoTexto(i, v)}
                  />
                  <TouchableOpacity
                    style={[styles.corretaBtn, op.correta && styles.corretaBtnActive]}
                    onPress={() => setOpcaoCorreta(i)}
                  >
                    {op.correta ? <CheckCircle2 size={14} color="#22C55E" /> : <Text style={styles.corretaBtnText}>Correta?</Text>}
                  </TouchableOpacity>
                  {form.opcoes.length > 2 && (
                    <TouchableOpacity onPress={() => removeOpcao(i)} style={styles.removeOpcaoBtn}>
                      <X size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                );
              })}

              {/* Explicação */}
              <Field label="Explicação (após resposta)">
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Explique a resposta correta..."
                  placeholderTextColor="#4A5F8A"
                  multiline
                  value={form.explicacao}
                  onChangeText={v => setForm(p => ({ ...p, explicacao: v }))}
                />
              </Field>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModal(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnSave, (createMutation.isPending || updateMutation.isPending) && { opacity: 0.7 }]} 
                onPress={save}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  { (createMutation.isPending || updateMutation.isPending) ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Puzzle size={16} color="#fff" />
                  )}
                  <Text style={styles.btnSaveText}>{editId ? 'Salvar Alterações' : 'Adicionar Quiz'}</Text>
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

  quizCard: {
    backgroundColor: S.card, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: S.border,
    marginBottom: 0,
  },
  quizCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  brainWrap: {
    width: 40, height: 40, borderRadius: 11,
    backgroundColor: 'rgba(139,92,246,0.15)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  brainEmoji: { fontSize: 20 },
  quizBadges: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: {
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
    borderWidth: 1, borderColor: 'transparent',
  },
  chipText: { fontSize: 9, fontFamily: 'Nunito_700Bold' },

  quizTitle: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: S.text, marginBottom: 5, lineHeight: 18 },
  quizQuestion: { fontSize: 11, color: S.sub, fontFamily: 'Nunito_400Regular', lineHeight: 16, marginBottom: 5 },
  quizOpcoes: { fontSize: 10, color: S.muted, fontFamily: 'Nunito_400Regular', marginBottom: 12 },

  quizStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: S.sidebar, borderRadius: 10, padding: 10, marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
  statLabel: { fontSize: 9, color: S.muted, fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: S.border },

  quizActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flex: 1, backgroundColor: S.sidebar, borderRadius: 10, padding: 9,
    borderWidth: 1, borderColor: S.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'
  },
  editBtnText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: S.sub },
  delBtn: {
    width: 36, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  delBtnText: { fontSize: 14 },

  empty: { flex: 1, alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
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
  closeBtnText: { fontSize: 18, color: S.muted },
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

  // mini chips for category
  miniChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 6,
    backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border,
  },
  miniChipActive: { backgroundColor: 'rgba(255,140,0,0.15)', borderColor: 'rgba(255,140,0,0.3)' },
  miniChipText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: S.sub },

  // Difficulty segment
  segRow: { flexDirection: 'row', gap: 6 },
  seg: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border, alignItems: 'center',
  },
  segActive: { backgroundColor: 'rgba(255,140,0,0.15)', borderColor: 'rgba(255,140,0,0.3)' },
  segText: { fontSize: 11, color: S.sub, fontFamily: 'Nunito_600SemiBold' },

  // Opcoes
  opcoeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  addOpcaoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addOpcaoBtnText: { fontSize: 12, color: S.orange, fontFamily: 'Nunito_700Bold' },

  opcaoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  opcaoIconWrap: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  opcaoIcon: { fontSize: 16 },
  opcaoInput: { flex: 1, paddingVertical: 10 },
  corretaBtn: {
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8,
    backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border, flexShrink: 0,
  },
  corretaBtnActive: { backgroundColor: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.3)' },
  corretaBtnText: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: S.muted },
  removeOpcaoBtn: { padding: 6 },

  btnCancel: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border, alignItems: 'center',
  },
  btnCancelText: { color: S.sub, fontFamily: 'Nunito_600SemiBold', fontSize: 14 },
  btnSave: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: S.orange, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 14 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: S.sub, fontFamily: 'Nunito_600SemiBold', marginTop: 12 },
  
  mediaUploadBtn: {
    backgroundColor: S.sidebar, borderRadius: 10, borderWidth: 1, borderColor: S.border,
    overflow: 'hidden', padding: 12
  },
  mediaPlaceholder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  mediaPlaceholderText: { color: S.muted, fontFamily: 'Nunito_600SemiBold', fontSize: 13 },
  mediaPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,140,0,0.1)', padding: 10, borderRadius: 8 },
  mediaPreviewText: { color: S.orange, fontFamily: 'Nunito_700Bold', fontSize: 13, flex: 1, marginLeft: 8 },
});
