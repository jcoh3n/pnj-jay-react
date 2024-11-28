import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface IconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  size?: number;
  color?: string;
  disabled?: boolean;
}

export const IconButton = ({
  onPress,
  icon,
  size = 40,
  color = colors.text,
  disabled = false,
}: IconButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { width: size, height: size },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
