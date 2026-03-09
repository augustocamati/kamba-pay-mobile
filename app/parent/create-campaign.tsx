import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export default function CreateCampaignScreen() {
  const insets = useSafeAreaInsets();
  const { createCampaign } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleCreate = async () => {
    if (!title.trim() || !target.trim()) {
      Alert.alert('Erro', 'Preencha o titulo e o valor alvo');
      return;
    }
    const targetNum = parseInt(target);
    if (isNaN(targetNum) || targetNum <= 0) {
      Alert.alert('Erro', 'Informe um valor valvo valido');
      return;
    }
    setIsSubmitting(true);
    try {
      await createCampaign({ title, description, targetAmount: targetNum });
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
        <Text style={styles.headerTitle}>Nova Campanha</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.iconPreview}>
          <Ionicons name="heart" size={36} color="#EC4899" />
        </View>
        <Text style={styles.subtitle}>Crie uma campanha de solidariedade para ensinar o valor de ajudar o proximo</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome da campanha</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Ajudar orfanato local" placeholderTextColor={Colors.parent.textMuted} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descricao</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Descreva a campanha..." placeholderTextColor={Colors.parent.textMuted} multiline />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Meta (Kz)</Text>
          <TextInput style={styles.input} value={target} onChangeText={setTarget} placeholder="5000" placeholderTextColor={Colors.parent.textMuted} keyboardType="numeric" />
        </View>

        <Pressable
          style={({ pressed }) => [styles.createBtn, pressed && styles.btnPressed, isSubmitting && styles.disabled]}
          onPress={handleCreate}
          disabled={isSubmitting}
        >
          <Text style={styles.createBtnText}>{isSubmitting ? 'Criando...' : 'Criar Campanha'}</Text>
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
    backgroundColor: 'rgba(236, 72, 153, 0.15)', justifyContent: 'center', alignItems: 'center',
  },
  subtitle: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.parent.textSecondary, textAlign: 'center' },
  inputGroup: { gap: 8, width: '100%' },
  label: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.parent.textSecondary },
  input: {
    backgroundColor: Colors.parent.surface, borderRadius: 14, padding: 16,
    fontSize: 16, fontFamily: 'Nunito_400Regular', color: '#FFFFFF',
    borderWidth: 1, borderColor: Colors.parent.border,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  createBtn: {
    backgroundColor: '#EC4899', borderRadius: 14, paddingVertical: 18, alignItems: 'center', width: '100%',
  },
  createBtnText: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
});
