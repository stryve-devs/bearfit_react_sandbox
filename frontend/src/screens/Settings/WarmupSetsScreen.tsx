import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const orange = "#FF7825";

export default function WarmupSetsScreen() {
    const router = useRouter();
    const [enabled, setEnabled] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color={orange} />
                </TouchableOpacity>

                <Text style={styles.title}>Warm-up Sets</Text>

                <View style={{ width: 26 }} />
            </View>

            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.text}>
                        Include warm-up sets in workout stats
                    </Text>
                    <Text style={styles.sub}>
                        Warm-up sets will count towards volume and PRs
                    </Text>
                </View>

                <Switch
                    value={enabled}
                    onValueChange={setEnabled}
                    thumbColor={orange}
                />
            </View>
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
        alignItems: "center",
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },

    text: {
        color: orange,
        fontSize: 18,
    },

    sub: {
        color: "#aaa",
        fontSize: 14,
        marginTop: 4,
    },
});