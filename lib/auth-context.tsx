import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export type UserRole = 'parent' | 'child';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  parentId?: string;
  level: number;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  assignedTo: string;
  createdBy: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  photoUri?: string;
  category: 'save' | 'spend' | 'help';
  createdAt: string;
  completedAt?: string;
}

export interface Mission {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  childId: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  createdBy: string;
  createdAt: string;
}

interface WalletBreakdown {
  save: number;
  spend: number;
  help: number;
}
  
interface AuthContextValue {
  user: UserProfile | null;
  children: UserProfile[];
  tasks: Task[];
  missions: Mission[];
  campaigns: Campaign[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  addChild: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'createdBy'>) => Promise<void>;
  submitTask: (taskId: string, photoUri: string) => Promise<void>;
  approveTask: (taskId: string) => Promise<void>;
  rejectTask: (taskId: string) => Promise<void>;
  createMission: (mission: Omit<Mission, 'id' | 'createdAt' | 'currentAmount'>) => Promise<void>;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'currentAmount' | 'createdBy'>) => Promise<void>;
  getWallet: (childId: string) => WalletBreakdown;
  getChildBalance: (childId: string) => number;
  getMonthlyStats: (childId?: string) => { tasksCompleted: number; savingsRate: number; totalEarned: number };
  getMonthlyBreakdown: (childId?: string) => WalletBreakdown;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEYS = {
  USER: 'kamba_user',
  USERS: 'kamba_users',
  TASKS: 'kamba_tasks',
  MISSIONS: 'kamba_missions',
  CAMPAIGNS: 'kamba_campaigns',
};

