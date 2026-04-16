import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, TextInput, Alert, Pressable, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Eye, Pencil, Trash2, X, UploadCloud, Image as ImageIcon, Clapperboard } from 'lucide-react-native';

interface AdminVideo {
  id: string; titulo: string; descricao: string;
  url: string; thumbnail: string; categoria: string;
  duracao: string; visualizacoes: number;
}

const CATEGORIES = ['Poupar', 'Gastar', 'Ajudar', 'Investir', 'Planejamento'];
const CAT_COLORS: Record<string, string> = {
  Poupar: '#22C55E', Gastar: '#F59E0B', Ajudar: '#EC4899',
  Investir: '#3B82F6', Planejamento: '#8B5CF6',
};

const INITIAL_VIDEOS: AdminVideo[] = [
  {
    id: 'v-1', titulo: 'O Que é Poupar?',
    descricao: 'Aprenda a importância de guardar dinheiro para o futuro',
    url: 'https://youtube.com/watch?v=demo1',
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80',
    categoria: 'Poupar', duracao: '4:30', visualizacoes: 1240,
  },
  {
    id: 'v-2', titulo: 'Como Gastar com Sabedoria',
    descricao: 'Dicas para fazer boas escolhas na hora de comprar',
    url: 'https://youtube.com/watch?v=demo2',
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80',
    categoria: 'Gastar', duracao: '3:15', visualizacoes: 890,
  },
  {
    id: 'v-3', titulo: 'Ajudar Quem Precisa',
    descricao: 'Por que compartilhar faz bem para todos',
    url: 'https://youtube.com/watch?v=demo3',
    thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80',
    categoria: 'Ajudar', duracao: '5:00', visualizacoes: 670,
  },
  {
    id: 'v-4', titulo: 'O Que É Investir?',
    descricao: 'Entenda como fazer o dinheiro trabalhar para você',
    url: 'https://youtube.com/watch?v=demo4',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    categoria: 'Investir', duracao: '6:20', visualizacoes: 430,
  },
  {
    id: 'v-5', titulo: 'Planeja teu Orçamento',
    descricao: 'Como organizar o dinheiro que você tem para não faltar',
    url: 'https://youtube.com/watch?v=demo5',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
    categoria: 'Planejamento', duracao: '5:45', visualizacoes: 560,
  },
];

type FormState = {
  titulo: string; descricao: string; url: string;
  thumbnail: string; categoria: string; duracao: string;
};

