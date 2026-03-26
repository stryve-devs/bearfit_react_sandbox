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

const ORANGE = "#FF7825";

export default function PreviousWorkoutScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState("Any workout");

    const options = [
        {
            title: "Any workout",
            desc: "Fetch values from last time you did the exercise",
        },
        {
            title: "Same Routine",
            desc: "Fetch values only from current routine",
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <View style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color={ORANGE} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Previous Workout Values</Text>

                    <View style={{ width: 26 }} />
                </View>

                {options.map((item) => (
                    <TouchableOpacity
                        key={item.title}
                        style={styles.row}
                        onPress={() => setSelected(item.title)}
                    >
                        <View>
                            <Text style={styles.rowText}>{item.title}</Text>
                            <Text style={styles.desc}>{item.desc}</Text>
                        </View>

                        {selected === item.title && (
                            <Ionicons name="checkmark-circle" size={22} color={ORANGE} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    title: {
        color: "white",
        fontSize: 20,
        fontWeight: "600",
    },

    row: {
        backgroundColor: "#2b2b2b",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    rowText: {
        color: ORANGE,
        fontSize: 18,
    },

    desc: {
        color: "#aaa",
        fontSize: 14,
        marginTop: 4,
    },
});