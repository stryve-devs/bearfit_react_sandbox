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

export default function FirstDayScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState("Monday");

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color={orange} />
                </TouchableOpacity>

                <Text style={styles.title}>First Weekday</Text>

                <View style={{ width: 26 }} />
            </View>

            {days.map((day) => (
                <TouchableOpacity
                    key={day}
                    style={styles.row}
                    onPress={() => setSelected(day)}
                >
                    <Text style={styles.text}>{day}</Text>

                    {selected === day && (
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