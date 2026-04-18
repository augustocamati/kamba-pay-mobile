import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { educationalService } from '@/lib/api';

const { width } = Dimensions.get('window');

type QuizData = {
  id: number;
  id_missao: number;
  pergunta: string;
  opcoes: { id_opcao: number; texto: string; }[];
};

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const { id_missao, id: contentId } = useLocalSearchParams();
  const { adicionarXP, refreshData, marcarConteudoCompleto } = useApp();
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [results, setResults] = useState<{ xp: number } | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!id_missao) {
        setLoading(false);
        return;
      }
      try {
        const data = await educationalService.getQuizDetails(id_missao as string);
        setQuiz(data);
      } catch (e) {
        console.error('Erro ao carregar quiz:', e);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [id_missao]);

  const handleAnswer = async (opcaoId: number) => {
    if (!quiz) return;
    setSelectedOption(opcaoId);
    
    try {
      const resp = await educationalService.submitQuiz(quiz.id, opcaoId);
      setIsCorrect(resp.correta);
      
      if (resp.correta) {
        setResults({ xp: resp.recompensa?.xp || 20 });
        if (contentId) {
            marcarConteudoCompleto(contentId as string);
        }
      }

      setTimeout(() => {
        setIsFinished(true);
      }, 1500);
    } catch (e) {
      console.error('Erro ao enviar resposta:', e);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Preparando o desafio...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="alert-circle" size={64} color="#f87171" />
        <Text style={{ color: '#fff', fontSize: 18, textAlign: 'center', marginTop: 20 }}>
          Houve um problema ao carregar este quiz.
        </Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const renderFinished = () => (
    <Animated.View entering={ZoomIn} style={styles.resultsContainer}>
      <View style={styles.trophyContainer}>
        <Text style={{ fontSize: 80 }}>{isCorrect ? '🏆' : '💪'}</Text>
      </View>
      <Text style={styles.resultsTitle}>{isCorrect ? 'Parabéns!' : 'Quase lá!'}</Text>
      
      <View style={styles.xpCard}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>Resultado:</Text>
          <Text style={[styles.xpValue, { color: isCorrect ? '#4ade80' : '#f87171' }]}>
            {isCorrect ? 'Acertaste!' : 'Erraste desta vez'}
          </Text>
        </View>
        {isCorrect && (
           <>
            <View style={styles.xpDivider} />
            <View style={styles.xpRow}>
              <Text style={styles.xpTotalLabel}>XP Ganho:</Text>
              <Text style={styles.xpTotalValue}>+{results?.xp || 20} XP</Text>
            </View>
           </>
        )}
      </View>

      <Text style={styles.resultsSubtitle}>
        {isCorrect 
          ? 'Continuas a aprender muito sobre o teu dinheiro!' 
          : 'Não desistas! Volta a ver o vídeo e tenta novamente.'}
      </Text>

      <Pressable 
        style={styles.homeButton}
        onPress={() => {
            refreshData(); 
            router.replace('/child/(tabs)');
        }}
      >
        <LinearGradient 
          colors={['#3b82f6', '#2563eb']} 
          style={styles.homeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.homeButtonText}>Ir para o Meu Quarto 🏠</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.topRow}>
            <Pressable onPress={() => router.back()}>
                <Ionicons name="close" size={28} color="#fff" />
            </Pressable>
            <Text style={styles.progressText}>Quiz Mestre 🎓</Text>
            <View style={{ width: 28 }} />
        </View>
      </View>

      <View style={styles.content}>
        {isFinished ? (
          renderFinished()
        ) : (
          <Animated.View entering={FadeInDown} style={styles.questionContainer}>
            <Text style={styles.questionText}>{quiz.pergunta}</Text>
            
            <View style={styles.optionsContainer}>
              {quiz.opcoes.map(option => {
                const isSelected = selectedOption === option.id_opcao;
                const showCorrect = isSelected && isCorrect === true;
                const showWrong = isSelected && isCorrect === false;

                let cardStyle: any = styles.optionCard;
                let textStyle: any = styles.optionText;
                let icon = null;

                if (showCorrect) {
                  cardStyle = [styles.optionCard, styles.optionCorrect];
                  textStyle = [styles.optionText, styles.textCorrect];
                  icon = <Ionicons name="checkmark-circle" size={24} color="#4ade80" />;
                } else if (showWrong) {
                  cardStyle = [styles.optionCard, styles.optionWrong];
                  textStyle = [styles.optionText, styles.textWrong];
                  icon = <Ionicons name="close-circle" size={24} color="#f87171" />;
                }

                return (
                  <Pressable
                    key={option.id_opcao}
                    disabled={selectedOption !== null}
                    style={cardStyle}
                    onPress={() => handleAnswer(option.id_opcao)}
                  >
                    <Text style={textStyle}>{option.texto}</Text>
                    {icon}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.safeContainer}>
              <Text style={{ fontSize: 40, opacity: selectedOption ? 1 : 0.5 }}>🏦</Text>
              <Text style={styles.safeText}>Responda corretamente para ganhar XP!</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingHorizontal: 24, paddingBottom: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  questionContainer: { flex: 1, justifyContent: 'center' },
  questionText: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 40, textAlign: 'center', lineHeight: 34 },
  optionsContainer: { gap: 16 },
  optionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  optionCorrect: { backgroundColor: 'rgba(74, 222, 128, 0.1)', borderColor: '#4ade80' },
  optionWrong: { backgroundColor: 'rgba(248, 113, 113, 0.1)', borderColor: '#f87171' },
  optionText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff', marginRight: 12 },
  textCorrect: { color: '#4ade80' },
  textWrong: { color: '#f87171' },
  safeContainer: { alignItems: 'center', marginTop: 60 },
  safeText: { color: '#64748b', fontSize: 14, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  resultsContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  trophyContainer: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(251, 191, 36, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  resultsTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 24 },
  xpCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', padding: 24, borderRadius: 24, marginBottom: 32 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLabel: { fontSize: 17, color: '#ced4da', fontWeight: '500' },
  xpValue: { fontSize: 17, color: '#fff', fontWeight: '700' },
  xpDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },
  xpTotalLabel: { fontSize: 18, color: '#fff', fontWeight: '700' },
  xpTotalValue: { fontSize: 26, color: '#4ade80', fontWeight: '900' },
  resultsSubtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 40, paddingHorizontal: 20, lineHeight: 24 },
  homeButton: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  homeGradient: { paddingVertical: 18, alignItems: 'center' },
  homeButtonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  backButton: { marginTop: 30, backgroundColor: '#334155', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
});
