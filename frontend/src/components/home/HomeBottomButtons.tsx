// src/components/home/HomeBottomButtons.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { AppColors } from '../../constants/colors';

type HomeBottomButtonsProps = {
  onDiscoverPress?: () => void;
  onConnectPress?: () => void;
};

export default function HomeBottomButtons({ onDiscoverPress, onConnectPress }: HomeBottomButtonsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onDiscoverPress}>
        <Text style={styles.buttonText}>Discover Athletes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onConnectPress}>
        <Text style={styles.buttonText}>Connect Contacts</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: '100%',
  },
  button: {
    height: 42,
    borderWidth: 1,
    borderColor: AppColors.orange,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: AppColors.orange,
    fontWeight: '600',
  },
});