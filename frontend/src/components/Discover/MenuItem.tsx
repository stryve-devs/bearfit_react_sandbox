import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import st, { ORANGE } from './styles';

export default function MenuItem({ icon, label, active, onPress }: { icon: any; label: string; active?: boolean; onPress: () => void }) {
  const press = () => {
    Haptics.selectionAsync();
    onPress();
  };
  return (
    <TouchableOpacity onPress={press} activeOpacity={0.8}>
      <View style={[st.menuItem, active && st.menuItemActive]}>
        <View style={[st.menuIconWrap, active && st.menuIconActive]}>
          <Ionicons name={icon} size={15} color={active ? ORANGE : 'rgba(255,255,255,0.5)'} />
        </View>
        <Text allowFontScaling={false} style={[st.menuText, active && st.menuTextActive]}>
          {label}
        </Text>
        {active && <View style={st.activeDot} />}
      </View>
    </TouchableOpacity>
  );
}

