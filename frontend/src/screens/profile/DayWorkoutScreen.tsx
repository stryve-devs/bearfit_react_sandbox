import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import AnimatedRe, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
} from "react-native-reanimated";

const ORANGE = "#FF7825";

// Helper to prevent BlurView from clipping border radius on Android
const BlurContainer = ({ children, style, intensity = 60 }) => (
    <View style={[style, { overflow: 'hidden' }]}>
        <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
        {children}
    </View>
);

export default function DayWorkoutScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const day = params.day ?? "Today";
    const monthLabel = params.monthLabel ?? "February 2026";

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const cardScale = useSharedValue(0.92);
    const contentOpacity = useSharedValue(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
        }).start();

        cardScale.value = withSpring(1, { damping: 14, stiffness: 120 });
        contentOpacity.value = withTiming(1, { duration: 500 });
    }, []);

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
        opacity: contentOpacity.value,
    }));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["rgba(255,120,37,0.12)", "transparent"]}
                start={{ x: 0.9, y: 0 }}
                end={{ x: 0.2, y: 0.6 }}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {/* FIXED HEADER: Ensuring title is perfectly centered */}
                <View style={styles.header}>
                    <BlurContainer style={styles.iconBtn} intensity={60}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.iconPress}
                            activeOpacity={0.7}
                        >
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>
                    </BlurContainer>

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {day} • {monthLabel}
                        </Text>
                    </View>

                    {/* Spacer to balance the back button for true centering */}
                    <View style={styles.headerSpacer} />
                </View>

                <Animated.View style={[styles.centerWrap, { opacity: fadeAnim }]}>
                    <AnimatedRe.View style={[styles.glassCard, animatedCardStyle]}>
                        <BlurContainer style={styles.blurFill} intensity={75}>
                            <View style={styles.iconCircle}>
                                <Feather name="calendar" size={42} color="#d9d9d9" />
                            </View>

                            <Text style={styles.emptyText}>
                                No workouts on this day
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.buttonWrap}
                                onPress={() => router.push("/Profile/workout-log")}
                            >
                                <LinearGradient
                                    colors={[ORANGE, "#ff8d47"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.logButton}
                                >
                                    <Text style={styles.logButtonText}>
                                        Log a workout
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </BlurContainer>
                    </AnimatedRe.View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#080808",
    },
    safeArea: {
        flex: 1,
    },
    header: {
        marginHorizontal: 16,
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 8,
    },
    headerTitle: {
        color: "#FF7825",
        fontSize: 18,
        fontWeight: "700",
    },
    headerSpacer: {
        width: 44, // Matches iconBtn width
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    iconPress: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    centerWrap: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center', // Centers the card vertically
        paddingBottom: 60, // Slight offset for visual balance
    },
    glassCard: {
        borderRadius: 32,
        backgroundColor: "rgba(255,255,255,0.035)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        // Shadow fixes for iOS
        ...Platform.select({
            ios: {
                shadowColor: ORANGE,
                shadowOpacity: 0.1,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 10 },
            }
        })
    },
    blurFill: {
        paddingVertical: 40,
        paddingHorizontal: 24,
        alignItems: "center",
        borderRadius: 32,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        marginBottom: 24,
    },
    emptyText: {
        color: "#aaa",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
        marginBottom: 32,
    },
    buttonWrap: {
        width: "100%",
    },
    logButton: {
        width: "100%",
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    logButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});