import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, TextInput, Alert, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface AdminQuiz {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  dificuldade: 'Fácil' | 'Médio' | 'Difícil';
  pontos: number;
  pergunta: string;
  opcoes: { texto: string; correta: boolean }[];
  explicacao: string;
  completados: number;
}

const INITIAL_QUIZZES: AdminQuiz[] = [
  {
    id: 'q-1',
    titulo: 'O que é Poupar?',
    descricao: 'Teste seus conhecimentos sobre poupança',
    categoria: 'Poupar',
    dificuldade: 'Fácil',
    pontos: 50,
    pergunta: 'O que significa poupar dinheiro?',
    opcoes: [
      { texto: 'Guardar parte do dinheiro para o futuro', correta: true },
      { texto: 'Gastar todo o dinheiro que tem', correta: false },
      { texto: 'Dar dinheiro para outras pessoas', correta: false },
      { texto: 'Perder dinheiro', correta: false },
    ],
    explicacao: 'Poupar significa reservar uma parte do dinheiro que ganhamos para usar no futuro.',
    completados: 450,
  },
  {
    id: 'q-2',
    titulo: 'Gastar com Sabedoria',
    descricao: 'Aprenda sobre decisões inteligentes de compra',
    categoria: 'Gastar',
    dificuldade: 'Médio',
    pontos: 75,
    pergunta: 'Antes de comprar algo, você deve:',
    opcoes: [
      { texto: 'Pensar se realmente precisa', correta: true },
      { texto: 'Comprar imediatamente', correta: false },
      { texto: 'Pedir dinheiro emprestado', correta: false },
    ],
    explicacao: 'Sempre pense antes de comprar: é uma necessidade ou apenas um desejo?',
    completados: 320,
  },
];

const CATEGORIAS = ['Poupar', 'Gastar', 'Ajudar', 'Investir', 'Planejamento'];
const DIFICULDADES = ['Fácil', 'Médio', 'Difícil'] as const;

const DIFF_STYLE: Record<string, { bg: string; text: string }> = {
  'Fácil':   { bg: 'rgba(34,197,94,0.15)',  text: '#22C55E' },
  'Médio':   { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
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
  dificuldade: 'Fácil' | 'Médio' | 'Difícil';
  pontos: string;
  pergunta: string;
  opcoes: { texto: string; correta: boolean }[];
  explicacao: string;
};

const blankForm = (): FormState => ({
  titulo: '', descricao: '', categoria: 'Poupar', dificuldade: 'Fácil',
  pontos: '50', pergunta: '',
  opcoes: [{ texto: '', correta: false }, { texto: '', correta: false }],
  explicacao: '',
});

export default function AdminQuizzes() {
  const insets = useSafeAreaInsets();
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>(INITIAL_QUIZZES);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());

  const openAdd = () => { setEditId(null); setForm(blankForm()); setModal(true); };

  const openEdit = (q: AdminQuiz) => {
    setEditId(q.id);
    setForm({
      titulo: q.titulo, descricao: q.descricao, categoria: q.categoria,
      dificuldade: q.dificuldade, pontos: String(q.pontos),
      pergunta: q.pergunta,
      opcoes: q.opcoes.map(o => ({ ...o })),
      explicacao: q.explicacao,
    });
    setModal(true);
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
    if (!form.titulo || !form.pergunta || form.opcoes.filter(o => o.texto).length < 2) return;
    const quiz: AdminQuiz = {
      id: editId || `q-${Date.now()}`,
      titulo: form.titulo, descricao: form.descricao,
      categoria: form.categoria, dificuldade: form.dificuldade,
      pontos: Number(form.pontos) || 50, pergunta: form.pergunta,
      opcoes: form.opcoes.filter(o => o.texto),
      explicacao: form.explicacao, completados: 0,
    };
    if (editId) setQuizzes(p => p.map(q => q.id === editId ? quiz : q));
    else setQuizzes(p => [quiz, ...p]);
    setModal(false);
  };

  const del = (id: string) => Alert.alert('Eliminar Quiz', 'Tem a certeza?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: () => setQuizzes(p => p.filter(q => q.id !== id)) },
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

      <FlatList
        data={quizzes}
        keyExtractor={q => q.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item: q, index }) => {
          const diff = DIFF_STYLE[q.dificuldade];
          const catColor = CAT_COLOR[q.categoria] || '#FF8C00';
          return (
            <Animated.View entering={FadeInDown.delay(index * 60).duration(400)} style={{ flex: 1 }}>
              <View style={styles.quizCard}>
                {/* Top row: brain + badges */}
                <View style={styles.quizCardTop}>
                  <View style={styles.brainWrap}>
                    <Text style={styles.brainEmoji}>🧠</Text>
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
                    <Text style={[styles.statValue, { color: '#F59E0B' }]}>{q.pontos}</Text>
                    <Text style={styles.statLabel}>Pontos</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#22C55E' }]}>{q.completados}</Text>
                    <Text style={styles.statLabel}>Completados</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.quizActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(q)} activeOpacity={0.8}>
                    <Text style={styles.editBtnText}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.delBtn} onPress={() => del(q.id)} activeOpacity={0.8}>
                    <Text style={styles.delBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          );
        }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🧩</Text>
            <Text style={styles.emptyText}>Nenhum quiz cadastrado</Text>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editId ? 'Editar Quiz' : 'Adicionar Novo Quiz'}</Text>
              <TouchableOpacity onPress={() => setModal(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
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
                        onPress={() => setForm(p => ({ ...p, dificuldade: d }))}
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
                    value={form.pontos}
                    onChangeText={v => setForm(p => ({ ...p, pontos: v }))}
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

              {/* Opções de Resposta */}
              <View style={styles.opcoeHeader}>
                <Text style={styles.fieldLabel}>Opções de Resposta (mínimo 2)</Text>
                <TouchableOpacity onPress={addOpcao} style={styles.addOpcaoBtn}>
                  <Text style={styles.addOpcaoBtnText}>⊕ Adicionar Opção</Text>
                </TouchableOpacity>
              </View>

              {form.opcoes.map((op, i) => (
                <View key={i} style={styles.opcaoRow}>
                  <View style={styles.opcaoIconWrap}>
                    <Text style={styles.opcaoIcon}>
                      {['💰', '🏦', '📖', '🎯'][i] || '•'}
                    </Text>
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
                    <Text style={[styles.corretaBtnText, op.correta && { color: '#22C55E' }]}>
                      {op.correta ? '✅' : 'Correta?'}
                    </Text>
                  </TouchableOpacity>
                  {form.opcoes.length > 2 && (
                    <TouchableOpacity onPress={() => removeOpcao(i)} style={styles.removeOpcaoBtn}>
                      <Text style={{ color: '#EF4444', fontSize: 16 }}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

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
              <TouchableOpacity style={styles.btnSave} onPress={save}>
                <Text style={styles.btnSaveText}>🧩 {editId ? 'Salvar Alterações' : 'Adicionar Quiz'}</Text>
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
    borderWidth: 1, borderColor: S.border, alignItems: 'center',
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
});
