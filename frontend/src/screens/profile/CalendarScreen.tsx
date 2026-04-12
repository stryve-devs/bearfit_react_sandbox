import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ORANGE = "#FF7825";

// All possible weekdays
const ALL_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarScreen() {
    const [activeModal, setActiveModal] = React.useState<"streak" | "rest" | null>(null);
    const [showPicker, setShowPicker] = React.useState(false);
    const [selectedView, setSelectedView] = React.useState("Month");
    const [firstDayOfWeek, setFirstDayOfWeek] = useState(0); // Default to 0 (Sunday)

    const router = useRouter();
    const todayDate = new Date();
    const currentMonth = todayDate.getMonth();
    const currentYear = todayDate.getFullYear();
    const today = todayDate.getDate();

    // 🔥 REFRESH LOGIC: Loads preference whenever screen is focused
    useFocusEffect(
        useCallback(() => {
            const getPref = async () => {
                const saved = await AsyncStorage.getItem("firstDayOfWeek");
                if (saved !== null) {
                    setFirstDayOfWeek(parseInt(saved));
                }
            };
            getPref();
        }, [])
    );

    // 🔥 DYNAMIC LABELS: Reorder labels based on preference
    const shiftedWeekdays = [
        ...ALL_WEEKDAYS.slice(firstDayOfWeek),
        ...ALL_WEEKDAYS.slice(0, firstDayOfWeek),
    ];

    const getMonthName = (month) => new Date(currentYear, month).toLocaleString("default", { month: "long" });

    // 🔥 GRID LOGIC: Generates leading blanks + day numbers
    const generateMonthDays = (month, year) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        // Calculate empty slots needed at the start based on firstDayOfWeek
        const blanksCount = (firstDayOfMonth - firstDayOfWeek + 7) % 7;

        const daysArray = [];
        for (let i = 0; i < blanksCount; i++) daysArray.push(null);
        for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

        return daysArray;
    };

    const renderCalendarGrid = (month, year) => {
        const monthDays = generateMonthDays(month, year);
        const monthLabel = `${getMonthName(month)} ${year}`;

        return (
            <View key={`${month}-${year}`}>
                <Text style={styles.monthTitle}>{monthLabel}</Text>
                <View style={styles.grid}>
                    {monthDays.map((d, index) => (
                        <Day
                            key={`${month}-${index}`}
                            d={d}
                            isToday={d === today && month === currentMonth}
                            monthLabel={monthLabel}
                        />
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#080808" }}>
            <LinearGradient
                colors={["rgba(255,120,37,0.2)", "transparent"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0.5 }}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                {/* HEADER */}
                <View style={styles.headerRow}>
                    <BlurContainer style={styles.iconBtn}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconPress}>
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>
                    </BlurContainer>

                    <View style={styles.headerCenter}>
                        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.pickerTrigger}>
                            <Text style={styles.monthText}>{selectedView}</Text>
                            <Feather name="chevron-down" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rightIcons}>
                        <BlurContainer style={styles.iconBtn}>
                            <TouchableOpacity style={styles.iconPress}>
                                <Feather name="upload" size={18} color="#fff" />
                            </TouchableOpacity>
                        </BlurContainer>
                        <BlurContainer style={styles.iconBtn}>
                            <TouchableOpacity onPress={() => router.push("/Profile/first-weekday")} style={styles.iconPress}>
                                <Feather name="sliders" size={18} color="#fff" />
                            </TouchableOpacity>
                        </BlurContainer>
                    </View>
                </View>

                {/* STATS CARDS */}
                <View style={styles.statsRow}>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.8} onPress={() => setActiveModal("streak")}>
                        <GlassCard text="0 streak days" icon="🔥" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.8} onPress={() => setActiveModal("rest")}>
                        <GlassCard text="0 rest days" icon="🌙" blue />
                    </TouchableOpacity>
                </View>

                {/* WEEKDAY LABELS (Dynamic) */}
                <BlurView intensity={40} tint="dark" style={styles.daysContainer}>
                    {shiftedWeekdays.map((d) => (
                        <Text key={d} style={styles.dayHeaderText}>{d}</Text>
                    ))}
                </BlurView>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {renderCalendarGrid(currentMonth, currentYear)}
                    {renderCalendarGrid((currentMonth + 1) % 12, currentMonth === 11 ? currentYear + 1 : currentYear)}
                </ScrollView>

                {/* MODALS & PICKERS */}
                {activeModal && (
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setActiveModal(null)} />
                        <BlurView intensity={90} tint="dark" style={styles.modalCard}>
                            <Text style={{ fontSize: 32, marginBottom: 12 }}>{activeModal === "streak" ? "🔥" : "🌙"}</Text>
                            <Text style={styles.modalTitle}>{activeModal === "streak" ? "Streak" : "Rest Days"}</Text>
                            <Text style={styles.modalText}>
                                {activeModal === "streak"
                                    ? "Streak shows you how many weeks in a row, including this week, you have logged at least one workout."
                                    : "Rest shows you the number of days since your last logged workout."}
                            </Text>
                            <TouchableOpacity style={styles.modalBtn} onPress={() => setActiveModal(null)}>
                                <Text style={styles.modalBtnText}>Got it</Text>
                            </TouchableOpacity>
                        </BlurView>
                    </View>
                )}

                {showPicker && (
                    <View style={styles.sheetOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowPicker(false)} />
                        <BlurView intensity={90} tint="dark" style={styles.sheetContainer}>
                            <View style={styles.handle} />
                            {["Month", "Year", "Multi-year"].map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.sheetCard}
                                    onPress={() => {
                                        setSelectedView(item);
                                        setShowPicker(false);
                                        if (item !== "Month") router.push(item === "Year" ? "/Profile/year-view" : "/Profile/multi-year-view");
                                    }}
                                >
                                    <View style={styles.sheetCardContent}>
                                        <View style={styles.sheetIcon}>
                                            <Feather name={item === "Month" ? "calendar" : item === "Year" ? "bar-chart" : "layers"} size={18} color={ORANGE} />
                                        </View>
                                        <Text style={[styles.sheetText, { flex: 1 }]}>{item}</Text>
                                        {selectedView === item && <Feather name="check" size={20} color={ORANGE} />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </BlurView>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

// Sub-components
const BlurContainer = ({ children, style }: any) => (
    <View style={[style, { overflow: 'hidden' }]}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        {children}
    </View>
);

function GlassCard({ text, icon, blue }: any) {
    return (
        <BlurContainer style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.iconCircle}>
                    <Text style={{ fontSize: 18 }}>{icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: blue ? "#4da6ff" : ORANGE }]}>{text}</Text>
                    <Text style={styles.subText} numberOfLines={1}>{blue ? "Rest & recover 🌙" : "Start momentum ✨"}</Text>
                </View>
            </View>
        </BlurContainer>
    );
}

