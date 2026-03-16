import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";

export default function AccountSettingsScreen() {
    const router = useRouter();

    const Row = ({ icon, text, path, danger = false }: any) => (
        <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(path)}
            activeOpacity={0.7}
        >
            <View style={styles.left}>
                {icon}
                <Text style={[styles.text, danger && { color: "#f1610d" }]}>{text}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                </TouchableOpacity>
            </View>

            <Row
                icon={<Feather name="user" size={20} color="#ff9d00" />}
                text="Change Username"
                path="/Profile/Settings/AccountSettings/change-username"
            />

            <Row
                icon={<MaterialIcons name="email" size={20} color="#ff9d00" />}
                text="Change Email"
                path="/Profile/Settings/AccountSettings/change-email"
            />

            <Row
                icon={<Feather name="lock" size={20} color="#ff9d00" />}
                text="Update Password"
                path="/Profile/Settings/AccountSettings/update-password"
            />

            <Row
                icon={<MaterialIcons name="delete" size={20} color="#ff3b30" />}
                text="Delete Account"
                path="/Profile/Settings/AccountSettings/delete-acc"
                danger
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        padding: 20
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
        marginTop: 10
    },
    title: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "600"
    },
    row: {
        backgroundColor: "#1c1c1e",
        padding: 18,
        borderRadius: 18,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15
    },
    text: {
        color: "#fff",
        fontSize: 16
    }
});