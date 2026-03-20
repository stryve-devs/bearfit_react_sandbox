import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ORANGE = "#ff7a00";
const DANGER = "#ff3b30";

type RowProps = {
    icon: React.ReactNode;
    text: string;
    path: string;
    danger?: boolean;
};

function Row({ icon, text, path, danger = false }: RowProps) {
    const router = useRouter();
    return (
        <TouchableOpacity
            style={styles.rowWrap}
            onPress={() => router.push(path as any)}
            activeOpacity={0.75}
        >
            <LinearGradient
                colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.row}
            >
                {/* Top shine */}
                <LinearGradient
                    colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.shine}
                    pointerEvents="none"
                />
                <View style={styles.left}>
                    <View style={[
                        styles.iconWrap,
                        danger && styles.iconWrapDanger,
                    ]}>
                        {icon}
                    </View>
                    <Text style={[styles.text, danger && styles.dangerText]}>{text}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.25)" />
            </LinearGradient>
        </TouchableOpacity>
    );
}

export default function AccountSettingsScreen() {
    const router = useRouter();

    return (
        <LinearGradient
            colors={["#0e0e11", "#0a0906", "#080808", "#0a0906", "#0b0b0e"]}
            locations={[0, 0.2, 0.5, 0.75, 1]}
            start={{ x: 0.16, y: 0 }}
            end={{ x: 0.84, y: 1 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.safe}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.backBtn}
                    >
                        <Feather name="chevron-left" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Account Settings</Text>
                    <View style={{ width: 36 }} />
                </View>

                <View style={styles.container}>
                    <Row
                        icon={<Feather name="user" size={18} color={ORANGE} />}
                        text="Change Username"
                        path="/Profile/Settings/AccountSettings/change-username"
                    />
                    <Row
                        icon={<MaterialIcons name="email" size={18} color={ORANGE} />}
                        text="Change Email"
                        path="/Profile/Settings/AccountSettings/change-email"
                    />
                    <Row
                        icon={<Feather name="lock" size={18} color={ORANGE} />}
                        text="Update Password"
                        path="/Profile/Settings/AccountSettings/update-password"
                    />
                    <Row
                        icon={<MaterialIcons name="delete" size={18} color={DANGER} />}
                        text="Delete Account"
                        path="/Profile/Settings/AccountSettings/delete-acc"
                        danger
                    />
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(255,255,255,0.05)",
    },
    backBtn: {
        width: 36, height: 36,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.10)",
        borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    headerTitle: {
        color: ORANGE,
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: -0.3,
    },

    container: {
        flex: 1,
        padding: 16,
        paddingTop: 20,
        gap: 10,
    },

    rowWrap: {
        borderRadius: 18,
        overflow: "hidden",
    },
    row: {
        padding: 18,
        borderRadius: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.08)",
        position: "relative",
        overflow: "hidden",
    },
    shine: {
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 1,
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    iconWrap: {
        width: 38, height: 38,
        borderRadius: 11,
        backgroundColor: "rgba(255,122,0,0.12)",
        borderWidth: 0.5,
        borderColor: "rgba(255,122,0,0.25)",
        alignItems: "center", justifyContent: "center",
    },
    iconWrapDanger: {
        backgroundColor: "rgba(255,59,48,0.10)",
        borderColor: "rgba(255,59,48,0.22)",
    },
    text: {
        color: "#f0ede8",
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: -0.2,
    },
    dangerText: {
        color: DANGER,
    },
});
