import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export const ChatScreen = () => {
  return (
    <View style={styles.container}>
      {/* ChatList component will go here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
