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
    Platform,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const ORANGE  = "#FF7825";
const ORANGE2 = "#ff5500";
const TEXT    = "#f0ede8";
const MUTED   = "rgba(240,237,232,0.42)";
const HINT    = "rgba(240,237,232,0.18)";
const GLASS_B = "rgba(255,255,255,0.07)";
const BG      = "#080808";
const { width: SW } = Dimensions.get("window");

const CARD_W   = (SW - 32 - 12) / 2;
const BORDER_R = 18;

// ─── Bar data ─────────────────────────────────────────────────────────────────
const BAR_DATA: Record<string, number[]> = {
    Duration: [25, 55, 40, 75, 60, 35, 50],
    Volume:   [60, 30, 80, 45, 70, 55, 20],
    Reps:     [40, 65, 30, 55, 80, 45, 60],
};
const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const ACTIVE_DAY = 3;

// HTML animation-delay offsets for a 9s cycle
const DASH_ITEMS = [
    {label: "Statistics", icon: "chart-line", startOffset: 0, route: "/Profile/statistics",},
    { label: "Exercises",     icon: "dumbbell",          startOffset: 0.33 },
    { label: "Measures",      icon: "human-male-height", startOffset: 0.17,     route: "/Profile/measurements"},
    {label: "Calendar", icon: "calendar", startOffset: 0.56, sub: "", route: "/Profile/calendar"},

] as const;

