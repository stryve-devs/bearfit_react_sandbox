import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router"; // Use Expo Router
import { Feather } from "@expo/vector-icons";

export default function DeleteAccountScreen() {
    const router = useRouter();

    const handleDelete = () => {
        Alert.alert(
            "Confirm Deactivation",
            "Are you sure you want to deactivate your account? You have 14 days to change your mind before it's gone forever.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Deactivate",
                    style: "destructive", // On iOS, this makes the text Red
                    onPress: () => {
                        // Logic to hit your backend API goes here
                        console.log("Account Deactivated");

                        // Navigate back to onboarding or login screen
                        router.replace("/onboarding");
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="#ff9d00" />
                </TouchableOpacity>
                <Text style={styles.title}>Delete Account</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.warningBox}>
                <View style={styles.warningHeader}>
                    <Feather name="alert-triangle" size={20} color="#ff9d00" />
                    <Text style={styles.warningTitle}>Warning !</Text>
                </View>
                <Text style={styles.warningText}>
                    When you choose to deactivate your account, it will remain deactivated for 14 days.
                    During this period you may reactivate your account at any time. If no action is
                    taken within 14 days, the account will be permanently deleted.
                </Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleDelete}
                activeOpacity={0.7}
            >
                <Text style={styles.deleteText}>Deactivate Account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", padding: 20 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30
    },
    title: { color: "#fff", fontSize: 22, fontWeight: "600" },
    warningBox: {
        backgroundColor: "#1a1a1a",
        padding: 20,
        borderRadius: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: "#333"
    },
    warningHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10
    },
    warningTitle: { color: "#ff9d00", fontSize: 18, fontWeight: "700" },
    warningText: { color: "#bbb", lineHeight: 22 },
    button: {
        backgroundColor: "#2c2c2c",
        padding: 18,
        borderRadius: 30,
        alignItems: "center"
    },
    deleteText: { color: "#ff3b30", fontSize: 18, fontWeight: "700" }
});