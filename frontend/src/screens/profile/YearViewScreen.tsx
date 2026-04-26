import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PADDING = 20;
const COLUMN_GAP = 12;

// 🔥 REDUCED MONTH BOX SIZE
const GRID_WIDTH = (SCREEN_WIDTH - (PADDING * 2) - COLUMN_GAP) / 2.2;

const ORANGE = "#FF7825";

// 🔥 MORE COLUMNS → SMALLER INNER BOXES
const COLS = 10;
const BOX_MARGIN = 1;
const BOX_SIZE = (GRID_WIDTH - 20 - (BOX_MARGIN * 2 * COLS)) / COLS;

export default function YearViewScreen() {
    const router = useRouter();
    const currentYear = 2026;

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const renderMonth = (monthName, index) => {
        return (
            <Animated.View
                entering={FadeInDown.delay(index * 30).duration(400)}
                key={monthName}
                style={styles.monthCard}
            >
                <View style={styles.monthHeader}>
                    <Text style={styles.monthLabel}>{monthName}</Text>
                    <View style={styles.dot} />
                </View>

                <View style={styles.monthGrid}>
                    {Array.from({ length: 31 }).map((_, i) => {
                        const isActive = Math.random() > 0.7;  // control how many are active

                        return (
                            <View
                                key={i}
                                style={[
                                    styles.box,
                                    isActive
                                        ? {
                                            backgroundColor: `${ORANGE}40`,
                                            borderColor: `${ORANGE}60`
                                        }
                                        : {
                                            backgroundColor: "#2a2a2a",   // gray for inactive
                                            borderColor: "#333"
                                        }
                                ]}
                            />
                        );
                    })}
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={22} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.yearPill}>
                        <Text style={styles.yearPillText}>{currentYear}</Text>
                    </View>

                    <TouchableOpacity style={styles.backBtn}>
                        <Feather name="share-2" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryVal}>184</Text>
                            <Text style={styles.summarySub}>Total Active Days</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryVal}>12</Text>
                            <Text style={styles.summarySub}>Perfect Months</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Activity Map</Text>

                    <View style={styles.yearGrid}>
                        {months.map((name, index) => renderMonth(name, index))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: PADDING,
        paddingVertical: 15,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    yearPill: {
        backgroundColor: "rgba(255,255,255,0.05)",
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    yearPillText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "800",
    },
    scrollContent: { paddingHorizontal: PADDING, paddingBottom: 100 },
    summaryRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 20,
        marginTop: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryVal: { color: '#fff', fontSize: 22, fontWeight: '800' },
    summarySub: { color: '#555', fontSize: 10, fontWeight: '600', marginTop: 4, textTransform: 'uppercase' },
    divider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.05)' },
    sectionTitle: {
        color: '#333',
        fontSize: 12,
        fontWeight: '800',
        marginTop: 30,
        marginBottom: 15,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    yearGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    // 🔥 SMALLER MONTH BOX
    monthCard: {
        width: GRID_WIDTH,
        backgroundColor: "rgba(255,255,255,0.02)",
        borderRadius: 14,
        padding: 10,
        marginBottom: COLUMN_GAP,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.04)",
    },

    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    monthLabel: {
        color: "#888",
        fontSize: 10,
        fontWeight: "800",
        textTransform: 'uppercase'
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: ORANGE,
        opacity: 0.5
    },
    monthGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },

    // 🔥 SMALLER INNER BOXES
    box: {
        width: BOX_SIZE,
        height: BOX_SIZE,
        margin: BOX_MARGIN,
        borderRadius: 1,
        backgroundColor: "#2a2a2a",// fallback color
        borderWidth: 0.5,
        borderColor: `${ORANGE}60`,
    },
});