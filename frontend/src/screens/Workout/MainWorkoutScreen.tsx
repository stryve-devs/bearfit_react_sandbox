import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ─── Theme Tokens ────────────────────────────────────────────────────────────
const ORANGE  = "#FF7825";
const TEXT    = "#f0ede8";
const MUTED   = "rgba(240,237,232,0.42)";
const GLASS_B = "rgba(255,255,255,0.07)";
const BG      = "#080808";
const BORDER_R = 18;

// --- Placeholder Images ---
const exploreImage = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop';
const heroImage = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop';

// ─── Dashed Outline Card Component ───────────────────────────────────────────
function DashedCard({ label, sub, icon, onPress }: { label: string; sub: string; icon: string; onPress?: () => void; }) {
    return (
        <TouchableOpacity style={dashedSt.wrap} activeOpacity={0.6} onPress={onPress}>
            <View style={dashedSt.dashContent}>
                <View>
                    <Text style={dashedSt.dashText}>{label}</Text>
                    <Text style={dashedSt.dashSub}>{sub}</Text>
                </View>
                <View style={dashedSt.iconCircle}>
                    <Feather name={icon as any} size={22} color={ORANGE} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ─── Static Card Component (Vertical Layout, Ionicons) ───────────────────────
function StaticCard({ label, sub, icon, onPress }: { label: string; sub: string; icon: string; onPress?: () => void; }) {
    return (
        <TouchableOpacity style={cardSt.wrap} activeOpacity={0.85} onPress={onPress}>
            <LinearGradient
                colors={["rgba(22,22,26,0.98)", "rgba(12,12,14,0.99)"]}
                start={{ x: 0.145, y: 0 }} end={{ x: 1, y: 1 }}
                style={cardSt.inner}
            >
                <LinearGradient
                    colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={st.chartShine}
                    pointerEvents="none"
                />
                <LinearGradient
                    colors={["rgba(255,120,37,0.04)", "transparent"]}
                    start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: 0 }}
                    style={st.bottomGlow}
                    pointerEvents="none"
                />

                <View style={cardSt.dashContent}>
                    <View>
                        <Text style={cardSt.dashText}>{label}</Text>
                        <Text style={cardSt.dashSub}>{sub}</Text>
                    </View>
                    <LinearGradient
                        colors={["rgba(255,120,37,0.15)", "rgba(255,120,37,0.06)"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={cardSt.iconCircle}
                    >
                        <Ionicons name={icon as any} size={22} color={ORANGE} />
                    </LinearGradient>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

// ─── Main Workout Screen ──────────────────────────────────────────────────────
export default function MainWorkoutScreen() {
    const router = useRouter();

    return (
        <LinearGradient
            colors={["#0e0e11", "#0a0906", "#080808", "#0a0906", "#0b0b0e"]}
            locations={[0, 0.2, 0.5, 0.75, 1]}
            start={{ x: 0.16, y: 0 }}
            end={{ x: 0.84, y: 1 }}
            style={{ flex: 1 }}
        >
            <LinearGradient
                colors={["rgba(255,100,20,0.06)", "transparent"]}
                start={{ x: 1, y: 0 }} end={{ x: 0.3, y: 0.4 }}
                style={StyleSheet.absoluteFill} pointerEvents="none"
            />
            <LinearGradient
                colors={["rgba(80,50,200,0.03)", "transparent"]}
                start={{ x: 0, y: 1 }} end={{ x: 0.5, y: 0.6 }}
                style={StyleSheet.absoluteFill} pointerEvents="none"
            />

            <SafeAreaView style={st.safe}>
                {/* Header */}
                <View style={st.topHeader}>
                    <Text style={st.topName}>WORKOUT</Text>
                    <View style={st.iconRow}>

                    </View>
                </View>

                <ScrollView style={st.scroll} contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Quick Start Hero Card (Scaled Down) */}
                    <TouchableOpacity activeOpacity={0.85} style={st.quickStartWrap} onPress={() => router.push('/Workout/log')}>
                        <Image source={{ uri: heroImage }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                        <LinearGradient
                            colors={["rgba(0,0,0,0.8)", "rgba(255, 120, 37, 0.1)"]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={st.quickStartInner}
                        >
                            <LinearGradient
                                colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={st.chartShine} pointerEvents="none"
                            />

                            {/* Top Badge */}
                            <View style={st.qsBadgeWrap}>
                                <View style={st.qsBadge}>
                                    <Ionicons name="flash" size={14} color={ORANGE} />
                                </View>
                            </View>

                            {/* Main Text Content */}
                            <View style={st.qsTextWrap}>
                                <Text style={st.qsTitle}>QUICK START</Text>
                                <Text style={st.qsSub}>Resume your custom workout split or jump into a new explosive movement session.</Text>
                            </View>

                            {/* Centered Pill Button */}
                            <View style={st.qsButton}>
                                <Text style={st.qsButtonText}>START WORKOUT</Text>
                                <Feather name="play" size={14.5} color="#3B1700" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Routines List */}
                    <View style={st.sectionHeader}>
                        <Text style={st.sectionTitle}>Routines</Text>
                        <TouchableOpacity activeOpacity={0.7}>
                        </TouchableOpacity>
                    </View>
                    <View style={st.dashGrid}>

                        <StaticCard
                            label="New Routine"
                            sub="Build a plan"
                            icon="create-outline"
                            onPress={() => router.push('/Workout/routine')}
                        />

                        <TouchableOpacity style={st.exploreCardWrap} activeOpacity={0.85} onPress={() => router.push('/Workout/explore')}>
                            <Image source={{ uri: exploreImage }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                            <LinearGradient
                                colors={["rgba(0,0,0,0.75)", "rgba(255, 120, 37, 0.25)"]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={st.exploreCardInner}
                            >
                                <LinearGradient
                                    colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={st.chartShine} pointerEvents="none"
                                />
                                <View style={st.exploreContent}>
                                    <View>
                                        <Text style={st.exploreText}>Explore Routine</Text>
                                        <Text style={st.exploreSub}>Find programs</Text>
                                    </View>
                                    <LinearGradient
                                        colors={["rgba(255,120,37,0.15)", "rgba(255,120,37,0.06)"]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                        style={st.exploreIconCircle}
                                    >
                                        <Ionicons name="compass-outline" size={22} color="#f0ede8" />
                                    </LinearGradient>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Recent Sessions */}
                    <Text style={st.sectionTitle}>Recent Sessions</Text>
                    <LinearGradient
                        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={st.recentCard}
                    >
                        <LinearGradient
                            colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={st.chartShine} pointerEvents="none"
                        />
                        <View style={st.recentLeft}>
                            <View style={st.recentIconWrap}>
                                <MaterialCommunityIcons name="weight-lifter" size={24} color={ORANGE} />
                            </View>
                            <View>
                                <Text style={st.recentTitle}>Push Day A</Text>
                                <Text style={st.recentSub}>3 days ago • 5 exercises</Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={22} color={MUTED} />
                    </LinearGradient>

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
        paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.04)",
    },
    topName: { fontSize: 26, fontWeight: "800", color: "#e46011", letterSpacing: -0.6, textTransform: 'uppercase' },
    iconRow: { flexDirection: "row", alignItems: "center", gap: 16 },
    iconBtn: {
        width: 38, height: 38,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 12, alignItems: "center", justifyContent: "center",
    },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 50 },

    sectionHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
        marginTop: 2, marginBottom: 1, paddingHorizontal: 4
    },
    sectionTitle: {
        fontSize: 18, fontWeight: "700", color: "#c86324", letterSpacing: -0.3, marginTop: 5, marginBottom: 10, paddingHorizontal: 4
    },
    viewAllText: {
        color: ORANGE, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 2
    },

    dashGrid: { flexDirection: "column", gap: 14, marginBottom: 12 },

    // Quick Start Hero Card (Scaled Down)
    quickStartWrap: {
        width: "100%",
        aspectRatio: 1.15, // <--- Increased slightly to reduce the height
        borderRadius: 28,
        overflow: "hidden",
        marginTop: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 0.5,
        borderColor: GLASS_B,
    },
    quickStartInner: {
        flex: 1,
        padding: 21, // <--- Reduced from 26
        position: 'relative',
        justifyContent: 'space-between',
    },
    qsBadgeWrap: {
        alignItems: 'flex-start',
    },
    qsBadge: {
        width: 42, // <--- Reduced from 48
        height: 28, // <--- Reduced from 32
        borderRadius: 14,
        backgroundColor: "rgba(255, 120, 37, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0.5,
        borderColor: "rgba(255, 120, 37, 0.3)",
    },
    qsTextWrap: {
        marginTop: 'auto',
        marginBottom: 20, // <--- Reduced from 28
    },
    qsTitle: {
        fontSize: 29, // <--- Reduced from 34
        fontWeight: "900",
        color: "#FFFFFF",
        marginBottom: 8,
        letterSpacing: -1,
    },
    qsSub: {
        fontSize: 14, // <--- Reduced from 15
        color: "rgba(255,255,255,0.75)",
        fontWeight: "500",
        lineHeight: 20,
    },
    qsButton: {
        backgroundColor: ORANGE,
        paddingVertical: 14, // <--- Reduced from 16
        width: "80%", // <--- Reduced from 85%
        alignSelf: 'center',
        borderRadius: 100,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    qsButtonText: {
        fontSize: 15, // <--- Reduced from 16
        fontWeight: "800",
        color: "#3B1700",
        letterSpacing: 0.5,
        marginRight: 6,
    },

    // Explore Routines Image Card
    exploreCardWrap: {
        width: "100%",
        borderRadius: BORDER_R,
        overflow: "hidden",
        position: "relative",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.05)",
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
            android: { elevation: 6 },
        }),
    },
    exploreCardInner: {
        width: "100%",
        borderRadius: BORDER_R - 1.5,
        overflow: "hidden",
        position: 'relative',
    },
    exploreContent: {
        paddingVertical: 28,
        paddingHorizontal: 22,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    exploreIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0.5,
        borderColor: "rgba(255,120,37,0.25)",
        overflow: "hidden",
    },
    exploreText: {
        fontSize: 18,
        fontWeight: "800",
        color: TEXT,
        letterSpacing: -0.4,
        marginBottom: 4
    },
    exploreSub: {
        fontSize: 13,
        color: MUTED,
        fontWeight: "500"
    },

    // Recent Cards
    recentCard: {
        borderWidth: 0.5, borderColor: GLASS_B,
        borderRadius: 22, padding: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        overflow: "hidden", position: "relative"
    },
    recentLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
    recentIconWrap: {
        width: 46, height: 46, borderRadius: 14,
        backgroundColor: "rgba(255,120,37,0.1)",
        alignItems: "center", justifyContent: "center"
    },
    recentTitle: { fontSize: 15, fontWeight: "700", color: TEXT, letterSpacing: -0.2, marginBottom: 2 },
    recentSub: { fontSize: 13, color: MUTED },
    chartShine: { position: "absolute", top: 0, left: 0, right: 0, height: 1 },
    bottomGlow: { position: "absolute", bottom: 0, left: 0, right: 0, height: 40, zIndex: 1 },
});

