import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Pressable,
    Modal,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolateColor,
} from "react-native-reanimated";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const ORANGE  = "#ff7a00";
const ORANGE2 = "#cc5500";
const TEXT    = "#f0ede8";
const MUTED   = "rgba(240,237,232,0.42)";
const HINT    = "rgba(240,237,232,0.25)";

// ─── Smooth Switch (identical to NotificationSettings) ───────────────────────
const SmoothSwitch = ({
                          value,
                          onValueChange,
                      }: {
    value: boolean;
    onValueChange: (v: boolean) => void;
}) => {
    const anim = useSharedValue(value ? 1 : 0);

    useEffect(() => {
        anim.value = withTiming(value ? 1 : 0, { duration: 250 });
    }, [value]);

    const trackStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            anim.value,
            [0, 1],
            ["rgba(255,255,255,0.08)", ORANGE2]
        ),
        borderColor: interpolateColor(
            anim.value,
            [0, 1],
            ["rgba(255,255,255,0.12)", "rgba(255,122,0,0.5)"]
        ),
    }));

    const thumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: anim.value * (51 - 4 - 27) }],
        backgroundColor: interpolateColor(
            anim.value,
            [0, 1],
            ["rgba(240,237,232,0.7)", "#fff"]
        ),
    }));

    return (
        <Pressable onPress={() => onValueChange(!value)}>
            <Animated.View style={[swSt.track, trackStyle]}>
                <Animated.View style={[swSt.thumb, thumbStyle]} />
            </Animated.View>
        </Pressable>
    );
};

