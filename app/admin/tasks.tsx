import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, TextInput, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AdminTask {
  id: string; icone: string; titulo: string; descricao: string;
  categoria: string; dificuldade: string; recompensa: number;
  tempo: string; status: 'ativo' | 'inativo'; completadas: number; ativas: number;
}

const INITIAL_TASKS: AdminTask[] = [
  { id: 'task-1', icone: '🛏️', titulo: 'Arrumar a Cama', descricao: 'Organize sua cama todos os dias ao acordar', categoria: 'Casa', dificuldade: 'Fácil', recompensa: 100, tempo: '5 min', status: 'ativo', completadas: 245, ativas: 3 },
  { id: 'task-2', icone: '📚', titulo: 'Fazer Lição de Casa', descricao: 'Complete todas as tarefas escolares do dia antes de brincar', categoria: 'Escola', dificuldade: 'Médio', recompensa: 500, tempo: '60 min', status: 'ativo', completadas: 180, ativas: 2 },
  { id: 'task-3', icone: '🍽️', titulo: 'Lavar a Louça', descricao: 'Ajuda lavando os pratos após as refeições', categoria: 'Casa', dificuldade: 'Médio', recompensa: 300, tempo: '15 min', status: 'ativo', completadas: 156, ativas: 4 },
  { id: 'task-4', icone: '📖', titulo: 'Ler 30 Minutos', descricao: 'Dedique tempo para leitura diária de um livro à sua escolha', categoria: 'Escola', dificuldade: 'Fácil', recompensa: 400, tempo: '30 min', status: 'ativo', completadas: 98, ativas: 1 },
  { id: 'task-5', icone: '🌱', titulo: 'Regar as Plantas', descricao: 'Cuide das plantas da casa regando-as com a quantidade certa de água', categoria: 'Casa', dificuldade: 'Fácil', recompensa: 150, tempo: '10 min', status: 'inativo', completadas: 67, ativas: 0 },
  { id: 'task-6', icone: '⚽', titulo: 'Treino de Futebol', descricao: 'Pratique suas habilidades de futebol por 1 hora', categoria: 'Esporte', dificuldade: 'Médio', recompensa: 350, tempo: '60 min', status: 'ativo', completadas: 120, ativas: 2 },
];

const TASK_ICONS = ['🛏️','📚','🍽️','🎨','⚽','🎵','🌱','📖','💪','🦷','🧹','🧺','💰','🐶','🚿'];
const DIFFICULTIES = ['Fácil', 'Médio', 'Difícil'];
const CATEGORIES = ['Casa', 'Escola', 'Esporte', 'Arte', 'Saúde', 'Responsabilidade'];

