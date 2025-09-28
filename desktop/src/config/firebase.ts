import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
// Note: These are public configuration values, not secrets
const firebaseConfig = {
  apiKey: "AIzaSyC7w5P50YjpTBv7ZVeI1XfRBDMAtpF4GJE",
  authDomain: "epitychia-4712f.firebaseapp.com",
  projectId: "epitychia-4712f",
  storageBucket: "epitychia-4712f.firebasestorage.app",
  messagingSenderId: "486630077358",
  appId: "1:486630077358:web:8a082bcfa127d05887ce3f",
  measurementId: "G-EREJG8Z1LD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Configure Google provider
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Configure GitHub provider
githubProvider.addScope('user:email');

export default app;