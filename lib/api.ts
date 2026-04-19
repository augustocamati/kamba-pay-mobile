import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL Configuration
// Em dev você pode usar o localhost (no simulador: 10.0.2.2 para Android) ou variável ambiente
// EXPO_PUBLIC_API_URL.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.103:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o token em todas as requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('kamba_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Falha ao obter token do storage", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor global para lidar com sessões expiradas (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Limpar o token apenas se a requisição indicar não autenticado (exatamente como diz no contrato)
      const data = error.response?.data;
      if (data?.erro === 'NAO_AUTENTICADO') {
         await AsyncStorage.removeItem('kamba_token');
         await AsyncStorage.removeItem('kamba_user');
         // E idealmente redirecionar para '/' (handled na root view normalmente via Router)
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// Auth Services
// ============================================

export const authService = {
  me: () => api.get('/auth/me').then(res => res.data),
  login: (email: string, senha: string) => api.post('/auth/login', { email, senha }).then(res => res.data),
  register: (data: { nome: string, email: string, senha: string, tipo: string, provincia: string, municipio: string, telefone: string }) => api.post('/auth/register', data).then(res => res.data),
  logout: () => api.post('/auth/logout').then(res => res.data),
};

// ============================================
// Parent Services (Responsável)
// ============================================

export const parentService = {
  getDashboard: () => api.get('/parent/dashboard').then(res => res.data),
  getChildStats: (childId: string, params?: { periodo?: string, data?: string }) => api.get(`/parent/children/${childId}/stats`, { params }).then(res => res.data),
  addChild: (data: { nome: string, idade: number, username: string, pin: string, distribuicao_potes?: any, provincia?: string, municipio?: string }) => 
    api.post('/parent/children', data).then(res => res.data),
  updateChild: (childId: string, data: { nome?: string, idade?: number }) => api.patch(`/parent/children/${childId}`, data).then(res => res.data),
  updatePotesConfig: (childId: string, data: { gastar_pct: number, poupar_pct: number, ajudar_pct: number }) => api.patch(`/parent/children/${childId}/potes-config`, data).then(res => res.data),
  getChildren: () => api.get('/parent/children').then(res => res.data),
  addBalance: (childId: string, valor: number, pote: string, descricao: string) => 
    api.post(`/parent/children/${childId}/add-balance`, { valor, pote, descricao }).then(res => res.data),
  getChildFinance: (childId: string) => api.get(`/parent/children/${childId}/finance`).then(res => res.data),
  getTransacoes: (childId: string, params?: { inicio?: string, fim?: string, tipo?: string }) => api.get(`/parent/children/${childId}/transacoes`, { params }).then(res => res.data),
  getResumoMensal: (childId: string, ano?: number) => api.get(`/parent/children/${childId}/resumo-mensal`, { params: { ano } }).then(res => res.data),
};

// ============================================
// Tasks Services (Tarefas)
// ============================================

export const taskService = {
  createTask: (data: any) => api.post('/tasks', data).then(res => res.data),
  getTasks: (params?: any) => api.get('/tasks', { params }).then(res => res.data),
  approveTask: (taskId: string) => api.patch(`/tasks/${taskId}/approve`).then(res => res.data),
  rejectTask: (taskId: string, motivo?: string) => api.patch(`/tasks/${taskId}/reject`, { motivo }).then(res => res.data),
  submitTask: (taskId: string, data: FormData | { foto_base64: string }) => {
    // Definir cabeçalho dependendo de ser FormData ou JSON
    const isFormData = data instanceof FormData;
    return api.patch(`/child/tasks/${taskId}/submit`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    }).then(res => res.data);
  },
};

// ============================================
// Missions Services (Missões)
// ============================================

export const missionService = {
  createMission: (data: any) => api.post('/missions', data).then(res => res.data),
  getMissionsParent: (params?: any) => api.get('/missions', { params }).then(res => res.data),
  updateProgress: (missionId: string, novo_progresso: number) => api.patch(`/missions/${missionId}/progress`, { novo_progresso }).then(res => res.data),
  getMissionsChild: (tipo?: string) => api.get('/child/missions', { params: { tipo } }).then(res => res.data),
};

// ============================================
// Campaigns & Donations Services
// ============================================

export const campaignService = {
  createCampaign: (data: any) => api.post('/campaigns', data).then(res => res.data),
  getCampaigns: (ativa: boolean = true) => api.get('/campaigns', { params: { ativa } }).then(res => res.data),
  donate: (campanha_id: string, valor: number) => api.post('/child/donations', { campanha_id, valor }).then(res => res.data),
};

// ============================================
// Educational & Avatar/Shop Services
// ============================================

export const childService = {
  getDashboard: () => api.get('/child/dashboard').then(res => res.data),
};

