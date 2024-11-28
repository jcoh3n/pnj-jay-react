#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Ajout des fichiers manquants pour la conversion complète...${NC}"

# 1. Constants supplémentaires
mkdir -p src/constants
cat > src/constants/theme.ts << 'EOL'
import { colors } from './colors';

export const theme = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: colors.primary,
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
  },
  dark: {
    background: colors.background,
    surface: colors.surface,
    primary: colors.primary,
    text: colors.text,
    textSecondary: colors.textSecondary,
    border: colors.border,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
EOL

# 2. Types supplémentaires
cat > src/types/chat.ts << 'EOL'
export interface ChatParticipant {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  lastActive?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    imageWidth?: number;
    imageHeight?: number;
  };
}

export interface ChatNotification {
  id: string;
  chatId: string;
  message: ChatMessage;
  read: boolean;
  createdAt: string;
}
EOL

cat > src/types/theme.ts << 'EOL'
export interface Theme {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
EOL

# 3. Composants UI supplémentaires
cat > src/components/ui/IconButton.tsx << 'EOL'
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
EOL

cat > src/components/ui/Modal.tsx << 'EOL'
import React from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { colors } from '../../constants/colors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ visible, onClose, children }: ModalProps) => {
  const { height } = useWindowDimensions();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View 
          style={[
            styles.content,
            { maxHeight: height * 0.9 }
          ]}
        >
          {children}
        </View>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
});
EOL

# 4. Hooks supplémentaires
cat > src/hooks/useImagePicker.ts << 'EOL'
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export const useImagePicker = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access camera roll is required!');
        return false;
      }
      return true;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      setLoading(true);
      setError(null);

      const hasPermission = await requestPermission();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0];
      }
      return null;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    pickImage,
    loading,
    error,
  };
};
EOL

cat > src/hooks/useKeyboard.ts << 'EOL'
import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

export const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardVisible(true);
      }
    );

    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setKeyboardVisible(false);
      }
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return {
    keyboardHeight,
    keyboardVisible,
  };
};
EOL

# 5. Utils supplémentaires
cat > src/utils/file.ts << 'EOL'
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
};
EOL

cat > src/utils/error.ts << 'EOL'
export const getFirebaseErrorMessage = (error: any): string => {
  const code = error?.code || '';
  
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'User account has been disabled';
    case 'auth/user-not-found':
      return 'User not found';
    case 'auth/wrong-password':
      return 'Invalid password';
    case 'auth/email-already-in-use':
      return 'Email already in use';
    case 'auth/weak-password':
      return 'Password is too weak';
    default:
      return error?.message || 'An unknown error occurred';
  }
};
EOL

# 6. Dossier pour les tests
mkdir -p src/__tests__/{components,hooks,stores}

cat > src/__tests__/jest.setup.ts << 'EOL'
import '@testing-library/jest-native/extend-expect';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
EOL

echo -e "${GREEN}✅ Fichiers complémentaires créés avec succès !${NC}"
git add .
git commit -m "feat: Add supplementary files for complete conversion"