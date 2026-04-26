import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const ORANGE = "#FF7825";

export default function WorkoutLogScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>

                {/* HEADER */}
                <View style={styles.header}>

                    {/* DOWN ARROW */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.iconBtn}
                        activeOpacity={0.7}
                    >
                        <Feather name="chevron-down" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Log Workout</Text>

                    <View style={styles.headerRight}>
                        <Feather name="clock" size={20} color="#fff" />

                        <TouchableOpacity style={styles.finishBtn}>
                            <Text style={styles.finishText}>Finish</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* STATS */}
                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.label}>Duration</Text>
                        <Text style={styles.orangeText}>1s</Text>
                    </View>

                    <View>
                        <Text style={styles.label}>Volume</Text>
                        <Text style={styles.value}>0 kg</Text>
                    </View>

                    <View>
                        <Text style={styles.label}>Sets</Text>
                        <Text style={styles.value}>0</Text>
                    </View>

                    <Feather name="user" size={26} color="#aaa" />
                </View>

                {/* DIVIDER */}
                <View style={styles.divider} />

                {/* EMPTY STATE */}
                <View style={styles.center}>
                    <Feather name="activity" size={40} color="#aaa" />

                    <Text style={styles.title}>Get started</Text>

                    <Text style={styles.subtitle}>
                        Add an exercise to start your workout
                    </Text>
                </View>

                {/* ADD EXERCISE BUTTON */}
                <TouchableOpacity activeOpacity={0.85} style={{ marginTop: 20 }}>
                    <LinearGradient
                        colors={[ORANGE, "#ff8d47"]}
                        style={styles.addBtn}
                    >
                        <Text style={styles.addText}>+ Add Exercise</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* BOTTOM BUTTONS */}
                <View style={styles.bottomRow}>
                    <TouchableOpacity style={styles.secondaryBtn}>
                        <Text style={styles.secondaryText}>Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryBtn}>
                        <Text style={styles.discardText}>Discard Workout</Text>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#080808",
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 16,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
    },

    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
    },

    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },

    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    finishBtn: {
        backgroundColor: ORANGE,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 10,
    },

    finishText: {
        color: "#fff",
        fontWeight: "600",
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        alignItems: "center",
    },

    label: {
        color: "#aaa",
        fontSize: 12,
    },

    value: {
        color: "#fff",
        fontSize: 16,
        marginTop: 4,
    },

    orangeText: {
        color: ORANGE,
        fontSize: 16,
        marginTop: 4,
    },

    divider: {
        height: 1,
        backgroundColor: "#222",
        marginTop: 16,
    },

    center: {
        alignItems: "center",
        marginTop: 80,
    },

    title: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginTop: 12,
    },

    subtitle: {
        color: "#aaa",
        marginTop: 6,
    },

    addBtn: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
    },

    addText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },

    secondaryBtn: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.06)",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginHorizontal: 5,
    },

    secondaryText: {
        color: "#fff",
    },

    discardText: {
        color: "#ff4d4d",
    },
});