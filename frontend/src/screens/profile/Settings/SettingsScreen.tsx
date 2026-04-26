import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const ORANGE = "#ff7a00";
const DANGER = "#ff3b30";
const TEXT   = "#f0ede8";
const MUTED  = "rgba(240,237,232,0.42)";

// ─── Row ──────────────────────────────────────────────────────────────────────
type RowProps = {
    icon: React.ReactNode;
    text: string;
    onPress: () => void;
    danger?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
};

const Row = ({ icon, text, onPress, danger = false, isFirst = false, isLast = false }: RowProps) => (
    <TouchableOpacity
        style={[
            styles.row,
            isFirst && styles.rowFirst,
            isLast && styles.rowLast,
            !isLast && styles.rowBorder,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, danger && styles.iconWrapDanger]}>
                {icon}
            </View>
            <Text style={[styles.rowText, danger && styles.dangerText]}>{text}</Text>
        </View>
        <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.22)" />
    </TouchableOpacity>
);

// ─── Section label ────────────────────────────────────────────────────────────
const Section = ({ title }: { title: string }) => (
    <View style={styles.sectionRow}>
        <Text style={styles.sectionText}>{title}</Text>
        <View style={styles.sectionLine} />
    </View>
);

// ─── Row group (glass card wrapping multiple rows) ────────────────────────────
const RowGroup = ({ children }: { children: React.ReactNode }) => (
    <LinearGradient
        colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
    >
        <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardShine}
            pointerEvents="none"
        />
        {children}
    </LinearGradient>
);

// ─── Social icon ──────────────────────────────────────────────────────────────
type SocialIconProps = { icon: React.ReactNode; onPress: () => void };

