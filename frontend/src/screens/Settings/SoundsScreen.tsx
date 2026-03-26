import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

const ORANGE = "#FF7825";

export default function SoundsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [timerSound, setTimerSound] = useState("Default");
    const [timerVolume, setTimerVolume] = useState("High");
    const [checkSet, setCheckSet] = useState("Off");
    const [livePR, setLivePR] = useState("High");

    useEffect(() => {
        if (params.timerSound) {
            setTimerSound(params.timerSound as string);
        }

        if (params.timerVolume) {
            setTimerVolume(params.timerVolume as string);
        }

        if (params.checkSet) {
            setCheckSet(params.checkSet as string);
        }

        if (params.livePR) {
            setLivePR(params.livePR as string);
        }
    }, [params.timerSound, params.timerVolume, params.checkSet, params.livePR]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <View style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color={ORANGE} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Sounds</Text>

                    <View style={{ width: 26 }} />
                </View>

                {/* OPTIONS */}
                <Row
                    title="Timer Sound"
                    value={timerSound}
                    onPress={() => router.push("/settings/select-timer-sound")}
                />

                <Row
                    title="Timer Volume"
                    value={timerVolume}
                    onPress={() => router.push("/settings/timer-volume")}
                />

                <Row
                    title="Check Set"
                    value={checkSet}
                    onPress={() => router.push("/settings/check-set")}
                />

                <Row
                    title="Live Personal Record Volume"
                    value={livePR}
                    onPress={() => router.push("/settings/live-pr")}
                />

            </View>
        </SafeAreaView>
    );
}

const Row = ({ title, value, onPress }: any) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
        <Text style={styles.rowText}>{title}</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.value}>{value}</Text>
            <Ionicons name="chevron-forward" size={18} color="#aaa" />
        </View>
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

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#2b2b2b",
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
    },

    rowText: {
        color: ORANGE,
        fontSize: 18,
    },

    value: {
        color: "#aaa",
        marginRight: 6,
    },
});