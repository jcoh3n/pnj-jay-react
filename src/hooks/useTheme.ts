import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../stores/useSettingsStore';

export const useTheme = () => {
  const systemScheme = useColorScheme();
  const { settings } = useSettingsStore();

  const isDarkMode = settings.darkMode === 'system' 
    ? systemScheme === 'dark'
    : settings.darkMode;

  return {
    isDarkMode,
  };
};
