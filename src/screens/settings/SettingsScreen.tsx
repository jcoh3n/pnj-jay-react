import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../constants/colors';

export const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Settings items will go here */}
      </ScrollView>
    </View>
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
});
