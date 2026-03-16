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

export default function UpdatePasswordScreen() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [securePass, setSecurePass] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);

    const handleUpdate = () => {
        if (password.length < 6) {
            Alert.alert("Invalid Password", "Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Mismatch", "Passwords do not match.");
            return;
        }
        Alert.alert("Success", "Your password has been updated.", [
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
                    <Text style={styles.title}>Update Password</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* New Password */}
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        secureTextEntry={securePass}
                        placeholder="Minimum 6 characters"
                        placeholderTextColor="#555"
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        returnKeyType="next"
                    />
                    <TouchableOpacity onPress={() => setSecurePass(!securePass)} style={styles.eye} activeOpacity={0.7}>
                        <Feather name={securePass ? "eye-off" : "eye"} size={20} color="#555" />
                    </TouchableOpacity>
                </View>

                {/* Confirm Password */}
                <Text style={[styles.label, { marginTop: 8 }]}>Confirm Password</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        secureTextEntry={secureConfirm}
                        placeholder="Re-enter your password"
                        placeholderTextColor="#555"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        returnKeyType="done"
                        onSubmitEditing={handleUpdate}
                    />
                    <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)} style={styles.eye} activeOpacity={0.7}>
                        <Feather name={secureConfirm ? "eye-off" : "eye"} size={20} color="#555" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleUpdate} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Update Password</Text>
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
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#444",
        marginBottom: 28,
    },
    input: {
        flex: 1,
        color: "#fff",
        paddingVertical: 10,
        fontSize: 16,
    },
    eye: {
        padding: 8,
    },
    button: {
        backgroundColor: "#1a1a1a",
        padding: 18,
        borderRadius: 30,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#2e2e2e",
        marginTop: 12,
    },
    buttonText: {
        color: ORANGE,
        fontSize: 18,
        fontWeight: "700",
    },
});
