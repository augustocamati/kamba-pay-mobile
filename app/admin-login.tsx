import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

export default function AdminLoginScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    setError('');
    // Simula latência de rede
    await new Promise(r => setTimeout(r, 800));
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      router.replace('/admin' as any);
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#060D1A', '#0B1222', '#0D1933']}
      style={styles.root}
    >
      {/* Background orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <KeyboardAvoidingView
        style={styles.kbav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View entering={FadeInDown.duration(600)} style={styles.logoSection}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoEmoji}>🐱</Text>
            </View>
            <Text style={styles.brandName}>Kamba Kid Pay</Text>
            <View style={styles.adminTag}>
              <Text style={styles.adminTagText}>PAINEL DE ADMINISTRAÇÃO</Text>
            </View>
          </Animated.View>

          {/* Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.card}>
            <Text style={styles.cardTitle}>Entrar como Admin</Text>
            <Text style={styles.cardSubtitle}>Acesso restrito a administradores autorizados</Text>

            {/* Username */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Utilizador</Text>
              <View style={[styles.inputRow, error && !username && styles.inputError]}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  id="admin-username"
                  style={styles.input}
                  placeholder="admin"
                  placeholderTextColor="#4A5F8A"
                  value={username}
                  onChangeText={v => { setUsername(v); setError(''); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Senha</Text>
              <View style={[styles.inputRow, error && !password && styles.inputError]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  id="admin-password"
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#4A5F8A"
                  value={password}
                  onChangeText={v => { setPassword(v); setError(''); }}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                  <Text>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {!!error && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.errorBox}>
                <Text style={styles.errorText}>❌ {error}</Text>
              </Animated.View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              id="admin-login-btn"
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>Entrar no Painel</Text>
              )}
            </TouchableOpacity>

            {/* Hint */}
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>💡 Demo: </Text>
              <Text style={styles.hintCodeUser}>admin</Text>
              <Text style={styles.hintText}> / </Text>
              <Text style={styles.hintCodePass}>admin123</Text>
            </View>
          </Animated.View>

          {/* Back link */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>← Voltar ao App</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  kbav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' },

  orb1: {
    position: 'absolute', width: 350, height: 350, borderRadius: 175,
    backgroundColor: 'rgba(255,140,0,0.08)', top: -80, left: -80,
  },
  orb2: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(59,130,246,0.06)', bottom: -60, right: -60,
  },

  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,140,0,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,140,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 40 },
  brandName: { fontSize: 24, fontFamily: 'Nunito_800ExtraBold', color: '#F0F4FF', marginBottom: 8 },
  adminTag: {
    backgroundColor: 'rgba(255,140,0,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,140,0,0.2)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
  },
  adminTagText: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: '#FF8C00', letterSpacing: 1 },

  card: {
    backgroundColor: 'rgba(17,28,48,0.9)',
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 20,
  },
  cardTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: '#F0F4FF', marginBottom: 6 },
  cardSubtitle: { fontSize: 13, color: '#4A5F8A', fontFamily: 'Nunito_400Regular', marginBottom: 24, lineHeight: 19 },

  fieldWrap: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#8FA1C7',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0D1526',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
  },
  inputError: { borderColor: 'rgba(239,68,68,0.5)' },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: {
    flex: 1, color: '#F0F4FF', fontFamily: 'Nunito_400Regular',
    fontSize: 15, paddingVertical: 14,
  },
  eyeBtn: { padding: 6 },

  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
    padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: '#FCA5A5', fontFamily: 'Nunito_600SemiBold' },

  loginBtn: {
    backgroundColor: '#FF8C00',
    borderRadius: 14, padding: 16,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4, marginBottom: 20,
    shadowColor: '#FF8C00', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#fff' },

  hintBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  hintText: { fontSize: 12, color: '#4A5F8A', fontFamily: 'Nunito_400Regular' },
  hintCodeUser: { fontSize: 12, color: '#FF8C00', fontFamily: 'Nunito_700Bold' },
  hintCodePass: { fontSize: 12, color: '#22C55E', fontFamily: 'Nunito_700Bold' },

  backBtn: { alignItems: 'center', paddingVertical: 12 },
  backBtnText: { fontSize: 14, color: '#4A5F8A', fontFamily: 'Nunito_600SemiBold' },
});
