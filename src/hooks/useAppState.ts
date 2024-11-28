import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { ref, set, serverTimestamp } from 'firebase/database';
import { database } from '../services/firebase/config';
import { useAuthStore } from '../stores/useAuthStore';

export const useAppState = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const isActive = Platform.OS === 'ios' 
        ? nextAppState === 'active'
        : nextAppState.match(/active/);

      if (user) {
        const userStatusRef = ref(database, `users/${user.uid}/lastActive`);
        set(userStatusRef, isActive ? serverTimestamp() : new Date().toISOString());
      }
    });

    return () => {
      subscription.remove();
    };
  }, [user]);
};
