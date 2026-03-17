import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Animated,
    Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ORANGE = "#FF7825";

// ─── Conic Spin Component (Tailwind Logic) ──────────────────────────────────
const GlowingCard = ({ children, containerStyle }: any) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 9000,
                easing: Easing.linear, // Changed to linear for consistent spin speed
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View style={[styles.glowContainer, containerStyle]}>
            <Animated.View style={[styles.gradientLayer, { transform: [{ rotate }] }]}>
                <View style={styles.conicBeam} />
            </Animated.View>
            <View style={styles.innerCard}>
                {children}
            </View>
        </View>
    );
};

export default function ProfileScreen() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState<"Duration" | "Volume" | "Reps">("Duration");

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.topHeader}>
                    <Text style={styles.topName}>Arthika</Text>
                    <View style={styles.topIconRow}>
                        <TouchableOpacity onPress={() => router.push("/Profile/edit-profile")}>
                            <Ionicons name="pencil-outline" size={26} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: 20 }}><Ionicons name="share-social-outline" size={26} color="white" /></TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => router.push('/Profile/Settings')}><Ionicons name="settings-outline" size={26} color="white" /></TouchableOpacity>
                    </View>
                </View>

                {/* Profile Info */}
                <View style={styles.profileInfoRow}>
                    <Image source={{ uri: "https://i.pravatar.cc/150" }} style={styles.largeAvatar} />
                    <View style={styles.userInfoColumn}>
                        <Text style={styles.username}>Arthika</Text>
                        <View style={styles.statsRow}>
                            <StatBlock num="12" label="Workouts" />
                            <StatBlock num="240" label="Followers" />
                            <StatBlock num="180" label="Following" />
                        </View>
                    </View>
                </View>

                {/* ===== RESTORED: GRAPH CARD (No data yet) ===== */}
                <View style={styles.standardCard}>
                    <View style={styles.cardContent}>
                        <MaterialCommunityIcons name="chart-bar" size={40} color="#333" />
                        <Text style={styles.noData}>No data yet</Text>
                    </View>
                </View>

                {/* ===== RESTORED: TOGGLE BUTTONS ===== */}
                <View style={styles.toggleRow}>
                    {["Duration", "Volume", "Reps"].map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.toggleButton,
                                selectedTab === item && styles.activeToggle,
                            ]}
                            onPress={() => setSelectedTab(item as any)}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    selectedTab === item && styles.activeToggleText,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Dashboard Grid */}
                <Text style={styles.sectionTitle}>Dashboard</Text>
                <View style={styles.dashboardGrid}>
                    <DashboardButton icon="chart-line" label="Statistics" />
                    <DashboardButton icon="dumbbell" label="Exercises" />
                    <DashboardButton icon="human-male-height" label="Measures" />
                    <DashboardButton icon="calendar" label="Calendar" />
                </View>

                {/* Workouts */}
                <Text style={styles.sectionTitle}>Recent Sessions</Text>
                <View style={styles.standardCard}>
                    <View style={styles.cardContent}>
                        <MaterialCommunityIcons name="dumbbell" size={40} color="#333" />
                        <Text style={styles.noData}>No recent workouts</Text>
                    </View>
                </View>

                {/* Start Tracking */}
                <TouchableOpacity style={styles.startTracking}>
                    <Text style={styles.startText}>Start tracking here</Text>
                    <Ionicons name="chevron-down" size={18} color={ORANGE} />
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles & Helpers ────────────────────────────────────────────────────────

const StatBlock = ({ num, label }: any) => (
    <View style={styles.statBlock}><Text style={styles.statNumber}>{num}</Text><Text style={styles.statLabel}>{label}</Text></View>
);

const DashboardButton = ({ icon, label }: any) => (
    <GlowingCard containerStyle={styles.dashWrapper}>
        <View style={styles.dashContent}>
            <View style={styles.iconCircle}><MaterialCommunityIcons name={icon} size={20} color="white" /></View>
            <Text style={styles.dashText}>{label}</Text>
        </View>
    </GlowingCard>
);

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#000" },
    container: { flex: 1, paddingHorizontal: 16 },

    // Header & Info
    topHeader: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
    topName: { color: "white", fontSize: 24, fontWeight: "bold" },
    topIconRow: { flexDirection: "row", alignItems: "center" },
    profileInfoRow: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
    largeAvatar: { width: 84, height: 84, borderRadius: 42, marginRight: 20, backgroundColor: "#222" },
    userInfoColumn: { flex: 1 },
    username: { color: "white", fontSize: 18, fontWeight: "700", marginBottom: 10 },
    statsRow: { flexDirection: "row", justifyContent: "space-between" },
    statBlock: { alignItems: "center" },
    statNumber: { color: ORANGE, fontSize: 16, fontWeight: "bold" },
    statLabel: { color: "#888", fontSize: 12 },

    // THE TAILWIND REPLICA GLOW
    glowContainer: {
        borderRadius: 16,
        overflow: "hidden",
        padding: 2.0,
        backgroundColor: "#111"
    },
    gradientLayer: {
        position: "absolute",
        width: "200%",
        height: "200%",
        top: "-50%",
        left: "-50%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    conicBeam: {
        width: '45%',
        height: '150%',
        backgroundColor: ORANGE,
        opacity: 0.5,
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 15,
    },
    innerCard: {
        backgroundColor: "#080808",
        borderRadius: 15,
        overflow: "hidden"
    },

    // Toggle Buttons
    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 20,
    },
    toggleButton: {
        flex: 1,
        backgroundColor: "#111",
        paddingVertical: 10,
        marginHorizontal: 4,
        borderRadius: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#222"
    },
    activeToggle: {
        backgroundColor: ORANGE,
        borderColor: ORANGE,
    },
    toggleText: {
        color: "#aaa",
        fontSize: 13,
    },
    activeToggleText: {
        color: "white",
        fontWeight: "bold",
    },

    // Dashboard Grid
    dashboardGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    dashWrapper: { width: "48.5%", marginBottom: 18, },
    dashContent: { flexDirection: "row", alignItems: "center", padding: 26 },
    iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#151515", justifyContent: "center", alignItems: "center", marginRight: 10 },
    dashText: { color: "white", fontSize: 14, fontWeight: "500" },

    // Misc
    sectionTitle: { color: "white", fontSize: 17, fontWeight: "700", marginTop: 8, marginBottom: 16 },
    standardCard: { backgroundColor: "#080808", borderRadius: 16, borderWidth: 1, borderColor: "#1a1a1a" },
    cardContent: { paddingVertical: 40, alignItems: "center" },
    noData: { color: "#555", marginTop: 10 },
    startTracking: { marginTop: 24, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 4 },
    startText: { color: ORANGE, fontSize: 15, fontWeight: "600" },
});