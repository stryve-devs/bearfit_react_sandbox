import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router"; // Switch to Expo Router
import { Feather } from "@expo/vector-icons";

export default function ChangeUsernameScreen() {
    const router = useRouter(); // Use the router hook
    const [username, setUsername] = useState("");

    const handleUpdate = () => {
        if (username.length < 3) {
            Alert.alert("Error", "Username must be at least 3 characters");
            return;
        }
        // Logic to update username would go here
        Alert.alert("Success", "Username updated to " + username);
        router.back(); // Navigate back to Account Settings
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* router.back() is safer for Expo Router file stacks */}
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="#ff9d00" />
                </TouchableOpacity>
                <Text style={styles.title}>Change Username</Text>
                <View style={{ width: 24 }} />
            </View>

            <Text style={styles.label}>Username</Text>

            <TextInput
                style={styles.input}
                placeholder="lenajzh" // Based on your previous screen
                placeholderTextColor="#777"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none" // Standard for usernames
                autoCorrect={false}
                maxLength={20}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleUpdate}
            >
                <Text style={styles.buttonText}>Update</Text>
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
    title: { color: "#fff", fontSize: 22 },
    label: { color: "#ff9d00", marginBottom: 10 },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#666",
        color: "#fff",
        marginBottom: 40,
        paddingVertical: 8,
        fontSize: 16
    },
    button: {
        backgroundColor: "#333",
        padding: 18,
        borderRadius: 30,
        alignItems: "center"
    },
    buttonText: {
        color: "#ff9d00",
        fontSize: 18,
        fontWeight: "600"
    }
});