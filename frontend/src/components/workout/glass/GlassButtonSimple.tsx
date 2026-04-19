import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../../constants/colors';

interface GlassButtonSimpleProps {
    text: string;
    iconName: any;
    onPress: () => void;
    style?: ViewStyle;
    isVertical?: boolean;
}

export const GlassButtonSimple: React.FC<GlassButtonSimpleProps> = ({
                                                                        text,
                                                                        iconName,
                                                                        onPress,
                                                                        style,
                                                                        isVertical = false,
                                                                    }) => {
    return (
        <TouchableOpacity
            style={[styles.buttonWrapper, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <BlurView intensity={50} tint="dark" style={styles.blurContainer}>
                <View style={[styles.content, isVertical && styles.contentVertical]}>
                    {isVertical ? (
                        <>
                            <Text style={styles.text}>{text}</Text>
                            <Ionicons name={iconName} size={28} color={AppColors.white} />
                        </>
                    ) : (
                        <>
                            <Ionicons name={iconName} size={20} color={AppColors.white} />
                            <Text style={styles.text}>{text}</Text>
                        </>
                    )}
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1.2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // subtle white tint for better glass effect
    },
    blurContainer: {
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    contentVertical: {
        flexDirection: 'column',
        gap: 16,
        paddingHorizontal: 20,
        paddingVertical: 24,
        minHeight: 110,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.white,
        textAlign: 'center',
    },
});