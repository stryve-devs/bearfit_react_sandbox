import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AnimatedReanimated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { AppColors } from '../../constants/colors';

const ReanimatedPressable =
    AnimatedReanimated.createAnimatedComponent(Pressable);

type GlassActionCardProps = {
    title: string;
    iconName: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    vertical?: boolean;
    delay?: number;
    style?: any;
};
function GlassActionCard({
                             title,
                             iconName,
                             onPress,
                             vertical = false,
                             delay = 0,
                             style,
                         }: GlassActionCardProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: withTiming(1, { duration: 250 }),
        };
    });

    return (
        <AnimatedReanimated.View
            entering={FadeInDown.delay(delay).springify()}
            style={style}
        >
            <ReanimatedPressable
                onPressIn={() => {
                    scale.value = withSpring(0.97);
                }}
                onPressOut={() => {
                    scale.value = withSpring(1);
                }}
                onPress={onPress}
                style={[animatedStyle]}
            >
                <View style={styles.glassOuter}>

                    {/* subtle inner glow */}
                    <LinearGradient
                        colors={[
                            'rgba(255,255,255,0.10)',
                            'rgba(255,255,255,0.03)',
                            'rgba(255,120,37,0.06)',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.glassInner}
                    >
                        {/* highlight overlay */}
                        <LinearGradient
                            colors={[
                                'rgba(255,255,255,0.18)',
                                'transparent',
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.glassHighlight}
                        />

                        <View
                            style={[
                                styles.buttonContent,
                                vertical
                                    ? styles.buttonContentVertical
                                    : styles.buttonContentRow,
                            ]}
                        >
                            {vertical ? (
                                <>
                                    <Text style={styles.glassButtonText}>{title}</Text>

                                    <View style={styles.iconWrap}>
                                        <LinearGradient
                                            colors={[
                                                'rgba(255,255,255,0.18)',
                                                'rgba(255,120,37,0.15)',
                                            ]}
                                            style={styles.iconGradient}
                                        >
                                            <Ionicons
                                                name={iconName}
                                                size={20}
                                                color={AppColors.white}
                                            />
                                        </LinearGradient>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={styles.iconWrap}>
                                        <LinearGradient
                                            colors={[
                                                'rgba(255,255,255,0.18)',
                                                'rgba(255,120,37,0.15)',
                                            ]}
                                            style={styles.iconGradient}
                                        >
                                            <Ionicons
                                                name={iconName}
                                                size={20}
                                                color={AppColors.white}
                                            />
                                        </LinearGradient>
                                    </View>

                                    <Text style={styles.glassButtonText}>{title}</Text>
                                </>
                            )}
                        </View>
                    </LinearGradient>
                </View>
            </ReanimatedPressable>
        </AnimatedReanimated.View>
    );
}

export default function MainWorkoutScreen() {
    const router = useRouter();
    const [navIndex, setNavIndex] = useState(1);


    const handleNavTap = (index: number) => {
        setNavIndex(index);
        if (index === 0) {
            router.push('/(tabs)');
        } else if (index === 2) {
            router.push('/(tabs)/profile');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>



                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >


                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Quick Start</Text>
                                <Text style={styles.sectionSubtitle}>
                                    Jump right into your workout
                                </Text>

                                <View style={styles.mediumSpacing} />

                                <GlassActionCard
                                    title="Start Empty Workout"
                                    iconName="add"
                                    vertical={false}
                                    delay={180}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setTimeout(() => {
                                            router.push('/(tabs)/Workout/log');
                                        }, 50);
                                    }}
                                />
                            </View>

                            <View style={styles.largeSpacing} />

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Routines</Text>
                                <Text style={styles.sectionSubtitle}>
                                    Build or explore your plans
                                </Text>

                                <View style={styles.mediumSpacing} />

                                <View style={styles.cardsRow}>
                                    <GlassActionCard
                                        title="New Routine"
                                        iconName="sparkles"
                                        vertical
                                        delay={260}
                                        style={styles.cardButton}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setTimeout(() => {
                                                router.push('/(tabs)/Workout/routine');
                                            }, 50);
                                        }}
                                    />

                                    <View style={styles.cardGapHorizontal} />

                                    <GlassActionCard
                                        title="Explore Routines"
                                        iconName="compass"
                                        vertical
                                        delay={340}
                                        style={styles.cardButton}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setTimeout(() => {
                                                router.push('/(tabs)/Workout/explore');
                                            }, 50);
                                        }}
                                    />
                                </View>
                            </View>

                            <View style={styles.bottomGap} />
                        </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090909',
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 20,
        paddingTop: 20
    },

    section: {
        paddingHorizontal: 14,
        marginTop: 8,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },

    sectionSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.55)',
        marginTop: 4,
    },

    mediumSpacing: {
        height: 18,
    },

    largeSpacing: {
        height: 14,
    },

    glassButtonOuter: {
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: AppColors.orange,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
        backgroundColor: 'rgba(255,255,255,0.05)'
    },

    glassButtonInner: {
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 18,
        minHeight: 92,
        justifyContent: 'center',
    },

    buttonContent: {
        alignItems: 'center',
    },

    buttonContentRow: {
        flexDirection: 'row',
        gap: 14,
    },

    buttonContentVertical: {
        justifyContent: 'center',
        gap: 12,
    },

    iconWrap: {
        borderRadius: 10,
        overflow: 'hidden',
    },

    iconGradient: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,120,37,0.20)',
    },

    glassButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        flexShrink: 1,
    },

    cardsRow: {
        flexDirection: 'row',
    },

    cardButton: {
        flex: 1,
    },

    cardGapHorizontal: {
        width: 12,
    },

    bottomGap: {
        height: 42,
    },
    glassOuter: {
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: 'rgba(20,20,20,0.75)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },

    glassInner: {
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 18,
        minHeight: 92,
        justifyContent: 'center',
    },

    glassHighlight: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 22,
        opacity: 0.4,
    },
});