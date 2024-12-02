import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface ProfilePhotoProps {
  photoURL: string | null;
  size?: number;
  loading?: boolean;
  onPress: () => void;
}

export const ProfilePhoto = ({ 
  photoURL, 
  size = 80,
  loading = false,
  onPress
}: ProfilePhotoProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 }
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {photoURL ? (
        <Image
          source={{ uri: photoURL }}
          style={[
            styles.photo,
            { width: size, height: size, borderRadius: size / 2 }
          ]}
        />
      ) : (
        <View style={[
          styles.placeholder,
          { width: size, height: size, borderRadius: size / 2 }
        ]}>
          <Camera size={size * 0.4} color={colors.textSecondary} />
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.text} />
        </View>
      )}

      <View style={styles.editBadge}>
        <Camera size={16} color={colors.text} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  photo: {
    backgroundColor: colors.surfaceLight,
  },
  placeholder: {
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});