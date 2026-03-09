import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { Avatar } from '../types';

interface AvatarDisplayProps {
  avatar: Avatar;
  nivel: number;
  nome: string;
  size?: 'small' | 'medium' | 'large';
  showLevel?: boolean;
}

const SIZES = {
  small:  { container: 48, emoji: 22, badge: 20, badgeText: 9 },
  medium: { container: 72, emoji: 34, badge: 24, badgeText: 11 },
  large:  { container: 112, emoji: 56, badge: 30, badgeText: 13 },
};

export function AvatarDisplay({ avatar, nivel, nome, size = 'medium', showLevel = true }: AvatarDisplayProps) {
  const getAvatarEmoji = () => {
    const map: Record<string, string> = {
      'marrom-feliz': '👧🏾',
      'marrom-sorrindo': '😊',
      'clara-feliz': '👧🏻',
      'escura-feliz': '👧🏿',
    };
    return map[`${avatar.cor_pele}-${avatar.expressao}`] || '👧🏾';
  };

  const getAcessorioEmoji = () => {
    const map: Record<string, string> = {
      oculos_sol: '🕶️',
      coroa: '👑',
      bone: '🧢',
      'laço': '🎀',
    };
    return map[avatar.acessorio] || '';
  };

  const s = SIZES[size];

  return (
    <View style={{ width: s.container, height: s.container }}>
      <LinearGradient
        colors={['#f87171', '#facc15', '#4ade80']}
        style={[styles.gradientRing, { borderRadius: s.container / 3 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.inner, { borderRadius: s.container / 3 - 4 }]}>
          <Text style={{ fontSize: s.emoji }}>{getAvatarEmoji()}</Text>
          {!!avatar.acessorio && (
            <Text style={[styles.acessorio, { fontSize: s.emoji * 0.4 }]}>
              {getAcessorioEmoji()}
            </Text>
          )}
        </View>
      </LinearGradient>

      {showLevel && (
        <View style={[styles.badge, { width: s.badge, height: s.badge, borderRadius: s.badge / 2, bottom: -4, right: -4 }]}>
          <Ionicons name="star" size={s.badge * 0.45} color="#92400e" />
          <Text style={[styles.badgeText, { fontSize: s.badgeText }]}>{nivel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gradientRing: { padding: 3, flex: 1 },
  inner: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  acessorio: { position: 'absolute', top: 0, right: 0 },
  badge: {
    position: 'absolute',
    backgroundColor: '#facc15',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: { fontWeight: '800', color: '#78350f' },
});