// ─── AvatarRing ───────────────────────────────────────────────────────────────
function AvatarRing() {
    return (
        <View style={ringSt.container}>
            <View style={ringSt.staticLayer}>
                <LinearGradient
                    colors={["transparent", ORANGE, "transparent"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    locations={[0.2, 0.5, 0.8]}
                    style={ringSt.beam}
                />
            </View>
            <View style={ringSt.mask} />
        </View>
    );
}

// ─── GlowCard ────────────────────────────────────────────────────────────────
function GlowCard({
                      label, sub, icon, startOffset = 0, onPress,
                  }: {
    label: string; sub: string; icon: string; startOffset?: number; onPress?: () => void;
}) {
    const rot = useRef(new Animated.Value(startOffset)).current;
    const flash = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rot, {
                toValue: startOffset + 1,
                duration: 9000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const rotate = rot.interpolate({
        inputRange: [startOffset, startOffset + 1],
        outputRange: ["0deg", "360deg"],
    });

    const flashBg = flash.interpolate({
        inputRange: [0, 1],
        outputRange: ["rgba(255,120,37,0.00)", "rgba(255,120,37,0.12)"],
    });

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: false }),
            Animated.timing(flash, { toValue: 0, duration: 220, useNativeDriver: false }),
        ]).start();
        onPress?.();
    };

    return (
        <TouchableOpacity style={glowSt.wrap} activeOpacity={0.85} onPress={handlePress}>

            {/* Spinning beam — Simulates HTML conic-gradient exactly */}
            <View style={glowSt.spinContainer}>
                <Animated.View style={[glowSt.spinLayer, { transform: [{ rotate }] }]}>
                    <LinearGradient
                        colors={["transparent", ORANGE, "transparent"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        locations={[0.35, 0.5, 0.65]}
                        style={glowSt.beam}
                    />
                </Animated.View>
            </View>

            {/* Card inner — LinearGradient gives glassmorphism depth */}
            <LinearGradient
                colors={["rgba(22,22,26,0.98)", "rgba(12,12,14,0.99)"]}
                start={{ x: 0.145, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={glowSt.inner}
            >
                {/* Top shine line */}
                <LinearGradient
                    colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={glowSt.shineLine}
                    pointerEvents="none"
                />
                {/* Bottom orange warmth */}
                <LinearGradient
                    colors={["rgba(255,120,37,0.04)", "transparent"]}
                    start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: 0 }}
                    style={glowSt.bottomGlow}
                    pointerEvents="none"
                />
                {/* Press flash */}
                <Animated.View
                    style={[glowSt.flashOverlay, { backgroundColor: flashBg }]}
                    pointerEvents="none"
                />

                {/* Content */}
                <View style={glowSt.dashContent}>
                    <LinearGradient
                        colors={["rgba(255,120,37,0.15)", "rgba(255,120,37,0.06)"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={glowSt.iconCircle}
                    >
                        <MaterialCommunityIcons name={icon as any} size={18} color={ORANGE} />
                    </LinearGradient>
                    <View>
                        <Text style={glowSt.dashText}>{label}</Text>
                        <Text style={glowSt.dashSub}>{sub}</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

// ─── SparkBars ────────────────────────────────────────────────────────────────
function SparkBars({ tab }: { tab: string }) {
    const heights = BAR_DATA[tab] ?? BAR_DATA.Duration;
    return (
        <View>
            <View style={chartSt.row}>
                {heights.map((h, i) => (
                    <LinearGradient
                        key={i}
                        colors={
                            i === ACTIVE_DAY
                                ? ["rgba(255,120,37,0.20)", "rgba(255,120,37,0.65)"]
                                : ["rgba(255,120,37,0.04)", "rgba(255,120,37,0.15)"]
                        }
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={[
                            chartSt.bar,
                            { height: (h / 100) * 80 },
                            i === ACTIVE_DAY && chartSt.barActive,
                        ]}
                    />
                ))}
            </View>
            <View style={chartSt.labelsRow}>
                {DAY_LABELS.map((d) => (
                    <Text key={d} style={chartSt.lbl}>{d}</Text>
                ))}
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
    const router = useRouter();
    const [tab, setTab] = useState<"Duration" | "Volume" | "Reps">("Duration");

    return (
        <LinearGradient
            colors={[
                "#0e0e11",   // top — slightly blue-black
                "#0a0906",   // upper mid — very slightly warm
                "#080808",   // centre — pure dark
                "#0a0906",   // lower mid — warm again
                "#0b0b0e",   // bottom — slightly cool
            ]}
            locations={[0, 0.2, 0.5, 0.75, 1]}
            start={{ x: 0.16, y: 0 }}
            end={{ x: 0.84, y: 1 }}
            style={{ flex: 1 }}
        >
            {/* Subtle corner glows */}
            <LinearGradient
                colors={["rgba(255,100,20,0.06)", "transparent"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.3, y: 0.4 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />
            <LinearGradient
                colors={["rgba(80,50,200,0.03)", "transparent"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0.5, y: 0.6 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            <SafeAreaView style={st.safe}>

                {/* Header */}
                <View style={st.topHeader}>
                    <Text style={st.topName}>Arthika</Text>
                    <View style={st.iconRow}>
                        <TouchableOpacity style={st.iconBtn} activeOpacity={0.7}
                                          onPress={() => router.push("/Profile/edit-profile")}>
                            <Ionicons name="pencil-outline" size={17} color={TEXT} />
                        </TouchableOpacity>
                        <TouchableOpacity style={st.iconBtn} activeOpacity={0.7}>
                            <Ionicons name="share-social-outline" size={17} color={TEXT} />
                        </TouchableOpacity>
                        <TouchableOpacity style={st.iconBtn} activeOpacity={0.7}
                                          onPress={() => router.push("/Profile/Settings")}>
                            <Ionicons name="settings-outline" size={17} color={TEXT} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile row */}
                <View style={st.profileRow}>
                    <View style={st.avatarWrap}>
                        <AvatarRing />
                        <Image
                            source={{ uri: "https://i.pravatar.cc/150?img=32" }}
                            style={st.avatarImg}
                        />
                        <View style={st.onlineDot} />
                    </View>
                    <View style={st.userInfo}>
                        <Text style={st.username}>Arthika</Text>
                        <View style={st.statsRow}>
                            <View style={st.statBlock}>
                                <Text style={st.statNum}>12</Text>
                                <Text style={st.statLbl}>Workouts</Text>
                            </View>
                            <View style={st.statDivider} />
                            <View style={st.statBlock}>
                                <Text style={st.statNum}>240</Text>
                                <Text style={st.statLbl}>Followers</Text>
                            </View>
                            <View style={st.statDivider} />
                            <View style={st.statBlock}>
                                <Text style={st.statNum}>180</Text>
                                <Text style={st.statLbl}>Following</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Scroll */}
                <ScrollView
                    style={st.scroll}
                    contentContainerStyle={st.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Chart card */}
                    <LinearGradient
                        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={st.chartCard}
                    >
                        <LinearGradient
                            colors={["transparent", "rgba(255,255,255,0.09)", "transparent"]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={st.chartShine}
                            pointerEvents="none"
                        />
                        <View style={st.chartInner}>
                            <Text style={st.chartLabel}>{tab} — This week</Text>
                            <SparkBars tab={tab} />
                        </View>
                    </LinearGradient>

                    {/* Toggle */}
                    <View style={st.toggleRow}>
                        {(["Duration", "Volume", "Reps"] as const).map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[st.toggleBtn, tab === item && st.toggleActive]}
                                onPress={() => setTab(item)}
                                activeOpacity={0.8}
                            >
                                {tab === item && (
                                    <LinearGradient
                                        colors={[ORANGE, ORANGE2]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                )}
                                <Text style={[st.toggleTxt, tab === item && st.toggleActiveTxt]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Dashboard */}
                    <Text style={st.sectionTitle}>Dashboard</Text>
                    <View style={st.dashGrid}>
                        {DASH_ITEMS.map((item) => (
                            <GlowCard
                                key={item.label}
                                label={item.label}
                                sub={item.sub}
                                icon={item.icon}
                                startOffset={item.startOffset}
                                onPress={() => {
                                    if (item.route) {
                                        router.push(item.route);
                                    }
                                }}
                            />
                        ))}
                    </View>

                    {/* Recent sessions */}
                    <Text style={st.sectionTitle}>Recent Sessions</Text>
                    <LinearGradient
                        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={st.sessionCard}
                    >
                        <LinearGradient
                            colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={st.chartShine}
                            pointerEvents="none"
                        />
                        <Feather name="heart" size={38} color="rgba(255,255,255,0.12)" />
                        <Text style={st.noDataText}>No recent workouts yet</Text>
                    </LinearGradient>

                    {/* Start tracking */}
                    <TouchableOpacity style={st.startRow} activeOpacity={0.8}>
                        <Text style={st.startText}>Start tracking here</Text>
                        <Feather name="chevron-down" size={16} color={ORANGE} />
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

// ─── Main styles ──────────────────────────────────────────────────────────────
const st = StyleSheet.create({
    safe: { flex: 1 },

    topHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 22, paddingTop: 8, paddingBottom: 14,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.04)",
    },
    topName: { fontSize: 26, fontWeight: "700", color: TEXT, letterSpacing: -0.6 },
    iconRow: { flexDirection: "row", alignItems: "center", gap: 18 },
    iconBtn: {
        width: 36, height: 36,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 12, alignItems: "center", justifyContent: "center",
    },

    profileRow: {
        flexDirection: "row", alignItems: "center",
        gap: 20, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 0,
    },
    avatarWrap: { width: 84, height: 84, position: "relative", flexShrink: 0 },
    avatarImg: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: "#1a1a1a",
        position: "absolute", top: 2, left: 2, zIndex: 2,
    },
    onlineDot: {
        position: "absolute", bottom: 3, right: 3,
        width: 14, height: 14, borderRadius: 7,
        backgroundColor: "#34c759", borderWidth: 2.5, borderColor: BG, zIndex: 3,
    },
    userInfo: { flex: 1 },
    username: {
        fontSize: 18, fontWeight: "700", color: TEXT,
        letterSpacing: -0.3, marginBottom: 12,
    },
    statsRow: { flexDirection: "row", alignItems: "center" },
    statBlock: { flex: 1, alignItems: "center" },
    statNum: { fontSize: 17, fontWeight: "700", color: ORANGE, letterSpacing: -0.3 },
    statLbl: { fontSize: 10, color: MUTED, marginTop: 2, letterSpacing: 0.3 },
    statDivider: { width: 0.5, height: 28, backgroundColor: "rgba(255,255,255,0.07)" },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },

    chartCard: {
        marginTop: 20,
        borderWidth: 0.5, borderColor: GLASS_B,
        borderRadius: 22, overflow: "hidden", position: "relative",
    },
    chartShine: {
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
    },
    chartInner: { padding: 20 },
    chartLabel: {
        fontSize: 11, fontWeight: "600", color: MUTED,
        letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 14,
    },

    toggleRow: { flexDirection: "row", gap: 6, marginTop: 18 },
    toggleBtn: {
        flex: 1, paddingVertical: 9,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 20, alignItems: "center",
        overflow: "hidden", position: "relative",
    },
    toggleActive: {
        borderColor: "transparent",
        ...Platform.select({
            ios: { shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12 },
            android: { elevation: 8 },
        }),
    },
    toggleTxt: { fontSize: 13, fontWeight: "500", color: MUTED },
    toggleActiveTxt: { color: "#fff", fontWeight: "700" },

    sectionTitle: {
        fontSize: 16, fontWeight: "700", color: TEXT,
        letterSpacing: -0.3, marginTop: 24, marginBottom: 14,
    },

    dashGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

    sessionCard: {
        borderWidth: 0.5, borderColor: GLASS_B,
        borderRadius: 22, paddingVertical: 32, paddingHorizontal: 20,
        alignItems: "center", gap: 10,
        position: "relative", overflow: "hidden",
    },
    noDataText: { fontSize: 13, color: HINT },

    startRow: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "center", gap: 5,
        marginTop: 22, paddingVertical: 12,
    },
    startText: { fontSize: 15, fontWeight: "600", color: ORANGE, letterSpacing: -0.2 },
});

// ─── Ring styles ──────────────────────────────────────────────────────────────
// ─── Ring styles ──────────────────────────────────────────────────────────────
const ringSt = StyleSheet.create({
    container: {
        position: "absolute",
        width: 84, height: 84, borderRadius: 200,
        overflow: "hidden", backgroundColor: "transparent", zIndex: 1,
    },
    staticLayer: {
        position: "absolute",
        width: "200%", height: "200%",
        top: "-50%", left: "-50%",
        alignItems: "center",
        transform: [{ rotate: "45deg" }], // Tilts the static glow
    },
    beam: {
        width: "100%", height: "100%"
    },
    mask: {
        position: "absolute",
        top: 2, left: 2, right: 2, bottom: 2,
        borderRadius: 200, backgroundColor: BG, zIndex: 2,
    },
});

// ─── Glow card styles ─────────────────────────────────────────────────────────
const glowSt = StyleSheet.create({
    wrap: {
        width: CARD_W,
        borderRadius: BORDER_R,
        overflow: "hidden",
        padding: 1.5,
        backgroundColor: "transparent", // No resting color. Matches HTML exactly.
        position: "relative",
    },
    spinContainer: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: BORDER_R, overflow: "hidden",
    },
    spinLayer: {
        position: "absolute",
        width: "200%", height: "200%",
        top: "-50%", left: "-50%",
        alignItems: "center", // Keeps the gradient centered horizontally
    },
    beam: {
        width: "100%",
        height: "50%", // Only covering half height ensures a single bright spot sweeps by
    },
    inner: {
        borderRadius: BORDER_R - 1.5,
        overflow: "hidden",
        position: "relative",
    },
    shineLine: {
        position: "absolute", top: 0, left: 0, right: 0, height: 1, zIndex: 1,
    },
    bottomGlow: {
        position: "absolute", bottom: 0, left: 0, right: 0, height: 40, zIndex: 1,
    },
    flashOverlay: {
        ...StyleSheet.absoluteFillObject, zIndex: 2,
    },
    dashContent: {
        padding: 22,
        paddingHorizontal: 18,
        flexDirection: "column",
        gap: 14,
    },
    iconCircle: {
        width: 38, height: 38, borderRadius: 12,
        alignItems: "center", justifyContent: "center",
        borderWidth: 0.5, borderColor: "rgba(255,120,37,0.25)",
        overflow: "hidden",
    },
    dashText: {
        fontSize: 14, fontWeight: "600",
        color: TEXT, letterSpacing: -0.2,
    },
    dashSub: {
        fontSize: 11, color: MUTED, marginTop: -10,
    },
});

// ─── Chart styles ─────────────────────────────────────────────────────────────
const chartSt = StyleSheet.create({
    row: {
        flexDirection: "row", alignItems: "flex-end",
        gap: 5, height: 80, paddingHorizontal: 4,
    },
    bar: {
        flex: 1,
        borderTopLeftRadius: 4, borderTopRightRadius: 4,
        borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
        borderWidth: 0.5, borderColor: "rgba(255,120,37,0.15)",
        overflow: "hidden",
    },
    barActive: {
        borderColor: "rgba(255,120,37,0.4)",
        ...Platform.select({
            ios: { shadowColor: ORANGE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 6 },
            android: { elevation: 4 },
        }),
    },
    labelsRow: {
        flexDirection: "row", justifyContent: "space-between",
        paddingHorizontal: 4, marginTop: 6,
    },
    lbl: { fontSize: 9, color: HINT },
});