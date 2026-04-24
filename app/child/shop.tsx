import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Platform, Modal, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn, BounceIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { useMascot, MASCOTS } from '@/lib/mascot-context';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { crianca, atualizarSaldo } = useApp();
  const { activeMascot, setActiveMascot, unlockedMascots, unlockMascot } = useMascot();
  const webTop = Platform.OS === 'web' ? 67 : 0;

  const [selectedMascot, setSelectedMascot] = useState<string | null>(null);
  const [purchaseModal, setPurchaseModal] = useState<typeof MASCOTS[0] | null>(null);
  const [successModal, setSuccessModal] = useState<typeof MASCOTS[0] | null>(null);

  const saldoGastar = crianca.potes.saldo_gastar;

  const handleCardPress = (mascot: typeof MASCOTS[0]) => {
    if (unlockedMascots.includes(mascot.id)) {
      // Already unlocked — activate
      setActiveMascot(mascot.id);
      setSelectedMascot(mascot.id);
    } else {
      // Show purchase popup
      setPurchaseModal(mascot);
    }
  };

  const handleBuy = () => {
    if (!purchaseModal) return;
    if (saldoGastar < purchaseModal.preco) return;
    
    atualizarSaldo('gastar', -purchaseModal.preco);
    unlockMascot(purchaseModal.id);
    setActiveMascot(purchaseModal.id);
    setPurchaseModal(null);
    setSuccessModal(purchaseModal);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.topBar, { paddingTop: (insets.top || webTop) + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#7C3AED" />
        </Pressable>
        <Text style={styles.topBarTitle}>Loja de Mascotes 🛒</Text>
        <View style={styles.coinBadge}>
          <Ionicons name="cash-outline" size={14} color="#D97706" />
          <Text style={styles.coinText}>{saldoGastar} Kz</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Coleciona todos os amigos!</Text>

        {/* Active companion banner */}
        {activeMascot && (() => {
          const active = MASCOTS.find((m: typeof MASCOTS[0]) => m.id === activeMascot);
          if (!active) return null;
          return (
            <Animated.View entering={FadeInDown} style={styles.activeBanner}>
              <View style={styles.activeMascotEmoji}>
                <Text style={{ fontSize: 48 }}>{active.emoji}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={styles.activeRow}>
                  <Text style={styles.activeName}>{active.nome}</Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>✓ ativo</Text>
                  </View>
                </View>
                <Text style={styles.activeDesc}>{active.descricao}</Text>
                <Text style={styles.activeTag}>🤖 {active.tipo}</Text>
              </View>
            </Animated.View>
          );
        })()}

        <Text style={styles.sectionTitle}>Todos os Mascotes</Text>

        {/* Grid of mascots */}
        <View style={styles.grid}>
          {(MASCOTS as typeof MASCOTS[number][]).map((mascot, idx) => {
            const isUnlocked = unlockedMascots.includes(mascot.id);
            const isActive = activeMascot === mascot.id;
            return (
              <Animated.View
                key={mascot.id}
                entering={FadeInDown.delay(idx * 80)}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.card,
                    isActive && styles.cardActive,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => handleCardPress(mascot)}
                >
                  {isActive && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
                    </View>
                  )}
                  <View style={[styles.emojiBox, { backgroundColor: mascot.bgColor }]}>
                    <Text style={{ fontSize: 52 }}>{mascot.emoji}</Text>
                    {!isUnlocked && (
                      <View style={styles.lockOverlay}>
                        <Ionicons name="lock-closed" size={22} color="#fff" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardName}>{mascot.nome}</Text>
                  <Text style={styles.cardDesc}>{mascot.tagline}</Text>
                  {isUnlocked ? (
                    <View style={[styles.actionBtn, isActive && styles.actionBtnActive]}>
                      <Text style={[styles.actionBtnText, isActive && styles.actionBtnTextActive]}>
                        {isActive ? 'Ativo' : 'Selecionar'}
                      </Text>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={mascot.preco > saldoGastar ? ['#94A3B8', '#64748B'] : ['#7C3AED', '#6D28D9']}
                      style={styles.buyBtn}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.buyBtnText}>{mascot.preco} Kz</Text>
                    </LinearGradient>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* Purchase Confirmation Modal */}
      <Modal visible={!!purchaseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={ZoomIn} style={styles.modalBox}>
            <Text style={{ fontSize: 64 }}>{purchaseModal?.emoji}</Text>
            <Text style={styles.modalTitle}>Comprar {purchaseModal?.nome}?</Text>
            <Text style={styles.modalDesc}>{purchaseModal?.descricao}</Text>

            <View style={styles.priceRow}>
              <Ionicons name="cash-outline" size={18} color="#D97706" />
              <Text style={styles.priceText}>{purchaseModal?.preco} Kz</Text>
            </View>

            {purchaseModal && saldoGastar < purchaseModal.preco && (
              <View style={styles.poorMsg}>
                <Ionicons name="warning-outline" size={16} color="#DC2626" />
                <Text style={styles.poorText}>Saldo insuficiente!</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setPurchaseModal(null)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.confirmBtn,
                  purchaseModal && saldoGastar < purchaseModal.preco && styles.confirmBtnDisabled,
                ]}
                onPress={handleBuy}
                disabled={!purchaseModal || saldoGastar < purchaseModal.preco}
              >
                <LinearGradient
                  colors={purchaseModal && saldoGastar >= purchaseModal.preco
                    ? ['#7C3AED', '#6D28D9']
                    : ['#CBD5E1', '#94A3B8']}
                  style={styles.confirmGradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.confirmBtnText}>Comprar! 🎉</Text>
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
            <Text style={{ fontSize: 72 }}>{successModal?.emoji}</Text>
            <Text style={styles.successTitle}>Parabéns! 🎉</Text>
            <Text style={styles.successDesc}>
              {successModal?.nome} é agora o teu companheiro!{'\n'}Vais vê-lo em toda a tua jornada!
            </Text>
            <Pressable onPress={() => setSuccessModal(null)}>
              <LinearGradient
                colors={['#7C3AED', '#6D28D9']}
                style={styles.successBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.successBtnText}>Começar Aventura! 🚀</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0FF' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#F5F0FF',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#3B0764' },
  coinBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A',
  },
  coinText: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#D97706' },
  scroll: { paddingHorizontal: 16 },
  subtitle: {
    fontSize: 14, color: '#7C3AED', textAlign: 'center',
    fontFamily: 'Nunito_600SemiBold', marginTop: 4, marginBottom: 20,
  },

  // Active Banner
  activeBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EDE9FE', borderRadius: 24,
    padding: 16, marginBottom: 24,
    borderWidth: 2, borderColor: '#C4B5FD',
  },
  activeMascotEmoji: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#DDD6FE', alignItems: 'center', justifyContent: 'center',
  },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  activeName: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#3B0764' },
  activeBadge: {
    backgroundColor: '#7C3AED', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: '#fff' },
  activeDesc: { fontSize: 13, color: '#5B21B6', fontFamily: 'Nunito_600SemiBold', marginBottom: 2 },
  activeTag: { fontSize: 12, color: '#7C3AED', fontFamily: 'Nunito_600SemiBold' },

  sectionTitle: {
    fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#1E293B', marginBottom: 16,
  },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: CARD_W, backgroundColor: '#fff',
    borderRadius: 24, padding: 16, alignItems: 'center',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    borderWidth: 2, borderColor: 'transparent',
  },
  cardActive: { borderColor: '#7C3AED', backgroundColor: '#FAF5FF' },
  cardPressed: { transform: [{ scale: 0.96 }] },
  checkBadge: {
    position: 'absolute', top: 10, right: 10,
  },
  emojiBox: {
    width: 90, height: 90, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, position: 'relative',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  cardName: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: '#1E293B', textAlign: 'center' },
  cardDesc: {
    fontSize: 11, color: '#64748B', fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center', marginTop: 2, marginBottom: 12,
  },
  actionBtn: {
    width: '100%', paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#E2E8F0', alignItems: 'center',
  },
  actionBtnActive: { backgroundColor: '#EDE9FE' },
  actionBtnText: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#64748B' },
  actionBtnTextActive: { color: '#7C3AED' },
  buyBtn: { width: '100%', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  buyBtnText: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#fff' },

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 32, padding: 28,
    alignItems: 'center', width: '100%', maxWidth: 380,
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2, shadowRadius: 30, elevation: 20,
  },
  successBox: { backgroundColor: '#FAF5FF' },
  modalTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: '#1E293B', marginTop: 12, marginBottom: 8 },
  modalDesc: { fontSize: 14, color: '#64748B', fontFamily: 'Nunito_600SemiBold', textAlign: 'center', marginBottom: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  priceText: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: '#D97706' },
  poorMsg: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, marginBottom: 8,
  },
  poorText: { fontSize: 13, color: '#DC2626', fontFamily: 'Nunito_700Bold' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 16,
    backgroundColor: '#F1F5F9', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: '#64748B' },
  confirmBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmGradient: { paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  
  successTitle: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: '#3B0764', marginTop: 12, marginBottom: 8 },
  successDesc: { fontSize: 15, color: '#5B21B6', fontFamily: 'Nunito_600SemiBold', textAlign: 'center', marginBottom: 24 },
  successBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 20 },
  successBtnText: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
});
