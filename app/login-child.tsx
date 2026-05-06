import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { MASCOT_ASSETS } from '@/lib/mascot-assets';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

// ─── Speech bubble ─────────────────────────────────────────────────────────────
function SpeechBubble({ text }: { text: string }) {
  return (
    <View style={sb.container}>
      <View style={sb.bubble}>
        <Text style={sb.text}>{text}</Text>
      </View>
      <View style={sb.tail} />
    </View>
  );
}

const sb = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 4 },
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E87722',
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: width * 0.72,
  },
  text: {
    fontSize: 15,
    fontFamily: 'Fredoka_700Bold',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  tail: {
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 12,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#E87722',
    marginTop: -1,
  },
});

// ─── PIN dot display ────────────────────────────────────────────────────────────
function PinDots({ pin }: { pin: string }) {
  return (
    <View style={pd.row}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={[pd.box, pin.length > i && pd.boxFilled]}
        >
          {pin.length > i && <View style={pd.dot} />}
        </View>
      ))}
    </View>
  );
}

const pd = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, marginVertical: 24 },
  box: {
    width: 60, height: 60, borderRadius: 14,
    borderWidth: 2.5, borderColor: '#E87722',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  boxFilled: { backgroundColor: '#FFF5E8', borderColor: '#E87722' },
  dot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#E87722',
  },
});

// ─── Number pad ────────────────────────────────────────────────────────────────
function NumPad({ onPress, onDelete }: { onPress: (d: string) => void; onDelete: () => void }) {
  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];
  return (
    <View style={np.grid}>
      {keys.map((k, i) => {
        if (k === '') return <View key={i} style={np.empty} />;
        if (k === 'del') {
          return (
            <Pressable key={i} style={({ pressed }) => [np.key, np.keyDel, pressed && np.pressed]} onPress={onDelete}>
              <Ionicons name="backspace-outline" size={24} color="#FFFFFF" />
            </Pressable>
          );
        }
        return (
          <Pressable key={i} style={({ pressed }) => [np.key, np.keyBlue, pressed && np.pressed]} onPress={() => onPress(k)}>
            <Text style={np.keyText}>{k}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const np = StyleSheet.create({
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    width: 280, gap: 10, justifyContent: 'center',
  },
  key: {
    width: 80, height: 70, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
  },
  keyBlue: { backgroundColor: '#5B9BD5' },
  keyDel: { backgroundColor: '#E87722' },
  empty: { width: 80, height: 70 },
  keyText: { fontSize: 26, fontFamily: 'Fredoka_700Bold', color: '#FFFFFF' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.94 }] },
});

// ─── Main screen ────────────────────────────────────────────────────────────────
export default function LoginChildScreen() {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const [step, setStep] = useState<'name' | 'pin'>('name');
  const [childName, setChildName] = useState(''); // username
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shakeX = useSharedValue(0);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  };

  const handleNameContinue = () => {
    if (!childName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      triggerShake();
      return;
    }
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('pin');
  };

  const handlePinDigit = (d: string) => {
    if (pin.length >= 4) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      handleLogin(next);
    }
  };

  const handlePinDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin((p) => p.slice(0, -1));
  };

  const handleLogin = async (pinValue: string) => {
    setIsSubmitting(true);
    try {
      // A API aceita o username da criança no campo email
      // Contrato: POST /api/auth/login { email: username, senha: pin }
      const username = childName.trim().toLowerCase();
      const success = await login(username, pinValue);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/child/(tabs)');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        triggerShake();
        setPin('');
        Alert.alert(
          'Ops! 🤔',
          'Username ou PIN incorretos.\nPede ajuda ao teu responsável para verificar os teus dados.',
          [{ text: 'OK', onPress: () => setStep('name') }]
        );
      }
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      setPin('');
      Alert.alert('Erro de ligação', 'Não foi possível ligar ao servidor. Verifica a tua ligação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bubbleText =
    step === 'name'
      ? 'Oi! Qual é o teu username?'
      : `Olá ${childName.trim()}! Entra o teu PIN de 4 dígitos`;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, { paddingTop: insets.top || webTopInset, paddingBottom: insets.bottom || webBottomInset }]}>
          {/* Back button */}
          <Pressable style={styles.backBtn} onPress={() => step === 'pin' ? setStep('name') : router.back()}>
            <Ionicons name="arrow-back" size={22} color="#E87722" />
          </Pressable>
  
          {/* Mascot area */}
          <View style={styles.mascotArea}>
            <SpeechBubble text={bubbleText} />
            <View style={{ height: 12 }} />
            <View style={styles.mascotStrip}>
              <View style={styles.mascotImageContainer}>
                <Image
                  source={MASCOT_ASSETS['kamba_azul.svg']}
                  style={styles.mascotImage}
                  contentFit="contain"
                />
              </View>
            </View>
          </View>
  
          {/* Step content */}
          {step === 'name' ? (
            <Animated.View entering={FadeInUp.duration(400)} style={styles.formArea}>
              <Animated.View style={shakeStyle}>
                <TextInput
                  style={styles.nameInput}
                  placeholder="O teu username..."
                  placeholderTextColor="#C0A880"
                  value={childName}
                  onChangeText={setChildName}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  returnKeyType="done"
                  onSubmitEditing={handleNameContinue}
                />
              </Animated.View>
              <Pressable
                style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
                onPress={handleNameContinue}
              >
                <Text style={styles.continueBtnText}>Continuar</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.pinArea}>
              <Animated.View style={shakeStyle}>
                <PinDots pin={pin} />
              </Animated.View>
              <NumPad onPress={handlePinDigit} onDelete={handlePinDelete} />
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotArea: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  mascotStrip: {
    width: '100%',
    backgroundColor: '#cecece22', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  mascotImageContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  formArea: {
    width: '100%',
    paddingHorizontal: 32,
    gap: 16,
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  nameInput: {
    height: 58,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: '#E87722',
    paddingHorizontal: 24,
    fontSize: 17,
    fontFamily: 'Fredoka_600SemiBold',
    color: '#1A1A2E',
    backgroundColor: '#FFFFFF',
    textAlign: 'left',
    shadowColor: '#E87722',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  continueBtn: {
    height: 58,
    borderRadius: 30,
    backgroundColor: '#3B9E8C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B9E8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnText: {
    fontSize: 18,
    fontFamily: 'Fredoka_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
  pinArea: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
});
