import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Notif = { id: string; title: string; time: string };

const ORANGE = "#FF7825";
const BG = "#000000";
const CARD_BG = "#1A1A1A";
const GREY = "#B0B0B0";

function makeRandomNotifications(): Notif[] {
    const titles = [
        "Someone liked your workout",
        "New athlete suggestion",
        "A friend joined BearFit",
        "You hit a new streak!",
        "Workout reminder: Warmup",
        "New challenge available",
        "Someone commented on your post",
    ];
    const times = ["1m ago", "5m ago", "12m ago", "1h ago", "3h ago", "Yesterday"];

    return Array.from({ length: 12 }).map((_, i) => ({
        id: `${i}-${Date.now()}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        time: times[Math.floor(Math.random() * times.length)],
    }));
}

export default function NotificationsScreen() {
    const data = useMemo(() => makeRandomNotifications(), []);

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={22} color={ORANGE} />
                </Pressable>
                <Text style={styles.title}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                contentContainerStyle={styles.list}
                data={data}
                keyExtractor={(x) => x.id}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.cardText}>{item.title}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    header: {
        height: 56,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    title: { color: "white", fontSize: 16, fontWeight: "800" },

    list: { padding: 12, paddingBottom: 24 },
    card: { backgroundColor: CARD_BG, borderRadius: 14, padding: 12 },
    cardText: { color: "white", fontSize: 13, fontWeight: "800" },
    time: { color: GREY, marginTop: 6, fontSize: 12 },
});