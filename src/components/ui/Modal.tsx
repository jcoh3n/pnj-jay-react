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
