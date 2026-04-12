import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ORANGE = "#FF7825";

const muscles = [
    "Total","Abs","Abductors","Adductors","Biceps","Calves",
    "Cardio","Chest","Forearms","Full Body","Glutes","Hamstrings",
    "Lats","Lower Back","Neck","Quadriceps","Shoulders","Traps",
    "Triceps","Upper Back","Other"
];

// Dummy data for muscle sets
const muscleData: Record<string, number> = {
    "Total": 48,
    "Abs": 8,
    "Abductors": 4,
    "Adductors": 3,
    "Biceps": 12,
    "Calves": 6,
    "Cardio": 0,
    "Chest": 9,
    "Forearms": 3,
    "Full Body": 0,
    "Glutes": 7,
    "Hamstrings": 5,
    "Lats": 6,
    "Lower Back": 4,
    "Neck": 0,
    "Quadriceps": 8,
    "Shoulders": 7,
    "Traps": 4,
    "Triceps": 10,
    "Upper Back": 5,
    "Other": 1,
};

const generateWeekDates = (offset = 0) => {
    const today = new Date();

    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + offset * 7);

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);

        return {
            day: d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
            date: d.getDate(),
            month: d.toLocaleDateString("en-US", { month: "short" }),
            full: d.toDateString(),
        };
    });
};

export default function BodyDistributionScreen() {
    const router = useRouter();

    const [showInfo, setShowInfo] = React.useState(false);
    const [weekOffset, setWeekOffset] = React.useState(0);

    const datesData = generateWeekDates(weekOffset);

    const [selectedDay, setSelectedDay] = React.useState(0);

    React.useEffect(() => {
        const todayIndex = datesData.findIndex(
            (d) => d.full === new Date().toDateString()
        );
        setSelectedDay(todayIndex !== -1 ? todayIndex : 0);
    }, [weekOffset]);

    const startDate = datesData[0];
    const endDate = datesData[6];

    const handleShare = async () => {
        try {
            const topMuscles = muscles
                .filter(m => muscleData[m] > 0)
                .sort((a, b) => muscleData[b] - muscleData[a])
                .slice(0, 5)
                .map(m => `${m}: ${muscleData[m]} sets`)
                .join("\n");

            await Share.share({
                message: `Check out my body distribution statistics!\n\nBody Distribution - ${startDate.date}–${endDate.date} ${endDate.month}\n\nTop Muscles Worked:\n${topMuscles}\n\nTotal Sets: ${muscleData["Total"]}\n\n💪 HEVY`,
                title: "My Body Distribution",
            });
        } catch (error) {
            console.error("Share failed:", error);
        }
    };

    return (
        <LinearGradient colors={["#0e0e11", "#080808"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Feather name="chevron-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Body distribution</Text>

                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <TouchableOpacity onPress={() => setShowInfo(true)}>
                            <Feather name="help-circle" size={20} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleShare}>
                            <Feather name="share" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.arrowRow}>
                    <TouchableOpacity onPress={() => setWeekOffset(prev => prev - 1)}>
                        <Feather name="chevron-left" size={22} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.weekText}>
                        {startDate.date}–{endDate.date} {endDate.month}
                    </Text>

                    <TouchableOpacity onPress={() => setWeekOffset(prev => prev + 1)}>
                        <Feather name="chevron-right" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* DAY + DATE ROW */}
                <View style={styles.weekRow}>
                    {datesData.map((item, i) => {
                        const isActive = i === selectedDay;

                        return (
                            <TouchableOpacity
                                key={i}
                                onPress={() => setSelectedDay(i)}
                                style={styles.dateItem}
                            >
                                <Text style={[
                                    styles.dayText,
                                    isActive && { color: ORANGE }
                                ]}>
                                    {item.day}
                                </Text>

                                {isActive ? (
                                    <LinearGradient
                                        colors={["#FF7825", "#ff5500"]}
                                        style={styles.activePill}
                                    >
                                        <Text style={styles.activeDateText}>
                                            {item.date}
                                        </Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={styles.inactivePill}>
                                        <Text style={styles.inactiveDateText}>
                                            {item.date}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* MAIN SCROLL */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* BODY */}
                    <View style={styles.bodyImages}>
                        <View style={styles.bodyPlaceholder}/>
                        <View style={styles.bodyPlaceholder}/>
                    </View>

                    {/* TABLE HEADER */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableTitle}>Muscle</Text>
                        <Text style={styles.tableTitle}>Sets</Text>
                    </View>

                    {/* LIST */}
                    {muscles.map((m, i) => (
                        <View key={i} style={styles.row}>
                            <Text style={styles.rowText}>{m}</Text>
                            <Text style={styles.rowValue}>{muscleData[m]}</Text>
                        </View>
                    ))}

                </ScrollView>

                {/* POPUP */}
                <Modal visible={showInfo} transparent animationType="fade">
                    <View style={styles.popupOverlay}>
                        <View style={styles.popup}>
                            <Text style={styles.popupText}>
                                This view shows your muscle usage distribution.
                            </Text>

                            <TouchableOpacity
                                style={styles.popupBtn}
                                onPress={() => setShowInfo(false)}
                            >
                                <Text style={styles.popupBtnText}>Ok</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    },

    arrowRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginTop: 10,
    },

    weekText: {
        color: "#FF7825",
        fontSize: 16,
        fontWeight: "600",
    },

    weekRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        //marginTop: 8,
    },

    dateItem: {
        alignItems: "center",
        flex: 1,
    },

    dayText: {
        color: "#888",
        fontSize: 12,
    },

    activePill: {
        marginTop: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        minWidth: 40,
        alignItems: "center",
    },

    inactivePill: {
        marginTop: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        minWidth: 40,
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
    },

    activeDateText: {
        color: "#fff",
        fontWeight: "700",
    },

    inactiveDateText: {
        color: "#aaa",
    },

    bodyImages: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 20,
        marginBottom: 10,
    },

    bodyPlaceholder: {
        width: 120,
        height: 200,
        backgroundColor: "#111",
        borderRadius: 12,
    },

    tableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#1a1a1a",
    },

    tableTitle: {
        color: "#aaa",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: "#222",
    },

    rowText: {
        color: "#fff",
    },

    rowValue: {
        color: "#aaa",
    },

    popupOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },

    popup: {
        width: "85%",
        backgroundColor: "#1c1c1e",
        borderRadius: 18,
        padding: 20,
    },

    popupText: {
        color: "#fff",
        textAlign: "center",
        marginBottom: 20,
    },

    popupBtn: {
        backgroundColor: "#FF7825",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },

    popupBtnText: {
        color: "#fff",
        fontWeight: "600",
    },
});