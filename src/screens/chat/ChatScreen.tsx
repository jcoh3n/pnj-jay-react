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
