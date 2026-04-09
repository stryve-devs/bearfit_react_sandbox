import { GLOBAL_HISTORY } from "./MeasurementsOverviewScreen";
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput, // ✅ ADDED
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from "react-native-reanimated";

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

    // ✅ NEW STATE FOR INPUTS
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

    const translateY = useSharedValue(400);

    function generateCalendar(date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];

        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        for (let i = startDay; i > 0; i--) {
            days.push(new Date(year, month, 1 - i));
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    }

    useEffect(() => {
        translateY.value = withTiming(showPicker ? 0 : 400, {
            duration: 250,
            easing: Easing.out(Easing.cubic),
        });
    }, [showPicker]);

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <View style={styles.header}>
                    <BlurView intensity={60} tint="dark" style={styles.iconBtn}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>
                    </BlurView>

                    <Text style={styles.title}>Log Measurements</Text>

                    <BlurView intensity={60} tint="dark" style={styles.saveBtn}>
                        <TouchableOpacity
                            onPress={() => {
                                const entry = {
                                    date: selectedDate.toISOString(),
                                    measurements,
                                };

                                GLOBAL_HISTORY.push(entry); // ✅ STORE

                                router.push({
                                    pathname: "/(tabs)/Profile/log-measurements",
                                    params: {
                                        data: JSON.stringify(entry),
                                    },
                                });
                            }}
                        >
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </BlurView>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>

                    {/* DATE */}
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setShowCalendar(true)}
                    >
                        <Text style={styles.label}>Date</Text>
                        <Text style={styles.value}>
                            {selectedDate.toDateString()}
                        </Text>
                    </TouchableOpacity>

                    {/* PROGRESS */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Progress Picture</Text>
                            <TouchableOpacity onPress={() => setShowInfo(true)}>
                                <Feather name="help-circle" size={18} color="#aaa" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.imageBox}
                            onPress={() => setShowPicker(true)}
                        >
                            <Feather name="camera" size={22} color={ORANGE} />
                            <Text style={styles.addPic}>Add Picture</Text>
                        </TouchableOpacity>
                    </View>

                    {/* MEASUREMENTS */}
                    <Text style={styles.sectionTitle}>Measurement</Text>

                    {Object.keys(measurements).map((item, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.measureText}>{item}</Text>

                            <TextInput
                                style={styles.input}
                                value={measurements[item]}
                                onChangeText={(text) =>
                                    setMeasurements({
                                        ...measurements,
                                        [item]: text,
                                    })
                                }
                                placeholder="-"
                                placeholderTextColor="#555"
                                keyboardType="numeric"
                            />
                        </View>
                    ))}

                </ScrollView>

            </SafeAreaView>

            {/* IMAGE PICKER */}
            <View
                pointerEvents={showPicker ? "auto" : "none"}
                style={[styles.overlay, { opacity: showPicker ? 1 : 0 }]}
            >
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={() => setShowPicker(false)}
                />

                <Animated.View style={[styles.sheet, sheetStyle]}>
                    <BlurView intensity={100} tint="dark" style={styles.sheetInner}>

                        <View style={styles.handle} />

                        {/* TAKE PHOTO (PRIMARY) */}
                        <TouchableOpacity style={styles.primaryOption}>
                            <Feather name="camera" size={18} color="#fff" />
                            <Text style={styles.primaryText}>Take Picture</Text>
                        </TouchableOpacity>

                        {/* UPLOAD */}
                        <TouchableOpacity style={styles.option}>
                            <Feather name="image" size={18} color="#fff" />
                            <Text style={styles.optionText}>Upload Picture</Text>
                        </TouchableOpacity>

                    </BlurView>
                </Animated.View>
            </View>

            {/* INFO POPUP */}
            <Modal visible={showInfo} transparent animationType="fade">
                <View style={styles.popupOverlay}>

                    <View style={styles.popupCard}>

                        <View style={{ marginBottom: 12 }}>
                            {/* ICON */}
                            <Feather
                                name="camera"
                                size={26}
                                color="#FF7825"
                                style={{ marginBottom: 6 }}
                            />
                            {/* TITLE */}
                            <Text style={styles.popupTitle}>
                                Progress Pictures
                            </Text>
                        </View>

                        <Text style={styles.popupText}>
                            You can upload pictures of yourself and track your physical transformation over time.
                            Your photos are securely stored and will not be shared with your followers.
                        </Text>

                        <TouchableOpacity
                            style={styles.popupButton}
                            onPress={() => setShowInfo(false)}
                        >
                            <Text style={styles.popupButtonText}>Got it</Text>
                        </TouchableOpacity>

                    </View>

                </View>
            </Modal>

            {/* CALENDAR */}
            <Modal visible={showCalendar} transparent animationType="slide">
                <View style={styles.overlay}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        onPress={() => setShowCalendar(false)}
                    />

                    <LinearGradient
                        colors={["#16161a", "#0e0e10"]}
                        style={styles.calendarSheet}
                    >
                        <View style={styles.handle} />

                        <View style={styles.calHeader}>
                            <Text style={styles.monthText}>
                                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </Text>

                            <View style={{ flexDirection: "row", gap: 10 }}>
                                <TouchableOpacity
                                    onPress={() =>
                                        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
                                    }
                                >
                                    <Feather name="chevron-left" size={20} color="#fff" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() =>
                                        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
                                    }
                                >
                                    <Feather name="chevron-right" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.weekRow}>
                            {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((d, i) => (
                                <Text key={i} style={styles.weekText}>{d}</Text>
                            ))}
                        </View>

                        <View style={styles.grid}>
                            {generateCalendar(viewDate).map((day, i) => {
                                const isSelected =
                                    selectedDate.toDateString() === day.toDateString();

                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.day,
                                            isSelected && styles.selectedDay,
                                        ]}
                                        onPress={() => setSelectedDate(day)}
                                    >
                                        <Text style={{ color: isSelected ? "#fff" : "#aaa" }}>
                                            {day.getDate()}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={() => setShowCalendar(false)}
                        >
                            <Text style={{ color: "#fff", fontWeight: "600" }}>
                                Confirm Date
                            </Text>
                        </TouchableOpacity>

                    </LinearGradient>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#080808",
        paddingHorizontal: 20,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },

    title: {
        color: "#FF7825",
        fontSize: 18,
        fontWeight: "600",
    },

    saveBtn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "rgba(255,120,37,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,120,37,0.4)",
    },

    saveText: {
        color: "#FF7825",
        fontWeight: "600",
    },

    iconBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },

    section: {
        marginTop: 20,
    },

    sectionTitle: {
        color: "#888",
        marginTop: 25,
        marginBottom: 10,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderColor: "#222",
    },

    label: {
        color: "#aaa",
    },

    value: {
        color: ORANGE,
    },

    measureText: {
        color: "#fff",
    },

    input: {
        color: "#fff",
        minWidth: 60,
        textAlign: "right",
        fontSize: 15,
    },

    imageBox: {
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 14,
        padding: 30,
        alignItems: "center",
        marginTop: 10,
    },

    addPic: {
        color: ORANGE,
        marginTop: 8,
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
    },

    // ✅ FIXED BOTTOM SHEET
    sheet: {
        width: "100%",
        paddingHorizontal: 16,
        paddingBottom: 30,
    },

    sheetInner: {
        borderRadius: 28,
        padding: 16,

        // GLASS BASE
        backgroundColor: "rgba(20,20,20,0.55)",

        // BORDER GLOW (glass edge)
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",

        // SHADOW = FLOATING EFFECT (ANDROID + IOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 20, // Android depth
    },

    handle: {
        width: 40,
        height: 5,
        backgroundColor: "#666",
        borderRadius: 10,
        alignSelf: "center",
        marginBottom: 14,
    },

    // ✅ PRIMARY BUTTON (NEW)
    primaryOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#FF7825",
        marginBottom: 12,

        // 🔽 REDUCED GLOW (CLEAN + PREMIUM)
        shadowColor: "#FF7825",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, // ↓ was 0.6
        shadowRadius: 4,     // ↓ was 10
        elevation: 3,        // ↓ was 12
    },

    primaryText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },

    // ✅ SECONDARY BUTTON (UPDATED)
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 16,
        borderRadius: 12,

        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    optionText: {
        color: "#fff",
        fontSize: 15,
    },

    weekRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
    },

    weekText: {
        color: "#777",
        width: "14.28%",
        textAlign: "center",
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 20,
    },

    day: {
        width: "14.28%",
        height: 46,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
    },

    selectedDay: {
        backgroundColor: "#FF7825",
        borderRadius: 14,
    },

    calendarSheet: {
        width: "94%",
        borderRadius: 30,
        padding: 20,
        marginBottom: 12,
        backgroundColor: "rgba(18,18,22,0.98)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    calHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    monthText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    confirmBtn: {
        backgroundColor: "#FF7825",
        paddingVertical: 16,
        borderRadius: 22,
        alignItems: "center",
    },

    popupOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },

    popupCard: {
        width: "85%",
        borderRadius: 24,
        padding: 20,

        // GLASS LOOK
        backgroundColor: "rgba(25,25,25,0.85)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },

    popupTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
    },

    popupText: {
        color: "#aaa",
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },

    popupButton: {
        backgroundColor: "#FF7825",
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
    },

    popupButtonText: {
        color: "#fff",
        fontWeight: "600",
    },

});