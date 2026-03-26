import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const orange = "#FF7825";

export default function LivePRVolumeScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState("High");

    const options = ["High", "Normal", "Low", "Off"];

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color={orange} />
                </TouchableOpacity>

                <Text style={styles.title}>Live Personal Record Volume</Text>

                <View style={{ width: 26 }} />
            </View>

            {/* OPTIONS */}
            {options.map((item) => (
                <TouchableOpacity
                    key={item}
                    style={styles.row}
                    onPress={() => setSelected(item)}
                >
                    <Text style={styles.text}>{item}</Text>

                    {selected === item && (
                        <Ionicons name="checkmark" size={20} color={orange} />
                    )}
                </TouchableOpacity>
            ))}
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
    },

    title: {
        color: "white",
        fontSize: 20,
        fontWeight: "600",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },

    text: {
        color: orange,
        fontSize: 18,
    },
});