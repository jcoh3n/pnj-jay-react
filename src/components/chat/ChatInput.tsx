import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Paperclip, Image, Smile, Send } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Paperclip size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Image size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TextInput
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={1000}
          editable={!disabled}
        />

        <TouchableOpacity style={styles.iconButton}>
          <Smile size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sendButton, (!message.trim() || disabled) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <Send size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 12,
    maxHeight: 100,
  },
  iconButton: {
    padding: 4,
  },
  sendButton: {
    padding: 8,
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
