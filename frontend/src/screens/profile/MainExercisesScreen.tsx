import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ORANGE = "#FF7825";

export default function MainExercisesScreen() {
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    return (
        <LinearGradient colors={["#0e0e11", "#080808"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <View style={styles.header}>

                    {/* BACK BUTTON */}
                    <TouchableOpacity onPress={() => router.back()}>
                        <Feather name="chevron-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Main exercises</Text>

                    {/* HELP BUTTON */}
                    <TouchableOpacity onPress={() => setShowPopup(true)}>
                        <Feather name="help-circle" size={20} color="#fff" />
                    </TouchableOpacity>

                </View>

                {/* FILTER */}
                <TouchableOpacity
                    style={styles.filterBox}
                    onPress={() => setShowFilter(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.filterText}>Last 30 days</Text>
                    <Feather name="chevron-down" size={16} color="#aaa" />
                </TouchableOpacity>

                {/* EMPTY STATE */}
                <View style={styles.empty}>
                    <Feather name="activity" size={40} color="#777" />
                    <Text style={styles.emptyText}>No data yet</Text>
                </View>

                {/* POPUP */}
                <Modal
                    visible={showPopup}
                    transparent
                    animationType="fade"
                >
                    <View style={styles.overlay}>
                        <View style={styles.popup}>

                            {/* ICON */}
                            <View style={styles.popupIcon}>
                                <Feather name="activity" size={28} color="#FF7825" />
                            </View>

                            {/* TITLE */}
                            <Text style={styles.popupTitle}>
                                Main Exercises
                            </Text>

                            {/* TEXT */}
                            <Text style={styles.popupText}>
                                This section shows the exercises you perform most frequently.
                                It helps you understand your workout habits and focus areas.
                            </Text>

                            {/* BUTTON */}
                            <TouchableOpacity
                                onPress={() => setShowPopup(false)}
                                style={styles.closeBtn}
                            >
                                <Text style={styles.closeText}>Got it</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>

                <Modal
                    visible={showFilter}
                    transparent
                    animationType="slide"
                >
                    <TouchableOpacity
                        style={styles.sheetOverlay}
                        activeOpacity={1}
                        onPress={() => setShowFilter(false)}
                    >
                        <View style={styles.sheetContainer}>

                            {/* HANDLE */}
                            <View style={styles.sheetHandle} />

                            {/* CARD ITEMS */}
                            {[
                                { label: "Last 7 days", icon: "calendar" },
                                { label: "Last 30 days", icon: "calendar" },
                                { label: "Last 3 months", icon: "calendar" },
                                { label: "Last year", icon: "calendar" },
                            ].map((item) => (
                                <TouchableOpacity
                                    key={item.label}
                                    style={styles.sheetCard}
                                    activeOpacity={0.85}
                                    onPress={() => setShowFilter(false)}
                                >
                                    <View style={styles.sheetCardContent}>

                                        {/* LEFT ICON */}
                                        <View style={styles.sheetIcon}>
                                            <Feather
                                                name={item.icon}
                                                size={18}
                                                color="#FF7825"
                                            />
                                        </View>

                                        {/* TEXT */}
                                        <Text style={styles.sheetText}>
                                            {item.label}
                                        </Text>

                                        {/* RIGHT ARROW */}
                                        <Feather
                                            name="chevron-right"
                                            size={18}
                                            color="#777"
                                        />
                                    </View>
                                </TouchableOpacity>
                            ))}

                        </View>
                    </TouchableOpacity>
                </Modal>

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },

    title: {
        color: "#FF7825",
        fontSize: 18,
        fontWeight: "600",
        position: "absolute",
        left: 0,
        right: 0,
        textAlign: "center",
        pointerEvents: "none",
    },

    glassBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
    },

    filterBox: {
        marginHorizontal: 16,
        marginTop: 10,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: "#1a1a1a",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
    },

    filterText: {
        color: "#fff",
        fontSize: 14,
    },

    empty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 100,
    },

    emptyText: {
        color: "#aaa",
        marginTop: 10,
        fontSize: 16,
    },

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },

    popup: {
        width: "80%",
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 20,
    },

    popupIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255,120,37,0.1)",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginBottom: 12,
    },

    popupTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
        textAlign: "center",
    },

    popupText: {
        color: "#aaa",
        fontSize: 13,
        lineHeight: 18,
        textAlign: "center",
    },

    closeBtn: {
        marginTop: 16,
        backgroundColor: ORANGE,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },

    closeText: {
        color: "#fff",
        fontWeight: "600",
    },

    sheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },

    sheetContainer: {
        backgroundColor: "#111",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 16,
    },

    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: "#444",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 16,
    },

    sheetCard: {
        borderRadius: 18,
        marginBottom: 12,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    sheetCardContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
    },

    sheetIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: "rgba(255,120,37,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    sheetText: {
        flex: 1,
        color: "#fff",
        fontSize: 15,
    },
});