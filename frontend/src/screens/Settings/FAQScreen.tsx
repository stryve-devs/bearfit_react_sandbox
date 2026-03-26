import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ORANGE = "#FF7825";

// Enable animation for Android
if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function FAQScreen() {
    const router = useRouter();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenIndex(openIndex === index ? null : index);
    };

    const data = [
        {
            q: "How to change the theme?",
            a: "Go to Settings → Themes → Select your preferred theme.",
        },
        {
            q: "How to log out?",
            a: "Go to Settings → Scroll down → Tap Logout → Confirm.",
        },
        {
            q: "How to change gender?",
            a: "Go to Profile → Edit Profile → Select Gender → Save.",
        },
        {
            q: "How to delete account?",
            a: "Go to Settings → Account → Delete Account → Confirm.",
        },
        {
            q: "How to update password?",
            a: "Go to Settings → Account → Update Password → Enter new password → Save.",
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <View style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color={ORANGE} />
                    </TouchableOpacity>

                    <Text style={styles.title}>FAQ</Text>

                    <View style={{ width: 26 }} />
                </View>

                {/* FAQ LIST */}
                {data.map((item, index) => {
                    const isOpen = openIndex === index;

                    return (
                        <View key={index} style={styles.card}>
                            <TouchableOpacity onPress={() => toggle(index)} style={styles.row}>
                                <Text style={styles.question}>{item.q}</Text>

                                <Ionicons
                                    name={isOpen ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={ORANGE}
                                />
                            </TouchableOpacity>

                            {isOpen && (
                                <Text style={styles.answer}>{item.a}</Text>
                            )}
                        </View>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    title: {
        color: "white",
        fontSize: 20,
        fontWeight: "600",
    },

    card: {
        backgroundColor: "#2b2b2b",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    question: {
        color: ORANGE,
        fontSize: 17,
        fontWeight: "500",
        flex: 1,
    },

    answer: {
        color: "#ccc",
        marginTop: 10,
        fontSize: 15,
        lineHeight: 22,
    },
});