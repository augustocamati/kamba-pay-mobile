import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, Dimensions,
  ActivityIndicator, PanResponder, Animated as RNAnimated,
  Modal, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { MASCOT_ASSETS } from '@/lib/mascot-assets';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn, BounceIn, FadeIn } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { educationalService } from '@/lib/api';
import { useMascot } from '@/lib/mascot-context';
import { useSound } from '@/lib/sound-context';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

type QuizItem = {
  id: string | number;
  pergunta: string;
  opcoes: { id_opcao: number; texto: string; correta?: boolean }[];
  xp_recompensa?: number;
};

// ── Simple audio feedback via pattern (Haptics is available) ─────────────────
function playHapticFeedback(type: 'correct' | 'wrong') {
  if (Platform.OS === 'web') return;
  if (type === 'correct') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}

// ── Mascot bubble component ──────────────────────────────────────────────────
function MascotBubble({ message, emoji, type }: { message: string; emoji: string; type?: 'correct' | 'wrong' | 'neutral' }) {
  const { activeMascot } = useMascot();
  const bgColor = type === 'correct' ? '#DCFCE7' : type === 'wrong' ? '#FEE2E2' : '#EDE9FE';
  const borderColor = type === 'correct' ? '#86EFAC' : type === 'wrong' ? '#FCA5A5' : '#C4B5FD';
  const textColor = type === 'correct' ? '#15803D' : type === 'wrong' ? '#DC2626' : '#5B21B6';

  return (
    <Animated.View entering={BounceIn} style={[styles.mascotRow]}>
      <View style={styles.mascotAvatarBox}>
        {activeMascot?.imagem_url && MASCOT_ASSETS[activeMascot.imagem_url] ? (
          <Image 
            source={MASCOT_ASSETS[activeMascot.imagem_url]} 
            style={{ width: 50, height: 50 }} 
            contentFit="contain" 
          />
        ) : (
          <Text style={{ fontSize: 36 }}>{emoji}</Text>
        )}
      </View>
      <View style={[styles.speechBubble, { backgroundColor: bgColor, borderColor }]}>
        <Text style={[styles.speechText, { color: textColor }]}>{message}</Text>
        <View style={[styles.bubbleTail, { borderRightColor: bgColor }]} />
      </View>
    </Animated.View>
  );
}

