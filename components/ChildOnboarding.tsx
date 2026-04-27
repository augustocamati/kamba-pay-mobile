import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export const ONBOARDING_KEY = 'kamba_child_onboarding_done';

// ─── Slide data ────────────────────────────────────────────────────────────────
interface Slide {
  id: string;
  gradient: [string, string, ...string[]];
  emoji: string;
  emojiSize: number;
  title: string;
  description: string;
  icon?: string;
  iconLib?: 'ion' | 'mci';
  iconColor?: string;
  badge?: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    gradient: ['#FF8C00', '#FFB347'],
    emoji: '🎉',
    emojiSize: 72,
    title: 'Bem-vindo ao Kamba Pay!',
    description:
      'O teu espaço mágico para aprender sobre dinheiro, completar tarefas e ganhar recompensas!',
    badge: 'Olá, futuro campeão!',
  },
  {
    id: '2',
    gradient: ['#5B9BD5', '#7EC8E3'],
    emoji: '⭐',
    emojiSize: 68,
    title: 'Tarefas e Recompensas',
    description:
      'Completa as tarefas que os teus pais definem e ganha Kwanzas para o teu pote! Quanto mais completas, mais ganhas.',
    icon: 'clipboard-list-outline',
    iconLib: 'mci',
    iconColor: '#FFFFFF',
  },
  {
    id: '3',
    gradient: ['#3EC9A7', '#6EE7C2'],
    emoji: '🪙',
    emojiSize: 68,
    title: 'Os Teus 3 Potes',
    description:
      'Aprende a dividir o teu dinheiro:\n💚 Poupar — guarda para o futuro\n🟠 Gastar — usa com sabedoria\n💗 Ajudar — doa a quem precisa',
    icon: 'wallet-outline',
    iconLib: 'ion',
    iconColor: '#FFFFFF',
  },
  {
    id: '4',
    gradient: ['#A855F7', '#D946EF'],
    emoji: '🎯',
    emojiSize: 68,
    title: 'Missões Especiais',
    description:
      'Cria missões de poupança para conquistar os teus sonhos — uma bicicleta, um jogo, ou qualquer coisa que desejares!',
    icon: 'flag-checkered',
    iconLib: 'mci',
    iconColor: '#FFFFFF',
  },
  {
    id: '5',
    gradient: ['#F59E0B', '#FCD34D'],
    emoji: '📚',
    emojiSize: 68,
    title: 'Aprender é Divertido',
    description:
      'Vai à secção Aprender para fazer quizzes, ver aulas e tornar-te um especialista em finanças!',
    icon: 'school-outline',
    iconLib: 'mci',
    iconColor: '#FFFFFF',
  },
  {
    id: '6',
    gradient: ['#FF6B6B', '#FF8E8E'],
    emoji: '🚀',
    emojiSize: 80,
    title: 'Está pronto para começar?',
    description:
      'A tua aventura financeira começa agora! Explora, aprende e cresce com o Kamba Pay.',
    badge: 'Vamos lá! 🎊',
  },
];

// ─── Dot indicator ─────────────────────────────────────────────────────────────
function Dots({ total, active }: { total: number; active: number }) {
  return (
    <View style={dot.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            dot.base,
            i === active ? dot.active : dot.inactive,
          ]}
        />
      ))}
    </View>
  );
}

const dot = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 28 },
  base: { height: 8, borderRadius: 4 },
  active: { width: 24, backgroundColor: '#FFFFFF' },
  inactive: { width: 8, backgroundColor: 'rgba(255,255,255,0.4)' },
});

// ─── Single slide card ─────────────────────────────────────────────────────────
function SlideCard({ slide }: { slide: Slide }) {
  return (
    <View style={{ width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
      {/* Main illustration circle */}
      <View style={card.circle}>
        {slide.icon ? (
          slide.iconLib === 'mci' ? (
            <MaterialCommunityIcons name={slide.icon as any} size={60} color={slide.iconColor ?? '#fff'} />
          ) : (
            <Ionicons name={slide.icon as any} size={60} color={slide.iconColor ?? '#fff'} />
          )
        ) : null}
        <Text style={{ fontSize: slide.emojiSize, lineHeight: slide.emojiSize + 12 }}>{slide.emoji}</Text>
      </View>

      {/* Badge */}
      {slide.badge && (
        <View style={card.badge}>
          <Text style={card.badgeText}>{slide.badge}</Text>
        </View>
      )}

      {/* Text */}
      <Text style={card.title}>{slide.title}</Text>
      <Text style={card.description}>{slide.description}</Text>
    </View>
  );
}

const card = StyleSheet.create({
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  badgeText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 32,
  },
  description: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
});

// ─── Main component ────────────────────────────────────────────────────────────
interface ChildOnboardingProps {
  onFinish: () => void;
  childName?: string;
}

export default function ChildOnboarding({ onFinish, childName }: ChildOnboardingProps) {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;
  const scrollRef = useRef<ScrollView>(null);
  const [current, setCurrent] = useState(0);

  // Floating star animation
  const starAnim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(starAnim, { toValue: -12, duration: 1400, useNativeDriver: true }),
        Animated.timing(starAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      const next = current + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrent(next);
    } else {
      handleFinish();
    }
  };

  const goPrev = () => {
    if (current > 0) {
      const prev = current - 1;
      scrollRef.current?.scrollTo({ x: prev * width, animated: true });
      setCurrent(prev);
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onFinish();
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;
  const isFirst = current === 0;

  return (
    <LinearGradient
      colors={slide.gradient}
      style={[styles.root, { paddingTop: insets.top || webTop }]}
    >
      {/* Skip button */}
      {!isLast && (
        <Pressable style={styles.skipBtn} onPress={handleFinish}>
          <Text style={styles.skipText}>Saltar</Text>
          <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.75)" />
        </Pressable>
      )}

      {/* Floating emoji decoration */}
      <Animated.View
        style={[
          styles.floatStar,
          { transform: [{ translateY: starAnim }] },
        ]}
        pointerEvents="none"
      >
        <Text style={{ fontSize: 28 }}>✨</Text>
      </Animated.View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ width: width * SLIDES.length }}
      >
        {SLIDES.map((sl) => (
          <SlideCard key={sl.id} slide={sl} />
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={[styles.footer, { paddingBottom: (insets.bottom || 20) + 8 }]}>
        <Dots total={SLIDES.length} active={current} />

        <View style={styles.btnRow}>
          {/* Back button */}
          <Pressable
            style={[styles.backBtn, isFirst && styles.hidden]}
            onPress={goPrev}
            disabled={isFirst}
          >
            <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.85)" />
          </Pressable>

          {/* Next / Finish */}
          <Pressable
            style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}
            onPress={goNext}
          >
            {isLast ? (
              <View style={styles.nextInner}>
                <Text style={styles.nextText}>Começar!</Text>
                <MaterialCommunityIcons name="rocket-launch" size={20} color="#FF8C00" />
              </View>
            ) : (
              <View style={styles.nextInner}>
                <Text style={styles.nextText}>Próximo</Text>
                <Ionicons name="chevron-forward" size={18} color="#FF8C00" />
              </View>
            )}
          </Pressable>
        </View>

        {/* Step counter */}
        <Text style={styles.stepCounter}>{current + 1} de {SLIDES.length}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  skipBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 20,
  },
  // Adjust top for safe area — we set it in JSX via absolute positioning + insets
  skipText: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  floatStar: {
    position: 'absolute',
    top: 60,
    left: 30,
    zIndex: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  hidden: { opacity: 0 },
  nextBtn: {
    flex: 1,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  nextInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#FF8C00',
  },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  stepCounter: {
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },
});
