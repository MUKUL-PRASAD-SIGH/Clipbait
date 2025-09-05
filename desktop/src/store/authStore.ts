import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../services/api';
import FirebaseAuthService from '../services/firebaseAuth';
import toast from 'react-hot-toast';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
}

// Helper function to convert Firebase user to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  id: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
  avatar: firebaseUser.photoURL || undefined,
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  initialize: async () => {
    set({ isLoading: true });
    
    // Set up Firebase auth state listener
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user = convertFirebaseUser(firebaseUser);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    // Store unsubscribe function for cleanup if needed
    (window as any).__authUnsubscribe = unsubscribe;
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user: firebaseUser, token } = await FirebaseAuthService.signInWithEmail(email, password);
      const user = convertFirebaseUser(firebaseUser);
      localStorage.setItem('auth_token', token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error; // Error is already handled in FirebaseAuthService with toast
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user: firebaseUser, token } = await FirebaseAuthService.registerWithEmail(email, password);
      const user = convertFirebaseUser(firebaseUser);
      localStorage.setItem('auth_token', token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error; // Error is already handled in FirebaseAuthService with toast
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const { user: firebaseUser, token } = await FirebaseAuthService.signInWithGoogle();
      const user = convertFirebaseUser(firebaseUser);
      localStorage.setItem('auth_token', token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error; // Error is already handled in FirebaseAuthService with toast
    }
  },

  loginWithGitHub: async () => {
    set({ isLoading: true });
    try {
      const { user: firebaseUser, token } = await FirebaseAuthService.signInWithGitHub();
      const user = convertFirebaseUser(firebaseUser);
      localStorage.setItem('auth_token', token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error; // Error is already handled in FirebaseAuthService with toast
    }
  },

  logout: async () => {
    try {
      await FirebaseAuthService.signOut();
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false });
    } catch (error: any) {
      // Force logout even if Firebase logout fails
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false });
      toast.success('Logged out successfully');
    }
  }
}));