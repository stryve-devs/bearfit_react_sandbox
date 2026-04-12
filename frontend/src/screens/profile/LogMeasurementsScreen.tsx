import { GLOBAL_HISTORY } from "./MeasurementsOverviewScreen";
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    Dimensions,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient"; // Ensure this is installed
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const ORANGE = "#FF7825";

const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
];

export default function LogMeasurementsScreen() {
    const router = useRouter();

    const [showPicker, setShowPicker] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [showInfo, setShowInfo] = useState(false);

    const [measurements, setMeasurements] = useState({
        "Body Weight (kg)": "",
        "Waist (cm)": "",
        "Body Fat (%)": "",
        "Lean Body Mass (kg)": "",
        "Neck (cm)": "",
        "Shoulder (cm)": "",
        "Chest (cm)": "",
        "Left Bicep (cm)": "",
        "Right Bicep (cm)": "",
        "Left Forearm (cm)": "",
        "Right Forearm (cm)": "",
        "Abdomen (cm)": "",
        "Left Thigh (cm)": "",
        "Right Thigh (cm)": "",
        "Left Calf (cm)": "",
        "Right Calf (cm)": "",
    });

    const translateY = useSharedValue(SCREEN_HEIGHT);

    useEffect(() => {
        translateY.value = withTiming(showPicker ? 0 : SCREEN_HEIGHT, {
            duration: 400,
            easing: Easing.bezier(0.33, 1, 0.68, 1),
        });
    }, [showPicker]);

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    function generateCalendar(date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;
        for (let i = startDay; i > 0; i--) days.push(new Date(year, month, 1 - i));
        for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
        return days;
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>

                {/* HEADER */}
                <View style={styles.header}>
                    <BlurContainer style={styles.iconBtn}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconPress}>
                            <Feather name="chevron-left" size={22} color="#fff" />
                        </TouchableOpacity>
                    </BlurContainer>

                    <Text style={styles.title}>Log Measurements</Text>

                    <BlurContainer style={styles.saveBtn}>
                        <TouchableOpacity
                            style={styles.savePress}
                            onPress={() => {
                                const entry = { date: selectedDate.toISOString(), measurements };
                                GLOBAL_HISTORY.push(entry);
                                // ✅ Redirect back to Overview
                                router.replace("/(tabs)/Profile/log-measurements");
                            }}
                        >
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </BlurContainer>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* DATE SELECTOR (FIXED TRIGGER) */}
                    <TouchableOpacity style={styles.dateRow} onPress={() => setShowCalendar(true)}>
                        <Text style={styles.label}>Log Date</Text>
                        <View style={styles.dateValueBox}>
                            <Text style={styles.value}>{selectedDate.toDateString()}</Text>
                            <Feather name="calendar" size={14} color={ORANGE} style={{marginLeft: 8}} />
                        </View>
                    </TouchableOpacity>

                    {/* PROGRESS PIC SECTION */}
                    <View style={styles.section}>
                        <View style={styles.rowNoBorder}>
                            <Text style={styles.label}>Progress Picture</Text>
                            {/* ✅ FIXED INFO TRIGGER */}
                            <TouchableOpacity onPress={() => setShowInfo(true)}>
                                <Feather name="help-circle" size={18} color="#555" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.imageBox} onPress={() => setShowPicker(true)}>
                            <Feather name="camera" size={24} color={ORANGE} />
                            <Text style={styles.addPic}>Add Picture</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Details</Text>

                    {Object.keys(measurements).map((item, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.measureText}>{item}</Text>
                            <TextInput
                                style={styles.input}
                                value={measurements[item as keyof typeof measurements]}
                                onChangeText={(text) => setMeasurements({...measurements, [item]: text})}
                                placeholder="0.0"
                                placeholderTextColor="#333"
                                keyboardType="decimal-pad"
                            />
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>

            {/* ✅ FIXED CALENDAR MODAL */}
            <Modal visible={showCalendar} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowCalendar(false)} />
                    <LinearGradient colors={["#1A1A1A", "#080808"]} style={styles.calendarSheet}>
                        <View style={styles.handle} />
                        <View style={styles.calHeader}>
                            <Text style={styles.monthText}>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</Text>
                            <View style={{ flexDirection: "row", gap: 15 }}>
                                <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>
                                    <Feather name="chevron-left" size={20} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>
                                    <Feather name="chevron-right" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.grid}>
                            {generateCalendar(viewDate).map((day, i) => {
                                const isSelected = selectedDate.toDateString() === day.toDateString();
                                return (
                                    <TouchableOpacity key={i} style={[styles.day, isSelected && styles.selectedDay]} onPress={() => setSelectedDate(day)}>
                                        <Text style={{ color: isSelected ? "#fff" : "#aaa", fontWeight: isSelected ? "700" : "400" }}>{day.getDate()}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <TouchableOpacity style={styles.confirmBtn} onPress={() => setShowCalendar(false)}>
                            <Text style={styles.confirmBtnText}>Confirm Date</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </Modal>

            {/* ✅ FIXED INFO MODAL */}
            <Modal visible={showInfo} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowInfo(false)} />
                    <BlurContainer style={styles.popupCard}>
                        <Feather name="camera" size={30} color={ORANGE} style={{ marginBottom: 15 }} />
                        <Text style={styles.popupTitle}>Progress Photos</Text>
                        <Text style={styles.popupText}>Visual tracking helps you see changes the scale might miss. These photos stay private.</Text>
                        <TouchableOpacity style={styles.popupButton} onPress={() => setShowInfo(false)}>
                            <Text style={styles.popupButtonText}>Got it</Text>
                        </TouchableOpacity>
                    </BlurContainer>
                </View>
            </Modal>

            {/* BOTTOM SHEET PICKER */}
            {showPicker && (
                <View style={StyleSheet.absoluteFill}>
                    <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowPicker(false)} />
                    <Animated.View style={[styles.sheet, sheetStyle]}>
                        <BlurContainer style={styles.sheetInner}>
                            <View style={styles.handle} />
                            <Text style={styles.sheetTitle}>Select Source</Text>
                            <View style={styles.optionRow}>
                                <TouchableOpacity style={styles.optionItem} onPress={() => setShowPicker(false)}>
                                    <View style={styles.optionIconBox}><Feather name="camera" size={24} color="#fff" /></View>
                                    <Text style={styles.optionLabel}>Camera</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.optionItem} onPress={() => setShowPicker(false)}>
                                    <View style={[styles.optionIconBox, { backgroundColor: 'rgba(255,255,255,0.06)' }]}><Feather name="image" size={24} color="#fff" /></View>
                                    <Text style={styles.optionLabel}>Gallery</Text>
                                </TouchableOpacity>
                            </View>
                        </BlurContainer>
                    </Animated.View>
                </View>
            )}
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
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
    title: { color: ORANGE, fontSize: 18, fontWeight: "700" },
    iconBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    iconPress: { flex: 1, alignItems: "center", justifyContent: "center" },
    saveBtn: { borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,120,37,0.3)" },
    savePress: { paddingHorizontal: 20, paddingVertical: 8 },
    saveText: { color: ORANGE, fontWeight: "700" },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    dateRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 20, borderBottomWidth: 1, borderColor: "#1A1A1A" },
    dateValueBox: { flexDirection: 'row', alignItems: 'center' },
    label: { color: "#666", fontWeight: "600" },
    value: { color: "#fff", fontWeight: "600" },
    section: { marginTop: 10 },
    rowNoBorder: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
    imageBox: { backgroundColor: "rgba(255,255,255,0.01)", borderWidth: 1, borderStyle: 'dashed', borderColor: "#333", borderRadius: 24, padding: 30, alignItems: "center" },
    addPic: { color: ORANGE, marginTop: 8, fontWeight: "700" },
    sectionTitle: { color: "#444", fontWeight: "800", textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5, marginTop: 35, marginBottom: 10 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderColor: "#111" },
    measureText: { color: "#eee", fontSize: 15 },
    input: { color: "#fff", textAlign: "right", fontSize: 16, fontWeight: "700", width: 120 },

    // Modal & Calendar Styles
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" },
    calendarSheet: { width: "90%", borderRadius: 30, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    calHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    monthText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    day: { width: "14.28%", height: 45, alignItems: "center", justifyContent: "center", borderRadius: 12 },
    selectedDay: { backgroundColor: ORANGE },
    confirmBtn: { backgroundColor: ORANGE, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 20 },
    confirmBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

    popupCard: { width: "80%", borderRadius: 30, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    popupTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 10 },
    popupText: { color: "#888", textAlign: "center", lineHeight: 22, marginBottom: 25 },
    popupButton: { backgroundColor: ORANGE, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 16 },
    popupButtonText: { color: "#fff", fontWeight: "700" },

    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.85)" },
    sheet: { position: 'absolute', bottom: 0, width: "100%", paddingHorizontal: 12, paddingBottom: 30 },
    sheetInner: { borderRadius: 35, padding: 25, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
    handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginBottom: 20 },
    sheetTitle: { color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 25 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-around', gap: 15 },
    optionItem: { alignItems: 'center', gap: 12, flex: 1 },
    optionIconBox: { width: '100%', height: 75, backgroundColor: ORANGE, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    optionLabel: { color: '#fff', fontSize: 14, fontWeight: '600', opacity: 0.9 }
});