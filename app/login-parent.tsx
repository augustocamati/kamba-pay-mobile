import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import * as Haptics from 'expo-haptics';

export default function LoginParentScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', 'Conta não encontrada. Verifique os seus dados.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || webBottomInset) + 20 }]}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={['#FF6B00', '#FF8C00', '#FFB347']}
            style={[styles.headerGradient, { paddingTop: (insets.top || webTopInset) + 16 }]}
          >
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="rgba(0,0,0,0.4)" />
            </Pressable>
            <View style={styles.headerContent}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name="user-tie" size={36} color="#FF8C00" />
              </View>
              <Text style={styles.welcomeTitle}>Área do Responsável</Text>
              <Text style={styles.welcomeSub}>Bem-vindo de volta!</Text>
            </View>
          </LinearGradient>

          <View style={styles.formSection}>
            {/* Demo hint */}
            <View style={styles.hintCard}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#FF8C00" />
              <Text style={styles.hintText}>
                Teste: <Text style={styles.hintBold}>pai@teste.com</Text> (qualquer senha)
              </Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Entrar</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#C0C0C0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Senha</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#C0C0C0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                  </Pressable>
                </View>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.loginButton, pressed && styles.buttonPressed, isSubmitting && styles.disabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              <LinearGradient colors={['#FF6B00', '#FF8C00']} style={styles.loginGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                <Text style={styles.loginButtonText}>{isSubmitting ? 'Entrando...' : 'Entrar'}</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tens conta?</Text>
              <Pressable onPress={() => router.push('/register')}>
                <Text style={styles.footerLink}>Criar conta de responsável</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5EB' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  headerGradient: { paddingBottom: 30 },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  headerContent: { alignItems: 'center', paddingTop: 8 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  welcomeTitle: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: '#1A1A2E', textAlign: 'center' },
  welcomeSub: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: 'rgba(0,0,0,0.5)', textAlign: 'center', marginTop: 4 },
  formSection: { padding: 20, gap: 16 },
  hintCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF5EB', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#FFE4C4',
  },
  hintText: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: '#6B7280', flex: 1 },
  hintBold: { fontFamily: 'Nunito_700Bold', color: '#FF8C00' },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
    gap: 16,
  },
  formTitle: { fontSize: 20, fontFamily: 'Nunito_700Bold', color: '#1A1A2E' },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#4B5563' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, fontFamily: 'Nunito_400Regular', color: '#1A1A2E' },
  eyeButton: { padding: 6 },
  loginButton: { borderRadius: 14, overflow: 'hidden' },
  loginGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, gap: 8, borderRadius: 14,
  },
  loginButtonText: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.6 },
  footer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 8, flexWrap: 'wrap',
  },
  footerText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: '#9CA3AF' },
  footerLink: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#FF8C00' },
});
