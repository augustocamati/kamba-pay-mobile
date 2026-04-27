import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, Pressable, Platform,
  Animated as RNAnimated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { MascotCompanion } from '@/components/MascotCompanion';

export default function ChildSchoolScreen() {
  const insets = useSafeAreaInsets();
  const { conteudoEducativo, isLoading } = useApp();
  const webTop = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (insets.top || webTop) + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FF6B00" />
        </Pressable>
        <Text style={styles.topBarTitle}>Escola Kamba Kid 📚</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Aprenda sobre dinheiro se divertindo!</Text>

        {/* General Quiz Test Banner */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Pressable
            style={styles.quizTestCard}
            onPress={() => router.push({ pathname: '/child/quiz', params: { mode: 'geral' } } as any)}
          >
            <LinearGradient
              colors={['#7C3AED', '#6D28D9']}
              style={styles.quizTestGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <View style={styles.quizTestIconBox}>
                <Text style={{ fontSize: 32 }}>🧠</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.quizTestTitle}>Teste os Teus Conhecimentos!</Text>
                <Text style={styles.quizTestSub}>5 perguntas • sem ver vídeo • ganhar XP</Text>
              </View>
              <View style={styles.quizTestArrow}>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {isLoading && conteudoEducativo.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 36 }}>📚</Text>
            <Text style={{ color: '#64748B', marginTop: 12, textAlign: 'center' }}>
              A carregar conteúdos...
            </Text>
          </View>
        ) : conteudoEducativo.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 48 }}>📚</Text>
            <Text style={{ color: '#64748B', fontSize: 16, fontFamily: 'Fredoka_700Bold', marginTop: 12 }}>
              Escola Kamba Kid
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 6, textAlign: 'center' }}>
              Em breve terás conteúdos educativos incríveis!
            </Text>
          </View>
        ) : (
          <>
            <Pressable
              style={styles.featuredCard}
              onPress={() => router.push({ pathname: '/child/aula', params: { id: conteudoEducativo[0].id } } as any)}
            >
              <Image
                source={{ uri: conteudoEducativo[0].thumbnail_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800' }}
                style={styles.featuredImage}
              />
              <View style={styles.featuredOverlay}>
                <View style={styles.playIcon}>
                  <Ionicons
                    name={conteudoEducativo[0].tipo === 'jogo' ? 'game-controller' : 'play'}
                    size={32} color="#fff"
                  />
                </View>
                <View>
                  <Text style={styles.featuredTitle}>{conteudoEducativo[0].titulo}</Text>
                  <Text style={styles.featuredDesc}>
                    {conteudoEducativo[0].tipo === 'video' ? 'Assista agora' : 'Começar agora'} • {conteudoEducativo[0].duracao} min
                  </Text>
                </View>
              </View>
            </Pressable>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Estudando</Text>
            </View>

            {conteudoEducativo.map(item => (
              <Pressable
                key={item.id}
                style={styles.contentItem}
                onPress={() => router.push({ pathname: '/child/aula', params: { id: item.id } } as any)}
              >
                <Image source={{ uri: item.thumbnail_url }} style={styles.itemThumb} />
                <View style={styles.itemInfo}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.tipo.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.itemTitle}>{item.titulo}</Text>
                  <View style={styles.itemMeta}>
                    <Ionicons name="time-outline" size={14} color="#94A3B8" />
                    <Text style={styles.itemDuration}>{item.duracao}</Text>
                    {item.completo && (
                      <View style={styles.completeBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#45D37B" />
                        <Text style={styles.completeText}>Visto</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      <MascotCompanion position="bottom-right" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFCE8' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FFFCE8',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF5E8', alignItems: 'center', justifyContent: 'center',
  },
  shopBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 18, fontFamily: 'Fredoka_700Bold', color: '#1A1A2E' },
  scrollContent: { paddingHorizontal: 20 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 20 },

  // Mascot
  mascotCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAF5FF', borderRadius: 24,
    padding: 16, marginBottom: 20,
    borderWidth: 1.5, borderColor: '#EDE9FE',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    position: 'relative',
  },
  closeMascot: {
    position: 'absolute', top: 10, right: 10, zIndex: 10,
    padding: 4,
  },
  mascotInfo: { flex: 1, marginLeft: 14 },
  mascotNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  mascotName: { fontSize: 16, fontFamily: 'Fredoka_700Bold', color: '#3B0764' },
  mascotTypeBadge: { backgroundColor: '#7C3AED', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  mascotTypeText: { fontSize: 9, fontFamily: 'Fredoka_700Bold', color: '#fff' },
  speechBubble: {
    backgroundColor: '#EDE9FE', borderRadius: 12, padding: 10, marginBottom: 8,
  },
  speechText: { fontSize: 12, fontFamily: 'Fredoka_600SemiBold', color: '#5B21B6', lineHeight: 17 },
  changeCompanionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  changeCompanionText: { fontSize: 11, color: '#7C3AED', fontFamily: 'Fredoka_600SemiBold' },

  // General Quiz Banner
  quizTestCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  quizTestGradient: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  quizTestIconBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  quizTestTitle: { fontSize: 15, fontFamily: 'Fredoka_700Bold', color: '#fff' },
  quizTestSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: 'Fredoka_600SemiBold', marginTop: 2 },
  quizTestArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Featured
  featuredCard: { borderRadius: 28, overflow: 'hidden', height: 200, marginBottom: 24, backgroundColor: '#000' },
  featuredImage: { width: '100%', height: '100%', opacity: 0.7 },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  playIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF6F00', justifyContent: 'center', alignItems: 'center' },
  featuredTitle: { color: '#fff', fontSize: 20, fontFamily: 'Fredoka_700Bold' },
  featuredDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Fredoka_600SemiBold', marginTop: 2 },

  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: 'Fredoka_700Bold', color: '#1E293B' },
  contentItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 20, padding: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
  },
  itemThumb: { width: 70, height: 70, borderRadius: 12 },
  itemInfo: { flex: 1, marginLeft: 16 },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 4 },
  typeText: { fontSize: 9, fontFamily: 'Fredoka_700Bold', color: '#64748B' },
  itemTitle: { fontSize: 15, fontFamily: 'Fredoka_700Bold', color: '#1E293B' },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  itemDuration: { fontSize: 12, color: '#94A3B8', fontFamily: 'Fredoka_600SemiBold' },
  completeBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 8 },
  completeText: { fontSize: 12, fontFamily: 'Fredoka_700Bold', color: '#45D37B' },
});
