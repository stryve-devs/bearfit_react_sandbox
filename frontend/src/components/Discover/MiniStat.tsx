import React from 'react';
import { View, Text } from 'react-native';
import st from './styles';

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={st.miniStat}>
      <Text allowFontScaling={false} style={st.miniStatLabel}>
        {label}
      </Text>
      <Text allowFontScaling={false} style={st.miniStatValue}>
        {value}
      </Text>
    </View>
  );
}

export default MiniStat;

