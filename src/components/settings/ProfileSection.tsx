import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { User, Mail } from 'lucide-react-native';
import { UnifiedProfileModal } from './UnifiedProfileModal';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../stores/useAuthStore';
import * as ImagePicker from 'expo-image-picker';

export const ProfileSection = () => {
  const { user, updateProfile } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (updates: {
    displayName?: string;
    photoURL?: string | null;
  }) => {
    try {
      setLoading(true);
      setError(null);
      await updateProfile(updates);
      setShowModal(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setLoading(true);
      setError(null);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission is required');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfile({ photoURL: result.assets[0].uri });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to take photo');
    } finally {
      setLoading(false);
    }
  };

  const handleChoosePhoto = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfile({ photoURL: result.assets[0].uri });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to choose photo');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setLoading(true);
      setError(null);
      await updateProfile({ photoURL: null });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        {user?.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            style={styles.photo}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <User size={32} color={colors.textSecondary} />
          </View>
        )}

        <View style={styles.profileInfo}>
          <View style={styles.nameSection}>
            <User size={16} color={colors.textSecondary} />
            <Text style={styles.name}>
              {user?.displayName || 'Add your name'}
            </Text>
          </View>

          <View style={styles.emailSection}>
            <Mail size={16} color={colors.textSecondary} />
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <UnifiedProfileModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setError(null);
        }}
        loading={loading}
        error={error}
        userData={{
          displayName: user?.displayName || '',
          email: user?.email || '',
          photoURL: user?.photoURL ?? null,
        }}
        onUpdateProfile={handleUpdateProfile}
        onTakePhoto={handleTakePhoto}
        onChoosePhoto={handleChoosePhoto}
        onRemovePhoto={handleRemovePhoto}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileCard: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceLight,
  },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  emailSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
});