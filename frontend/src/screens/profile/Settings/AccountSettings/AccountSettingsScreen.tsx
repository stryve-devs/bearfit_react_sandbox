import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";

const ORANGE = "#ff7a00";
const DANGER = "#ff3b30";

type RowProps = {
    icon: React.ReactNode;
    text: string;
    path: string;
    danger?: boolean;
};

function Row({ icon, text, path, danger = false }: RowProps) {
    const router = useRouter();
    return (
        <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(path as any)}
            activeOpacity={0.7}
        >
            <View style={styles.left}>
                {icon}
                <Text style={[styles.text, danger && styles.dangerText]}>{text}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#555" />
        </TouchableOpacity>
    );
}

export default function AccountSettingsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safe}>

            {/* Single custom header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="chevron-left" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Settings</Text>
                <View style={{ width: 26 }} />
            </View>

            <View style={styles.container}>
                <Row
                    icon={<Feather name="user" size={20} color={ORANGE} />}
                    text="Change Username"
                    path="/Profile/Settings/AccountSettings/change-username"
                />
                <Row
                    icon={<MaterialIcons name="email" size={20} color={ORANGE} />}
                    text="Change Email"
                    path="/Profile/Settings/AccountSettings/change-email"
                />
                <Row
                    icon={<Feather name="lock" size={20} color={ORANGE} />}
                    text="Update Password"
                    path="/Profile/Settings/AccountSettings/update-password"
                />
                <Row
                    icon={<MaterialIcons name="delete" size={20} color={DANGER} />}
                    text="Delete Account"
                    path="/Profile/Settings/AccountSettings/delete-acc"
                    danger
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#000",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "#000",
    },
    headerTitle: {
        color: ORANGE,
        fontSize: 18,
        fontWeight: "600",
    },
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 8,
    },
    row: {
        backgroundColor: "#1c1c1e",
        padding: 18,
        borderRadius: 18,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    text: {
        color: "#fff",
        fontSize: 16,
    },
    dangerText: {
        color: DANGER,
    },
});
