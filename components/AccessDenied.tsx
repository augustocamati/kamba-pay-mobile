import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AccessDeniedProps {
  onGoBack: () => void;
}

export function AccessDenied({ onGoBack }: AccessDeniedProps) {
  return (
    <LinearGradient colors={['#fff1f2', '#fff7ed', '#fefce8']} style={styles.container}>
      <View style={styles.content}>
        {/* Ícone */}
        <View style={styles.iconWrap}>
          <Ionicons name="shield-outline" size={64} color="#dc2626" />
        </View>

        {/* Título */}
        <Text style={styles.title}>Acesso Negado</Text>

        {/* Mensagem */}
        <View style={styles.messageCard}>
          <Text style={styles.messageMain}>
            Ops! Você não tem permissão para acessar esta área.
          </Text>
          <Text style={styles.messageSub}>
            Esta área é exclusiva para pais e responsáveis. Se você é um responsável, faça login com sua conta de pai.
          </Text>
        </View>

        {/* Info de Segurança */}
        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>🔒 Medida de Segurança</Text>
          <Text style={styles.securityText}>
            Protegemos as informações financeiras e configurações do app para manter sua família segura.
          </Text>
        </View>

        {/* Botão Voltar */}
        <TouchableOpacity onPress={onGoBack} activeOpacity={0.85} style={styles.btnWrap}>
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            style={styles.btn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Voltar para Início</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { width: '100%', maxWidth: 420, alignItems: 'center' },
  iconWrap: {
    backgroundColor: '#fee2e2',
    borderRadius: 99,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  messageMain: { fontSize: 16, color: '#374151', marginBottom: 8, textAlign: 'center' },
  messageSub: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  securityCard: {
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderColor: '#fed7aa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  securityTitle: { fontSize: 13, fontWeight: '700', color: '#9a3412', marginBottom: 4 },
  securityText: { fontSize: 12, color: '#c2410c' },
  btnWrap: { width: '100%', borderRadius: 24, overflow: 'hidden' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 18 },
});
