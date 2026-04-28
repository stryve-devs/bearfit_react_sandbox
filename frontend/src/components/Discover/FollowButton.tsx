import React, { useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ORANGE } from './styles';

export function FollowButton({ followed, onPress }: { followed: boolean; onPress: () => void }) {
  const followedVal = useSharedValue(followed ? 1 : 0);
  useEffect(() => {
    followedVal.value = withTiming(followed ? 1 : 0, { duration: 200, easing: Easing.out(Easing.cubic) });
  }, [followed]);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(255,120,37,${interpolate(followedVal.value, [0, 1], [0, 0.14])})`,
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  }));

  const press = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity onPress={press} activeOpacity={0.8}>
      <Animated.View style={animStyle}>
        {followed ? (
          <Ionicons name="checkmark" size={11} color={ORANGE} style={{ marginRight: 3 }} />
        ) : (
          <Ionicons name="add" size={11} color={ORANGE} style={{ marginRight: 3 }} />
        )}
        <Text allowFontScaling={false} style={{ color: ORANGE, fontSize: 12, fontWeight: '700' }}>
          {followed ? 'Following' : 'Follow'}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// lazy import Ionicons to avoid duplicate import at top-level
import { Ionicons } from '@expo/vector-icons';
export default FollowButton;

