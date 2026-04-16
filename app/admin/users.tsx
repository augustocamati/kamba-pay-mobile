import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Modal, ScrollView, Alert, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export interface AdminUser {
  id: string; nome: string; email: string; telefone: string;
  tipo: 'pai' | 'crianca'; provincia: string; municipio: string;
  saldo: number; status: 'ativo' | 'inativo'; dataCadastro: string;
}

const PROVINCIAS = ['Luanda', 'Benguela', 'Huíla', 'Huambo', 'Cabinda', 'Malanje', 'Bié', 'Uíge'];

const INITIAL_USERS: AdminUser[] = [
  { id: 'u-1', nome: 'João Manuel', email: 'joao.manuel@email.com', telefone: '+244 923 456 789', tipo: 'pai', provincia: 'Luanda', municipio: 'Talatona', saldo: 45000, status: 'ativo', dataCadastro: '15/01/2024' },
  { id: 'u-2', nome: 'Maria Silva', email: 'maria.silva@email.com', telefone: '+244 912 370 270', tipo: 'pai', provincia: 'Benguela', municipio: 'Lobito', saldo: 32500, status: 'ativo', dataCadastro: '20/01/2024' },
  { id: 'u-3', nome: 'Pedro Kamba', email: 'pedro.kamba@email.com', telefone: '+244 943 611 311', tipo: 'crianca', provincia: 'Huíla', municipio: 'Lubango', saldo: 8500, status: 'ativo', dataCadastro: '01/02/2024' },
  { id: 'u-4', nome: 'Ana Costa', email: 'ana.costa@email.com', telefone: '+244 923 109 321', tipo: 'pai', provincia: 'Huambo', municipio: 'Caála', saldo: 58000, status: 'ativo', dataCadastro: '10/02/2024' },
  { id: 'u-5', nome: 'Carlos Neto', email: 'carlos.neto@email.com', telefone: '+244 931 234 567', tipo: 'crianca', provincia: 'Luanda', municipio: 'Viana', saldo: 1500, status: 'inativo', dataCadastro: '15/02/2024' },
  { id: 'u-6', nome: 'Luísa António', email: 'luisa.antonio@email.com', telefone: '+244 943 498 788', tipo: 'pai', provincia: 'Benguela', municipio: 'Benguela', saldo: 42000, status: 'ativo', dataCadastro: '01/03/2024' },
  { id: 'u-7', nome: 'Miguel Fernando', email: 'miguel.fernando@email.com', telefone: '+244 913 457 391', tipo: 'crianca', provincia: 'Cabinda', municipio: 'Cabinda', saldo: 12000, status: 'ativo', dataCadastro: '10/03/2024' },
  { id: 'u-8', nome: 'Teresa João', email: 'teresa.joao@email.com', telefone: '+244 946 222 111', tipo: 'pai', provincia: 'Huíla', municipio: 'Matala', saldo: 37500, status: 'ativo', dataCadastro: '15/03/2024' },
];

type TipoFilter = 'Todos' | 'Pai' | 'Criança';
type StatusFilter = 'Todos' | 'Ativo' | 'Inativo';
type SortBy = 'nome' | 'saldo' | 'data';

