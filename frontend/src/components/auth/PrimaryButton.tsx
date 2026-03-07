import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AppColors } from '../../constants/colors';

interface PrimaryButtonProps {
    label: string;
    onPress?: () => void;
    disabled?: boolean;
    loading?: boolean;
    backgroundColor?: string;
    foregroundColor?: string;
}

export default function PrimaryButton({
                                          label,
                                          onPress,
                                          disabled = false,
                                          loading = false,
                                          backgroundColor,
                                          foregroundColor,
                                      }: PrimaryButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: isDisabled
                        ? (backgroundColor || AppColors.disabledButton)
                        : (backgroundColor || AppColors.orange),
                },
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={foregroundColor || AppColors.black} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        {
                            color: isDisabled
                                ? (foregroundColor || AppColors.white)
                                : (foregroundColor || AppColors.black),
                        },
                    ]}
                >
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 15,
        fontWeight: '600',
    },
});