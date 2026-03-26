import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const orange = "#FF7825";

export default function ContactUsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color={orange} />
                </TouchableOpacity>

                <Text style={styles.title}>Contact Us</Text>

                <View style={{ width: 26 }} />
            </View>

            <Item
                icon={<MaterialIcons name="lightbulb-outline" size={24} color="white" />}
                text="Feature Request"
                onPress={() => router.push("/settings/feature-request")}
            />

            <Item
                icon={<MaterialIcons name="bug-report" size={24} color="white" />}
                text="Bug Report"
                onPress={() => router.push("/settings/bug-report")}
            />

            <Item
                icon={<Ionicons name="help-circle-outline" size={24} color="white" />}
                text="Get Help"
                onPress={() => router.push("/settings/get-help")}
            />
        </SafeAreaView>
    );
}

const Item = ({ icon, text, onPress }: any) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
        {icon}
        <Text style={styles.itemText}>{text}</Text>
        <Ionicons name="chevron-forward" size={20} color="white" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        backgroundColor: "#2B1A0F",
    },

    title: {
        color: "white",
        fontSize: 20,
        fontWeight: "600",
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2E2E2E",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "black",
    },

    itemText: {
        color: orange,
        fontSize: 18,
        marginLeft: 16,
        flex: 1,
    },
});