export default function AdminTasks() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<AdminTask[]>(INITIAL_TASKS);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AdminTask>>({
    icone: '🛏️', titulo: '', descricao: '', categoria: 'Casa',
    dificuldade: 'Fácil', recompensa: 100, tempo: '5 min', status: 'ativo',
  });

  const openAdd = () => {
    setEditId(null);
    setForm({ icone: '🛏️', titulo: '', descricao: '', categoria: 'Casa', dificuldade: 'Fácil', recompensa: 100, tempo: '5 min', status: 'ativo' });
    setModal(true);
  };

  const openEdit = (t: AdminTask) => {
    setEditId(t.id);
    setForm({ ...t });
    setModal(true);
  };

  const saveTask = () => {
    if (!form.titulo || !form.descricao) return;
    if (editId) {
      setTasks(p => p.map(t => t.id === editId ? { ...t, ...form } as AdminTask : t));
    } else {
      const newTask: AdminTask = {
        id: `task-${Date.now()}`, icone: form.icone || '🛏️', titulo: form.titulo!,
        descricao: form.descricao!, categoria: form.categoria || 'Casa',
        dificuldade: form.dificuldade || 'Fácil', recompensa: form.recompensa || 100,
        tempo: form.tempo || '5 min', status: 'ativo',
        completadas: 0, ativas: 1,
      };
      setTasks(p => [newTask, ...p]);
    }
    setModal(false);
  };

  const deleteTask = (id: string) => {
    Alert.alert('Eliminar Tarefa', 'Tem a certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setTasks(p => p.filter(t => t.id !== id)) },
    ]);
  };

  const toggleStatus = (id: string) => {
    setTasks(p => p.map(t => t.id === id ? { ...t, status: t.status === 'ativo' ? 'inativo' : 'ativo' } : t));
  };

  const DIFF_COLOR: Record<string, { bg: string; text: string }> = {
    'Fácil': { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
    'Médio': { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
    'Difícil': { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Gestão de Tarefas</Text>
          <Text style={styles.pageSub}>Total: {tasks.length} tarefas cadastradas</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>➕ Adicionar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={1}
        renderItem={({ item: t, index }) => {
          const diff = DIFF_COLOR[t.dificuldade] || DIFF_COLOR['Fácil'];
          return (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
              <View style={styles.taskCard}>
                <View style={styles.taskCardTop}>
                  <View style={styles.taskIconWrap}>
                    <Text style={styles.taskIcon}>{t.icone}</Text>
                  </View>
                  <View style={styles.taskBadges}>
                    <View style={[styles.pill, { backgroundColor: diff.bg }]}>
                      <Text style={[styles.pillText, { color: diff.text }]}>{t.dificuldade}</Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                      <Text style={[styles.pillText, { color: '#3B82F6' }]}>{t.categoria}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.taskTitle}>{t.titulo}</Text>
                <Text style={styles.taskDesc} numberOfLines={2}>{t.descricao}</Text>

                <View style={styles.taskMeta}>
                  <MetaItem emoji="💰" label="Recompensa" value={`Kz ${t.recompensa}`} />
                  <MetaItem emoji="⏱️" label="Tempo" value={t.tempo} />
                  <MetaItem emoji="✅" label="Completadas" value={String(t.completadas)} />
                </View>

                <View style={[styles.statusBar, t.status === 'ativo' ? styles.statusBarAtivo : styles.statusBarInativo]}>
                  <Text style={[styles.statusBarText, t.status === 'ativo' ? { color: '#22C55E' } : { color: '#EF4444' }]}>
                    {t.status === 'ativo' ? '✅ Ativo' : '❌ Inativo'}
                  </Text>
                </View>

                <View style={styles.taskActions}>
                  <TouchableOpacity style={[styles.taskActionBtn, { flex: 2 }]} onPress={() => openEdit(t)}>
                    <Text style={styles.taskActionBtnText}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.taskActionBtn, { flex: 1 }]} onPress={() => deleteTask(t.id)}>
                    <Text style={[styles.taskActionBtnText, { color: '#EF4444' }]}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          );
        }}
      />

      {/* Add/Edit Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editId ? 'Editar Tarefa' : 'Adicionar Tarefa'}</Text>
              <TouchableOpacity onPress={() => setModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {/* Icon picker */}
              <Text style={styles.formLabel}>Ícone</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
                {TASK_ICONS.map(ic => (
                  <TouchableOpacity
                    key={ic}
                    style={[styles.iconOption, form.icone === ic && styles.iconOptionSelected]}
                    onPress={() => setForm(p => ({ ...p, icone: ic }))}
                  >
                    <Text style={styles.iconOptionText}>{ic}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <FormField label="Título *" value={form.titulo || ''} onChange={v => setForm(p => ({ ...p, titulo: v }))} />
              <FormFieldArea label="Descrição *" value={form.descricao || ''} onChange={v => setForm(p => ({ ...p, descricao: v }))} />

              <Text style={styles.formLabel}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chipOption, form.categoria === cat && styles.chipOptionSelected]}
                    onPress={() => setForm(p => ({ ...p, categoria: cat }))}
                  >
                    <Text style={[styles.chipOptionText, form.categoria === cat && { color: '#FF8C00' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.formLabel}>Dificuldade</Text>
              <View style={styles.segmentRow}>
                {DIFFICULTIES.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.segmentBtn, form.dificuldade === d && styles.segmentBtnActive]}
                    onPress={() => setForm(p => ({ ...p, dificuldade: d }))}
                  >
                    <Text style={[styles.segmentText, form.dificuldade === d && { color: '#FF8C00' }]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <FormField label="Recompensa (Kz)" value={String(form.recompensa || 0)} onChange={v => setForm(p => ({ ...p, recompensa: Number(v) || 0 }))} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <FormField label="Tempo Estimado" value={form.tempo || ''} onChange={v => setForm(p => ({ ...p, tempo: v }))} />
                </View>
              </View>

              <Text style={styles.formLabel}>Status</Text>
              <View style={styles.segmentRow}>
                {['ativo','inativo'].map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.segmentBtn, form.status === s && styles.segmentBtnActive]}
                    onPress={() => setForm(p => ({ ...p, status: s as any }))}
                  >
                    <Text style={[styles.segmentText, form.status === s && { color: '#FF8C00' }]}>
                      {s === 'ativo' ? '✅ Ativo' : '❌ Inativo'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModal(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={saveTask}>
                <Text style={styles.btnSaveText}>💾 Salvar e Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MetaItem({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaValue}>{emoji} {value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

function FormField({ label, value, onChange, keyboardType = 'default' }: { label: string; value: string; onChange: (v: string) => void; keyboardType?: any }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput style={styles.formInput} value={value} onChangeText={onChange} keyboardType={keyboardType} placeholderTextColor="#4A5F8A" />
    </View>
  );
}

function FormFieldArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]} value={value} onChangeText={onChange} multiline placeholderTextColor="#4A5F8A" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1222' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  pageTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: '#F0F4FF' },
  pageSub: { fontSize: 12, color: '#4A5F8A', fontFamily: 'Nunito_400Regular', marginTop: 2 },
  addBtn: { backgroundColor: '#FF8C00', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  addBtnText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 13 },

  listContent: { padding: 16, gap: 12, paddingBottom: 20 },

  taskCard: {
    backgroundColor: '#111C30', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  taskCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  taskIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(255,140,0,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  taskIcon: { fontSize: 26 },
  taskBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  pillText: { fontSize: 10, fontFamily: 'Nunito_700Bold' },

  taskTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#F0F4FF', marginBottom: 5 },
  taskDesc: { fontSize: 12, color: '#8FA1C7', fontFamily: 'Nunito_400Regular', lineHeight: 18, marginBottom: 14 },

  taskMeta: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  metaItem: { flex: 1, backgroundColor: '#0D1526', borderRadius: 10, padding: 10, alignItems: 'center', gap: 3 },
  metaValue: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#F0F4FF' },
  metaLabel: { fontSize: 9, color: '#4A5F8A', fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.3 },

  statusBar: { borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginBottom: 10 },
  statusBarAtivo: { backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)' },
  statusBarInativo: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  statusBarText: { fontSize: 12, fontFamily: 'Nunito_700Bold' },

  taskActions: { flexDirection: 'row', gap: 8 },
  taskActionBtn: {
    backgroundColor: '#0D1526', borderRadius: 10, padding: 11,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center',
  },
  taskActionBtnText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#8FA1C7' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#111C30', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modalTitle: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: '#F0F4FF' },
  modalClose: { fontSize: 18, color: '#4A5F8A', padding: 4 },
  modalBody: { padding: 20 },
  modalFooter: {
    flexDirection: 'row', gap: 10, padding: 20,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },

  iconScroll: { marginBottom: 16 },
  iconOption: {
    width: 48, height: 48, borderRadius: 12, marginRight: 8,
    backgroundColor: '#0D1526', borderWidth: 2, borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconOptionSelected: { borderColor: '#FF8C00', backgroundColor: 'rgba(255,140,0,0.12)' },
  iconOptionText: { fontSize: 24 },

  chipOption: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8,
    backgroundColor: '#0D1526', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  chipOptionSelected: { backgroundColor: 'rgba(255,140,0,0.15)', borderColor: 'rgba(255,140,0,0.3)' },
  chipOptionText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: '#8FA1C7' },

  rowFields: { flexDirection: 'row', gap: 12 },

  formField: { marginBottom: 16 },
  formLabel: { fontSize: 12, color: '#8FA1C7', fontFamily: 'Nunito_600SemiBold', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4 },
  formInput: {
    backgroundColor: '#0D1526', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    color: '#F0F4FF', fontFamily: 'Nunito_400Regular', fontSize: 14,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  segmentRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  segmentBtn: {
    flex: 1, padding: 11, borderRadius: 10,
    backgroundColor: '#0D1526', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center',
  },
  segmentBtnActive: { backgroundColor: 'rgba(255,140,0,0.15)', borderColor: 'rgba(255,140,0,0.3)' },
  segmentText: { fontSize: 12, color: '#8FA1C7', fontFamily: 'Nunito_600SemiBold' },

  btnCancel: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: '#0D1526', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center',
  },
  btnCancelText: { color: '#8FA1C7', fontFamily: 'Nunito_600SemiBold', fontSize: 14 },
  btnSave: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: '#FF8C00', alignItems: 'center' },
  btnSaveText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 14 },
});
