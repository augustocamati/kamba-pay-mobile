import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Modal, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';
import { NovaMissaoModal } from '../../../components/NovaMissaoModal';
import { missionService } from '../../../lib/api';

// ─── Mission type chips ────────────────────────────────────────────────────────
const MISSION_TYPES = [
  { key: 'poupanca', label: 'Poupança', icon: '💰', color: ['#3b82f6', '#22c55e'] },
  { key: 'estudo', label: 'Estudo', icon: '📚', color: ['#7c3aed', '#3b82f6'] },
  { key: 'comportamento', label: 'Comp.', icon: '⭐', color: ['#f59e0b', '#ef4444'] },
  { key: 'autonomia', label: 'Autonomia', icon: '☀️', color: ['#10b981', '#3b82f6'] },
  { key: 'saude', label: 'Saúde', icon: '❤️', color: ['#ef4444', '#f43f5e'] },
  { key: 'solidariedade', label: 'Social', icon: '🤝', color: ['#ec4899', '#f43f5e'] },
];

function getColorForType(tipo: string): [string, string] {
  const found = MISSION_TYPES.find(t => t.key === tipo);
  return (found?.color as [string, string]) || ['#0984E3', '#0652DD'];
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────
type TabKey = 'concluidas' | 'ativas' | 'todas';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'ativas', label: 'Em Andamento' },
  { key: 'concluidas', label: 'Concluídas' },
];

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const { dependentes, criarMissao, refreshData } = useApp();

  const [allMissions, setAllMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('todas');
  const [novaMissaoModal, setNovaMissaoModal] = useState(false);

  // Edit state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editMission, setEditMission] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    titulo: '', descricao: '', objetivo_valor: '', recompensa: '', tipo: 'poupanca', icone: '🎯',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteMission, setDeleteMission] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch ALL missions (sem filtro de ativa) ────────────────────────────────
  const fetchMissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await missionService.getMissionsParent();
      const missoes = (res.missoes || []).map((m: any) => ({
        ...m,
        // Uma missão é concluída se o backend marca como concluida OU se o progresso atingiu o objetivo
        concluida: m.concluida || (m.progresso_atual >= m.objetivo_valor && m.objetivo_valor > 0),
      }));
      setAllMissions(missoes);
    } catch (e) {
      console.error('Erro ao buscar missões:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMissions(); }, [fetchMissions]);

  // ─── Filtered list ───────────────────────────────────────────────────────────
  const filteredMissions = allMissions.filter(m => {
    if (tab === 'concluidas') return m.concluida;
    if (tab === 'ativas') return !m.concluida;
    return true;
  });

  // ─── Create mission ──────────────────────────────────────────────────────────
  const handleCriarMissao = async (dados: any) => {
    try {
      await criarMissao({
        ...dados,
        objetivo_valor: parseFloat(dados.objetivo_valor),
        recompensa: parseFloat(dados.recompensa || 0),
        crianca_id: dados.crianca_id || dependentes[0]?.id,
      });
      Alert.alert('Sucesso 🎯', `Missão "${dados.titulo}" criada!`);
      setNovaMissaoModal(false);
      fetchMissions();
    } catch (e: any) {
      Alert.alert('Erro', 'Não foi possível criar a missão.');
    }
  };

  // ─── Open edit ───────────────────────────────────────────────────────────────
  const openEdit = (mission: any) => {
    setEditMission(mission);
    setEditForm({
      titulo: mission.titulo,
      descricao: mission.descricao || '',
      objetivo_valor: String(mission.objetivo_valor),
      recompensa: String(mission.recompensa || 0),
      tipo: mission.tipo || 'poupanca',
      icone: mission.icone || '🎯',
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editMission) return;
    setIsSaving(true);
    try {
      await missionService.updateMission(editMission.id, {
        titulo: editForm.titulo,
        descricao: editForm.descricao,
        objetivo_valor: parseFloat(editForm.objetivo_valor),
        recompensa: parseFloat(editForm.recompensa || '0'),
        tipo: editForm.tipo,
        icone: MISSION_TYPES.find(t => t.key === editForm.tipo)?.icon || '🎯',
      });
      Alert.alert('Sucesso ✅', 'Missão atualizada!');
      setEditModalVisible(false);
      fetchMissions();
      refreshData();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erro', e.response?.data?.mensagem || 'Falha ao atualizar missão.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const openDelete = (mission: any) => {
    setDeleteMission(mission);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteMission) return;
    setIsDeleting(true);
    try {
      await missionService.deleteMission(deleteMission.id);
      Alert.alert('Sucesso', 'Missão apagada.');
      setDeleteModalVisible(false);
      fetchMissions();
      refreshData();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erro', e.response?.data?.mensagem || 'Falha ao apagar missão.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  const renderMissionCard = (missao: any) => {
    const progresso = Math.min(Math.round((missao.progresso_atual / missao.objetivo_valor) * 100), 100);
    const childDep = dependentes.find(d => d.id === missao.crianca_id);
    const colors = getColorForType(missao.tipo);
    const isComplete = missao.concluida;

    return (
      <View key={missao.id} style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{missao.icone}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.cardTitle}>{missao.titulo}</Text>
            <Text style={styles.cardSubtitle}>
              {missao.tipo}{childDep ? ` • ${childDep.nome}` : ''}
            </Text>
          </View>

          {isComplete ? (
            <View style={styles.completeBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
              <Text style={styles.completeBadgeText}>Feita</Text>
            </View>
          ) : (
            <Text style={styles.percentText}>{progresso}%</Text>
          )}
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={colors}
            style={[styles.progressBar, { width: `${progresso}%` }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          />
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            {missao.progresso_atual.toLocaleString()} / {missao.objetivo_valor.toLocaleString()} Kz
          </Text>
          {missao.recompensa > 0 && (
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardText}>+{missao.recompensa} Kz</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtnSmall} onPress={() => openEdit(missao)}>
            <Ionicons name="pencil" size={16} color="#93c5fd" />
            <Text style={styles.actionBtnSmallText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtnSmall, styles.deleteBtnSmall]} onPress={() => openDelete(missao)}>
            <Ionicons name="trash" size={16} color="#f87171" />
            <Text style={[styles.actionBtnSmallText, { color: '#f87171' }]}>Apagar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a']} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.title}>Metas e Missões</Text>
        <Text style={styles.subtitle}>Acompanhe o planejamento financeiro</Text>

        {/* Criar Nova Missão */}
        <LinearGradient colors={['#fbbf24', '#f59e0b']} style={[styles.actionCard, { marginBottom: 20 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionCardTitle}>Criar Nova Missão</Text>
            <Text style={styles.actionCardSubtitle}>Defina metas para seus filhos</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setNovaMissaoModal(true)} activeOpacity={0.85}>
              <Ionicons name="flag" size={18} color="#d97706" />
              <Text style={[styles.actionBtnText, { color: '#d97706' }]}>Criar Missão</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 52 }}>🎯</Text>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabBtnText, tab === t.key && styles.tabBtnTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mission list */}
        {loading ? (
          <ActivityIndicator color="#fbbf24" style={{ marginTop: 40 }} />
        ) : filteredMissions.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 40 }}>{tab === 'concluidas' ? '🏆' : '🎯'}</Text>
            <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 14, textAlign: 'center' }}>
              {tab === 'concluidas'
                ? 'Ainda não há missões concluídas.'
                : 'Ainda não há missões em andamento.\nCrie a primeira agora!'}
            </Text>
          </View>
        ) : (
          filteredMissions.map(renderMissionCard)
        )}
      </ScrollView>

      {/* ─── Create Modal ─────────────────────────────────────────────────────── */}
      <NovaMissaoModal
        visible={novaMissaoModal}
        onClose={() => setNovaMissaoModal(false)}
        onCriar={handleCriarMissao}
        dependentes={dependentes}
      />

      {/* ─── Edit Modal ───────────────────────────────────────────────────────── */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Missão</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Título</Text>
              <TextInput
                style={styles.input}
                value={editForm.titulo}
                onChangeText={t => setEditForm(p => ({ ...p, titulo: t }))}
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={editForm.descricao}
                onChangeText={t => setEditForm(p => ({ ...p, descricao: t }))}
                multiline
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Valor do Objetivo (Kz)</Text>
              <TextInput
                style={styles.input}
                value={editForm.objetivo_valor}
                onChangeText={t => setEditForm(p => ({ ...p, objetivo_valor: t }))}
                keyboardType="numeric"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Recompensa (Kz)</Text>
              <TextInput
                style={styles.input}
                value={editForm.recompensa}
                onChangeText={t => setEditForm(p => ({ ...p, recompensa: t }))}
                keyboardType="numeric"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Tipo de Missão</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {MISSION_TYPES.map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.chipBtn, editForm.tipo === t.key && styles.chipBtnActive]}
                    onPress={() => setEditForm(p => ({ ...p, tipo: t.key, icone: t.icon }))}
                  >
                    <Text style={[styles.chipText, editForm.tipo === t.key && styles.chipTextActive]}>
                      {t.icon} {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                onPress={handleSaveEdit}
                disabled={isSaving}
              >
                <Text style={styles.saveBtnText}>{isSaving ? 'A Guardar...' : 'Guardar Alterações'}</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Delete Confirmation Modal ────────────────────────────────────────── */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteBox}>
            <View style={styles.deleteIconWrap}>
              <Ionicons name="warning" size={40} color="#f87171" />
            </View>
            <Text style={styles.deleteTitle}>Apagar Missão?</Text>
            <Text style={styles.deleteDesc}>
              Tem a certeza que deseja apagar a missão "{deleteMission?.titulo}"? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.deleteCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteConfirmBtn, isDeleting && { opacity: 0.7 }]}
                onPress={handleConfirmDelete}
                disabled={isDeleting}
              >
                <Text style={styles.deleteConfirmText}>{isDeleting ? 'Apagando...' : 'Apagar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 14, color: '#93c5fd', marginBottom: 24 },

  // Tabs
  tabRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, padding: 4, marginBottom: 20,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: 'rgba(59,130,246,0.3)' },
  tabBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  tabBtnTextActive: { color: '#fff' },

  // Mission cards
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  icon: { fontSize: 32 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  cardSubtitle: { fontSize: 13, color: '#94a3b8', textTransform: 'capitalize' },
  percentText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  completeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(34,197,94,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  completeBadgeText: { color: '#22c55e', fontSize: 12, fontWeight: '700' },
  progressTrack: {
    height: 10, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5, overflow: 'hidden', marginBottom: 12,
  },
  progressBar: { height: '100%', borderRadius: 5 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  footerText: { fontSize: 13, color: '#94a3b8' },
  rewardBadge: { backgroundColor: 'rgba(52,211,153,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  rewardText: { color: '#34d399', fontWeight: '700', fontSize: 12 },

  // Card action buttons
  cardActions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 12 },
  actionBtnSmall: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  deleteBtnSmall: { backgroundColor: 'rgba(239,68,68,0.1)' },
  actionBtnSmallText: { color: '#93c5fd', fontSize: 13, fontWeight: '600' },

  // Create card
  actionCard: {
    borderRadius: 20, padding: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  actionCardTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  actionCardSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 14 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 16,
    alignSelf: 'flex-start', gap: 6,
  },
  actionBtnText: { fontWeight: '700', fontSize: 14 },

  // Edit modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '85%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, marginBottom: 16,
  },
  chipBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
  },
  chipBtnActive: { backgroundColor: 'rgba(59,130,246,0.3)', borderColor: '#3b82f6' },
  chipText: { color: '#94a3b8', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#fb923c', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Delete modal
  deleteOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  deleteBox: {
    backgroundColor: '#1e293b', borderRadius: 24, padding: 28, width: '100%',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  deleteIconWrap: {
    backgroundColor: 'rgba(239,68,68,0.15)', width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  deleteTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 },
  deleteDesc: { color: '#94a3b8', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  deleteActions: { flexDirection: 'row', gap: 12, width: '100%' },
  deleteCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  deleteCancelText: { color: '#94a3b8', fontWeight: '700', fontSize: 15 },
  deleteConfirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: '#ef4444' },
  deleteConfirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
