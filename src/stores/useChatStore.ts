import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { createChat, sendMessage, subscribeToChat, subscribeToChats } from '../services/api/database';
import type { Chat, Message } from '../types';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  createNewChat: (recipientEmail: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  setCurrentChat: (chat: Chat | null) => void;
  loadMessages: (chatId: string) => Promise<void>;
  subscribeToUpdates: (userId: string) => () => void;
  setChats: (chats: Chat[]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: {},
  loading: false,
  error: null,

  setChats: (chats) => set({ chats }),

  subscribeToUpdates: (userId: string) => {
    return subscribeToChats(
      userId,
      (chats) => set({ chats }),
      (error) => set({ error: error.message })
    );
  },

  createNewChat: async (recipientEmail: string) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Must be logged in to create chat');

    set({ loading: true, error: null });
    try {
      await createChat(user.uid, recipientEmail);
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create chat',
        loading: false 
      });
      throw error;
    }
  },

  sendMessage: async (content: string) => {
    const { user } = useAuthStore.getState();
    const { currentChat } = get();
    
    if (!user) throw new Error('Must be logged in to send messages');
    if (!currentChat) throw new Error('No chat selected');

    set({ loading: true, error: null });
    try {
      await sendMessage(currentChat.id, user.uid, content);
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to send message',
        loading: false
      });
      throw error;
    }
  },

  setCurrentChat: (chat: Chat | null) => {
    set({ currentChat: chat });
    if (chat) {
      get().loadMessages(chat.id);
    }
  },

  loadMessages: async (chatId: string) => {
    set({ loading: true, error: null });
    
    interface SubscribeToChatCallback {
      (messages: Message[]): void;
    }

    interface SubscribeToChatErrorCallback {
      (error: Error): void;
    }

    subscribeToChat(
      chatId,
      (messages: Message[]) => {
        set((state) => ({
          messages: { ...state.messages, [chatId]: messages },
          loading: false
        }));
      },
      (error: Error) => {
        set({ 
          error: error.message,
          loading: false 
        });
      }
    );
  }
}));