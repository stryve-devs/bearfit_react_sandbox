import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ORANGE = "#FF7A00";

export default function PrivacySocialScreen() {
    const router = useRouter();

    const [privateProfile, setPrivateProfile] = useState(false);
    const [hideSuggestedUsers, setHideSuggestedUsers] = useState(false);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <View style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color={ORANGE} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Privacy & Social</Text>

                    <View style={{ width: 26 }} />
                </View>

                {/* SWITCHES */}
                <SwitchTile
                    title="Private Profile"
                    description="Having a private profile means other users need to request to follow you. Only if you accept their follow request will they be able to see your workouts."
                    value={privateProfile}
                    onChange={setPrivateProfile}
                />

                <SwitchTile
                    title="Hide Suggested Users"
                    description="Enabling this will remove the suggested user section from your feed."
                    value={hideSuggestedUsers}
                    onChange={setHideSuggestedUsers}
                />

                {/* NAVIGATION */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => router.push("/settings/default-workout-visibility")}
                >
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={styles.cardTitle}>Default Workout Visibility</Text>
                        <Text style={styles.cardTitle}>Everyone</Text>
                    </View>

                    <Text style={styles.desc}>
                        Set the default visibility for new workouts. You can change it to specific workouts when saving them.
                    </Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const SwitchTile = ({ title, description, value, onChange }: any) => (
    <View style={styles.card}>
        <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.desc}>{description}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ true: ORANGE }}
            />
        </View>
    </View>
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

    card: {
        backgroundColor: "#2E2E2E",
        padding: 16,
        borderRadius: 16,
        marginBottom: 14,
    },

    cardTitle: {
        color: ORANGE,
        fontSize: 18,
        fontWeight: "600",
    },

    desc: {
        color: "#ccc",
        fontSize: 15,
        marginTop: 6,
    },
});