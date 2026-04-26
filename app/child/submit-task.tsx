import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { MascotCompanion } from '@/components/MascotCompanion';
import { ActionSuccessPopup } from '@/components/ActionSuccessPopup';
import { useSound } from '@/lib/sound-context';


export default function SubmitTaskScreen() {
  const insets = useSafeAreaInsets();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { tarefas, enviarFotoTarefa } = useApp();
  const { playSound } = useSound();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const taskIdStr = Array.isArray(taskId) ? taskId[0] : String(taskId || '');
  const task = tarefas.find(t => String(t.id) === taskIdStr);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissao necessaria', 'Precisamos de acesso a camera para tirar foto');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSubmit = async () => {
    if (!photoUri || !taskIdStr) {
      Alert.alert('Erro', 'Tire uma foto ou selecione uma imagem como prova');
      return;
    }
    setIsSubmitting(true);
    try {
      await enviarFotoTarefa(taskIdStr, photoUri);
      playSound('success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível enviar a tarefa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontFamily: 'Nunito_400Regular', color: Colors.child.textSecondary }}>Tarefa nao encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={Colors.child.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{task.status === 'rejeitada' ? 'Refazer Tarefa' : 'Enviar Tarefa'}</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.taskInfo}>
          <View style={[styles.taskIconWrap, task.status === 'rejeitada' && { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
            <MaterialCommunityIcons 
              name={task.status === 'rejeitada' ? "refresh" : "clipboard-check-outline"} 
              size={28} 
              color={task.status === 'rejeitada' ? "#EF4444" : "#8B5CF6"} 
            />
          </View>
          <Text style={styles.taskTitle}>{task.titulo}</Text>
          {task.status === 'rejeitada' && task.motivo_rejeicao ? (
            <View style={styles.rejectionBanner}>
               <Text style={styles.rejectionReason}>Motivo: {task.motivo_rejeicao}</Text>
            </View>
          ) : (
            task.descricao ? <Text style={styles.taskDesc}>{task.descricao}</Text> : null
          )}
          <View style={styles.rewardBadge}>
            <MaterialCommunityIcons name="cash" size={18} color="#FF8C00" />
            <Text style={styles.rewardText}>{task.recompensa.toLocaleString()} Kz</Text>
          </View>
        </View>

        <Text style={styles.proofLabel}>
          {task.status === 'rejeitada' ? 'Envia uma nova prova corrigida' : 'Envie a prova da tarefa feita'}
        </Text>

        {photoUri ? (
          <Pressable style={styles.photoPreview} onPress={pickImage}>
            <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
            <View style={styles.changePhotoOverlay}>
              <Ionicons name="camera" size={18} color="#FFFFFF" />
              <Text style={styles.changePhotoText}>Trocar foto</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.photoActions}>
            <Pressable style={({ pressed }) => [styles.photoBtn, pressed && styles.btnPressed]} onPress={takePhoto}>
              <Ionicons name="camera" size={28} color="#FF8C00" />
              <Text style={styles.photoBtnText}>Tirar Foto</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.photoBtn, pressed && styles.btnPressed]} onPress={pickImage}>
              <Ionicons name="images" size={28} color="#8B5CF6" />
              <Text style={styles.photoBtnText}>Galeria</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn, 
            pressed && styles.btnPressed, 
            (!photoUri || isSubmitting) && styles.disabled,
            task.status === 'rejeitada' && { backgroundColor: '#7C3AED' }
          ]}
          onPress={handleSubmit}
          disabled={!photoUri || isSubmitting}
        >
          <Ionicons name={task.status === 'rejeitada' ? "refresh" : "send"} size={20} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Enviando...' : (task.status === 'rejeitada' ? 'Reenviar para Revisão' : 'Enviar para Aprovacao')}
          </Text>
        </Pressable>
      </View>

      <MascotCompanion position="bottom-right" />

      <ActionSuccessPopup
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.back();
        }}
        title="Tarefa Enviada! ✅"
        description="Bom trabalho! Agora só precisas de esperar que o teu responsável aprove."
        icon="checkmark-circle"
        buttonText="Voltar às tarefas"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.child.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.child.border,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.child.text },
  content: { flex: 1, padding: 24, gap: 20 },
  taskInfo: { alignItems: 'center', gap: 8 },
  taskIconWrap: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: 'rgba(139,92,246,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  taskTitle: { fontSize: 20, fontFamily: 'Nunito_700Bold', color: Colors.child.text, textAlign: 'center' },
  taskDesc: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.child.textSecondary, textAlign: 'center' },
  rewardBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,140,0,0.1)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  rewardText: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#FF8C00' },
  proofLabel: { fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: Colors.child.text, textAlign: 'center' },
  photoActions: { flexDirection: 'row', gap: 14 },
  photoBtn: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, paddingVertical: 28,
    alignItems: 'center', gap: 8, borderWidth: 2, borderColor: Colors.child.border, borderStyle: 'dashed',
  },
  photoBtnText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.child.text },
  photoPreview: { borderRadius: 18, overflow: 'hidden', height: 220 },
  photo: { width: '100%', height: '100%' },
  changePhotoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: 12, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  changePhotoText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#FFFFFF' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#22C55E', borderRadius: 16, paddingVertical: 18, marginTop: 'auto',
  },
  submitBtnText: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
  rejectionBanner: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    width: '100%',
    marginTop: 4,
  },
  rejectionReason: {
    color: '#B91C1C',
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
