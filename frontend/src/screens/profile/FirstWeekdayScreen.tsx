import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {BlurView} from "expo-blur";

const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export default function FirstWeekdayScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState("Sunday");

    return (
        <View style={{ flex: 1, backgroundColor: "#080808" }}>
            <SafeAreaView style={{ flex: 1 }}>

                {/* 🔥 HEADER */}
                <View style={styles.header}>
                    <BlurView intensity={60} tint="dark" style={styles.iconBtn}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.iconPress}
                            activeOpacity={0.7}
                        >
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>
                    </BlurView>

                    <Text style={styles.headerTitle}>First Weekday</Text>

                    <View style={{ width: 22 }} />
                </View>

                {/* 🔥 TITLE */}
                <Text style={styles.title}>Calendar week starts on...</Text>

                <Text style={styles.subtitle}>
                    This will change the calendar's first day of the week, as well as your graphs in the profile dashboard.
                </Text>

                {/* 🔥 LIST */}
                {days.map((day) => (
                    <TouchableOpacity
                        key={day}
                        style={styles.row}
                        onPress={() => setSelected(day)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.day}>{day}</Text>

                        {selected === day && (
                            <Feather name="check" size={20} color="#FF7825" />
                        )}
                    </TouchableOpacity>
                ))}

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },

    headerTitle: {
        color: "#FF7825",   // 👈 change this
        fontSize: 16,
        fontWeight: "600",
    },

    title: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginHorizontal: 16,
        marginTop: 10,
    },

    subtitle: {
        color: "#aaa",
        fontSize: 13,
        marginHorizontal: 16,
        marginTop: 6,
        marginBottom: 16,
        lineHeight: 18,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 18,
        marginHorizontal: 16,
        borderBottomWidth: 0.5,
        borderColor: "#222",
    },

    day: {
        color: "#fff",
        fontSize: 15,
    },

    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },

    iconPress: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
});