import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, FlatList, Image, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { 
  Target, Users, TrendingUp, HeartHandshake, Building, MapPin, 
  Calendar, Pause, Play, Lock, Pencil, Trash2, X, UploadCloud, Tag
} from 'lucide-react-native';

interface Campaign {
  id: string;
  titulo: string;
  descricao: string;
  organizacao: string;
  localizacao: string;
  categoria: string;
  meta: number;
  arrecadado: number;
  doadores: number;
  status: 'ativa' | 'pausada' | 'finalizada';
  dataInicio: string;
  dataFim: string;
  imagem: string;
}

const CAUSA_COLORS: Record<string, { from: string; to: string; text: string }> = {
  Educação:     { from: '#1D4ED8', to: '#3B82F6', text: '#93C5FD' },
  Saúde:        { from: '#065F46', to: '#22C55E', text: '#86EFAC' },
  Ambiente:     { from: '#14532D', to: '#16A34A', text: '#86EFAC' },
  Alimentação:  { from: '#92400E', to: '#F59E0B', text: '#FCD34D' },
  Emergência:   { from: '#7F1D1D', to: '#EF4444', text: '#FCA5A5' },
  Social:       { from: '#4C1D95', to: '#8B5CF6', text: '#C4B5FD' },
};

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ativa:      { bg: '#22C55E', text: '#fff', label: 'ATIVA' },
  pausada:    { bg: '#F59E0B', text: '#fff', label: 'PAUSADA' },
  finalizada: { bg: '#6B7280', text: '#fff', label: 'FINALIZADA' },
};

const CATEGORIAS = ['Educação', 'Saúde', 'Ambiente', 'Alimentação', 'Emergência', 'Social'];
const STATUS_OPT = ['ativa', 'pausada', 'finalizada'] as const;

const mapCategoriaParaAdmin = (categoria: string) => {
  const mapa: Record<string, string> = {
    Educação: 'Educação',
    Saúde: 'Saúde',
    Ambiente: 'Meio Ambiente',
    Alimentação: 'Comunidade',
    Emergência: 'Comunidade',
    Social: 'Comunidade',
  };
  return mapa[categoria] || 'Comunidade';
};

type FormState = {
  titulo: string; descricao: string; organizacao: string; localizacao: string;
  categoria: string; meta: string; arrecadado: string;
  status: 'ativa' | 'pausada' | 'finalizada';
  dataInicio: string; dataFim: string; imagem: string;
};

const blankForm = (): FormState => ({
  titulo: '', descricao: '', organizacao: '', localizacao: '',
  categoria: 'Educação', meta: '100000', arrecadado: '0',
  status: 'ativa', dataInicio: '', dataFim: '', imagem: '',
});

