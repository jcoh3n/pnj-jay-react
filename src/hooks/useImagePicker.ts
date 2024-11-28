import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export const useImagePicker = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access camera roll is required!');
        return false;
      }
      return true;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      setLoading(true);
      setError(null);

      const hasPermission = await requestPermission();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0];
      }
      return null;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    pickImage,
    loading,
    error,
  };
};
