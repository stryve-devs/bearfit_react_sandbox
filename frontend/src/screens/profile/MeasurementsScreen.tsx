import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";

const ORANGE = "#FF7825";

export default function MeasurementsScreen() {
    const router = useRouter();
    const contentOpacity = useSharedValue(1);

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ scale: interpolate(contentOpacity.value, [0.5, 1], [0.98, 1]) }],
    }));

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <BlurContainer style={styles.iconBtn}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconPress}>
                            <Feather name="chevron-left" size={22} color="#fff" />
                        </TouchableOpacity>
                    </BlurContainer>
                    <Text style={styles.title}>Measurements</Text>
                    <View style={{ width: 44 }} />
                </View>

                <Animated.View style={[styles.content, animatedContentStyle]}>
                    <BlurContainer style={styles.featureCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardIcon}>
                                <Feather name="activity" size={26} color={ORANGE} />
                            </View>
                        </View>

                        <Text style={styles.mainText}>Body Metrics</Text>
                        <Text style={styles.subText}>
                            Capture new stats or revisit your full transformation story with a richer visual history.
                        </Text>
                    </BlurContainer>

                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            activeOpacity={0.85}
                            onPress={() => router.push("/Profile/add-measurement")}
                        >
                            <Text style={styles.primaryBtnText}>+ Add Measurement</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            activeOpacity={0.8}
                            onPress={() => router.push("/Profile/measurements-history")}
                        >
                            <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
                            <Text style={styles.secondaryBtnText}>View Measurements</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const BlurContainer = ({ children, style }: any) => (
    <View style={[style, { overflow: 'hidden' }]}>
        <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={StyleSheet.absoluteFill} />
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#080808" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    title: { color: ORANGE, fontSize: 18, fontWeight: "700" },
    iconBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    iconPress: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
    featureCard: {
        borderRadius: 30,
        padding: 28,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.01)",
        marginBottom: 35,
    },
    cardHeader: { marginBottom: 20 },
    cardIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 120, 37, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainText: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 8 },
    subText: { color: "#888", fontSize: 13, lineHeight: 20, fontWeight: "500" },
    actionSection: { gap: 14 },
    primaryBtn: {
        height: 60,
        backgroundColor: ORANGE,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    secondaryBtn: {
        height: 60,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        overflow: 'hidden',
        backgroundColor: "rgba(255,255,255,0.02)",
    },
    secondaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
