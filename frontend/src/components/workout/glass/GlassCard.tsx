import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { AppColors } from '../../../constants/colors';

const RadialGlow = ({ size = 400, color = AppColors.orange, style }: { size?: number; color?: string; style?: any }) => {
    return (
        <Svg width={size} height={size} style={style}>
            <Defs>
                <RadialGradient id="grad" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={color} stopOpacity="0.15" />
                    <Stop offset="50%" stopColor={color} stopOpacity="0.07" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0" />
                </RadialGradient>
            </Defs>
            <Rect width={size} height={size} fill="url(#grad)" />
        </Svg>
    );
};

const AnimatedGlow = Animated.createAnimatedComponent(RadialGlow);

export const GlassCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const x1 = useSharedValue(0);
    const y1 = useSharedValue(0);
    const scale1 = useSharedValue(1);

    const x2 = useSharedValue(0);
    const y2 = useSharedValue(0);
    const scale2 = useSharedValue(1);

    useEffect(() => {
        // Drift animation
        x1.value = withRepeat(withTiming(30, { duration: 8000, easing: Easing.inOut(Easing.sin) }), -1, true);
        y1.value = withRepeat(withTiming(20, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true);
        scale1.value = withRepeat(withTiming(1.05, { duration: 7000, easing: Easing.inOut(Easing.sin) }), -1, true);

        x2.value = withRepeat(withTiming(-40, { duration: 8500, easing: Easing.inOut(Easing.sin) }), -1, true);
        y2.value = withRepeat(withTiming(-30, { duration: 9500, easing: Easing.inOut(Easing.sin) }), -1, true);
        scale2.value = withRepeat(withTiming(1.08, { duration: 7500, easing: Easing.inOut(Easing.sin) }), -1, true);
    }, []);

    const glow1Style = useAnimatedStyle(() => ({
        transform: [
            { translateX: x1.value },
            { translateY: y1.value },
            { scale: scale1.value },
        ],
    }));

    const glow2Style = useAnimatedStyle(() => ({
        transform: [
            { translateX: x2.value },
            { translateY: y2.value },
            { scale: scale2.value },
        ],
    }));

    return (
        <View style={styles.container}>
            {/* Single top-left glow */}
            <AnimatedGlow size={500} style={[styles.glowTopLeft, glow1Style]} />

            {/* Single bottom-right glow */}
            <AnimatedGlow size={600} style={[styles.glowBottomRight, glow2Style]} />

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'visible',
    },
    glowTopLeft: {
        position: 'absolute',
        top: -150,
        left: -150,
    },
    glowBottomRight: {
        position: 'absolute',
        bottom: -200,
        right: -200,
    },
});