import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { AppColors } from "../../constants/colors";

export default function ReferralScreen() {

    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(null);

    const options = [
        "Strava",
        "Tiktok",
        "Influencer",
        "ChatGPT or AI Search",
        "Friends or Family",
        "App Store",
        "Google Search or Web Article",
        "Instagram",
        "Other"
    ];

    const finishOnboarding = () => {
        router.replace("/(tabs)");
    };

    return (

        <View style={styles.container}>

            <TouchableOpacity style={styles.skip} onPress={finishOnboarding}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <Text style={styles.title}>How did you hear about BearFit?</Text>

            <ScrollView style={styles.optionsContainer}>

                {options.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.option,
                            selected === option && styles.selectedOption
                        ]}
                        onPress={() => setSelected(option)}
                    >
                        <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                ))}

            </ScrollView>

            <TouchableOpacity
                style={[
                    styles.continueButton,
                    selected ? styles.activeButton : styles.disabledButton
                ]}
                disabled={!selected}
                onPress={finishOnboarding}
            >
                <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: AppColors.black,
        padding: 24
    },

    skip: {
        alignSelf: "flex-end",
        marginTop: 10
    },

    skipText: {
        color: AppColors.orange,
        fontWeight: "600"
    },

    title: {
        color: "white",
        fontSize: 18,
        marginTop: 30,
        marginBottom: 20
    },

    optionsContainer: {
        flex: 1
    },

    option: {
        backgroundColor: "#333",
        padding: 16,
        borderRadius: 10,
        marginBottom: 12
    },

    selectedOption: {
        borderColor: AppColors.orange,
        borderWidth: 2
    },

    optionText: {
        color: "white"
    },

    continueButton: {
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 30
    },

    disabledButton: {
        backgroundColor: "#444"
    },

    activeButton: {
        backgroundColor: AppColors.orange
    },

    continueText: {
        color: "white",
        fontWeight: "600"
    }

});