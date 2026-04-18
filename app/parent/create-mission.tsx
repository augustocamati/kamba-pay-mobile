import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { TipoMissao } from '@/types';

export default function CreateMissionScreen() {
  const insets = useSafeAreaInsets();
  const { dependentes, criarMissao } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [recompensa, setRecompensa] = useState('');
  const [tipo, setTipo] = useState<TipoMissao>('poupanca');
  const [selectedChild, setSelectedChild] = useState<string>(dependentes[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const missionTypes: { key: TipoMissao; label: string; icon: string; color: string[] }[] = [
    { key: 'poupanca', label: 'Poupança', icon: 'piggy-bank', color: ['#3b82f6', '#22c55e'] },
    { key: 'estudo', label: 'Estudo', icon: 'book', color: ['#7c3aed', '#3b82f6'] },
    { key: 'comportamento', label: 'Comp.', icon: 'star', color: ['#f59e0b', '#ef4444'] },
    { key: 'autonomia', label: 'Autonomia', icon: 'flash', color: ['#10b981', '#3b82f6'] },
    { key: 'saude', label: 'Saúde', icon: 'heart', color: ['#ef4444', '#f43f5e'] },
    { key: 'solidariedade', label: 'Social', icon: 'hand-heart', color: ['#ec4899', '#f43f5e'] },
  ];

  const handleCreate = async () => {
    if (!title.trim() || !target.trim() || !selectedChild) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedType = missionTypes.find(t => t.key === tipo);
      
      const payloadDados = {
        titulo: title,
        descricao: description,
        objetivo_valor: parseFloat(target),
        recompensa: parseFloat(recompensa || '0'),
        tipo: tipo,
        crianca_id: selectedChild,
        icone: '🎯',
        cor: selectedType?.color || ['#3b82f6', '#7c3aed'],
        tipo_label: selectedType?.label || 'Meta',
        icone_nome: 'trending-up'
      };

      await criarMissao(payloadDados);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível criar a missão');
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
          <Text style={styles.label}>Tipo de Missão</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
            {missionTypes.map(t => (
              <Pressable
                key={t.key}
                style={[styles.typeBtn, tipo === t.key && { borderColor: t.color[0], backgroundColor: `${t.color[0]}15` }]}
                onPress={() => { setTipo(t.key); Haptics.selectionAsync(); }}
              >
                <MaterialCommunityIcons name={t.icon as any} size={20} color={tipo === t.key ? t.color[0] : Colors.parent.textMuted} />
                <Text style={[styles.typeLabel, tipo === t.key && { color: t.color[0] }]}>{t.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor da meta (Kz)</Text>
          <TextInput style={styles.input} value={target} onChangeText={setTarget} placeholder="10000" placeholderTextColor={Colors.parent.textMuted} keyboardType="numeric" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recompensa ao completar (Kz)</Text>
          <TextInput style={styles.input} value={recompensa} onChangeText={setRecompensa} placeholder="1000" placeholderTextColor={Colors.parent.textMuted} keyboardType="numeric" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Descreva o objetivo..." placeholderTextColor={Colors.parent.textMuted} multiline />
        </View>

        {dependentes.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Para qual filho?</Text>
            {dependentes.map(child => (
              <Pressable
                key={child.id}
                style={[styles.childOption, selectedChild === child.id && styles.childOptionSelected]}
                onPress={() => { setSelectedChild(child.id); Haptics.selectionAsync(); }}
              >
                <Ionicons name="person" size={18} color={selectedChild === child.id ? '#22C55E' : Colors.parent.textMuted} />
                <Text style={[styles.childName, selectedChild === child.id && { color: '#FFFFFF' }]}>{child.nome}</Text>
                {selectedChild === child.id && <Ionicons name="checkmark-circle" size={20} color="#22C55E" />}
              </Pressable>
            ))}
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.createBtn, pressed && styles.btnPressed, (isSubmitting || dependentes.length === 0) && styles.disabled]}
          onPress={handleCreate}
          disabled={isSubmitting || dependentes.length === 0}
        >
          <Text style={styles.createBtnText}>{isSubmitting ? 'Criando...' : 'Criar Missão'}</Text>
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
  typeRow: { gap: 10, paddingRight: 20 },
  typeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.parent.surface, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: Colors.parent.border,
  },
  typeLabel: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.parent.textMuted },
  createBtn: {
    backgroundColor: '#22C55E', borderRadius: 14, paddingVertical: 18, alignItems: 'center', width: '100%',
  },
  createBtnText: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
});
