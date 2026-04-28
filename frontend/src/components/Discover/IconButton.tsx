import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import st from './styles';
import { IS_ANDROID, ORANGE } from './styles';

export function IconButton({ name, onPress, badge }: { name: any; onPress: () => void; badge?: boolean }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const press = () => {
    // haptics on JS thread
    Haptics.selectionAsync();
    scale.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withTiming(1, { duration: 150 })
    );
    onPress();
  };
  return (
    <TouchableOpacity onPress={press} activeOpacity={1}>
      <Animated.View style={[st.iconBtn, animStyle]}>
        <Ionicons name={name} size={IS_ANDROID ? 18 : 20} color={ORANGE} />
        {badge && <View style={st.badge} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default IconButton;

