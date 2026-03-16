import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    SafeAreaView,
} from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ORANGE = "#ff7a00";

// ─── Types ────────────────────────────────────────────────────────────────────

type RowProps = {
    icon: React.ReactNode;
    text: string;
    onPress: () => void;
};

type SocialIconProps = {
    icon: React.ReactNode;
    onPress: () => void;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Row = ({ icon, text, onPress }: RowProps) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.rowLeft}>
            {icon}
            <Text style={styles.rowText}>{text}</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#555" />
    </TouchableOpacity>
);

const SocialIcon = ({ icon, onPress }: SocialIconProps) => (
    <TouchableOpacity style={styles.social} onPress={onPress} activeOpacity={0.7}>
        {icon}
    </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Account */}
                <Text style={styles.section}>Account</Text>

                <Row
                    icon={<Feather name="user" size={20} color="#fff" />}
                    text="Profile"
                    onPress={() => router.push("/Profile/edit-profile" as any)}
                />
                <Row
                    icon={<Feather name="lock" size={20} color="#fff" />}
                    text="Account"
                    onPress={() => router.push("/Profile/Settings/AccountSettings" as any)}
                />
                <Row
                    icon={<Feather name="bell" size={20} color="#fff" />}
                    text="Notifications"
                    onPress={() => router.push("/Profile/Settings/Notifications" as any)}
                />

                {/* Preferences */}
                <Text style={styles.section}>Preferences</Text>

                <Row icon={<MaterialIcons name="fitness-center" size={20} color="#fff" />}       text="Workouts"             onPress={() => Alert.alert("Workouts")} />
                <Row icon={<Feather name="shield" size={20} color="#fff" />}                     text="Privacy & Social"     onPress={() => Alert.alert("Privacy")} />
                <Row icon={<Feather name="hash" size={20} color="#fff" />}                       text="Units"                onPress={() => Alert.alert("Units")} />
                <Row icon={<Feather name="globe" size={20} color="#fff" />}                      text="Language"             onPress={() => Alert.alert("Language")} />
                <Row icon={<Ionicons name="heart-outline" size={20} color="#fff" />}             text="Apple Health"         onPress={() => Alert.alert("Apple Health")} />
                <Row icon={<Ionicons name="color-palette-outline" size={20} color="#fff" />}     text="Themes"               onPress={() => Alert.alert("Themes")} />
                <Row icon={<Feather name="repeat" size={20} color="#fff" />}                     text="Export & Import Data" onPress={() => Alert.alert("Export / Import")} />

                {/* Guides */}
                <Text style={styles.section}>Guides</Text>

                <Row icon={<Ionicons name="information-circle-outline" size={20} color="#fff" />} text="Getting Started Guide" onPress={() => Alert.alert("Guide")} />
                <Row icon={<Ionicons name="help-circle-outline" size={20} color="#fff" />}        text="Routine Help"          onPress={() => Alert.alert("Routine Help")} />

                {/* Help */}
                <Text style={styles.section}>Help</Text>

                <Row icon={<Ionicons name="help" size={20} color="#fff" />}                      text="Frequently Asked Questions" onPress={() => Alert.alert("FAQ")} />
                <Row icon={<Feather name="mail" size={20} color="#fff" />}                       text="Contact Us"                 onPress={() => Alert.alert("Contact Us")} />
                <Row icon={<Ionicons name="information-circle" size={20} color="#fff" />}        text="About"                      onPress={() => Alert.alert("About")} />

                {/* Social */}
                <Text style={styles.follow}>Follow us @bearfitapp</Text>

                <View style={styles.socialRow}>
                    <SocialIcon icon={<Ionicons name="logo-youtube"  size={26} color="#fff" />} onPress={() => Alert.alert("YouTube")} />
                    <SocialIcon icon={<Ionicons name="logo-tiktok"   size={26} color="#fff" />} onPress={() => Alert.alert("TikTok")} />
                    <SocialIcon icon={<Ionicons name="logo-twitter"  size={26} color="#fff" />} onPress={() => Alert.alert("Twitter")} />
                    <SocialIcon icon={<Ionicons name="logo-facebook" size={26} color="#fff" />} onPress={() => Alert.alert("Facebook")} />
                    <SocialIcon icon={<Ionicons name="logo-reddit"   size={26} color="#fff" />} onPress={() => Alert.alert("Reddit")} />
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logout}
                    onPress={() => Alert.alert("Logged Out")}
                    activeOpacity={0.7}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#000",
    },
    container: {
        flex: 1,
        backgroundColor: "#000",
        paddingHorizontal: 16,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    section: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        marginTop: 28,
        marginBottom: 10,
        marginLeft: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1c1c1e",
        padding: 16,
        borderRadius: 18,
        marginBottom: 10,
    },
    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    rowText: {
        color: ORANGE,
        fontSize: 15,
        fontWeight: "500",
    },
    follow: {
        color: "#666",
        textAlign: "center",
        marginTop: 32,
        fontSize: 13,
        letterSpacing: 0.4,
    },
    socialRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 14,
        paddingHorizontal: 8,
    },
    social: {
        padding: 8,
    },
    logout: {
        backgroundColor: "#1c1c1e",
        padding: 18,
        borderRadius: 18,
        marginTop: 28,
        marginBottom: 10,
        alignItems: "center",
    },
    logoutText: {
        color: "#ff3b30",
        fontSize: 16,
        fontWeight: "600",
    },
});
