import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { AlertEmitter, CustomAlertOptions } from '@/lib/alert';

export function GlobalAlert() {
  const [alertConfig, setAlertConfig] = useState<CustomAlertOptions | null>(null);

  useEffect(() => {
    const unsubscribe = AlertEmitter.addListener((data) => {
      setAlertConfig(data);
    });
    return unsubscribe;
  }, []);

  const closeAlert = () => setAlertConfig(null);

  if (!alertConfig) return null;

  const { title, message, buttons } = alertConfig;
  const isError = title.toLowerCase().includes('erro') || title.toLowerCase().includes('falha');
  const isSuccess = title.toLowerCase().includes('sucesso') || title.toLowerCase().includes('parabéns');

  const iconName = isError ? 'alert-circle' : isSuccess ? 'checkmark-circle' : 'information-circle';
  const iconColor = isError ? '#EF4444' : isSuccess ? '#22C55E' : '#3B82F6';
  const iconBg = isError ? 'rgba(239,68,68,0.1)' : isSuccess ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)';

  const defaultButton = [{ text: 'OK', onPress: closeAlert }];
  const activeButtons = buttons && buttons.length > 0 ? buttons : defaultButton;

  const content = (
    <View style={[styles.modalContent, { borderColor: 'rgba(255,255,255,0.1)' }]}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={32} color={iconColor} />
        </View>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}

      <View style={[styles.buttonContainer, activeButtons.length > 1 ? { flexDirection: 'row' } : { flexDirection: 'column' }]}>
        {activeButtons.map((btn, index) => {
          const isDestructive = btn.style === 'destructive';
          const isCancel = btn.style === 'cancel';
          const btnBg = isDestructive ? '#EF4444' : isCancel ? 'rgba(255,255,255,0.05)' : '#FF6B00';
          const txtColor = isCancel ? '#e2e8f0' : '#fff';

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.button,
                { backgroundColor: btnBg },
                activeButtons.length > 1 && { flex: 1, marginHorizontal: 4 }
              ]}
              onPress={() => {
                closeAlert();
                btn.onPress?.();
              }}
            >
              <Text style={[styles.buttonText, { color: txtColor }]}>{btn.text || 'OK'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal visible transparent animationType="fade" onRequestClose={closeAlert}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="dark" style={styles.overlay}>
          {content}
        </BlurView>
      ) : (
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
          {content}
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 9999,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
