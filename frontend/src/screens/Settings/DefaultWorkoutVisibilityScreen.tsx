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

const ORANGE = "#FF7A00";

export default function DefaultWorkoutVisibilityScreen() {
    const router = useRouter();
    const [isPrivate, setIsPrivate] = useState(true);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <View style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color={ORANGE} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Default Workout Visibility</Text>

                    <View style={{ width: 26 }} />
                </View>

                <Text style={styles.info}>
                    Set the default visibility of new workouts. You can change it later when saving workouts.
                </Text>

                <Option
                    title="Everyone"
                    desc="Workouts visible to all users"
                    selected={!isPrivate}
                    onPress={() => setIsPrivate(false)}
                />

                <Option
                    title="Private"
                    desc="Only visible to you"
                    selected={isPrivate}
                    onPress={() => setIsPrivate(true)}
                />

            </View>
        </SafeAreaView>
    );
}

const Option = ({ title, desc, selected, onPress }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.desc}>{desc}</Text>
        </View>

        {selected && (
            <Ionicons name="checkmark" size={22} color={ORANGE} />
        )}
    </TouchableOpacity>
);

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

    info: {
        color: "#ccc",
        fontSize: 15,
        marginBottom: 16,
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2E2E2E",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },

    cardTitle: {
        color: ORANGE,
        fontSize: 18,
        fontWeight: "600",
    },

    desc: {
        color: "#ccc",
        fontSize: 15,
    },
});