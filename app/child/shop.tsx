import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Platform, Modal, Dimensions, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn, BounceIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { useMascot, Mascot } from '@/lib/mascot-context';
import { useSound } from '@/lib/sound-context';
import { Image } from 'expo-image';
import { MASCOT_ASSETS } from '@/lib/mascot-assets';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { crianca, refreshData } = useApp();
  const { mascotes, activeMascot, loading, setActiveMascot, unlockMascot, fetchMascotes } = useMascot();
  const { playSound } = useSound();
  const webTop = Platform.OS === 'web' ? 67 : 0;

  const [purchaseModal, setPurchaseModal] = useState<Mascot | null>(null);
  const [successModal, setSuccessModal] = useState<Mascot | null>(null);
  const [buying, setBuying] = useState(false);

  const saldoGastar = Number(crianca.potes.saldo_gastar || 0).toFixed(2);
  const totalXP = crianca.xp || 0;

  const handleCardPress = (mascot: Mascot) => {
    if (mascot.desbloqueado) {
      if (!mascot.ativo) {
        setActiveMascot(mascot.id);
      }
    } else {
      setPurchaseModal(mascot);
    }
  };

  const handleBuy = async () => {
    if (!purchaseModal) return;
    if (totalXP < purchaseModal.preco) return;
    
    try {
      setBuying(true);
      await unlockMascot(purchaseModal.id);
      playSound('success');
      await refreshData();
      setPurchaseModal(null);
      setSuccessModal(purchaseModal);
    } catch (e) {
      console.error('Error buying mascot', e);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.topBar, { paddingTop: (insets.top || webTop) + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#7C3AED" />
        </Pressable>
        <Text style={styles.topBarTitle}>Mercado Kamba 🛒</Text>
        <View style={styles.coinBadge}>
          <Ionicons name="star" size={14} color="#FF8C00" />
          <Text style={styles.coinText}>{totalXP} XP</Text>
        </View>
      </View>


      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Usa o teu XP para desbloquear novos amigos!</Text>

        <View style={styles.balanceInfoBox}>
           <Text style={styles.balanceInfoText}>Pote Gastar: <Text style={{ fontFamily: 'Fredoka_700Bold' }}>{saldoGastar} Kz</Text></Text>
        </View>

        {/* Active companion banner */}
        {activeMascot && (
          <Animated.View entering={FadeInDown} style={styles.activeBanner}>
            <View style={[styles.activeMascotEmoji, { backgroundColor: activeMascot.bg_color || '#DDD6FE' }]}>
              {activeMascot.imagem_url && MASCOT_ASSETS[activeMascot.imagem_url] ? (
                <Image 
                  source={MASCOT_ASSETS[activeMascot.imagem_url]} 
                  style={{ width: 70, height: 70 }} 
                  contentFit="contain" 
                />
              ) : (
                <Text style={{ fontSize: 48 }}>{activeMascot.emoji}</Text>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={styles.activeRow}>
                <Text style={styles.activeName}>{activeMascot.nome}</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Equipado</Text>
                </View>
              </View>
              <Text style={styles.activeDesc}>{activeMascot.descricao}</Text>
              <Text style={styles.activeTag}>🚀 {activeMascot.tipo}</Text>
            </View>
          </Animated.View>
        )}

        <Text style={styles.sectionTitle}>Mascotes Disponíveis</Text>

        {/* Grid of mascots */}
        {mascotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>Estamos a procurar novos amigos...</Text>
            <Pressable style={styles.retryBtn} onPress={fetchMascotes}>
              <Text style={styles.retryText}>Tentar de novo</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {mascotes.map((mascot: Mascot, idx: number) => {
              const isUnlocked = mascot.desbloqueado;
              const isActive = activeMascot?.id === mascot.id;
              return (
                <Animated.View
                  key={mascot.id}
                  entering={FadeInDown.delay(idx * 50)}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.card,
                      isActive && styles.cardActive,
                      pressed && !isActive && styles.cardPressed,
                    ]}
                    onPress={() => handleCardPress(mascot)}
                  >
                    {isActive && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
                      </View>
                    )}
                    <View style={[styles.emojiBox, { backgroundColor: mascot.bg_color || '#EDE9FE' }]}>
                      {mascot.imagem_url && MASCOT_ASSETS[mascot.imagem_url] ? (
                        <Image 
                          source={MASCOT_ASSETS[mascot.imagem_url]} 
                          style={{ width: '80%', height: '80%' }} 
                          contentFit="contain" 
                        />
                      ) : (
                        <Text style={{ fontSize: 52 }}>{mascot.emoji}</Text>
                      )}
                      {!isUnlocked && (
                        <View style={styles.lockOverlay}>
                          <Ionicons name="lock-closed" size={22} color="#fff" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardName}>{mascot.nome}</Text>
                    <Text style={styles.cardDesc} numberOfLines={1}>{mascot.tagline}</Text>
                    
                    {isUnlocked ? (
                      <View style={[styles.actionBtn, isActive && styles.actionBtnActive]}>
                        <Text style={[styles.actionBtnText, isActive && styles.actionBtnTextActive]}>
                          {isActive ? 'Ativo' : 'Selecionar'}
                        </Text>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={mascot.preco > totalXP ? ['#94A3B8', '#64748B'] : ['#F59E0B', '#D97706']}
                        style={styles.buyBtn}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.buyBtnText}>{mascot.preco} XP</Text>
                      </LinearGradient>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        )}

      </ScrollView>

      {/* Purchase Confirmation Modal */}
      <Modal visible={!!purchaseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={ZoomIn} style={styles.modalBox}>
            <LinearGradient
              colors={purchaseModal?.bg_color ? [purchaseModal.bg_color, '#fff'] : ['#F3F4F6', '#fff']}
              style={styles.modalEmojiBox}
            >
              {purchaseModal?.imagem_url && MASCOT_ASSETS[purchaseModal.imagem_url] ? (
                <Image 
                  source={MASCOT_ASSETS[purchaseModal.imagem_url]} 
                  style={{ width: 100, height: 100 }} 
                  contentFit="contain" 
                />
              ) : (
                <Text style={{ fontSize: 68 }}>{purchaseModal?.emoji}</Text>
              )}
            </LinearGradient>
            <Text style={styles.modalTitle}>Conhece o {purchaseModal?.nome}?</Text>
            <Text style={styles.modalDesc}>{purchaseModal?.descricao}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Necessário:</Text>
              <View style={styles.priceTag}>
                <Ionicons name="star" size={16} color="#D97706" />
                <Text style={styles.priceValue}>{purchaseModal?.preco} XP</Text>
              </View>
            </View>

            {purchaseModal && totalXP < purchaseModal.preco && (
              <View style={styles.poorMsg}>
                <Ionicons name="warning-outline" size={16} color="#DC2626" />
                <Text style={styles.poorText}>Ainda não tens XP suficiente.</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setPurchaseModal(null)} disabled={buying}>
                <Text style={styles.cancelBtnText}>Voltar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.confirmBtn,
                  (buying || (purchaseModal && totalXP < purchaseModal.preco)) && styles.confirmBtnDisabled,
                ]}
                onPress={handleBuy}
                disabled={buying || !purchaseModal || totalXP < purchaseModal.preco}
              >
                <LinearGradient
                  colors={purchaseModal && totalXP >= purchaseModal.preco
                    ? ['#F59E0B', '#D97706']
                    : ['#94A3B8', '#64748B']}
                  style={styles.confirmGradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  {buying ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmBtnText}>Desbloquear</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={!!successModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={BounceIn} style={[styles.modalBox, styles.successBox]}>
            <View style={styles.successIcon}>
                <LinearGradient colors={['#7C3AED', '#C026D3']} style={styles.sparkleCircle}>
                  <Ionicons name="sparkles" size={24} color="#fff" />
                </LinearGradient>
            </View>
            <View style={[styles.successEmojiBg, { backgroundColor: successModal?.bg_color || '#F3E8FF' }]}>
              {successModal?.imagem_url && MASCOT_ASSETS[successModal.imagem_url] ? (
                <Image 
                  source={MASCOT_ASSETS[successModal.imagem_url]} 
                  style={{ width: 110, height: 110 }} 
                  contentFit="contain" 
                />
              ) : (
                <Text style={{ fontSize: 80 }}>{successModal?.emoji}</Text>
              )}
            </View>
            <Text style={styles.successTitle}>Novo Amigo! 🎉</Text>
            <Text style={styles.successDesc}>
              O <Text style={{ fontFamily: 'Fredoka_700Bold', color: '#7C3AED' }}>{successModal?.nome}</Text> agora faz parte da tua equipa!
            </Text>
            <Pressable style={{ width: '100%', marginTop: 8 }} onPress={() => setSuccessModal(null)}>
              <LinearGradient
                colors={['#7C3AED', '#A855F7']}
                style={styles.successBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.successBtnText}>Vamos lá! 🚀</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF9FF' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#FAF9FF',
    borderBottomWidth: 1, borderBottomColor: '#F3E8FF',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 18, fontFamily: 'Fredoka_700Bold', color: '#3B0764' },
  coinBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFBEB', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#FEF3C7',
  },
  coinText: { fontSize: 13, fontFamily: 'Fredoka_700Bold', color: '#D97706' },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  subtitle: {
    fontSize: 14, color: '#6B7280', textAlign: 'center',
    fontFamily: 'Fredoka_600SemiBold', marginBottom: 12, paddingHorizontal: 10,
  },
  balanceInfoBox: {
    backgroundColor: '#F1F5F9', paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 12, marginBottom: 24, alignSelf: 'center',
  },
  balanceInfoText: { fontSize: 12, color: '#64748B', fontFamily: 'Fredoka_600SemiBold' },

  activeBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 24,
    padding: 16, marginBottom: 32,
    borderWidth: 1.5, borderColor: '#C4B5FD',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 15, elevation: 5,
  },
  activeMascotEmoji: {
    width: 80, height: 80, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  activeName: { fontSize: 19, fontFamily: 'Fredoka_700Bold', color: '#1E1B4B' },
  activeBadge: {
    backgroundColor: '#7C3AED', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 12,
  },
  activeBadgeText: { fontSize: 10, fontFamily: 'Fredoka_700Bold', color: '#fff', textTransform: 'uppercase' },
  activeDesc: { fontSize: 13, color: '#4B5563', fontFamily: 'Fredoka_600SemiBold', marginBottom: 4, lineHeight: 18 },
  activeTag: { fontSize: 12, color: '#7C3AED', fontFamily: 'Fredoka_700Bold' },

  sectionTitle: {
    fontSize: 18, fontFamily: 'Fredoka_700Bold', color: '#111827', marginBottom: 16,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: {
    width: CARD_W, backgroundColor: '#fff',
    borderRadius: 24, padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    borderWidth: 2, borderColor: 'transparent',
  },
  cardActive: { borderColor: '#7C3AED', backgroundColor: '#F5F3FF' },
  cardPressed: { transform: [{ scale: 0.97 }] },
  checkBadge: {
    position: 'absolute', top: 8, right: 8, zIndex: 1,
  },
  emojiBox: {
    width: '100%', aspectRatio: 1, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, position: 'relative',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  cardName: { fontSize: 15, fontFamily: 'Fredoka_700Bold', color: '#111827', textAlign: 'center' },
  cardDesc: {
    fontSize: 11, color: '#6B7280', fontFamily: 'Fredoka_600SemiBold',
    textAlign: 'center', marginTop: 2, marginBottom: 10,
  },
  actionBtn: {
    width: '100%', paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#F3F4F6', alignItems: 'center',
  },
  actionBtnActive: { backgroundColor: '#EDE9FE' },
  actionBtnText: { fontSize: 13, fontFamily: 'Fredoka_700Bold', color: '#4B5563' },
  actionBtnTextActive: { color: '#7C3AED' },
  buyBtn: { width: '100%', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  buyBtnText: { fontSize: 13, fontFamily: 'Fredoka_700Bold', color: '#fff' },

  emptyContainer: {
    padding: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
    borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 15, color: '#94A3B8', fontFamily: 'Fredoka_600SemiBold',
    marginTop: 12, marginBottom: 20, textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3E8FF',
  },
  retryText: { fontSize: 14, fontFamily: 'Fredoka_700Bold', color: '#7C3AED' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.75)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 32, padding: 24,
    alignItems: 'center', width: '100%',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2, shadowRadius: 35, elevation: 25,
  },
  modalEmojiBox: { 
    width: 120, height: 120, borderRadius: 30, 
    alignItems: 'center', justifyContent: 'center', 
    marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
  },
  successBox: { backgroundColor: '#FDFCFD' },
  modalTitle: { fontSize: 24, fontFamily: 'Fredoka_700Bold', color: '#111827', marginBottom: 10, textAlign: 'center' },
  modalDesc: { fontSize: 15, color: '#4B5563', fontFamily: 'Fredoka_600SemiBold', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  priceLabel: { fontSize: 16, fontFamily: 'Fredoka_700Bold', color: '#6B7280' },
  priceTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFBEB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#FEF3C7' },
  priceValue: { fontSize: 18, fontFamily: 'Fredoka_700Bold', color: '#D97706' },
  
  poorMsg: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, marginBottom: 20,
  },
  poorText: { fontSize: 13, color: '#DC2626', fontFamily: 'Fredoka_700Bold' },
  
  modalActions: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  cancelBtn: { flex: 1, height: 56, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 16, fontFamily: 'Fredoka_700Bold', color: '#6B7280' },
  confirmBtn: { flex: 1.5, height: 56, borderRadius: 20, overflow: 'hidden', shadowColor: '#F59E0B', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  confirmBtnDisabled: { opacity: 0.7 },
  confirmGradient: { height: 56, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { fontSize: 17, fontFamily: 'Nunito_900Black', color: '#fff' },
  
  successIcon: { marginBottom: 12, alignItems: 'center' },
  sparkleCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  successEmojiBg: { 
    width: 140, height: 140, borderRadius: 70, 
    alignItems: 'center', justifyContent: 'center', 
    marginBottom: 20, borderWidth: 4, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10,
  },
  successTitle: { fontSize: 28, fontFamily: 'Fredoka_700Bold', color: '#1E1B4B', marginTop: 12, marginBottom: 8 },
  successDesc: { fontSize: 16, color: '#4B5563', fontFamily: 'Fredoka_600SemiBold', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  successBtn: { height: 60, borderRadius: 20, width: '100%', alignItems: 'center', justifyContent: 'center', shadowColor: '#7C3AED', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  successBtnText: { fontSize: 18, fontFamily: 'Nunito_900Black', color: '#fff' },
});
