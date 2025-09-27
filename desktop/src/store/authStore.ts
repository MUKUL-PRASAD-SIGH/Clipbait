import { create } from 'zustand';
import { User } from '../types';
import FirebaseAuthService from '../services/firebaseAuth';
import toast from 'react-hot-toast';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading for backward compatibility

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
  firebaseUid: firebaseUser.uid,
  preferences: {
    enableNotifications: true,
    autoSync: true,
    maxHistoryItems: 100,
    enableAI: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  loading: false,

  initialize: async () => {
    set({ isLoading: true, loading: true });

    // Set up Firebase auth state listener
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user = convertFirebaseUser(firebaseUser);
        set({ user, isAuthenticated: true, isLoading: false, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false, loading: false });
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
      // Clear local storage first
      localStorage.removeItem('auth_token');
      // Clear Firebase auth cache (try common patterns)
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('firebase:authUser:')) {
          localStorage.removeItem(key);
        }
      });

      // Sign out from Firebase
      await FirebaseAuthService.signOut();

      // Force clear state
      set({ user: null, isAuthenticated: false, isLoading: false, loading: false });

      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);

      // Force logout even if Firebase logout fails
      localStorage.clear(); // Clear all localStorage
      set({ user: null, isAuthenticated: false, isLoading: false, loading: false });

      toast.success('Logged out successfully');
    }
  }
}));