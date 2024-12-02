import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { User, Mail } from 'lucide-react-native';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { colors } from '../../constants/colors';
import { PhotoContextMenu } from './PhotoContextMenu';

interface UnifiedProfileModalProps {
  visible: boolean;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  userData: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  };
  onUpdateProfile: (data: {
    displayName?: string;
    photoURL?: string | null;
  }) => Promise<void>;
  onTakePhoto: () => Promise<void>;
  onChoosePhoto: () => Promise<void>;
  onRemovePhoto: () => Promise<void>;
}

export const UnifiedProfileModal = ({
  visible,
  onClose,
  loading = false,
  error,
  userData,
  onUpdateProfile,
  onTakePhoto,
  onChoosePhoto,
  onRemovePhoto,
}: UnifiedProfileModalProps) => {
  const [profileData, setProfileData] = useState({
    displayName: userData.displayName || '',
    photoURL: userData.photoURL,
  });

  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setProfileData({
      displayName: userData.displayName || '',
      photoURL: userData.photoURL,
    });
  }, [userData]);

  const handleSave = async () => {
    const hasChanges = profileData.displayName !== (userData.displayName || '');

    if (hasChanges) {
      await onUpdateProfile({
        displayName: profileData.displayName,
      });
    }
  };

  const handlePhotoPress = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX - 160, y: pageY - 120 });
    setShowPhotoMenu(true);
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>

        {/* Photo */}
        <TouchableOpacity
          style={styles.photoContainer}
          onPress={handlePhotoPress}
        >
          {profileData.photoURL ? (
            <Image
              source={{ uri: profileData.photoURL }}
              style={styles.photo}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <User size={40} color={colors.textSecondary} />
            </View>
          )}
          <Text style={styles.changePhotoText}>Change photo</Text>
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.field}>
            <View style={styles.labelContainer}>
              <User size={20} color={colors.textSecondary} />
              <Text style={styles.label}>Display Name</Text>
            </View>
            <Input
              value={profileData.displayName}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, displayName: text }))}
              placeholder="Enter your name"
              disabled={loading}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelContainer}>
              <Mail size={20} color={colors.textSecondary} />
              <Text style={styles.label}>Email</Text>
            </View>
            <Input
              value={userData.email || ''}
              onChangeText={() => {}}
              disabled={true}
              placeholder="Email address"
            />
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            disabled={loading}
          />
          <Button
            title="Save"
            onPress={handleSave}
            loading={loading}
            disabled={loading || !profileData.displayName.trim()}
          />
        </View>

        <PhotoContextMenu
          visible={showPhotoMenu}
          onClose={() => setShowPhotoMenu(false)}
          anchorPosition={menuPosition}
          onTakePhoto={onTakePhoto}
          onChoosePhoto={onChoosePhoto}
          onRemovePhoto={onRemovePhoto}
          hasExistingPhoto={!!profileData.photoURL}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceLight,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  field: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});