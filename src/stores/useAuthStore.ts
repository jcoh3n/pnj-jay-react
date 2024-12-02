import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, database } from '../services/firebase/config';
import { ref, set as dbSet, onValue, get as dbGet, off } from 'firebase/database';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  status?: string;
}

interface ProfileUpdate {
  displayName?: string;
  photoURL?: string | null;
  status?: string;
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
  updateProfile: (update: ProfileUpdate) => Promise<void>;
  subscribeToUserUpdates: (uid: string) => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  subscribeToUserUpdates: (uid: string) => {
    const userRef = ref(database, `users/${uid}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            ...userData,
            uid, // Conserver l'uid original
          };
          
          // Mise à jour du stockage local
          AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Mise à jour de l'état
          set({ user: updatedUser });
        }
      }
    });

    return () => {
      off(userRef);
    };
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      const userRef = ref(database, `users/${result.user.uid}`);
      const snapshot = await dbGet(userRef);
      const userData = snapshot.val() || {};
      
      const user: User = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || userData.displayName,
        photoURL: result.user.photoURL || userData.photoURL,
        status: userData.status || 'Available'
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, loading: false });

      // Démarrer l'écoute des mises à jour
      get().subscribeToUserUpdates(user.uid);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      const user: User = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        status: 'Available'
      };

      const userRef = ref(database, `users/${user.uid}`);
      await dbSet(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        status: user.status,
        createdAt: new Date().toISOString()
      });
      
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, loading: false });

      get().subscribeToUserUpdates(user.uid);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateProfile: async (update: ProfileUpdate) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    try {
      set({ loading: true, error: null });
      
      // Mise à jour optimiste du state local pour une meilleure UX
      const optimisticUser = { ...user, ...update };
      set({ user: optimisticUser });

      // Mise à jour Firebase Auth si nécessaire
      if (update.displayName || update.photoURL !== undefined) {
        if (auth.currentUser) {
          await updateFirebaseProfile(auth.currentUser, {
            displayName: update.displayName,
            photoURL: update.photoURL || null
          });
        }
      }

      // Mise à jour Realtime Database
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await dbGet(userRef);
      const currentData = snapshot.val() || {};
      
      await dbSet(userRef, {
        ...currentData,
        ...update,
        lastUpdated: new Date().toISOString()
      });

      // Mettre à jour le stockage local
      const updatedUser = { ...user, ...update };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      set({ loading: false });
    } catch (error) {
      // En cas d'erreur, restaurer l'état précédent
      set({ user, error: (error as Error).message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      const { user } = get();
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        off(userRef); // Arrêter l'écoute des mises à jour
      }
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
        const parsedUser = JSON.parse(storedUser) as User;
        set({ user: parsedUser });
        get().subscribeToUserUpdates(parsedUser.uid);
      }

      return new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const userRef = ref(database, `users/${firebaseUser.uid}`);
            const snapshot = await dbGet(userRef);
            const userData = snapshot.val() || {};

            const user: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || userData.displayName,
              photoURL: firebaseUser.photoURL || userData.photoURL,
              status: userData.status || 'Available',
            };
            
            await AsyncStorage.setItem('user', JSON.stringify(user));
            set({ user, initialized: true });
            
            get().subscribeToUserUpdates(user.uid);
          } else {
            await AsyncStorage.removeItem('user');
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