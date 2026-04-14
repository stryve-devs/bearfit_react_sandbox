import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Svg, { Polygon } from "react-native-svg";

const ORANGE = "#FF7825";

/* 🔥 SAME DATA FROM YOUR OTHER SCREEN */
const muscleData = {
    "Abs": 8,
    "Abductors": 4,
    "Adductors": 3,
    "Biceps": 12,
    "Calves": 6,
    "Chest": 9,
    "Forearms": 3,
    "Glutes": 7,
    "Hamstrings": 5,
    "Lats": 6,
    "Lower Back": 4,
    "Quadriceps": 8,
    "Shoulders": 7,
    "Traps": 4,
    "Triceps": 10,
    "Upper Back": 5,
};

/* 🔥 GROUP MUSCLES INTO 6 CATEGORIES */
const getGroupedMuscleData = (data) => ({
    Back:
        data["Lats"] +
        data["Upper Back"] +
        data["Lower Back"] +
        data["Traps"],

    Chest: data["Chest"],

    Core: data["Abs"],

    Shoulders: data["Shoulders"],

    Arms:
        data["Biceps"] +
        data["Triceps"] +
        data["Forearms"],

    Legs:
        data["Quadriceps"] +
        data["Hamstrings"] +
        data["Calves"] +
        data["Glutes"] +
        data["Adductors"] +
        data["Abductors"],
});

/* 🔥 NORMALIZE TO 0–100 */
const normalize = (grouped) => {
    const values = Object.values(grouped);
    const max = Math.max(...values, 1);
    return values.map(v => (v / max) * 100);
};

/* 🔥 CONVERT TO SVG POINTS */
const getPoints = (values) => {
    const center = 130;
    const maxRadius = 90;

    const angles = [-90, -30, 30, 90, 150, 210];

    return values
        .map((val, i) => {
            const angle = (angles[i] * Math.PI) / 180;
            const r = (val / 100) * maxRadius;

            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);

            return `${x},${y}`;
        })
        .join(" ");
};

