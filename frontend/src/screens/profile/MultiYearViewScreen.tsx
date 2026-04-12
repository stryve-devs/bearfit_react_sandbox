import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PADDING = 16;
const AVAILABLE_WIDTH = SCREEN_WIDTH - (PADDING * 2);

// Dynamic Grid Calculation
// We calculate the box size so that a specific number of boxes fit perfectly
// across any screen width (iOS or Android).
const BOX_MARGIN = 1.2;
const BOXES_PER_ROW = 22;
const BOX_SIZE = (AVAILABLE_WIDTH / BOXES_PER_ROW) - (BOX_MARGIN * 2);

const YEARS = [2026, 2027, 2028];

const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
];

export default function MultiYearViewScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>

                {/* HEADER */}
                <View style={styles.header}>
                    <BlurContainer style={styles.iconBtn}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconPress}>
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>
                    </BlurContainer>

                    <Text style={styles.title}>Multi-year</Text>

                    <View style={styles.headerRight}>
                        {/* Sliders removed, Upload moved here */}
                        <BlurContainer style={styles.iconBtn}>
                            <TouchableOpacity style={styles.iconPress}>
                                <Feather name="upload" size={18} color="#fff" />
                            </TouchableOpacity>
                        </BlurContainer>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {YEARS.map((year) => (
                        <View key={year} style={styles.yearBlock}>
                            <Text style={styles.yearText}>{year}</Text>

                            <View style={styles.monthRow}>
                                {months.map((m) => (
                                    <Text key={m} style={styles.monthText}>{m}</Text>
                                ))}
                            </View>

                            <View style={styles.grid}>
                                {Array.from({ length: 365 }).map((_, i) => (
                                    <View key={i} style={styles.box} />
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// Fixed BlurContainer to ensure borders and curves show on Android
const BlurContainer = ({ children, style }: any) => (
    <View style={[style, { overflow: 'hidden' }]}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#080808",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: PADDING,
        paddingVertical: 10,
    },
    headerRight: {
        width: 42, // Matches icon width to keep title centered
        alignItems: 'flex-end',
    },
    title: {
        color: "#FF7825",
        fontSize: 17,
        fontWeight: "700",
    },
    iconBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.03)",
    },
    iconPress: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContent: {
        paddingHorizontal: PADDING,
        paddingBottom: 40,
    },
    yearBlock: {
        marginTop: 20,
    },
    yearText: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 12,
    },
    monthRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    monthText: {
        color: "#666",
        fontSize: 11,
        fontWeight: "600",
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
        backgroundColor: "#1A1A1A", // Visible gray
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.05)",
    },
});