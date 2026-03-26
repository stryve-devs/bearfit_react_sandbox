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
const blue = "#0A84FF"; // ✅ visible blue
const green = "#4CAF50";

export default function BugReportScreen() {
    const router = useRouter();
    const [text, setText] = useState("");
    const [sent, setSent] = useState(false);

    const handleSend = () => {
        if (text.trim().length === 0) return;
        setSent(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color={orange} />
                </TouchableOpacity>

                <Text style={styles.title}>Bug Report</Text>

                <TouchableOpacity onPress={handleSend}>
                    <Text
                        style={[
                            styles.send,
                            { color: sent ? green : blue },
                            text.trim().length === 0 && { opacity: 0.4 },
                        ]}
                    >
                        {sent ? "Sent" : "Send"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* BODY */}
            <View style={styles.body}>
                <TextInput
                    value={text}
                    onChangeText={(t) => {
                        setText(t);
                        setSent(false);
                    }}
                    placeholder="Report any bugs you have found..."
                    placeholderTextColor={orange}
                    multiline
                    style={styles.input}
                />
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
        backgroundColor: "#2B1A0F",
    },

    title: {
        color: "white",
        fontSize: 20,
        fontWeight: "600",
    },

    send: {
        fontSize: 16,
        fontWeight: "600", // ✅ semi bold
    },

    body: { padding: 20 },

    input: {
        color: "white",
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: "white",
        paddingVertical: 8,
    },
});