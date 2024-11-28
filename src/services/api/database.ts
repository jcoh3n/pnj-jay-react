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
