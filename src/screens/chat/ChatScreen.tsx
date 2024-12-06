import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ChatList } from '../../components/chat/ChatList';
import { ChatArea } from '../../components/chat/ChatArea';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { NewChatDialog } from '../../components/chat/NewChatDialog';
import { useAuthStore } from '../../stores/useAuthStore';
import { useChatStore } from '../../stores/useChatStore';
import { colors } from '../../constants/colors';
import type { Chat } from '../../types';

export const ChatScreen = () => {
  const [showNewChat, setShowNewChat] = useState(false);
  const { user } = useAuthStore();
  const { 
    chats, 
    currentChat, 
    messages, 
    loading,
    createNewChat, 
    sendMessage, 
    setCurrentChat,
    subscribeToUpdates,
    reset 
  } = useChatStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user) {
      unsubscribe = subscribeToUpdates(user.uid);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      reset(); // Reset store state when component unmounts
    };
  }, [user]);

  const handleSelectChat = (chat: Chat) => {
    setCurrentChat(chat);
  };

  const handleBack = () => {
    setCurrentChat(null);
  };

  const handleNewChat = async (email: string) => {
    try {
      await createNewChat(email);
      setShowNewChat(false);
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (currentChat) {
      await sendMessage(content);
    }
  };

  return (
    <View style={styles.container}>
      {!currentChat ? (
        <ChatList
          chats={chats}
          loading={loading}
          onSelectChat={handleSelectChat}
          onNewChat={() => setShowNewChat(true)}
        />
      ) : (
        <View style={styles.chatArea}>
          <ChatHeader
            name={currentChat.name}
            avatar={currentChat.avatar}
            online={currentChat.online}
            onBack={handleBack}
            onOptions={() => {}}
          />
          <ChatArea
            messages={messages[currentChat.id] || []}
            currentUserId={user?.uid || ''}
            onSend={handleSendMessage}
            disabled={loading}
          />
        </View>
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