export default function AdminCampaigns() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['admin', 'campaigns'],
    queryFn: () => adminService.getCampaigns(),
  });
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      form.imagem = result.assets[0].uri;
      //setForm(p => ({ ...p, imagem: form.imagem }));
      setPhotoUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  const campaigns = useMemo<Campaign[]>(() => {
    const raw = campaignsData?.campanhas || campaignsData?.campaigns || [];
    return raw.map((item: any) => {
     
      const statusRaw = String(item.status || '').toLowerCase();
      const ativa = typeof item.ativa === 'boolean' ? item.ativa : statusRaw === 'ativa';
      const status: Campaign['status'] =
        statusRaw === 'finalizada'
          ? 'finalizada'
          : statusRaw === 'pausada'
            ? 'pausada'
            : ativa
              ? 'ativa'
              : 'pausada';

      return {
        id: String(item.id),
        titulo: item.titulo || item.nome || '',
        descricao: item.descricao || '',
        organizacao: item.organizacao || '',
        localizacao: item.localizacao || item.provincia || 'Luanda',
        categoria: item.categoria || item.causa || 'Social',
        meta: Number(item.metaKz || item.meta_valor || 0),
        arrecadado: Number(item.arrecadadoKz || item.valor_arrecadado || 0),
        doadores: Number(item.doadores || item.total_doadores || 0),
        status,
        dataInicio: item.dataInicio || item.data_inicio || item.criado_em || '',
        dataFim: item.dataFim || item.data_fim || '',
        imagem: item.imagemCapa || item.imagem_url || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
      };
    });
  }, [campaignsData]);

  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      setModal(false);
      Alert.alert('Sucesso', 'Campanha criada com sucesso.');
    },
    onError: (err: any) => Alert.alert('Erro', err?.response?.data?.mensagem || 'Falha ao criar campanha.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      setModal(false);
      Alert.alert('Sucesso', 'Campanha atualizada com sucesso.');
    },
    onError: (err: any) => Alert.alert('Erro', err?.response?.data?.mensagem || 'Falha ao atualizar campanha.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      Alert.alert('Sucesso', 'Campanha eliminada com sucesso.');
    },
    onError: (err: any) => Alert.alert('Erro', err?.response?.data?.mensagem || 'Falha ao eliminar campanha.'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, ativa }: { id: string; ativa: boolean }) => adminService.updateCampaignStatus(id, ativa),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
    onError: (err: any) => Alert.alert('Erro', err?.response?.data?.mensagem || 'Falha ao atualizar status da campanha.'),
  });

  const stats = {
    ativas: campaigns.filter(c => c.status === 'ativa').length,
    doadores: campaigns.reduce((a, c) => a + c.doadores, 0),
    meta: campaigns.reduce((a, c) => a + c.meta, 0),
    arrecadado: campaigns.reduce((a, c) => a + c.arrecadado, 0),
  };

  const openAdd = () => { setEditId(null); setForm(blankForm()); setModal(true); };
  const openEdit = (c: Campaign) => {
    setEditId(c.id);
    setForm({
      titulo: c.titulo, descricao: c.descricao, organizacao: c.organizacao,
      localizacao: c.localizacao, categoria: c.categoria,
      meta: String(c.meta), arrecadado: String(c.arrecadado),
      imagem: photoUri || c.imagem,
      status: c.status, dataInicio: c.dataInicio, dataFim: c.dataFim, 
    });
    setModal(true);
  };

  const save = () => {
    if (!form.titulo || !form.organizacao) return;
    const metaNumerica = Number(form.meta) || 100000;
    const arrecadadoNumerico = Number(form.arrecadado) || 0;
    const categoriaAdmin = mapCategoriaParaAdmin(form.categoria);

    const payload = {
      // Campos esperados pelo backend admin (/admin/campanhas)
      titulo: form.titulo,
      descricao: form.descricao,
      categoria: categoriaAdmin,
      metaKz: metaNumerica,
      organizacao: form.organizacao,
      localizacao: form.localizacao,
      dataInicio: form.dataInicio,
      dataFim: form.dataFim,
      imagemCapa: form.imagem,

      // Campos de compatibilidade (fallback /campaigns)
      nome: form.titulo,
      provincia: form.localizacao,
      causa: form.categoria,
      meta: metaNumerica,
      meta_valor: metaNumerica,
      arrecadado: arrecadadoNumerico,
      valor_arrecadado: arrecadadoNumerico,
      status: form.status,
      ativa: form.status === 'ativa',
      data_inicio: form.dataInicio,
      data_fim: form.dataFim,
      imagem_url: form.imagem,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const del = (id: string) => Alert.alert('Eliminar Campanha', 'Tem a certeza?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
  ]);

  const toggleStatus = (c: Campaign) => {
    if (c.status === 'finalizada') return;
    statusMutation.mutate({ id: c.id, ativa: c.status !== 'ativa' });
  };

  const fmtKz = (n: number) => n >= 1000000 ? `Kz ${(n / 1000000).toFixed(1)}M` : `Kz ${(n / 1000).toFixed(0)}k`;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Gestão de Campanhas</Text>
          <Text style={styles.pageSub}>Total: {campaigns.length} campanhas solidárias</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Criar Campanha</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#EC4899" />
          <Text style={styles.loadingText}>Carregando campanhas...</Text>
        </View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={c => c.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            /* KPI row */
            <View style={styles.kpiRow}>
              <KpiCard Icon={Target} label="Campanhas Ativas" value={String(stats.ativas)} tag="ATIVAS" color="#22C55E" />
              <KpiCard Icon={Users} label="Doadores" value={stats.doadores.toLocaleString()} tag="TOTAL" color="#3B82F6" />
              <KpiCard Icon={TrendingUp} label="Meta Total" value={fmtKz(stats.meta)} tag="META" color="#F59E0B" />
              <KpiCard Icon={HeartHandshake} label="Arrecadado" value={fmtKz(stats.arrecadado)} tag="ARRECADADO" color="#EC4899" />
            </View>
          )}
          renderItem={({ item: c, index }) => {
          const causeStyle = CAUSA_COLORS[c.categoria] || CAUSA_COLORS['Social'];
          const statusStyle = STATUS_STYLE[c.status];
          const pct = c.meta > 0 ? Math.min(100, Math.round((c.arrecadado / c.meta) * 100)) : 0;
          const progressColor = c.status === 'finalizada' ? '#22C55E' : c.status === 'pausada' ? '#F59E0B' : '#EC4899';

          return (
            <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
              <View style={styles.campaignCard}>
                {/* Cover Image */}
                <View style={styles.imageWrap}>
                  <Image source={{ uri: c.imagem }} style={styles.image} resizeMode="cover" />
                  {/* Gradient overlay */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.75)']}
                    style={styles.imageGradient}
                  />
                  {/* Badges on image */}
                  <View style={[styles.catBadgeWrap, { backgroundColor: causeStyle.from }]}>
                    <Text style={[styles.catBadgeText, { color: causeStyle.text }]}>{c.categoria.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={styles.statusBadgeText}>{statusStyle.label}</Text>
                  </View>

                  {/* Progress bar on image bottom */}
                  <View style={styles.imageProgressWrap}>
                    <View style={styles.imageProgressBar}>
                      <View style={[styles.imageProgressFill, { width: `${pct}%` as any, backgroundColor: progressColor }]} />
                    </View>
                    <View style={styles.imageProgressInfo}>
                      <Text style={styles.imageProgressPct}>{pct}%</Text>
                      <Text style={styles.imageProgressVals}>
                        {fmtKz(c.arrecadado)} / {fmtKz(c.meta)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Body */}
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{c.titulo}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{c.descricao}</Text>

                  {/* Org + Location */}
                  <View style={styles.orgRow}>
                    <View style={styles.orgChip}>
                      <Building size={12} color="#8FA1C7" />
                      <Text style={styles.orgChipText}>{c.organizacao}</Text>
                    </View>
                    <View style={styles.orgChip}>
                      <MapPin size={12} color="#8FA1C7" />
                      <Text style={styles.orgChipText}>{c.localizacao}</Text>
                    </View>
                  </View>

                  {/* Stats */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{c.doadores}</Text>
                      <Text style={styles.statLabel}>Doadores</Text>
                    </View>
                    {c.dataInicio ? (
                      <>
                        <View style={styles.statItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} color="#F0F4FF" />
                            <Text style={styles.statValue}>{c.dataInicio}</Text>
                          </View>
                          <Text style={styles.statLabel}>Início</Text>
                        </View>
                        <View style={styles.statItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} color="#F0F4FF" />
                            <Text style={styles.statValue}>{c.dataFim}</Text>
                          </View>
                          <Text style={styles.statLabel}>Fim</Text>
                        </View>
                      </>
                    ) : null}
                  </View>

                  {/* Actions */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.pauseBtn, c.status === 'pausada' && styles.pauseBtnActive]}
                      onPress={() => toggleStatus(c)}
                      disabled={statusMutation.isPending || c.status === 'finalizada'}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        {c.status === 'ativa' ? <Pause size={14} color="#F59E0B" /> : c.status === 'pausada' ? <Play size={14} color="#22C55E" /> : <Lock size={14} color="#8FA1C7" />}
                        <Text style={[styles.pauseBtnText, c.status === 'ativa' ? undefined : c.status === 'pausada' ? { color: '#22C55E' } : { color: '#8FA1C7' }]}>
                          {c.status === 'ativa' ? 'Pausar' : c.status === 'pausada' ? 'Ativar' : 'Finalizada'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(c)}>
                      <Pencil size={18} color="#8FA1C7" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconBtn, styles.delIconBtn, deleteMutation.isPending && { opacity: 0.5 }]}
                      onPress={() => del(c.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Animated.View>
          );
          }}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhuma campanha cadastrada.</Text>
            </View>
          )}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editId ? 'Editar Campanha' : 'Criar Nova Campanha'}</Text>
              <TouchableOpacity onPress={() => setModal(false)} style={styles.closeBtn}>
                <X size={20} color="#8FA1C7" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Image URL / Upload */}
              <Text style={styles.fieldLabel}>Imagem de Capa *</Text>
              <View style={styles.uploadArea}>
                <UploadCloud size={32} color="#8FA1C7" style={{ marginBottom: 8 }} />
                <Text style={styles.uploadText}>Imagem de capa da campanha (recomendado: 1200x600px)</Text>
                <TextInput
                  style={[styles.input, { marginTop: 10 }]}
                  placeholder="Cole a URL da imagem..."
                  placeholderTextColor="#4A5F8A"
                  value={form.imagem}
                  onChangeText={v => setForm(p => ({ ...p, imagem: v }))}
                />
                <TouchableOpacity style={styles.chooseImgBtn} onPress={pickImage}>
                  <Text style={styles.chooseImgText}>Escolher Imagem</Text>
                </TouchableOpacity>
              </View>

              <Field label="Título da Campanha *">
                <TextInput style={styles.input} placeholder="Ex: Livros para Escolas de Luanda"
                  placeholderTextColor="#4A5F8A" value={form.titulo}
                  onChangeText={v => setForm(p => ({ ...p, titulo: v }))} />
              </Field>

              <Field label="Descrição *">
                <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Descreva o objetivo e impacto da campanha..."
                  placeholderTextColor="#4A5F8A" multiline value={form.descricao}
                  onChangeText={v => setForm(p => ({ ...p, descricao: v }))} />
              </Field>

              <View style={styles.row2}>
                <Field label="Organização *" flex={1}>
                  <TextInput style={styles.input} placeholder="Nome do ONG/Organização"
                    placeholderTextColor="#4A5F8A" value={form.organizacao}
                    onChangeText={v => setForm(p => ({ ...p, organizacao: v }))} />
                </Field>
                <Field label="Localização" flex={1}>
                  <TextInput style={styles.input} placeholder="Cidade/Província"
                    placeholderTextColor="#4A5F8A" value={form.localizacao}
                    onChangeText={v => setForm(p => ({ ...p, localizacao: v }))} />
                </Field>
              </View>

              <View style={styles.row3}>
                <Field label="Categoria *" flex={1}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {CATEGORIAS.map(cat => (
                      <TouchableOpacity key={cat}
                        style={[styles.miniChip, form.categoria === cat && styles.miniChipActive]}
                        onPress={() => setForm(p => ({ ...p, categoria: cat }))}>
                        <Text style={[styles.miniChipText, form.categoria === cat && { color: '#FF8C00' }]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Field>
              </View>

              <View style={styles.row2}>
                <Field label="Meta (Kz) *" flex={1}>
                  <TextInput style={styles.input} placeholder="100000" keyboardType="numeric"
                    placeholderTextColor="#4A5F8A" value={form.meta}
                    onChangeText={v => setForm(p => ({ ...p, meta: v }))} />
                </Field>
                <Field label="Status" flex={1}>
                  <View style={styles.segRow}>
                    {STATUS_OPT.map(s => (
                      <TouchableOpacity key={s}
                        style={[styles.seg, form.status === s && styles.segActive]}
                        onPress={() => setForm(p => ({ ...p, status: s }))}>
                        <Text style={[styles.segText, form.status === s && { color: '#FF8C00' }]}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Field>
              </View>

              <View style={styles.row2}>
                <Field label="Data de Início" flex={1}>
                  <TextInput style={styles.input} placeholder="dd/mm/aaaa"
                    placeholderTextColor="#4A5F8A" value={form.dataInicio}
                    onChangeText={v => setForm(p => ({ ...p, dataInicio: v }))} />
                </Field>
                <Field label="Data de Fim" flex={1}>
                  <TextInput style={styles.input} placeholder="dd/mm/aaaa"
                    placeholderTextColor="#4A5F8A" value={form.dataFim}
                    onChangeText={v => setForm(p => ({ ...p, dataFim: v }))} />
                </Field>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModal(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btnSave,
                  { backgroundColor: '#EC4899', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
                  (createMutation.isPending || updateMutation.isPending) && { opacity: 0.7 },
                ]}
                onPress={save}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Tag size={16} color="#fff" />
                <Text style={styles.btnSaveText}>{editId ? 'Salvar' : 'Criar Campanha'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function KpiCard({ Icon, label, value, tag, color }: { Icon: any; label: string; value: string; tag: string; color: string }) {
  return (
    <View style={[styles.kpiCard, { borderColor: `${color}30` }]}>
      <View style={styles.kpiTop}>
        <Icon size={22} color={color} />
        <View style={[styles.kpiTag, { backgroundColor: `${color}22` }]}>
          <Text style={[styles.kpiTagText, { color }]}>{tag}</Text>
        </View>
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function Field({ label, children, flex }: { label: string; children: React.ReactNode; flex?: number }) {
  return (
    <View style={[{ marginBottom: 16 }, flex !== undefined && { flex }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const S = { bg: '#0B1222', card: '#111C30', sidebar: '#0D1526', border: 'rgba(255,255,255,0.07)', text: '#F0F4FF', sub: '#8FA1C7', muted: '#4A5F8A', orange: '#FF8C00' };

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
    backgroundColor: '#EC4899', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: '#EC4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  addBtnText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 13 },

  listContent: { padding: 14, paddingBottom: 24 },

  // KPI
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  kpiCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: S.card, borderRadius: 14, padding: 14,
    borderWidth: 1, marginBottom: 0,
  },
  kpiTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  kpiIcon: { fontSize: 22 },
  kpiTag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  kpiTagText: { fontSize: 9, fontFamily: 'Nunito_700Bold' },
  kpiValue: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: S.text, marginBottom: 2 },
  kpiLabel: { fontSize: 10, color: S.muted, fontFamily: 'Nunito_400Regular' },

  // Campaign card
  campaignCard: {
    backgroundColor: S.card, borderRadius: 18,
    overflow: 'hidden', borderWidth: 1, borderColor: S.border, marginBottom: 16,
  },
  imageWrap: { width: '100%', height: 180, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageGradient: { position: 'absolute', inset: 0, bottom: 0, height: '60%', top: 'auto' },
  catBadgeWrap: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 7 },
  catBadgeText: { fontSize: 10, fontFamily: 'Nunito_700Bold', letterSpacing: 0.5 },
  statusBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 7 },
  statusBadgeText: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: '#fff' },

  imageProgressWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
  imageProgressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  imageProgressFill: { height: '100%', borderRadius: 2 },
  imageProgressInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  imageProgressPct: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: '#fff' },
  imageProgressVals: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: 'Nunito_400Regular' },

  cardBody: { padding: 16 },
  cardTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: S.text, marginBottom: 5 },
  cardDesc: { fontSize: 12, color: S.sub, fontFamily: 'Nunito_400Regular', lineHeight: 18, marginBottom: 12 },

  orgRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  orgChip: {
    backgroundColor: S.sidebar, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: S.border, flexDirection: 'row', alignItems: 'center', gap: 4
  },
  orgChipText: { fontSize: 11, color: S.sub, fontFamily: 'Nunito_400Regular' },

  statsRow: { flexDirection: 'row', gap: 14, marginBottom: 14, flexWrap: 'wrap' },
  statItem: {},
  statValue: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: S.text },
  statLabel: { fontSize: 10, color: S.muted, fontFamily: 'Nunito_400Regular' },

  actions: { flexDirection: 'row', gap: 8 },
  pauseBtn: {
    flex: 1, backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
    borderRadius: 10, padding: 11, alignItems: 'center',
  },
  pauseBtnActive: { backgroundColor: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.25)' },
  pauseBtnText: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#F59E0B' },
  iconBtn: {
    width: 40, height: 40, backgroundColor: S.sidebar, borderRadius: 10,
    borderWidth: 1, borderColor: S.border, alignItems: 'center', justifyContent: 'center',
  },
  delIconBtn: { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#111C30', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', maxHeight: '94%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: S.border,
  },
  modalTitle: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: S.text },
  closeBtn: { padding: 6 },
  closeBtnText: { fontSize: 18, color: S.muted },
  modalBody: { paddingHorizontal: 20, paddingTop: 16 },
  modalFooter: { flexDirection: 'row', gap: 10, padding: 20, borderTopWidth: 1, borderTopColor: S.border },

  uploadArea: {
    backgroundColor: S.sidebar, borderRadius: 14, borderWidth: 1, borderColor: S.border,
    borderStyle: 'dashed', padding: 20, alignItems: 'center', marginBottom: 16,
  },
  uploadIcon: { fontSize: 28, marginBottom: 8 },
  uploadText: { fontSize: 12, color: S.muted, fontFamily: 'Nunito_400Regular', textAlign: 'center', marginBottom: 4 },
  chooseImgBtn: {
    marginTop: 10, backgroundColor: S.bg, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: S.border,
  },
  chooseImgText: { fontSize: 13, color: S.sub, fontFamily: 'Nunito_600SemiBold' },

  fieldLabel: { fontSize: 11, color: S.sub, fontFamily: 'Nunito_700Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: {
    backgroundColor: S.sidebar, borderRadius: 10, borderWidth: 1, borderColor: S.border,
    color: S.text, fontFamily: 'Nunito_400Regular', fontSize: 14,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  row2: { flexDirection: 'row', gap: 12 },
  row3: {},
  miniChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 6,
    backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border,
  },
  miniChipActive: { backgroundColor: 'rgba(255,140,0,0.15)', borderColor: 'rgba(255,140,0,0.3)' },
  miniChipText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: S.sub },
  segRow: { flexDirection: 'row', gap: 6 },
  seg: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border, alignItems: 'center' },
  segActive: { backgroundColor: 'rgba(255,140,0,0.15)', borderColor: 'rgba(255,140,0,0.3)' },
  segText: { fontSize: 11, color: S.sub, fontFamily: 'Nunito_600SemiBold' },
  btnCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border, alignItems: 'center' },
  btnCancelText: { color: S.sub, fontFamily: 'Nunito_600SemiBold', fontSize: 14 },
  btnSave: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: S.orange, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 14 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: S.sub, fontFamily: 'Nunito_600SemiBold' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: S.muted, fontFamily: 'Nunito_600SemiBold' },
});
