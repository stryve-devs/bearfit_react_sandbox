import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Platform,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown, ScaleInDown } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ORANGE = "#FF7825";
const ALL_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HPAD = 16;
const COLUMN_WIDTH = (SCREEN_WIDTH - (HPAD * 2)) / 7;

export default function CalendarScreen() {
    const [activeModal, setActiveModal] = useState<"streak" | "rest" | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedView, setSelectedView] = useState("Month");
    const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);

    const router = useRouter();
    const todayDate = new Date();
    const currentMonth = todayDate.getMonth();
    const currentYear = todayDate.getFullYear();
    const today = todayDate.getDate();

    useFocusEffect(
        useCallback(() => {
            const getPref = async () => {
                const saved = await AsyncStorage.getItem("firstDayOfWeek");
                if (saved !== null) setFirstDayOfWeek(parseInt(saved));
            };
            getPref();
        }, [])
    );

    const shiftedWeekdays = [
        ...ALL_WEEKDAYS.slice(firstDayOfWeek),
        ...ALL_WEEKDAYS.slice(0, firstDayOfWeek),
    ];

    const generateMonthDays = (month, year) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const blanksCount = (firstDayOfMonth - firstDayOfWeek + 7) % 7;
        const daysArray = [];

        for (let i = 0; i < blanksCount; i++) daysArray.push(null);
        for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

        const totalSlots = Math.ceil(daysArray.length / 7) * 7;
        while (daysArray.length < totalSlots) {
            daysArray.push(null);
        }

        return daysArray;
    };

    const renderCalendarGrid = (month, year) => {
        const monthDays = generateMonthDays(month, year);
        const monthLabel = new Date(year, month).toLocaleString("default", { month: "long" });

        return (
            <Animated.View entering={FadeInDown.duration(600)} key={`${month}-${year}`} style={styles.monthSection}>
                {/* CHANGED: Back to a regular View so clicking "April/May" does nothing */}
                <View style={styles.monthHeaderRow}>
                    <Text style={styles.monthTitle}>{monthLabel}</Text>
                    <Text style={styles.yearSubtitle}>{year}</Text>
                </View>

                <View style={styles.gridContainer}>
                    <View style={styles.grid}>
                        {monthDays.map((d, index) => (
                            <Day
                                key={`${month}-${index}`}
                                d={d}
                                isToday={d === today && month === currentMonth}
                                monthLabel={`${monthLabel} ${year}`}
                            />
                        ))}
                    </View>
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.bgGlow} />
            <LinearGradient colors={["#0A0A0A", "#000"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.navbar}>

                    {/* LEFT - BACK */}
                    <TouchableOpacity onPress={() => router.back()} style={styles.navBox}>
                        <Feather name="arrow-left" size={20} color="#fff" />
                    </TouchableOpacity>

                    {/* CENTER - VIEW SELECTOR */}
                    <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.viewSelector}>
                        <Text style={styles.selectorText}>Month</Text>
                        <Feather name="chevron-down" size={14} color={ORANGE} />
                    </TouchableOpacity>

                    {/* RIGHT - SETTINGS + SHARE */}
                    <View style={{ flexDirection: "row", gap: 10 }}>

                        <TouchableOpacity onPress={() => router.push("/Profile/first-weekday")} style={styles.navBox}>
                            <Feather name="settings" size={18} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.navBox}>
                            <Feather name="share-2" size={18} color="#fff" />
                        </TouchableOpacity>

                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                    <View style={styles.statsContainer}>
                        <StatCard
                            title="Streak"
                            val="12"
                            sub="Days"
                            icon="zap"
                            color={ORANGE}
                            onPress={() => setActiveModal("streak")}
                        />
                        <StatCard
                            title="Rest"
                            val="2"
                            sub="Days"
                            icon="moon"
                            color="#4da6ff"
                            onPress={() => setActiveModal("rest")}
                        />
                    </View>

                    <View style={styles.labelsRow}>
                        {shiftedWeekdays.map((d) => (
                            <Text key={d} style={styles.labelText}>{d[0]}</Text>
                        ))}
                    </View>

                    {renderCalendarGrid(currentMonth, currentYear)}
                    {renderCalendarGrid((currentMonth + 1) % 12, currentMonth === 11 ? currentYear + 1 : currentYear)}
                </ScrollView>
            </SafeAreaView>

            {/* MODAL POPUP FOR STREAK / REST */}
            <Modal visible={activeModal !== null} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setActiveModal(null)} />
                    <Animated.View entering={ScaleInDown} style={styles.modalContent}>
                        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                        <Text style={styles.modalIcon}>{activeModal === "streak" ? "🔥" : "🌙"}</Text>
                        <Text style={styles.modalTitle}>{activeModal === "streak" ? "Current Streak" : "Rest Recovery"}</Text>
                        <Text style={styles.modalDesc}>
                            {activeModal === "streak" ? "You've logged at least one workout every week. Keep the momentum building!" : "The number of days since your last session. Recovery is vital for progress."}
                        </Text>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setActiveModal(null)}>
                            <Text style={styles.closeBtnText}>Got it</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            {/* ADDED: BOTTOM POPUP FOR VIEW PICKER */}
            <Modal visible={showPicker} transparent animationType="slide">
                <View style={styles.sheetOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowPicker(false)} />
                    <BlurView intensity={90} tint="dark" style={styles.sheetContainer}>
                        <View style={styles.handle} />
                        <Text style={styles.sheetHeader}>Change View</Text>

                        {["Month", "Year", "Multi-year"].map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={styles.sheetCard}
                                onPress={() => {
                                    setShowPicker(false);
                                    if (item === "Year") {
                                        router.push("/Profile/year-view");
                                    } else if (item === "Multi-year") {
                                        router.push("/Profile/multi-year-view");
                                    }
                                    // ❌ DO NOTHING for Month
                                }}
                            >
                                <View style={styles.sheetCardContent}>
                                    <View style={styles.sheetIcon}>
                                        <Feather name={item === "Month" ? "calendar" : item === "Year" ? "grid" : "layers"} size={18} color={ORANGE} />
                                    </View>
                                    <Text style={styles.sheetText}>{item}</Text>
                                    {selectedView === item && <Feather name="check" size={20} color={ORANGE} />}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </BlurView>
                </View>
            </Modal>
        </View>
    );
}

