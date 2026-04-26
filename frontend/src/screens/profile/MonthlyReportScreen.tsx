import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// ✅ FIX 1: ADD THIS IMPORT
import Svg, { Polygon } from "react-native-svg";

const { width } = Dimensions.get("window");
const ORANGE = "#FF7825";

const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();

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

const normalize = (grouped) => {
    const values = Object.values(grouped);
    const max = Math.max(...values, 1);
    return values.map(v => (v / max) * 100);
};

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

export default function MonthlyReport() {

    const generateGraphData = () => {
        return Array.from({ length: 7 }, () => Math.floor(Math.random() * 150) + 40);
    };

    const [graphData, setGraphData] = React.useState(generateGraphData());
    const router = useRouter();

    const [activeTab, setActiveTab] = React.useState("Workouts");

    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const todayDate = today.getDate();

    const daysInMonth = Array.from(
        { length: getDaysInMonth(month, year) },
        (_, i) => i + 1
    );
    const thisMonthData = {
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

    const lastMonthData = {
        "Abs": 5,
        "Abductors": 2,
        "Adductors": 2,
        "Biceps": 8,
        "Calves": 4,
        "Chest": 6,
        "Forearms": 2,
        "Glutes": 5,
        "Hamstrings": 4,
        "Lats": 4,
        "Lower Back": 3,
        "Quadriceps": 6,
        "Shoulders": 5,
        "Traps": 3,
        "Triceps": 7,
        "Upper Back": 3,
    };
    const [selectedMonth, setSelectedMonth] = React.useState("current");
    const chartData = {
        current: normalize(getGroupedMuscleData(thisMonthData)),
        previous: normalize(getGroupedMuscleData(lastMonthData)),
    };
    return (
        <View style={{ flex: 1, backgroundColor: "#080808" }}>
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={{ zIndex: 10 }}>
                        <Feather name="chevron-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>March Report</Text>
                    <View style={{ width: 22 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>

                    <Text style={styles.bigTitle}>March {year}</Text>
                    <Text style={styles.sub}>0 → 0</Text>

                    <View style={styles.graph}>
                        {graphData.map((val, i) => (
                            <View key={i} style={{ alignItems: "center" }}>

                                <View
                                    style={{
                                        width: 20,
                                        height: Math.min(val, 160),
                                        backgroundColor: ORANGE,
                                        borderRadius: 6,
                                    }}
                                />

                                <Text style={{ color: "#666", fontSize: 10, marginTop: 4 }}>
                                    {days[i][0]}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* TABS */}
                    <View style={styles.tabs}>
                        {["Workouts","Duration","Volume","Sets"].map(tab => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tab,
                                    activeTab === tab && styles.activeTab
                                ]}
                                onPress={() => {
                                    setActiveTab(tab);
                                    setGraphData(generateGraphData()); // 🔥 changes graph
                                }}
                            >
                                <Text style={[
                                    styles.tabText,
                                    activeTab === tab && { color: "#fff" }
                                ]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* SUMMARY */}
                    <Text style={styles.section}>Summary</Text>

                    <View style={styles.summaryGrid}>
                        {["Workouts","Duration","Volume","Sets"].map((item) => (
                            <View key={item} style={styles.card}>
                                <Text style={styles.cardTitle}>{item}</Text>
                                <Text style={styles.cardValue}>0</Text>
                            </View>
                        ))}
                    </View>

                    {/* STREAK */}
                    <Text style={styles.section}>Workout Days Log</Text>

                    <View style={styles.streakBox}>
                        <Text style={{ fontSize: 30 }}>🔥</Text>
                        <Text style={styles.streakText}>0 Week Streak</Text>
                    </View>

                    {/* CALENDAR */}
                    <View style={styles.calendar}>
                        <View style={styles.daysContainer}>
                            {days.map((d) => (
                                <Text key={d} style={styles.dayText}>{d}</Text>
                            ))}
                        </View>

                        <View style={styles.grid}>
                            {daysInMonth.map((d) => {
                                const isToday = d === todayDate;

                                return (
                                    <View key={d} style={styles.dayWrap}>
                                        {isToday ? (
                                            <View style={styles.glowContainer}>
                                                <View style={styles.outerGlow} />

                                                <View style={styles.ring}>
                                                    <LinearGradient
                                                        colors={[
                                                            "rgba(255,120,37,0.25)",
                                                            "rgba(255,120,37,0.05)"
                                                        ]}
                                                        style={styles.inner}
                                                    >
                                                        <Text style={styles.todayText}>{d}</Text>
                                                    </LinearGradient>
                                                </View>
                                            </View>
                                        ) : (
                                            <Text style={styles.day}>{d}</Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* 🔥 MUSCLE DISTRIBUTION */}
                    <Text style={{ color: "#aaa", margin: 16 }}>Muscle Distribution</Text>

                    {/* ✅ FIX 2: HEIGHT ADDED */}
                    <View style={{ alignItems: "center", marginTop: 20, height: 260 }}>

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

                            {/* 🔥 LAST MONTH (GRAY) */}
                            <Polygon
                                points={getPoints(chartData[selectedMonth])}
                                fill={
                                    selectedMonth === "current"
                                        ? "rgba(255,120,37,0.3)"
                                        : "rgba(136,136,136,0.2)"
                                }
                                stroke={selectedMonth === "current" ? "#FF7825" : "#888"}
                                strokeWidth="2"
                            />
                        </Svg>

                        {/* LABELS */}
                        <Text style={{ position: "absolute", top: 10, color: "#aaa" }}>Back</Text>
                        <Text style={{ position: "absolute", top: 90, right: 95, color: "#aaa" }}>Chest</Text>
                        <Text style={{ position: "absolute", top: 155, right: 95, color: "#aaa" }}>Core</Text>
                        <Text style={{ position: "absolute", bottom: 10, color: "#aaa" }}>Shoulders</Text>
                        <Text style={{ position: "absolute", bottom: 70, left: 95, color: "#aaa" }}>Arms</Text>
                        <Text style={{ position: "absolute", top: 90, left: 95, color: "#aaa" }}>Legs</Text>

                    </View>

                    {/* LEGEND */}
                    <View style={{ flexDirection: "row", justifyContent: "center", gap: 20, marginTop: 20 }}>

                        {/* PREVIOUS */}
                        <TouchableOpacity
                            onPress={() => setSelectedMonth("previous")}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                borderBottomWidth: selectedMonth === "previous" ? 2 : 0,
                                borderBottomColor: "#888",
                                paddingBottom: 4,
                            }}
                        >
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#888" }} />
                            <Text style={{ color: "#aaa", fontSize: 12 }}>
                                February 2026
                            </Text>
                        </TouchableOpacity>

                        {/* CURRENT */}
                        <TouchableOpacity
                            onPress={() => setSelectedMonth("current")}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                borderBottomWidth: selectedMonth === "current" ? 2 : 0,
                                borderBottomColor: "#FF7825",
                                paddingBottom: 4,
                            }}
                        >
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF7825" }} />
                            <Text style={{ color: "#aaa", fontSize: 12 }}>
                                March 2026
                            </Text>
                        </TouchableOpacity>

                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    header:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        padding:16
    },

    headerTitle:{
        color:"#FF7825",
        fontSize:16
    },

    bigTitle:{
        color:"#fff",
        fontSize:28,
        fontWeight:"700",
        marginLeft:16
    },

    sub:{
        color:"#aaa",
        marginLeft:16,
        marginBottom:10
    },

    graph:{
        height:200,
        margin:16,
        borderRadius:12,
        backgroundColor:"#111",
        flexDirection:"row",
        justifyContent:"space-around",
        alignItems:"flex-end",
        paddingHorizontal:10,
        paddingBottom:10,
        overflow: "hidden",   // 🔥 IMPORTANT FIX
    },

    tabs:{
        flexDirection:"row",
        gap:10,
        paddingHorizontal:16
    },

    tab:{
        paddingVertical:8,
        paddingHorizontal:14,
        borderRadius:20,
        backgroundColor:"#1a1a1a"
    },

    activeTab:{
        backgroundColor:ORANGE
    },

    tabText:{
        color:"#aaa"
    },

    section:{
        color:"#aaa",
        margin:16
    },

    summaryGrid:{
        flexDirection:"row",
        flexWrap:"wrap",
        justifyContent:"space-between",
        paddingHorizontal:16
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

    streakBox:{
        alignItems:"center",
        marginVertical:20
    },

    streakText:{
        color:"#fff",
        marginTop:10
    },

    calendar:{
        marginTop:20
    },

    daysRow:{
        flexDirection:"row",
        justifyContent:"space-around"
    },

    dayText:{
        color:"#888"
    },

    grid:{
        flexDirection:"row",
        flexWrap:"wrap"
    },

    dayWrap:{
        width:width/7,
        height:50,
        justifyContent:"center",
        alignItems:"center"
    },

    day:{
        color:"#aaa"
    },

    today:{
        width:36,
        height:36,
        borderRadius:18,
        justifyContent:"center",
        alignItems:"center"
    },

    todayText:{
        color:"#fff",
        fontWeight:"700"
    },

    daysContainer: {
        marginHorizontal: 16,
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 18,

        flexDirection: "row",
        justifyContent: "space-around",

        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    monthTitle: {
        color: "#fff",
        fontSize: 20,
        marginTop: 20,
        marginLeft: 16,
        fontWeight: "600",
    },

    glowContainer: {
        alignItems: "center",
        justifyContent: "center",
    },

    outerGlow: {
        position: "absolute",
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "rgba(255,120,37,0.15)",
        shadowColor: "#FF7825",
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
    },

    ring: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1.5,
        borderColor: "rgba(255,120,37,0.6)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },

    inner: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,120,37,0.10)",
    },

    todayText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },

    glassBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",

        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },

    radarContainer: {
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
        height: 220,
    },

    radar: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 1,
        borderColor: "#333",
    },

    label: {
        position: "absolute",
        color: "#888",
        fontSize: 12,
    },

    legendRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
        marginTop: 16,
        marginBottom: 30,
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },

    legendText: {
        color: "#888",
        fontSize: 12,
    },
});