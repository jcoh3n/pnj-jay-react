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
