import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PADDING = 16;
const COLUMN_GAP = 20;
// Calculate width for 2 columns
const GRID_WIDTH = (SCREEN_WIDTH - (PADDING * 2) - COLUMN_GAP) / 2;

export default function YearViewScreen() {
    const router = useRouter();
    const currentYear = 2026;

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const renderMonth = (monthName: string) => {
        return (
            <View key={monthName} style={styles.monthContainer}>
                <Text style={styles.monthLabel}>{monthName}</Text>
                <View style={styles.monthGrid}>
                    {/* Always render exactly 30 boxes */}
                    {Array.from({ length: 30 }).map((_, i) => (
                        <View key={i} style={styles.box} />
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>

                <View style={styles.header}>
                    <BlurContainer style={styles.iconBtn}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconPress}>
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>
                    </BlurContainer>

                    <Text style={styles.title}>Yearly Activity</Text>

                    <View style={styles.headerRight}>
                        <BlurContainer style={styles.iconBtn}>
                            <TouchableOpacity style={styles.iconPress}>
                                <Feather name="upload" size={18} color="#fff" />
                            </TouchableOpacity>
                        </BlurContainer>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.yearText}>{currentYear}</Text>

                    <View style={styles.yearGrid}>
                        {months.map((name) => renderMonth(name))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const BlurContainer = ({ children, style }: any) => (
    <View style={[style, { overflow: 'hidden' }]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
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
        paddingBottom: 10,
    },
    headerRight: { width: 44, alignItems: 'flex-end' },
    title: { color: "#FF7825", fontSize: 16, fontWeight: "700" },
    scrollContent: { paddingHorizontal: PADDING, paddingBottom: 40 },
    yearText: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "800",
        marginTop: 10,
        marginBottom: 8,
    },
    yearGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    monthContainer: {
        width: GRID_WIDTH,
        marginBottom: 12,
    },
    monthLabel: {
        color: "#555",
        fontSize: 11,
        fontWeight: "700",
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    monthGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    box: {
        // Fits 6 columns across for a cleaner 30-count grid (5 rows of 6)
        width: (GRID_WIDTH - 12) / 6,
        aspectRatio: 1,
        margin: 0.8,
        borderRadius: 1.5,
        backgroundColor: "#222",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.05)",
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    iconPress: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});