import { GLOBAL_HISTORY } from "./MeasurementsOverviewScreen";
import React, { useState } from "react";
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
    KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    FadeInDown,
    ScaleInDown,
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
    const [showInfo, setShowInfo] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [activeInput, setActiveInput] = useState<string | null>(null);

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

    // --- LOGIC: SAVE BUTTON VALIDATION ---
    const filledCount = Object.values(measurements).filter(v => v.trim() !== "").length;
    const canSave = filledCount > 0;
    const progressWidth = (filledCount / Object.keys(measurements).length) * 100;

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
        // Fill out the rest of the grid for a clean look
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) days.push(new Date(year, month + 1, i));
        return days;
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0F0F0F", "#050505"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.blurBtn}>
                        <BlurView intensity={20} tint="light" style={styles.blurFill}>
                            <Feather name="chevron-left" size={22} color="#fff" />
                        </BlurView>
                    </TouchableOpacity>

                    <Text style={styles.title}>Log Progress</Text>

                    {/* SAVE BUTTON WITH VALIDATION */}
                    <TouchableOpacity
                        disabled={!canSave}
                        style={[styles.saveBtn, { opacity: canSave ? 1 : 0.4 }]}
                        onPress={() => {
                            GLOBAL_HISTORY.push({ date: selectedDate.toISOString(), measurements });
                            router.replace("/(tabs)/Profile/log-measurements");
                        }}
                    >
                        <LinearGradient colors={[ORANGE, "#FF4D00"]} style={styles.saveGradient}>
                            <Text style={styles.saveText}>Save</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* NEON PROGRESS BAR */}
                <View style={styles.progressBarBg}>
                    <Animated.View style={[styles.progressBarFill, { width: `${progressWidth}%` }]} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{flex: 1}}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                        <TouchableOpacity style={styles.glassCard} onPress={() => setShowCalendar(true)}>
                            <View>
                                <Text style={styles.cardLabel}>Logging for</Text>
                                <Text style={styles.cardValue}>{selectedDate.toDateString()}</Text>
                            </View>
                            <View style={styles.iconCircle}>
                                <Feather name="calendar" size={18} color={ORANGE} />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Visual Progress</Text>
                            <TouchableOpacity onPress={() => setShowInfo(true)}>
                                <Feather name="info" size={18} color={ORANGE} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.photoBox} onPress={() => setShowPicker(true)}>
                            <LinearGradient colors={["rgba(255,120,37,0.05)", "transparent"]} style={styles.photoGradient}>
                                <Feather name="camera" size={28} color={ORANGE} />
                                <Text style={styles.addPic}>Add Entry Photo</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Detailed Measurements</Text>

                        {Object.keys(measurements).map((item, index) => (
                            <Animated.View
                                entering={FadeInDown.delay(index * 30)}
                                key={item}
                                style={[styles.inputCard, activeInput === item && styles.activeInputCard]}
                            >
                                <Text style={styles.measureText}>{item.split(' (')[0]}</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        value={measurements[item as keyof typeof measurements]}
                                        onFocus={() => setActiveInput(item)}
                                        onBlur={() => setActiveInput(null)}
                                        onChangeText={(text) => setMeasurements({...measurements, [item]: text})}
                                        placeholder="0.0"
                                        placeholderTextColor="#222"
                                        keyboardType="decimal-pad"
                                    />
                                    <Text style={styles.unitText}>{item.split('(')[1]?.replace(')', '')}</Text>
                                </View>
                            </Animated.View>
                        ))}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* INFO POPUP */}
            <Modal visible={showInfo} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowInfo(false)} />
                    <Animated.View entering={ScaleInDown} style={styles.popupCard}>
                        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                        <Feather name="camera" size={40} color={ORANGE} style={{ marginBottom: 15 }} />
                        <Text style={styles.popupTitle}>Tracking Guide</Text>
                        <Text style={styles.popupText}>Consistent photos and data help identify trends that the scale won't show.</Text>
                        <TouchableOpacity style={styles.popupButton} onPress={() => setShowInfo(false)}>
                            <Text style={styles.popupButtonText}>Got it</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            {/* PHOTO PICKER */}
            <Modal visible={showPicker} transparent animationType="slide">
                <View style={styles.bottomSheetOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowPicker(false)} />
                    <View style={styles.sheetContent}>
                        <View style={styles.handle} />
                        <Text style={styles.sheetTitle}>Upload Photo</Text>
                        <View style={styles.optionRow}>
                            <TouchableOpacity style={styles.optionItem} onPress={() => setShowPicker(false)}>
                                <View style={styles.optionIcon}><Feather name="camera" size={24} color="#fff" /></View>
                                <Text style={styles.optionText}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.optionItem} onPress={() => setShowPicker(false)}>
                                <View style={[styles.optionIcon, { backgroundColor: '#111' }]}><Feather name="image" size={24} color="#fff" /></View>
                                <Text style={styles.optionText}>Library</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* IMPROVED PREMIUM CALENDAR MODAL */}
            <Modal visible={showCalendar} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowCalendar(false)} />
                    <Animated.View entering={ScaleInDown} style={styles.calendarContainer}>
                        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

                        <View style={styles.calHeader}>
                            <View>
                                <Text style={styles.monthText}>{MONTHS[viewDate.getMonth()]}</Text>
                                <Text style={styles.yearText}>{viewDate.getFullYear()}</Text>
                            </View>
                            <View style={styles.calNav}>
                                <TouchableOpacity
                                    style={styles.navBtn}
                                    onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                                >
                                    <Feather name="chevron-left" size={20} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.navBtn}
                                    onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                                >
                                    <Feather name="chevron-right" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.dayLabelsRow}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                <Text key={i} style={styles.dayLabelText}>{d}</Text>
                            ))}
                        </View>

                        <View style={styles.grid}>
                            {generateCalendar(viewDate).map((day, i) => {
                                const isSelected = selectedDate.toDateString() === day.toDateString();
                                const isCurrentMonth = day.getMonth() === viewDate.getMonth();
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.day, isSelected && styles.selectedDay]}
                                        onPress={() => setSelectedDate(day)}
                                    >
                                        <Text style={[
                                            styles.dayText,
                                            isSelected && styles.selectedDayText,
                                            !isCurrentMonth && { color: '#222' }
                                        ]}>
                                            {day.getDate()}
                                        </Text>
                                        {isSelected && <View style={styles.activeDot} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity style={styles.confirmBtn} onPress={() => setShowCalendar(false)}>
                            <LinearGradient colors={[ORANGE, "#FF4D00"]} style={styles.confirmGradient}>
                                <Text style={styles.confirmBtnText}>Confirm Date</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
    blurBtn: { width: 42, height: 42, borderRadius: 12, overflow: 'hidden' },
    blurFill: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
    title: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: -0.5 },
    saveBtn: { borderRadius: 12, overflow: 'hidden' },
    saveGradient: { paddingHorizontal: 22, paddingVertical: 10 },
    saveText: { color: "#fff", fontWeight: "800", fontSize: 14 },
    progressBarBg: { height: 3, backgroundColor: '#111', width: '100%' },
    progressBarFill: { height: '100%', backgroundColor: ORANGE },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 60, paddingTop: 10 },
    glassCard: { backgroundColor: '#0A0A0A', borderRadius: 22, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#111', marginBottom: 15 },
    cardLabel: { color: '#444', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
    cardValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
    iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    sectionTitle: { color: "#333", fontWeight: "800", textTransform: 'uppercase', fontSize: 10, letterSpacing: 1.5, marginVertical: 10 },
    photoBox: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#111', borderStyle: 'dashed' },
    photoGradient: { paddingVertical: 35, alignItems: 'center', justifyContent: 'center' },
    addPic: { color: ORANGE, marginTop: 10, fontWeight: "800", fontSize: 13 },
    inputCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0A0A0A', borderRadius: 20, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#0F0F0F' },
    activeInputCard: { borderColor: 'rgba(255,120,37,0.3)', backgroundColor: '#0F0F0F' },
    measureText: { color: "#999", fontSize: 14, fontWeight: '600' },
    inputWrapper: { flexDirection: 'row', alignItems: 'baseline' },
    input: { color: "#fff", textAlign: "right", fontSize: 18, fontWeight: "800", width: 80 },
    unitText: { color: ORANGE, fontSize: 10, fontWeight: '800', marginLeft: 4, width: 35 },

    // MODAL & CALENDAR STYLES
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
    calendarContainer: { width: "85%", borderRadius: 26, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", overflow: 'hidden', backgroundColor: 'rgba(10,10,10,0.8)' },
    calHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
    monthText: { color: "#fff", fontSize: 20, fontWeight: "800" },
    yearText: { color: ORANGE, fontSize: 14, fontWeight: "600", marginTop: -2 },
    calNav: { flexDirection: "row", gap: 8 },
    navBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: 'center', justifyContent: 'center' },
    dayLabelsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
    dayLabelText: { color: '#444', fontSize: 12, fontWeight: '800' },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: 'space-around' },
    day: { width: "13%", height: 38, alignItems: "center", justifyContent: "center", borderRadius: 14, marginVertical: 2 },
    dayText: { color: "#999", fontSize: 15, fontWeight: "500" },
    selectedDay: { backgroundColor: 'rgba(255, 120, 37, 0.15)' },
    selectedDayText: { color: ORANGE, fontWeight: "800" },
    activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: ORANGE, position: 'absolute', bottom: 8 },
    confirmBtn: { marginTop: 25, borderRadius: 18, overflow: 'hidden' },
    confirmGradient: { height: 48, alignItems: "center", justifyContent: "center" },
    confirmBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

    popupCard: { width: "70%", borderRadius: 24, padding: 20, alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
    popupTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 10 },
    popupText: { color: "#999", textAlign: 'center', lineHeight: 22, marginBottom: 25 },
    popupButton: { backgroundColor: ORANGE, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 16 },
    popupButtonText: { color: "#fff", fontWeight: "800" },

    bottomSheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
    sheetContent: { backgroundColor: '#0A0A0A', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, paddingBottom: 50, borderWidth: 1, borderColor: '#111' },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#222", alignSelf: "center", marginBottom: 20 },
    sheetTitle: { color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 30 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-around' },
    optionItem: { alignItems: 'center', gap: 12 },
    optionIcon: { width: 70, height: 70, backgroundColor: ORANGE, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    optionText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});