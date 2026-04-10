import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { router } from 'expo-router';

/**
 * Banner fixo que aparece no topo quando o utilizador está em modo Demo.
 * Mostra um aviso e permite sair do demo.
 */
export function DemoBanner() {
  const { isDemo, exitDemo } = useAuth();

  if (!isDemo) return null;

  const handleExit = () => {
    exitDemo();
    router.replace('/');
  };

  return (
    <View style={styles.banner}>
      <Ionicons name="play-circle" size={16} color="#fff" />
      <Text style={styles.text}>MODO DEMO — dados simulados</Text>
      <Pressable style={styles.exitBtn} onPress={handleExit}>
        <Text style={styles.exitText}>Sair</Text>
        <Ionicons name="close" size={14} color="#FF8C00" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  exitText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF8C00',
  },
});
