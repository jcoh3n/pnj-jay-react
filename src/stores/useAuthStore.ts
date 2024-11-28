import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/firebase/config';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      set({ user: null, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        set({ user: JSON.parse(storedUser) });
      }

      return new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            const user = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            };
            AsyncStorage.setItem('user', JSON.stringify(user));
            set({ user, initialized: true });
          } else {
            AsyncStorage.removeItem('user');
            set({ user: null, initialized: true });
          }
          unsubscribe();
          resolve();
        });
      });
    } catch (error) {
      console.error('Error checking auth state:', error);
      set({ initialized: true });
    }
  },
}));
