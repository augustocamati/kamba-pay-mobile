import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export default function AddChildScreen() {
  const insets = useSafeAreaInsets();
  const { addChild } = useAuth();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Informe o nome da crianca');
      return;
    }
    setIsSubmitting(true);
    try {
      await addChild(name.trim());
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
        <Text style={styles.headerTitle}>Adicionar Dependente</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.avatarPreview}>
          <Ionicons name="person" size={40} color="#FF8C00" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome da crianca</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Maria"
            placeholderTextColor={Colors.parent.textMuted}
            autoCapitalize="words"
            autoFocus
          />
        </View>

        <Text style={styles.hint}>
          A crianca podera acessar o app usando o e-mail gerado automaticamente
        </Text>

        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && styles.btnPressed, isSubmitting && styles.disabled]}
          onPress={handleAdd}
          disabled={isSubmitting}
        >
          <Ionicons name="add" size={20} color="#0B1A2E" />
          <Text style={styles.addBtnText}>{isSubmitting ? 'Adicionando...' : 'Adicionar'}</Text>
        </Pressable>
      </View>
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
  form: { padding: 24, gap: 24, alignItems: 'center' },
  avatarPreview: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255, 140, 0, 0.15)', justifyContent: 'center', alignItems: 'center',
  },
  inputGroup: { gap: 8, width: '100%' },
  label: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.parent.textSecondary },
  input: {
    backgroundColor: Colors.parent.surface, borderRadius: 14, padding: 16,
    fontSize: 16, fontFamily: 'Nunito_400Regular', color: '#FFFFFF',
    borderWidth: 1, borderColor: Colors.parent.border,
  },
  hint: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.parent.textMuted, textAlign: 'center' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FF8C00', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 32,
    width: '100%', justifyContent: 'center',
  },
  addBtnText: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: '#0B1A2E' },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
});
