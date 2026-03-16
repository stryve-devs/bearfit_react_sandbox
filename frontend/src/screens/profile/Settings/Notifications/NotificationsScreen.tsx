import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router"; // Use Expo Router
import { Feather } from "@expo/vector-icons";

export default function NotificationsScreen() {
    const router = useRouter();

    // Reusable Toggle Component with your theme colors
    const Toggle = ({ text }: any) => {
        const [enabled, setEnabled] = useState(false);

        return (
            <View style={styles.row}>
                <Text style={styles.rowText}>{text}</Text>
                <Switch
                    value={enabled}
                    onValueChange={() => setEnabled(!enabled)}
                    trackColor={{ false: "#3e3e3e", true: "#ff9d00" }} // BearFit Orange
                    thumbColor={enabled ? "#fff" : "#f4f3f4"}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="#ff7925" />
                </TouchableOpacity>
                <Text style={styles.title}>Notifications</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* ScrollView is necessary here because the list is long */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <Toggle text="Rest Timer" />
                <Toggle text="Follows" />
                <Toggle text="Monthly Report" />
                <Toggle text="Subscribe to Stryve emails" />
                <Toggle text="Likes on your workouts" />
                <Toggle text="Likes on your comments" />
                <Toggle text="Comments on your workouts" />
                <Toggle text="Comment Replies" />
                <Toggle text="Comment Mentions" />
                <Toggle text="Workout Discussions" />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        paddingHorizontal: 20,
        paddingTop: 20
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30
    },
    title: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "600"
    },
    row: {
        backgroundColor: "#1c1c1e", // Matching your Account Settings background
        padding: 16,
        borderRadius: 18,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    rowText: {
        color: "#fff",
        fontSize: 16
    }