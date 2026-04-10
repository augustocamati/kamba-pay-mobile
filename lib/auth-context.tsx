import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, api } from './api';
import { DEMO_PARENT, DEMO_CHILD_USER } from './demo-data';

export type UserRole = 'parent' | 'child';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role: UserRole;
  avatar?: string;
  isDemo?: boolean;
}

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  enterDemo: (role: 'parent' | 'child') => void;
  exitDemo: () => void;
  register: (name: string, email: string, password: string, role: UserRole, provincia?: string, municipio?: string, telefone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('kamba_token');
      if (token) {
        try {
          const res = await authService.me();
          setUser({
            id: res.id,
            name: res.nome,
            role: res.tipo === 'crianca' ? 'child' : 'parent',
            email: res.email
          });
        } catch (e) {
          const usrStr = await AsyncStorage.getItem('kamba_user');
          if (usrStr) setUser(JSON.parse(usrStr));
        }
      }
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authService.login(email, password);
      const newUser: UserProfile = {
        id: res.usuario.id,
        name: res.usuario.nome,
        role: res.usuario.tipo === 'responsavel' || res.usuario.tipo === 'pai' ? 'parent' : 'child',
        email: res.usuario.email,
        username: res.usuario.username
      };
      setUser(newUser);
      await AsyncStorage.setItem('kamba_token', res.token);
      await AsyncStorage.setItem('kamba_user', JSON.stringify(newUser));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const enterDemo = (role: 'parent' | 'child') => {
    const demoUser: UserProfile = role === 'parent'
      ? { ...DEMO_PARENT, isDemo: true }
      : { ...DEMO_CHILD_USER, isDemo: true };
    setUser(demoUser);
    setIsDemo(true);
  };

  const exitDemo = () => {
    setUser(null);
    setIsDemo(false);
  };

  const register = async (name: string, email: string, password: string, role: UserRole, provincia = 'Luanda', municipio = 'Viana', telefone = '000000000'): Promise<boolean> => {
    try {
      const res = await authService.register({
        nome: name, email, senha: password,
        tipo: role === 'child' ? 'crianca' : 'pai',
        provincia, municipio, telefone
      });
      const newUser: UserProfile = {
        id: res.usuario.id,
        name: res.usuario.nome,
        role: 'parent',
        email: res.usuario.email
      };
      setUser(newUser);
      await AsyncStorage.setItem('kamba_token', res.token);
      await AsyncStorage.setItem('kamba_user', JSON.stringify(newUser));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = async () => {
    if (isDemo) {
      exitDemo();
      return;
    }
    try { await authService.logout(); } catch(e) {}
    setUser(null);
    await AsyncStorage.removeItem('kamba_token');
    await AsyncStorage.removeItem('kamba_user');
  };

  const refreshUser = async () => {
    await loadData();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isDemo, login, enterDemo, exitDemo, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
