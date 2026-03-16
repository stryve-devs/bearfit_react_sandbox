import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const ORANGE = "#ff7a00";

export default function ChangeEmailScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");

    const handleUpdate = () => {
        if (!email.includes("@") || !email.includes(".")) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }
        Alert.alert("Success", "Email updated successfully.", [
            { text: "OK", onPress: () => router.back() },
        ]);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                {/* Single custom header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Feather name="arrow-left" size={24} color={ORANGE} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Change Email</Text>
                    <View style={{ width: 24 }} />
                </View>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter new email"
                    placeholderTextColor="#555"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleUpdate}
                />

                <TouchableOpacity style={styles.button} onPress={handleUpdate} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Update</Text>
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
        marginBottom: 36,
        marginTop: 8,
    },
    title: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "600",
    },
    label: {
        color: ORANGE,
        marginBottom: 10,
        fontSize: 14,
        fontWeight: "500",
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#444",
        color: "#fff",
        marginBottom: 40,
        paddingVertical: 10,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#1a1a1a",
        padding: 18,
        borderRadius: 30,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#2e2e2e",
    },
    buttonText: {
        color: ORANGE,
        fontSize: 18,
        fontWeight: "700",
    },
});
