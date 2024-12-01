// src/screens/chat/ChatScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ChatList } from '../../components/chat/ChatList';
import { ChatArea } from '../../components/chat/ChatArea';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { NewChatDialog } from '../../components/chat/NewChatDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { useChat } from '../../hooks/useChat';
import { useAuthStore } from '../../stores/useAuthStore';
import { useChatStore } from '../../stores/useChatStore';
import { colors } from '../../constants/colors';
import { MessageCircle } from 'lucide-react-native';

export const ChatScreen = () => {
  const [showNewChat, setShowNewChat] = useState(false);
  const { user } = useAuthStore();
  const { chats, selectedChat, selectChat, createChat } = useChatStore();
  const { messages, loading, send } = useChat(selectedChat?.id);

  const handleSelectChat = (chat) => {
    selectChat(chat);
  };

  const handleBack = () => {
    selectChat(null);
  };

  const handleNewChat = async (email: string) => {
    try {
      await createChat(email);
      setShowNewChat(false);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <View style={styles.container}>
      {!selectedChat ? (
        <>
          <ChatList
            chats={chats}
            onSelectChat={handleSelectChat}
            onNewChat={() => setShowNewChat(true)}
          />
          {chats.length === 0 && (
            <EmptyState
              icon={<MessageCircle size={48} color={colors.textSecondary} />}
              title="No conversations yet"
              description="Start a new conversation with someone"
            />
          )}
        </>
      ) : (
        <View style={styles.chatArea}>
          <ChatHeader
            name={selectedChat.name}
            avatar={selectedChat.avatar}
            online={selectedChat.online}
            onBack={handleBack}
            onOptions={() => {}}
          />
          <ChatArea
            messages={messages}
            currentUserId={user?.uid || ''}
            onSend={send}
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