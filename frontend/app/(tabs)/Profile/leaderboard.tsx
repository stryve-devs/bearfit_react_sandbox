import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function LeaderboardScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Leaderboard coming soon</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#080808",
    },
    text: {
        color: "#f0ede8",
        fontSize: 16,
        fontWeight: "600",
    },
});
