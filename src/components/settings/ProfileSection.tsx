import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { User, AlertCircle } from 'lucide-react-native';
import { SettingsGroup } from './SettingsGroup';
import { SettingsItem } from './SettingsItem';
import { ProfilePhoto } from './ProfilePhoto';
import { PhotoManagementModal } from './PhotoManagementModal';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../stores/useAuthStore';
import { useImagePicker } from '../../hooks/useImagePicker';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileData {
  displayName: string;
  status: string;
}

export const ProfileSection = () => {
  const { user, updateProfile } = useAuthStore();
  const { pickImage } = useImagePicker();
  
  // États
  const [isEditing, setIsEditing] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState<EditProfileData>({
    displayName: user?.displayName || '',
    status: user?.status || 'Available'
  });

  // Mettre à jour le state local quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        status: user.status || 'Available'
      });
    }
  }, [user]);

  // Gestion des photos
  const handlePhotoAction = async (action: () => Promise<string | null>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await action();
      if (result) {
        await updateProfile({ photoURL: result });
      }
    } catch (error) {
      setError('Failed to update photo');
      console.error('Photo update error:', error);
    } finally {
      setLoading(false);
      setShowPhotoModal(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera permission is required to take a photo');
      return;
    }

    await handlePhotoAction(async () => {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    });
  };

  const handleChoosePhoto = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await pickImage({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result?.uri) {
      await updateProfile({ photoURL: result.uri });
    }
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to update photo');
    console.error('Photo selection error:', error);
  } finally {
    setLoading(false);
    // Ne fermez pas le modal en cas d'erreur pour afficher le message
    if (!error) {
      setShowPhotoModal(false);
    }
  }
};

  const handleRemovePhoto = async () => {
    try {
      setLoading(true);
      setError(null);
      await updateProfile({ photoURL: null });
      setShowPhotoModal(false);
    } catch (error) {
      setError('Failed to remove photo');
      console.error('Photo removal error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion du profil
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      await updateProfile({
        displayName: profileData.displayName,
        status: profileData.status
      });
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setProfileData({
      displayName: user?.displayName || '',
      status: user?.status || 'Available'
    });
    setError(null);
  };

  return (
    <>
      <SettingsGroup 
        title="Profile"
        description="Manage your personal information"
      >
        <View style={styles.photoContainer}>
          <ProfilePhoto
            photoURL={user?.photoURL || null}
            onPress={() => setShowPhotoModal(true)}
            loading={loading}
            size={80}
          />
        </View>

        <SettingsItem
          icon={<User size={24} color={colors.text} />}
          title={user?.displayName || 'Add display name'}
          description={user?.status || 'Available'}
          onPress={() => setIsEditing(true)}
        />

        {error && (
          <SettingsItem
            icon={<AlertCircle size={24} color={colors.error} />}
            title="Error"
            description={error}
            onPress={() => setError(null)}
          />
        )}
      </SettingsGroup>

      {/* Modal de gestion des photos */}
      <PhotoManagementModal
  visible={showPhotoModal}
  onClose={() => {
    setShowPhotoModal(false);
    setError(null);
  }}
  onTakePhoto={handleTakePhoto}
  onChoosePhoto={handleChoosePhoto}
  onRemovePhoto={handleRemovePhoto}
  currentPhotoUrl={user?.photoURL || null}
  hasExistingPhoto={!!user?.photoURL}
  loading={loading}
  error={error}
/>

      {/* Modal d'édition du profil */}
      <Modal 
        visible={isEditing} 
        onClose={resetForm}
      >
        <View style={styles.modalContent}>
          <Input
            label="Display Name"
            value={profileData.displayName}
            onChangeText={(text) => setProfileData(prev => ({ ...prev, displayName: text }))}
            placeholder="Enter your name"
            disabled={loading}
          />

          <Input
            label="Status"
            value={profileData.status}
            onChangeText={(text) => setProfileData(prev => ({ ...prev, status: text }))}
            placeholder="Set your status"
            disabled={loading}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={resetForm}
              variant="secondary"
              disabled={loading}
            />
            <Button
              title="Save"
              onPress={handleUpdateProfile}
              loading={loading}
              disabled={!profileData.displayName.trim() || loading}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  photoContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalContent: {
    gap: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  }
});