import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
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

export default function DayWorkoutScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const day = params.day ?? "Today";
    const monthLabel = params.monthLabel ?? "February 2026";

    // Animated API
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Reanimated 2
    const cardScale = useSharedValue(0.92);
    const contentOpacity = useSharedValue(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
        }).start();

        cardScale.value = withSpring(1, {
            damping: 14,
            stiffness: 120,
        });

        contentOpacity.value = withTiming(1, {
            duration: 500,
        });
    }, [cardScale, contentOpacity, fadeAnim]);

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

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <BlurView intensity={60} tint="dark" style={styles.iconBtn}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.iconPress}
                            activeOpacity={0.7}
                        >
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>
                    </BlurView>

                    <Text style={styles.headerTitle}>
                        {day} • {monthLabel}
                    </Text>

                    <View style={styles.headerSpacer} />
                </View>

                <Animated.View style={[styles.centerWrap, { opacity: fadeAnim }]}>
                    <AnimatedRe.View style={[styles.glassCard, animatedCardStyle]}>
                        <BlurView intensity={75} tint="dark" style={styles.blurFill}>
                            <View style={styles.iconCircle}>
                                <Feather name="calendar" size={42} color="#d9d9d9" />
                            </View>

                            <Text style={styles.emptyText}>
                                No workouts on this day
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.85}
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
                        </BlurView>
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
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        color: "#FF7825",
        fontSize: 18,
        fontWeight: "600",
        marginRight: 44,
    },
    headerSpacer: {
        width: 44,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
    iconPress: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    centerWrap: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 70,
    },
    glassCard: {
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.035)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        shadowColor: ORANGE,
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 6 },
    },
    blurFill: {
        paddingVertical: 28,//40
        paddingHorizontal: 16,//20
        alignItems: "center",
    },
    iconCircle: {
        width: 104,
        height: 104,
        borderRadius: 52,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        marginBottom: 22,
    },
    emptyText: {
        color: "#9d9d9d",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 30,
    },
    buttonWrap: {
        width: "100%",
    },
    logButton: {
        width: "100%",
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    logButtonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
});