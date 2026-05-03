import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import st, { IS_ANDROID, TEXT } from './styles';

export default function Header({
  onOpenMenu,
  onSearchOpen,
  onSyncPress,
  isSyncing,
}: {
  onOpenMenu: () => void;
  onSearchOpen: () => void;
  onSyncPress: () => void;
  isSyncing: boolean;
}) {
  const syncRotation = useSharedValue(0);

  React.useEffect(() => {
    if (isSyncing) {
      syncRotation.value = withTiming(360, { duration: 550 });
    } else {
      syncRotation.value = withTiming(0, { duration: 200 });
    }
  }, [isSyncing]);

  const syncAnimStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${syncRotation.value}deg` }] }));

  return (
    <Animated.View style={st.header}>
      <TouchableOpacity
        onPress={() => {
          Haptics.selectionAsync();
          onOpenMenu();
        }}
        style={st.titleRow}
        activeOpacity={0.7}
      >
        <Text allowFontScaling={false} style={st.title}>
          Discover
        </Text>
        <View style={st.chevronWrap}>
          <Ionicons name="chevron-down" size={12} color={TEXT} />
        </View>
      </TouchableOpacity>

      <View style={st.actions}>
        <TouchableOpacity onPress={onSearchOpen} activeOpacity={0.8}>
          <Animated.View style={st.iconBtn}>
            <Ionicons name="search-outline" size={IS_ANDROID ? 18 : 20} color={TEXT} />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSyncPress} activeOpacity={0.8} disabled={isSyncing}>
          <Animated.View style={[st.syncBtn, syncAnimStyle, isSyncing && st.syncBtnActive]}>
            <Ionicons name="sync" size={IS_ANDROID ? 18 : 20} color={TEXT} />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} activeOpacity={0.8}>
          <Animated.View style={st.iconBtn}>
            <Ionicons name="notifications-outline" size={IS_ANDROID ? 18 : 20} color={TEXT} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

