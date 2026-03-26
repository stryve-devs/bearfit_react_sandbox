import React from "react";
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

export default function CheckSetVolumeScreen() {
    const router = useRouter();

    const options = ["High", "Normal", "Low", "Off"];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <View style={styles.container}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color={ORANGE} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Select Check Set Volume</Text>

                    <View style={{ width: 26 }} />
                </View>

                {/* OPTIONS */}
                {options.map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={styles.row}
                        onPress={() => {
                            router.replace({
                                pathname: "/settings/sounds",
                                params: { checkSet: item },
                            });
                        }}
                    >
                        <Text style={styles.text}>{item}</Text>
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
        marginBottom: 10,
    },

    text: {
        color: ORANGE,
        fontSize: 18,
    },
});