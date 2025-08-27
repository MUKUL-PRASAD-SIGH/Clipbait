import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { User } from '../types';
import { authApi } from '../services/api';

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
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const user = await authApi.getCurrentUser();
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      await AsyncStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authApi.login(email, password);
      await AsyncStorage.setItem('auth_token', token);
      set({ user, isAuthenticated: true, isLoading: false });
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: error.message || 'Please try again',
      });
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authApi.register(email, password);
      await AsyncStorage.setItem('auth_token', token);
      set({ user, isAuthenticated: true, isLoading: false });
      Toast.show({
        type: 'success',
        text1: 'Account created successfully!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration failed',
        text2: error.message || 'Please try again',
      });
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false });
    Toast.show({
      type: 'success',
      text1: 'Logged out successfully',
    });
  }
}));