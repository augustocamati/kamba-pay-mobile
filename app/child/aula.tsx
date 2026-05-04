import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/context/AppContext';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { MascotCompanion } from '@/components/MascotCompanion';
import { ActionSuccessPopup } from '@/components/ActionSuccessPopup';
import { useSound } from '@/lib/sound-context';

const { width } = Dimensions.get('window');

export default function AulaScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { conteudoEducativo, marcarConteudoCompleto } = useApp();
  const { playSound } = useSound();
  
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Buscar conteúdo com base no ID
  const conteudo = typeof id === 'string' 
    ? conteudoEducativo.find(c => String(c.id) === id) 
    : conteudoEducativo[0];

  useEffect(() => {
    console.log('[Aula] ID recebido:', id);
    console.log('[Aula] Conteúdo encontrado:', conteudo);
    console.log('[Aula] Video URL:', conteudo?.video_url);
  }, [id, conteudo]);

  // Extrair ID do vídeo do YouTube
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = conteudo?.video_url ? getYoutubeId(conteudo.video_url) : null;
  const isLocalVideo = conteudo?.video_url && (conteudo.video_url.includes('/uploads') || conteudo.video_url.includes('file://'));

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setIsVideoFinished(true);
      playSound('success');
      setShowSuccess(true);
      if (conteudo) marcarConteudoCompleto(conteudo.id);
    }
  }, [conteudo, marcarConteudoCompleto]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      setIsVideoFinished(true);
      playSound('success');
      setShowSuccess(true);
      if (conteudo) marcarConteudoCompleto(conteudo.id);
    }
  };

  const handleSkip = () => {
      setIsVideoFinished(true);
      setShowSuccess(true);
      if (conteudo) marcarConteudoCompleto(conteudo.id);
  };

  return (
    <LinearGradient colors={['#fff', '#f8fafc']} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.topFixed}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </Pressable>
            <Text style={styles.headerTitle}>Aula Kamba 📚</Text>
            <View style={{ width: 44 }} />
        </View>
        <Text style={styles.headerSubtitle}>Assiste com atenção para desbloqueares o Quiz Mestre!</Text>
      </View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.content}>
        <View style={styles.videoWrapper}>
          {videoId ? (
            <View style={styles.videoCard}>
                {Platform.OS === 'web' ? (
                    <iframe
                        width="100%"
                        height="220"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: 24 }}
                        onLoad={() => {
                            setLoading(false);
                            setTimeout(() => setIsVideoFinished(true), 5000);
                        }}
                    />
                ) : (
                    <YoutubePlayer
                        height={220}
                        play={true}
                        videoId={videoId}
                        onChangeState={onStateChange}
                        onReady={() => setLoading(false)}
                    />
                )}
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#fb923c" />
                    </View>
                )}
            </View>
          ) : isLocalVideo ? (
            <View style={styles.videoCard}>
               <Video
                  source={{ uri: conteudo!.video_url }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                  useNativeControls
                  style={{ width: '100%', height: 220 }}
                  onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                  onLoad={() => setLoading(false)}
                  onError={(err) => console.error("Erro Video Local:", err)}
                />
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#fb923c" />
                    </View>
                )}
            </View>
          ) : (
            <View style={styles.errorVideo}>
                <Ionicons name="alert-circle" size={48} color="#94A3B8" />
                <Text style={styles.errorText}>Vídeo indisponível no momento.</Text>
                <Pressable onPress={handleSkip} style={{ marginTop: 10 }}>
                    <Text style={{ color: '#fb923c', fontFamily: 'Fredoka_700Bold' }}>Simular Conclusão (Debug)</Text>
                </Pressable>
            </View>
          )}

          {isVideoFinished && (
            <View style={styles.finishedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.finishedBadgeText}>AULA CONCLUÍDA!</Text>
            </View>
          )}
        </View>

        <View style={styles.lessonInfo}>
          <View style={styles.titleRow}>
              <Text style={styles.lessonTitle}>{conteudo?.titulo}</Text>
              <View style={styles.xpBadge}>
                  <Text style={styles.xpBadgeText}>+20 XP</Text>
              </View>
          </View>
          <Text style={styles.lessonDesc}>
            {conteudo?.descricao || 'Carregando detalhes da aula...'}
          </Text>
        </View>
      </Animated.View>

      {isVideoFinished && (
        <Animated.View entering={SlideInDown} style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <Pressable 
            style={styles.quizButton}
            onPress={() => router.replace({ pathname: '/child/quiz', params: { id, id_missao: conteudo?.id_missao } } as any)}
          >
            <LinearGradient 
              colors={['#f97316', '#ea580c']} 
              style={styles.quizGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.quizButtonText}>Começar o Quiz 🚀</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}

      <MascotCompanion position="bottom-left" />

      <ActionSuccessPopup
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Aula Concluída! 📚"
        description={`Parabéns! Viste o vídeo "${conteudo?.titulo}" até ao fim.`}
        xpReward={20}
        icon="book"
        buttonText="Fazer o Quiz! 🚀"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  topFixed: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontFamily: 'Fredoka_700Bold', color: '#0f172a' },
  headerSubtitle: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  content: { padding: 20, flex: 1 },
  videoWrapper: { position: 'relative', width: '100%', marginBottom: 20 },
  videoCard: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  errorVideo: { width: '100%', height: 220, borderRadius: 24, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1' },
  errorText: { color: '#64748b', marginTop: 10, fontFamily: 'Fredoka_600SemiBold' },
  finishedBadge: {
    position: 'absolute', top: -10, right: -10,
    backgroundColor: '#22c55e', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6,
    shadowColor: '#22c55e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    zIndex: 10,
  },
  finishedBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Fredoka_700Bold' },
  lessonInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  lessonTitle: { fontSize: 20, fontFamily: 'Fredoka_700Bold', color: '#1e293b', flex: 1 },
  xpBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  xpBadgeText: { color: '#d97706', fontSize: 12, fontFamily: 'Fredoka_700Bold' },
  lessonDesc: { fontSize: 15, color: '#475569', lineHeight: 24 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  quizButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  quizGradient: { paddingVertical: 18, alignItems: 'center' },
  quizButtonText: { color: '#fff', fontSize: 18, fontFamily: 'Fredoka_700Bold' },
});
