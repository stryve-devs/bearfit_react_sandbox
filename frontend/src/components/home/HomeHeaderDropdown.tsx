import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { AppColors } from '../../constants/colors';

type Option = {
  key: string;
  label: string;
};

type HomeHeaderDropdownProps = {
  options: Option[];
  selectedKey: string;
  onSelect: (key: string) => void;
};

export default function HomeHeaderDropdown({ options, selectedKey, onSelect }: HomeHeaderDropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find(o => o.key === selectedKey)?.label || '';

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(!open)}>
        <Text style={styles.text}>{selectedLabel}</Text>
        <Text style={styles.arrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {options.map(option => (
            <TouchableOpacity
              key={option.key}
              style={styles.option}
              onPress={() => {
                onSelect(option.key);
                setOpen(false);
              }}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  text: {
    color: AppColors.orange,
    fontSize: 22,
    fontWeight: '700',
  },
  arrow: {
    color: AppColors.orange,
    marginLeft: 6,
    fontSize: 18,
  },
  dropdown: {
    position: 'absolute',
    top: 30,
    backgroundColor: '#121212',
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 150,
    zIndex: 1000,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionText: {
    color: 'white',
  },
});