// src/screens/auth/LoginScreen.tsx
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
      // Don't use navigation.replace here, let the Navigation component handle the routing
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