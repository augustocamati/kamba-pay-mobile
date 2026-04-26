import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

interface ModalMotivoRejeicaoProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
}

export function ModalMotivoRejeicao({ visible, onClose, onConfirm }: ModalMotivoRejeicaoProps) {
  const [motivo, setMotivo] = useState('');

  const handleConfirm = () => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo da rejeição.');
      return;
    }
    onConfirm(motivo);
    setMotivo('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Motivo da Rejeição</Text>
          <Text style={styles.modalSubtitle}>
            Explique o que a criança precisa melhorar para que ela possa corrigir e reenviar.
          </Text>
          
          <TextInput
            style={styles.rejectionInput}
            placeholder="Ex: A foto está tremida, tire outra por favor."
            placeholderTextColor="#64748b"
            value={motivo}
            onChangeText={setMotivo}
            multiline
            autoFocus
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              onPress={() => {
                onClose();
                setMotivo('');
              }}
              style={[styles.modalBtn, styles.cancelBtn]}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleConfirm}
              style={[styles.modalBtn, styles.confirmBtn]}
            >
              <Text style={styles.confirmBtnText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 24,
    width: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  rejectionInput: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    color: '#fff',
    padding: 16,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#ef4444',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 15,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
