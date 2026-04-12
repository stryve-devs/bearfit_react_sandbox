import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Dimensions,
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
    interpolate,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const ORANGE = "#FF7825";

export default function MeasurementsScreen() {
    const router = useRouter();
    const [showPicker, setShowPicker] = useState(false);
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const contentOpacity = useSharedValue(1);

    useEffect(() => {
        translateY.value = withTiming(showPicker ? 0 : SCREEN_HEIGHT, {
            duration: 400,
            easing: Easing.bezier(0.33, 1, 0.68, 1),
        });
        contentOpacity.value = withTiming(showPicker ? 0.5 : 1, { duration: 300 });
    }, [showPicker]);

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ scale: interpolate(contentOpacity.value, [0.5, 1], [0.98, 1]) }]
    }));

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>

                {/* HEADER */}
                <View style={styles.header}>
                    <BlurContainer style={styles.iconBtn}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconPress}>
                            <Feather name="chevron-left" size={22} color="#fff" />
                        </TouchableOpacity>
                    </BlurContainer>
                    <Text style={styles.title}>Measurements</Text>
                    <View style={{ width: 44 }} />
                </View>

                <Animated.View style={[styles.content, animatedContentStyle]}>
                    {/* Feature Card */}
                    <BlurContainer style={styles.featureCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardIcon}>
                                <Feather name="user" size={26} color={ORANGE} />
                            </View>
                        </View>

                        <Text style={styles.mainText}>Body Metrics</Text>
                        <Text style={styles.subText}>
                            Tracking your physical progress will be available here soon. We are building a better way to log your journey.
                        </Text>
                    </BlurContainer>

                    {/* Action Buttons */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            activeOpacity={0.8}
                            onPress={() => router.push("/Profile/add-measurement")}
                        >
                            <Text style={styles.primaryBtnText}>+ Add Measurement</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            activeOpacity={0.7}
                            onPress={() => setShowPicker(true)}
                        >
                            <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
                            <Text style={styles.secondaryBtnText}>📷 Add Progress Picture</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </SafeAreaView>

            {/* BOTTOM SHEET */}
            {showPicker && (
                <View style={StyleSheet.absoluteFill}>
                    <TouchableOpacity
                        style={styles.backdrop}
                        activeOpacity={1}
                        onPress={() => setShowPicker(false)}
                    />
                    <Animated.View style={[styles.sheet, sheetStyle]}>
                        <BlurContainer style={styles.sheetInner}>
                            <View style={styles.handle} />
                            <Text style={styles.sheetTitle}>Select Source</Text>

                            <View style={styles.optionRow}>
                                <TouchableOpacity style={styles.optionItem}>
                                    <View style={styles.optionIconBox}>
                                        <Feather name="camera" size={24} color="#fff" />
                                    </View>
                                    <Text style={styles.optionLabel}>Camera</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.optionItem}>
                                    <View style={[styles.optionIconBox, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                                        <Feather name="image" size={24} color="#fff" />
                                    </View>
                                    <Text style={styles.optionLabel}>Gallery</Text>
                                </TouchableOpacity>
                            </View>
                        </BlurContainer>
                    </Animated.View>
                </View>
            )}
        </View>
    );
}

const BlurContainer = ({ children, style }: any) => (
    <View style={[style, { overflow: 'hidden' }]}>
        <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={StyleSheet.absoluteFill} />
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#080808" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    title: { color: ORANGE, fontSize: 18, fontWeight: "700" },
    iconBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    iconPress: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },

    featureCard: {
        borderRadius: 30,
        padding: 28,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.01)",
        marginBottom: 35,
    },
    cardHeader: { marginBottom: 20 },
    cardIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: 'rgba(255, 120, 37, 0.1)', alignItems: 'center', justifyContent: 'center' },
    mainText: { color: "#fff", fontSize: 26, fontWeight: "800", marginBottom: 12 },
    subText: { color: "#888", fontSize: 15, lineHeight: 24, fontWeight: "500" },

    actionSection: { gap: 14 },
    primaryBtn: {
        height: 60,
        backgroundColor: ORANGE,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    secondaryBtn: {
        height: 60,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        overflow: 'hidden'
    },
    secondaryBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },

    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.8)" },
    sheet: { position: 'absolute', bottom: 0, width: "100%", paddingHorizontal: 12, paddingBottom: 30 },
    sheetInner: { borderRadius: 35, padding: 25, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
    handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "center", marginBottom: 20 },
    sheetTitle: { color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 25 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-around', gap: 15 },
    optionItem: { alignItems: 'center', gap: 12, flex: 1 },
    optionIconBox: { width: '100%', height: 75, backgroundColor: ORANGE, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    optionLabel: { color: '#fff', fontSize: 14, fontWeight: '600', opacity: 0.9 }
});