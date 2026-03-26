// src/screens/Settings/ChangeEmailScreen.tsx

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const orange = "#FF7825";

export default function ChangeEmailScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [updated, setUpdated] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Change Email" />

            <View style={styles.body}>
                <Text style={styles.label}>Email</Text>

                <TextInput
                    placeholder="Enter new email"
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                />

                <Button text={updated ? "Updated" : "Update"} onPress={() => setUpdated(true)} />
            </View>
        </SafeAreaView>
    );
}

/* REUSABLE */
const Header = ({ title }: any) => {
    const router = useRouter();
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={26} color={orange} />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <View style={{ width: 26 }} />
        </View>
    );
};

const Button = ({ text, onPress }: any) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.btnText}>{text}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 18,
        backgroundColor: "#1C120A",
    },

    title: { color: "white", fontSize: 20 },

    body: { padding: 20 },

    label: { color: orange, fontSize: 16, marginBottom: 10 },

    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#666",
        color: "white",
        fontSize: 16,
        marginBottom: 40,
    },

    button: {
        backgroundColor: "#3A3A3A",
        padding: 18,
        borderRadius: 30,
        alignItems: "center",
    },

    btnText: {
        color: orange,
        fontSize: 17,
        fontWeight: "600",
    },
});