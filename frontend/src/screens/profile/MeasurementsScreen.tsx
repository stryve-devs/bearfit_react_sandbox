import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from "react-native-reanimated";

const ORANGE = "#FF7825";

export default function MeasurementsScreen() {
    const router = useRouter(); // ✅ navigation added

    const [showPicker, setShowPicker] = useState(false);

    const translateY = useSharedValue(400);

    const [showInfoModal, setShowInfoModal] = useState(false);

    useEffect(() => {
        translateY.value = withTiming(showPicker ? 0 : 400, {
            duration: 260,
            easing: Easing.out(Easing.cubic),
        });
    }, [showPicker]);

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <View style={styles.header}>
                    <BlurView intensity={60} tint="dark" style={styles.iconBtn}>
                        <TouchableOpacity onPress={() => router.push("/Profile")}>
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>
                    </BlurView>

                    <Text style={styles.title}>Measurements</Text>

                    <View style={{ width: 42 }} />
                </View>

                {/* BODY */}
                <View style={styles.content}>
                    <Feather name="user" size={60} color="rgba(255,255,255,0.2)" />

                    <Text style={styles.mainText}>Tracking coming soon</Text>

                    <Text style={styles.subText}>
                        Body measurements and progress tracking will be available soon
                    </Text>

                    {/* ✅ ADD MEASUREMENT (FIXED) */}
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => router.push("/Profile/add-measurement")}
                    >
                        <Text style={styles.primaryText}>+ Add Measurement</Text>
                    </TouchableOpacity>

                    {/* ADD PROGRESS */}
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => setShowPicker(true)}
                    >
                        <Text style={styles.secondaryText}>📷 Add Progress Picture</Text>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>

            {/* 🔥 BOTTOM SHEET */}
            <View
                pointerEvents={showPicker ? "auto" : "none"}
                style={[
                    styles.overlay,
                    { opacity: showPicker ? 1 : 0 },
                ]}
            >
                {/* BACKDROP */}
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={() => setShowPicker(false)}
                />

                {/* SHEET */}
                <Animated.View style={[styles.sheet, sheetStyle]}>

                    {Platform.OS === "android" ? (
                        <View style={styles.androidSheet}>
                            {renderOptions()}
                        </View>
                    ) : (
                        <BlurView intensity={90} tint="dark" style={styles.sheetInner}>
                            {renderOptions()}
                        </BlurView>
                    )}

                </Animated.View>
            </View>
        </View>
    );
}

/* 🔥 OPTIONS */
function renderOptions() {
    return (
        <>
            <View style={styles.handle} />

            {/* PRIMARY */}
            <TouchableOpacity style={styles.primaryOption}>
                <Feather name="camera" size={18} color="#fff" />
                <Text style={styles.primaryText}>Take Picture</Text>
            </TouchableOpacity>

            {/* SECONDARY */}
            <TouchableOpacity style={styles.option}>
                <Feather name="image" size={18} color="#fff" />
                <Text style={styles.optionText}>Upload Picture</Text>
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#080808",
        paddingHorizontal: 20,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },

    title: {
        color: ORANGE,
        fontSize: 18,
        fontWeight: "600",
    },

    iconBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },

    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    mainText: {
        color: "#fff",
        fontSize: 18,
        marginTop: 20,
    },

    subText: {
        color: "#aaa",
        textAlign: "center",
        marginVertical: 20,
        paddingHorizontal: 20,
    },

    primaryBtn: {
        width: "80%",
        backgroundColor: ORANGE,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 14,
        marginBottom: 12,
        alignItems: "center",
        justifyContent: "center",
    },

    primaryText: {
        color: "#fff",
        fontWeight: "600",
    },

    secondaryBtn: {
        width: "80%",
        backgroundColor: "rgba(255,255,255,0.08)",
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },

    secondaryText: {
        color: "#ddd",
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.4)",
    },

    sheet: {
        width: "100%",
        paddingHorizontal: 16,
        paddingBottom: 30,
    },

    sheetInner: {
        borderRadius: 28,
        padding: 16,
        backgroundColor: "rgba(20,20,20,0.55)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 20,
    },

    androidSheet: {
        borderRadius: 28,
        padding: 16,
        backgroundColor: "rgba(20,20,20,0.9)",
    },

    handle: {
        width: 40,
        height: 5,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.3)",
        alignSelf: "center",
        marginBottom: 12,
    },

    option: {
        width: "100%",
        height: 56,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,

        borderRadius: 12,

        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    optionText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },

    primaryOption: {
        width: "100%",
        height: 56,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,

        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: "#FF7825", // ✅ THIS IS WHAT YOU WANT
    },

    primaryText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
});