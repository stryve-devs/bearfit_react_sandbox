import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withRepeat,
    withSequence
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ORANGE = "#FF7825";

export default function DayWorkoutScreen() {
    const router = useRouter();
    const { day, monthLabel } = useLocalSearchParams();

    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);
    const float = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 15 });
        opacity.value = withTiming(1, { duration: 800 });
        // Subtle floating animation for the icon
        float.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 2000 }),
                withTiming(0, { duration: 2000 })
            ),
            -1
        );
    }, []);

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: float.value }],
    }));

    return (
        <View style={styles.container}>
            {/* CINEMATIC BACKGROUND */}
            <View style={styles.spotlight} />
            <LinearGradient
                colors={["#080808", "#121212"]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* MINIMALIST HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backCircle}
                    >
                        <Feather name="arrow-left" size={22} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerTextGroup}>
                        <Text style={styles.dateLabel}>{monthLabel}</Text>
                        <Text style={styles.dayLabel}>Day {day}</Text>
                    </View>

                    <View style={styles.placeholder} />
                </View>

                <Animated.View style={[styles.content, animatedCardStyle]}>
                    {/* THE GLASS BENTO CARD */}
                    <View style={styles.bentoCard}>
                        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

                        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                            <LinearGradient
                                colors={["rgba(255,120,37,0.2)", "rgba(255,120,37,0)"]}
                                style={styles.iconGlow}
                            />
                            <Feather name="zap-off" size={48} color={ORANGE} />
                        </Animated.View>

                        <Text style={styles.mainTitle}>Rest & Recovery</Text>
                        <Text style={styles.subTitle}>
                            The engine is cooling down. No activity was logged for this 24-hour cycle.
                        </Text>

                        <View style={styles.actionSection}>
                            <TouchableOpacity
                                style={styles.primaryBtn}
                                onPress={() => router.push("/Profile/workout-log")}
                            >
                                <LinearGradient
                                    colors={[ORANGE, "#FF4D00"]}
                                    style={StyleSheet.absoluteFill}
                                    start={{x:0, y:0}}
                                    end={{x:1, y:1}}
                                />
                                <Text style={styles.primaryBtnText}>Log Activity</Text>
                                <Feather name="plus" size={18} color="#fff" style={{marginLeft: 8}} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryBtn}
                                onPress={() => router.back()}
                            >
                                <Text style={styles.secondaryBtnText}>View Calendar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* DECORATIVE FOOTER QUOTE */}
                    <Text style={styles.quote}>"Discipline is doing what needs to be done, even if you don't feel like it."</Text>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    spotlight: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: SCREEN_WIDTH * 1.2,
        height: SCREEN_WIDTH * 1.2,
        borderRadius: 1000,
        backgroundColor: ORANGE,
        opacity: 0.08,
        filter: Platform.OS === 'ios' ? 'blur(100px)' : undefined,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerTextGroup: {
        alignItems: 'center',
    },
    dateLabel: {
        color: '#666',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    dayLabel: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
    },
    placeholder: { width: 48 },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    bentoCard: {
        borderRadius: 28,
        padding: 22,
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    iconContainer: {
        width: 90,
        height: 90,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    iconGlow: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        filter: 'blur(20px)',
    },
    mainTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 12,
        textAlign: 'center',
    },
    subTitle: {
        color: '#888',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
    },
    actionSection: {
        width: '100%',
        gap: 12,
    },
    primaryBtn: {
        height: 48,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    secondaryBtn: {
        height: 48,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    secondaryBtnText: {
        color: '#666',
        fontSize: 15,
        fontWeight: '700',
    },
    quote: {
        color: '#333',
        fontSize: 13,
        fontWeight: '600',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 40,
        paddingHorizontal: 20,
    }
});