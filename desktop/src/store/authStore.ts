import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  initialize: async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const user = await authApi.getCurrentUser();
        set({ user, isAuthenticated: true });
      } catch (error) {
        localStorage.removeItem('auth_token');
        set({ user: null, isAuthenticated: false });
      }
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authApi.login(email, password);
      localStorage.setItem('auth_token', token);
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authApi.register(email, password);
      localStorage.setItem('auth_token', token);
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  }
}));