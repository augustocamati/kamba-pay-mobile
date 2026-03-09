import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export default function CreateMissionScreen() {
  const insets = useSafeAreaInsets();
  const { children, createMission } = useAuth();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [selectedChild, setSelectedChild] = useState<string>(children[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleCreate = async () => {
    if (!title.trim() || !target.trim() || !selectedChild) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    const targetNum = parseInt(target);
    if (isNaN(targetNum) || targetNum <= 0) {
      Alert.alert('Erro', 'Informe um valor valido');
      return;
    }
    setIsSubmitting(true);
    try {
      await createMission({ title, targetAmount: targetNum, childId: selectedChild });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Nova Missao</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.iconPreview}>
          <MaterialCommunityIcons name="target" size={36} color="#22C55E" />
        </View>
        <Text style={styles.subtitle}>Crie uma meta de poupanca para motivar seu filho</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome da missao</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Novo Jogo" placeholderTextColor={Colors.parent.textMuted} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor da meta (Kz)</Text>
          <TextInput style={styles.input} value={target} onChangeText={setTarget} placeholder="10000" placeholderTextColor={Colors.parent.textMuted} keyboardType="numeric" />
        </View>

        {children.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Para qual filho?</Text>
            {children.map(child => (
              <Pressable
                key={child.id}
                style={[styles.childOption, selectedChild === child.id && styles.childOptionSelected]}
                onPress={() => { setSelectedChild(child.id); Haptics.selectionAsync(); }}
              >
                <Ionicons name="person" size={18} color={selectedChild === child.id ? '#22C55E' : Colors.parent.textMuted} />
                <Text style={[styles.childName, selectedChild === child.id && { color: '#FFFFFF' }]}>{child.name}</Text>
                {selectedChild === child.id && <Ionicons name="checkmark-circle" size={20} color="#22C55E" />}
              </Pressable>
            ))}
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.createBtn, pressed && styles.btnPressed, (isSubmitting || children.length === 0) && styles.disabled]}
          onPress={handleCreate}
          disabled={isSubmitting || children.length === 0}
        >
          <Text style={styles.createBtnText}>{isSubmitting ? 'Criando...' : 'Criar Missao'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1A2E' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.parent.border,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
  form: { padding: 24, gap: 20, alignItems: 'center' },
  iconPreview: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.15)', justifyContent: 'center', alignItems: 'center',
  },
  subtitle: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.parent.textSecondary, textAlign: 'center' },
  inputGroup: { gap: 8, width: '100%' },
  label: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.parent.textSecondary },
  input: {
    backgroundColor: Colors.parent.surface, borderRadius: 14, padding: 16,
    fontSize: 16, fontFamily: 'Nunito_400Regular', color: '#FFFFFF',
    borderWidth: 1, borderColor: Colors.parent.border,
  },
  childOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.parent.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.parent.border, marginBottom: 8,
  },
  childOptionSelected: { borderColor: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.08)' },
  childName: { flex: 1, fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: Colors.parent.textSecondary },
  createBtn: {
    backgroundColor: '#22C55E', borderRadius: 14, paddingVertical: 18, alignItems: 'center', width: '100%',
  },
  createBtnText: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
});
