import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { BounceIn, ZoomIn } from 'react-native-reanimated';
import { useMascot } from '@/lib/mascot-context';

interface ActionSuccessPopupProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  xpReward?: number;
  icon?: string;
  buttonText?: string;
}

/**
 * Universal success popup with mascot celebrating.
 * Use for tasks, lessons, missions, donations, etc.
 */
export function ActionSuccessPopup({ 
  visible, 
  onClose, 
  title, 
  description, 
  xpReward, 
  icon = 'sparkles',
  buttonText = 'Fixe! 🚀'
}: ActionSuccessPopupProps) {
  const { activeMascot } = useMascot();

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View entering={BounceIn} style={styles.box}>
          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient colors={['#7C3AED', '#C026D3']} style={styles.sparkleCircle}>
              <Ionicons name={icon as any} size={26} color="#fff" />
            </LinearGradient>
          </View>

          {/* Mascot */}
          <View style={[styles.mascotBg, { backgroundColor: activeMascot?.bg_color || '#F3E8FF' }]}>
            <Text style={{ fontSize: 72 }}>{activeMascot?.emoji || '🤖'}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{description}</Text>

          {xpReward !== undefined && xpReward > 0 && (
            <View style={styles.xpRow}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={styles.xpText}>+{xpReward} XP ganhos!</Text>
            </View>
          )}

          <Pressable style={styles.btn} onPress={onClose}>
            <LinearGradient
              colors={['#7C3AED', '#A855F7']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>{buttonText}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  iconContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  sparkleCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  mascotBg: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    color: '#4B5563',
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 24,
  },
  xpText: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#D97706',
  },
  btn: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  gradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 17,
    fontFamily: 'Nunito_900Black',
    color: '#fff',
  },
});
