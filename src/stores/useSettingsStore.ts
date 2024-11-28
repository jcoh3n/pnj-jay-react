import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../services/firebase/config';
import { ref, update } from 'firebase/database';
import { useAuthStore } from './useAuthStore';

interface Settings {
  darkMode: boolean;
  notifications: boolean;
  language: 'en' | 'fr';
  soundEnabled: boolean;
}

interface SettingsState {
  settings: Settings;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  darkMode: true,
  notifications: true,
  language: 'en',
  soundEnabled: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,
  error: null,
  initialized: false,

  loadSettings: async () => {
    try {
      set({ loading: true, error: null });
      const stored = await AsyncStorage.getItem('userSettings');
      if (stored) {
        set({ settings: JSON.parse(stored), initialized: true });
      }
      set({ loading: false, initialized: true });
    } catch (error) {
      set({ error: (error as Error).message, loading: false, initialized: true });
    }
  },

  updateSettings: async (newSettings) => {
    const { user } = useAuthStore.getState();
    try {
      set({ loading: true, error: null });
      const updatedSettings = { ...get().settings, ...newSettings };
      
      // Sauvegarder localement
      await AsyncStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      
      // Sauvegarder dans Firebase si connecté
      if (user) {
        const userSettingsRef = ref(database, `users/${user.uid}/settings`);
        await update(userSettingsRef, newSettings);
      }
      
      set({ settings: updatedSettings, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