export default function MuscleChartScreen() {
    const router = useRouter();

    const [selectedWeb, setSelectedWeb] = React.useState("current");
    const [timeFilter, setTimeFilter] = React.useState("Last 30 days");
    const [showFilter, setShowFilter] = React.useState(false);
    const [showInfo, setShowInfo] = React.useState(false);

    /* 🔥 CURRENT DATA */
    const groupedCurrent = getGroupedMuscleData(muscleData);

    /* 🔥 FAKE PREVIOUS (replace later with real data) */
    const groupedPrevious = {
        Back: 18,
        Chest: 6,
        Core: 5,
        Shoulders: 6,
        Arms: 10,
        Legs: 14,
    };

    const chartData = {
        current: normalize(groupedCurrent),
        previous: normalize(groupedPrevious),
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out my muscle distribution!\n\n${timeFilter}`,
                title: "Muscle Distribution",
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <LinearGradient colors={["#0e0e11", "#080808"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={{ zIndex: 10 }}>
                        <Feather name="chevron-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Muscle distribution</Text>

                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <TouchableOpacity onPress={() => setShowInfo(true)}>
                            <Feather name="help-circle" size={20} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleShare}>
                            <Feather name="share" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FILTER */}
                <TouchableOpacity
                    style={styles.filterBox}
                    onPress={() => setShowFilter(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.filterText}>{timeFilter}</Text>
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

                        {/* SINGLE POLYGON - SHOWS SELECTED DATA */}
                        <Polygon
                            points={getPoints(chartData[selectedWeb])}
                            fill={
                                selectedWeb === "current"
                                    ? "rgba(255,120,37,0.3)"
                                    : "rgba(136,136,136,0.2)"
                            }
                            stroke={selectedWeb === "current" ? ORANGE : "#888"}
                            strokeWidth="2"
                        />
                    </Svg>

                    {/* LABELS */}
                    <Text style={[styles.label, { top: 10 }]}>Back</Text>
                    <Text style={[styles.label, { top: 85, right: 100 }]}>Chest</Text>
                    <Text style={[styles.label, { top: 155, right: 100 }]}>Core</Text>
                    <Text style={[styles.label, { bottom: 10 }]}>Shoulders</Text>
                    <Text style={[styles.label, { bottom: 70, left: 100 }]}>Arms</Text>
                    <Text style={[styles.label, { top: 85, left: 100 }]}>Legs</Text>
                </View>

                {/* LEGEND */}
                <View style={styles.legend}>
                    <TouchableOpacity
                        style={styles.legendItem}
                        onPress={() => setSelectedWeb("current")}
                    >
                        <View style={[styles.dot, { backgroundColor: ORANGE }]} />
                        <Text style={[styles.legendText, selectedWeb === "current" && { color: ORANGE }]}>Current</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.legendItem}
                        onPress={() => setSelectedWeb("previous")}
                    >
                        <View style={[styles.dot, { backgroundColor: "#888" }]} />
                        <Text style={[styles.legendText, selectedWeb === "previous" && { color: "#888" }]}>Previous</Text>
                    </TouchableOpacity>
                </View>

                {/* FILTER MODAL */}
                <Modal visible={showFilter} transparent animationType="slide">
                    <TouchableOpacity
                        style={styles.sheetOverlay}
                        activeOpacity={1}
                        onPress={() => setShowFilter(false)}
                    >
                        <View style={styles.sheetContainer}>

                            {/* HANDLE */}
                            <View style={styles.sheetHandle} />

                            {/* CARD ITEMS */}
                            {[
                                { label: "Last 7 days", icon: "calendar" },
                                { label: "Last 30 days", icon: "calendar" },
                                { label: "Last 3 months", icon: "calendar" },
                                { label: "Last year", icon: "calendar" },
                            ].map((item) => (
                                <TouchableOpacity
                                    key={item.label}
                                    style={styles.sheetCard}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        setTimeFilter(item.label);
                                        setShowFilter(false);
                                    }}
                                >
                                    <View style={styles.sheetCardContent}>

                                        {/* LEFT ICON */}
                                        <View style={styles.sheetIcon}>
                                            <Feather
                                                name={item.icon}
                                                size={18}
                                                color="#FF7825"
                                            />
                                        </View>

                                        {/* TEXT */}
                                        <Text style={styles.sheetText}>
                                            {item.label}
                                        </Text>

                                        {/* RIGHT ARROW */}
                                        <Feather
                                            name="chevron-right"
                                            size={18}
                                            color="#777"
                                        />
                                    </View>
                                </TouchableOpacity>
                            ))}

                        </View>
                    </TouchableOpacity>
                </Modal>
                <Text style={styles.section}>Summary</Text>

                <View style={styles.summaryGrid}>
                    {["Workouts","Duration","Volume","Sets"].map((item) => (
                        <View key={item} style={styles.card}>
                            <Text style={styles.cardTitle}>{item}</Text>
                            <Text style={styles.cardValue}>0</Text>
                        </View>
                    ))}
                </View>

                {/* INFO MODAL */}
                <Modal visible={showInfo} transparent animationType="fade">
                    <View style={styles.popupOverlay}>
                        <View style={styles.popup}>
                            <Text style={styles.popupText}>
                                Muscle distribution based on sets performed.
                            </Text>

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

/* STYLES */
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
        position: "absolute",
        left: 0,
        right: 0,
        textAlign: "center",
        pointerEvents: "none",
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
        fontSize: 14,
    },
    chartContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    label: {
        position: "absolute",
        color: "#aaa",
        fontSize: 11,
    },
    legend: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
        gap: 20,
    },
    legendItem: {
        flexDirection: "row",
        gap: 6,
        paddingBottom: 4,
    },
    legendItemActive: {
        borderBottomWidth: 2,
        borderBottomColor: ORANGE,
    },
    legendText: { color: "#aaa" },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    sheetOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    sheetContainer: {
        backgroundColor: "#111",
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: "#444",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 16,
    },
    sheetCard: {
        borderRadius: 18,
        marginBottom: 12,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    sheetCardContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    sheetIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: "rgba(255,120,37,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    sheetText: {
        flex: 1,
        color: "#fff",
        fontSize: 15,
    },
    popupOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.7)",
    },
    popup: {
        backgroundColor: "#1c1c1e",
        padding: 20,
        borderRadius: 12,
    },
    popupText: { color: "#fff", marginBottom: 10 },
    popupBtn: {
        backgroundColor: ORANGE,
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    card:{
        width:"48%",
        padding:16,
        borderRadius:14,
        borderWidth:1,
        borderColor:"#222",
        marginBottom:12
    },

    cardTitle:{
        color:"#aaa"
    },

    cardValue:{
        color:"#fff",
        fontSize:18,
        marginTop:5
    },

    summaryGrid:{
        flexDirection:"row",
        flexWrap:"wrap",
        justifyContent:"space-between",
        paddingHorizontal:16
    },
    section: {
        color: "#aaa",
        margin: 16,
    },
    popupBtnText: { color: "#fff" },
});