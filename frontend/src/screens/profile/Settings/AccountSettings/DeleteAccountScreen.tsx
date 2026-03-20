import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ORANGE = "#ff7a00";
const DANGER = "#ff3b30";

export default function DeleteAccountScreen() {
    const router = useRouter();

    const handleDelete = () => {
        Alert.alert(
            "Confirm Deactivation",
            "Are you sure you want to deactivate your account? You have 14 days to reactivate before it's permanently deleted.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Deactivate",
                    style: "destructive",
                    onPress: () => router.replace("/onboarding" as any),
                },
            ]
        );
    };

    return (
        <LinearGradient
            colors={["#0e0e11", "#0a0906", "#080808", "#0a0906", "#0b0b0e"]}
            locations={[0, 0.2, 0.5, 0.75, 1]}
            start={{ x: 0.16, y: 0 }}
            end={{ x: 0.84, y: 1 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.safe}>
                <View style={styles.container}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.backBtn}
                        >
                            <Feather name="arrow-left" size={18} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Delete Account</Text>
                        <View style={{ width: 36 }} />
                    </View>

                    {/* Warning card */}
                    <LinearGradient
                        colors={["rgba(255,59,48,0.10)", "rgba(255,59,48,0.04)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.warningCard}
                    >
                        {/* Top shine */}
                        <LinearGradient
                            colors={["transparent", "rgba(255,59,48,0.18)", "transparent"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.shine}
                            pointerEvents="none"
                        />

                        {/* Icon */}
                        <View style={styles.warningIconWrap}>
                            <Feather name="alert-triangle" size={22} color={DANGER} />
                        </View>

                        <Text style={styles.warningTitle}>Warning</Text>
                        <Text style={styles.warningText}>
                            When you choose to deactivate your account, it will remain deactivated for{" "}
                            <Text style={styles.warningBold}>14 days</Text>.
                            During this period you may reactivate your account at any time. If no action is
                            taken within 14 days, the account will be{" "}
                            <Text style={styles.warningBold}>permanently deleted</Text>.
                        </Text>
                    </LinearGradient>

                    {/* Info pills */}
                    <View style={styles.pillRow}>
                        {[
                            { icon: "clock", text: "14-day grace period" },
                            { icon: "shield-off", text: "Data permanently removed" },
                        ].map((item) => (
                            <LinearGradient
                                key={item.text}
                                colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.pill}
                            >
                                <Feather name={item.icon as any} size={13} color="rgba(240,237,232,0.45)" />
                                <Text style={styles.pillText}>{item.text}</Text>
                            </LinearGradient>
                        ))}
                    </View>

                    <View style={{ flex: 1 }} />

                    {/* Deactivate button */}
                    <TouchableOpacity
                        onPress={handleDelete}
                        activeOpacity={0.85}
                        style={styles.dangerBtnWrap}
                    >
                        <LinearGradient
                            colors={["rgba(255,59,48,0.18)", "rgba(255,59,48,0.10)"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.dangerBtn}
                        >
                            <Feather name="trash-2" size={17} color={DANGER} style={{ marginRight: 8 }} />
                            <Text style={styles.dangerBtnText}>Deactivate Account</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Cancel link */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        style={styles.cancelRow}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    container: { flex: 1, padding: 20, paddingBottom: 32 },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
        marginTop: 8,
    },
    backBtn: {
        width: 36, height: 36,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.10)",
        borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    title: {
        color: "#f0ede8",
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: -0.3,
    },

    warningCard: {
        borderRadius: 22,
        padding: 22,
        borderWidth: 0.5,
        borderColor: "rgba(255,59,48,0.22)",
        position: "relative",
        overflow: "hidden",
        marginBottom: 16,
    },
    shine: {
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
    },
    warningIconWrap: {
        width: 44, height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(255,59,48,0.12)",
        borderWidth: 0.5,
        borderColor: "rgba(255,59,48,0.25)",
        alignItems: "center", justifyContent: "center",
        marginBottom: 14,
    },
    warningTitle: {
        color: DANGER,
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: -0.2,
        marginBottom: 10,
    },
    warningText: {
        color: "rgba(240,237,232,0.55)",
        lineHeight: 22,
        fontSize: 14,
    },
    warningBold: {
        color: "rgba(240,237,232,0.85)",
        fontWeight: "600",
    },

    pillRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 24,
    },
    pill: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        padding: 12,
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.07)",
        overflow: "hidden",
    },
    pillText: {
        color: "rgba(240,237,232,0.45)",
        fontSize: 12,
        fontWeight: "500",
    },

    dangerBtnWrap: {
        borderRadius: 30,
        overflow: "hidden",
        borderWidth: 0.5,
        borderColor: "rgba(255,59,48,0.3)",
    },
    dangerBtn: {
        padding: 17,
        borderRadius: 30,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    dangerBtnText: {
        color: DANGER,
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: -0.2,
    },

    cancelRow: {
        alignItems: "center",
        paddingVertical: 16,
    },
    cancelText: {
        color: "rgba(240,237,232,0.35)",
        fontSize: 15,
        fontWeight: "500",
    },
});