export function AuthProvider({ children: childrenProp }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, usersData, tasksData, missionsData, campaignsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.USERS),
        AsyncStorage.getItem(STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(STORAGE_KEYS.MISSIONS),
        AsyncStorage.getItem(STORAGE_KEYS.CAMPAIGNS),
      ]);
      if (userData) setUser(JSON.parse(userData));
      
      let parsedUsers: UserProfile[] = [];
      if (usersData) {
        parsedUsers = JSON.parse(usersData);
      }
      
      // Garante que as contas de teste existem sempre
      const hasTestParent = parsedUsers.some(u => u.email === 'pai@teste.com');
      const hasTestChild = parsedUsers.some(u => u.email === 'filho@teste.com');
      
      let needsSave = false;
      
      if (!hasTestParent) {
        parsedUsers.push({
          id: 'pai-teste',
          name: 'Pai Kamba',
          email: 'pai@teste.com',
          role: 'parent',
          level: 1,
          avatar: 'parent',
        });
        needsSave = true;
      }
      
      if (!hasTestChild) {
        parsedUsers.push({
          id: 'filho-teste',
          name: 'Filho Kamba',
          email: 'filho@teste.com',
          role: 'child',
          parentId: 'pai-teste',
          level: 5,
          avatar: 'child',
        });
        needsSave = true;
      }
      
      if (needsSave) {
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsedUsers));
      }
      
      setAllUsers(parsedUsers);
      
      if (tasksData) setTasks(JSON.parse(tasksData));
      if (missionsData) setMissions(JSON.parse(missionsData));
      if (campaignsData) setCampaigns(JSON.parse(campaignsData));
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUsers = async (users: UserProfile[]) => {
    setAllUsers(users);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  };

  const saveTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
  };

  const saveMissions = async (newMissions: Mission[]) => {
    setMissions(newMissions);
    await AsyncStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(newMissions));
  };

  const saveCampaigns = async (newCampaigns: Campaign[]) => {
    setCampaigns(newCampaigns);
    await AsyncStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(newCampaigns));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(found));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    const exists = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;

    const newUser: UserProfile = {
      id: Crypto.randomUUID(),
      name,
      email,
      role,
      level: 1,
      avatar: role === 'parent' ? 'parent' : 'child',
    };

    const updated = [...allUsers, newUser];
    await saveUsers(updated);
    setUser(newUser);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    return true;
  };

  const addChild = async (name: string) => {
    if (!user) return;
    const childProfile: UserProfile = {
      id: Crypto.randomUUID(),
      name,
      email: `${name.toLowerCase().replace(/\s/g, '')}@child.kamba`,
      role: 'child',
      parentId: user.id,
      level: 1,
      avatar: 'child',
    };
    const updated = [...allUsers, childProfile];
    await saveUsers(updated);
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  };

  const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'createdBy'>) => {
    if (!user) return;
    const newTask: Task = {
      ...task,
      id: Crypto.randomUUID(),
      createdBy: user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await saveTasks([...tasks, newTask]);
  };

  const submitTask = async (taskId: string, photoUri: string) => {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, status: 'submitted' as const, photoUri } : t
    );
    await saveTasks(updated);
  };

  const approveTask = async (taskId: string) => {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, status: 'approved' as const, completedAt: new Date().toISOString() } : t
    );
    await saveTasks(updated);
  };

  const rejectTask = async (taskId: string) => {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, status: 'rejected' as const, photoUri: undefined } : t
    );
    await saveTasks(updated);
  };

  const createMission = async (mission: Omit<Mission, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newMission: Mission = {
      ...mission,
      id: Crypto.randomUUID(),
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    };
    await saveMissions([...missions, newMission]);
  };

  const createCampaign = async (campaign: Omit<Campaign, 'id' | 'createdAt' | 'currentAmount' | 'createdBy'>) => {
    if (!user) return;
    const newCampaign: Campaign = {
      ...campaign,
      id: Crypto.randomUUID(),
      createdBy: user.id,
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    };
    await saveCampaigns([...campaigns, newCampaign]);
  };

  const getWallet = (childId: string): WalletBreakdown => {
    const approved = tasks.filter(t => t.assignedTo === childId && t.status === 'approved');
    return {
      save: approved.filter(t => t.category === 'save').reduce((sum, t) => sum + t.reward, 0),
      spend: approved.filter(t => t.category === 'spend').reduce((sum, t) => sum + t.reward, 0),
      help: approved.filter(t => t.category === 'help').reduce((sum, t) => sum + t.reward, 0),
    };
  };

  const getChildBalance = (childId: string): number => {
    const wallet = getWallet(childId);
    return wallet.save + wallet.spend + wallet.help;
  };

  const getMonthlyStats = (childId?: string) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    let monthTasks = tasks.filter(t => t.completedAt && t.completedAt >= monthStart && t.status === 'approved');
    if (childId) monthTasks = monthTasks.filter(t => t.assignedTo === childId);

    const totalEarned = monthTasks.reduce((sum, t) => sum + t.reward, 0);
    const saved = monthTasks.filter(t => t.category === 'save').reduce((sum, t) => sum + t.reward, 0);

    return {
      tasksCompleted: monthTasks.length,
      savingsRate: totalEarned > 0 ? Math.round((saved / totalEarned) * 100) : 0,
      totalEarned,
    };
  };

  const getMonthlyBreakdown = (childId?: string): WalletBreakdown => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    let monthTasks = tasks.filter(t => t.completedAt && t.completedAt >= monthStart && t.status === 'approved');
    if (childId) monthTasks = monthTasks.filter(t => t.assignedTo === childId);

    return {
      save: monthTasks.filter(t => t.category === 'save').reduce((sum, t) => sum + t.reward, 0),
      spend: monthTasks.filter(t => t.category === 'spend').reduce((sum, t) => sum + t.reward, 0),
      help: monthTasks.filter(t => t.category === 'help').reduce((sum, t) => sum + t.reward, 0),
    };
  };

  const childrenList = useMemo(() => {
    if (!user) return [];
    if (user.role === 'parent') {
      return allUsers.filter(u => u.parentId === user.id);
    }
    return [];
  }, [user, allUsers]);

  const value = useMemo(() => ({
    user,
    children: childrenList,
    tasks,
    missions,
    campaigns,
    isLoading,
    login,
    register,
    addChild,
    logout,
    createTask,
    submitTask,
    approveTask,
    rejectTask,
    createMission,
    createCampaign,
    getWallet,
    getChildBalance,
    getMonthlyStats,
    getMonthlyBreakdown,
  }), [user, childrenList, tasks, missions, campaigns, isLoading, allUsers]);

  return (
    <AuthContext.Provider value={value}>
      {childrenProp}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