export const educationalService = {
  getContent: (faixa_etaria?: string) => api.get('/educational-content', { params: { faixa_etaria } }).then(res => res.data),
  completeContent: (contentId: string) => api.patch(`/educational-content/${contentId}/complete`).then(res => res.data),
  getQuizDetails: (missaoId: string | number) => api.get(`/educational-content/quiz/${missaoId}`).then(res => res.data),
  submitQuiz: (quizId: string | number, id_opcao: number) => api.post(`/educational-content/quiz/${quizId}/submit`, { id_opcao }).then(res => res.data),
};

export const shopService = {
  getItems: (crianca_id: string) => api.get('/shop/items', { params: { crianca_id } }).then(res => res.data),
  purchaseItem: (item_id: string, crianca_id: string) => api.post('/shop/purchase', { item_id, crianca_id }).then(res => res.data),
  updateAvatar: (data: any) => api.put('/child/avatar', data).then(res => res.data),
};

// ============================================
// Reports Services
// ============================================

export const reportService = {
  getProgress: (crianca_id: string, periodo: string) => api.get('/reports/progress', { params: { crianca_id, periodo } }).then(res => res.data),
};

// ============================================
// Admin Services
// ============================================

export const adminService = {
  // Auth
  login: (email: string, senha: string) => api.post('/admin/auth/login', { email, senha }).then(res => res.data),
  me: () => api.get('/admin/auth/me').then(res => res.data),

  // Dashboard & Stats
  getDashboard: () => api.get('/admin/dashboard').then(res => res.data),
  getStats: (periodo: string) => api.get('/admin/stats', { params: { periodo } }).then(res => res.data),

  // Users (Responsáveis)
  getResponsaveis: (params?: any) => api.get('/admin/utilizadores/responsaveis', { params }).then(res => res.data),
  getResponsavelDependentes: (id: string) => api.get(`/admin/utilizadores/responsaveis/${id}/dependentes`).then(res => res.data),
  updateResponsavel: (id: string, data: any) => api.put(`/admin/utilizadores/responsaveis/${id}`, data).then(res => res.data),
  updateStatusResponsavel: (id: string, status: 'Ativo' | 'Inativo') => {
    const endpoint = status === 'Ativo' ? 'ativar' : 'desativar';
    return api.patch(`/admin/utilizadores/responsaveis/${id}/${endpoint}`).then(res => res.data);
  },
  deleteResponsavel: (id: string) => api.delete(`/admin/utilizadores/responsaveis/${id}`).then(res => res.data),

  // Users (Crianças)
  getCriancas: (params?: any) => api.get('/admin/utilizadores/criancas', { params }).then(res => res.data),
  getCriancaResponsavel: (id: string) => api.get(`/admin/utilizadores/criancas/${id}/responsavel`).then(res => res.data),
  updateCrianca: (id: string, data: any) => api.put(`/admin/utilizadores/criancas/${id}`, data).then(res => res.data),
  updateStatusCrianca: (id: string, status: string) => api.patch(`/admin/utilizadores/criancas/${id}/status`, { status }).then(res => res.data),
  deleteCrianca: (id: string) => api.delete(`/admin/utilizadores/criancas/${id}`).then(res => res.data),

  // Tasks
  getTasks: (params?: any) => api.get('/admin/tarefas', { params }).then(res => res.data),
  createTask: (data: any) => api.post('/admin/tarefas', data).then(res => res.data),
  updateTask: (id: string, data: any) => api.put(`/admin/tarefas/${id}`, data).then(res => res.data),
  updateTaskStatus: (id: string, status: string) => api.patch(`/admin/tarefas/${id}/status`, { status }).then(res => res.data),
  deleteTask: (id: string) => api.delete(`/admin/tarefas/${id}`).then(res => res.data),
  getCriancasParaTarefas: () => api.get('/admin/criancas/para-tarefas').then(res => res.data),

  // Quizzes
  getQuizzes: () => api.get('/admin/quizzes').then(res => res.data),
  createQuiz: (data: any) => api.post('/admin/quizzes', data).then(res => res.data),
  updateQuiz: (id: string, data: any) => api.put(`/admin/quizzes/${id}`, data).then(res => res.data),
  deleteQuiz: (id: string) => api.delete(`/admin/quizzes/${id}`).then(res => res.data),

  // Vídeos (Conteúdo)
  getVideos: (params?: any) => api.get('/admin/videos', { params }).then(res => res.data),
  getVideosStats: () => api.get('/admin/videos/estatisticas').then(res => res.data),
  createVideo: (data: any) => api.post('/admin/videos', data).then(res => res.data),
  updateVideo: (id: string, data: any) => api.put(`/admin/videos/${id}`, data).then(res => res.data),
  deleteVideo: (id: string) => api.delete(`/admin/videos/${id}`).then(res => res.data),
};
