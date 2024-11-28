// src/components/chat/NewChatDialog.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';

interface NewChatDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  loading?: boolean;
}

export const NewChatDialog = ({
  visible,
  onClose,
  onSubmit,
  loading
}: NewChatDialogProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (email.trim()) {
      onSubmit(email.trim());
      setEmail('');
    }
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={loading}
        />
        
        <View style={styles.buttons}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            disabled={loading}
          />
          <Button
            title="Start Chat"
            onPress={handleSubmit}
            loading={loading}
            disabled={!email.trim()}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
});