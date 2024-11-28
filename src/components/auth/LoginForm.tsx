import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string; isRegistering: boolean }) => void;
  loading?: boolean;
  error?: string;
}

export const LoginForm = ({ onSubmit, loading = false, error }: LoginFormProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    onSubmit({
      email: email.toLowerCase(),
      password,
      isRegistering,
    });
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </Text>
        <Text style={styles.subtitle}>
          {isRegistering ? 'Sign up to get started' : 'Sign in to continue'}
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={loading}
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          disabled={loading}
        />

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <Button
          title={isRegistering ? 'Create Account' : 'Sign In'}
          onPress={handleSubmit}
          loading={loading}
          disabled={!email || !password}
        />
      </View>

      <View style={styles.toggleContainer}>
        <Button
          title={isRegistering ? 'Already have an account? Sign in' : 'New here? Create account'}
          onPress={toggleMode}
          disabled={loading}
          variant="secondary"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    padding: 16,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  form: {
    gap: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  toggleContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
});