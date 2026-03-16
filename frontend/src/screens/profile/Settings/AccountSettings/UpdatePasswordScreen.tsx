import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function UpdatePasswordScreen() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [secure, setSecure] = useState(true);

    const handleUpdate = () => {
        // Validation logic
        if (password.length < 6) {
            Alert.alert("Invalid Password", "Password must be at least 6 characters long.");
            return;
        }

        // Success logic
        Alert.alert("Success", "Your password has been updated.", [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="#ff9d00" />
                </TouchableOpacity>
                <Text style={styles.title}>Update Password</Text>
                <View style={{ width: 24 }} /> {/* Balancing spacer */}
            </View>

            <Text style={styles.label}>New Password</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    secureTextEntry={secure}
                    placeholder="minimum 6 characters"
                    placeholderTextColor="#777"
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoCorrect={false}      // Critical for password fields
                    textContentType="password" // Helps iOS suggest strong passwords
                />

                <TouchableOpacity
                    onPress={() => setSecure(!secure)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                >
                    <Feather
                        name={secure ? "eye-off" : "eye"}
                        size={20}
                        color="#777"
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleUpdate}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>Update Password</Text>
            </TouchableOpacity>
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
        marginBottom: 30
    },
    title: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "600"
    },
    label: {
        color: "#ff9d00",
        marginBottom: 10,
        fontSize: 14,
        fontWeight: "500"
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#444", // Slightly darker for a cleaner look
        marginBottom: 40,
    },
    input: {
        flex: 1,
        color: "#fff",
        paddingVertical: 12,
        fontSize: 16
    },
    eyeIcon: {
        padding: 8,
    },
    button: {
        backgroundColor: "#1a1a1a", // Slightly lighter than pure black
        padding: 18,
        borderRadius: 30,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333"
    },
    buttonText: {
        color: "#ff9d00",
        fontSize: 18,
        fontWeight: "700"
    }
});