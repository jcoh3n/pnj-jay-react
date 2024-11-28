#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Configuration des fichiers et composants manquants...${NC}"

# Types supplémentaires
cat > src/types/index.ts << 'EOL'
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime: string;
  participants: Record<string, boolean>;
  online?: boolean;
  unreadCount: number;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}
EOL

# Utils
mkdir -p src/utils

cat > src/utils/format.ts << 'EOL'
import { format, isToday, isYesterday } from 'date-fns';

export const formatTime = (date: string | Date) => {
  const messageDate = new Date(date);
  
  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  }
  
  if (isYesterday(messageDate)) {
    return 'Yesterday';
  }
  
  return format(messageDate, 'dd/MM/yyyy');
};
EOL

cat > src/utils/validation.ts << 'EOL'
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
EOL

# Mettre à jour LoginScreen
cat > src/screens/auth/LoginScreen.tsx << 'EOL'
import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginForm } from '../../components/auth/LoginForm';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../stores/useAuthStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const { login, register, loading, error } = useAuthStore();

  const handleSubmit = async ({
    email,
    password,
    isRegistering,
  }: {
    email: string;
    password: string;
    isRegistering: boolean;
  }) => {
    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigation.replace('Main');
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <LoginForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});
EOL

# Mise à jour du ChatScreen complet
cat > src/screens/chat/ChatScreen.tsx << 'EOL'
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ChatList } from '../../components/chat/ChatList';
import { ChatArea } from '../../components/chat/ChatArea';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { NewChatDialog } from '../../components/chat/NewChatDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { useChat } from '../../hooks/useChat';
import { useAuthStore } from '../../stores/useAuthStore';
import { useChatStore } from '../../stores/useChatStore';
import { colors } from '../../constants/colors';
import { MessageCircle } from 'lucide-react-native';

export const ChatScreen = () => {
  const [showNewChat, setShowNewChat] = useState(false);
  const { user } = useAuthStore();
  const { chats, selectedChat, selectChat, createChat } = useChatStore();
  const { messages, loading, send } = useChat(selectedChat?.id);

  const handleSelectChat = (chat) => {
    selectChat(chat);
  };

  const handleBack = () => {
    selectChat(null);
  };

  const handleNewChat = async (email: string) => {
    try {
      await createChat(email);
      setShowNewChat(false);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <View style={styles.container}>
      {!selectedChat ? (
        <>
          <ChatList
            chats={chats}
            onSelectChat={handleSelectChat}
            onNewChat={() => setShowNewChat(true)}
          />
          {chats.length === 0 && (
            <EmptyState
              icon={<MessageCircle size={48} color={colors.textSecondary} />}
              title="No conversations yet"
              description="Start a new conversation with someone"
            />
          )}
        </>
      ) : (
        <View style={styles.chatArea}>
          <ChatHeader
            name={selectedChat.name}
            avatar={selectedChat.avatar}
            online={selectedChat.online}
            onBack={handleBack}
            onOptions={() => {}}
          />
          <ChatArea
            messages={messages}
            currentUserId={user?.uid || ''}
            onSend={send}
            disabled={loading}
          />
        </View>
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
EOL

# Hook supplémentaire pour la gestion du thème
cat > src/hooks/useTheme.ts << 'EOL'
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../stores/useSettingsStore';

export const useTheme = () => {
  const systemScheme = useColorScheme();
  const { settings } = useSettingsStore();

  const isDarkMode = settings.darkMode === 'system' 
    ? systemScheme === 'dark'
    : settings.darkMode;

  return {
    isDarkMode,
  };
};
EOL

echo -e "${GREEN}✅ Structure restante créée avec succès !${NC}"
echo -e "${BLUE}Fichiers ajoutés/mis à jour :${NC}"
echo "1. Types supplémentaires"
echo "2. Utils (format.ts, validation.ts)"
echo "3. LoginScreen complet"
echo "4. ChatScreen complet"
echo "5. Hook useTheme"

git add .
git commit -m "feat: Complete remaining structure and components"