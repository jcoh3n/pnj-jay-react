import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface SettingsItemProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  onPress?: () => void;
  hasToggle?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  disabled?: boolean;
}

export const SettingsItem = ({
  icon,
  title,
  description,
  onPress,
  hasToggle,
  value,
  onToggle,
  disabled = false,
}: SettingsItemProps) => {
  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={handlePress}
      disabled={disabled || hasToggle}
      activeOpacity={hasToggle ? 1 : 0.7}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>

      {hasToggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          disabled={disabled}
          trackColor={{
            false: colors.surfaceLight,
            true: colors.primary,
          }}
          thumbColor={colors.text}
        />
      ) : onPress && (
        <ChevronRight size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
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
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