// ─── Static Card Styles ──────────────────────────────────────────────────────
const cardSt = StyleSheet.create({
    wrap: {
        width: "100%",
        borderRadius: BORDER_R,
        overflow: "hidden",
        padding: 1.5,
        backgroundColor: "rgba(255,255,255,0.05)",
        position: "relative",
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
            android: { elevation: 6 },
        }),
    },
    inner: {
        borderRadius: BORDER_R - 1.5,
        overflow: "hidden",
        position: "relative",
    },
    dashContent: {
        paddingVertical: 28,
        paddingHorizontal: 22,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0.5,
        borderColor: "rgba(255,120,37,0.25)",
        overflow: "hidden",
    },
    dashText: {
        fontSize: 18,
        fontWeight: "800",
        color: TEXT,
        letterSpacing: -0.4,
        marginBottom: 4
    },
    dashSub: {
        fontSize: 13,
        color: MUTED,
        fontWeight: "500"
    },
});

// ─── Dashed Card Styles ──────────────────────────────────────────────────────
const dashedSt = StyleSheet.create({
    wrap: {
        width: "100%",
        borderRadius: BORDER_R,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderStyle: "dashed",
        backgroundColor: "rgba(255, 255, 255, 0.02)",
        overflow: "hidden",
    },
    dashContent: {
        paddingVertical: 28,
        paddingHorizontal: 22,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 120, 37, 0.12)",
    },
    dashText: {
        fontSize: 18,
        fontWeight: "800",
        color: TEXT,
        letterSpacing: -0.4,
        marginBottom: 4
    },
    dashSub: {
        fontSize: 13,
        color: MUTED,
        fontWeight: "500"
    },
});