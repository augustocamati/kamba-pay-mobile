import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated as RNAnimated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { useApp } from '@/context/AppContext';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChildOnboarding from '@/components/ChildOnboarding';
import SpotlightTour, { TourStep } from '@/components/SpotlightTour';
import { MascotCompanion } from '@/components/MascotCompanion';
import { useSound } from '@/lib/sound-context';

const { width, height } = Dimensions.get('window');
const TILE_GAP = 10;
const TILE_W = (width - 40 - TILE_GAP) / 2;

// ─── Floating star particle ───────────────────────────────────────────────────
function StarParticle({ x, y, delay, size, color }: { x: number; y: number; delay: number; size: number; color: string }) {
  const opacity = useRef(new RNAnimated.Value(0)).current;
  const translateY = useRef(new RNAnimated.Value(0)).current;
  const rotate = useRef(new RNAnimated.Value(0)).current;

  React.useEffect(() => {
    const anim = RNAnimated.sequence([
      RNAnimated.delay(delay),
      RNAnimated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      RNAnimated.parallel([
        RNAnimated.timing(translateY, { toValue: height * 0.85, duration: 1600 + Math.random() * 600, useNativeDriver: true }),
        RNAnimated.timing(rotate, { toValue: 1, duration: 1800, useNativeDriver: true }),
        RNAnimated.sequence([
          RNAnimated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          RNAnimated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
      ]),
    ]);
    anim.start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <RNAnimated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        transform: [{ translateY }, { rotate: spin }],
      }}
    >
      <Text style={{ fontSize: size, color }}>{'★'}</Text>
    </RNAnimated.View>
  );
}

// ─── Jar illustration (pote) ──────────────────────────────────────────────────
function PoteJar({ icon, iconColor, label, value, labelColor }: {
  icon: string; iconColor: string; label: string; value: string; labelColor: string;
}) {
  return (
    <View style={jar.container}>
      <View style={jar.lid} />
      <View style={jar.body}>
        <Ionicons name={icon as any} size={20} color={iconColor} style={{ opacity: 0.55 }} />
      </View>
      <Text style={[jar.label, { color: labelColor }]}>{label}</Text>
      <Text style={jar.value}>{value}</Text>
    </View>
  );
}

const jar = StyleSheet.create({
  container: { alignItems: 'center', flex: 1 },
  lid: { width: 34, height: 10, borderRadius: 8, backgroundColor: '#C9BFAF', marginBottom: -2 },
  body: {
    width: 52, height: 58, borderRadius: 14,
    backgroundColor: '#F0EAE0', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#DDD4C4',
  },
  label: { fontSize: 11, fontFamily: 'Nunito_700Bold', marginTop: 5 },
  value: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: '#6B7280' },
});

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ChildDashboard() {
  const insets = useSafeAreaInsets();
  const { user, logout, isDemo } = useAuth();
  const { crianca } = useApp();
  const { playSound } = useSound();
  const [stars, setStars] = useState<{ id: number; x: number; y: number; delay: number; size: number; color: string }[]>([]);
  const starKey = useRef(0);
  const sparkleRef = useRef<View>(null);

  const [showSlides, setShowSlides] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [layouts, setLayouts] = useState<Record<string, {x:number, y:number, width:number, height:number}>>({});

  const headerRef = useRef<View>(null);
  const menuAprenderRef = useRef<View>(null);
  const menuTarefasRef = useRef<View>(null);
  const menuMissoesRef = useRef<View>(null);
  const menuAjudarRef = useRef<View>(null);
  const poteGeralRef = useRef<View>(null);
  const potePouparRef = useRef<View>(null);
  const poteGastarRef = useRef<View>(null);
  const poteAjudarRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const TOUR_STEPS: TourStep[] = [
    { name: 'header', title: 'O teu Perfil', text: 'Aqui podes ver o teu Nível e consultar o teu perfil.' },
    { name: 'menuAprender', title: 'Aprender', text: 'Temos vídeo aulas e quizzes para aprenderes a gerir bem o dinheiro!' },
    { name: 'menuTarefas', title: 'Aba das Tarefas', text: 'Os teus pais enviam-te tarefas aqui. Cumpra-as para ganhares o teu dinheiro.' },
    { name: 'menuMissoes', title: 'Aba de Missões', text: 'Usa as Missões para juntares dinheiro para algo que queres muito!' },
    { name: 'menuAjudar', title: 'Causas para Ajudar', text: 'Aqui encontras causas para as quais podes doar e ajudar o mundo.' },
    { name: 'poteGeral', title: 'Saldo Geral', text: 'Este Pote mostra a soma de todo o teu dinheiro.' },
    { name: 'potePoupar', title: 'Poupar', text: 'Tudo o que ganhas nas tarefas de Poupança vem parar a este Pote para o futuro.' },
    { name: 'poteGastar', title: 'Gastar', text: 'Uau! O teu dinheiro para usares livremente no teu dia-a-dia está aqui.' },
    { name: 'poteAjudar', title: 'Ajudar os Outros', text: 'Aqui fica a carteira reservada para doares a quem precisa.' },
  ];

  useEffect(() => {
    const checkOnboarding = async () => {
      if (isDemo) {
        // No modo demo, sempre mostramos a apresentação
        setShowSlides(true);
        return;
      }

      const val = await AsyncStorage.getItem('kamba_child_onboarding_slides');
      if (!val) {
        setShowSlides(true);
      } else {
        const valTour = await AsyncStorage.getItem('kamba_child_onboarding_tour');
        if (!valTour) setShowTour(true);
      }
    };
    checkOnboarding();
  }, [isDemo]);

  const measureRef = (name: string, ref: React.RefObject<View | null>) => {
    return new Promise<void>((resolve) => {
      if (ref.current) {
        ref.current.measure((x, y, w, h, pX, pY) => {
          setLayouts(prev => ({ ...prev, [name]: { x: pX, y: pY, width: w, height: h } }));
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  const updateLayouts = async () => {
    await measureRef('header', headerRef);
    await measureRef('menuAprender', menuAprenderRef);
    await measureRef('menuTarefas', menuTarefasRef);
    await measureRef('menuMissoes', menuMissoesRef);
    await measureRef('menuAjudar', menuAjudarRef);
    await measureRef('poteGeral', poteGeralRef);
    await measureRef('potePoupar', potePouparRef);
    await measureRef('poteGastar', poteGastarRef);
    await measureRef('poteAjudar', poteAjudarRef);
  };

  useEffect(() => {
    if (showTour) {
      if (currentStep >= 5) {
        scrollViewRef.current?.scrollTo({ y: 180, animated: true });
      } else {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
      setTimeout(updateLayouts, 500);
    }
  }, [showTour, currentStep]);

  const handleFinishSlides = async () => {
    await AsyncStorage.setItem('kamba_child_onboarding_slides', 'true');
    setShowSlides(false);
    setShowTour(true);
  };

  const handleFinishTour = async () => {
    if (!isDemo) {
      await AsyncStorage.setItem('kamba_child_onboarding_tour', 'true');
    }
    setShowTour(false);
    setCurrentStep(0);
  };

  const startTourManually = () => {
    setCurrentStep(0);
    setShowTour(true);
  };

  if (showSlides) {
    return (
      <ChildOnboarding
        childName={user?.name || crianca.nome}
        onFinish={handleFinishSlides}
      />
    );
  }

  const name = user?.name || crianca.nome;
  const saldoGeral = Number(crianca.potes.total || 0).toFixed(2);
  const saldoPoupar = Number(crianca.potes.saldo_poupar || 0).toFixed(2);
  const saldoGastar = Number(crianca.potes.saldo_gastar || 0).toFixed(2);
  const saldoAjudar = Number(crianca.potes.saldo_ajudar || 0).toFixed(2);
  const webTop = Platform.OS === 'web' ? 67 : 0;

  const handleSparkle = () => {
    playSound('correct');
    const COLORS = ['#FFD700', '#FF8C00', '#FF6B6B', '#A78BFA', '#34D399', '#60A5FA', '#F9A8D4', '#FCD34D', '#86EFAC'];
    const COUNT = 28;
    const newStars = Array.from({ length: COUNT }).map((_, i) => ({
      id: ++starKey.current,
      // distribute randomly across the full screen width
      x: Math.random() * (width - 30),
      // start from random vertical positions in the top ~30% of the screen
      y: Math.random() * height * 0.25,
      delay: i * 55,
      size: 12 + Math.random() * 22,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setStars(prev => [...prev, ...newStars]);
    // clean up after animation completes
    setTimeout(() => {
      setStars(prev => prev.filter(s => !newStars.find(ns => ns.id === s.id)));
    }, 2800);
  };

  return (
    <View style={s.root}>
      {/* Star particles layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {stars.map(st => (
          <StarParticle key={st.id} x={st.x} y={st.y} delay={st.delay} size={st.size} color={st.color} />
        ))}
      </View>

      <ScrollView
        ref={scrollViewRef}
        scrollEnabled={!showTour}
        contentContainerStyle={[s.scroll, { flexGrow: 1, paddingTop: (insets.top || webTop) + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.header}>
          <View ref={headerRef} collapsable={false}>
            <Text style={s.greeting}>Olá, {name}! 👋</Text>
            <View style={s.xpPill}>
              <Ionicons name="star" size={13} color="#FF8C00" />
              <Text style={s.xpText}>{crianca.xp || 0} XP</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={s.logoutBtn}
              onPress={async () => { playSound('click'); await logout(); router.replace('/'); }}
            >
              <Ionicons name="log-out-outline" size={22} color="#FF6B00" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Content Wrapper for Vertical Centering */}
        <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
          {/* ── Menu Row ── */}
          <Animated.View entering={FadeInDown.delay(80).duration(450)} style={[s.grid, { marginBottom: 40 }]}>
            <View style={{ zIndex: 1 }}>
              {/* Row 1 */}
              <View style={s.gridRow}>
                <View ref={menuAprenderRef} collapsable={false}>
                  <Pressable
                    style={({ pressed }) => [s.tile, s.tileOrange, pressed && s.tilePressed]}
                    onPress={() => { playSound('click'); router.push('/child/(tabs)/school' as any); }}
                  >
                    <View style={s.tileIconBox}>
                      <MaterialCommunityIcons name="school-outline" size={30} color="#fff" />
                    </View>
                    <Text style={s.tileLabel}>Aprender</Text>
                  </Pressable>
                </View>

                <View ref={menuTarefasRef} collapsable={false}>
                  <Pressable
                    style={({ pressed }) => [s.tile, s.tileBlue, pressed && s.tilePressed]}
                    onPress={() => { playSound('click'); router.push('/child/(tabs)/tasks' as any); }}
                  >
                    <View style={s.tileIconBox}>
                      <MaterialCommunityIcons name="clipboard-list-outline" size={30} color="#fff" />
                    </View>
                    <Text style={s.tileLabel}>Tarefas</Text>
                  </Pressable>
                </View>
              </View>

              {/* Central sparkle */}
              <View style={s.sparkleWrapper}>
                <Pressable style={({ pressed }) => [s.sparkleBtn, pressed && s.sparklePrs]} onPress={handleSparkle}>
                  <MaterialCommunityIcons name="shimmer" size={24} color="#fff" />
                </Pressable>
              </View>

              {/* Row 2 */}
              <View style={s.gridRow}>
                <View ref={menuMissoesRef} collapsable={false}>
                  <Pressable
                    style={({ pressed }) => [s.tile, s.tileTeal, pressed && s.tilePressed]}
                    onPress={() => { playSound('click'); router.push('/child/(tabs)/missions' as any); }}
                  >
                    <View style={s.tileIconBox}>
                      <MaterialCommunityIcons name="flag-checkered" size={30} color="#fff" />
                    </View>
                    <Text style={s.tileLabel}>Missões</Text>
                  </Pressable>
                </View>

                <View ref={menuAjudarRef} collapsable={false}>
                  <Pressable
                    style={({ pressed }) => [s.tile, s.tileYellow, pressed && s.tilePressed]}
                    onPress={() => { playSound('click'); router.push('/child/(tabs)/help' as any); }}
                  >
                    <View style={s.tileIconBox}>
                      <Ionicons name="heart-outline" size={30} color="#fff" />
                    </View>
                    <Text style={s.tileLabel}>Ajudar</Text>
                  </Pressable>
                </View>
              </View>

              {/* Row 3 - New Loja Tile */}
              <View style={[s.gridRow, { justifyContent: 'center' }]}>
                <Pressable
                  style={({ pressed }) => [s.tile, s.tilePurple, pressed && s.tilePressed, { width: TILE_W * 2 + TILE_GAP }]}
                  onPress={() => { playSound('click'); router.push('/child/shop' as any); }}
                >
                  <View style={s.tileIconBox}>
                    <Ionicons name="storefront-outline" size={30} color="#fff" />
                  </View>
                  <Text style={s.tileLabel}>Loja de Mascotes</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* ── Os Meus Potes ── */}
          <Animated.View entering={FadeInDown.delay(140).duration(450)}>
            <View>
              <Text style={s.sectionTitle}>Os Meus Potes 🪙</Text>
              <View style={s.potesRow}>
                <View ref={poteGeralRef} collapsable={false} style={{ flex: 1 }}>
                  <PoteJar icon="apps-outline" iconColor="#FF6B6B" label="Geral" value={`${saldoGeral} Kz`} labelColor="#FF6B6B" />
                </View>
                <View ref={potePouparRef} collapsable={false} style={{ flex: 1 }}>
                  <PoteJar icon="wallet-outline" iconColor="#4ADE80" label="Poupar" value={`${saldoPoupar} Kz`} labelColor="#4ADE80" />
                </View>
                <View ref={poteGastarRef} collapsable={false} style={{ flex: 1 }}>
                  <PoteJar icon="card-outline" iconColor="#FB923C" label="Gastar" value={`${saldoGastar} Kz`} labelColor="#FB923C" />
                </View>
                <View ref={poteAjudarRef} collapsable={false} style={{ flex: 1 }}>
                  <PoteJar icon="heart-outline" iconColor="#F472B6" label="Ajudar" value={`${saldoAjudar} Kz`} labelColor="#F472B6" />
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Onboarding Tour Overlay */}
      <SpotlightTour
        visible={showTour}
        currentStep={currentStep}
        steps={TOUR_STEPS}
        layouts={layouts}
        onNext={() => setCurrentStep(prev => prev + 1)}
        onPrev={() => setCurrentStep(prev => prev - 1)}
        onFinish={handleFinishTour}
      />

      {/* Floating mascot companion */}
      {!showTour && !showSlides && (
        <MascotCompanion
          position="bottom-right"
          onPress={() => router.push('/child/(tabs)/school' as any)}
        />
      )}
    </View>
  );
}

const ORANGE = '#FF6E4A';
const BLUE = '#5B9BD5';
const TEAL = '#3EC9A7';
const YELLOW = '#F5C842';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F7F7' },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  greeting: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: '#1A1A2E' },
  xpPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 10, marginTop: 4, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#FFE0B2',
  },
  xpText: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#FF8C00' },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF5E8', alignItems: 'center', justifyContent: 'center' },

  // Grid
  grid: { marginBottom: 28, position: 'relative' },
  gridRow: { flexDirection: 'row', gap: TILE_GAP },
  tile: {
    width: TILE_W, height: 100, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: TILE_GAP,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  tileOrange: { backgroundColor: ORANGE },
  tileBlue: { backgroundColor: BLUE },
  tileTeal: { backgroundColor: TEAL },
  tileYellow: { backgroundColor: YELLOW },
  tilePurple: { backgroundColor: '#7C3AED' },
  tilePressed: { opacity: 0.82, transform: [{ scale: 0.96 }] },
  tileIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },

  // Sparkle
  sparkleWrapper: {
    position: 'absolute',
    top: 100 - 24,
    left: (width - 40) / 2 - 24,
    zIndex: 10,
  },
  sparkleBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center',
    shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 8, elevation: 8,
    borderWidth: 3, borderColor: '#FFFFFF',
  },
  sparklePrs: { transform: [{ scale: 0.9 }] },

  // Section
  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_800ExtraBold', color: '#1A1A2E', marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: ORANGE },

  // Potes
  potesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },

  // Tasks
  taskCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: '#FFE0B2',
  },
  taskIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#1A1A2E' },
  taskDesc: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: '#9CA3AF', marginTop: 2 },
  rewardBadge: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  rewardText: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#FF8C00' },

  emptyCard: {
    backgroundColor: '#F0FDF4', borderRadius: 16, padding: 18, alignItems: 'center',
    borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 10,
  },
  emptyText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: '#15803D' },

  // Missions
  missionCard: {
    borderRadius: 20, padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  missionTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  missionTitle: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: '#FFFFFF', flex: 1 },
  progressTrack: { height: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 5 },
  missionSub: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: 'rgba(255,255,255,0.85)' },
  missionPct: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: '#FFFFFF' },
});
