import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';

export default function FamilyScreen() {
  const insets = useSafeAreaInsets();
  const { crianca } = useApp();

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a']} style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.title}>Família</Text>
        <Text style={styles.subtitle}>Gestão de perfil e configurações</Text>

        <TouchableOpacity style={styles.childCard} activeOpacity={0.9}>
          <View style={styles.avatarWrap}>
             <Ionicons name="person" size={32} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.childName}>{crianca.nome}</Text>
            <Text style={styles.childAge}>{crianca.idade} anos</Text>
          </View>
          <Feather name="edit-2" size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
             <Ionicons name="person-add" size={20} color="#60a5fa" />
          </View>
          <Text style={styles.actionText}>Adicionar outro dependente</Text>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
             <Ionicons name="notifications" size={20} color="#a78bfa" />
          </View>
          <Text style={styles.actionText}>Notificações</Text>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(251, 146, 60, 0.2)' }]}>
             <Ionicons name="lock-closed" size={20} color="#fb923c" />
          </View>
          <Text style={styles.actionText}>Controle Parental</Text>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
             <Ionicons name="log-out" size={20} color="#ef4444" />
          </View>
          <Text style={[styles.actionText, { color: '#ef4444' }]}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 14, color: '#93c5fd', marginBottom: 24 },
  childCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24, padding: 20, marginBottom: 32,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarWrap: {
     width: 60, height: 60, borderRadius: 30, backgroundColor: '#fb923c',
     alignItems: 'center', justifyContent: 'center',
  },
  childName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  childAge: { fontSize: 14, color: '#93c5fd', marginTop: 2 },
  actionItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  actionText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff' },
});
