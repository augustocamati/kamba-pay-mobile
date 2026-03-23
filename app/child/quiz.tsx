import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/context/AppContext';

const { width } = Dimensions.get('window');

type QuizQuestion = {
  text: string;
  options: { id: string; text: string; correct: boolean }[];
};

const QUIZ_LIBRARY: Record<string, QuizQuestion[]> = {
  'conteudo-1': [
    { text: 'A moeda usada em Angola chama-se...', options: [{ id: '1', text: 'Dólar', correct: false }, { id: '2', text: 'Kwanza', correct: true }] }
  ],
  'conteudo-2': [
    { text: 'Qual é o principal objetivo do Pote Poupar?', options: [{ id: '1', text: 'Gastar em doces hoje', correct: false }, { id: '2', text: 'Guardar para um objetivo maior no futuro', correct: true }] }
  ],
  'conteudo-3': [
    { text: 'O que é um Orçamento?', options: [{ id: '1', text: 'Um plano de como vais usar o teu dinheiro', correct: true }, { id: '2', text: 'Um lugar para guardar moedas', correct: false }] }
  ],
};

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { adicionarXP, concluirAula, marcarConteudoCompleto } = useApp();
  
  // Encontrar questionário da biblioteca ou fallback
  const contentId = typeof id === 'string' ? id : 'conteudo-2';
  const QUESTIONS = QUIZ_LIBRARY[contentId] || QUIZ_LIBRARY['conteudo-2'];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isPerfect, setIsPerfect] = useState(true);

  const handleAnswer = (optionId: string, isCorrect: boolean) => {
    setSelectedOption(optionId);
    
    if (!isCorrect) {
      setIsPerfect(false);
    }

    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(null);
      } else {
        // Concluir 
        const totalXP = isPerfect ? 30 : 10; // 10 Base + 20 Bonus se perfeito
        adicionarXP(totalXP);
        concluirAula(); // Se for a lesson diária
        if (typeof id === 'string') {
           marcarConteudoCompleto(id);
        }
        setIsFinished(true);
      }
    }, 1500);
  };

  const renderFinished = () => (
    <Animated.View entering={ZoomIn} style={styles.resultsContainer}>
      <View style={styles.trophyContainer}>
        <Text style={{ fontSize: 80 }}>🏆</Text>
      </View>
      <Text style={styles.resultsTitle}>Quiz Concluído!</Text>
      
      <View style={styles.xpCard}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>XP Base da Aula:</Text>
          <Text style={styles.xpValue}>+10 XP</Text>
        </View>
        {isPerfect && (
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>Bónus de Mestre:</Text>
            <Text style={styles.xpBonus}>+20 XP</Text>
          </View>
        )}
        <View style={styles.xpDivider} />
        <View style={styles.xpRow}>
          <Text style={styles.xpTotalLabel}>Total Ganho:</Text>
          <Text style={styles.xpTotalValue}>+{isPerfect ? 30 : 10} XP</Text>
        </View>
      </View>

      <Text style={styles.resultsSubtitle}>
        {isPerfect ? 'Excelente! Estiveste muito atento à aula.' : 'Muito bem! Na próxima vais acertar tudo!'}
      </Text>

      <Pressable 
        style={styles.homeButton}
        onPress={() => router.replace('/child/(tabs)')}
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
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Pergunta {currentQuestion + 1} de {QUESTIONS.length}</Text>
      </View>

      <View style={styles.content}>
        {isFinished ? (
          renderFinished()
        ) : (
          <Animated.View key={currentQuestion} entering={FadeInDown} style={styles.questionContainer}>
            <Text style={styles.questionText}>{QUESTIONS[currentQuestion].text}</Text>
            
            <View style={styles.optionsContainer}>
              {QUESTIONS[currentQuestion].options.map(option => {
                const isSelected = selectedOption === option.id;
                const showCorrect = selectedOption && option.correct;
                const showWrong = isSelected && !option.correct;

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
                    key={option.id}
                    disabled={selectedOption !== null}
                    style={cardStyle}
                    onPress={() => handleAnswer(option.id, option.correct)}
                  >
                    <Text style={textStyle}>{option.text}</Text>
                    {icon}
                  </Pressable>
                );
              })}
            </View>

            {/* Cofre Visual Subliminar */}
            <View style={styles.safeContainer}>
              <Text style={{ fontSize: 40, opacity: selectedOption ? 1 : 0.5 }}>🏦</Text>
              <Text style={styles.safeText}>O Cofre</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  progressContainer: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#f97316', borderRadius: 4 },
  progressText: { color: '#94a3b8', fontSize: 14, marginTop: 12, textAlign: 'center', fontWeight: '600' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  questionContainer: { flex: 1, justifyContent: 'center' },
  questionText: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 40, textAlign: 'center', lineHeight: 36 },
  optionsContainer: { gap: 16 },
  optionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  optionCorrect: { backgroundColor: 'rgba(74, 222, 128, 0.1)', borderColor: '#4ade80' },
  optionWrong: { backgroundColor: 'rgba(248, 113, 113, 0.1)', borderColor: '#f87171' },
  optionText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff', marginRight: 12 },
  textCorrect: { color: '#4ade80' },
  textWrong: { color: '#f87171' },
  safeContainer: { alignItems: 'center', marginTop: 60 },
  safeText: { color: '#64748b', fontSize: 14, fontWeight: '700', marginTop: 8 },
  resultsContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  trophyContainer: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(251, 191, 36, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  resultsTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 32 },
  xpCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', padding: 24, borderRadius: 24, marginBottom: 32 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  xpLabel: { fontSize: 16, color: '#ced4da', fontWeight: '500' },
  xpValue: { fontSize: 16, color: '#fff', fontWeight: '700' },
  xpBonus: { fontSize: 16, color: '#f59e0b', fontWeight: '800' },
  xpDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },
  xpTotalLabel: { fontSize: 18, color: '#fff', fontWeight: '700' },
  xpTotalValue: { fontSize: 22, color: '#4ade80', fontWeight: '900' },
  resultsSubtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 40, paddingHorizontal: 20, lineHeight: 24 },
  homeButton: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  homeGradient: { paddingVertical: 18, alignItems: 'center' },
  homeButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
