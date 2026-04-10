import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Svg, { Polygon } from "react-native-svg";

const ORANGE = "#FF7825";

export default function MuscleChartScreen() {
    const router = useRouter();

    // ✅ ADDED STATE
    const [showFilter, setShowFilter] = React.useState(false);
    const [showInfo, setShowInfo] = React.useState(false);

    return (
        <LinearGradient colors={["#0e0e11", "#080808"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <BlurView intensity={50} tint="dark" style={styles.glassBtn}>
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </BlurView>
                    </TouchableOpacity>

                    <Text style={styles.title}>Muscle distribution</Text>

                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <TouchableOpacity onPress={() => setShowInfo(true)}>
                            <BlurView intensity={50} tint="dark" style={styles.glassBtn}>
                                <Feather name="help-circle" size={18} color="#fff" />
                            </BlurView>
                        </TouchableOpacity>
                        <BlurView intensity={50} tint="dark" style={styles.glassBtn}>
                            <Feather name="share" size={18} color="#fff" />
                        </BlurView>
                    </View>
                </View>

                {/* ✅ CLICKABLE FILTER */}
                <TouchableOpacity
                    style={styles.filterBox}
                    onPress={() => setShowFilter(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.filterText}>Last 30 days</Text>
                    <Feather name="chevron-down" size={16} color="#aaa" />
                </TouchableOpacity>

                {/* CHART */}
                <View style={styles.chartContainer}>
                    <Svg width={260} height={260}>
                        {[40, 70, 100].map((r, i) => (
                            <Polygon
                                key={i}
                                points={`
                                130,${130 - r}
                                ${130 + r * 0.87},${130 - r * 0.5}
                                ${130 + r * 0.87},${130 + r * 0.5}
                                130,${130 + r}
                                ${130 - r * 0.87},${130 + r * 0.5}
                                ${130 - r * 0.87},${130 - r * 0.5}
                                `}
                                stroke="rgba(255,255,255,0.1)"
                                fill="none"
                            />
                        ))}

                        <Polygon
                            points="
                            130,40
                            200,90
                            200,170
                            130,220
                            60,170
                            60,90
                            "
                            fill="rgba(255,120,37,0.3)"
                            stroke={ORANGE}
                            strokeWidth="2"
                        />
                    </Svg>

                    {/* TOP */}
                    <Text style={[styles.label, { top: 10, alignSelf: "center" }]}>
                        Back
                    </Text>

                    {/* TOP RIGHT */}
                    <Text style={[styles.label, { top: 85, right: 100 }]}>
                        Chest
                    </Text>

                    {/* RIGHT */}
                    <Text style={[styles.label, { top: 155, right: 100 }]}>
                        Core
                    </Text>

                    {/* 🔥 DIRECTLY BELOW BACK (FIXED) */}
                    <Text style={[styles.label, { bottom: 10, alignSelf: "center" }]}>
                        Shoulders
                    </Text>

                    {/* BOTTOM LEFT */}
                    <Text style={[styles.label, { bottom: 70, left: 100 }]}>
                        Arms
                    </Text>

                    {/* LEFT */}
                    <Text style={[styles.label, { top: 85, left: 100 }]}>
                        Legs
                    </Text>
                </View>

                {/* LEGEND */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: ORANGE }]} />
                        <Text style={styles.legendText}>Current</Text>
                    </View>

                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: "#888" }]} />
                        <Text style={styles.legendText}>Previous</Text>
                    </View>
                </View>

                {/* STATS */}
                <View style={styles.statsGrid}>
                    <Stat title="Workouts" value="0" sub="→ 0" />
                    <Stat title="Duration" value="0min" sub="→ 0min" />
                    <Stat title="Volume" value="0 kg" sub="→ 0 kg" />
                    <Stat title="Sets" value="0" sub="→ 0" />
                </View>

                {/* 🔥 BOTTOM SHEET */}
                <Modal visible={showFilter} transparent animationType="slide">
                    <TouchableOpacity
                        style={styles.sheetOverlay}
                        activeOpacity={1}
                        onPress={() => setShowFilter(false)}
                    >
                        <View style={styles.sheetContainer}>

                            <View style={styles.sheetHandle} />

                            {["Last 7 days", "Last 30 days", "Last 3 months"].map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.sheetCard}
                                    activeOpacity={0.85}
                                    onPress={() => setShowFilter(false)}
                                >
                                    <View style={styles.sheetRow}>
                                        <View style={styles.iconBox}>
                                            <Feather name="calendar" size={18} color={ORANGE} />
                                        </View>

                                        <Text style={styles.sheetText}>{item}</Text>

                                        <Feather name="chevron-right" size={18} color="#777" />
                                    </View>
                                </TouchableOpacity>
                            ))}

                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal visible={showInfo} transparent animationType="fade">
                    <View style={styles.popupOverlay}>

                        <View style={styles.popup}>

                            {/* TEXT */}
                            <Text style={styles.popupText}>
                                The muscle group distribution compares the number of sets completed of exercises that target each muscle group. This applies for both primary and secondary muscles. Warm-up sets are included.
                            </Text>

                            {/* BUTTON */}
                            <TouchableOpacity
                                onPress={() => setShowInfo(false)}
                                style={styles.popupBtn}
                            >
                                <Text style={styles.popupBtnText}>Ok</Text>
                            </TouchableOpacity>

                        </View>

                    </View>
                </Modal>

            </SafeAreaView>
        </LinearGradient>
    );
}

function Stat({ title, value, sub }: any) {
    return (
        <View style={styles.statBox}>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statSub}>{sub}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },

    title: {
        color: ORANGE,
        fontSize: 18,
        fontWeight: "600",
    },

    glassBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
    },

    filterBox: {
        marginHorizontal: 16,
        marginTop: 10,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: "#1a1a1a",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
    },

    filterText: {
        color: "#fff",
    },

    chartContainer: {
        alignItems: "center",
        marginTop: 30,
    },

    label: {
        position: "absolute",
        color: "#aaa",
        fontSize: 11,
        textAlign: "center",
    },

    legend: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
        gap: 20,
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    legendText: {
        color: "#aaa",
        fontSize: 12,
    },

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        padding: 16,
        marginTop: 20,
    },

    statBox: {
        width: "48%",
        borderRadius: 16,
        padding: 16,
        backgroundColor: "#111",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        marginBottom: 12,
    },

    statTitle: {
        color: "#aaa",
        fontSize: 13,
    },

    statValue: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "600",
        marginTop: 4,
    },

    statSub: {
        color: "#777",
        marginTop: 4,
        fontSize: 12,
    },

    sheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },

    sheetContainer: {
        backgroundColor: "#111",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 16,
    },

    sheetHandle: {
        width: 50,
        height: 5,
        backgroundColor: "#444",
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 16,
    },

    sheetCard: {
        borderRadius: 22,
        marginBottom: 14,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    sheetRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 18,
        paddingHorizontal: 16,
    },

    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(255,120,37,0.12)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },

    sheetText: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },

    popupOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },

    popup: {
        width: "85%",
        backgroundColor: "#1c1c1e",
        borderRadius: 18,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    popupText: {
        color: "#fff",
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        marginBottom: 20,
    },

    popupBtn: {
        backgroundColor: "#FF7825", // 🔥 ORANGE (not blue)
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },

    popupBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
});