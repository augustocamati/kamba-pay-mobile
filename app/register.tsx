import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Modal, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import * as Haptics from 'expo-haptics';

const PROVINCIAS = [
  'Luanda', 'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 
  'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 
  'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

const MUNICIPIOS: Record<string, string[]> = {
  'Luanda': ['Luanda', 'Belas', 'Cacuaco', 'Cazenga', 'Icolo e Bengo', 'Kilamba Kiaxi', 'Quissama', 'Talatona', 'Viana'],
  'Benguela': ['Benguela', 'Baía Farta', 'Balombo', 'Bocoio', 'Caimbambo', 'Catumbela', 'Chongoroi', 'Ganda', 'Lobito', 'Mariano Machado'],
  'Huíla': ['Lubango', 'Cacula', 'Caluquembe', 'Chibia', 'Chicomba', 'Chipindo', 'Cuvango', 'Humpata', 'Jamba', 'Matala', 'Quilengues', 'Quipungo'],
  'Huambo': ['Huambo', 'Bailundo', 'Caála', 'Catchiungo', 'Ecunha', 'Londuimbale', 'Longonjo', 'Mungo', 'Tchicala-Tcholoanga', 'Tchindjenje', 'Ucuma'],
  'Cabinda': ['Cabinda', 'Belize', 'Buco-Zau', 'Cacongo'],
  // Fallback para as outras
};

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [provincia, setProvincia] = useState('Luanda');
  const [municipio, setMunicipio] = useState('Belas');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showProvinciaModal, setShowProvinciaModal] = useState(false);
  const [showMunicipioModal, setShowMunicipioModal] = useState(false);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !telefone.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 4 caracteres');
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await register(name, email, password, 'parent', provincia, municipio, telefone);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/parent');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', 'Este e-mail ja esta em uso');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMunicipios = () => {
    return MUNICIPIOS[provincia] || [provincia];
  };

  const renderPickerModal = (
    visible: boolean, 
    onClose: () => void, 
    data: string[], 
    onSelect: (val: string) => void, 
    title: string
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </Pressable>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable 
                style={styles.pickerItem} 
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.pickerItemText}>{item}</Text>
                <Ionicons name="chevron-forward" size={18} color="#E2E8F0" />
              </Pressable>
            )}
            style={{ maxHeight: 400 }}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || webBottomInset) + 20 }]}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient colors={['#FF6B00', '#FF8C00', '#FFB347']} style={[styles.headerGradient, { paddingTop: (insets.top || webTopInset) + 16 }]}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="rgba(0,0,0,0.4)" />
            </Pressable>
            <View style={styles.headerContent}>
              <View style={styles.smallLogo}>
                <Image source={require('@/assets/images/logo2.png')} style={{ width: 55, height: 55 }} />
              </View>
              <Text style={styles.welcomeTitle}>Criar Conta</Text>
              <Text style={styles.welcomeSub}>Cadastre-se como responsavel</Text>
            </View>
          </LinearGradient>

          <View style={styles.formSection}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Dados do Responsavel</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome completo</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Seu nome"
                    placeholderTextColor="#C0C0C0"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#C0C0C0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Senha</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Criar senha"
                    placeholderTextColor="#C0C0C0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefone</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="9XXXXXXXX"
                    placeholderTextColor="#C0C0C0"
                    value={telefone}
                    onChangeText={setTelefone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Província</Text>
                <Pressable 
                  style={styles.inputContainer} 
                  onPress={() => setShowProvinciaModal(true)}
                >
                  <Ionicons name="map-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <Text style={[styles.input, !provincia && { color: '#C0C0C0' }]}>
                    {provincia || 'Selecionar Província'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </Pressable>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Município</Text>
                <Pressable 
                  style={styles.inputContainer} 
                  onPress={() => setShowMunicipioModal(true)}
                >
                  <Ionicons name="business-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <Text style={[styles.input, !municipio && { color: '#C0C0C0' }]}>
                    {municipio || 'Selecionar Município'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.registerButton, pressed && styles.buttonPressed, isSubmitting && styles.disabled]}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              <LinearGradient colors={['#FF6B00', '#FF8C00']} style={styles.registerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.registerButtonText}>{isSubmitting ? 'Criando...' : 'Criar Conta'}</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ja tem conta?</Text>
              <Pressable onPress={() => router.replace('/login')}>
                <Text style={styles.footerLink}>Entrar</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderPickerModal(
        showProvinciaModal, 
        () => setShowProvinciaModal(false), 
        PROVINCIAS, 
        (val) => {
          setProvincia(val);
          setMunicipio(MUNICIPIOS[val] ? MUNICIPIOS[val][0] : val);
        }, 
        'Selecionar Província'
      )}

      {renderPickerModal(
        showMunicipioModal, 
        () => setShowMunicipioModal(false), 
        getMunicipios(), 
        setMunicipio, 
        'Selecionar Município'
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5EB' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  headerGradient: { paddingBottom: 30 },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  headerContent: { alignItems: 'center', paddingTop: 8 },
  smallLogo: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  welcomeTitle: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: '#1A1A2E', textAlign: 'center' },
  welcomeSub: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: 'rgba(0,0,0,0.5)', textAlign: 'center', marginTop: 4 },
  formSection: { padding: 20, gap: 16, marginTop: -1 },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
    gap: 16,
  },
  formTitle: { fontSize: 20, fontFamily: 'Nunito_700Bold', color: '#1A1A2E' },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#4B5563' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, fontFamily: 'Nunito_400Regular', color: '#1A1A2E' },
  registerButton: { borderRadius: 14, overflow: 'hidden' },
  registerGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, gap: 8, borderRadius: 14,
  },
  registerButtonText: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: '#FFFFFF' },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.6 },
  footer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 8,
  },
  footerText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: '#9CA3AF' },
  footerLink: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#FF8C00' },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: '#1A1A2E',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemText: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: '#1A1A2E',
  },
});
