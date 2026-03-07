import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../constants/colors';

interface ValidationRowProps {
    isValid: boolean;
    text: string;
}

export default function ValidationRow({ isValid, text }: ValidationRowProps) {
    return (
        <View style={styles.row}>
            <Ionicons
                name={isValid ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={isValid ? AppColors.green : AppColors.red}
            />
            <Text style={[styles.text, { color: isValid ? AppColors.green : AppColors.red }]}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    text: {
        fontSize: 12,
        marginLeft: 8,
        flex: 1,
    },
});