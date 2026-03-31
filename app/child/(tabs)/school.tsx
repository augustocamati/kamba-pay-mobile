import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';

export default function ChildSchoolScreen() {
  const insets = useSafeAreaInsets();
  const { conteudoEducativo } = useApp();
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

        {/* Featured Content */}
        {conteudoEducativo.length > 0 && (
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
                <Ionicons name={conteudoEducativo[0].tipo === 'jogo' ? "game-controller" : "play"} size={32} color="#fff" />
              </View>
              <View>
                <Text style={styles.featuredTitle}>{conteudoEducativo[0].titulo}</Text>
                <Text style={styles.featuredDesc}>
                  {conteudoEducativo[0].tipo === 'video' ? 'Assista agora' : 'Começar agora'} • {conteudoEducativo[0].duracao} min
                </Text>
              </View>
            </View>
          </Pressable>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Estudando</Text>
        </View>

        {/* List of Content */}
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

        {/* Gamification Link */}
        <View style={styles.gameCard}>
          <MaterialCommunityIcons name="gamepad-variant" size={40} color="#fff" />
          <View style={{ flex: 1, marginLeft: 16 }}>
             <Text style={styles.gameTitle}>Queres testar teus conhecimentos?</Text>
             <Text style={styles.gameDesc}>Joga o Quiz e ganha bónus!</Text>
          </View>
          <Pressable style={styles.gameButton}>
             <Text style={styles.gameButtonText}>Jogar</Text>
          </Pressable>
        </View>

      </ScrollView>
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
  topBarTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#1A1A2E' },
  scrollContent: { paddingHorizontal: 20 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  featuredCard: {
    borderRadius: 28,
    overflow: 'hidden',
    height: 200,
    marginBottom: 24,
    backgroundColor: '#000',
  },
  featuredImage: { width: '100%', height: '100%', opacity: 0.7 },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  playIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF6F00', justifyContent: 'center', alignItems: 'center' },
  featuredTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  featuredDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginTop: 2 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  itemThumb: { width: 70, height: 70, borderRadius: 12 },
  itemInfo: { flex: 1, marginLeft: 16 },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 4 },
  typeText: { fontSize: 9, fontWeight: '800', color: '#64748B' },
  itemTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  itemDuration: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  completeBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 8 },
  completeText: { fontSize: 12, fontWeight: '700', color: '#45D37B' },
  gameCard: {
    backgroundColor: '#6C5CE7',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  gameTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  gameDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginTop: 2 },
  gameButton: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  gameButtonText: { color: '#6C5CE7', fontSize: 13, fontWeight: '800' },
});
