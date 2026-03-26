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
import { AppColors } from "../../constants/colors"; // ✅ SAME COLOR SOURCE

const ORANGE = AppColors.orange;

const Row = ({ icon, text, onPress }: any) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
        <View style={styles.rowLeft}>
            {icon}
            <Text style={styles.rowText}>{text}</Text>
        </View>
        <Feather name="chevron-right" size={22} color={ORANGE} />
    </TouchableOpacity>
);

const SocialIcon = ({ icon }: any) => (
    <TouchableOpacity style={styles.social}>
        {icon}
    </TouchableOpacity>
);

export default function SettingsScreen() {
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "OK", onPress: () => Alert.alert("Logged out") },
        ]);
    };

    const comingSoon = () => {
        Alert.alert("Coming Soon");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.black }}>
            <ScrollView style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color={ORANGE} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Settings</Text>

                    <View style={{ width: 26 }} />
                </View>

                {/* ACCOUNT */}
                <Text style={styles.section}>Account</Text>

                <Row icon={<Feather name="user" size={22} color="white" />} text="Profile" onPress={() => router.push("/settings/profile")} />
                <Row icon={<Feather name="lock" size={22} color="white" />} text="Account" onPress={() => router.push("/settings/account")} />
                <Row icon={<Feather name="bell" size={22} color="white" />} text="Notifications" onPress={() => router.push("/settings/notifications")} />

                {/* PREFERENCES */}
                <Text style={styles.section}>Preferences</Text>

                <Row icon={<MaterialIcons name="fitness-center" size={22} color="white" />} text="Workouts" onPress={() => router.push("/settings/workout")} />
                <Row icon={<Feather name="lock" size={22} color="white" />} text="Privacy & Social" onPress={() => router.push("/settings/privacy-social")} />
                <Row icon={<Feather name="hash" size={22} color="white" />} text="Units" onPress={() => router.push("/settings/units")} />
                <Row icon={<Feather name="globe" size={22} color="white" />} text="Language" onPress={() => router.push("/settings/language")} />
                <Row icon={<Ionicons name="color-palette-outline" size={22} color="white" />} text="Themes" onPress={() => router.push("/settings/themes")} />

                {/* GUIDES */}
                <Text style={styles.section}>Guides</Text>

                <Row icon={<Ionicons name="information-circle-outline" size={22} color="white" />} text="Getting Started Guide" onPress={comingSoon} />
                <Row icon={<Ionicons name="help-circle-outline" size={22} color="white" />} text="Routine Help" onPress={comingSoon} />

                {/* HELP */}
                <Text style={styles.section}>Help</Text>

                <Row icon={<Ionicons name="help" size={22} color="white" />} text="FAQ" onPress={() => router.push("/settings/faq")} />
                <Row icon={<Feather name="mail" size={22} color="white" />} text="Contact Us" onPress={() => router.push("/settings/contact")} />
                <Row icon={<Ionicons name="information-circle" size={22} color="white" />} text="About" onPress={() => router.push("/settings/about")} />

                {/* SOCIAL */}
                <Text style={styles.follow}>Follow us @bearfitapp</Text>

                <View style={styles.socialRow}>
                    <SocialIcon icon={<Ionicons name="logo-youtube" size={28} color="white" />} />
                    <SocialIcon icon={<Ionicons name="logo-tiktok" size={28} color="white" />} />
                    <SocialIcon icon={<Text style={styles.xIcon}>X</Text>} />
                    <SocialIcon icon={<Ionicons name="logo-facebook" size={28} color="white" />} />
                    <SocialIcon icon={<Ionicons name="logo-instagram" size={28} color="white" />} />
                </View>

                {/* LOGOUT */}
                <TouchableOpacity style={styles.logout} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.black,
        paddingHorizontal: 16,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
    },

    title: {
        color: "white",
        fontSize: 22,
        fontWeight: "600",
    },

    section: {
        color: ORANGE,
        fontSize: 16,
        fontWeight: "500",
        marginTop: 22,
        marginBottom: 12,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#2b2b2b",
        padding: 18,
        borderRadius: 18,
        marginBottom: 12,
    },

    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },

    rowText: {
        color: ORANGE,
        fontSize: 17,
        fontWeight: "500",
    },

    follow: {
        color: "#999",
        textAlign: "center",
        marginTop: 30,
        fontSize: 14,
    },

    socialRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 14,
    },

    social: {
        padding: 10,
    },

    xIcon: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
    },

    logout: {
        backgroundColor: "#2b2b2b",
        padding: 18,
        borderRadius: 18,
        marginTop: 25,
        marginBottom: 40,
        alignItems: "center",
    },

    logoutText: {
        color: "#ff3b30",
        fontSize: 18,
        fontWeight: "600",
    },
});