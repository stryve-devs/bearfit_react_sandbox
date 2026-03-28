import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { AppColors } from '../../../constants/colors';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GlassButtonProps {
    text: string;
    onPress: () => void;
    style?: ViewStyle;
    intensity?: number;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
                                                            text,
                                                            onPress,
                                                            style,
                                                            intensity = 90,
                                                        }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = async () => {
        scale.value = withSpring(0.95);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <BlurView intensity={intensity} style={[styles.container, style]}>
            <AnimatedTouchable
                style={[styles.button, animatedStyle]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <Text style={styles.text}>{text}</Text>
            </AnimatedTouchable>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },
});