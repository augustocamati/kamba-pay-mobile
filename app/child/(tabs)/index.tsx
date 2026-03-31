import React, { useState, useRef } from 'react';
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

const { width, height } = Dimensions.get('window');
const TILE_GAP = 10;
const TILE_W = (width - 40 - TILE_GAP) / 2;

// ─── Floating star particle ───────────────────────────────────────────────────
function StarParticle({ x, y, delay, size, color }: { x: number; y: number; delay: number; size: number; color: string }) {
  const opacity = useRef(new RNAnimated.Value(0)).current;
  const translateY = useRef(new RNAnimated.Value(0)).current;
  const scale = useRef(new RNAnimated.Value(0.3)).current;

  React.useEffect(() => {
    const anim = RNAnimated.sequence([
      RNAnimated.delay(delay),
      RNAnimated.parallel([
        RNAnimated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        RNAnimated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      RNAnimated.parallel([
        RNAnimated.timing(translateY, { toValue: -80, duration: 800, useNativeDriver: true }),
        RNAnimated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    ]);
    anim.start();
  }, []);

  return (
    <RNAnimated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        transform: [{ translateY }, { scale }],
      }}
    >
      <Text style={{ fontSize: size, color }}>✦</Text>
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
  const { user, logout } = useAuth();
  const { crianca, tarefas, missoes } = useApp();
  const [stars, setStars] = useState<{ id: number; x: number; y: number; delay: number; size: number; color: string }[]>([]);
  const starKey = useRef(0);
  const sparkleRef = useRef<View>(null);

  const name = user?.name || crianca.nome;
  const saldoGeral = crianca.potes.total;
  const saldoPoupar = crianca.potes.saldo_poupar;
  const saldoGastar = crianca.potes.saldo_gastar;
  const saldoAjudar = crianca.potes.saldo_ajudar;
  const webTop = Platform.OS === 'web' ? 67 : 0;

  const paraFazer = tarefas.filter(t => t.status === 'pendente').slice(0, 3);

  const handleSparkle = () => {
    const COLORS = ['#FFD700', '#FF8C00', '#FF6B6B', '#A78BFA', '#34D399', '#60A5FA'];
    const cx = width / 2 - 30;
    const cy = height * 0.42;
    const newStars = Array.from({ length: 12 }).map((_, i) => ({
      id: ++starKey.current,
      x: cx + (Math.random() - 0.5) * 200,
      y: cy + (Math.random() - 0.5) * 80,
      delay: i * 60,
      size: 10 + Math.random() * 18,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setStars(prev => [...prev, ...newStars]);
    setTimeout(() => {
      setStars(prev => prev.filter(s => !newStars.find(ns => ns.id === s.id)));
    }, 1400);
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
        contentContainerStyle={[s.scroll, { paddingTop: (insets.top || webTop) + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.header}>
          <View>
            <Text style={s.greeting}>Olá, {name}! 👋</Text>
            <View style={s.xpPill}>
              <Ionicons name="star" size={13} color="#FF8C00" />
              <Text style={s.xpText}>{crianca.xp || 0} XP</Text>
            </View>
          </View>
          <TouchableOpacity
            style={s.logoutBtn}
            onPress={async () => { await logout(); router.replace('/'); }}
          >
            <Ionicons name="log-out-outline" size={22} color="#FF6B00" />
          </TouchableOpacity>
        </Animated.View>

        {/* ── 2×2 menu grid ── */}
        <Animated.View entering={FadeInDown.delay(80).duration(450)} style={s.grid}>
          {/* Row 1 */}
          <View style={s.gridRow}>
            <Pressable
              style={({ pressed }) => [s.tile, s.tileOrange, pressed && s.tilePressed]}
              onPress={() => router.push('/child/(tabs)/school' as any)}
            >
              <View style={s.tileIconBox}>
                <MaterialCommunityIcons name="school-outline" size={30} color="#fff" />
              </View>
              <Text style={s.tileLabel}>Aprender</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.tile, s.tileBlue, pressed && s.tilePressed]}
              onPress={() => router.push('/child/(tabs)/tasks' as any)}
            >
              <View style={s.tileIconBox}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={30} color="#fff" />
              </View>
              <Text style={s.tileLabel}>Tarefas</Text>
            </Pressable>
          </View>

          {/* Central sparkle */}
          <View style={s.sparkleWrapper}>
            <Pressable style={({ pressed }) => [s.sparkleBtn, pressed && s.sparklePrs]} onPress={handleSparkle}>
              <MaterialCommunityIcons name="shimmer" size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Row 2 */}
          <View style={s.gridRow}>
            <Pressable
              style={({ pressed }) => [s.tile, s.tileTeal, pressed && s.tilePressed]}
              onPress={() => router.push('/child/(tabs)/missions' as any)}
            >
              <View style={s.tileIconBox}>
                <MaterialCommunityIcons name="flag-checkered" size={30} color="#fff" />
              </View>
              <Text style={s.tileLabel}>Missões</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.tile, s.tileYellow, pressed && s.tilePressed]}
              onPress={() => router.push('/child/(tabs)/help' as any)}
            >
              <View style={s.tileIconBox}>
                <Ionicons name="heart-outline" size={30} color="#fff" />
              </View>
              <Text style={s.tileLabel}>Ajudar</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Os Meus Potes ── */}
        <Animated.View entering={FadeInDown.delay(140).duration(450)}>
          <Text style={s.sectionTitle}>Os Meus Potes 🪙</Text>
          <View style={s.potesRow}>
            <PoteJar icon="apps-outline" iconColor="#FF6B6B" label="Geral" value={`${saldoGeral} Kz`} labelColor="#FF6B6B" />
            <PoteJar icon="wallet-outline" iconColor="#4ADE80" label="Poupar" value={`${saldoPoupar} Kz`} labelColor="#4ADE80" />
            <PoteJar icon="card-outline" iconColor="#FB923C" label="Gastar" value={`${saldoGastar} Kz`} labelColor="#FB923C" />
            <PoteJar icon="heart-outline" iconColor="#F472B6" label="Ajudar" value={`${saldoAjudar} Kz`} labelColor="#F472B6" />
          </View>
        </Animated.View>

        {/* ── Tarefas para fazer ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(450)}>
          <View style={s.rowBetween}>
            <Text style={s.sectionTitle}>Tarefas do Dia ⭐</Text>
            <Pressable onPress={() => router.push('/child/(tabs)/tasks' as any)}>
              <Text style={s.seeAll}>Ver todas</Text>
            </Pressable>
          </View>
          {paraFazer.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>🎉 Todas as tarefas concluídas!</Text>
            </View>
          ) : (
            paraFazer.map(task => (
              <Pressable
                key={task.id}
                style={s.taskCard}
                onPress={() => router.push({ pathname: '/child/submit-task', params: { taskId: task.id } } as any)}
              >
                <View style={s.taskIconBg}>
                  <MaterialCommunityIcons name={(task.icone as any) || 'clipboard-text'} size={22} color="#FF9900" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.taskTitle}>{task.titulo}</Text>
                  <Text style={s.taskDesc} numberOfLines={1}>{task.descricao}</Text>
                </View>
                <View style={s.rewardBadge}>
                  <Text style={s.rewardText}>+{task.recompensa} Kz</Text>
                </View>
              </Pressable>
            ))
          )}
        </Animated.View>

        {/* ── Missões ── */}
        {missoes.length > 0 && (
          <Animated.View entering={FadeInDown.delay(260).duration(450)}>
            <View style={s.rowBetween}>
              <Text style={s.sectionTitle}>Missões 🎯</Text>
              <Pressable onPress={() => router.push('/child/(tabs)/missions' as any)}>
                <Text style={s.seeAll}>Ver todas</Text>
              </Pressable>
            </View>
            {missoes.slice(0, 2).map(mission => {
              const pct = Math.min(Math.round((mission.progresso_atual / mission.objetivo_valor) * 100), 100);
              return (
                <View key={mission.id} style={[s.missionCard, { backgroundColor: mission.cor?.[0] ?? '#A855F7' }]}>
                  <View style={s.missionTop}>
                    <Text style={{ fontSize: 22 }}>{mission.icone}</Text>
                    <Text style={s.missionTitle}>{mission.titulo}</Text>
                  </View>
                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${Math.max(pct, 2)}%` as any }]} />
                  </View>
                  <View style={s.rowBetween}>
                    <Text style={s.missionSub}>
                      {mission.progresso_atual.toLocaleString()} / {mission.objetivo_valor.toLocaleString()} Kz
                    </Text>
                    <Text style={s.missionPct}>{pct}%</Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>
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
