import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ChevronLeft, MoreVertical } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  online?: boolean;
  onBack: () => void;
  onOptions: () => void;
}

export const ChatHeader = ({
  name,
  avatar,
  online,
  onBack,
  onOptions,
}: ChatHeaderProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ChevronLeft size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatar }}
            style={styles.avatar}
          />
          {online && <View style={styles.onlineIndicator} />}
        </View>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.status}>
            {online ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={onOptions} style={styles.optionsButton}>
        <MoreVertical size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  status: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  optionsButton: {
    padding: 8,
  },
});
