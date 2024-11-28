import { useEffect } from 'react';
import { ref, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { database } from '../services/firebase/config';
import { useAuthStore } from '../stores/useAuthStore';

export const useOnlineStatus = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const userStatusRef = ref(database, `users/${user.uid}/lastActive`);
    const connectedRef = ref(database, '.info/connected');

    const unsubscribe = onDisconnect(userStatusRef).set(serverTimestamp());

    set(userStatusRef, serverTimestamp());

    return () => {
      unsubscribe();
    };
  }, [user]);
};
