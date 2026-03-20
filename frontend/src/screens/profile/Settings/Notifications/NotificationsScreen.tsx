import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Pressable,
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

// ─── Smooth Switch ────────────────────────────────────────────────────────────
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

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title }: { title: string }) => (
    <View style={st.sectionRow}>
        <Text style={st.sectionText}>{title}</Text>
        <View style={st.sectionLine} />
    </View>
);

// ─── Setting row ──────────────────────────────────────────────────────────────
const SettingRow = ({
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
        isFirst  && st.rowFirst,
        isLast   && st.rowLast,
        !isLast  && st.rowBorder,
    ]}>
        <View style={st.rowTextCol}>
            <Text style={st.rowLabel}>{label}</Text>
            {description ? (
                <Text style={st.rowDesc}>{description}</Text>
            ) : null}
        </View>
        <SmoothSwitch value={value} onValueChange={onValueChange} />
    </View>
);

// ─── Glass card wrapping rows ─────────────────────────────────────────────────
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
const NotificationSettings = () => {
    const router = useRouter();

    const [settings, setSettings] = useState({
        restTimer:        true,
        follows:          true,
        monthlyReport:    true,
        emails:           false,
        workoutLikes:     true,
        commentLikes:     true,
        workoutComments:  true,
        replies:          true,
        mentions:         true,
        discussions:      true,
    });

    const toggle = (key: keyof typeof settings) =>
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

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

                {/* ── Header ── */}
                <View style={st.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={st.backBtn}
                    >
                        <Feather name="arrow-left" size={18} color={TEXT} />
                    </TouchableOpacity>
                    <Text style={st.headerTitle}>Notifications</Text>
                    <View style={{ width: 36 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={st.scrollContent}
                >
                    {/* ── Warning banner ── */}
                    <LinearGradient
                        colors={["rgba(255,215,0,0.08)", "rgba(255,215,0,0.03)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={st.warningCard}
                    >
                        <LinearGradient
                            colors={["transparent", "rgba(255,215,0,0.15)", "transparent"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={st.cardShine}
                            pointerEvents="none"
                        />
                        <View style={st.warningIconWrap}>
                            <Ionicons name="warning" size={18} color="#FFD700" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={st.warningText}>
                                Your phone notifications are turned off. Enable them in your{" "}
                                <Text style={st.warningLink}>phone settings.</Text>
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* ── General ── */}
                    <SectionHeader title="General" />
                    <RowGroup>
                        <SettingRow
                            label="Rest Timer"
                            value={settings.restTimer}
                            onValueChange={() => toggle("restTimer")}
                            isFirst
                        />
                        <SettingRow
                            label="Follows"
                            value={settings.follows}
                            onValueChange={() => toggle("follows")}
                        />
                        <SettingRow
                            label="Monthly Report"
                            description="Get a notification when your monthly report is ready."
                            value={settings.monthlyReport}
                            onValueChange={() => toggle("monthlyReport")}
                        />
                        <SettingRow
                            label="Subscribe to BearFit emails"
                            description="Tips, new feature announcements, offers and more."
                            value={settings.emails}
                            onValueChange={() => toggle("emails")}
                            isLast
                        />
                    </RowGroup>

                    {/* ── Likes ── */}
                    <SectionHeader title="Likes" />
                    <RowGroup>
                        <SettingRow
                            label="Likes on your workouts"
                            value={settings.workoutLikes}
                            onValueChange={() => toggle("workoutLikes")}
                            isFirst
                        />
                        <SettingRow
                            label="Likes on your comments"
                            value={settings.commentLikes}
                            onValueChange={() => toggle("commentLikes")}
                            isLast
                        />
                    </RowGroup>

                    {/* ── Comments ── */}
                    <SectionHeader title="Comments" />
                    <RowGroup>
                        <SettingRow
                            label="Comments on your workouts"
                            value={settings.workoutComments}
                            onValueChange={() => toggle("workoutComments")}
                            isFirst
                        />
                        <SettingRow
                            label="Comment Replies"
                            description="Get a notification when someone replies to your comments."
                            value={settings.replies}
                            onValueChange={() => toggle("replies")}
                        />
                        <SettingRow
                            label="Comment Mentions"
                            description="Get a notification when someone @ mentions you in a comment."
                            value={settings.mentions}
                            onValueChange={() => toggle("mentions")}
                        />
                        <SettingRow
                            label="Workout Discussions"
                            description="Get a notification when someone comments on a workout you've also commented on."
                            value={settings.discussions}
                            onValueChange={() => toggle("discussions")}
                            isLast
                        />
                    </RowGroup>

                    <Text style={st.version}>Bearfit v1.0.0</Text>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

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

    // Warning banner
    warningCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderRadius: 18,
        padding: 16,
        marginTop: 16,
        borderWidth: 0.5,
        borderColor: "rgba(255,215,0,0.18)",
        position: "relative",
        overflow: "hidden",
    },
    warningIconWrap: {
        width: 34, height: 34,
        borderRadius: 10,
        backgroundColor: "rgba(255,215,0,0.10)",
        borderWidth: 0.5,
        borderColor: "rgba(255,215,0,0.22)",
        alignItems: "center", justifyContent: "center",
    },
    warningText: {
        color: MUTED,
        fontSize: 13,
        lineHeight: 19,
    },
    warningLink: {
        color: ORANGE,
        fontWeight: "600",
    },

    // Section label
    sectionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 26,
        marginBottom: 10,
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

    // Row
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
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
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: -0.2,
    },
    rowDesc: {
        color: HINT,
        fontSize: 12,
        marginTop: 3,
        lineHeight: 17,
    },

    version: {
        color: "rgba(240,237,232,0.18)",
        textAlign: "center",
        marginTop: 28,
        fontSize: 12,
        letterSpacing: 0.3,
    },
});

export default NotificationSettings;
