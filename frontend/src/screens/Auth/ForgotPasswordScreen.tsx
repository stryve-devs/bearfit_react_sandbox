import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "../../constants/colors";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");

    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="white" />
                </TouchableOpacity>

                <Text style={styles.title}>Forgot Password</Text>
            </View>

            {/* CONTENT */}
            <View style={styles.content}>

                <Text style={styles.label}>Email</Text>

                <TextInput
                    placeholder="example@gmail.com"
                    placeholderTextColor="#777"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                />

                <Text style={styles.helper}>
                    Enter your email above and if an account exists we will send you an email with a link to recover your password
                </Text>

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Send Password Recovery</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: AppColors.black,
    },

    header: {
        height: 90,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 12,
    },

    backButton: {
        position: "absolute",
        left: 20,
        bottom: 12,
    },

    title: {
        color: AppColors.orange,
        fontSize: 20,
        fontWeight: "600",
    },

    content: {
        paddingHorizontal: 24,
        marginTop: 40,
    },

    label: {
        color: "#D3D3D3",
        marginBottom: 8,
        fontSize: 14,
    },

    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#777",
        color: "white",
        fontSize: 16,
        paddingVertical: 8,
        marginBottom: 16,
    },

    helper: {
        color: "#888",
        fontSize: 12,
        marginBottom: 24,
    },

    button: {
        backgroundColor: "#3A3A3A",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },

    buttonText: {
        color: "#D3D3D3",
        fontSize: 15,
    },

});