export default function AdminVideos() {
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState<AdminVideo[]>(INITIAL_VIDEOS);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ titulo: '', descricao: '', url: '', thumbnail: '', categoria: 'Poupar', duracao: '' });

  const openAdd = () => { setEditId(null); setForm({ titulo: '', descricao: '', url: '', thumbnail: '', categoria: 'Poupar', duracao: '' }); setModal(true); };
  const openEdit = (v: AdminVideo) => {
    setEditId(v.id);
    setForm({ titulo: v.titulo, descricao: v.descricao, url: v.url, thumbnail: v.thumbnail, categoria: v.categoria, duracao: v.duracao });
    setModal(true);
  };

  const save = () => {
    if (!form.titulo) return;
    const thumb = form.thumbnail || `https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80`;
    if (editId) {
      setVideos(p => p.map(v => v.id === editId ? { ...v, ...form, thumbnail: thumb } : v));
    } else {
      setVideos(p => [{ id: `v-${Date.now()}`, ...form, thumbnail: thumb, visualizacoes: 0 }, ...p]);
    }
    setModal(false);
  };

  const del = (id: string) => Alert.alert('Eliminar Vídeo', 'Tem a certeza?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: () => setVideos(p => p.filter(v => v.id !== id)) },
  ]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Gestão de Vídeos</Text>
          <Text style={styles.pageSub}>Total: {videos.length} vídeos cadastrados</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Adicionar Vídeo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        keyExtractor={v => v.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: v, index }) => {
          const color = CAT_COLORS[v.categoria] || '#FF8C00';
          return (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
              <View style={styles.videoCard}>
                {/* Thumbnail with gradient overlay */}
                <View style={styles.thumbWrap}>
                  <Image source={{ uri: v.thumbnail }} style={styles.thumb} resizeMode="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.thumbGrad} />
                  <View style={styles.playCircle}>
                    <Play size={24} color="#0B1222" style={{ marginLeft: 3 }} />
                  </View>
                  <View style={[styles.catLabel, { backgroundColor: color }]}>
                    <Text style={styles.catLabelText}>{v.categoria}</Text>
                  </View>
                  {v.duracao ? (
                    <View style={styles.durationWrap}>
                      <Text style={styles.durationText}>{v.duracao}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Info */}
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{v.titulo}</Text>
                  <Text style={styles.videoDesc} numberOfLines={2}>{v.descricao}</Text>
                  <View style={styles.videoMeta}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Eye size={14} color="#8FA1C7" />
                      <Text style={styles.viewCount}>{v.visualizacoes.toLocaleString()} visualizações</Text>
                    </View>
                  </View>
                  <View style={styles.videoActions}>
                    <TouchableOpacity style={[styles.actionBtn, { flex: 2 }]} onPress={() => openEdit(v)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Pencil size={14} color="#8FA1C7" />
                        <Text style={styles.actionBtnText}>Editar</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.delBtn]} onPress={() => del(v.id)}>
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Animated.View>
          );
        }}
      />

      {/* Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editId ? 'Editar Vídeo' : 'Adicionar Novo Vídeo'}</Text>
              <TouchableOpacity onPress={() => setModal(false)} style={styles.closeBtn}>
                <X size={20} color="#8FA1C7" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Field label="Título *">
                <TextInput style={styles.input} placeholder="Ex: O que é Poupar?"
                  placeholderTextColor="#4A5F8A" value={form.titulo}
                  onChangeText={v => setForm(p => ({ ...p, titulo: v }))} />
              </Field>
              <Field label="Descrição *">
                <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Descreva o conteúdo do vídeo..."
                  placeholderTextColor="#4A5F8A" multiline value={form.descricao}
                  onChangeText={v => setForm(p => ({ ...p, descricao: v }))} />
              </Field>

              {/* Video upload area */}
              <Text style={styles.fieldLabel}>Vídeo *</Text>
              <View style={styles.uploadBox}>
                <UploadCloud size={32} color="#8FA1C7" style={{ marginBottom: 12 }} />
                <Text style={styles.uploadHint}>Arraste um vídeo ou clique para fazer upload</Text>
                <TextInput style={[styles.input, styles.uploadInput]}
                  placeholder="Ou cole a URL do vídeo (YouTube, Vimeo...)"
                  placeholderTextColor="#4A5F8A" value={form.url}
                  onChangeText={v => setForm(p => ({ ...p, url: v }))} />
                <TouchableOpacity style={styles.chooseBtn}>
                  <Text style={styles.chooseBtnText}>Escolher Arquivo</Text>
                </TouchableOpacity>
              </View>

              {/* Thumbnail */}
              <Text style={styles.fieldLabel}>Thumbnail</Text>
              <View style={styles.uploadBox}>
                <ImageIcon size={32} color="#8FA1C7" style={{ marginBottom: 12 }} />
                <Text style={styles.uploadHint}>Imagem de capa do vídeo</Text>
                <TextInput style={[styles.input, styles.uploadInput]}
                  placeholder="Cole a URL da thumbnail..."
                  placeholderTextColor="#4A5F8A" value={form.thumbnail}
                  onChangeText={v => setForm(p => ({ ...p, thumbnail: v }))} />
                <TouchableOpacity style={styles.chooseBtn}>
                  <Text style={styles.chooseBtnText}>Escolher Imagem</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row2}>
                <Field label="Categoria *" flex={1}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {CATEGORIES.map(c => (
                      <TouchableOpacity key={c}
                        style={[styles.chip, form.categoria === c && styles.chipActive]}
                        onPress={() => setForm(p => ({ ...p, categoria: c }))}>
                        <Text style={[styles.chipText, form.categoria === c && { color: '#FF8C00' }]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Field>
                <Field label="Duração" flex={0.55}>
                  <TextInput style={styles.input} placeholder="Ex: 3:45"
                    placeholderTextColor="#4A5F8A" value={form.duracao}
                    onChangeText={v => setForm(p => ({ ...p, duracao: v }))} />
                </Field>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModal(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSave, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]} onPress={save}>
                <Clapperboard size={16} color="#fff" />
                <Text style={styles.btnSaveText}>{editId ? 'Salvar' : 'Adicionar Vídeo'}</Text>
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
    backgroundColor: S.orange, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: S.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  addBtnText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 13 },
  listContent: { padding: 14, paddingBottom: 24, gap: 14 },

  videoCard: {
    backgroundColor: S.card, borderRadius: 18,
    overflow: 'hidden', borderWidth: 1, borderColor: S.border,
  },
  thumbWrap: { width: '100%', height: 190, position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  thumbGrad: { position: 'absolute', inset: 0 },
  playCircle: {
    position: 'absolute', top: '50%', left: '50%',
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
    marginTop: -26, marginLeft: -26,
  },
  playIcon: { fontSize: 18, color: '#0B1222', paddingLeft: 4 },
  catLabel: {
    position: 'absolute', top: 10, left: 10,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  catLabelText: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: '#fff' },
  durationWrap: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.72)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5,
  },
  durationText: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: '#fff' },

  videoInfo: { padding: 16 },
  videoTitle: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: S.text, marginBottom: 5 },
  videoDesc: { fontSize: 12, color: S.sub, fontFamily: 'Nunito_400Regular', lineHeight: 18, marginBottom: 10 },
  videoMeta: { marginBottom: 12 },
  viewCount: { fontSize: 12, color: S.muted, fontFamily: 'Nunito_400Regular' },
  videoActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { backgroundColor: S.sidebar, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: S.border, alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: S.sub },
  delBtn: { width: 40, backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: S.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
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

  uploadBox: {
    backgroundColor: S.sidebar, borderRadius: 14, borderWidth: 1, borderColor: S.border,
    borderStyle: 'dashed', padding: 20, alignItems: 'center', marginBottom: 16,
  },
  uploadIcon: { fontSize: 28, marginBottom: 8 },
  uploadHint: { fontSize: 12, color: S.muted, fontFamily: 'Nunito_400Regular', textAlign: 'center', marginBottom: 12 },
  uploadInput: { width: '100%', marginBottom: 10 },
  chooseBtn: { backgroundColor: S.bg, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: S.border },
  chooseBtnText: { fontSize: 13, color: S.sub, fontFamily: 'Nunito_600SemiBold' },

  fieldLabel: { fontSize: 11, color: S.sub, fontFamily: 'Nunito_700Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: {
    backgroundColor: S.sidebar, borderRadius: 10, borderWidth: 1, borderColor: S.border,
    color: S.text, fontFamily: 'Nunito_400Regular', fontSize: 14,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  row2: { flexDirection: 'row', gap: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 6, backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border },
  chipActive: { backgroundColor: 'rgba(255,140,0,0.15)', borderColor: 'rgba(255,140,0,0.3)' },
  chipText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: S.sub },
  btnCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border, alignItems: 'center' },
  btnCancelText: { color: S.sub, fontFamily: 'Nunito_600SemiBold', fontSize: 14 },
  btnSave: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: S.orange, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 14 },
});
