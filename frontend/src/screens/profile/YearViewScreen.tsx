import React from "react";
import { BlurView } from "expo-blur";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function YearViewScreen() {
    const router = useRouter();

    const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <View style={styles.header}>
                    <BlurView intensity={60} tint="dark" style={styles.iconBtn}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.iconPress}
                        >
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>
                    </BlurView>

                    <Text style={styles.title}>Year</Text>

                    <View style={styles.headerRight}>
                        <View style={{ flexDirection: "row", gap: 10 }}>

                            <BlurView intensity={60} tint="dark" style={styles.iconBtn}>
                                <TouchableOpacity style={styles.iconPress}>
                                    <Feather name="upload" size={18} color="#fff" />
                                </TouchableOpacity>
                            </BlurView>

                            <BlurView intensity={60} tint="dark" style={styles.iconBtn}>
                                <TouchableOpacity style={styles.iconPress}>
                                    <Feather name="sliders" size={18} color="#fff" />
                                </TouchableOpacity>
                            </BlurView>

                        </View>
                    </View>
                </View>

                {/* YEAR */}
                <Text style={styles.year}>2026</Text>

                {/* MONTH LABELS */}
                <View style={styles.monthRow}>
                    {months.map((m) => (
                        <Text key={m} style={styles.monthText}>{m}</Text>
                    ))}
                </View>

                {/* CONTINUOUS GRID */}
                <View style={styles.grid}>
                    {Array.from({ length: 365 }).map((_, i) => (
                        <View key={i} style={styles.box} />
                    ))}
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#080808",
        paddingHorizontal: 16,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },

    title: {
        color: "#FF7825",
        fontSize: 18,
        fontWeight: "600",
    },

    headerRight: {
        flexDirection: "row",
        gap: 12,
    },

    year: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "700",
        marginTop: 20,
    },

    monthRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },

    monthText: {
        color: "#aaa",
        fontSize: 12,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
    },

    box: {
        width: 6,
        height: 6,
        margin: 1.5,
        borderRadius: 2,
        backgroundColor: "#333",
    },


    iconBtn: {
        width: 42,
        height: 42,
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