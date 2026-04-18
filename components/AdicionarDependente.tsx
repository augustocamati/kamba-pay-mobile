import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { parentService } from '@/lib/api';
import * as Haptics from 'expo-haptics';

interface AdicionarDependenteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdicionar: () => void;
}

const IDADES = [6, 7, 8, 9, 10, 11, 12];

const MUNICIPIOS_MAP: Record<string, string[]> = {
  Luanda: ['Cazenga', 'Belas', 'Talatona', 'Viana', 'Luanda', 'Kilamba Kiaxi', 'Cacuaco', 'Icolo e Bengo', 'Quiçama'],
  Benguela: ['Benguela', 'Lobito', 'Catumbela', 'Baía Farta', 'Ganda'],
  Huambo: ['Huambo', 'Caála', 'Bailundo', 'Ekunha', 'Londuimbali'],
  Huíla: ['Lubango', 'Humpata', 'Chibia', 'Quipungo', 'Caluquembe'],
  Cabinda: ['Cabinda', 'Cacongo', 'Buco-Zau', 'Belize', 'Dinge'],
  Uíge: ['Uíge', 'Negage', 'Maquela do Zombo', 'Damba', 'Bungo'],
  Namibe: ['Moçâmedes', 'Bibala', 'Virei', 'Camucuio', 'Tômbwa'],
};

