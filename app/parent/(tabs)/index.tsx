import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Linking,
  StyleSheet,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { MASCOT_ASSETS } from '@/lib/mascot-assets';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { useApp } from '@/context/AppContext';
import { API_HOST } from '@/lib/api';
import { NovaTarefaModal } from '../../../components/NovaTarefaModal';
import { NovaMissaoModal } from '../../../components/NovaMissaoModal';
import { AdicionarDependente } from '../../../components/AdicionarDependente';
import { CriarCampanha } from '../../../components/CriarCampanha';
import type { StatusTarefa } from '../../../types';

// ---------- Helpers ----------
function getTaskEmoji(icone: string): string {
  const map: Record<string, string> = {
    bed: '🛏️',
    book: '📚', 
    utensils: '🍳',
    pencil: '✏️',
    broom: '🧹',
    plant: '🌱',
  };
  return map[icone] ?? '✅';
}


// ---------- Main Component ----------
export default function ParentDashboard() {
  const {
    crianca,
    tarefas,
    missoes,
    historico,
    aprovarTarefa,
    rejeitarTarefa,
    criarTarefa,
    adicionarSaldo,
    atualizarDadosCrianca,
    criarCampanha,
    campanhas,
    dependentes,
    criarMissao,
    refreshData
  } = useApp();
  const { user, logout } = useAuth();

  const [novaTarefaModal, setNovaTarefaModal] = useState(false);
  const [novaCampanhaModal, setNovaCampanhaModal] = useState(false);
  const [novaMissaoModal, setNovaMissaoModal] = useState(false);
  const [adicionarDependenteModal, setAdicionarDependenteModal] = useState(false);

  const [formTarefa, setFormTarefa] = useState({
    titulo: '',
    descricao: '',
    recompensa: '',
    icone: 'bed',
    categoria: 'casa',
    crianca_id: '',
  });

  const handleAdicionarDependente = () => {
    refreshData();
    Alert.alert('Sucesso 🎉', 'Dependente adicionado com sucesso! Já pode começar a aprender sobre finanças!');
  };

  const handleCriarCampanha = (dados: any) => {
    criarCampanha(dados);
    Alert.alert('Sucesso ❤️', `${dados.titulo} foi adicionada à lista de campanhas disponíveis.`);
  };

  const handleCriarMissao = async (dados: any) => {
    try {
      await criarMissao({
        ...dados,
        objetivo_valor: parseFloat(dados.objetivo_valor),
        recompensa: parseFloat(dados.recompensa || 0),
        crianca_id: dados.crianca_id || (dependentes.length > 0 ? dependentes[0].id : ''),
      });
      Alert.alert('Sucesso 🎯', `Missão "${dados.titulo}" criada!`);
      setNovaMissaoModal(false);
    } catch (e: any) {
      Alert.alert('Erro', 'Não foi possível criar a missão.');
    }
  };

  // Sync default crianca_id when dependentes load
  React.useEffect(() => {
    if (dependentes.length > 0 && !formTarefa.crianca_id) {
      setFormTarefa(prev => ({ ...prev, crianca_id: dependentes[0].id }));
    }
  }, [dependentes]);

  const handleCriarTarefa = async () => {
    if (!formTarefa.titulo || !formTarefa.descricao || !formTarefa.recompensa || !formTarefa.crianca_id) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    await criarTarefa({
      titulo: formTarefa.titulo,
      descricao: formTarefa.descricao,
      recompensa: parseFloat(formTarefa.recompensa),
      status: 'pendente' as StatusTarefa,
      crianca_id: formTarefa.crianca_id,
      icone: formTarefa.icone,
      categoria: formTarefa.categoria,
    });

    Alert.alert('Sucesso ✅', 'Tarefa criada com sucesso!');
    setFormTarefa({ 
      titulo: '', 
      descricao: '', 
      recompensa: '', 
      icone: 'bed', 
      categoria: 'casa',
      crianca_id: dependentes[0]?.id || ''
    });
    setNovaTarefaModal(false);
  };

  const handleAprovar = (tarefaId: string) => {
    aprovarTarefa(tarefaId);
    Alert.alert('Tarefa aprovada! 🎉', 'A recompensa foi adicionada ao pote Gastar.');
  };

  const handleRejeitar = (tarefaId: string) => {
    // Agora a tela principal apenas leva para a gestão ou pede o motivo
    Alert.alert('Revisão', 'Vá para a aba de Tarefas para analisar e rejeitar com um motivo específico.');
  };


  const tarefasAguardando = tarefas.filter((t) => t.status === 'aguardando_aprovacao');
  const tarefasConcluidasCount = tarefas.filter((t) => t.status === 'aprovada').length;
  const taxaPoupanca =
    crianca.potes.total > 0
      ? Math.round((crianca.potes.saldo_poupar / crianca.potes.total) * 100)
      : 0;

  const performanceData = [
    { month: 'Jan', saved: 2500, spent: 1800, helped: 700 },
    { month: 'Fev', saved: 3200, spent: 2100, helped: 900 },
    {
      month: 'Mar',
      saved: crianca.potes.saldo_poupar,
      spent: crianca.potes.saldo_gastar,
      helped: crianca.potes.saldo_ajudar,
    },
  ];

  return (
    <LinearGradient colors={['#0f172a', '#1e3a5f', '#0f172a']} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Olá, {user?.name || 'Paizão'} 👋</Text>
            <Text style={styles.headerSubtitle}>Acompanhe o progresso financeiro de seus filhos</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={async () => {
              await logout();
              router.replace('/');
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#f97316" />
          </TouchableOpacity>
        </View>

        {/* Adicionar Dependente Button */}
        <TouchableOpacity
          onPress={() => setAdicionarDependenteModal(true)}
          activeOpacity={0.85}
          style={{ marginBottom: 16 }}
        >
          <LinearGradient
            colors={['#f97316', '#ea580c', '#dc2626']}
            style={styles.addDependentCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <View style={styles.iconBox}>
                <Ionicons name="person-add" size={28} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addDependentTitle}>Adicionar Novo Dependente</Text>
                <Text style={styles.addDependentSubtitle}>Cadastre mais um filho para começar a jornada financeira</Text>
              </View>
            </View>
            <Text style={{ fontSize: 40 }}>👶</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Modals */}
        <AdicionarDependente
          open={adicionarDependenteModal}
          onOpenChange={setAdicionarDependenteModal}
          onAdicionar={handleAdicionarDependente}
        />

        {/* Cartões de Resumo */}
        <View style={styles.summaryRow}>
          {/* Saldo Total */}
          <View style={[styles.summaryCard, { flex: 1 }]}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.summaryCardLabel}>Saldo Total</Text>
              <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                <Text style={{ fontSize: 18 }}>💰</Text>
              </View>
            </View>
            <Text style={styles.summaryCardValue}>{Number(crianca.potes.total || 0).toFixed(2)} Kz</Text>
          
          </View>

          {/* Tarefas Completas */}
          <View style={[styles.summaryCard, { flex: 1 }]}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.summaryCardLabel}>Tarefas Completas</Text>
              <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(34,197,94,0.2)' }]}>
                <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
              </View>
            </View>
            <Text style={styles.summaryCardValue}>{tarefasConcluidasCount}</Text>
            <Text style={[styles.summaryCardHint, { color: '#93c5fd' }]}>Este mês</Text>
          </View>
        </View>

        {/* Taxa de Poupança */}
        <View style={[styles.summaryCard, { marginBottom: 16 }]}>
          <View style={styles.summaryCardHeader}>
            <Text style={styles.summaryCardLabel}>Taxa de Poupança</Text>
            <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(168,85,247,0.2)' }]}>
              <Ionicons name="trending-up" size={18} color="#c084fc" />
            </View>
          </View>
          <Text style={styles.summaryCardValue}>{taxaPoupanca}%</Text>
          <Text style={[styles.summaryCardHint, { color: '#e9d5ff' }]}>
            {taxaPoupanca >= 40 ? 'Excelente!' : 'Continue assim'}
          </Text>
        </View>

        {/* Gráfico de Desempenho */}
        <View style={[styles.card, { marginBottom: 16 }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Desempenho Mensal</Text>
          </View>

          {/* Legenda */}
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.legendDot, { backgroundColor: '#4ade80' }]} />
              <Text style={styles.legendText}>Poupou</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.legendDot, { backgroundColor: '#fb923c' }]} />
              <Text style={styles.legendText}>Gastou</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.legendDot, { backgroundColor: '#facc15' }]} />
              <Text style={styles.legendText}>Ajudou</Text>
            </View>
          </View>

          {/* Barras */}
          {performanceData.map((data, index) => {
            const total = data.saved + data.spent + data.helped;
            const savedPct = total > 0 ? (data.saved / total) * 100 : 0;
            const spentPct = total > 0 ? (data.spent / total) * 100 : 0;
            const helpedPct = total > 0 ? (data.helped / total) * 100 : 0;

            return (
              <View key={index} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={styles.barMonth}>{data.month}</Text>
                  <Text style={styles.barTotal}>{Number(total || 0).toFixed(2)} Kz</Text>
                </View>
                <View style={styles.barContainer}>
                  <View style={[styles.barSegment, { flex: savedPct, backgroundColor: '#4ade80' }]} />
                  <View style={[styles.barSegment, { flex: spentPct, backgroundColor: '#fb923c' }]} />
                  <View style={[styles.barSegment, { flex: helpedPct, backgroundColor: '#facc15' }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Lista de Dependentes */}
        <View style={{ marginBottom: 24 }}>
        
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
            {dependentes.map(dep => (
              <TouchableOpacity 
                key={dep.id} 
                style={styles.childCard}
                onPress={() => router.push(`/parent/child-stats/${dep.id}`)}
              >
                <LinearGradient 
                  colors={dep.id === 'crianca-1' ? ['#3b82f6', '#1e40af'] : ['#8b5cf6', '#4c1d95']}
                  style={styles.childCardInner}
                >
                   <View style={styles.childAvatarMini}>
                      {dep.mascote?.imagem_url && MASCOT_ASSETS[dep.mascote.imagem_url] ? (
                        <Image 
                          source={MASCOT_ASSETS[dep.mascote.imagem_url]} 
                          style={{ width: 40, height: 40 }} 
                          contentFit="contain" 
                        />
                      ) : (
                        <Ionicons name="person" size={24} color="#fff" />
                      )}
                   </View>
                   <Text style={styles.childCardName}>{dep.nome}</Text>
                   <Text style={styles.childCardBalance}>{Number(dep.potes.total || 0).toFixed(2)} Kz</Text>
                   <View style={styles.childCardLevel}>
                      <Text style={styles.childLevelText}>{dep.idade} anos</Text>
                   </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
            
            {/* Add Dependent Card */}
            <TouchableOpacity 
              style={styles.addChildCard}
              onPress={() => setAdicionarDependenteModal(true)}
            >
               <Ionicons name="add" size={32} color="rgba(255,255,255,0.3)" />
               <Text style={styles.addChildText}>Novo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Resumo de Metas e Solidariedade */}
        <View style={[styles.card, { marginBottom: 16 }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Metas e Campanhas</Text>
            <TouchableOpacity onPress={() => router.push('/parent/(tabs)/goals')}>
              <Text style={{ color: '#93c5fd', fontSize: 13 }}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {missoes.filter(m => m.ativa).slice(0, 2).map(missao => (
            <View key={missao.id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#fff', fontSize: 14 }}>🎯 {missao.titulo}</Text>
                <Text style={{ color: '#93c5fd', fontSize: 12 }}>
                  {Math.min(Math.round((missao.progresso_atual / missao.objetivo_valor) * 100), 100)}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${Math.min((missao.progresso_atual / missao.objetivo_valor) * 100, 100)}%`, backgroundColor: '#3b82f6' }]} />
              </View>
            </View>
          ))}

          {campanhas.filter(c => c.ativa).slice(0, 1).map(campanha => (
            <View key={campanha.id} style={{ marginTop: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#fff', fontSize: 14 }}>❤️ {campanha.titulo}</Text>
                <Text style={{ color: '#93c5fd', fontSize: 12 }}>Campanha</Text>
              </View>
              <Text style={{ color: '#94a3b8', fontSize: 12 }} numberOfLines={1}>{campanha.organizacao}</Text>
            </View>
          ))}
        </View>

        {/* Modals */}
        <NovaTarefaModal
          visible={novaTarefaModal}
          onClose={() => setNovaTarefaModal(false)}
          onCriar={handleCriarTarefa}
          form={formTarefa}
          setForm={setFormTarefa}
          dependentes={dependentes}
        />

        <NovaMissaoModal
          visible={novaMissaoModal}
          onClose={() => setNovaMissaoModal(false)}
          onCriar={handleCriarMissao}
          dependentes={dependentes}
        />

        <CriarCampanha
          open={novaCampanhaModal}
          onOpenChange={setNovaCampanhaModal}
          onCriar={handleCriarCampanha}
        />

        {/* Tarefas para Aprovação */}
        <View style={[styles.card, { marginBottom: 16 }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Tarefas para Aprovação</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tarefasAguardando.length} pendentes</Text>
            </View>
          </View>

          {tarefasAguardando.length > 0 ? (
            tarefasAguardando.map((tarefa) => (
              <TouchableOpacity 
                key={tarefa.id} 
                style={styles.tarefaItem}
                onPress={() => router.push(`/parent/task-details/${tarefa.id}`)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Text style={{ fontSize: 24 }}>{getTaskEmoji(tarefa.icone)}</Text>
                    <View>
                      <Text style={styles.tarefaTitle}>{tarefa.titulo}</Text>
                      <Text style={styles.tarefaSubtitle}>
                        {crianca.nome} • {tarefa.concluido_em ? new Date(tarefa.concluido_em).toLocaleDateString('pt-AO') : ''}
                      </Text>
                    </View>
                  </View>

                  {tarefa.foto_url ? (
                    <Image source={{ uri: tarefa.foto_url.startsWith('http') ? tarefa.foto_url : `${API_HOST}${tarefa.foto_url}` }} style={styles.tarefaImage} resizeMode="cover" />
                  ) : null}

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardBadgeText}>{tarefa.recompensa} Kz</Text>
                    </View>
                    <Ionicons name="time" size={16} color="#fb923c" />
                  </View>
                </View>

                <View style={{ justifyContent: 'center', marginLeft: 12 }}>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.2)" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Ionicons name="checkmark-circle" size={48} color="#4ade80" style={{ marginBottom: 12 }} />
              <Text style={{ color: '#93c5fd' }}>Nenhuma tarefa aguardando aprovação</Text>
            </View>
          )}
        </View>


       

      </ScrollView>
    </LinearGradient>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#93c5fd',
  },
  addDependentCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'rgba(251,146,60,0.3)',
  },
  iconBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 14,
  },
  addDependentTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  addDependentSubtitle: {
    fontSize: 12,
    color: '#fed7aa',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryCardLabel: {
    fontSize: 12,
    color: '#93c5fd',
    flex: 1,
    marginRight: 6,
  },
  summaryIconWrap: {
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  summaryCardHint: {
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#93c5fd',
  },
  barMonth: {
    fontSize: 13,
    fontWeight: '600',
    color: '#93c5fd',
  },
  barTotal: {
    fontSize: 13,
    color: '#7dd3fc',
  },
  barContainer: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
  actionCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  childCard: {
    width: 140,
    height: 180,
    marginRight: 12,
  },
  childCardInner: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childAvatarMini: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  childCardName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  childCardBalance: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  childCardLevel: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  childLevelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  addChildCard: {
    width: 140,
    height: 180,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  addChildText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  actionBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  badge: {
    backgroundColor: 'rgba(249,115,22,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fb923c',
    fontSize: 12,
    fontWeight: '600',
  },
  tarefaItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.3)',
  },
  tarefaTitle: {
    fontWeight: '700',
    color: '#fff',
    fontSize: 15,
  },
  tarefaSubtitle: {
    fontSize: 12,
    color: '#93c5fd',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  tarefaImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  rewardBadge: {
    backgroundColor: 'rgba(250,204,21,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rewardBadgeText: {
    color: '#fde047',
    fontWeight: '700',
    fontSize: 13,
  },
  approvalBtn: {
    padding: 10,
    borderRadius: 12,
  },
  missaoItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 99,
    height: 8,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 99,
  },
  missaoHint: {
    fontSize: 11,
    color: '#93c5fd',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  modalCloseBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#93c5fd',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  chipBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBtnActive: {
    backgroundColor: 'rgba(59,130,246,0.3)',
    borderColor: '#3b82f6',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#93c5fd',
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 14,
  },
  gradientBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
