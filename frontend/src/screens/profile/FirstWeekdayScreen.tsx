import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ORANGE = "#FF7825";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const BlurContainer = ({ children, style }: any) => (
    <View style={[style, { overflow: 'hidden' }]}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        {children}
    </View>
);

export default function FirstWeekdayScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState("Sunday");

    // Load saved preference on mount
    useEffect(() => {
        const loadPref = async () => {
            const saved = await AsyncStorage.getItem("firstDayOfWeek");
            if (saved !== null) setSelected(DAYS[parseInt(saved)]);
        };
        loadPref();
    }, []);

    const handleSelect = async (day: string, index: number) => {
        setSelected(day);
        try {
            await AsyncStorage.setItem("firstDayOfWeek", index.toString());
            // Small delay so user sees the checkmark before going back
            setTimeout(() => router.back(), 150);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#080808" }}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <BlurContainer style={styles.iconBtn}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconPress}>
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>
                    </BlurContainer>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>First Weekday</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <View style={{ paddingHorizontal: 16 }}>
                    <Text style={styles.title}>Calendar week starts on...</Text>
                    <Text style={styles.subtitle}>
                        This will change the calendar's first day of the week and your dashboard graphs.
                    </Text>
                </View>

                <View style={styles.listContainer}>
                    {DAYS.map((day, index) => (
                        <TouchableOpacity
                            key={day}
                            style={[styles.row, index === DAYS.length - 1 && { borderBottomWidth: 0 }]}
                            onPress={() => handleSelect(day, index)}
                        >
                            <Text style={[styles.day, selected === day && { color: ORANGE, fontWeight: "600" }]}>
                                {day}
                            </Text>
                            {selected === day && <Feather name="check" size={20} color={ORANGE} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", padding: 16 },
    headerTitleContainer: { flex: 1, alignItems: "center" },
    headerTitle: { color: ORANGE, fontSize: 17, fontWeight: "700" },
    iconBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    iconPress: { flex: 1, alignItems: "center", justifyContent: "center" },
    title: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 10 },
    subtitle: { color: "#888", fontSize: 14, marginTop: 8, marginBottom: 24, lineHeight: 20 },
    listContainer: { marginHorizontal: 16, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", overflow: 'hidden' },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 18, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
    day: { color: "#fff", fontSize: 16 },
});