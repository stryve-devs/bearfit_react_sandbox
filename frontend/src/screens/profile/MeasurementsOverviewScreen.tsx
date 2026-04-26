import React, { useEffect, useState, useMemo } from "react";
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
const { width: screenWidth } = Dimensions.get("window");

export let GLOBAL_HISTORY: any[] = [];

export default function MeasurementsOverviewScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [history, setHistory] = useState<any[]>([]);
    const [selectedMetric, setSelectedMetric] = useState("Body Weight (kg)");

    useEffect(() => {
        if (params.data) {
            try {
                const newEntry = JSON.parse(params.data as string);
                const index = GLOBAL_HISTORY.findIndex(item => item.date === newEntry.date);
                if (index !== -1) GLOBAL_HISTORY[index] = newEntry;
                else GLOBAL_HISTORY.push(newEntry);
            } catch (e) { console.error(e); }
        }

        const filteredAndSorted = [...GLOBAL_HISTORY]
            .filter(item => item.measurements[selectedMetric] && item.measurements[selectedMetric].toString().trim() !== "")
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setHistory(filteredAndSorted);
    }, [params.data, selectedMetric]);

    const values = useMemo(() => history.map(item => Number(item.measurements[selectedMetric]) || 0), [history, selectedMetric]);

    const groupedMetrics = {
        Body: ["Body Weight (kg)", "Waist (cm)", "Body Fat (%)", "Chest (cm)"],
        Arms: ["Left Bicep (cm)", "Right Bicep (cm)", "Left Forearm (cm)", "Right Forearm (cm)"],
        Legs: ["Left Thigh (cm)", "Right Thigh (cm)", "Left Calf (cm)", "Right Calf (cm)"],
    };

    const formatLabel = (metric: string) => {
        if (metric.includes("Left")) return "L " + metric.split(" ")[1];
        if (metric.includes("Right")) return "R " + metric.split(" ")[1];
        return metric.split(" ")[0];
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/Profile")}>
                        <Feather name="chevron-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Measurements</Text>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/Profile/add-measurement")}>
                        <Feather name="plus" size={24} color={ORANGE} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.chartWrapper}>
                        {values.length > 1 ? (
                            <LineChart
                                data={{
                                    // FIXED: Labels now show Date + Month (e.g., 13 Apr)
                                    labels: history.map(item => {
                                        const d = new Date(item.date);
                                        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                                    }),
                                    datasets: [{
                                        data: values,
                                        color: (opacity = 1) => `rgba(255, 120, 37, ${opacity})`,
                                        strokeWidth: 3
                                    }],
                                }}
                                // FIXED: Width slightly reduced to prevent screen clipping
                                width={screenWidth - 20}
                                height={200}
                                chartConfig={chartConfig}
                                bezier
                                withDots={true}
                                withInnerLines={false}
                                withOuterLines={false}
                                withShadow={true}
                                transparent={true}
                                style={styles.chart}
                            />
                        ) : (
                            <View style={styles.emptyChart}>
                                <Feather name="activity" size={30} color="#222" style={{ marginBottom: 10 }} />
                                <Text style={styles.emptyText}>Need 2+ logs for {formatLabel(selectedMetric)} trends</Text>
                            </View>
                        )}
                    </View>

                    {Object.entries(groupedMetrics).map(([group, items]) => (
                        <View key={group} style={styles.metricSection}>
                            <Text style={styles.sectionLabel}>{group}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalGap}>
                                {items.map((metric) => (
                                    <TouchableOpacity
                                        key={metric}
                                        style={[styles.pill, selectedMetric === metric && styles.activePill]}
                                        onPress={() => setSelectedMetric(metric)}
                                    >
                                        <Text style={[styles.pillText, selectedMetric === metric && styles.activePillText]}>
                                            {formatLabel(metric)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    ))}

                    <Text style={[styles.sectionLabel, { marginTop: 45 }]}>History Log</Text>

                    {history.length > 0 ? (
                        history.slice().reverse().map((item, index) => (
                            <View key={index} style={styles.historyCard}>
                                <View style={styles.cardLeft}>
                                    <View style={styles.dateIcon}>
                                        <Text style={styles.dateDay}>{new Date(item.date).getDate()}</Text>
                                        <Text style={styles.dateMonth}>{new Date(item.date).toLocaleString('default', { month: 'short' })}</Text>
                                    </View>
                                    <Text style={styles.cardYear}>{new Date(item.date).getFullYear()}</Text>
                                </View>
                                <View style={styles.cardRight}>
                                    <Text style={styles.cardValue}>{item.measurements[selectedMetric]}</Text>
                                    <Text style={styles.unitText}>{selectedMetric.split('(')[1]?.replace(')', '') || ''}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.noHistoryBox}>
                            <Text style={styles.noHistoryText}>No records found for this metric.</Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const chartConfig = {
    backgroundGradientFrom: "#000",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#000",
    backgroundGradientToOpacity: 0,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 120, 37, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`, // Slightly brighter
    strokeWidth: 3,
    propsForDots: {
        r: "5",
        strokeWidth: "2",
        stroke: "#000",
    },
    propsForBackgroundLines: {
        stroke: "#111",
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", paddingHorizontal: 16 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
    title: { color: "#fff", fontSize: 18, fontWeight: "600" },
    scrollContent: { paddingBottom: 60 },
    chartWrapper: { marginVertical: 15, alignItems: 'center', minHeight: 200 },
    chart: {
        borderRadius: 16,
        paddingRight: 40, // Space for Y-axis labels
        marginLeft: 10,   // Push right so numbers aren't cut off on the left
    },
    emptyChart: {
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#050505',
        width: '100%',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#111',
        borderStyle: 'dashed'
    },
    emptyText: { color: '#444', fontSize: 12, fontWeight: '600' },
    metricSection: { marginTop: 18 },
    sectionLabel: { color: "#444", fontSize: 11, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    horizontalGap: { gap: 10 },
    pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: "#111", borderWidth: 1, borderColor: "#222" },
    activePill: { backgroundColor: ORANGE, borderColor: ORANGE },
    pillText: { color: "#888", fontSize: 12, fontWeight: "700" },
    activePillText: { color: "#fff" },
    historyCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0A0A0A',
        marginTop: 12,
        padding: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#161616',
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dateIcon: { alignItems: 'center', width: 40, backgroundColor: '#111', borderRadius: 10, paddingVertical: 4 },
    dateDay: { color: '#fff', fontSize: 15, fontWeight: '700' },
    dateMonth: { color: ORANGE, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
    cardYear: { color: '#333', fontSize: 13, fontWeight: '600' },
    cardRight: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
    cardValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
    unitText: { color: '#555', fontSize: 11, fontWeight: '600' },
    noHistoryBox: { paddingVertical: 30, alignItems: 'center' },
    noHistoryText: { color: '#222', fontSize: 14, fontWeight: '600' },
});