import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { format } from 'date-fns';

interface MessageProps {
  content: string;
  timestamp: string;
  isOutgoing: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export const Message = ({ content, timestamp, isOutgoing, status }: MessageProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'read':
        return colors.success;
      case 'delivered':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, isOutgoing && styles.outgoingContainer]}>
      <View style={[
        styles.bubble,
        isOutgoing ? styles.outgoingBubble : styles.incomingBubble
      ]}>
        <Text style={styles.messageText}>{content}</Text>
        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>
            {format(new Date(timestamp), 'HH:mm')}
          </Text>
          {isOutgoing && status && (
            <Check size={16} color={getStatusColor()} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    maxWidth: '85%',
  },
  outgoingContainer: {
    alignSelf: 'flex-end',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  incomingBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  outgoingBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: colors.text,
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
