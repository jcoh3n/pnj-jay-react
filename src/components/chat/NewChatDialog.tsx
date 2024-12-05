//NewChatDialog.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';

interface NewChatDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
}

export const NewChatDialog = ({ visible, onClose, onSubmit, loading }: NewChatDialogProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      await onSubmit(email);
      setEmail('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>New Chat</Text>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.buttons}>
            <Button title="Cancel" onPress={onClose} variant="secondary" />
            <Button title="Create" onPress={handleSubmit} disabled={!email.trim()} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    marginTop: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
});