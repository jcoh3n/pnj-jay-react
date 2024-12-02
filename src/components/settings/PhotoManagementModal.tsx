import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { Modal } from '../ui/Modal';
import { colors } from '../../constants/colors';

interface PhotoManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => Promise<void>;
  onChoosePhoto: () => Promise<void>;
  onRemovePhoto: () => Promise<void>;
  currentPhotoUrl: string | null;
  hasExistingPhoto: boolean;
  loading?: boolean;
  error?: string | null;
}

export const PhotoManagementModal = ({
  visible,
  onClose,
  onTakePhoto,
  onChoosePhoto,
  onRemovePhoto,
  currentPhotoUrl,
  hasExistingPhoto,
  loading = false,
  error
}: PhotoManagementModalProps) => {
  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile Photo</Text>
        
        {/* Aperçu de la photo actuelle */}
        {hasExistingPhoto && (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: currentPhotoUrl || undefined }}
              style={styles.previewImage}
            />
          </View>
        )}

        {/* Message d'erreur */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <View style={styles.options}>
          {/* Option: Choisir depuis la galerie */}
          <TouchableOpacity 
            style={[styles.option, styles.primaryOption]}
            onPress={onChoosePhoto}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <ImageIcon size={24} color={colors.text} />
                <Text style={styles.optionText}>
                  Choose from Library
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Option: Prendre une photo */}
          <TouchableOpacity 
            style={[styles.option, styles.secondaryOption]}
            onPress={onTakePhoto}
            disabled={loading}
          >
            <Camera size={24} color={colors.text} />
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>

          {/* Option: Supprimer la photo */}
          {hasExistingPhoto && (
            <TouchableOpacity 
              style={[styles.option, styles.removeOption]}
              onPress={onRemovePhoto}
              disabled={loading}
            >
              <Trash2 size={24} color={colors.error} />
              <Text style={[styles.optionText, styles.removeText]}>
                Remove Photo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceLight,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  primaryOption: {
    backgroundColor: colors.primary,
  },
  secondaryOption: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeOption: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: 4,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  removeText: {
    color: colors.error,
  },
});