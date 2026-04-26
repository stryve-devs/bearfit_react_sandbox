import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppColors } from "../../constants/colors";

export default function SelectUnitsScreen() {

    const router = useRouter();

    const [weightUnit, setWeightUnit] = useState("kg");
    const [distanceUnit, setDistanceUnit] = useState("kilometers");
    const [bodyUnit, setBodyUnit] = useState("centimeters");

    const handleContinue = () => {
        router.replace("/(onboarding)/apple-health");
    };

    return (
        <SafeAreaView style={styles.container} edges={["top","bottom"]}>

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>Select units</Text>
            </View>

            {/* CONTENT */}
            <View style={styles.content}>

                {/* WEIGHT */}
                <Text style={styles.label}>Weight</Text>

                <View style={styles.row}>
                    <UnitButton
                        text="kg"
                        active={weightUnit === "kg"}
                        onPress={() => setWeightUnit("kg")}
                    />
                    <UnitButton
                        text="lb"
                        active={weightUnit === "lb"}
                        onPress={() => setWeightUnit("lb")}
                    />
                </View>

                {/* DISTANCE */}
                <Text style={styles.label}>Distance</Text>

                <View style={styles.row}>
                    <UnitButton
                        text="kilometers"
                        active={distanceUnit === "kilometers"}
                        onPress={() => setDistanceUnit("kilometers")}
                    />
                    <UnitButton
                        text="miles"
                        active={distanceUnit === "miles"}
                        onPress={() => setDistanceUnit("miles")}
                    />
                </View>

                {/* BODY */}
                <Text style={styles.label}>Body Measurements</Text>

                <View style={styles.row}>
                    <UnitButton
                        text="centimeters"
                        active={bodyUnit === "centimeters"}
                        onPress={() => setBodyUnit("centimeters")}
                    />
                    <UnitButton
                        text="inches"
                        active={bodyUnit === "inches"}
                        onPress={() => setBodyUnit("inches")}
                    />
                </View>

            </View>

            {/* CONTINUE BUTTON */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                    <Text style={styles.continueText}>Continue</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

function UnitButton({ text, active, onPress }: any) {
    return (
        <TouchableOpacity
            style={[styles.unitButton, active && styles.activeButton]}
            onPress={onPress}
        >
            <Text style={[styles.unitText, active && styles.activeText]}>
                {text}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: AppColors.black,
    },

    header: {
        height: 90,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 12,
    },

    title: {
        color: AppColors.orange,
        fontSize: 20,
        fontWeight: "600",
    },

    content: {
        flex: 1,
        paddingHorizontal: 24,
        marginTop: 40,
    },

    label: {
        color: "#aaa",
        marginBottom: 10,
        marginTop: 20,
    },

    row: {
        flexDirection: "row",
        gap: 12,
    },

    unitButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#555",
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
    },

    activeButton: {
        backgroundColor: AppColors.orange,
        borderColor: AppColors.orange,
    },

    unitText: {
        color: "#ddd",
    },

    activeText: {
        color: "white",
        fontWeight: "600",
    },

    buttonContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },

    continueButton: {
        backgroundColor: AppColors.orange,
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: "center",
    },

    continueText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },

});