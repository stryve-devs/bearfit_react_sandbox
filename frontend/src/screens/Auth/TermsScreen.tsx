import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppColors } from "../../constants/colors";

export default function TermsScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="white" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Terms and Conditions</Text>
            </View>

            {/* CONTENT */}
            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.text}>

                    Welcome to BearFit.

                    {"\n\n"}By downloading or using this app, you agree to the following Terms and Conditions. Please read them carefully.

                    {"\n\n"}1. Acceptance of Terms
                    {"\n"}By accessing or using BearFit, you agree to be bound by these terms.

                    {"\n\n"}2. Use of the App
                    {"\n"}You agree to use the app only for lawful personal fitness use.

                    {"\n\n"}Users must not:
                    {"\n"}• misuse the app
                    {"\n"}• reverse engineer the app
                    {"\n"}• attempt to access restricted features

                    {"\n\n"}3. User Accounts
                    {"\n"}To use certain features you may need to create an account. You are responsible for maintaining account security.

                    {"\n\n"}4. Health Disclaimer
                    {"\n"}BearFit does not provide medical advice. All fitness information is for educational purposes only.

                    {"\n\n"}5. Privacy
                    {"\n"}By using BearFit you agree to our privacy policy.

                    {"\n\n"}6. Limitation of Liability
                    {"\n"}BearFit is not responsible for injuries, data loss, or damages resulting from use of the app.

                    {"\n\n"}7. Changes to Terms
                    {"\n"}These terms may be updated at any time.

                </Text>
            </ScrollView>

        </View>
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

    backButton: {
        position: "absolute",
        left: 20,
        bottom: 12,
    },

    headerTitle: {
        color: AppColors.orange,
        fontSize: 20,
        fontWeight: "600",
    },

    scroll: {
        paddingHorizontal: 24,
    },

    text: {
        color: "#D3D3D3",
        fontSize: 15,
        lineHeight: 24,
        paddingBottom: 60,
    },

});