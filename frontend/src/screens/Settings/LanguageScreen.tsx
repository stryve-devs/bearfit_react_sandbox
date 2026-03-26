import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const orange = "#FF7A00";

export default function LanguageScreen() {
    const router = useRouter();
    const [selectedLanguage, setSelectedLanguage] = useState("English");

    const languages = [
        "English",
        "Español",
        "Deutsch",
        "Français",
        "Italiano",
        "Português",
        "Türkçe",
        "中文",
        "Português (BR)",
        "日本語",
        "Русский",
        "한국어",
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="#FF7825" />
                </TouchableOpacity>

                <Text style={styles.title}>Language</Text>

                <View style={{ width: 26 }} />
            </View>

            <FlatList
                data={languages}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                    const isSelected = item === selectedLanguage;

                    return (
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => setSelectedLanguage(item)}
                        >
                            <Text style={styles.text}>{item}</Text>

                            {isSelected && (
                                <Ionicons name="checkmark" size={22} color={orange} />
                            )}
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={{ paddingVertical: 12 }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        backgroundColor: "#2A1608",
    },

    title: {
        color: "white",
        fontSize: 20,
        fontWeight: "600",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },

    text: {
        color: orange,
        fontSize: 17,
        fontWeight: "500",
    },
});