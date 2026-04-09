import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LineChart } from "react-native-chart-kit";

const ORANGE = "#FF7825";
const screenWidth = Dimensions.get("window").width;

/* GLOBAL STORE */
export let GLOBAL_HISTORY: any[] = [];

export default function MeasurementsOverviewScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [history, setHistory] = useState<any[]>([]);
    const [selectedMetric, setSelectedMetric] = useState("Body Weight (kg)");

    useEffect(() => {
        if (params.data) {
            const newEntry = JSON.parse(params.data as string);

            // ✅ FIX: prevent duplicates / replace same date
            const index = GLOBAL_HISTORY.findIndex(
                (item) => item.date === newEntry.date
            );

            if (index !== -1) {
                GLOBAL_HISTORY[index] = newEntry; // replace
            } else {
                GLOBAL_HISTORY.push(newEntry); // add new
            }
        }

        setHistory([...GLOBAL_HISTORY]);
    }, [params.data]);

    const values = history.map(
        (item) => Number(item.measurements[selectedMetric]) || 0
    );

    const groupedMetrics = {
        Body: [
            "Body Weight (kg)",
            "Waist (cm)",
            "Body Fat (%)",
            "Chest (cm)",
        ],
        Arms: [
            "Left Bicep (cm)",
            "Right Bicep (cm)",
            "Left Forearm (cm)",
            "Right Forearm (cm)",
        ],
        Legs: [
            "Left Thigh (cm)",
            "Right Thigh (cm)",
            "Left Calf (cm)",
            "Right Calf (cm)",
        ],
    };

    const formatLabel = (metric: string) => {
        if (metric.includes("Left")) return "L " + metric.split(" ")[1];
        if (metric.includes("Right")) return "R " + metric.split(" ")[1];
        return metric.split(" ")[0];
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/Profile")}>
                        <Feather name="chevron-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Measurements</Text>

                    <TouchableOpacity onPress={() => router.push("/(tabs)/Profile/add-measurement")}>
                        <Feather name="plus" size={24} color={ORANGE} />
                    </TouchableOpacity>
                </View>

                {/* GRAPH */}
                <View style={styles.graphBox}>
                    {values.length > 0 ? (
                        <LineChart
                            data={{
                                labels: history.map((item) =>
                                    new Date(item.date).getDate().toString()
                                ),
                                datasets: [{ data: values }],
                            }}
                            width={screenWidth - 40}
                            height={180}
                            chartConfig={{
                                backgroundColor: "#000",
                                backgroundGradientFrom: "#000",
                                backgroundGradientTo: "#000",
                                decimalPlaces: 1,
                                color: () => ORANGE,
                                labelColor: () => "#666",
                                propsForDots: {
                                    r: "5",
                                    strokeWidth: "2",
                                    stroke: ORANGE,
                                },
                            }}
                            bezier
                            style={{ borderRadius: 16 }}
                        />
                    ) : (
                        <Text style={{ color: "#888" }}>No Data Yet</Text>
                    )}
                </View>

                {/* GROUPED METRICS */}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {Object.entries(groupedMetrics).map(([group, items]) => (
                        <View key={group} style={{ marginTop: 20 }}>
                            <Text style={styles.groupTitle}>{group}</Text>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={{ flexDirection: "row", gap: 10 }}>
                                    {items.map((metric) => (
                                        <TouchableOpacity
                                            key={metric}
                                            style={
                                                selectedMetric === metric
                                                    ? styles.activeTab
                                                    : styles.inactiveTab
                                            }
                                            onPress={() => setSelectedMetric(metric)}
                                        >
                                            <Text
                                                style={
                                                    selectedMetric === metric
                                                        ? styles.activeText
                                                        : styles.inactiveText
                                                }
                                            >
                                                {formatLabel(metric)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    ))}

                    {/* HISTORY */}
                    <Text style={styles.historyTitle}>
                        {formatLabel(selectedMetric)} History
                    </Text>

                    {history.map((item, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.date}>
                                {new Date(item.date).toDateString()}
                            </Text>

                            <Text style={styles.value}>
                                {item.measurements[selectedMetric]}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        paddingHorizontal: 20,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 10,
    },

    title: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },

    graphBox: {
        height: 200,
        borderBottomWidth: 1,
        borderColor: "#222",
        justifyContent: "center",
    },

    groupTitle: {
        color: "#888",
        marginBottom: 10,
        fontSize: 13,
    },

    activeTab: {
        backgroundColor: ORANGE,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        shadowColor: ORANGE,
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 8,
    },

    inactiveTab: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },

    activeText: {
        color: "#fff",
        fontSize: 12,
    },

    inactiveText: {
        color: "#aaa",
        fontSize: 12,
    },

    historyTitle: {
        color: "#888",
        marginTop: 25,
        marginBottom: 10,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderColor: "#222",
    },

    date: {
        color: "#aaa",
    },

    value: {
        color: "#fff",
    },
});