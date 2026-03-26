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

const orange = "#FF7A00";

export default function UnitsScreen() {
    const router = useRouter();

    const [weightUnit, setWeightUnit] = useState("kg");
    const [distanceUnit, setDistanceUnit] = useState("km");
    const [bodyUnit, setBodyUnit] = useState("cm");

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="#FF7825" />
                </TouchableOpacity>

                <Text style={styles.title}>Select Units</Text>

                <View style={{ width: 26 }} />
            </View>

            <View style={styles.body}>
                {/* WEIGHT */}
                <Section title="Weight" />
                <UnitRow
                    selected={weightUnit}
                    leftLabel="kg"
                    rightLabel="lbs"
                    onLeft={() => setWeightUnit("kg")}
                    onRight={() => setWeightUnit("lbs")}
                />

                {/* DISTANCE */}
                <Section title="Distance" />
                <UnitRow
                    selected={distanceUnit}
                    leftLabel="kilometers"
                    rightLabel="miles"
                    onLeft={() => setDistanceUnit("km")}
                    onRight={() => setDistanceUnit("miles")}
                />

                {/* BODY */}
                <Section title="Body Measurements" />
                <UnitRow
                    selected={bodyUnit}
                    leftLabel="cm"
                    rightLabel="in"
                    onLeft={() => setBodyUnit("cm")}
                    onRight={() => setBodyUnit("in")}
                />
            </View>
        </SafeAreaView>
    );
}

/* SECTION TITLE */
const Section = ({ title }: any) => (
    <>
        <View style={{ height: 20 }} />
        <Text style={styles.section}>{title}</Text>
        <View style={{ height: 10 }} />
    </>
);

/* ROW */
const UnitRow = ({
                     selected,
                     leftLabel,
                     rightLabel,
                     onLeft,
                     onRight,
                 }: any) => (
    <View style={styles.row}>
        <UnitButton
            label={leftLabel}
            selected={
                selected === leftLabel ||
                (leftLabel === "kilometers" && selected === "km")
            }
            onPress={onLeft}
        />
        <View style={{ width: 12 }} />
        <UnitButton
            label={rightLabel}
            selected={selected === rightLabel}
            onPress={onRight}
        />
    </View>
);

/* BUTTON */
const UnitButton = ({ label, selected, onPress }: any) => (
    <TouchableOpacity
        style={[
            styles.button,
            selected && { backgroundColor: orange, borderColor: orange },
        ]}
        onPress={onPress}
    >
        <Text
            style={[
                styles.buttonText,
                { color: selected ? "black" : "white" },
            ]}
        >
            {label}
        </Text>
    </TouchableOpacity>
);

/* STYLES */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        backgroundColor: "#000",
    },

    title: {
        color: "white",
        fontSize: 20, // 🔥 bigger
        fontWeight: "600",
    },

    body: {
        paddingHorizontal: 16,
    },

    section: {
        color: "#aaa",
        fontSize: 15, // 🔥 bigger
        fontWeight: "500",
    },

    row: {
        flexDirection: "row",
    },

    button: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#444",
        justifyContent: "center",
        alignItems: "center",
    },

    buttonText: {
        fontSize: 16, // 🔥 bigger
        fontWeight: "600",
    },
});