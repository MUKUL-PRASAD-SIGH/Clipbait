import { create } from 'zustand';
import { User, ApiResponse } from '../../../shared/types';
import toast from 'react-hot-toast';
import FirebaseAuthService from '../services/firebaseAuth';
import apiService, { api } from '../services/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ loading: false, isAuthenticated: false });
        return;
      }

      // Verify token and get user info
      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: ApiResponse<User> = response.data;
      if (data.success && data.data) {
        set({ 
          user: data.data, 
          isAuthenticated: true, 
          loading: false 
        });
      } else {
        localStorage.removeItem('token');
        set({ loading: false, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      localStorage.removeItem('token');
      set({ 
        loading: false, 
        isAuthenticated: false, 
        error: 'Failed to initialize authentication' 
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const data: ApiResponse<{ user: User; token: string }> = response.data;
      
      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.data) {
        localStorage.setItem('token', data.data.token);
        set({ 
          user: data.data.user, 
          isAuthenticated: true, 
          loading: false 
        });
        toast.success('Login successful');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      toast.error(errorMessage);
    }
  },

  register: async (email: string, password: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post('/auth/register', { email, password });
      const data: ApiResponse<{ user: User; token: string }> = response.data;
      
      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.data) {
        localStorage.setItem('token', data.data.token);
        set({ 
          user: data.data.user, 
          isAuthenticated: true, 
          loading: false 
        });
        toast.success('Registration successful');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      toast.error(errorMessage);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ 
      user: null, 
      isAuthenticated: false, 
      loading: false, 
      error: null 
    });
    toast.success('Logged out successfully');
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    
    try {
      const result = await FirebaseAuthService.signInWithGoogle();
      
      // Send Firebase token to backend for verification and user creation
      const response = await api.post('/auth/firebase', { 
        firebaseToken: result.token,
        email: result.user.email,
        displayName: result.user.displayName
      });

      const data: ApiResponse<{ user: User; token: string }> = response.data;
      
      if (!data.success) {
        throw new Error(data.error || 'Google sign-in failed');
      }

      if (data.data) {
        localStorage.setItem('token', data.data.token);
        set({ 
          user: data.data.user, 
          isAuthenticated: true, 
          loading: false 
        });
        toast.success('Google sign-in successful');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      toast.error(errorMessage);
    }
  },

  loginWithGitHub: async () => {
    set({ loading: true, error: null });
    
    try {
      const result = await FirebaseAuthService.signInWithGitHub();
      
      // Send Firebase token to backend for verification and user creation
      const response = await api.post('/auth/firebase', { 
        firebaseToken: result.token,
        email: result.user.email,
        displayName: result.user.displayName
      });

      const data: ApiResponse<{ user: User; token: string }> = response.data;
      
      if (!data.success) {
        throw new Error(data.error || 'GitHub sign-in failed');
      }

      if (data.data) {
        localStorage.setItem('token', data.data.token);
        set({ 
          user: data.data.user, 
          isAuthenticated: true, 
          loading: false 
        });
        toast.success('GitHub sign-in successful');
      }
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'GitHub sign-in failed';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      toast.error(errorMessage);
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    set({ loading: true, error: null });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await api.put('/auth/profile', updates, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: ApiResponse<User> = response.data;
      
      if (!data.success) {
        throw new Error(data.error || 'Profile update failed');
      }

      if (data.data) {
        set({ 
          user: data.data, 
          loading: false 
        });
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      set({ 
        loading: false, 
        error: errorMessage 
      });
      toast.error(errorMessage);
    }
  }
}));