const swSt = StyleSheet.create({
    track: {
        width: 51, height: 31,
        borderRadius: 16,
        justifyContent: "center",
        padding: 2,
        borderWidth: 0.5,
    },
    thumb: {
        width: 27, height: 27,
        borderRadius: 13.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});

// ─── Section header ──────────────────────────────────────────────────────────
const SectionHeader = ({ title }: { title: string }) => (
    <View style={st.sectionRow}>
        <Text style={st.sectionText}>{title}</Text>
        <View style={st.sectionLine} />
    </View>
);

// ─── Switch row (with optional description) ──────────────────────────────────
const SwitchRow = ({
                       label,
                       description,
                       value,
                       onValueChange,
                       isFirst = false,
                       isLast = false,
                   }: {
    label: string;
    description?: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    isFirst?: boolean;
    isLast?: boolean;
}) => (
    <View style={[
        st.row,
        isFirst && st.rowFirst,
        isLast && st.rowLast,
        !isLast && st.rowBorder,
    ]}>
        <View style={st.rowTextCol}>
            <Text style={st.rowLabel}>{label}</Text>
            {description ? <Text style={st.rowDesc}>{description}</Text> : null}
        </View>
        <SmoothSwitch value={value} onValueChange={onValueChange} />
    </View>
);

// ─── Navigation row (chevron) ─────────────────────────────────────────────────
const NavRow = ({
                    label,
                    value,
                    onPress,
                    isFirst = false,
                    isLast = false,
                }: {
    label: string;
    value?: string;
    onPress: () => void;
    isFirst?: boolean;
    isLast?: boolean;
}) => (
    <TouchableOpacity
        style={[
            st.row,
            isFirst && st.rowFirst,
            isLast && st.rowLast,
            !isLast && st.rowBorder,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={st.rowTextCol}>
            <Text style={st.rowLabel}>{label}</Text>
        </View>
        <View style={st.rowRight}>
            {value && <Text style={st.rowValue}>{value}</Text>}
            <Feather name="chevron-right" size={16} color={HINT} />
        </View>
    </TouchableOpacity>
);

// ─── Glass card wrapper ───────────────────────────────────────────────────────
const RowGroup = ({ children }: { children: React.ReactNode }) => (
    <LinearGradient
        colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={st.card}
    >
        <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={st.cardShine}
            pointerEvents="none"
        />
        {children}
    </LinearGradient>
);

const REST_TIMES = ["5 sec","10 sec","15 sec","30 sec","45 sec","60 sec","90 sec","2 min","3 min","4 min","5 min"];

export default function WorkoutSettingsScreen() {
    const router = useRouter();

    const [keepAwake, setKeepAwake] = useState(false);
    const [plate,     setPlate]     = useState(false);
    const [rpe,       setRpe]       = useState(false);
    const [smart,     setSmart]     = useState(false);
    const [inline,    setInline]    = useState(false);
    const [pr,        setPr]        = useState(false);
    const [restTime,  setRestTime]  = useState("60 sec");
    const [showPicker,setShowPicker]= useState(false);

    return (
        <LinearGradient
            colors={["#0e0e11", "#0a0906", "#080808", "#0a0906", "#0b0b0e"]}
            locations={[0, 0.2, 0.5, 0.75, 1]}
            start={{ x: 0.16, y: 0 }}
            end={{ x: 0.84, y: 1 }}
            style={{ flex: 1 }}
        >
            {/* Subtle corner warmth */}
            <LinearGradient
                colors={["rgba(255,100,20,0.05)", "transparent"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.3, y: 0.4 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            <SafeAreaView style={st.safe}>
                {/* Header */}
                <View style={st.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={st.backBtn}
                    >
                        <Feather name="arrow-left" size={18} color={TEXT} />
                    </TouchableOpacity>
                    <Text style={st.headerTitle}>Workout Settings</Text>
                    <View style={{ width: 36 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={st.scrollContent}
                >
                    {/* General section (navigation rows) */}
                    <SectionHeader title="General" />
                    <RowGroup>
                        <NavRow
                            label="Sounds"
                            onPress={() => router.push("/settings/sounds")}
                            isFirst
                        />
                        <NavRow
                            label="Default Rest Timer"
                            value={restTime}
                            onPress={() => setShowPicker(true)}
                        />
                        <NavRow
                            label="First Day of the Week"
                            onPress={() => router.push("/settings/first-day")}
                        />
                        <NavRow
                            label="Previous Workout Values"
                            onPress={() => router.push("/settings/previous-workout")}
                        />
                        <NavRow
                            label="Warm-up Sets"
                            onPress={() => router.push("/settings/warmup")}
                            isLast
                        />
                    </RowGroup>

                    {/* Behaviour section (switch rows) */}
                    <SectionHeader title="Behaviour" />
                    <RowGroup>
                        <SwitchRow
                            label="Keep Awake"
                            description="Prevent phone from sleeping during workout"
                            value={keepAwake}
                            onValueChange={setKeepAwake}
                            isFirst
                        />
                        <SwitchRow
                            label="Plate Calculator"
                            description="Auto-calculate plates for barbell exercises"
                            value={plate}
                            onValueChange={setPlate}
                        />
                        <SwitchRow
                            label="RPE Tracking"
                            description="Log perceived exertion per set"
                            value={rpe}
                            onValueChange={setRpe}
                        />
                        <SwitchRow
                            label="Smart Superset Scrolling"
                            description="Auto scroll to next exercise in superset"
                            value={smart}
                            onValueChange={setSmart}
                        />
                        <SwitchRow
                            label="Inline Timer"
                            description="Built-in stopwatch for duration exercises"
                            value={inline}
                            onValueChange={setInline}
                        />
                        <SwitchRow
                            label="Live PR Notification"
                            description="Alert when you hit a personal record"
                            value={pr}
                            onValueChange={setPr}
                            isLast
                        />
                    </RowGroup>

                    <Text style={st.version}>Bearfit v1.0.0</Text>
                </ScrollView>
            </SafeAreaView>

            {/* Rest Timer Picker Modal – glassmorphic style */}
            <Modal visible={showPicker} transparent animationType="slide">
                <Pressable style={st.backdrop} onPress={() => setShowPicker(false)}>
                    <LinearGradient
                        colors={["rgba(18,18,22,0.98)", "rgba(10,10,14,0.98)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={st.sheet}
                    >
                        <View style={st.handle} />
                        <Text style={st.sheetTitle}>Default Rest Timer</Text>
                        <FlatList
                            data={REST_TIMES}
                            keyExtractor={(item) => item}
                            style={{ maxHeight: 360 }}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const active = item === restTime;
                                return (
                                    <TouchableOpacity
                                        style={[st.sheetRow, active && st.sheetRowActive]}
                                        onPress={() => { setRestTime(item); setShowPicker(false); }}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={[st.sheetRowText, active && { color: ORANGE }]}>
                                            {item}
                                        </Text>
                                        {active && <Ionicons name="checkmark" size={18} color={ORANGE} />}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </LinearGradient>
                </Pressable>
            </Modal>
        </LinearGradient>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
    safe: { flex: 1 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(255,255,255,0.05)",
    },
    backBtn: {
        width: 36, height: 36,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.10)",
        borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    headerTitle: {
        color: ORANGE,
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: -0.3,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 48,
    },

    // Section header
    sectionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 23,
        marginBottom: 12,
        gap: 10,
    },
    sectionText: {
        color: MUTED,
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    sectionLine: {
        flex: 1,
        height: 0.5,
        backgroundColor: "rgba(255,255,255,0.07)",
    },

    // Glass card
    card: {
        borderRadius: 18,
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
        position: "relative",
    },
    cardShine: {
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 1,
    },

    // Row (common)
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    rowFirst: { borderTopLeftRadius: 18, borderTopRightRadius: 18 },
    rowLast:  { borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
    rowBorder: {
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(255,255,255,0.06)",
    },
    rowTextCol: {
        flex: 1,
        paddingRight: 16,
    },
    rowLabel: {
        color: TEXT,
        fontSize: 16,
        fontWeight: "500",
        letterSpacing: -0.2,
    },
    rowDesc: {
        color: HINT,
        fontSize: 12,
        marginTop: 3,
        lineHeight: 17,
    },
    rowRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    rowValue: {
        color: HINT,
        fontSize: 14,
    },

    // Modal sheet
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },
    sheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 36,
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.1)",
    },
    handle: {
        width: 36, height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignSelf: "center",
        marginTop: 12,
        marginBottom: 18,
    },
    sheetTitle: {
        color: TEXT,
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 14,
    },
    sheetRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(255,255,255,0.08)",
    },
    sheetRowActive: {},
    sheetRowText: {
        color: TEXT,
        fontSize: 15,
    },

    version: {
        color: "rgba(240,237,232,0.18)",
        textAlign: "center",
        marginTop: 28,
        fontSize: 12,
        letterSpacing: 0.3,
    },
});