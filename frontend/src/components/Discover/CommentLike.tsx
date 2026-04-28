 import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import st from './styles';

export function CommentLike({ liked, count, onPress }: { liked: boolean; count: number; onPress: () => void }) {
  const scale = useSharedValue(1);
  const press = () => {
    Haptics.selectionAsync();
    scale.value = withSequence(
      withTiming(0.7, { duration: 70 }),
      withTiming(1.15, { duration: 100 }),
      withTiming(1, { duration: 80 })
    );
    onPress();
  };
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <TouchableOpacity onPress={press} activeOpacity={1} style={st.commentLikeRow}>
      <Animated.View style={animStyle}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={13}
          color={liked ? '#FF4D6D' : 'rgba(255,255,255,0.4)'}
        />
      </Animated.View>
      {count > 0 && <Text style={st.commentLikeCount}>{count}</Text>}
    </TouchableOpacity>
  );
}

export default CommentLike;

