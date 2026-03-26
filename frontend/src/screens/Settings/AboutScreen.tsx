import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const orange = "#FF7825";

export default function AboutScreen() {
    const router = useRouter();

    const openLink = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color={orange} />
                </TouchableOpacity>

                <Text style={styles.title}>About</Text>

                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.center}>
                    {/* LOGO */}
                    <MaterialIcons name="pets" size={90} color={orange} />

                    {/* SOCIAL */}
                    <Section title="Social" />
                    <Clickable text="Instagram" onPress={() => openLink("https://instagram.com")} />
                    <Clickable text="Facebook" onPress={() => openLink("https://facebook.com")} />
                    <Clickable text="Twitter" onPress={() => openLink("https://twitter.com")} />

                    {/* CONTACT */}
                    <Section title="Contact" />
                    <Clickable
                        text="hello@bearfit.com"
                        underline
                        onPress={() => openLink("mailto:hello@bearfit.com")}
                    />

                    {/* POLICIES */}
                    <Section title="Policies" />
                    <Clickable text="Privacy Policy" onPress={() => openLink("https://example.com/privacy")} />
                    <Clickable text="Terms & Conditions" onPress={() => openLink("https://example.com/terms")} />

                    <View style={{ height: 20 }} />

                    <Clickable text="Acknowledgements" onPress={() => {}} />

                    {/* VERSION */}
                    <View style={{ height: 30 }} />
                    <Text style={styles.version}>
                        Version: 2.5.10 - (1880052)
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/* COMPONENTS */

const Section = ({ title }: any) => (
    <>
        <View style={{ height: 30 }} />
        <Text style={styles.section}>{title}</Text>
        <View style={{ height: 20 }} />
    </>
);

const Clickable = ({ text, onPress, underline }: any) => (
    <>
        <TouchableOpacity onPress={onPress}>
            <Text
                style={[
                    styles.item,
                    underline && { textDecorationLine: "underline" },
                ]}
            >
                {text}
            </Text>
        </TouchableOpacity>
        <View style={{ height: 14 }} />
    </>
);

/* STYLES */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        backgroundColor: "#1C120A",
    },

    title: {
        color: "white",
        fontSize: 20,
        fontWeight: "500",
    },

    scroll: {
        paddingVertical: 40,
    },

    center: {
        alignItems: "center",
    },

    section: {
        color: orange,
        fontSize: 22,
        fontWeight: "600",
    },

    item: {
        color: orange,
        fontSize: 18,
    },

    version: {
        color: orange,
        fontSize: 16,
    },
});