export function AdicionarDependente({ open, onOpenChange, onAdicionar }: AdicionarDependenteProps) {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [confirmarPin, setConfirmarPin] = useState('');
  const [potePoupar, setPotePoupar] = useState(30);
  const [poteAjudar, setPoteAjudar] = useState(10);
  const [mostrarPin, setMostrarPin] = useState(false);
  const [mostrarConfirmarPin, setMostrarConfirmarPin] = useState(false);
  const [provincia, setProvincia] = useState('Luanda');
  const [municipio, setMunicipio] = useState('Cazenga');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickerMode, setPickerMode] = useState<'provincia' | 'municipio' | null>(null);

  const poteGastar = 100 - potePoupar - poteAjudar;

  const handleSubmit = async () => {
    if (!nome || !idade || !username || !pin || !confirmarPin || !provincia || !municipio) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
      return;
    }
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      Alert.alert('Erro', 'O PIN deve ser numérico e ter exatamente 4 dígitos!');
      return;
    }
    if (pin !== confirmarPin) {
      Alert.alert('Erro', 'Os PINs não coincidem!');
      return;
    }

    setIsSubmitting(true);
    try {
      await parentService.addChild({
        nome,
        idade: parseInt(idade, 10),
        username: username.trim(),
        pin: pin.trim(),
        provincia,
        municipio,
        distribuicao_potes: {
          gastar_pct: poteGastar,
          poupar_pct: potePoupar,
          ajudar_pct: poteAjudar
        }
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onAdicionar();

      // Reset
      setNome('');
      setIdade('');
      setUsername('');
      setPin('');
      setConfirmarPin('');
      setProvincia('Luanda');
      setMunicipio('Cazenga');
      setPotePoupar(30);
      setPoteAjudar(10);
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.mensagem || 'Erro ao adicionar dependente';
      Alert.alert('Erro', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const adjustPoupar = (delta: number) => {
    const next = Math.max(0, Math.min(90, potePoupar + delta));
    const remaining = 100 - next;
    if (poteAjudar > remaining) setPoteAjudar(remaining);
    setPotePoupar(next);
  };

  const adjustAjudar = (delta: number) => {
    const maxAjudar = Math.min(50, 100 - potePoupar);
    const next = Math.max(0, Math.min(maxAjudar, poteAjudar + delta));
    setPoteAjudar(next);
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={() => onOpenChange(false)}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={styles.header}>
              <LinearGradient colors={['#f97316', '#ea580c']} style={styles.headerIconWrap}>
                <Ionicons name="person-add" size={24} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.headerTitle}>Adicionar Novo Dependente</Text>
                <Text style={styles.headerSubtitle}>Cadastre seu filho(a) para começar a educação financeira</Text>
              </View>
              <TouchableOpacity onPress={() => onOpenChange(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Inforrmações da Criança */}
            <View style={[styles.section, { borderColor: '#fb923c' }]}>
              <LinearGradient colors={['#fff7ed', '#fefce8']} style={styles.sectionGradient}>
                <Text style={styles.sectionTitle}>👶  Informações da Criança</Text>

                <Text style={styles.fieldLabel}>Nome completo *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Kiala Silva"
                    placeholderTextColor="#94a3b8"
                    value={nome}
                    onChangeText={setNome}
                  />
                </View>

                <Text style={styles.fieldLabel}>Nome de usuário *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="at-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="kiala123"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={(t) => setUsername(t.toLowerCase().replace(/\s/g, ''))}
                  />
                </View>
                <Text style={styles.hint}>Será usado para fazer login no app</Text>

                <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Idade *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                  {IDADES.map((ano) => (
                    <TouchableOpacity
                      key={ano}
                      onPress={() => setIdade(String(ano))}
                      style={[styles.chip, idade === String(ano) && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, idade === String(ano) && styles.chipTextActive]}>
                        {ano} anos
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Província *</Text>
                <TouchableOpacity 
                  style={styles.inputRow}
                  onPress={() => setPickerMode('provincia')}
                >
                  <Ionicons name="map-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                  <View style={styles.textInput}>
                    <Text style={{ color: '#1e293b', fontSize: 15 }}>{provincia}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={18} color="#94a3b8" />
                </TouchableOpacity>

                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Município *</Text>
                <TouchableOpacity 
                  style={styles.inputRow}
                  onPress={() => setPickerMode('municipio')}
                >
                  <Ionicons name="business-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                  <View style={styles.textInput}>
                    <Text style={{ color: '#1e293b', fontSize: 15 }}>{municipio}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={18} color="#94a3b8" />
                </TouchableOpacity>

                {/* Picker Overlay */}
                {pickerMode && (
                  <View style={styles.pickerOverlay}>
                    <View style={styles.pickerContent}>
                      <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>
                          {pickerMode === 'provincia' ? 'Escolher Província' : 'Escolher Município'}
                        </Text>
                        <TouchableOpacity onPress={() => setPickerMode(null)}>
                          <Ionicons name="close" size={20} color="#64748b" />
                        </TouchableOpacity>
                      </View>
                      <ScrollView style={{ maxHeight: 250 }}>
                        {(pickerMode === 'provincia' 
                          ? Object.keys(MUNICIPIOS_MAP)
                          : MUNICIPIOS_MAP[provincia] || ['Sede']
                        ).map((item) => (
                          <TouchableOpacity
                            key={item}
                            style={styles.pickerItem}
                            onPress={() => {
                              if (pickerMode === 'provincia') {
                                setProvincia(item);
                                setMunicipio(MUNICIPIOS_MAP[item][0]);
                              } else {
                                setMunicipio(item);
                              }
                              setPickerMode(null);
                            }}
                          >
                            <Text style={[
                              styles.pickerItemText,
                              (pickerMode === 'provincia' ? provincia : municipio) === item && styles.pickerItemTextActive
                            ]}>
                              {item}
                            </Text>
                            {(pickerMode === 'provincia' ? provincia : municipio) === item && (
                              <Ionicons name="checkmark" size={18} color="#ea580c" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Segurança */}
            <View style={[styles.section, { borderColor: '#818cf8' }]}>
              <LinearGradient colors={['#eef2ff', '#ede9fe']} style={styles.sectionGradient}>
                <Text style={styles.sectionTitle}>🔒  Segurança</Text>

                <Text style={styles.fieldLabel}>Criar PIN/Senha *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="1234"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!mostrarPin}
                    value={pin}
                    onChangeText={(t) => setPin(t.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <TouchableOpacity onPress={() => setMostrarPin(!mostrarPin)} style={{ padding: 8 }}>
                    <Ionicons name={mostrarPin ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.hint}>Crie uma senha simples para a criança</Text>

                <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Confirmar PIN/Senha *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="1234"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!mostrarConfirmarPin}
                    value={confirmarPin}
                    onChangeText={(t) => setConfirmarPin(t.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <TouchableOpacity onPress={() => setMostrarConfirmarPin(!mostrarConfirmarPin)} style={{ padding: 8 }}>
                    <Ionicons name={mostrarConfirmarPin ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* Configuração dos Potes */}
            <View style={[styles.section, { borderColor: '#c084fc' }]}>
              <LinearGradient colors={['#fdf4ff', '#fdf2f8']} style={styles.sectionGradient}>
                <Text style={styles.sectionTitle}>💰  Configuração dos Potes</Text>
                <Text style={styles.hint}>Defina como o dinheiro será distribuído</Text>

                <View style={styles.poteRow}>
                  <Text style={styles.poteName}>💚 Poupar</Text>
                  <View style={styles.poteControls}>
                    <TouchableOpacity onPress={() => adjustPoupar(-5)} style={styles.poteBtn}>
                      <Ionicons name="remove" size={16} color="#64748b" />
                    </TouchableOpacity>
                    <Text style={[styles.potePct, { color: '#16a34a' }]}>{potePoupar}%</Text>
                    <TouchableOpacity onPress={() => adjustPoupar(5)} style={styles.poteBtn}>
                      <Ionicons name="add" size={16} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${potePoupar}%`, backgroundColor: '#4ade80' }]} />
                </View>

                <View style={[styles.poteRow, { marginTop: 14 }]}>
                  <Text style={styles.poteName}>❤️ Ajudar</Text>
                  <View style={styles.poteControls}>
                    <TouchableOpacity onPress={() => adjustAjudar(-5)} style={styles.poteBtn}>
                      <Ionicons name="remove" size={16} color="#64748b" />
                    </TouchableOpacity>
                    <Text style={[styles.potePct, { color: '#dc2626' }]}>{poteAjudar}%</Text>
                    <TouchableOpacity onPress={() => adjustAjudar(5)} style={styles.poteBtn}>
                      <Ionicons name="add" size={16} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${poteAjudar}%`, backgroundColor: '#f87171' }]} />
                </View>

                <View style={[styles.poteRow, { marginTop: 14 }]}>
                  <Text style={styles.poteName}>🧡 Gastar</Text>
                  <Text style={[styles.potePct, { color: '#ea580c' }]}>{poteGastar}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${poteGastar}%`, backgroundColor: '#fb923c' }]} />
                </View>

                <View style={styles.distBar}>
                  <View style={[styles.distSegment, { flex: poteGastar, backgroundColor: '#fb923c' }]}>
                    {poteGastar > 15 && <Text style={styles.distText}>{poteGastar}%</Text>}
                  </View>
                  <View style={[styles.distSegment, { flex: potePoupar, backgroundColor: '#4ade80' }]}>
                    {potePoupar > 15 && <Text style={styles.distText}>{potePoupar}%</Text>}
                  </View>
                  <View style={[styles.distSegment, { flex: poteAjudar, backgroundColor: '#f87171', borderTopRightRadius: 8, borderBottomRightRadius: 8 }]}>
                    {poteAjudar > 15 && <Text style={styles.distText}>{poteAjudar}%</Text>}
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Botões */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => onOpenChange(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                style={[{ flex: 1 }, isSubmitting && { opacity: 0.6 }]}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={['#f97316', '#ea580c']}
                  style={styles.submitBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="person-add" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>
                    {isSubmitting ? 'Adicionando...' : 'Adicionar Dependente'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerIconWrap: {
    borderRadius: 14,
    padding: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 8,
    marginLeft: 8,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: 16,
  },
  sectionGradient: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    paddingVertical: 14,
  },
  hint: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#fff7ed',
    borderColor: '#f97316',
  },
  chipText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ea580c',
  },
  poteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  poteName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  poteControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  poteBtn: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 6,
  },
  potePct: {
    fontSize: 20,
    fontWeight: '800',
    minWidth: 48,
    textAlign: 'center',
  },
  progressTrack: {
    backgroundColor: '#e2e8f0',
    borderRadius: 99,
    height: 8,
    overflow: 'hidden',
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
  },
  distBar: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 14,
  },
  distSegment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  distText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  pickerOverlay: {
    marginTop: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pickerContent: {
    width: '100%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#64748b',
  },
  pickerItemTextActive: {
    color: '#ea580c',
    fontWeight: '700',
  },
});