// ── Draggable answer chip ────────────────────────────────────────────────────
function DragChip({
  option, onDrop, disabled, isDropped, isCorrect, isWrong,
}: {
  option: { id_opcao: number; texto: string };
  onDrop: (id: number, dropped: boolean) => void;
  disabled: boolean;
  isDropped: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
}) {
  const pan = useRef(new RNAnimated.ValueXY()).current;
  const scale = useRef(new RNAnimated.Value(1)).current;
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !isDropped,
      onMoveShouldSetPanResponder: () => !disabled && !isDropped,
      onPanResponderGrant: () => {
        isDragging.current = true;
        RNAnimated.spring(scale, { toValue: 1.1, useNativeDriver: true }).start();
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: RNAnimated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gestureState) => {
        isDragging.current = false;
        RNAnimated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        
        // Expanded drop zone check (more generous detection)
        const isWithinY = gestureState.moveY > height * 0.3 && gestureState.moveY < height * 0.65;
        const isWithinX = gestureState.moveX > width * 0.05 && gestureState.moveX < width * 0.95;
        
        if (isWithinY && isWithinX) {
          onDrop(option.id_opcao, true);
        } else {
          // If not in the correct success zone, just spring back to original position
          RNAnimated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  let chipBg = '#fff';
  let chipBorder = '#E2E8F0';
  let chipText = '#1E293B';

  if (isCorrect) { chipBg = '#DCFCE7'; chipBorder = '#4ADE80'; chipText = '#15803D'; }
  if (isWrong) { chipBg = '#FEE2E2'; chipBorder = '#F87171'; chipText = '#DC2626'; }
  if (isDropped && !isCorrect && !isWrong) { chipBg = '#EDE9FE'; chipBorder = '#C4B5FD'; chipText = '#5B21B6'; }

  return (
    <RNAnimated.View
      style={[
        styles.dragChip,
        { backgroundColor: chipBg, borderColor: chipBorder },
        { transform: [...pan.getTranslateTransform(), { scale }] },
        isDropped && styles.dragChipDropped,
      ]}
      {...(!isDropped && !disabled ? panResponder.panHandlers : {})}
    >
      <Ionicons
        name={isCorrect ? 'checkmark-circle' : isWrong ? 'close-circle' : 'ellipse-outline'}
        size={18}
        color={isCorrect ? '#4ADE80' : isWrong ? '#F87171' : '#CBD5E1'}
      />
      <Text style={[styles.dragChipText, { color: chipText }]}>{option.texto}</Text>
    </RNAnimated.View>
  );
}

// ── Drop Zone ────────────────────────────────────────────────────────────────
function DropZone({ hasItem, item, isCorrect, isWrong }: {
  hasItem: boolean;
  item?: { id_opcao: number; texto: string };
  isCorrect?: boolean;
  isWrong?: boolean;
}) {
  const pulse = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    if (!hasItem) {
      const anim = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(pulse, { toValue: 1.04, duration: 900, useNativeDriver: true }),
          RNAnimated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulse.setValue(1);
    }
  }, [hasItem]);

  let zoneBg = 'rgba(124,58,237,0.06)';
  let zoneBorder = '#C4B5FD';
  let zoneBorderStyle: 'solid' | 'dashed' = 'dashed';

  if (isCorrect) { zoneBg = '#DCFCE7'; zoneBorder = '#4ADE80'; zoneBorderStyle = 'solid'; }
  if (isWrong) { zoneBg = '#FEE2E2'; zoneBorder = '#F87171'; zoneBorderStyle = 'solid'; }
  if (hasItem && !isCorrect && !isWrong) { zoneBg = '#EDE9FE'; zoneBorder = '#7C3AED'; zoneBorderStyle = 'solid'; }

  return (
    <RNAnimated.View
      style={[
        styles.dropZone,
        { backgroundColor: zoneBg, borderColor: zoneBorder, borderStyle: zoneBorderStyle },
        { transform: [{ scale: !hasItem ? pulse : 1 }] },
      ]}
    >
      {hasItem && item ? (
        <View style={styles.droppedChip}>
          <Ionicons
            name={isCorrect ? 'checkmark-circle' : isWrong ? 'close-circle' : 'checkmark-circle-outline'}
            size={22}
            color={isCorrect ? '#4ADE80' : isWrong ? '#F87171' : '#7C3AED'}
          />
          <Text style={[
            styles.droppedChipText,
            isCorrect ? { color: '#15803D' } : isWrong ? { color: '#DC2626' } : { color: '#5B21B6' }
          ]}>
            {item.texto}
          </Text>
        </View>
      ) : (
        <View style={styles.dropZonePlaceholder}>
          <Ionicons name="sparkles" size={28} color="#C4B5FD" />
          <Text style={styles.dropZoneText}>Arrasta a resposta aqui</Text>
        </View>
      )}
    </RNAnimated.View>
  );
}

