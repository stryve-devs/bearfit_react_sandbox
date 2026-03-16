import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView } from "react-native";
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Row = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
        <View style={styles.rowLeft}>
            {icon}
            <Text style={styles.rowText}>{text}</Text>
        </View>
        <Feather name="chevron-right" size={26} color="#888" />
    </TouchableOpacity>
);

const SocialIcon = ({ icon, onPress }) => (
    <TouchableOpacity style={styles.social} onPress={onPress}>
        {icon}
    </TouchableOpacity>
);

export default function SettingsScreen() {

    const router = useRouter();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
            <ScrollView style={styles.container}>


                <Text style={styles.section}>Account</Text>

                {/* PROFILE - Path corrected to match app/(tabs)/Profile/edit-profile.tsx */}
                <Row
                    icon={<Feather name="user" size={20} color="white" />}
                    text="Profile"
                    onPress={() => router.push("/Profile/edit-profile")}
                />

                {/* ACCOUNT SETTINGS - Path corrected to match app/(tabs)/Profile/Settings/AccountSettings/index.tsx */}
                <Row
                    icon={<Feather name="lock" size={20} color="white" />}
                    text="Account"
                    onPress={() => router.push("/Profile/Settings/AccountSettings")}
                />

                {/* NOTIFICATIONS - Path corrected to match app/(tabs)/Profile/Settings/Notifications/index.tsx */}
                <Row
                    icon={<Feather name="bell" size={20} color="white" />}
                    text="Notifications"
                    onPress={() => router.push("/Profile/Settings/Notifications")}
                />

                <Text style={styles.section}>Preferences</Text>

                <Row icon={<MaterialIcons name="fitness-center" size={20} color="white" />} text="Workouts" onPress={() => Alert.alert("Workouts")} />
                <Row icon={<Feather name="lock" size={20} color="white" />} text="Privacy & Social" onPress={() => Alert.alert("Privacy")} />
                <Row icon={<Feather name="hash" size={20} color="white" />} text="Units" onPress={() => Alert.alert("Units")} />
                <Row icon={<Feather name="globe" size={20} color="white" />} text="Language" onPress={() => Alert.alert("Language")} />
                <Row icon={<Ionicons name="heart-outline" size={20} color="white" />} text="Apple Health" onPress={() => Alert.alert("Apple Health")} />
                <Row icon={<Ionicons name="color-palette-outline" size={20} color="white" />} text="Themes" onPress={() => Alert.alert("Themes")} />
                <Row icon={<Feather name="repeat" size={20} color="white" />} text="Export & Import Data" onPress={() => Alert.alert("Export / Import")} />

                <Text style={styles.section}>Guides</Text>

                <Row icon={<Ionicons name="information-circle-outline" size={20} color="white" />} text="Getting Started Guide" onPress={() => Alert.alert("Guide")} />
                <Row icon={<Ionicons name="help-circle-outline" size={20} color="white" />} text="Routine Help" onPress={() => Alert.alert("Routine Help")} />

                <Text style={styles.section}>Help</Text>

                <Row icon={<Ionicons name="help" size={20} color="white" />} text="Frequently Asked Questions" onPress={() => Alert.alert("FAQ")} />
                <Row icon={<Feather name="mail" size={20} color="white" />} text="Contact Us" onPress={() => Alert.alert("Contact Us")} />
                <Row icon={<Ionicons name="information-circle" size={20} color="white" />} text="About" onPress={() => Alert.alert("About")} />

                <Text style={styles.follow}>Follow us @bearfitapp</Text>

                <View style={styles.socialRow}>
                    <SocialIcon icon={<Ionicons name="logo-youtube" size={26} color="white" />} onPress={() => Alert.alert("YouTube")} />
                    <SocialIcon icon={<Ionicons name="logo-tiktok" size={26} color="white" />} onPress={() => Alert.alert("TikTok")} />
                    <SocialIcon icon={<Ionicons name="logo-twitter" size={26} color="white" />} onPress={() => Alert.alert("Twitter")} />
                    <SocialIcon icon={<Ionicons name="logo-facebook" size={26} color="white" />} onPress={() => Alert.alert("Facebook")} />
                    <SocialIcon icon={<Ionicons name="logo-reddit" size={26} color="white" />} onPress={() => Alert.alert("Reddit")} />
                </View>

                <TouchableOpacity style={styles.logout} onPress={() => Alert.alert("Logged Out")}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        paddingHorizontal: 16
    },

    header: {
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 16
    },

    title: {
        color: "white",
        fontSize: 22,
        fontWeight: "600"
    },

    section: {
        color: "#ffffff",
        fontSize: 15.7,
        marginTop: 22,
        marginBottom: 10
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#2b2b2b",
        padding: 16,
        borderRadius: 18,
        marginBottom: 12
    },

    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14
    },

    rowText: {
        color: "#FF7925",
        fontSize: 15
    },

    follow: {
        color: "#999",
        textAlign: "center",
        marginTop: 30
    },

    socialRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 14
    },

    social: {
        padding: 8
    },

    logout: {
        backgroundColor: "#2b2b2b",
        padding: 18,
        borderRadius: 18,
        marginTop: 25,
        marginBottom: 40,
        alignItems: "center"
    },

    logoutText: {
        color: "#ff3b30",
        fontSize: 18,
        fontWeight: "400"
    }
});