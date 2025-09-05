import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../config/firebase';
import toast from 'react-hot-toast';

export interface AuthResult {
  user: FirebaseUser;
  token: string;
}

export class FirebaseAuthService {
  // Google Sign-In
  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      toast.success(`Welcome, ${result.user.displayName || result.user.email}!`);
      
      return {
        user: result.user,
        token
      };
    } catch (error) {
      const authError = error as AuthError;
      console.error('Google sign-in error:', authError);
      
      let errorMessage = 'Google sign-in failed';
      
      switch (authError.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup blocked. Please allow popups for this site';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in cancelled';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = authError.message || 'Google sign-in failed';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // GitHub Sign-In
  static async signInWithGitHub(): Promise<AuthResult> {
    try {
      const result: UserCredential = await signInWithPopup(auth, githubProvider);
      const token = await result.user.getIdToken();
      
      toast.success(`Welcome, ${result.user.displayName || result.user.email}!`);
      
      return {
        user: result.user,
        token
      };
    } catch (error) {
      const authError = error as AuthError;
      console.error('GitHub sign-in error:', authError);
      
      let errorMessage = 'GitHub sign-in failed';
      
      switch (authError.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup blocked. Please allow popups for this site';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Account exists with different sign-in method';
          break;
        default:
          errorMessage = authError.message || 'GitHub sign-in failed';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Email/Password Sign-In
  static async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      
      toast.success('Welcome back!');
      
      return {
        user: result.user,
        token
      };
    } catch (error) {
      const authError = error as AuthError;
      console.error('Email sign-in error:', authError);
      
      let errorMessage = 'Sign-in failed';
      
      switch (authError.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = authError.message || 'Sign-in failed';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Email/Password Registration
  static async registerWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      
      toast.success('Account created successfully!');
      
      return {
        user: result.user,
        token
      };
    } catch (error) {
      const authError = error as AuthError;
      console.error('Registration error:', authError);
      
      let errorMessage = 'Registration failed';
      
      switch (authError.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email registration is not enabled';
          break;
        default:
          errorMessage = authError.message || 'Registration failed';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Sign Out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error('Sign-out failed');
      throw error;
    }
  }

  // Auth State Listener
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Get Current User Token
  static async getCurrentUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      try {
        return await user.getIdToken();
      } catch (error) {
        console.error('Failed to get user token:', error);
        return null;
      }
    }
    return null;
  }

  // Get Current User
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}

export default FirebaseAuthService;