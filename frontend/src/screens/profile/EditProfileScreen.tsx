import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    Modal,
    ScrollView,
    Pressable,
    Animated,
    Alert,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "@/components/profile/Toast";

const ORANGE = "#ff7a00";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// ─── Glass card wrapper ───────────────────────────────────────────────────────
const GlassCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[cardSt.card, style]}
    >
        <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.1)", "transparent"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={cardSt.shine}
            pointerEvents="none"
        />
        {children}
    </LinearGradient>
);
// ─── Input row with Animated Focus Line ───────────────────────────────────────
const InputRow = ({
                      label,
                      last = false,
                      multiline = false,
                      ...inputProps
                  }: {
    label: string;
    last?: boolean;
    multiline?: boolean;
    [key: string]: any;
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const scaleX = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    return (
        <View style={[inSt.row, last && { borderBottomWidth: 0 }]}>
            <Text style={inSt.label}>{label}</Text>
            <TextInput
                style={[inSt.input, multiline && { height: 52 }]}
                placeholderTextColor="rgba(240,237,232,0.2)"
                multiline={multiline}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...inputProps}
            />
            <Animated.View style={[inSt.focusLine, { opacity: focusAnim, transform: [{ scaleX }] }]}>
                <LinearGradient
                    colors={["transparent", ORANGE, "transparent"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState("Alex Rivera");
    const [bio, setBio] = useState("");
    const [link, setLink] = useState("");
    const [sex, setSex] = useState("");

    // Calendar & Birthday state
    const [hasBirthday, setHasBirthday] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date(2000, 0, 1));
    const [viewDate, setViewDate] = useState(new Date(2000, 0, 1));

    // Date Typing State
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [inputMonth, setInputMonth] = useState("");
    const [inputYear, setInputYear] = useState("");

    const [showSex, setShowSex] = useState(false);
    const [showBirthday, setShowBirthday] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const birthdayLabel = hasBirthday
        ? `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
        : "";

    const openBirthday = () => {
        setViewDate(new Date(selectedDate));
        setIsEditingDate(false); // Reset edit state
        setShowBirthday(true);
    };

    const confirmBirthday = () => {
        setHasBirthday(true);
        setShowBirthday(false);
    };

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const handleDone = () => {
        setToastMessage("Profile updated successfully.");
        setToastVisible(true);
        setTimeout(() => {
            router.back();
        }, 500);
    };

    // ─── Calendar Logic ───
    const changeMonth = (diff: number) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + diff, 1));
    };
    const changeYear = (diff: number) => {
        setViewDate(new Date(viewDate.getFullYear() + diff, viewDate.getMonth(), 1));
    };

    const handleEditDatePress = () => {
        setInputMonth(String(viewDate.getMonth() + 1).padStart(2, "0"));
        setInputYear(String(viewDate.getFullYear()));
        setIsEditingDate(true);
    };

    const handleDateSubmit = () => {
        let m = parseInt(inputMonth, 10);
        let y = parseInt(inputYear, 10);

        // Auto-correct invalid entries bounds
        if (isNaN(m) || m < 1) m = 1;
        if (m > 12) m = 12;

        const currentYear = new Date().getFullYear();
        if (isNaN(y) || y < 1900) y = 1900;
        if (y > currentYear) y = currentYear;

        setViewDate(new Date(y, m - 1, 1));
        setIsEditingDate(false);
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        let day = new Date(year, month, 1).getDay() - 1;
        return day < 0 ? 6 : day;
    };

    const renderCalendarGrid = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const prevMonthDays = getDaysInMonth(year, month - 1);

        const grid = [];

        for (let i = 0; i < firstDay; i++) {
            grid.unshift({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
        }
        const remaining = grid.length % 7;
        if (remaining !== 0) {
            for (let i = 1; i <= 7 - remaining; i++) {
                grid.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
            }
        }

        return grid.map((cell, index) => {
            const isSelected = selectedDate.getDate() === cell.day &&
                selectedDate.getMonth() === cell.date.getMonth() &&
                selectedDate.getFullYear() === cell.date.getFullYear();

            return (
                <TouchableOpacity
                    key={index}
                    style={[calSt.dayCell, isSelected && calSt.selectedCell]}
                    onPress={() => {
                        setSelectedDate(cell.date);
                        setViewDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                    }}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        calSt.dayTxt,
                        !cell.isCurrentMonth && calSt.mutedTxt,
                        isSelected && calSt.selectedTxt
                    ]}>
                        {cell.day}
                    </Text>
                </TouchableOpacity>
            );
        });
    };

    return (
        <LinearGradient
            colors={["#0e0e11", "#0a0906", "#080808", "#0a0906", "#0b0b0e"]}
            locations={[0, 0.2, 0.5, 0.75, 1]}
            start={{ x: 0.16, y: 0 }} end={{ x: 0.84, y: 1 }}
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
                {/* ── Header ── */}
                <View style={st.header}>
                    <TouchableOpacity style={st.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={16} color="#f0ede8" />
                    </TouchableOpacity>
                    <Text style={st.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity style={st.doneBtn} onPress={handleDone} activeOpacity={0.8}>
                        <Text style={st.doneTxt}>Done</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
                    {/* ── Avatar ── */}
                    <View style={st.avatarSection}>
                        <View style={st.avatarWrap}>
                            <AvatarRing />
                            <Image source={{ uri: "https://i.pravatar.cc/150?img=12" }} style={st.avatarImg} />
                            <TouchableOpacity style={st.cameraBtn} activeOpacity={0.8}>
                                <Feather name="camera" size={12} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={st.username}>{name || "Your Name"}</Text>
                        <Text style={st.handle}>@{(name || "yourname").toLowerCase().replace(/\s+/g, "")}</Text>
                        <TouchableOpacity>
                            <Text style={st.changePic}>Change Picture</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Stats pills ── */}
                    <View style={st.statsRow}>
                        {[["284", "Workouts"], ["12.4k", "Following"], ["3.1k", "Followers"]].map(([num, lbl]) => (
                            <GlassCard key={lbl} style={st.statPill}>
                                <Text style={st.statNum}>{num}</Text>
                                <Text style={st.statLbl}>{lbl}</Text>
                            </GlassCard>
                        ))}
                    </View>

                    {/* ── Public profile ── */}
                    <Text style={st.sectionLabel}>Public Profile</Text>
                    <GlassCard style={{ marginBottom: 24 }}>
                        <InputRow label="Name" placeholder="Your full name" value={name} onChangeText={setName} />
                        <InputRow label="Bio" placeholder="Describe yourself" value={bio} onChangeText={setBio} multiline />
                        <InputRow label="Link" placeholder="https://example.com" value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" last />
                    </GlassCard>

                    {/* ── Private data ── */}
                    <View style={st.privateHeader}>
                        <Text style={st.sectionLabel}>Private Data</Text>
                        <TouchableOpacity style={st.infoBtn} onPress={() => setShowInfo(true)} hitSlop={8}>
                            <Ionicons name="help-circle-outline" size={14} color="rgba(240,237,232,0.4)" />
                        </TouchableOpacity>
                    </View>
                    <GlassCard>
                        <TouchableOpacity style={st.selectRow} onPress={() => setShowSex(true)} activeOpacity={0.7}>
                            <Text style={st.selectLabel}>Sex</Text>
                            <View style={st.selectRight}>
                                <Text style={[st.selectValue, !sex && st.selectPlaceholder]}>{sex || "Select"}</Text>
                                <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.25)" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[st.selectRow, { borderBottomWidth: 0 }]} onPress={openBirthday} activeOpacity={0.7}>
                            <Text style={st.selectLabel}>Birthday</Text>
                            <View style={st.selectRight}>
                                <Text style={[st.selectValue, !hasBirthday && st.selectPlaceholder]}>{birthdayLabel || "Select"}</Text>
                                <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.25)" />
                            </View>
                        </TouchableOpacity>
                    </GlassCard>
                </ScrollView>

                {/* ── Calendar / Birthday Modal ── */}
                <Modal visible={showBirthday} transparent animationType="slide">
                    <View style={sh.overlay}>
                        <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowBirthday(false)}>
                            <View style={sh.backdrop} />
                        </Pressable>
                        <LinearGradient colors={["rgba(22,22,26,0.98)", "rgba(14,14,16,0.99)"]} style={sh.sheet}>
                            <View style={sh.shine} pointerEvents="none" />
                            <View style={sh.handle} />

                            {/* Calendar Header with Edit Toggle */}
                            <View style={calSt.headerRow}>
                                {isEditingDate ? (
                                    <View style={calSt.editDateWrap}>
                                        <TextInput
                                            style={calSt.dateInput}
                                            value={inputMonth}
                                            onChangeText={setInputMonth}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                            placeholder="MM"
                                            placeholderTextColor="rgba(240,237,232,0.3)"
                                            autoFocus
                                        />
                                        <Text style={calSt.slash}>/</Text>
                                        <TextInput
                                            style={[calSt.dateInput, { minWidth: 64 }]}
                                            value={inputYear}
                                            onChangeText={setInputYear}
                                            keyboardType="number-pad"
                                            maxLength={4}
                                            placeholder="YYYY"
                                            placeholderTextColor="rgba(240,237,232,0.3)"
                                        />
                                        <TouchableOpacity onPress={handleDateSubmit} style={calSt.checkBtn} activeOpacity={0.8}>
                                            <Feather name="check" size={18} color={ORANGE} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity onPress={handleEditDatePress} activeOpacity={0.7} style={calSt.titleTouch}>
                                        <Text style={calSt.monthYearTxt}>
                                            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                                        </Text>
                                        <Feather name="edit-2" size={14} color="rgba(240,237,232,0.4)" />
                                    </TouchableOpacity>
                                )}

                                {!isEditingDate && (
                                    <View style={calSt.arrowsWrap}>
                                        <TouchableOpacity style={calSt.arrowBtn} onPress={() => changeYear(-1)}>
                                            <Feather name="chevrons-left" size={18} color="#f0ede8" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={calSt.arrowBtn} onPress={() => changeMonth(-1)}>
                                            <Feather name="chevron-left" size={18} color="#f0ede8" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={calSt.arrowBtn} onPress={() => changeMonth(1)}>
                                            <Feather name="chevron-right" size={18} color="#f0ede8" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={calSt.arrowBtn} onPress={() => changeYear(1)}>
                                            <Feather name="chevrons-right" size={18} color="#f0ede8" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {/* Days of week */}
                            <View style={calSt.weekdaysRow}>
                                {DAYS_OF_WEEK.map((d, i) => (
                                    <Text key={i} style={calSt.weekdayTxt}>{d}</Text>
                                ))}
                            </View>

                            {/* Grid */}
                            <View style={calSt.grid}>
                                {renderCalendarGrid()}
                            </View>

                            <TouchableOpacity activeOpacity={0.85} onPress={confirmBirthday} style={{ marginTop: 24 }}>
                                <LinearGradient colors={["#ff7a00", "#ff5500"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={sh.confirmBtn}>
                                    <Text style={sh.confirmTxt}>Confirm Date</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </Modal>

                {/* ── Sex Modal ── */}
                <Modal visible={showSex} transparent animationType="slide">
                    <View style={sh.overlay}>
                        <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowSex(false)}>
                            <View style={sh.backdrop} />
                        </Pressable>
                        <LinearGradient colors={["rgba(22,22,26,0.98)", "rgba(14,14,16,0.99)"]} style={sh.sheet}>
                            <View style={sh.shine} pointerEvents="none" />
                            <View style={sh.handle} />
                            <Text style={sh.title}>Select Sex</Text>
                            {["Male", "Female", "Other"].map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={sh.sexRow}
                                    onPress={() => { setSex(item); setShowSex(false); }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[sh.sexTxt, sex === item && { color: ORANGE }]}>{item}</Text>
                                    {sex === item && <Feather name="check" size={16} color={ORANGE} />}
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={sh.cancelBtn} onPress={() => setShowSex(false)} activeOpacity={0.7}>
                                <Text style={sh.cancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </Modal>

                {/* ── Info Modal ── */}
                <Modal visible={showInfo} transparent animationType="fade">
                    <View style={infoSt.overlay}>
                        <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowInfo(false)}>
                            <View style={{ flex: 1 }} />
                        </Pressable>
                        <LinearGradient colors={["rgba(28,28,32,0.98)", "rgba(18,18,22,0.99)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={infoSt.box}>
                            <View style={infoSt.shine} pointerEvents="none" />
                            <Text style={infoSt.icon}>🔒</Text>
                            <Text style={infoSt.title}>Private Data</Text>
                            <Text style={infoSt.body}>
                                Your private data is used to personalise your experience. Having your age and sex
                                allows you to compare yourself to athletes in your specific demographic.
                            </Text>
                            <TouchableOpacity activeOpacity={0.85} onPress={() => setShowInfo(false)}>
                                <LinearGradient colors={["#ff7a00", "#ff5500"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={sh.confirmBtn}>
                                    <Text style={sh.confirmTxt}>Got it</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </Modal>
                <Toast
                    visible={toastVisible}
                    message={toastMessage}
                    onClose={() => setToastVisible(false)}
                    duration={3000}
                />
            </SafeAreaView>
        </LinearGradient>
    );
}

// ─── Static avatar ring ─────────────────────────────────────────────────────
function AvatarRing() {
    return (
        <View style={ringst.ring} pointerEvents="none">
            <View style={ringst.staticLayer}>
                <LinearGradient
                    colors={["transparent", ORANGE, "transparent"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    locations={[0.2, 0.5, 0.8]}
                    style={ringst.beam}
                />
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
    safe: { flex: 1 },
    scroll: { paddingHorizontal: 20, paddingBottom: 60 },

    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.05)",
        zIndex: 1,
    },
    backBtn: {
        width: 36, height: 36,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 12, alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontSize: 16, fontWeight: "600", color: "#e46011", letterSpacing: -0.2 },
    doneBtn: {
        backgroundColor: "rgba(255,122,0,0.15)",
        borderWidth: 0.5, borderColor: "rgba(255,122,0,0.3)",
        borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6,
    },
    doneTxt: { fontSize: 14, fontWeight: "600", color: ORANGE },

    avatarSection: { alignItems: "center", marginTop: 32, marginBottom: 28 },
    avatarWrap: { width: 96, height: 96, position: "relative" },
    avatarImg: {
        width: 92, height: 92, borderRadius: 46, backgroundColor: "#1a1a1a",
        position: "absolute", top: 2, left: 2,
        zIndex: 2,
    },
    cameraBtn: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: ORANGE,
        alignItems: "center", justifyContent: "center",
        borderWidth: 2, borderColor: "#080808",
        position: "absolute", bottom: 0, right: 0,
        zIndex: 3,
    },
    username: { marginTop: 16, fontSize: 18, fontWeight: "600", color: "#f0ede8", letterSpacing: -0.3 },
    handle: { fontSize: 13, color: "rgba(240,237,232,0.4)", marginTop: 2 },
    changePic: { fontSize: 13, fontWeight: "500", color: ORANGE, marginTop: 12 },

    statsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
    statPill: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14 },
    statNum: { fontSize: 18, fontWeight: "600", color: "#f0ede8", letterSpacing: -0.5 },
    statLbl: { fontSize: 10, color: "rgba(240,237,232,0.4)", marginTop: 2, letterSpacing: 0.3 },

    sectionLabel: {
        fontSize: 10, fontWeight: "600",
        color: "rgba(240,237,232,0.4)", letterSpacing: 1,
        textTransform: "uppercase", marginBottom: 10,
    },
    privateHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, flex: 1 },
    infoBtn: {
        width: 18, height: 18, borderRadius: 9,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)",
        alignItems: "center", justifyContent: "center",
        marginBottom: 10,
    },

    selectRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 16, paddingHorizontal: 18,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.04)",
    },
    selectLabel: { fontSize: 15, fontWeight: "500", color: "#f0ede8" },
    selectRight: { flexDirection: "row", alignItems: "center", gap: 6 },
    selectValue: { fontSize: 14, fontWeight: "500", color: ORANGE },
    selectPlaceholder: { color: "rgba(240,237,232,0.2)", fontWeight: "400" },
});

const cardSt = StyleSheet.create({
    card: {
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 20, overflow: "hidden", position: "relative",
    },
    shine: { position: "absolute", top: 0, left: 0, right: 0, height: 1 },
});

const inSt = StyleSheet.create({
    row: {
        flexDirection: "row",
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.04)",
        paddingVertical: 14, paddingHorizontal: 18, gap: 14, position: "relative",
    },
    label: {
        fontSize: 13, fontWeight: "500",
        color: "rgba(240,237,232,0.4)", width: 46, paddingTop: 2,
        flexShrink: 0, letterSpacing: -0.1,
    },
    input: { flex: 1, fontSize: 15, color: "#f0ede8" },
    focusLine: { position: "absolute", bottom: 0, left: 18, right: 18, height: 1 }
});

// Calendar Picker Styles
const calSt = StyleSheet.create({
    headerRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        marginBottom: 20, paddingHorizontal: 4, height: 40,
    },
    titleTouch: { flexDirection: "row", alignItems: "center", gap: 8 },
    monthYearTxt: { fontSize: 18, fontWeight: "700", color: "#f0ede8", letterSpacing: -0.2 },

    // Edit mode typing styles
    editDateWrap: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
    dateInput: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.15)",
        borderRadius: 8, color: "#f0ede8",
        fontSize: 16, fontWeight: "600", textAlign: "center",
        paddingVertical: 6, paddingHorizontal: 10, minWidth: 44,
    },
    slash: { color: "rgba(240,237,232,0.4)", fontSize: 18, fontWeight: "600" },
    checkBtn: {
        padding: 6, marginLeft: 4, borderRadius: 8,
        backgroundColor: "rgba(255,122,0,0.15)",
    },

    arrowsWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
    arrowBtn: {
        padding: 6,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 8,
    },
    weekdaysRow: {
        flexDirection: "row", justifyContent: "space-around", marginBottom: 12,
    },
    weekdayTxt: {
        fontSize: 12, fontWeight: "600", color: "rgba(240,237,232,0.4)", width: "14.28%", textAlign: "center",
    },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start" },
    dayCell: {
        width: "14.28%", height: 42,
        justifyContent: "center", alignItems: "center",
        marginBottom: 4, borderRadius: 21,
    },
    selectedCell: { backgroundColor: ORANGE },
    dayTxt: { fontSize: 15, fontWeight: "500", color: "#f0ede8" },
    mutedTxt: { color: "rgba(240,237,232,0.2)" },
    selectedTxt: { color: "#fff", fontWeight: "700" },
});

// Sheet / modals
const sh = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end" },
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)" },
    sheet: {
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10, position: "relative", overflow: "hidden",
        borderTopWidth: 0.5, borderColor: "rgba(255,255,255,0.1)",
    },
    shine: {
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    handle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignSelf: "center", marginBottom: 20,
    },
    title: {
        fontSize: 16, fontWeight: "600", color: "#f0ede8",
        textAlign: "center", marginBottom: 24, letterSpacing: -0.2,
    },
    sexRow: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: 16, paddingHorizontal: 4,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.05)",
    },
    sexTxt: { fontSize: 16, color: "#f0ede8" },
    cancelBtn: {
        marginTop: 12, paddingVertical: 14, borderRadius: 14,
        backgroundColor: "rgba(255,59,48,0.08)",
        borderWidth: 0.5, borderColor: "rgba(255,59,48,0.2)",
        alignItems: "center",
    },
    cancelTxt: { fontSize: 15, fontWeight: "600", color: "#ff3b30" },
    confirmBtn: {
        paddingVertical: 15, borderRadius: 14, alignItems: "center",
        ...Platform.select({
            ios: { shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 20 },
            android: { elevation: 10 },
        }),
    },
    confirmTxt: { fontSize: 15, fontWeight: "700", color: "#fff", letterSpacing: -0.2 },
});

// Info modal
const infoSt = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.8)",
        alignItems: "center", justifyContent: "center", padding: 40,
    },
    box: {
        borderRadius: 24, paddingHorizontal: 24, paddingVertical: 28,
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)",
        width: "100%", position: "relative", overflow: "hidden",
    },
    shine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.15)" },
    icon: { fontSize: 28, marginBottom: 12 },
    title: { fontSize: 17, fontWeight: "700", color: "#f0ede8", marginBottom: 10 },
    body: { fontSize: 14, color: "rgba(240,237,232,0.4)", lineHeight: 23, marginBottom: 20 },
});

// Avatar ring
const ringst = StyleSheet.create({
    ring: {
        width: 96, height: 96, borderRadius: 48,
        overflow: "hidden", backgroundColor: "#080808",
        position: "absolute", top: 0, left: 0, zIndex: 1,
    },
    staticLayer: {
        position: "absolute",
        width: "200%", height: "200%",
        top: "-50%", left: "-50%",
        alignItems: "center",
        transform: [{ rotate: "45deg" }],
    },
    beam: { width: "100%", height: "50%" },
});