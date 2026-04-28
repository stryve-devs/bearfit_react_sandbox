import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { IS_ANDROID } from './styles';

export function LikeButton({ liked, count, onPress }: { liked: boolean; count: number; onPress: () => void }) {
  const heartScale = useSharedValue(1);
  const press = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    heartScale.value = withSequence(
      withTiming(0.7, { duration: 80 }),
      withTiming(1.2, { duration: 120 }),
      withTiming(1, { duration: 100 })
    );
    onPress();
  };
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));
  return (
    <TouchableOpacity onPress={press} activeOpacity={1} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 14 }}>
      <Animated.View style={heartStyle}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={IS_ANDROID ? 20 : 22}
          color={liked ? '#FF4D6D' : 'rgba(255,255,255,0.7)'}
        />
      </Animated.View>
      <Text allowFontScaling={false} style={{ color: liked ? '#FF4D6D' : 'rgba(255,255,255,0.7)', fontSize: IS_ANDROID ? 13 : 14, fontWeight: '600' }}>
        {count}
      </Text>
    </TouchableOpacity>
  );
}

export default LikeButton;

