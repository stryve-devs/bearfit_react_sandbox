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
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PADDING = 20;
const ORANGE = "#FF7825";

// Precision Grid Math for 24 columns (makes it look like a sleek digital map)
const BOXES_PER_ROW = 24;
const BOX_MARGIN = 1.2;
const BOX_SIZE = ((SCREEN_WIDTH - (PADDING * 4)) / BOXES_PER_ROW) - (BOX_MARGIN * 2);

const YEARS = [2026, 2027, 2028];

export default function MultiYearViewScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>

                {/* MODERN FLOATING HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
                        <Feather name="arrow-left" size={20} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Longevity</Text>
                        <View style={styles.activeDot} />
                    </View>
                    <TouchableOpacity style={styles.navBtn}>
                        <Feather name="share-2" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {YEARS.map((year, yIdx) => (
                        <Animated.View
                            key={year}
                            entering={FadeInDown.delay(yIdx * 150).duration(600)}
                            style={styles.yearCard}
                        >
                            {/* Top info bar within the year card */}
                            <View style={styles.yearHeader}>
                                <View>
                                    <Text style={styles.yearLabel}>{year}</Text>
                                    <Text style={styles.yearSub}>Yearly Progress</Text>
                                </View>
                                <View style={styles.statPill}>
                                    <Feather name="zap" size={10} color={ORANGE} />
                                    <Text style={styles.statPillText}>84%</Text>
                                </View>
                            </View>

                            <View style={styles.grid}>
                                {Array.from({ length: 365 }).map((_, i) => {
                                    // Simulated high-end activity data
                                    const level = Math.random();
                                    const isActive = level > 0.6;
                                    const isPeak = level > 0.9;

                                    return (
                                        <View
                                            key={i}
                                            style={[
                                                styles.box,
                                                isActive && { backgroundColor: `${ORANGE}30`, borderColor: `${ORANGE}50` },
                                                isPeak && { backgroundColor: ORANGE, borderColor: ORANGE }
                                            ]}
                                        />
                                    );
                                })}
                            </View>

                            {/* Legend / Key at bottom of each card */}
                            <View style={styles.cardFooter}>
                                <Text style={styles.footerText}>Total: 312 Sessions</Text>
                                <View style={styles.levelRow}>
                                    {[0.2, 0.5, 1].map((op, i) => (
                                        <View key={i} style={[styles.miniBox, { opacity: op }]} />
                                    ))}
                                </View>
                            </View>
                        </Animated.View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000", // Deep black for better contrast
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: PADDING,
        paddingVertical: 15,
    },
    navBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    title: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: ORANGE,
    },
    scrollContent: {
        paddingHorizontal: PADDING,
        paddingBottom: 60,
    },
    yearCard: {
        backgroundColor: "rgba(255,255,255,0.02)",
        borderRadius: 24,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        overflow: 'hidden',
    },
    yearHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    yearLabel: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "900",
    },
    yearSub: {
        color: "#555",
        fontSize: 11,
        fontWeight: "700",
        textTransform: 'uppercase',
        marginTop: -2,
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: "rgba(255,120,37,0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,120,37,0.2)",
    },
    statPillText: {
        color: ORANGE,
        fontSize: 12,
        fontWeight: "800",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: 'flex-start',
    },
    box: {
        width: BOX_SIZE,
        height: BOX_SIZE,
        margin: BOX_MARGIN,
        borderRadius: 1.5,
        backgroundColor: "#111", // Darker base for a more professional look
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.03)",
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.03)',
    },
    footerText: {
        color: "#444",
        fontSize: 10,
        fontWeight: "700",
        textTransform: 'uppercase',
    },
    levelRow: {
        flexDirection: 'row',
        gap: 4,
    },
    miniBox: {
        width: 8,
        height: 8,
        borderRadius: 2,
        backgroundColor: ORANGE,
    }
});