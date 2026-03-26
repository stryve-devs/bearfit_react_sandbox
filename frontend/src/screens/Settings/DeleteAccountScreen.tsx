// src/screens/Settings/DeleteAccountScreen.tsx

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const orange = "#FF7825";

export default function DeleteAccountScreen() {
    const router = useRouter();
    const [done, setDone] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color={orange} />
                </TouchableOpacity>

                <Text style={styles.title}>Delete Account</Text>

                <View style={{ width: 26 }} />
            </View>

            <View style={styles.body}>
                <View style={styles.box}>
                    <Text style={styles.warning}>Warning !</Text>

                    <Text style={styles.desc}>
                        Your account will be deactivated for 14 days and then permanently deleted.
                    </Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={() => setDone(true)}>
                    <Text style={styles.red}>{done ? "Deactivated" : "Deactivate Account"}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 18,
        backgroundColor: "#1C120A",
    },

    title: { color: "white", fontSize: 20 },

    body: { padding: 16 },

    box: {
        backgroundColor: "#2A2A2A",
        padding: 20,
        borderRadius: 18,
        marginBottom: 30,
    },

    warning: { color: orange, fontSize: 18, marginBottom: 10 },

    desc: { color: "#ccc", fontSize: 15 },

    button: {
        backgroundColor: "#3A3A3A",
        padding: 18,
        borderRadius: 30,
        alignItems: "center",
    },

    red: { color: "red", fontSize: 17 },
});