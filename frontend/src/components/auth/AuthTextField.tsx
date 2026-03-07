import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { AppColors } from '../../constants/colors';

interface AuthTextFieldProps extends TextInputProps {
    label: string;
    error?: string | null;
    suffix?: React.ReactNode;
    useFloatingLabel?: boolean;
    compact?: boolean;
}

export default function AuthTextField({
                                          label,
                                          error,
                                          suffix,
                                          useFloatingLabel = false,
                                          compact = false,
                                          ...props
                                      }: AuthTextFieldProps) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value && props.value.toString().length > 0;
    const showFloatingLabel = useFloatingLabel && (isFocused || hasValue);

    return (
        <View style={styles.container}>
            {!useFloatingLabel && (
                <Text style={styles.label}>{label}</Text>
            )}

            <View style={[
                styles.inputWrapper,
                error !== undefined && error !== null && styles.inputError,
                isFocused && !error && styles.inputFocused,
            ]}>
                {showFloatingLabel && (
                    <Text style={styles.floatingLabel}>{label}</Text>
                )}

                <TextInput
                    {...props}
                    style={[
                        styles.input,
                        compact && styles.inputCompact,
                        showFloatingLabel && styles.inputWithLabel,
                    ]}
                    placeholder={!showFloatingLabel ? (props.placeholder || '') : ''}
                    placeholderTextColor={AppColors.grey}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                />

                {suffix && <View style={styles.suffix}>{suffix}</View>}
            </View>

            {error && error.length > 0 && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        color: AppColors.white,
        fontSize: 14,
        marginBottom: 6,
    },
    inputWrapper: {
        backgroundColor: AppColors.inputBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputError: {
        borderColor: AppColors.errorRed,
    },
    inputFocused: {
        borderColor: AppColors.orange,
    },
    floatingLabel: {
        position: 'absolute',
        top: 6,
        left: 12,
        fontSize: 11,
        color: AppColors.grey,
        backgroundColor: AppColors.inputBg,
        paddingHorizontal: 2,
    },
    input: {
        flex: 1,
        color: AppColors.white,
        fontSize: 14,
        padding: 0,
    },
    inputCompact: {
        fontSize: 14,
    },
    inputWithLabel: {
        paddingTop: 8,
    },
    suffix: {
        marginLeft: 8,
    },
    errorText: {
        color: AppColors.errorRed,
        fontSize: 12,
        marginTop: 8,
    },
});