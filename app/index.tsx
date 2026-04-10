import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading, enterDemo } = useAuth();
  const [showSelection, setShowSelection] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  useEffect(() => {
    if (!isLoading && user) {
      setTimeout(() => {
        if (user.role === 'parent') {
          router.replace('/parent');
        } else {
          router.replace('/child/(tabs)');
        }
      }, 100);
    }
  }, [isLoading, user]);

  const handleEnterDemo = (role: 'parent' | 'child') => {
    setShowDemoModal(false);
    enterDemo(role);
    // O useEffect acima vai redirecionar automaticamente
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#FF8C00', '#FFD700', '#FFA500']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={40} color="#0B1A2E" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#FF6B00', '#FF8C00', '#FFB347', '#FFD700']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background stripes */}
      <View style={styles.waveBg}>
        <View style={[styles.waveStripe, { top: '10%', transform: [{ rotate: '-15deg' }] }]} />
        <View style={[styles.waveStripe, { top: '25%', transform: [{ rotate: '-15deg' }], opacity: 0.15 }]} />
        <View style={[styles.waveStripe, { top: '60%', transform: [{ rotate: '-15deg' }], opacity: 0.1 }]} />
      </View>

      <View style={[styles.content, {
        paddingTop: (insets.top || webTopInset) + 20,
        paddingBottom: (insets.bottom || webBottomInset) + 20
      }]}>
        {/* Floating icons */}
        <View style={styles.floatingIcons}>
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={[styles.floatIcon, { top: 40, left: 20 }]}>
            <Ionicons name="star" size={32} color="rgba(0,0,0,0.2)" />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={[styles.floatIcon, { top: 20, right: 20 }]}>
            <FontAwesome5 name="money-bill-wave" size={28} color="rgba(0,0,0,0.2)" />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(500).duration(600)} style={[styles.floatIcon, { bottom: 200, left: 20 }]}>
            <MaterialCommunityIcons name="target" size={36} color="rgba(0,0,0,0.2)" />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(600).duration(600)} style={[styles.floatIcon, { bottom: 210, right: 20 }]}>
            <Ionicons name="heart" size={30} color="rgba(200,0,0,0.35)" />
          </Animated.View>
        </View>

        {/* Center logo */}
        <View style={styles.centerSection}>
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.logoCircle}>
            <MaterialCommunityIcons name="cat" size={56} color="#FF8C00" />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(400).duration(600)}>
            <Text style={styles.title}>Kamba Kid Pay</Text>
            <Text style={styles.subtitle}>
              <MaterialCommunityIcons name="star-four-points" size={14} color="rgba(0,0,0,0.4)" />
              {'  '}Educação Financeira Infantil{'  '}
              <MaterialCommunityIcons name="star-four-points" size={14} color="rgba(0,0,0,0.4)" />
            </Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.bottomSection}>
          {!showSelection ? (
            <>
              <Pressable
                style={({ pressed }) => [styles.startButton, pressed && styles.buttonPressed]}
                onPress={() => setShowSelection(true)}
              >
                <Text style={styles.startButtonText}>Começar Agora</Text>
                <Ionicons name="arrow-forward" size={20} color="#FF8C00" />
              </Pressable>

              {/* Demo button */}
              <Pressable
                style={({ pressed }) => [styles.demoButton, pressed && styles.buttonPressed]}
                onPress={() => setShowDemoModal(true)}
              >
                <Ionicons name="play-circle-outline" size={20} color="rgba(0,0,0,0.55)" />
                <Text style={styles.demoButtonText}>Explorar Demo</Text>
              </Pressable>
            </>
          ) : (
            <Animated.View entering={FadeInUp.duration(400)} style={styles.selectionButtons}>
              <Pressable
                style={({ pressed }) => [styles.enterButton, pressed && styles.buttonPressed]}
                onPress={() => router.push('/role-select')}
              >
                <Ionicons name="log-in-outline" size={20} color="#FF8C00" />
                <Text style={styles.enterButtonText}>Entrar</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.createButton, pressed && styles.buttonPressed]}
                onPress={() => router.push('/register')}
              >
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Criar conta de Responsável</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.demoButton, pressed && styles.buttonPressed]}
                onPress={() => setShowDemoModal(true)}
              >
                <Ionicons name="play-circle-outline" size={20} color="rgba(0,0,0,0.55)" />
                <Text style={styles.demoButtonText}>Explorar Demo</Text>
              </Pressable>

              <Pressable onPress={() => setShowSelection(false)}>
                <Text style={styles.backLink}>
                  <Ionicons name="arrow-back" size={13} color="rgba(0,0,0,0.45)" /> Voltar
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      </View>

      {/* ────────── MODAL DEMO ────────── */}
      <Modal
        visible={showDemoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDemoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={ZoomIn.duration(300)} style={styles.modalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <Text style={{ fontSize: 36 }}>🎮</Text>
              </View>
              <Text style={styles.modalTitle}>Modo Demo</Text>
              <Text style={styles.modalSubtitle}>
                Explora a aplicação com dados simulados.{'\n'}
                Nenhum dado real é alterado.
              </Text>
            </View>

            {/* Badge */}
            <View style={styles.demoBadge}>
              <Ionicons name="information-circle" size={16} color="#FF8C00" />
              <Text style={styles.demoBadgeText}>
                Todas as ações são locais e temporárias
              </Text>
            </View>

            {/* Role options */}
            <Text style={styles.modalRoleLabel}>Escolhe a perspectiva:</Text>

            <Pressable
              style={({ pressed }) => [styles.roleCard, { borderColor: '#FF8C00', marginBottom: 12 }, pressed && styles.buttonPressed]}
              onPress={() => handleEnterDemo('parent')}
            >
              <View style={[styles.roleIcon, { backgroundColor: '#FFF5E8' }]}>
                <FontAwesome5 name="user-tie" size={28} color="#FF8C00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.roleTitle}>Ver como Responsável</Text>
                <Text style={styles.roleSub}>
                  Dashboard do pai, tarefas, metas, aprovações
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF8C00" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.roleCard, { borderColor: '#5B9BD5' }, pressed && styles.buttonPressed]}
              onPress={() => handleEnterDemo('child')}
            >
              <View style={[styles.roleIcon, { backgroundColor: '#EEF4FF' }]}>
                <MaterialCommunityIcons name="emoticon-happy" size={32} color="#5B9BD5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.roleTitle, { color: '#5B9BD5' }]}>Ver como Criança</Text>
                <Text style={styles.roleSub}>
                  Dashboard da criança, tarefas, escola, missões
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#5B9BD5" />
            </Pressable>

            <Pressable style={styles.closeBtn} onPress={() => setShowDemoModal(false)}>
              <Text style={styles.closeBtnText}>Fechar</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  waveBg: { ...StyleSheet.absoluteFillObject },
  waveStripe: {
    position: 'absolute',
    width: width * 2,
    height: 120,
    left: -width * 0.3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 60,
  },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  floatingIcons: { ...StyleSheet.absoluteFillObject },
  floatIcon: { position: 'absolute' },
  centerSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
  },
  title: {
    fontSize: 34, fontFamily: 'Nunito_800ExtraBold',
    color: '#1A1A2E', textAlign: 'center', marginBottom: 8,
  },
  subtitle: {
    fontSize: 15, fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(0,0,0,0.5)', textAlign: 'center',
  },
  bottomSection: { paddingBottom: 20, gap: 12 },
  startButton: {
    backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  startButtonText: { color: '#FF8C00', fontSize: 17, fontFamily: 'Nunito_700Bold' },
  demoButton: {
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  demoButtonText: { color: 'rgba(0,0,0,0.6)', fontSize: 15, fontFamily: 'Nunito_700Bold' },
  selectionButtons: { gap: 12 },
  enterButton: {
    backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  enterButtonText: { color: '#FF8C00', fontSize: 17, fontFamily: 'Nunito_700Bold' },
  createButton: {
    backgroundColor: '#FF8C00', borderRadius: 16, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#FF8C00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  createButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Nunito_700Bold' },
  backLink: {
    textAlign: 'center', fontSize: 14, fontFamily: 'Nunito_400Regular',
    color: 'rgba(0,0,0,0.45)', marginTop: 4,
  },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },

  // ── Modal ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingBottom: 36,
  },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFF5E8', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FF8C00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  modalTitle: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: '#1A1A2E' },
  modalSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  demoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF5E8', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20,
    borderWidth: 1, borderColor: '#FFE0B2',
  },
  demoBadgeText: { fontSize: 13, color: '#FF8C00', fontFamily: 'Nunito_600SemiBold', flex: 1 },
  modalRoleLabel: {
    fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 18, borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  roleIcon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  roleTitle: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: '#FF8C00', marginBottom: 2 },
  roleSub: { fontSize: 12, color: '#9CA3AF', fontFamily: 'Nunito_400Regular' },
  closeBtn: {
    marginTop: 20, paddingVertical: 14, borderRadius: 16,
    backgroundColor: '#F1F5F9', alignItems: 'center',
  },
  closeBtnText: { fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: '#64748B' },
});
