#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Configuration de la navigation et des écrans principaux...${NC}"

# Création des dossiers pour la navigation et les écrans
mkdir -p src/navigation
mkdir -p src/screens/{chat,settings}

# Configuration de la navigation principale
cat > src/navigation/index.tsx << 'EOL'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, Settings } from 'lucide-react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { colors } from '../constants/colors';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

// Types
import { RootStackParamList, MainTabParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const Navigation = () => {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
EOL

# ChatScreen de base
cat > src/screens/chat/ChatScreen.tsx << 'EOL'
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export const ChatScreen = () => {
  return (
    <View style={styles.container}>
      {/* ChatList component will go here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
EOL

# SettingsScreen de base
cat > src/screens/settings/SettingsScreen.tsx << 'EOL'
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../constants/colors';

export const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Settings items will go here */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
});
EOL

# Mise à jour de App.tsx
cat > App.tsx << 'EOL'
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './src/navigation';
import { useAuthStore } from './src/stores/useAuthStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Navigation />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
EOL

# Mise à jour de babel.config.js pour React Native Reanimated
cat > babel.config.js << 'EOL'
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
EOL

echo -e "${GREEN}✅ Configuration de la navigation terminée !${NC}"
echo -e "${BLUE}Prochaines étapes :${NC}"
echo "1. Configuration des composants de chat"
echo "2. Configuration des composants de paramètres"
echo "3. Implémentation de la logique de chat"

git add .
git commit -m "Add navigation setup and basic screens"
EOL