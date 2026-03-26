// src/screens/Settings/AccountScreen.tsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const orange = "#FF7825";

export default function AccountScreen() {
    const router = useRouter();

    const Tile = ({ icon, text, route, isDelete = false }: any) => (
        <TouchableOpacity style={styles.tile} onPress={() => router.push(route)}>
            <View style={styles.row}>
                <MaterialIcons name={icon} size={26} color={isDelete ? "red" : orange} />
                <Text style={[styles.text, isDelete && { color: "red" }]}>{text}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#aaa" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color={orange} />
                </TouchableOpacity>

                <Text style={styles.title}>Account Settings</Text>

                <View style={{ width: 26 }} />
            </View>

            <View style={{ padding: 16 }}>
                <Tile icon="person-outline" text="Change Username" route="/settings/change-username" />
                <Tile icon="email" text="Change Email" route="/settings/change-email" />
                <Tile icon="lock" text="Update Password" route="/settings/update-password" />
                <Tile icon="delete" text="Delete Account" route="/settings/delete-account" isDelete />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        backgroundColor: "#1C120A",
    },

    title: {
        color: "white",
        fontSize: 20, // 🔥 bigger
        fontWeight: "600",
    },

    tile: {
        backgroundColor: "#2A2A2A",
        borderRadius: 18,
        padding: 18,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },

    text: {
        color: "white",
        fontSize: 17, // 🔥 bigger
    },
});