import { database } from '../firebase/config';
import { ref, onValue, off, get, query, orderByChild, equalTo, set, push } from 'firebase/database';
import type { Chat, Message } from '../../types';

export const createChat = async (currentUserId: string, recipientEmail: string): Promise<string> => {
  // Find recipient by email
  const usersRef = ref(database, 'users');
  const emailQuery = query(usersRef, orderByChild('email'), equalTo(recipientEmail));
  const snapshot = await get(emailQuery);
  
  if (!snapshot.exists()) {
    throw new Error('User not found');
  }

  const recipients = Object.entries(snapshot.val());
  if (recipients.length === 0) {
    throw new Error('User not found');
  }

  const [recipientId, recipientData] = recipients[0];

  if (recipientId === currentUserId) {
    throw new Error('Cannot create chat with yourself');
  }

  // Check if chat already exists
  const chatsRef = ref(database, 'chats');
  const existingChatsSnapshot = await get(chatsRef);
  
  if (existingChatsSnapshot.exists()) {
    const chatsData = existingChatsSnapshot.val();
    const existingChat = Object.entries(chatsData).find(([_, chat]: [string, any]) => 
      chat.participants?.[currentUserId] && chat.participants?.[recipientId]
    );

    if (existingChat) {
      throw new Error('Chat already exists');
    }
  }

  // Create new chat
  const newChatRef = push(chatsRef);
  const chatData = {
    createdAt: new Date().toISOString(),
    participants: {
      [currentUserId]: true,
      [recipientId]: true,
    },
    lastMessage: null
  };

  await set(newChatRef, chatData);
  return newChatRef.key as string;
};

export const sendMessage = async (chatId: string, senderId: string, content: string): Promise<string> => {
  const messagesRef = ref(database, `messages/${chatId}`);
  const newMessageRef = push(messagesRef);

  const messageData = {
    content,
    sender: senderId,
    timestamp: new Date().toISOString(),
    status: 'sent'
  };

  await set(newMessageRef, messageData);

  // Update last message in chat
  const chatRef = ref(database, `chats/${chatId}`);
  await set(ref(database, `chats/${chatId}/lastMessage`), {
    content,
    timestamp: messageData.timestamp,
    sender: senderId
  });

  return newMessageRef.key as string;
};

export const subscribeToChats = (
  userId: string,
  onChats: (chats: Chat[]) => void,
  onError: (error: Error) => void
) => {
  const chatsRef = ref(database, 'chats');
  const userChatsQuery = query(chatsRef, orderByChild(`participants/${userId}`), equalTo(true));
  
  const unsubscribe = onValue(userChatsQuery, 
    async (snapshot) => {
      const chatsData = snapshot.val() || {};
      const chatsPromises = Object.entries(chatsData).map(async ([id, data]: [string, any]) => {
        const participantIds = Object.keys(data.participants || {}).filter(pid => pid !== userId);
        
        // Get participant details
        const userPromises = participantIds.map(async (pid) => {
          const userRef = ref(database, `users/${pid}`);
          const userSnapshot = await get(userRef);
          return { id: pid, ...userSnapshot.val() };
        });
        
        const participants = await Promise.all(userPromises);
        const participant = participants[0]; // For 1:1 chats
        
        return {
          id,
          name: participant?.displayName || participant?.email || 'Unknown',
          avatar: participant?.photoURL,
          lastMessage: data.lastMessage?.content,
          lastMessageTime: data.lastMessage?.timestamp || data.createdAt,
          participants: data.participants,
          unreadCount: 0, // Implement this later
          online: false // Implement this later
        };
      });
      
      const chats = await Promise.all(chatsPromises);
      onChats(chats.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      ));
    },
    onError
  );

  return () => off(chatsRef);
};