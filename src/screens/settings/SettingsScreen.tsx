import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Bell, Moon, Globe, Volume2, Shield, LogOut } from 'lucide-react-native';
import { ProfileSection } from '../../components/settings/ProfileSection';
import { SettingsGroup } from '../../components/settings/SettingsGroup';
import { SettingsItem } from '../../components/settings/SettingsItem';
import { Button } from '../../components/ui/Button';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SettingsScreen = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSection />

        <SettingsGroup title="Notifications" description="Manage your notification preferences">
          <SettingsItem
            icon={<Bell size={24} color={colors.text} />}
            title="Push Notifications"
            description="Receive alerts for new messages"
            hasToggle
            value={settings.notifications}
            onToggle={(value) => updateSettings({ notifications: value })}
          />
          <SettingsItem
            icon={<Volume2 size={24} color={colors.text} />}
            title="Sound"
            description="Play sounds for new messages"
            hasToggle
            value={settings.soundEnabled}
            onToggle={(value) => updateSettings({ soundEnabled: value })}
          />
        </SettingsGroup>

        <SettingsGroup title="Appearance">
          <SettingsItem
            icon={<Moon size={24} color={colors.text} />}
            title="Dark Mode"
            description="Toggle dark theme"
            hasToggle
            value={settings.darkMode}
            onToggle={(value) => updateSettings({ darkMode: value })}
          />
          <SettingsItem
            icon={<Globe size={24} color={colors.text} />}
            title="Language"
            description={settings.language === 'en' ? 'English' : 'Français'}
            onPress={() => {}}
          />
        </SettingsGroup>

        <SettingsGroup title="Privacy & Security">
          <SettingsItem
            icon={<Shield size={24} color={colors.text} />}
            title="Privacy Settings"
            description="Manage your privacy preferences"
            onPress={() => {}}
          />
        </SettingsGroup>

        <View style={styles.logoutContainer}>
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  logoutContainer: {
    marginTop: 24,
  },
});
