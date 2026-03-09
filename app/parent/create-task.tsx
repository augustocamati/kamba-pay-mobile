import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

type Category = 'save' | 'spend' | 'help';

export default function CreateTaskScreen() {
  const insets = useSafeAreaInsets();
  const { children, createTask } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [category, setCategory] = useState<Category>('save');
  const [selectedChild, setSelectedChild] = useState<string>(children[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const categories: { key: Category; label: string; icon: string; color: string }[] = [
    { key: 'save', label: 'Poupar', icon: 'piggy-bank', color: Colors.chart.save },
    { key: 'spend', label: 'Gastar', icon: 'cart-outline', color: Colors.chart.spend },
    { key: 'help', label: 'Ajudar', icon: 'heart-outline', color: Colors.chart.help },
  ];

  const handleCreate = async () => {
    if (!title.trim() || !reward.trim() || !selectedChild) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatorios');
      return;
    }
    const rewardNum = parseInt(reward);
    if (isNaN(rewardNum) || rewardNum <= 0) {
      Alert.alert('Erro', 'Informe um valor valido para a recompensa');
      return;
    }
    setIsSubmitting(true);
    try {
      await createTask({ title, description, reward: rewardNum, category, assignedTo: selectedChild });
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
        <Text style={styles.headerTitle}>Nova Tarefa</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Titulo da tarefa</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Arrumar o quarto" placeholderTextColor={Colors.parent.textMuted} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descricao (opcional)</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Detalhes da tarefa..." placeholderTextColor={Colors.parent.textMuted} multiline numberOfLines={3} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recompensa (Kz)</Text>
          <View style={styles.rewardInput}>
            <MaterialCommunityIcons name="cash" size={20} color="#FFD700" />
            <TextInput style={styles.rewardField} value={reward} onChangeText={setReward} placeholder="500" placeholderTextColor={Colors.parent.textMuted} keyboardType="numeric" />
            <Text style={styles.currency}>Kz</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.categoryRow}>
            {categories.map(cat => (
              <Pressable
                key={cat.key}
                style={[styles.categoryBtn, category === cat.key && { borderColor: cat.color, backgroundColor: `${cat.color}15` }]}
                onPress={() => { setCategory(cat.key); Haptics.selectionAsync(); }}
              >
                {cat.key === 'save' ? (
                  <MaterialCommunityIcons name="piggy-bank" size={20} color={category === cat.key ? cat.color : Colors.parent.textMuted} />
                ) : (
                  <Ionicons name={cat.icon as any} size={20} color={category === cat.key ? cat.color : Colors.parent.textMuted} />
                )}
                <Text style={[styles.categoryLabel, category === cat.key && { color: cat.color }]}>{cat.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {children.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Atribuir a</Text>
            {children.map(child => (
              <Pressable
                key={child.id}
                style={[styles.childOption, selectedChild === child.id && styles.childOptionSelected]}
                onPress={() => { setSelectedChild(child.id); Haptics.selectionAsync(); }}
              >
                <View style={styles.childOptionAvatar}>
                  <Ionicons name="person" size={18} color={selectedChild === child.id ? '#FF8C00' : Colors.parent.textMuted} />
                </View>
                <Text style={[styles.childOptionName, selectedChild === child.id && styles.childOptionNameSelected]}>{child.name}</Text>
                {selectedChild === child.id && <Ionicons name="checkmark-circle" size={22} color="#FF8C00" />}
              </Pressable>
            ))}
          </View>
        )}

        {children.length === 0 && (
          <View style={styles.noChildWarn}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.noChildText}>Adicione um dependente primeiro para criar tarefas</Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.createBtn, pressed && styles.btnPressed, (isSubmitting || children.length === 0) && styles.disabled]}
          onPress={handleCreate}
          disabled={isSubmitting || children.length === 0}
        >
          <Text style={styles.createBtnText}>{isSubmitting ? 'Criando...' : 'Criar Tarefa'}</Text>
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
  form: { padding: 20, gap: 20, paddingBottom: 40 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.parent.textSecondary },
  input: {
    backgroundColor: Colors.parent.surface, borderRadius: 14, padding: 16,
    fontSize: 16, fontFamily: 'Nunito_400Regular', color: '#FFFFFF',
    borderWidth: 1, borderColor: Colors.parent.border,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  rewardInput: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.parent.surface, borderRadius: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: Colors.parent.border,
  },
  rewardField: { flex: 1, paddingVertical: 16, fontSize: 20, fontFamily: 'Nunito_700Bold', color: '#FFD700' },
  currency: { fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: Colors.parent.textSecondary },
  categoryRow: { flexDirection: 'row', gap: 10 },
  categoryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.parent.surface, borderRadius: 12, paddingVertical: 14,
    borderWidth: 1.5, borderColor: Colors.parent.border,
  },
  categoryLabel: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.parent.textMuted },
  childOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.parent.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.parent.border, marginBottom: 8,
  },
  childOptionSelected: { borderColor: '#FF8C00', backgroundColor: 'rgba(255, 140, 0, 0.08)' },
  childOptionAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255, 140, 0, 0.1)', justifyContent: 'center', alignItems: 'center',
  },
  childOptionName: { flex: 1, fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: Colors.parent.textSecondary },
  childOptionNameSelected: { color: '#FFFFFF' },
  noChildWarn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 12, padding: 14,
  },
  noChildText: { flex: 1, fontSize: 13, fontFamily: 'Nunito_400Regular', color: '#F59E0B' },
  createBtn: {
    backgroundColor: '#FF8C00', borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 10,
  },
  createBtnText: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: '#0B1A2E' },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
});
