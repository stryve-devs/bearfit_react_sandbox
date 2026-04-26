import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

        <SafeAreaView style={styles.container} edges={["top","bottom"]}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.skip} onPress={finishOnboarding}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>

                <Text style={styles.title}>How did you hear about BearFit?</Text>

                <ScrollView
                    style={styles.optionsContainer}
                    showsVerticalScrollIndicator={false}
                >

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

            </View>

            {/* Bottom Button */}
            <View style={styles.buttonContainer}>
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

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: AppColors.black
    },

    header: {
        paddingHorizontal: 24
    },

    skip: {
        alignSelf: "flex-end",
        marginTop: 10
    },

    skipText: {
        color: AppColors.orange,
        fontWeight: "600"
    },

    content: {
        flex: 1,
        paddingHorizontal: 24
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

    buttonContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20
    },

    continueButton: {
        padding: 16,
        borderRadius: 10,
        alignItems: "center"
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