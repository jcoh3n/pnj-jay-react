import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { Chat } from '../../types/chat';

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
}

export const ChatList = ({ chats, onSelectChat, onNewChat }: ChatListProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.newChatButton}
        onPress={onNewChat}
      >
        <Text style={styles.newChatText}>New Chat</Text>
      </TouchableOpacity>

      {chats.map((chat) => (
        <TouchableOpacity
          key={chat.id}
          style={styles.chatItem}
          onPress={() => onSelectChat(chat)}
        >
          <View style={styles.avatarContainer}>
            {chat.avatar && <Image source={{ uri: chat.avatar }} style={styles.avatar} />}
            {chat.online && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.chatInfo}>
            <Text style={styles.chatName}>{chat.name}</Text>
            <Text style={styles.lastMessage}>{chat.lastMessage}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  newChatButton: {
    padding: 16,
    backgroundColor: colors.primary,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  newChatText: {
    color: colors.text,
    fontWeight: '600',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  lastMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
});