const SocialIcon = ({ icon, onPress }: SocialIconProps) => (
    <TouchableOpacity style={styles.socialBtn} onPress={onPress} activeOpacity={0.7}>
        <LinearGradient
            colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.04)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.socialInner}
        >
            {icon}
        </LinearGradient>
    </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
    const router = useRouter();

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

            <SafeAreaView style={styles.safe}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.backBtn}
                    >
                        <Feather name="chevron-left" size={20} color={TEXT} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <View style={{ width: 36 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* ── Account ── */}
                    <Section title="Account" />
                    <RowGroup>
                        <Row
                            icon={<Feather name="user" size={17} color={ORANGE} />}
                            text="Profile"
                            onPress={() => router.push("/Profile/edit-profile" as any)}
                            isFirst
                        />
                        <Row
                            icon={<Feather name="lock" size={17} color={ORANGE} />}
                            text="Account"
                            onPress={() => router.push("/Profile/Settings/AccountSettings" as any)}
                        />
                        <Row
                            icon={<Feather name="bell" size={17} color={ORANGE} />}
                            text="Notifications"
                            onPress={() => router.push("/Profile/Settings/Notifications" as any)}
                            isLast
                        />
                    </RowGroup>

                    {/* ── Preferences ── */}
                    <Section title="Preferences" />
                    <RowGroup>
                        <Row icon={<MaterialIcons name="fitness-center" size={17} color={ORANGE} />}
                             text="Workouts"
                             onPress={() => router.push("/Profile/Settings/WorkoutSettings")}
                             isFirst />

                        <Row icon={<Feather name="shield" size={17} color={ORANGE} />}                 text="Privacy & Social"     onPress={() => Alert.alert("Privacy")} />
                        <Row icon={<Feather name="hash" size={17} color={ORANGE} />}                   text="Units"                onPress={() => Alert.alert("Units")} />
                        <Row icon={<Feather name="globe" size={17} color={ORANGE} />}                  text="Language"             onPress={() => Alert.alert("Language")} />
                        <Row icon={<Ionicons name="heart-outline" size={17} color={ORANGE} />}         text="Apple Health"         onPress={() => Alert.alert("Apple Health")} />
                        <Row icon={<Ionicons name="color-palette-outline" size={17} color={ORANGE} />} text="Themes"               onPress={() => Alert.alert("Themes")} />
                        <Row icon={<Feather name="repeat" size={17} color={ORANGE} />}                 text="Export & Import Data" onPress={() => Alert.alert("Export / Import")} isLast />
                    </RowGroup>

                    {/* ── Guides ── */}
                    <Section title="Guides" />
                    <RowGroup>
                        <Row icon={<Ionicons name="information-circle-outline" size={17} color={ORANGE} />} text="Getting Started Guide" onPress={() => Alert.alert("Guide")}        isFirst />
                        <Row icon={<Ionicons name="help-circle-outline" size={17} color={ORANGE} />}        text="Routine Help"          onPress={() => Alert.alert("Routine Help")} isLast />
                    </RowGroup>

                    {/* ── Help ── */}
                    <Section title="Help" />
                    <RowGroup>
                        <Row icon={<Ionicons name="help" size={17} color={ORANGE} />}               text="Frequently Asked Questions" onPress={() => Alert.alert("FAQ")}        isFirst />
                        <Row icon={<Feather name="mail" size={17} color={ORANGE} />}                text="Contact Us"                 onPress={() => Alert.alert("Contact Us")} />
                        <Row icon={<Ionicons name="information-circle" size={17} color={ORANGE} />} text="About"                      onPress={() => Alert.alert("About")}      isLast />
                    </RowGroup>

                    {/* ── Social ── */}
                    <Text style={styles.followText}>Follow us @bearfitapp</Text>
                    <View style={styles.socialRow}>
                        <SocialIcon icon={<Ionicons name="logo-youtube"  size={22} color={TEXT} />} onPress={() => Alert.alert("YouTube")}  />
                        <SocialIcon icon={<Ionicons name="logo-tiktok"   size={22} color={TEXT} />} onPress={() => Alert.alert("TikTok")}   />
                        <SocialIcon icon={<Ionicons name="logo-twitter"  size={22} color={TEXT} />} onPress={() => Alert.alert("Twitter")}  />
                        <SocialIcon icon={<Ionicons name="logo-facebook" size={22} color={TEXT} />} onPress={() => Alert.alert("Facebook")} />
                        <SocialIcon icon={<Ionicons name="logo-reddit"   size={22} color={TEXT} />} onPress={() => Alert.alert("Reddit")}   />
                    </View>

                    {/* ── Logout ── */}
                    <TouchableOpacity
                        onPress={() => Alert.alert("Logged Out")}
                        activeOpacity={0.8}
                        style={styles.logoutWrap}
                    >
                        <LinearGradient
                            colors={["rgba(255,59,48,0.12)", "rgba(255,59,48,0.06)"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.logout}
                        >
                            <LinearGradient
                                colors={["transparent", "rgba(255,59,48,0.15)", "transparent"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.cardShine}
                                pointerEvents="none"
                            />
                            <Feather name="log-out" size={16} color={DANGER} style={{ marginRight: 8 }} />
                            <Text style={styles.logoutText}>Logout</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* App version */}
                    <Text style={styles.version}>Bearfit v1.0.0</Text>

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
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

    // Section label
    sectionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 28,
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

    // Glass card wrapping rows
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

    // Individual row
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    rowFirst: { borderTopLeftRadius: 18, borderTopRightRadius: 18 },
    rowLast:  { borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
    rowBorder: {
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(255,255,255,0.06)",
    },
    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
    },
    iconWrap: {
        width: 34, height: 34,
        borderRadius: 10,
        backgroundColor: "rgba(255,122,0,0.10)",
        borderWidth: 0.5,
        borderColor: "rgba(255,122,0,0.22)",
        alignItems: "center", justifyContent: "center",
    },
    iconWrapDanger: {
        backgroundColor: "rgba(255,59,48,0.10)",
        borderColor: "rgba(255,59,48,0.22)",
    },
    rowText: {
        color: TEXT,
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: -0.2,
    },
    dangerText: { color: DANGER },

    // Social
    followText: {
        color: MUTED,
        textAlign: "center",
        marginTop: 32,
        marginBottom: 14,
        fontSize: 12,
        letterSpacing: 0.5,
        fontWeight: "500",
    },
    socialRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 8,
        marginBottom: 28,
    },
    socialBtn: {
        borderRadius: 14,
        overflow: "hidden",
    },
    socialInner: {
        width: 48, height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.09)",
    },

    // Logout
    logoutWrap: {
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 0.5,
        borderColor: "rgba(255,59,48,0.22)",
    },
    logout: {
        padding: 17,
        borderRadius: 18,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
    },
    logoutText: {
        color: DANGER,
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: -0.2,
    },

    version: {
        color: "rgba(240,237,232,0.18)",
        textAlign: "center",
        marginTop: 16,
        fontSize: 12,
        letterSpacing: 0.3,
    },
});