// --- COMPONENTS ---

function StatCard({ title, val, sub, icon, color, onPress }) {
    return (
        <TouchableOpacity style={styles.statBox} activeOpacity={0.8} onPress={onPress}>
            <BlurView intensity={10} tint="light" style={StyleSheet.absoluteFill} />
            <View style={[styles.statIconBadge, { backgroundColor: `${color}15` }]}>
                <Feather name={icon as any} size={16} color={color} />
            </View>
            <View>
                <Text style={styles.statTitle}>{title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={[styles.statVal, { color }]}>{val}</Text>
                    <Text style={styles.statSub}> {sub}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

function Day({ d, isToday, monthLabel }) {
    const router = useRouter();
    if (!d) return <View style={styles.dayCell} />;

    return (
        <TouchableOpacity
            style={styles.dayCell}
            activeOpacity={0.6}
            onPress={() => router.push({ pathname: "/Profile/day-workout", params: { day: String(d), monthLabel } })}
        >
            {isToday ? (
                <View style={styles.todayAura}>
                    <LinearGradient colors={[ORANGE, "#FF4D00"]} style={styles.todayGradient}>
                        <Text style={styles.todayText}>{d}</Text>
                    </LinearGradient>
                    <View style={styles.todayPulse} />
                </View>
            ) : (
                <Text style={styles.dayText}>{d}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    bgGlow: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: ORANGE,
        opacity: 0.1,
        filter: Platform.OS === 'ios' ? 'blur(80px)' : undefined,
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    viewSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "rgba(255,255,255,0.05)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    selectorText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginTop: 10,
    },
    statBox: {
        flex: 1,
        height: 100,
        borderRadius: 24,
        overflow: 'hidden',
        padding: 15,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    statIconBadge: {
        width: 30,
        height: 30,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statTitle: { color: '#888', fontSize: 12, fontWeight: '600' },
    statVal: { fontSize: 24, fontWeight: '800' },
    statSub: { color: '#555', fontSize: 12, fontWeight: '600' },

    labelsRow: {
        flexDirection: 'row',
        marginTop: 30,
        paddingHorizontal: HPAD,
    },
    labelText: {
        width: '14.28%',
        color: '#444',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        textAlign: 'center'
    },

    monthSection: { marginTop: 25, paddingHorizontal: HPAD },
    monthHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center', // Changed to center for chevron alignment
        gap: 8,
        marginBottom: 15,
        marginLeft: 8,
    },
    monthTitle: { color: '#fff', fontSize: 28, fontWeight: '800' },
    yearSubtitle: { color: ORANGE, fontSize: 16, fontWeight: '600', opacity: 0.8 },
    gridContainer: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 30,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: {
        width: '14.28%',
        height: 55,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: { color: '#777', fontSize: 16, fontWeight: '500' },
    todayAura: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    todayGradient: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    todayText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    todayPulse: {
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: ORANGE,
        opacity: 0.3,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '75%',
        borderRadius: 28,
        padding: 22,
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    modalIcon: { fontSize: 44, marginBottom: 15 },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 8 },
    modalDesc: {
        color: '#aaa',
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 18
    },
    closeBtn: {
        backgroundColor: ORANGE,
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 20,
    },
    closeBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    // BOTTOM SHEET STYLES
    sheetOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    sheetContainer: {
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 24,
        paddingBottom: 50,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#333',
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: 20
    },
    sheetHeader: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 20,
        textAlign: 'center'
    },
    sheetCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        marginBottom: 10
    },
    sheetCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16
    },
    sheetIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,120,37,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    sheetText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        flex: 1
    },
    navBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
});