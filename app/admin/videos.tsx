import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../lib/api';
import * as ImagePicker from 'expo-image-picker';
import { Play, Eye, Pencil, Trash2, X, UploadCloud, Image as ImageIcon, Clapperboard, BrainCircuit, Check, Video } from 'lucide-react-native';

interface AdminVideo {
  id: string; 
  titulo: string; 
  descricao: string;
  url: string; 
  thumbnail: string; 
  categoria: string;
  duracao: string; 
  visualizacoes: number;
  id_missao?: number | null;
}

const CATEGORIES = ['Poupar', 'Gastar', 'Ajudar', 'Investir', 'Planejamento'];
const CAT_COLORS: Record<string, string> = {
  Poupar: '#22C55E', Gastar: '#F59E0B', Ajudar: '#EC4899',
  Investir: '#3B82F6', Planejamento: '#8B5CF6',
};

type FormState = {
  titulo: string; 
  descricao: string; 
  url: string;
  thumbnail: string; 
  categoria: string; 
  duracao: string;
  id_missao: number | null;
  localVideoUri: string | null;
  localThumbUri: string | null;
};

export default function AdminVideos() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ 
    titulo: '', descricao: '', url: '', thumbnail: '', categoria: 'Poupar', duracao: '', id_missao: null,
    localVideoUri: null, localThumbUri: null
  });

  // Queries
  const { data: videosData, isLoading } = useQuery({
    queryKey: ['admin', 'videos'],
    queryFn: () => adminService.getVideosStats(),
  });
  const videos: AdminVideo[] = videosData?.videos || [];

  const { data: quizzesData } = useQuery({
    queryKey: ['admin', 'quizzes'],
    queryFn: () => adminService.getQuizzes(),
  });
  const quizzes = quizzesData?.quizzes || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createVideo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'videos'] });
      setModal(false);
    },
    onError: (err: any) => Alert.alert('Erro', err.response?.data?.mensagem || 'Falha ao criar vídeo'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminService.updateVideo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'videos'] });
      setModal(false);
    },
    onError: (err: any) => Alert.alert('Erro', err.response?.data?.mensagem || 'Falha ao atualizar vídeo'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'videos'] });
    },
    onError: (err: any) => Alert.alert('Erro', err.response?.data?.mensagem || 'Falha ao eliminar vídeo'),
  });

  const openAdd = () => { 
    setEditId(null); 
    setForm({ titulo: '', descricao: '', url: '', thumbnail: '', categoria: 'Poupar', duracao: '', id_missao: null, localVideoUri: null, localThumbUri: null }); 
    setModal(true); 
  };

  const openEdit = (v: AdminVideo) => {
    setEditId(v.id);
    setForm({ 
      titulo: v.titulo, 
      descricao: v.descricao, 
      url: v.url, 
      thumbnail: v.thumbnail, 
      categoria: v.categoria, 
      duracao: v.duracao,
      id_missao: v.id_missao || null,
      localVideoUri: null,
      localThumbUri: null
    });
    setModal(true);
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permissão', 'Precisamos de acesso à galeria.');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setForm(p => ({ ...p, localVideoUri: result.assets[0].uri }));
    }
  };

  const pickThumbnail = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permissão', 'Precisamos de acesso à galeria.');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setForm(p => ({ ...p, localThumbUri: result.assets[0].uri }));
    }
  };

  const save = () => {
    if (!form.titulo || (!form.url && !form.localVideoUri)) {
        return Alert.alert('Aviso', 'Título e URL (ou upload de vídeo) são obrigatórios.');
    }
    
    let payload: any = {
      titulo: form.titulo,
      descricao: form.descricao,
      tipo: 'video',
      categoria: form.categoria,
      duracao: form.duracao,
      id_missao: form.id_missao
    };

    if (form.localVideoUri || form.localThumbUri) {
      const formData = new FormData();
      
      if (form.localVideoUri) {
        formData.append('video', {
          uri: form.localVideoUri,
          name: `video_${Date.now()}.mp4`,
          type: 'video/mp4',
        } as any);
      } else {
        payload.url = form.url;
      }

      if (form.localThumbUri) {
        formData.append('thumbnail', {
          uri: form.localThumbUri,
          name: `thumb_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
      } else {
        payload.thumbnail_url = form.thumbnail;
      }

      Object.keys(payload).forEach(key => {
        if (payload[key] !== null) formData.append(key, String(payload[key]));
      });
      
      payload = formData;
    } else {
      payload.url = form.url;
      payload.thumbnail_url = form.thumbnail;
    }

    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const del = (id: string) => Alert.alert('Eliminar Vídeo', 'Tem a certeza que deseja eliminar este vídeo?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
  ]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Gestão de Vídeos</Text>
          <Text style={styles.pageSub}>Total: {videos.length} vídeos educativos</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Adicionar Vídeo</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
            <ActivityIndicator size="large" color="#FF8C00" />
            <Text style={styles.loadingText}>Carregando conteúdos...</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={v => String(v.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: v, index }) => {
            const color = CAT_COLORS[v.categoria] || '#FF8C00';
            const linkedQuiz = quizzes.find((q: any) => q.id === v.id_missao);

            return (
              <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
                <View style={styles.videoCard}>
                  {/* Thumbnail with gradient overlay */}
                  <View style={styles.thumbWrap}>
                    <Image source={{ uri: v.thumbnail || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80' }} style={styles.thumb} resizeMode="cover" />
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
                    
                    {linkedQuiz && (
                      <View style={styles.linkedBadge}>
                        <BrainCircuit size={12} color="#8B5CF6" />
                        <Text style={styles.linkedBadgeText}>Quiz: {linkedQuiz.titulo}</Text>
                      </View>
                    )}

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
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.delBtn, deleteMutation.isPending && { opacity: 0.5 }]} 
                        onPress={() => del(String(v.id))}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          }}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Clapperboard size={48} color="#4A5F8A" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>Nenhum vídeo cadastrado</Text>
            </View>
          )}
        />
      )}

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

              {/* Video URL or Upload */}
              <Field label="Vídeo (URL ou Upload) *">
                <View style={{ gap: 10 }}>
                  <TextInput style={styles.input}
                    placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
                    placeholderTextColor="#4A5F8A" value={form.url}
                    onChangeText={v => setForm(p => ({ ...p, url: v, localVideoUri: null }))} />
                  
                  <TouchableOpacity style={styles.mediaUploadBtn} onPress={pickVideo}>
                    {form.localVideoUri ? (
                      <View style={styles.mediaPreview}>
                        <Video size={20} color="#FF8C00" />
                        <Text style={styles.mediaPreviewText} numberOfLines={1}>Ficheiro Selecionado</Text>
                        <TouchableOpacity onPress={() => setForm(p => ({ ...p, localVideoUri: null }))}>
                          <X size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.mediaPlaceholder}>
                        <UploadCloud size={18} color="#4A5F8A" />
                        <Text style={styles.mediaPlaceholderText}>Fazer Upload de Vídeo</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </Field>

              {/* Thumbnail URL or Upload */}
              <Field label="Thumbnail (URL ou Upload)">
                <View style={{ gap: 10 }}>
                  <TextInput style={styles.input}
                    placeholder="URL da imagem de capa..."
                    placeholderTextColor="#4A5F8A" value={form.thumbnail}
                    onChangeText={v => setForm(p => ({ ...p, thumbnail: v, localThumbUri: null }))} />
                  
                  <TouchableOpacity style={styles.mediaUploadBtn} onPress={pickThumbnail}>
                    {form.localThumbUri ? (
                      <View style={styles.mediaPreview}>
                        <ImageIcon size={20} color="#FF8C00" />
                        <Text style={styles.mediaPreviewText} numberOfLines={1}>Capa Selecionada</Text>
                        <TouchableOpacity onPress={() => setForm(p => ({ ...p, localThumbUri: null }))}>
                          <X size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.mediaPlaceholder}>
                        <ImageIcon size={18} color="#4A5F8A" />
                        <Text style={styles.mediaPlaceholderText}>Fazer Upload de Capa</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </Field>

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

              {/* Quiz Selection */}
              <Field label="Quiz Relacionado (aparece após o vídeo)">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quizSelector}>
                  <TouchableOpacity 
                    style={[styles.quizChip, form.id_missao === null && styles.quizChipActive]}
                    onPress={() => setForm(p => ({ ...p, id_missao: null }))}
                  >
                    <Text style={[styles.quizChipText, form.id_missao === null && { color: '#FF8C00' }]}>Nenhum</Text>
                  </TouchableOpacity>
                  {quizzes.map((q: any) => (
                    <TouchableOpacity 
                        key={q.id}
                        style={[styles.quizChip, form.id_missao === q.id && styles.quizChipActive]}
                        onPress={() => setForm(p => ({ ...p, id_missao: q.id }))}
                    >
                        <BrainCircuit size={12} color={form.id_missao === q.id ? '#FF8C00' : '#8FA1C7'} style={{ marginRight: 6 }} />
                        <Text style={[styles.quizChipText, form.id_missao === q.id && { color: '#FF8C00' }]}>{q.titulo}</Text>
                        {form.id_missao === q.id && <Check size={12} color="#FF8C00" style={{ marginLeft: 6 }} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Clapperboard size={16} color="#fff" />
                  )}
                  <Text style={styles.btnSaveText}>{editId ? 'Salvar' : 'Adicionar Vídeo'}</Text>
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
  thumbWrap: { width: '100%', height: 180, position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  thumbGrad: { position: 'absolute', inset: 0 },
  playCircle: {
    position: 'absolute', top: '50%', left: '50%',
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
    marginTop: -26, marginLeft: -26,
  },
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
  
  linkedBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(139,92,246,0.1)',
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', marginBottom: 10,
  },
  linkedBadgeText: { fontSize: 11, color: '#A78BFA', fontFamily: 'Nunito_600SemiBold', marginLeft: 6 },

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
  modalBody: { paddingHorizontal: 20, paddingTop: 16 },
  modalFooter: { flexDirection: 'row', gap: 10, padding: 20, borderTopWidth: 1, borderTopColor: S.border },

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

  quizSelector: { flexDirection: 'row', marginBottom: 5 },
  quizChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: S.sidebar,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    marginRight: 8, borderWidth: 1, borderColor: S.border,
  },
  quizChipActive: { backgroundColor: 'rgba(255,140,0,0.12)', borderColor: 'rgba(255,140,0,0.3)' },
  quizChipText: { fontSize: 12, color: S.sub, fontFamily: 'Nunito_600SemiBold' },

  btnCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border, alignItems: 'center' },
  btnCancelText: { color: S.sub, fontFamily: 'Nunito_600SemiBold', fontSize: 14 },
  btnSave: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: S.orange, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 14 },

  mediaUploadBtn: {
    backgroundColor: S.sidebar, borderRadius: 10, borderWidth: 1, borderColor: S.border,
    padding: 12, borderStyle: 'dashed'
  },
  mediaPlaceholder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mediaPlaceholderText: { color: S.muted, fontFamily: 'Nunito_600SemiBold', fontSize: 13 },
  mediaPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,140,0,0.1)', padding: 8, borderRadius: 8, gap: 10 },
  mediaPreviewText: { color: S.orange, fontFamily: 'Nunito_700Bold', fontSize: 13, flex: 1 },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: S.sub, fontFamily: 'Nunito_600SemiBold', marginTop: 12 },
  empty: { flex: 1, alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: S.muted, fontFamily: 'Nunito_600SemiBold' },
});
