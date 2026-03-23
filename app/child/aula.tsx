import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AulaScreen() {
  const insets = useSafeAreaInsets();
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Simulando a duração do vídeo
  const handlePlayVideo = () => {
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
      setIsVideoFinished(true);
    }, 3000); // 3 seconds video simulation
  };

  return (
    <LinearGradient colors={['#fff', '#f8fafc']} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Momento de Aprender! 🧠</Text>
        <Text style={styles.headerSubtitle}>Assiste à aula de hoje para ganhares XP base e desbloqueares o Quiz Mestre.</Text>
      </View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.content}>
        <View style={styles.videoCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=800' }} 
            style={styles.thumbnail}
          />
          <View style={styles.videoOverlay}>
            {!isVideoFinished && !isPlaying && (
              <Pressable style={styles.playButton} onPress={handlePlayVideo}>
                <Ionicons name="play" size={40} color="#fff" style={{ marginLeft: 4 }} />
              </Pressable>
            )}
            {isPlaying && (
              <View style={styles.playingState}>
                <Ionicons name="time" size={30} color="#fff" />
                <Text style={styles.playingText}>A reproduzir aula...</Text>
              </View>
            )}
            {isVideoFinished && (
              <View style={styles.finishedState}>
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={32} color="#4ade80" />
                </View>
                <Text style={styles.finishedText}>Vídeo Concluído!</Text>
                <Text style={styles.xpText}>+10 XP Ganhos</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.lessonInfo}>
          <Text style={styles.lessonTitle}>Tema: O que é o Pote Poupar?</Text>
          <Text style={styles.lessonDesc}>
            Vais aprender como e porquê guardar o teu dinheiro para poderes comprar coisas maiores no futuro.
          </Text>
        </View>
      </Animated.View>

      {isVideoFinished && (
        <Animated.View entering={SlideInDown} style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <Pressable 
            style={styles.quizButton}
            onPress={() => router.replace('/child/quiz')}
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },
  content: {
    padding: 24,
    flex: 1,
  },
  videoCard: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fb923c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  playingState: {
    alignItems: 'center',
  },
  playingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  finishedState: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  finishedText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  xpText: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  lessonInfo: {
    marginTop: 24,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  lessonDesc: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  quizButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  quizGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
