#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Configuration des services de base de données et hooks...${NC}"

# Création des dossiers nécessaires
mkdir -p src/hooks src/services/api

# Configuration du service de base de données
cat > src/services/api/database.ts << 'EOL'
import { database } from '../firebase/config';
import { ref, onValue, off, get, query, orderByChild, equalTo } from 'firebase/database';
import type { Chat, Message } from '../../types';

export const subscribeToChats = (
  userId: string,
  onUpdate: (chats: Chat[]) => void,
  onError: (error: Error) => void
) => {
  const chatsRef = ref(database, 'chats');
  
  const unsubscribe = onValue(chatsRef, 
    async (snapshot) => {
      try {
        const chatsData = snapshot.val();
        if (!chatsData) {
          onUpdate([]);
          return;
        }

        const chats: Chat[] = [];
        
        for (const [chatId, chat] of Object.entries<any>(chatsData)) {
          if (chat.participants?.[userId]) {
            // Get other participant info
            const otherParticipantId = Object.keys(chat.participants)
              .find(id => id !== userId);

            if (otherParticipantId) {
              const userRef = ref(database, `users/${otherParticipantId}`);
              const userSnapshot = await get(userRef);
              const userData = userSnapshot.val();

              if (userData) {
                chats.push({
                  id: chatId,
                  name: userData.displayName || userData.email,
                  avatar: userData.photoURL,
                  lastMessage: chat.lastMessage?.content || '',
                  lastMessageTime: chat.lastMessage?.timestamp || chat.createdAt,
                  participants: chat.participants,
                  online: !!userData.lastActive && 
                    (Date.now() - new Date(userData.lastActive).getTime()) < 300000,
                  unreadCount: 0,
                });
              }
            }
          }
        }

        onUpdate(chats);
      } catch (error) {
        onError(error as Error);
      }
    },
    (error) => onError(error as Error)
  );

  return () => off(chatsRef, 'value');
};

export const subscribeToMessages = (
  chatId: string,
  onUpdate: (messages: Message[]) => void,
  onError: (error: Error) => void
) => {
  const messagesRef = ref(database, `messages/${chatId}`);
  
  const unsubscribe = onValue(messagesRef, 
    (snapshot) => {
      const messagesData = snapshot.val();
      if (!messagesData) {
        onUpdate([]);
        return;
      }

      const messages = Object.values(messagesData) as Message[];
      onUpdate(messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ));
    },
    (error) => onError(error as Error)
  );

  return () => off(messagesRef, 'value');
};

export const getUserByEmail = async (email: string) => {
  const usersRef = ref(database, 'users');
  const emailQuery = query(usersRef, orderByChild('email'), equalTo(email));
  const snapshot = await get(emailQuery);
  
  if (!snapshot.exists()) {
    throw new Error('User not found');
  }

  const userData = snapshot.val();
  const userId = Object.keys(userData)[0];
  return { ...userData[userId], id: userId };
};
EOL

# Hooks personnalisés
cat > src/hooks/useChat.ts << 'EOL'
import { useEffect, useState } from 'react';
import { subscribeToChats, subscribeToMessages } from '../services/api/database';
import { useChatStore } from '../stores/useChatStore';
import { useAuthStore } from '../stores/useAuthStore';
import type { Message } from '../types';

export const useChat = (chatId?: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const { user } = useAuthStore();
  const { sendMessage, updateMessageStatus } = useChatStore();

  useEffect(() => {
    if (!chatId || !user) return;

    setLoading(true);
    const unsubscribe = subscribeToMessages(
      chatId,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId, user]);

  const send = async (content: string) => {
    if (!chatId || !user) {
      throw new Error('Cannot send message: Missing chat ID or user');
    }

    try {
      await sendMessage(chatId, content);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    error,
    send,
  };
};
EOL

cat > src/hooks/useOnlineStatus.ts << 'EOL'
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
EOL

cat > src/hooks/useAppState.ts << 'EOL'
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
EOL

echo -e "${BLUE}Points à vérifier :${NC}"
echo "1. Configurer ces règles dans la console Firebase"
echo "2. Mettre à jour les composants pour utiliser les nouveaux hooks"
echo "3. Tester la synchronisation en temps réel"

git add .
git commit -m "feat: Add database services and real-time sync hooks"