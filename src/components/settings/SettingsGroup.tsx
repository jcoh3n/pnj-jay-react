import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface SettingsGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsGroup = ({ title, description, children }: SettingsGroupProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  content: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
