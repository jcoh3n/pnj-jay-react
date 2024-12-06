import { database } from '../firebase/config';
import { 
  ref, 
  onValue, 
  off, 
  get, 
  query, 
  orderByChild, 
  equalTo, 
  set, 
  push,
  update
} from 'firebase/database';
import { validateTimestamp } from '../../utils/format';
import type { Chat, Message } from '../../types';

export const createChat = async (currentUserId: string, recipientEmail: string): Promise<string> => {
  // Find recipient by email using the indexed field
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

  // Create new chat with proper structure
  const newChatRef = push(ref(database, 'chats'));
  const chatId = newChatRef.key;
  if (!chatId) throw new Error('Failed to generate chat ID');

  const timestamp = new Date().toISOString();
  const chatData = {
    [`chats/${chatId}`]: {
      createdAt: timestamp,
      participants: {
        [currentUserId]: true,
        [recipientId]: true,
      },
      lastMessage: null,
      metadata: {
        [currentUserId]: {
          unreadCount: 0,
          lastRead: null
        },
        [recipientId]: {
          unreadCount: 0,
          lastRead: null
        }
      }
    }
  };

  await update(ref(database), chatData);
  return chatId;
};

export const sendMessage = async (chatId: string, senderId: string, content: string): Promise<string> => {
  // First verify access rights by checking chat existence
  const chatRef = ref(database, `chats/${chatId}`);
  const chatSnapshot = await get(chatRef);
  
  if (!chatSnapshot.exists()) {
    throw new Error('Chat not found');
  }
  
  const chatData = chatSnapshot.val();
  if (!chatData.participants?.[senderId]) {
    throw new Error('Not authorized to send messages in this chat');
  }

  // Create new message with proper structure
  const messagesRef = ref(database, `messages/${chatId}`);
  const newMessageRef = push(messagesRef);
  const messageId = newMessageRef.key;
  if (!messageId) throw new Error('Failed to generate message ID');

  const timestamp = new Date().toISOString();
  const updates = {
    [`messages/${chatId}/${messageId}`]: {
      content,
      sender: senderId,
      timestamp,
      status: 'sent'
    },
    [`chats/${chatId}/lastMessage`]: {
      content,
      timestamp,
      sender: senderId
    }
  };

  // Update unread counts for other participants
  Object.keys(chatData.participants).forEach(participantId => {
    if (participantId !== senderId) {
      updates[`chats/${chatId}/metadata/${participantId}/unreadCount`] = 
        (chatData.metadata?.[participantId]?.unreadCount || 0) + 1;
    }
  });

  await update(ref(database), updates);
  return messageId;
};

export const subscribeToChats = (
  userId: string,
  onChats: (chats: Chat[]) => void,
  onError: (error: Error) => void
) => {
  // Use the properly indexed query
  const chatsRef = ref(database, 'chats');
  const userChatsQuery = query(
    chatsRef,
    orderByChild(`participants/${userId}`),
    equalTo(true)
  );
  
  const unsubscribe = onValue(userChatsQuery, 
    async (snapshot) => {
      try {
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
            lastMessageTime: validateTimestamp(data.lastMessage?.timestamp || data.createdAt),
            participants: data.participants,
            unreadCount: data.metadata?.[userId]?.unreadCount || 0,
            online: false // Implement with presence system
          };
        });
        
        const chats = await Promise.all(chatsPromises);
        onChats(chats.sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        ));
      } catch (error) {
        console.error('Error processing chats:', error);
        onError(error instanceof Error ? error : new Error('Failed to process chats'));
      }
    },
    (error) => {
      console.error('Firebase error:', error);
      onError(error);
    }
  );

  return () => off(chatsRef);
};

export const subscribeToMessages = (
  chatId: string,
  onMessages: (messages: Message[]) => void,
  onError: (error: Error) => void
) => {
  // First verify access rights
  const chatRef = ref(database, `chats/${chatId}`);
  
  get(chatRef).then(chatSnapshot => {
    if (!chatSnapshot.exists()) {
      onError(new Error('Chat not found'));
      return;
    }

    const messagesRef = ref(database, `messages/${chatId}`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(messagesQuery, 
      (snapshot) => {
        try {
          const messagesData = snapshot.val() || {};
          const messages = Object.entries(messagesData).map(([id, data]: [string, any]) => ({
            id,
            content: data.content,
            sender: data.sender,
            timestamp: validateTimestamp(data.timestamp),
            status: data.status || 'sent'
          }));
          
          onMessages(messages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ));
        } catch (error) {
          console.error('Error processing messages:', error);
          onError(error instanceof Error ? error : new Error('Failed to process messages'));
        }
      },
      (error) => {
        console.error('Firebase error:', error);
        onError(error);
      }
    );

    return () => off(messagesRef);
  }).catch(error => {
    onError(error instanceof Error ? error : new Error('Failed to verify chat access'));
  });
};

export const updateMessageStatus = async (chatId: string, messageId: string, status: 'delivered' | 'read') => {
  try {
    const updates = {
      [`messages/${chatId}/${messageId}/status`]: status
    };
    
    if (status === 'read') {
      updates[`chats/${chatId}/metadata/${auth.currentUser?.uid}/unreadCount`] = 0;
      updates[`chats/${chatId}/metadata/${auth.currentUser?.uid}/lastRead`] = new Date().toISOString();
    }
    
    await update(ref(database), updates);
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
};

export const deleteChat = async (chatId: string) => {
  try {
    // Verify access rights first
    const chatRef = ref(database, `chats/${chatId}`);
    const snapshot = await get(chatRef);
    
    if (!snapshot.exists()) {
      throw new Error('Chat not found');
    }
    
    const updates = {
      [`chats/${chatId}`]: null,
      [`messages/${chatId}`]: null
    };
    
    await update(ref(database), updates);
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (chatId: string, userId: string) => {
  try {
    const updates = {
      [`chats/${chatId}/metadata/${userId}/unreadCount`]: 0,
      [`chats/${chatId}/metadata/${userId}/lastRead`]: new Date().toISOString()
    };
    
    await update(ref(database), updates);
    
    // Update message statuses
    const messagesRef = ref(database, `messages/${chatId}`);
    const snapshot = await get(messagesRef);
    
    if (snapshot.exists()) {
      const messageUpdates = {};
      Object.entries(snapshot.val()).forEach(([id, message]: [string, any]) => {
        if (message.sender !== userId && message.status !== 'read') {
          messageUpdates[`messages/${chatId}/${id}/status`] = 'read';
        }
      });
      
      if (Object.keys(messageUpdates).length > 0) {
        await update(ref(database), messageUpdates);
      }
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};