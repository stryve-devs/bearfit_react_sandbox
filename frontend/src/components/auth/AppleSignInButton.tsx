import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../constants/colors';

export default function AppleSignInButton({ onPress }: { onPress?: () => void }) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.content}>
                <Ionicons name="logo-apple" size={24} color={AppColors.white} style={styles.icon} />
                <Text style={styles.text}>Sign in with Apple</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        backgroundColor: AppColors.inputBg,
        borderRadius: 8,
        paddingVertical: 14,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 12,
        marginLeft: -12,  // Add this to shift icon left

    },
    text: {
        color: AppColors.white,
        fontSize: 15,
        fontWeight: '600',
    },
});