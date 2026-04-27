import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  return (
    <LinearGradient
      colors={['#FF6B00', '#FF8C00', '#FFB347', '#FFD700']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative stripes */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[styles.stripe, { top: '8%', transform: [{ rotate: '-12deg' }] }]} />
        <View style={[styles.stripe, { top: '28%', transform: [{ rotate: '-12deg' }], opacity: 0.12 }]} />
        <View style={[styles.stripe, { top: '65%', transform: [{ rotate: '-12deg' }], opacity: 0.07 }]} />
      </View>

      <View style={[styles.content, { paddingTop: (insets.top || webTopInset) + 16, paddingBottom: (insets.bottom || webBottomInset) + 24 }]}>
        {/* Back */}
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="rgba(0,0,0,0.4)" />
        </Pressable>

        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
          <View style={styles.logoCircle}>
            <Image source={require('@/assets/images/icone kkp1.png')} style={{ width: 70, height: 70 }} />
          </View>
          <Text style={styles.title}>Quem és tu?</Text>
          <Text style={styles.subtitle}>Escolhe o teu perfil para entrar</Text>
        </Animated.View>

        {/* Cards */}
        <View style={styles.cards}>
          {/* Parent card */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push('/login-parent')}
            >
              <View style={[styles.cardIcon, { backgroundColor: '#FFF5E8' }]}>
                <FontAwesome5 name="user-tie" size={36} color="#FF8C00" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Sou Responsável</Text>
                <Text style={styles.cardSub}>Pai, mãe ou tutor • Gere a conta da criança</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF8C00" />
            </Pressable>
          </Animated.View>

          {/* Divider */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Child card */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <Pressable
              style={({ pressed }) => [styles.card, styles.cardChild, pressed && styles.cardPressed]}
              onPress={() => router.push('/login-child')}
            >
              <View style={[styles.cardIcon, { backgroundColor: '#EEF4FF' }]}>
                <MaterialCommunityIcons name="emoticon-happy" size={40} color="#5B9BD5" />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: '#5B9BD5' }]}>Sou Criança</Text>
                <Text style={styles.cardSub}>Entra com o teu nome e PIN secreto</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#5B9BD5" />
            </Pressable>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.footer}>
          <Text style={styles.footerText}>Ainda não tens conta?</Text>
          <Pressable onPress={() => router.push('/register')}>
            <Text style={styles.footerLink}>Registar como responsável</Text>
          </Pressable>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stripe: {
    position: 'absolute',
    width: width * 2,
    height: 100,
    left: -width * 0.3,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 50,
  },
  content: { flex: 1, paddingHorizontal: 24 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  header: { alignItems: 'center', marginVertical: 24 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 14, elevation: 8,
  },
  title: {
    fontSize: 30, fontFamily: 'Nunito_800ExtraBold',
    color: '#1A1A2E', textAlign: 'center',
  },
  subtitle: {
    fontSize: 14, fontFamily: 'Nunito_400Regular',
    color: 'rgba(0,0,0,0.5)', textAlign: 'center', marginTop: 4,
  },
  cards: { gap: 0 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20, padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
  },
  cardChild: { marginTop: 0 },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  cardIcon: {
    width: 68, height: 68, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 18, fontFamily: 'Nunito_700Bold', color: '#FF8C00', marginBottom: 2,
  },
  cardSub: {
    fontSize: 12, fontFamily: 'Nunito_400Regular', color: '#9CA3AF',
  },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginVertical: 16,
  },
  dividerLine: { flex: 1, height: 1.5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 1 },
  dividerText: {
    fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: 'rgba(0,0,0,0.35)',
  },
  footer: {
    alignItems: 'center', gap: 4, marginTop: 'auto', paddingTop: 24,
  },
  footerText: {
    fontSize: 13, fontFamily: 'Nunito_400Regular', color: 'rgba(0,0,0,0.45)',
  },
  footerLink: {
    fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#1A1A2E',
  },
});
