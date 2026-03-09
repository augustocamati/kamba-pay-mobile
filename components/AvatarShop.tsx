import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ShopItem {
  id: string;
  name: string;
  category: string;
  emoji: string;
  price: number;
  owned: boolean;
  premium: boolean;
}

const shopItems: ShopItem[] = [
  { id: '1', name: 'Samakaka Vermelho', category: 'Trajes',    emoji: '👘', price: 500, owned: true,  premium: false },
  { id: '2', name: 'Samakaka Azul',     category: 'Trajes',    emoji: '👗', price: 500, owned: false, premium: false },
  { id: '3', name: 'Capulana Colorida', category: 'Trajes',    emoji: '🥻', price: 400, owned: false, premium: false },
  { id: '4', name: 'Colar de Búzios',   category: 'Acessórios',emoji: '📿', price: 300, owned: true,  premium: false },
  { id: '5', name: 'Turbante Dourado',  category: 'Acessórios',emoji: '👑', price: 600, owned: false, premium: true  },
  { id: '6', name: 'Pulseira Tribal',   category: 'Acessórios',emoji: '📿', price: 250, owned: false, premium: false },
  { id: '7', name: 'Savana Angolana',   category: 'Fundos',    emoji: '🌅', price: 700, owned: false, premium: false },
  { id: '8', name: 'Praia de Luanda',   category: 'Fundos',    emoji: '🏖️', price: 800, owned: false, premium: true  },
  { id: '9', name: 'Aldeia Tradicional',category: 'Fundos',    emoji: '🏘️', price: 650, owned: false, premium: false },
];

const CATEGORIES = ['Todos', 'Trajes', 'Acessórios', 'Fundos'];
const USER_COINS = 3200;

export function AvatarShop() {
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filtered = activeCategory === 'Todos'
    ? shopItems
    : shopItems.filter((i) => i.category === activeCategory);

  // Split into rows of 2
  const rows: ShopItem[][] = [];
  for (let i = 0; i < filtered.length; i += 2) {
    rows.push(filtered.slice(i, i + 2));
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Loja do Avatar</Text>
          <Text style={styles.subtitle}>Personalize seu personagem!</Text>
        </View>
        <Text style={{ fontSize: 32 }}>🛍️</Text>
      </View>

      {/* Saldo de Moedas */}
      <LinearGradient colors={['#facc15', '#f97316']} style={styles.coinsCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
          <View style={styles.coinsIconWrap}>
            <Text style={{ fontSize: 24 }}>🪙</Text>
          </View>
          <View>
            <Text style={styles.coinsLabel}>Suas Moedas</Text>
            <Text style={styles.coinsValue}>{USER_COINS.toLocaleString()} Kz</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.earnBtn} activeOpacity={0.8}>
          <Text style={styles.earnBtnText}>Ganhar Mais</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Avatar Preview */}
      <LinearGradient colors={['#ec4899', '#a855f7', '#3b82f6']} style={styles.previewCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.previewInner}>
          <Text style={{ fontSize: 56, marginBottom: 8 }}>👧🏾</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
            <Text style={{ fontSize: 24 }}>👘</Text>
            <Text style={{ fontSize: 24 }}>📿</Text>
          </View>
          <Text style={styles.previewName}>Kiala</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.previewLevel}>Nível 5</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Grid de Itens */}
      <Text style={styles.sectionTitle}>Itens Disponíveis</Text>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((item) => {
            const canAfford = USER_COINS >= item.price;
            return (
              <TouchableOpacity
                key={item.id}
                disabled={item.owned || !canAfford}
                activeOpacity={0.8}
                style={[
                  styles.itemCard,
                  item.owned    && styles.itemOwned,
                  !item.owned && !canAfford && styles.itemLocked,
                ]}
              >
                {item.premium && !item.owned && (
                  <View style={styles.vipBadge}>
                    <Ionicons name="star" size={10} color="#fff" />
                    <Text style={styles.vipText}>VIP</Text>
                  </View>
                )}
                <Text style={[styles.itemEmoji, !canAfford && !item.owned && { opacity: 0.4 }]}>
                  {item.emoji}
                </Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                {item.owned ? (
                  <View style={styles.ownedBadge}>
                    <Text style={styles.ownedText}>✓ Comprado</Text>
                  </View>
                ) : !canAfford ? (
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={10} color="#6b7280" />
                    <Text style={styles.lockedText}>{item.price} Kz</Text>
                  </View>
                ) : (
                  <LinearGradient colors={['#a855f7', '#ec4899']} style={styles.buyBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={styles.buyText}>{item.price} Kz</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            );
          })}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}

      {/* Dica */}
      <View style={styles.tipCard}>
        <Text style={{ fontSize: 24 }}>💡</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Dica!</Text>
          <Text style={styles.tipText}>
            Complete missões e aprenda sobre finanças para ganhar mais moedas e desbloquear itens exclusivos!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#faf5ff' },
  content: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  coinsCard: { borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  coinsIconWrap: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, padding: 8 },
  coinsLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  coinsValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  earnBtn: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  earnBtnText: { color: '#ea580c', fontWeight: '700', fontSize: 13 },
  filterChip: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginRight: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  filterChipActive: { backgroundColor: '#a855f7' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  filterTextActive: { color: '#fff' },
  previewCard: { borderRadius: 24, padding: 4, marginBottom: 24 },
  previewInner: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },
  previewName: { fontSize: 14, fontWeight: '600', color: '#374151' },
  previewLevel: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1f2937', marginBottom: 14 },
  row: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  itemCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  itemOwned:  { backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: '#4ade80' },
  itemLocked: { backgroundColor: '#f9fafb', opacity: 0.65 },
  vipBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#f97316', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-end', marginBottom: 4,
  },
  vipText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  itemEmoji: { fontSize: 42, marginBottom: 8 },
  itemName: { fontSize: 13, fontWeight: '700', color: '#1f2937', textAlign: 'center', marginBottom: 2 },
  itemCategory: { fontSize: 11, color: '#9ca3af', marginBottom: 10 },
  ownedBadge: { backgroundColor: '#22c55e', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  ownedText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  lockedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#e5e7eb', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  lockedText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  buyBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  buyText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  tipCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderWidth: 2, borderColor: '#bfdbfe',
    borderRadius: 18, padding: 16, marginTop: 8,
  },
  tipTitle: { fontSize: 13, fontWeight: '700', color: '#1e40af', marginBottom: 4 },
  tipText: { fontSize: 12, color: '#1d4ed8' },
});