const AVATAR_COLORS = ['#3B82F6','#F59E0B','#22C55E','#8B5CF6','#EF4444','#0EA5E9','#EC4899'];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export default function AdminUsers() {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('Todos');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos');
  const [provinciaFilter, setProvinciaFilter] = useState('Todas');
  const [sortBy, setSortBy] = useState<SortBy>('nome');
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [newUser, setNewUser] = useState<Partial<AdminUser>>({ tipo: 'pai', status: 'ativo', provincia: 'Luanda', saldo: 0 });

  const filtered = useMemo(() => {
    let list = users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.telefone.includes(q);
      const matchTipo = tipoFilter === 'Todos' || (tipoFilter === 'Pai' && u.tipo === 'pai') || (tipoFilter === 'Criança' && u.tipo === 'crianca');
      const matchStatus = statusFilter === 'Todos' || (statusFilter === 'Ativo' && u.status === 'ativo') || (statusFilter === 'Inativo' && u.status === 'inativo');
      const matchProv = provinciaFilter === 'Todas' || u.provincia === provinciaFilter;
      return matchSearch && matchTipo && matchStatus && matchProv;
    });
    if (sortBy === 'nome') list.sort((a, b) => a.nome.localeCompare(b.nome));
    else if (sortBy === 'saldo') list.sort((a, b) => b.saldo - a.saldo);
    else if (sortBy === 'data') list.sort((a, b) => b.dataCadastro.localeCompare(a.dataCadastro));
    return list;
  }, [users, search, tipoFilter, statusFilter, provinciaFilter, sortBy]);

  const activeFilters = [
    tipoFilter !== 'Todos' && tipoFilter,
    statusFilter !== 'Todos' && statusFilter,
    provinciaFilter !== 'Todas' && provinciaFilter,
  ].filter(Boolean);

  const clearFilters = () => { setTipoFilter('Todos'); setStatusFilter('Todos'); setProvinciaFilter('Todas'); setSortBy('nome'); };

  const deleteUser = (id: string) => Alert.alert('Eliminar Usuário', 'Tem certeza?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: () => setUsers(p => p.filter(u => u.id !== id)) },
  ]);

  const toggleStatus = (id: string) => setUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === 'ativo' ? 'inativo' : 'ativo' } : u));

  const saveEdit = () => {
    if (!editUser) return;
    setUsers(p => p.map(u => u.id === editUser.id ? editUser : u));
    setEditUser(null);
  };

  const addNewUser = () => {
    if (!newUser.nome || !newUser.email) return;
    const u: AdminUser = {
      id: `u-${Date.now()}`, nome: newUser.nome!, email: newUser.email!, telefone: newUser.telefone || '',
      tipo: newUser.tipo as 'pai' | 'crianca' || 'pai', provincia: newUser.provincia || 'Luanda',
      municipio: newUser.municipio || '', saldo: newUser.saldo || 0,
      status: 'ativo', dataCadastro: new Date().toLocaleDateString('pt-AO'),
    };
    setUsers(p => [u, ...p]);
    setAddModal(false);
    setNewUser({ tipo: 'pai', status: 'ativo', provincia: 'Luanda', saldo: 0 });
  };

  const stats = useMemo(() => ({
    total: users.length,
    pais: users.filter(u => u.tipo === 'pai').length,
    criancas: users.filter(u => u.tipo === 'crianca').length,
    ativos: users.filter(u => u.status === 'ativo').length,
  }), [users]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Gestão de Usuários</Text>
          <Text style={styles.pageSub}>{filtered.length} de {users.length} usuários</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <StatChip icon="👥" label="Total" value={stats.total} color="#8FA1C7" />
        <StatChip icon="👨‍👧" label="Pais" value={stats.pais} color="#F59E0B" />
        <StatChip icon="👧" label="Crianças" value={stats.criancas} color="#3B82F6" />
        <StatChip icon="✅" label="Ativos" value={stats.ativos} color="#22C55E" />
      </View>

      {/* Search + Filter button */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar nome, email ou telefone..."
            placeholderTextColor="#4A5F8A"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearch}>
              <Text style={{ color: '#4A5F8A', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterToggleBtn, activeFilters.length > 0 && styles.filterToggleBtnActive]}
          onPress={() => setFilterOpen(true)}
        >
          <Text style={styles.filterToggleIcon}>⚙️</Text>
          {activeFilters.length > 0 && (
            <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{activeFilters.length}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activePillsRow} contentContainerStyle={styles.activePillsContent}>
          {activeFilters.map((f, i) => (
            <View key={i} style={styles.activePill}>
              <Text style={styles.activePillText}>{f}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={clearFilters} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>Limpar todos</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* User list */}
      <FlatList
        data={filtered}
        keyExtractor={u => u.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: u, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 40).duration(400)}>
            <View style={styles.userCard}>
              <View style={styles.cardTop}>
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: avatarColor(u.nome) }]}>
                  <Text style={styles.avatarText}>{u.nome[0]}</Text>
                </View>

                {/* Main info */}
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName} numberOfLines={1}>{u.nome}</Text>
                    <TypeBadge tipo={u.tipo} />
                  </View>
                  <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
                  <Text style={styles.userTel}>{u.telefone}</Text>
                </View>
              </View>

              {/* Location + Balance */}
              <View style={styles.cardMid}>
                <View style={styles.locWrap}>
                  <Text style={styles.locText}>📍 {u.provincia}{u.municipio ? `, ${u.municipio}` : ''}</Text>
                </View>
                <View style={styles.saldoWrap}>
                  <Text style={styles.saldoLabel}>Saldo</Text>
                  <Text style={styles.saldoValue}>Kz {u.saldo.toLocaleString()}</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <StatusBadge status={u.status} />
                <Text style={styles.dateText}>📅 {u.dataCadastro}</Text>
                <View style={styles.actionBtns}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => setViewUser(u)}>
                    <Text style={styles.iconBtnText}>👁️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => setEditUser({ ...u })}>
                    <Text style={styles.iconBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => toggleStatus(u.id)}>
                    <Text style={styles.iconBtnText}>{u.status === 'ativo' ? '🔒' : '🔓'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, styles.delBtn]} onPress={() => deleteUser(u.id)}>
                    <Text style={styles.iconBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}><Text style={styles.emptyIcon}>🔍</Text><Text style={styles.emptyText}>Nenhum usuário encontrado</Text></View>
        )}
      />

      {/* FILTER SHEET */}
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.filterSheet}>
            <View style={styles.filterSheetHandle} />
            <View style={styles.filterSheetHeader}>
              <Text style={styles.filterSheetTitle}>Filtros e Ordenação</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearAllText}>Limpar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterSheetBody}>
              <FilterSection label="Tipo de Utilizador">
                {(['Todos', 'Pai', 'Criança'] as TipoFilter[]).map(t => (
                  <FilterOption key={t} label={t} active={tipoFilter === t} onPress={() => setTipoFilter(t)}
                    icon={t === 'Todos' ? '👥' : t === 'Pai' ? '👨‍👧' : '👧'} />
                ))}
              </FilterSection>

              <FilterSection label="Status da Conta">
                {(['Todos', 'Ativo', 'Inativo'] as StatusFilter[]).map(s => (
                  <FilterOption key={s} label={s} active={statusFilter === s} onPress={() => setStatusFilter(s)}
                    icon={s === 'Todos' ? '🔁' : s === 'Ativo' ? '✅' : '❌'} />
                ))}
              </FilterSection>

              <FilterSection label="Província">
                <View style={styles.provGrid}>
                  {['Todas', ...PROVINCIAS].map(p => (
                    <TouchableOpacity key={p}
                      style={[styles.provChip, provinciaFilter === p && styles.provChipActive]}
                      onPress={() => setProvinciaFilter(p)}>
                      <Text style={[styles.provChipText, provinciaFilter === p && { color: '#FF8C00' }]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </FilterSection>

              <FilterSection label="Ordenar por">
                {[{ key: 'nome', label: 'Nome A-Z', icon: '🔤' }, { key: 'saldo', label: 'Maior Saldo', icon: '💰' }, { key: 'data', label: 'Mais Recente', icon: '📅' }].map(s => (
                  <FilterOption key={s.key} label={s.label} active={sortBy === s.key} onPress={() => setSortBy(s.key as SortBy)} icon={s.icon} />
                ))}
              </FilterSection>
            </ScrollView>

            <View style={styles.filterSheetFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setFilterOpen(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnApply} onPress={() => setFilterOpen(false)}>
                <Text style={styles.btnApplyText}>✓ Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Modal */}
      <Modal visible={!!viewUser} transparent animationType="slide" onRequestClose={() => setViewUser(null)}>
        <View style={styles.overlay}>
          <View style={styles.detailSheet}>
            <View style={styles.detailSheetHandle} />
            {viewUser && (
              <>
                <View style={[styles.detailAvatar, { backgroundColor: avatarColor(viewUser.nome) }]}>
                  <Text style={styles.detailAvatarText}>{viewUser.nome[0]}</Text>
                </View>
                <Text style={styles.detailName}>{viewUser.nome}</Text>
                <View style={styles.detailBadges}>
                  <TypeBadge tipo={viewUser.tipo} />
                  <StatusBadge status={viewUser.status} />
                </View>
                <View style={styles.detailGrid}>
                  {[
                    { label: '📧 Email', value: viewUser.email },
                    { label: '📱 Telefone', value: viewUser.telefone || '—' },
                    { label: '📍 Província', value: viewUser.provincia },
                    { label: '🏙️ Município', value: viewUser.municipio || '—' },
                    { label: '💰 Saldo', value: `Kz ${viewUser.saldo.toLocaleString()}` },
                    { label: '📅 Cadastro', value: viewUser.dataCadastro },
                  ].map((d, i) => (
                    <View key={i} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{d.label}</Text>
                      <Text style={styles.detailValue}>{d.value}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={styles.closeDetailBtn} onPress={() => setViewUser(null)}>
                  <Text style={styles.closeDetailText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={!!editUser} transparent animationType="slide" onRequestClose={() => setEditUser(null)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Usuário</Text>
              <TouchableOpacity onPress={() => setEditUser(null)}><Text style={styles.closeBtnText}>✕</Text></TouchableOpacity>
            </View>
            {editUser && (
              <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                <FormField label="Nome" value={editUser.nome} onChange={v => setEditUser(p => p ? { ...p, nome: v } : p)} />
                <FormField label="Email" value={editUser.email} onChange={v => setEditUser(p => p ? { ...p, email: v } : p)} keyboardType="email-address" />
                <FormField label="Telefone" value={editUser.telefone} onChange={v => setEditUser(p => p ? { ...p, telefone: v } : p)} keyboardType="phone-pad" />
                <FormField label="Saldo (Kz)" value={String(editUser.saldo)} onChange={v => setEditUser(p => p ? { ...p, saldo: Number(v) || 0 } : p)} keyboardType="numeric" />
                <SegmentField label="Tipo"
                  options={[{ label: 'Pai', value: 'pai' }, { label: 'Criança', value: 'crianca' }]}
                  value={editUser.tipo} onChange={v => setEditUser(p => p ? { ...p, tipo: v as any } : p)} />
                <SegmentField label="Status"
                  options={[{ label: 'Ativo', value: 'ativo' }, { label: 'Inativo', value: 'inativo' }]}
                  value={editUser.status} onChange={v => setEditUser(p => p ? { ...p, status: v as any } : p)} />
              </ScrollView>
            )}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setEditUser(null)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnApply} onPress={saveEdit}>
                <Text style={styles.btnApplyText}>💾 Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Modal */}
      <Modal visible={addModal} transparent animationType="slide" onRequestClose={() => setAddModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Usuário</Text>
              <TouchableOpacity onPress={() => setAddModal(false)}><Text style={styles.closeBtnText}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              <FormField label="Nome Completo *" value={newUser.nome || ''} onChange={v => setNewUser(p => ({ ...p, nome: v }))} />
              <FormField label="Email *" value={newUser.email || ''} onChange={v => setNewUser(p => ({ ...p, email: v }))} keyboardType="email-address" />
              <FormField label="Telefone" value={newUser.telefone || ''} onChange={v => setNewUser(p => ({ ...p, telefone: v }))} keyboardType="phone-pad" />
              <FormField label="Saldo Inicial (Kz)" value={String(newUser.saldo || 0)} onChange={v => setNewUser(p => ({ ...p, saldo: Number(v) || 0 }))} keyboardType="numeric" />
              <FormField label="Município" value={newUser.municipio || ''} onChange={v => setNewUser(p => ({ ...p, municipio: v }))} />
              <SegmentField label="Tipo"
                options={[{ label: 'Pai', value: 'pai' }, { label: 'Criança', value: 'crianca' }]}
                value={newUser.tipo || 'pai'} onChange={v => setNewUser(p => ({ ...p, tipo: v as any }))} />
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setAddModal(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnApply} onPress={addNewUser}>
                <Text style={styles.btnApplyText}>➕ Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ── Sub-components ── */
function StatChip({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <View style={[styles.statChip, { borderColor: `${color}30` }]}>
      <Text style={styles.statChipIcon}>{icon}</Text>
      <Text style={[styles.statChipValue, { color }]}>{value}</Text>
      <Text style={styles.statChipLabel}>{label}</Text>
    </View>
  );
}

function TypeBadge({ tipo }: { tipo: string }) {
  return (
    <View style={[styles.typeBadge, tipo === 'pai' ? styles.typePai : styles.typeCrianca]}>
      <Text style={[styles.typeBadgeText, tipo === 'pai' ? { color: '#F59E0B' } : { color: '#3B82F6' }]}>
        {tipo === 'pai' ? 'Pai' : 'Criança'}
      </Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isAtivo = status === 'ativo';
  return (
    <View style={[styles.statusBadge, isAtivo ? styles.statusAtivo : styles.statusInativo]}>
      <View style={[styles.statusDot, { backgroundColor: isAtivo ? '#22C55E' : '#EF4444' }]} />
      <Text style={[styles.statusText, { color: isAtivo ? '#22C55E' : '#EF4444' }]}>{isAtivo ? 'Ativo' : 'Inativo'}</Text>
    </View>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.filterSec}>
      <Text style={styles.filterSecLabel}>{label}</Text>
      {children}
    </View>
  );
}

function FilterOption({ label, active, onPress, icon }: { label: string; active: boolean; onPress: () => void; icon: string }) {
  return (
    <TouchableOpacity style={[styles.filterOpt, active && styles.filterOptActive]} onPress={onPress}>
      <Text style={styles.filterOptIcon}>{icon}</Text>
      <Text style={[styles.filterOptText, active && { color: '#F0F4FF' }]}>{label}</Text>
      {active && <View style={styles.filterOptCheck}><Text style={{ color: '#FF8C00', fontSize: 14 }}>✓</Text></View>}
    </TouchableOpacity>
  );
}

function FormField({ label, value, onChange, keyboardType = 'default' }: { label: string; value: string; onChange: (v: string) => void; keyboardType?: any }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput style={styles.formInput} value={value} onChangeText={onChange} keyboardType={keyboardType} placeholderTextColor="#4A5F8A" />
    </View>
  );
}

function SegmentField({ label, options, value, onChange }: { label: string; options: { label: string; value: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.segRow}>
        {options.map(opt => (
          <TouchableOpacity key={opt.value}
            style={[styles.seg, value === opt.value && styles.segActive]}
            onPress={() => onChange(opt.value)}>
            <Text style={[styles.segText, value === opt.value && { color: '#FF8C00' }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const S = { bg: '#0B1222', card: '#111C30', sidebar: '#0D1526', border: 'rgba(255,255,255,0.07)', text: '#F0F4FF', sub: '#8FA1C7', muted: '#4A5F8A', orange: '#FF8C00' };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: S.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: S.border,
  },
  pageTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: S.text },
  pageSub: { fontSize: 12, color: S.muted, fontFamily: 'Nunito_400Regular', marginTop: 2 },
  addBtn: {
    backgroundColor: S.orange, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: S.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  addBtnText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 13 },

  // Stats bar
  statsBar: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: S.border,
  },
  statChip: {
    flex: 1, alignItems: 'center', backgroundColor: S.card,
    borderRadius: 12, padding: 10,
    borderWidth: 1, gap: 2,
  },
  statChipIcon: { fontSize: 16 },
  statChipValue: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
  statChipLabel: { fontSize: 9, color: S.muted, fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase' },

  // Search
  searchRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 10, alignItems: 'center' },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: S.card, borderRadius: 12, borderWidth: 1, borderColor: S.border, paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, color: S.text, fontFamily: 'Nunito_400Regular', fontSize: 14, paddingVertical: 12 },
  clearSearch: { padding: 4 },
  filterToggleBtn: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: S.card,
    borderWidth: 1, borderColor: S.border, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  filterToggleBtnActive: { borderColor: 'rgba(255,140,0,0.4)', backgroundColor: 'rgba(255,140,0,0.1)' },
  filterToggleIcon: { fontSize: 18 },
  filterBadge: {
    position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8,
    backgroundColor: S.orange, alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { fontSize: 9, fontFamily: 'Nunito_700Bold', color: '#fff' },

  // Active pills
  activePillsRow: { flexGrow: 0 },
  activePillsContent: { paddingHorizontal: 14, paddingBottom: 8, gap: 6 },
  activePill: { backgroundColor: 'rgba(255,140,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,140,0,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  activePillText: { fontSize: 11, color: '#FF8C00', fontFamily: 'Nunito_700Bold' },
  clearAllBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  clearAllText: { fontSize: 12, color: S.muted, fontFamily: 'Nunito_600SemiBold', textDecorationLine: 'underline' },

  // List
  listContent: { padding: 14, paddingBottom: 24, gap: 10 },
  userCard: {
    backgroundColor: S.card, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: S.border, gap: 10,
  },
  cardTop: { flexDirection: 'row', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 20, fontFamily: 'Nunito_700Bold', color: '#fff' },
  userInfo: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' },
  userName: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: S.text, flex: 1 },
  userEmail: { fontSize: 12, color: S.sub, fontFamily: 'Nunito_400Regular', marginBottom: 2 },
  userTel: { fontSize: 11, color: S.muted, fontFamily: 'Nunito_400Regular' },

  cardMid: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: S.border,
  },
  locWrap: {},
  locText: { fontSize: 11, color: S.muted, fontFamily: 'Nunito_400Regular' },
  saldoWrap: { alignItems: 'flex-end' },
  saldoLabel: { fontSize: 9, color: S.muted, fontFamily: 'Nunito_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.4 },
  saldoValue: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#22C55E' },

  cardFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: S.border, flexWrap: 'wrap',
  },
  dateText: { fontSize: 10, color: S.muted, fontFamily: 'Nunito_400Regular', flex: 1 },
  actionBtns: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: S.sidebar,
    borderWidth: 1, borderColor: S.border, alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 13 },
  delBtn: { borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.08)' },

  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  typePai: { backgroundColor: 'rgba(245,158,11,0.15)' },
  typeCrianca: { backgroundColor: 'rgba(59,130,246,0.15)' },
  typeBadgeText: { fontSize: 10, fontFamily: 'Nunito_700Bold' },

  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusAtivo: { backgroundColor: 'rgba(34,197,94,0.12)' },
  statusInativo: { backgroundColor: 'rgba(239,68,68,0.12)' },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: 'Nunito_700Bold' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 15, color: S.muted, fontFamily: 'Nunito_600SemiBold' },

  // Filter Sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  filterSheet: { backgroundColor: S.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85%', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterSheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: S.border, alignSelf: 'center', marginTop: 12 },
  filterSheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: S.border },
  filterSheetTitle: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: S.text },
  filterSheetBody: { paddingHorizontal: 20 },
  filterSheetFooter: { flexDirection: 'row', gap: 10, padding: 20, borderTopWidth: 1, borderTopColor: S.border },

  filterSec: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: S.border },
  filterSecLabel: { fontSize: 11, color: S.muted, fontFamily: 'Nunito_700Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  filterOpt: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12,
    paddingHorizontal: 14, borderRadius: 12, marginBottom: 4,
    backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border,
  },
  filterOptActive: { backgroundColor: 'rgba(255,140,0,0.1)', borderColor: 'rgba(255,140,0,0.3)' },
  filterOptIcon: { fontSize: 18, width: 22, textAlign: 'center' },
  filterOptText: { flex: 1, fontSize: 14, color: S.sub, fontFamily: 'Nunito_600SemiBold' },
  filterOptCheck: {},

  provGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  provChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border },
  provChipActive: { backgroundColor: 'rgba(255,140,0,0.15)', borderColor: 'rgba(255,140,0,0.3)' },
  provChipText: { fontSize: 12, color: S.sub, fontFamily: 'Nunito_600SemiBold' },

  // Detail Sheet
  detailSheet: { backgroundColor: S.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85%', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 20, paddingBottom: 30 },
  detailSheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: S.border, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  detailAvatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 },
  detailAvatarText: { fontSize: 30, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  detailName: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: S.text, textAlign: 'center', marginBottom: 12 },
  detailBadges: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 20 },
  detailGrid: { gap: 10, marginBottom: 20 },
  detailRow: { backgroundColor: S.sidebar, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: S.border },
  detailLabel: { fontSize: 12, color: S.sub, fontFamily: 'Nunito_600SemiBold', marginBottom: 3 },
  detailValue: { fontSize: 14, color: S.text, fontFamily: 'Nunito_700Bold' },
  closeDetailBtn: { backgroundColor: S.sidebar, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: S.border },
  closeDetailText: { color: S.sub, fontFamily: 'Nunito_600SemiBold', fontSize: 14 },

  // Add/Edit Modal
  modalCard: { backgroundColor: S.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: S.border },
  modalTitle: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: S.text },
  closeBtnText: { fontSize: 18, color: S.muted, padding: 4 },
  modalBody: { paddingHorizontal: 20, paddingTop: 16 },
  modalFooter: { flexDirection: 'row', gap: 10, padding: 20, borderTopWidth: 1, borderTopColor: S.border },

  formField: { marginBottom: 16 },
  formLabel: { fontSize: 11, color: S.sub, fontFamily: 'Nunito_700Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  formInput: { backgroundColor: S.sidebar, borderRadius: 10, borderWidth: 1, borderColor: S.border, color: S.text, fontFamily: 'Nunito_400Regular', fontSize: 14, paddingHorizontal: 14, paddingVertical: 12 },
  segRow: { flexDirection: 'row', gap: 8 },
  seg: { flex: 1, padding: 11, borderRadius: 10, backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border, alignItems: 'center' },
  segActive: { backgroundColor: 'rgba(255,140,0,0.15)', borderColor: 'rgba(255,140,0,0.3)' },
  segText: { fontSize: 13, color: S.sub, fontFamily: 'Nunito_600SemiBold' },

  btnCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: S.sidebar, borderWidth: 1, borderColor: S.border, alignItems: 'center' },
  btnCancelText: { color: S.sub, fontFamily: 'Nunito_600SemiBold', fontSize: 14 },
  btnApply: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: S.orange, alignItems: 'center' },
  btnApplyText: { color: '#fff', fontFamily: 'Nunito_700Bold', fontSize: 14 },
});
