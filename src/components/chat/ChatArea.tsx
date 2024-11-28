import React, { useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { colors } from '../../constants/colors';
import type { Message as MessageType } from '../../types';

interface ChatAreaProps {
  messages: MessageType[];
  currentUserId: string;
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatArea = ({
  messages,
  currentUserId,
  onSend,
  disabled = false,
}: ChatAreaProps) => {
  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
        renderItem={({ item }) => (
          <Message
            content={item.content}
            timestamp={item.timestamp}
            isOutgoing={item.sender === currentUserId}
            status={item.status}
          />
        )}
      />
      <ChatInput onSend={onSend} disabled={disabled} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messageList: {
    paddingVertical: 16,
  },
});