function Day({ d, isToday, monthLabel }: any) {
    const router = useRouter();
    if (!d) return <View style={styles.dayWrap} />;

    return (
        <TouchableOpacity
            style={styles.dayWrap}
            onPress={() => router.push({ pathname: "/Profile/day-workout", params: { day: String(d), monthLabel } })}
        >
            {isToday ? (
                <View style={styles.ring}>
                    <LinearGradient colors={["rgba(255,120,37,0.3)", "rgba(255,120,37,0.1)"]} style={styles.inner}>
                        <Text style={styles.todayText}>{d}</Text>
                    </LinearGradient>
                </View>
            ) : (
                <Text style={styles.dayTextNormal}>{d}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
    headerCenter: { flex: 1, alignItems: "center" },
    pickerTrigger: { flexDirection: "row", alignItems: "center", gap: 6 },
    monthText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    rightIcons: { flexDirection: "row", gap: 10 },
    iconBtn: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    iconPress: { flex: 1, alignItems: "center", justifyContent: "center" },
    statsRow: { flexDirection: "row", gap: 12, paddingHorizontal: 16, marginTop: 16 },
    card: { padding: 12, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
    cardTitle: { fontSize: 14, fontWeight: "700" },
    subText: { color: "#888", fontSize: 10, marginTop: 2 },
    iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginRight: 8 },
    daysContainer: { marginHorizontal: 16, marginTop: 20, paddingVertical: 12, borderRadius: 16, flexDirection: "row", justifyContent: "space-around", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", overflow: 'hidden' },
    dayHeaderText: { color: "#666", fontSize: 12, fontWeight: "600", width: (SCREEN_WIDTH - 64) / 7, textAlign: 'center' },
    monthTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
    grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8 },
    dayWrap: { width: (SCREEN_WIDTH - 16) / 7, height: 50, alignItems: "center", justifyContent: "center" },
    dayTextNormal: { color: "#aaa", fontSize: 14 },
    ring: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: ORANGE, alignItems: "center", justifyContent: "center" },
    inner: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    todayText: { color: "#fff", fontWeight: "800", fontSize: 13 },
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    modalCard: { width: "85%", padding: 24, borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    modalTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 8 },
    modalText: { color: "#bbb", fontSize: 15, lineHeight: 22, marginBottom: 24 },
    modalBtn: { backgroundColor: ORANGE, paddingVertical: 14, borderRadius: 16, alignItems: "center" },
    modalBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end", zIndex: 1000 },
    sheetContainer: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40, paddingTop: 12, paddingHorizontal: 20, overflow: 'hidden' },
    handle: { width: 36, height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, alignSelf: "center", marginBottom: 20 },
    sheetCard: { borderRadius: 16, marginBottom: 10, backgroundColor: "rgba(255,255,255,0.05)", overflow: 'hidden' },
    sheetCardContent: { flexDirection: "row", alignItems: "center", padding: 16 },
    sheetIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,120,37,0.15)", alignItems: "center", justifyContent: "center", marginRight: 12 },
    sheetText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});