// src/screens/Settings/ChangeUsernameScreen.tsx

import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const orange = "#FF7825";

export default function ChangeUsernameScreen() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [isUpdated, setIsUpdated] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color={orange} />
                </TouchableOpacity>

                <Text style={styles.title}>Change Username</Text>

                <View style={{ width: 26 }} />
            </View>

            {/* BODY */}
            <View style={styles.body}>
                <Text style={styles.label}>Username</Text>

                <TextInput
                    placeholder="Enter new username"
                    placeholderTextColor="#888"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setIsUpdated(true)}
                >
                    <Text style={styles.buttonText}>
                        {isUpdated ? "Updated" : "Update"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

/* STYLES */

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

    body: {
        padding: 20,
    },

    label: {
        color: orange,
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
    },

    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#666",
        color: "white",
        fontSize: 16,
        paddingVertical: 8,
        marginBottom: 40,
    },

    button: {
        backgroundColor: "#2A2A2A",
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: "center",
    },

    buttonText: {
        color: orange,
        fontSize: 17,
        fontWeight: "600",
    },
});