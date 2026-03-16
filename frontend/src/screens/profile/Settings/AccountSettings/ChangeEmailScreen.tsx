import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router"; // Use expo-router
import { Feather } from "@expo/vector-icons";

export default function ChangeEmailScreen() {
    const router = useRouter(); // Use router instead of navigation
    const [email, setEmail] = useState("");

    const handleUpdate = () => {
        if (!email.includes("@")) {
            Alert.alert("Error", "Please enter a valid email");
            return;
        }
        Alert.alert("Success", "Email updated successfully");
        router.back(); // Go back automatically after success
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="#ff7925" />
                </TouchableOpacity>
                <Text style={styles.title}>Change Email</Text>
                <View style={{ width: 24 }} />
            </View>

            <Text style={styles.label}>Email</Text>

            <TextInput
                style={styles.input}
                placeholder="lenajoseph2020@gmail.com" // Matches your video data
                placeholderTextColor="#777"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address" // Proper keyboard
                autoCapitalize="none"        // No auto-caps for emails
                autoCorrect={false}
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
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
    title: { color: "#fff", fontSize: 22 },
    label: { color: "#ff9d00", marginBottom: 10 },
    input: { borderBottomWidth: 1, borderBottomColor: "#666", color: "#fff", marginBottom: 40, paddingVertical: 8, fontSize: 16 },
    button: { backgroundColor: "#333", padding: 18, borderRadius: 30, alignItems: "center" },
    buttonText: { color: "#ff9d00", fontSize: 18, fontWeight: "600" }
});