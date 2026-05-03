import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import st from './styles';
import MenuItem from './MenuItem';

export default function DiscoverMenu({
  visible,
  onClose,
  onGoHome,
  onGoDiscover,
}: {
  visible: boolean;
  onClose: () => void;
  onGoHome: () => void;
  onGoDiscover: () => void;
}) {
  const menuAnimStyle = useAnimatedStyle(() => ({ opacity: visible ? 1 : 0, transform: [{ scale: visible ? 1 : 0.92 }] }));

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={st.backdrop} onPress={onClose} />
      <Animated.View style={[st.menu, menuAnimStyle]}>
        <BlurView intensity={60} tint="dark" style={st.menuBlur}>
          <MenuItem icon="home-outline" label="Home (Following)" onPress={onGoHome} />
          <View style={st.menuDivider} />
          <MenuItem icon="compass-outline" label="Discover" active onPress={onGoDiscover} />
        </BlurView>
      </Animated.View>
    </Modal>
  );
}