// ── Results Popup ─────────────────────────────────────────────────────────────
function ResultPopup({
  visible, isCorrect, message, mascotEmoji, xpGained, onNext, onHome, isLast,
}: {
  visible: boolean; isCorrect: boolean; message: string; mascotEmoji: string;
  xpGained: number; onNext: () => void; onHome: () => void; isLast: boolean;
}) {
  const { activeMascot } = useMascot();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.popupOverlay}>
        <Animated.View entering={ZoomIn} style={styles.popupBox}>
          <Text style={{ fontSize: 72, textAlign: 'center' }}>
            {isCorrect ? '🏆' : '💪'}
          </Text>
          <Text style={styles.popupTitle}>{isCorrect ? 'Muito bem!' : 'Quase lá!'}</Text>

          {/* Mascot message */}
          <View style={styles.popupMascotRow}>
            <View style={styles.resultMascotBg}>
                {activeMascot?.imagem_url && MASCOT_ASSETS[activeMascot.imagem_url] ? (
                  <Image 
                    source={MASCOT_ASSETS[activeMascot.imagem_url]} 
                    style={{ width: 60, height: 60 }} 
                    contentFit="contain" 
                  />
                ) : (
                  <Text style={{ fontSize: 44 }}>{mascotEmoji}</Text>
                )}
            </View>
            <View style={[styles.popupBubble, { backgroundColor: isCorrect ? '#DCFCE7' : '#FEE2E2' }]}>
              <Text style={[styles.popupBubbleText, { color: isCorrect ? '#15803D' : '#DC2626' }]}>
                {message}
              </Text>
            </View>
          </View>

          {isCorrect && (
            <View style={styles.xpBannerRow}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={styles.xpBannerText}>+{xpGained} XP ganhos!</Text>
            </View>
          )}

          <View style={styles.popupActions}>
            {!isLast && (
              <Pressable style={styles.nextBtn} onPress={onNext}>
                <LinearGradient
                  colors={['#7C3AED', '#6D28D9']}
                  style={styles.nextGradient}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextBtnText}>Próxima Pergunta →</Text>
                </LinearGradient>
              </Pressable>
            )}
            <Pressable style={styles.homeBtn} onPress={onHome}>
              <Text style={styles.homeBtnText}>
                {isLast ? '🏠 Ir para o Início' : '↩ Voltar ao Início'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── Main Quiz Screen ─────────────────────────────────────────────────────────
export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const { id: contentId, id_missao } = useLocalSearchParams();
  const { adicionarXP, marcarConteudoCompleto, refreshData } = useApp();
  const { activeMascot, getRandomMessage } = useMascot();
  const { playSound, toggleBgMusic } = useSound();

  const isGeneralMode = !id_missao;

  // Quiz list (general mode uses static bank, specific mode loads from API)
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Per-question state
  const [droppedOption, setDroppedOption] = useState<{ id_opcao: number; texto: string } | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [mascotMsg, setMascotMsg] = useState('');
  const [mascotMsgType, setMascotMsgType] = useState<'neutral' | 'correct' | 'wrong'>('neutral');

  // Final summary state
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);

  // Load bg music
  useEffect(() => {
    toggleBgMusic(true);
    return () => toggleBgMusic(false);
  }, []);

  const mascotData = activeMascot;

  // ─── Load quizzes ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        if (isGeneralMode) {
          const resp = await educationalService.getGeneralQuizzes(5);
          setQuizList(resp.quizzes);
        } else {
          if (!id_missao) { setLoading(false); return; }
          const data = await educationalService.getQuizDetails(id_missao as string);
          setQuizList([data]);
        }
      } catch (e) {
        console.error('Quiz load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id_missao, isGeneralMode]);

  // Show greeting message from mascot when quiz loads
  useEffect(() => {
    if (!loading && quizList.length > 0) {
      setMascotMsg(getRandomMessage('drag'));
      setMascotMsgType('neutral');
    }
  }, [loading, quizList.length]);

  const currentQuiz = quizList[currentIdx];
  const isLastQuestion = currentIdx >= quizList.length - 1;

  const handleDrop = async (opcaoId: number, dropped: boolean) => {
    if (!dropped || !currentQuiz || droppedOption) return;
    const option = currentQuiz.opcoes.find(o => o.id_opcao === opcaoId);
    if (!option) return;

    setDroppedOption(option);

    // Determine correctness
    let correct = false;
    try {
      const resp = await educationalService.submitQuiz(currentQuiz.id as any, opcaoId);
      correct = resp.correta;
      if (correct) {
        const xp = resp.recompensa?.xp || currentQuiz.xp_recompensa || 20;
        setTotalXP(prev => prev + xp);
        adicionarXP(xp);
        if (contentId && !isGeneralMode) marcarConteudoCompleto(contentId as string);
      }
    } catch (e) {
      console.error('Quiz submit error:', e);
      // Fallback for safety (though API should handle this)
      correct = option.correta === true;
    }

    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);

    // Sound & Haptic feedback
    playSound(correct ? 'correct' : 'wrong');
    playHapticFeedback(correct ? 'correct' : 'wrong');

    // Mascot message
    const msg = getRandomMessage(correct ? 'correct' : 'wrong');
    setMascotMsg(msg);
    setMascotMsgType(correct ? 'correct' : 'wrong');

    // Show result popup after short delay
    setTimeout(() => setShowResult(true), 900);
  };

  const handleNext = () => {
    playSound('click');
    setShowResult(false);
    if (isLastQuestion) {
      setIsFinished(true);
    } else {
      setCurrentIdx(prev => prev + 1);
      setDroppedOption(null);
      setIsCorrect(null);
      setMascotMsg(getRandomMessage('drag'));
      setMascotMsgType('neutral');
    }
  };

  const handleHome = () => {
    playSound('click');
    setShowResult(false);
    refreshData();
    router.replace('/child/(tabs)');
  };

  // ─── Loading ─────────────────────────────────────────────────────────────
    if (loading) {
      return (
        <LinearGradient colors={['#1E1145', '#2D1B69']} style={styles.container}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {activeMascot?.imagem_url && MASCOT_ASSETS[activeMascot.imagem_url] ? (
              <Image 
                source={MASCOT_ASSETS[activeMascot.imagem_url]} 
                style={{ width: 100, height: 100 }} 
                contentFit="contain" 
              />
            ) : (
              <Text style={{ fontSize: 48 }}>{activeMascot?.emoji || '🤖'}</Text>
            )}
            <ActivityIndicator size="large" color="#C4B5FD" style={{ marginTop: 16 }} />
            <Text style={{ color: '#C4B5FD', marginTop: 12, fontSize: 15 }}>
              A preparar o desafio...
            </Text>
          </View>
        </LinearGradient>
      );
    }

  if (!currentQuiz && !isFinished) {
    return (
      <LinearGradient colors={['#1E1145', '#2D1B69']} style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="alert-circle" size={64} color="#F87171" />
          <Text style={{ color: '#fff', fontSize: 18, textAlign: 'center', marginTop: 20 }}>
            Não foi possível carregar este quiz.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.errorBackBtn}>
            <Text style={{ color: '#fff', fontFamily: 'Fredoka_700Bold' }}>Voltar</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // ─── Final Summary Screen ────────────────────────────────────────────────
  if (isFinished) {
    const pct = Math.round((score / quizList.length) * 100);
    const perfect = score === quizList.length;

    return (
      <LinearGradient colors={['#1E1145', '#2D1B69']} style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Animated.View entering={ZoomIn} style={styles.summaryBox}>
            <Text style={{ fontSize: 72 }}>{perfect ? '🏆' : score >= quizList.length / 2 ? '🎉' : '💪'}</Text>
            <Text style={styles.summaryTitle}>
              {perfect ? 'Perfeito!' : score >= quizList.length / 2 ? 'Muito bem!' : 'Continua a tentar!'}
            </Text>

            {/* Mascot */}
            <View style={styles.summaryMascotRow}>
              {activeMascot?.imagem_url && MASCOT_ASSETS[activeMascot.imagem_url] ? (
                <Image 
                  source={MASCOT_ASSETS[activeMascot.imagem_url]} 
                  style={{ width: 60, height: 60 }} 
                  contentFit="contain" 
                />
              ) : (
                <Text style={{ fontSize: 40 }}>{activeMascot?.emoji || '🤖'}</Text>
              )}
              <View style={styles.summaryBubble}>
                <Text style={styles.summaryBubbleText}>
                  {perfect
                    ? getRandomMessage('correct')
                    : score >= quizList.length / 2
                    ? 'Parabéns pelo esforço! 🌟'
                    : getRandomMessage('wrong')}
                </Text>
              </View>
            </View>

            {/* Score card */}
            <View style={styles.scoreCard}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Respostas certas:</Text>
                <Text style={styles.scoreValue}>{score}/{quizList.length}</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>XP ganho:</Text>
                <Text style={[styles.scoreValue, { color: '#4ADE80' }]}>+{totalXP} XP</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Resultado:</Text>
                <Text style={[styles.scoreValue, { color: pct >= 60 ? '#4ADE80' : '#F87171' }]}>{pct}%</Text>
              </View>
            </View>

            <Pressable style={styles.summaryHomeBtn} onPress={() => { refreshData(); router.replace('/child/(tabs)'); }}>
              <LinearGradient
                colors={['#7C3AED', '#6D28D9']}
                style={styles.summaryHomeBtnGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.summaryHomeBtnText}>🏠 Ir para o Meu Quarto</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </LinearGradient>
    );
  }

  // ─── Quiz Question Screen ────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#1E1145', '#2D1B69']} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.headerTitle}>
            {isGeneralMode ? '🧠 Teste Geral' : '🎓 Quiz Mestre'}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${((currentIdx + 1) / quizList.length) * 100}%` }]}
            />
          </View>
        </View>
        <View style={styles.questionCounter}>
          <Text style={styles.questionCounterText}>{currentIdx + 1}/{quizList.length}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Mascot + Speech Bubble */}
        <MascotBubble
          message={mascotMsg}
          emoji={activeMascot?.emoji || '🤖'}
          type={mascotMsgType}
        />

        {/* Question */}
        <Animated.View entering={FadeInDown} style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuiz.pergunta}</Text>
        </Animated.View>

        {/* Drop Zone */}
        <DropZone
          hasItem={!!droppedOption}
          item={droppedOption ?? undefined}
          isCorrect={isCorrect === true}
          isWrong={isCorrect === false}
        />

        {/* Options / Draggable Chips */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.optionsArea}>
          <Text style={styles.optionsLabel}>Arrasta uma resposta ↑</Text>
          <View style={styles.chipsRow}>
            {currentQuiz.opcoes.map(option => {
              const isThisDropped = droppedOption?.id_opcao === option.id_opcao;
              return (
                <DragChip
                  key={option.id_opcao}
                  option={option}
                  onDrop={handleDrop}
                  disabled={!!droppedOption}
                  isDropped={isThisDropped}
                  isCorrect={isThisDropped && isCorrect === true}
                  isWrong={isThisDropped && isCorrect === false}
                />
              );
            })}
          </View>
        </Animated.View>
      </View>

      {/* Result popup */}
      <ResultPopup
        visible={showResult}
        isCorrect={isCorrect === true}
        message={mascotMsg}
        mascotEmoji={activeMascot?.emoji || '🤖'}
        xpGained={20}
        onNext={handleNext}
        onHome={handleHome}
        isLast={isLastQuestion}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 16, fontFamily: 'Fredoka_700Bold' },
  progressBar: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3, marginTop: 6, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#A78BFA', borderRadius: 3 },
  questionCounter: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
  },
  questionCounterText: { color: '#E9D5FF', fontSize: 13, fontFamily: 'Fredoka_700Bold' },

  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },

  // Mascot
  mascotRow: {
    flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 10,
  },
  mascotAvatarBox: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  speechBubble: {
    flex: 1, borderRadius: 18, padding: 12,
    borderWidth: 1.5, position: 'relative',
    minHeight: 50, justifyContent: 'center',
  },
  speechText: { fontSize: 13, fontFamily: 'Fredoka_700Bold', lineHeight: 18 },
  bubbleTail: {
    position: 'absolute', left: -10, bottom: 14,
    width: 0, height: 0,
    borderTopWidth: 8, borderTopColor: 'transparent',
    borderBottomWidth: 8, borderBottomColor: 'transparent',
    borderRightWidth: 10,
  },

  // Question
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 20, fontFamily: 'Fredoka_700Bold', color: '#fff',
    textAlign: 'center', lineHeight: 28,
  },

  // Drop Zone
  dropZone: {
    minHeight: 130, borderRadius: 28, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, padding: 16,
  },
  dropZonePlaceholder: { alignItems: 'center', gap: 8 },
  dropZoneText: { color: '#A78BFA', fontSize: 14, fontFamily: 'Fredoka_600SemiBold' },
  droppedChip: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  droppedChipText: { fontSize: 17, fontFamily: 'Fredoka_700Bold' },

  // Options
  optionsArea: { marginTop: 'auto' as any },
  optionsLabel: {
    color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'Fredoka_600SemiBold',
    textAlign: 'center', marginBottom: 12,
  },
  chipsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    justifyContent: 'center',
    width: '100%',
  },
  dragChip: {
    width: (width - 56) / 2, // 2 columns
    height: 90,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16,
    borderRadius: 20, borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  dragChipDropped: { opacity: 0.6 },
  dragChipText: { fontSize: 14, fontFamily: 'Fredoka_700Bold', flex: 1 },

  // Error
  errorBackBtn: {
    marginTop: 24, backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },

  // Result Popup
  popupOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  popupBox: {
    backgroundColor: '#fff', borderRadius: 32, padding: 24,
    alignItems: 'center', width: '100%', maxWidth: 360,
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4, shadowRadius: 30, elevation: 20,
  },
  popupTitle: { fontSize: 28, fontFamily: 'Fredoka_700Bold', color: '#1E293B', marginTop: 8 },
  popupMascotRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginTop: 20, width: '100%',
  },
  resultMascotBg: { 
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  popupBubble: { flex: 1, borderRadius: 20, padding: 14, minHeight: 60, justifyContent: 'center' },
  popupBubbleText: { fontSize: 14, fontFamily: 'Fredoka_700Bold', lineHeight: 20 },
  xpBannerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEF3C7', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 12, marginTop: 12,
  },
  xpBannerText: { fontSize: 16, fontFamily: 'Fredoka_700Bold', color: '#D97706' },
  popupActions: { width: '100%', gap: 10, marginTop: 20 },
  nextBtn: { borderRadius: 16, overflow: 'hidden' },
  nextGradient: { paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Fredoka_700Bold' },
  homeBtn: {
    paddingVertical: 14, borderRadius: 16,
    backgroundColor: '#F1F5F9', alignItems: 'center',
  },
  homeBtnText: { fontSize: 14, fontFamily: 'Fredoka_700Bold', color: '#64748B' },

  // Final Summary
  summaryBox: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 32, padding: 28,
    alignItems: 'center', width: '100%',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  summaryTitle: { fontSize: 28, fontFamily: 'Fredoka_700Bold', color: '#fff', marginTop: 8, marginBottom: 16 },
  summaryMascotRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', marginBottom: 20,
  },
  summaryBubble: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  summaryBubbleText: { color: '#E9D5FF', fontSize: 13, fontFamily: 'Fredoka_600SemiBold' },
  scoreCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  scoreLabel: { fontSize: 16, color: '#C4B5FD', fontFamily: 'Fredoka_600SemiBold' },
  scoreValue: { fontSize: 20, color: '#fff', fontFamily: 'Fredoka_700Bold' },
  scoreDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  summaryHomeBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  summaryHomeBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  summaryHomeBtnText: { color: '#fff', fontSize: 18, fontFamily: 'Fredoka_700Bold' },
});
