import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated as RNAnimated, Platform,
} from 'react-native';
import { useMascot } from '@/lib/mascot-context';
import { router } from 'expo-router';

interface MascotCompanionProps {
  position?: 'bottom-right' | 'bottom-left';
  onPress?: () => void;
  showShopHint?: boolean;
}

/**
 * Floating mascot companion that appears in the corner of child screens.
 * Bounces gently and shows speech bubbles.
 */
export function MascotCompanion({ position = 'bottom-right', onPress, showShopHint = false }: MascotCompanionProps) {
  const { getActiveMascotData, getRandomMessage } = useMascot();
  const mascot = getActiveMascotData();

  const bounce = useRef(new RNAnimated.Value(0)).current;
  const scale = useRef(new RNAnimated.Value(1)).current;
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleMsg, setBubbleMsg] = useState('');

  useEffect(() => {
    // Gentle bounce animation
    const anim = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(bounce, { toValue: -6, duration: 900, useNativeDriver: true }),
        RNAnimated.timing(bounce, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // Show greeting bubble after a second, then hide it
  useEffect(() => {
    const msg = getRandomMessage('greeting');
    setBubbleMsg(msg);
    const showTimer = setTimeout(() => setShowBubble(true), 1200);
    const hideTimer = setTimeout(() => setShowBubble(false), 5000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, []);

  const handlePress = () => {
    RNAnimated.sequence([
      RNAnimated.timing(scale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      RNAnimated.timing(scale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      RNAnimated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    // Show a new message
    setBubbleMsg(getRandomMessage('greeting'));
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 3500);

    onPress?.();
  };

  const posStyle = position === 'bottom-right'
    ? { right: 16, bottom: 16 }
    : { left: 16, bottom: 16 };

  return (
    <View style={[styles.wrapper, posStyle]} pointerEvents="box-none">
      {showBubble && (
        <View style={[styles.bubble, position === 'bottom-right' ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={styles.bubbleText}>{bubbleMsg}</Text>
        </View>
      )}
      <RNAnimated.View style={{ transform: [{ translateY: bounce }, { scale }] }}>
        <Pressable style={styles.mascotBtn} onPress={handlePress}>
          <Text style={{ fontSize: 40 }}>{mascot.emoji}</Text>
        </Pressable>
      </RNAnimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    alignItems: 'flex-end',
    zIndex: 999,
  },
  mascotBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
    borderWidth: 2.5, borderColor: '#EDE9FE',
  },
  bubble: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16, padding: 10,
    marginBottom: 8, maxWidth: 180,
    borderWidth: 1, borderColor: '#C4B5FD',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  bubbleRight: { marginRight: 4 },
  bubbleLeft: { marginLeft: 4 },
  bubbleText: {
    fontSize: 12, color: '#5B21B6',
    fontFamily: 'Nunito_600SemiBold', lineHeight: 16,
  },
});
