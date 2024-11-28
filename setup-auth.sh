#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Configuration de la logique de chat...${NC}"

# Store de chat
cat > src/stores/useChatStore.ts << 'EOL'
import { create } from 'zustand';
import {
  ref,
  push,
  onValue,
  off,
  get,
  query,
  orderByChild,
  equalTo,
  set,
} from 'firebase/database';
import { database } from '../services/firebase/config';
import { useAuthStore } from './useAuthStore';
import type { Chat, Message } from '../types';

interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  selectedChat: Chat | null;
  loading: boolean;
  error: string | null;
  loadChats: () => Promise<void>;
  selectChat: (chat: Chat | null) => void;
  createChat: (recipientEmail: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  subscribeToMessages: (chatId: string) => void;
  unsubscribeFromMessages: (chatId: string) => void;
  cleanup: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  messages: {},
  selectedChat: null,
  loading: false,
  error: null,

  loadChats: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const chatsRef = ref(database, 'chats');
      
      // Setup realtime listener for chats
      onValue(chatsRef, async (snapshot) => {
        const chatsData = snapshot.val();
        if (!chatsData) {
          set({ chats: [], loading: false });
          return;
        }

        const loadedChats: Chat[] = [];
        
        for (const [chatId, chat] of Object.entries<any>(chatsData)) {
          if (chat.participants?.[user.uid]) {
            // Find the other participant
            const otherParticipantId = Object.keys(chat.participants)
              .find(id => id !== user.uid);

            if (otherParticipantId) {
              // Get other participant's info
              const userRef = ref(database, `users/${otherParticipantId}`);
              const userSnapshot = await get(userRef);
              const userData = userSnapshot.val();

              if (userData) {
                loadedChats.push({
                  id: chatId,
                  name: userData.displayName || userData.email,
                  avatar: userData.photoURL || `https://ui-avatars.com/api/?name=${userData.displayName || 'User'}`,
                  lastMessage: chat.lastMessage?.content || '',
                  lastMessageTime: chat.lastMessage?.timestamp || chat.createdAt,
                  online: !!userData.lastActive && 
                    (Date.now() - new Date(userData.lastActive).getTime()) < 300000,
                  participants: chat.participants,
                  unreadCount: 0,
                });
              }
            }
          }
        }

        set({
          chats: loadedChats.sort((a, b) => 
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
          ),
          loading: false,
        });
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  selectChat: (chat) => {
    set({ selectedChat: chat });
  },

  createChat: async (recipientEmail) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Must be logged in to create chat');

    set({ loading: true, error: null });
    try {
      // Find recipient by email
      const usersRef = ref(database, 'users');
      const emailQuery = query(usersRef, orderByChild('email'), equalTo(recipientEmail));
      const snapshot = await get(emailQuery);
      
      if (!snapshot.exists()) {
        throw new Error('User not found');
      }

      const recipientData = snapshot.val();
      const recipientId = Object.keys(recipientData)[0];

      if (recipientId === user.uid) {
        throw new Error('Cannot create chat with yourself');
      }

      // Check if chat already exists
      const chatsRef = ref(database, 'chats');
      const chatsSnapshot = await get(chatsRef);
      const chatsData = chatsSnapshot.val();

      let existingChatId = null;
      if (chatsData) {
        existingChatId = Object.entries(chatsData).find(([_, chat]: [string, any]) => 
          chat.participants?.[user.uid] && chat.participants?.[recipientId]
        )?.[0];
      }

      if (existingChatId) {
        throw new Error('Chat already exists');
      }

      // Create new chat
      const newChatRef = push(chatsRef);
      await set(newChatRef, {
        createdAt: new Date().toISOString(),
        participants: {
          [user.uid]: true,
          [recipientId]: true,
        },
      });

      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  sendMessage: async (chatId, content) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Must be logged in to send messages');

    try {
      const messagesRef = ref(database, `messages/${chatId}`);
      const newMessageRef = push(messagesRef);
      
      const message = {
        id: newMessageRef.key,
        content,
        sender: user.uid,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      await set(newMessageRef, message);

      // Update last message in chat
      const chatRef = ref(database, `chats/${chatId}/lastMessage`);
      await set(chatRef, {
        content,
        timestamp: message.timestamp,
        sender: user.uid,
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  subscribeToMessages: (chatId) => {
    const messagesRef = ref(database, `messages/${chatId}`);
    
    onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      const messages = messagesData 
        ? Object.values(messagesData)
        : [];
      
      set(state => ({
        messages: {
          ...state.messages,
          [chatId]: messages as Message[],
        },
      }));
    });
  },

  unsubscribeFromMessages: (chatId) => {
    const messagesRef = ref(database, `messages/${chatId}`);
    off(messagesRef);
  },

  cleanup: () => {
    // Remove all listeners
    const { chats } = get();
    chats.forEach(chat => {
      const messagesRef = ref(database, `messages/${chat.id}`);
      off(messagesRef);
    });

    const chatsRef = ref(database, 'chats');
    off(chatsRef);

    set({
      chats: [],
      messages: {},
      selectedChat: null,
      loading: false,
      error: null,
    });
  },
}));
EOL

# Mise à jour du ChatScreen
cat > src/screens/chat/ChatScreen.tsx << 'EOL'
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ChatList } from '../../components/chat/ChatList';
import { ChatArea } from '../../components/chat/ChatArea';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { NewChatDialog } from '../../components/chat/NewChatDialog';
import { useChatStore } from '../../stores/useChatStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors } from '../../constants/colors';

export const ChatScreen = () => {
  const [showNewChat, setShowNewChat] = useState(false);
  const { user } = useAuthStore();
  const {
    chats,
    messages,
    selectedChat,
    loading,
    loadChats,
    selectChat,
    createChat,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      subscribeToMessages(selectedChat.id);
      return () => unsubscribeFromMessages(selectedChat.id);
    }
  }, [selectedChat?.id]);

  const handleSelectChat = (chat) => {
    selectChat(chat);
  };

  const handleBack = () => {
    selectChat(null);
  };

  const handleNewChat = async (email: string) => {
    await createChat(email);
    setShowNewChat(false);
  };

  const handleSendMessage = (content: string) => {
    if (selectedChat) {
      sendMessage(selectedChat.id, content);
    }
  };

  return (
    <View style={styles.container}>
      {selectedChat ? (
        <View style={styles.chatArea}>
          <ChatHeader
            name={selectedChat.name}
            avatar={selectedChat.avatar}
            online={selectedChat.online}
            onBack={handleBack}
            onOptions={() => {}}
          />
          <ChatArea
            messages={messages[selectedChat.id] || []}
            currentUserId={user?.uid || ''}
            onSend={handleSendMessage}
            disabled={loading}
          />
        </View>
      ) : (
        <ChatList
          chats={chats}
          onSelectChat={handleSelectChat}
          onNewChat={() => setShowNewChat(true)}
        />
      )}

      <NewChatDialog
        visible={showNewChat}
        onClose={() => setShowNewChat(false)}
        onSubmit={handleNewChat}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatArea: {
    flex: 1,
  },
});
EOL

# Mettre à jour les types
cat > src/types/index.ts << 'EOL'
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime: string;
  participants: Record<string, boolean>;
  online?: boolean;
  unreadCount: number;
}
EOL

echo -e "${GREEN}✅ Logique de chat configurée avec succès !${NC}"
echo -e "${BLUE}Points à vérifier :${NC}"
echo "1. Les variables d'environnement Firebase sont configurées"
echo "2. Les règles de sécurité Firebase sont configurées correctement"
echo "3. La navigation est bien configurée pour accéder au ChatScreen"

git add .
git commit -m "feat: Add chat logic with Firebase integration"