import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const ORANGE = "#ff7a00";

export default function DeleteAccountScreen() {
    const router = useRouter();

    const handleDelete = () => {
        Alert.alert(
            "Confirm Deactivation",
            "Are you sure you want to deactivate your account? You have 14 days to reactivate before it's permanently deleted.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Deactivate",
                    style: "destructive",
                    onPress: () => {
                        // TODO: call your backend API here
                        router.replace("/onboarding" as any);
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                {/* Single custom header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Feather name="arrow-left" size={24} color={ORANGE} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Delete Account</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.warningBox}>
                    <View style={styles.warningHeader}>
                        <Feather name="alert-triangle" size={20} color={ORANGE} />
                        <Text style={styles.warningTitle}>Warning!</Text>
                    </View>
                    <Text style={styles.warningText}>
                        When you choose to deactivate your account, it will remain deactivated for 14 days.
                        During this period you may reactivate your account at any time. If no action is
                        taken within 14 days, the account will be permanently deleted.
                    </Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleDelete} activeOpacity={0.7}>
                    <Text style={styles.deleteText}>Deactivate Account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#000",
    },
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
        marginTop: 8,
    },
    title: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "600",
    },
    warningBox: {
        backgroundColor: "#111",
        padding: 20,
        borderRadius: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: "#2a2a2a",
    },
    warningHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    warningTitle: {
        color: ORANGE,
        fontSize: 17,
        fontWeight: "700",
    },
    warningText: {
        color: "#999",
        lineHeight: 22,
        fontSize: 14,
    },
    button: {
        backgroundColor: "#1a1a1a",
        padding: 18,
        borderRadius: 30,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#2e2e2e",
    },
    deleteText: {
        color: "#ff3b30",
        fontSize: 18,
        fontWeight: "700",
    },
});
