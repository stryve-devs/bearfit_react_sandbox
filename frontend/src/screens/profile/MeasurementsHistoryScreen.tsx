import React, { useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    TextInput,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
    FadeInDown,
    FadeInRight,
    interpolate,
    type SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { LineChart } from "react-native-chart-kit";
import { measurementsService } from "@/api/services/measurements.service";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";

const ORANGE = "#FF7825";
const GREEN = "#57D98D";
const RED = "#FF6B6B";
const SCREEN_WIDTH = Dimensions.get("window").width;
const GALLERY_CARD_WIDTH = SCREEN_WIDTH * 0.66;

type MetricLabel =
    | "Body Weight (kg)"
    | "Waist (cm)"
    | "Body Fat (%)"
    | "Lean Body Mass (kg)"
    | "Chest (cm)"
    | "Shoulder (cm)"
    | "Left Bicep (cm)"
    | "Right Bicep (cm)"
    | "Left Forearm (cm)"
    | "Right Forearm (cm)"
    | "Abdomen (cm)"
    | "Left Thigh (cm)"
    | "Right Thigh (cm)"
    | "Left Calf (cm)"
    | "Right Calf (cm)"
    | "Neck (cm)";

type JourneyEntry = {
    id: string;
    date: string;
    weight: number | null;
    bodyFat: number | null;
    muscleMass: number | null;
    measurements: Record<MetricLabel, number | null>;
    photoUrl: string | null;
};

type ComparisonItem = {
    label: string;
    current: number | null;
    previous: number | null;
    delta: number;
    unit: string;
};

const METRIC_GROUPS: Record<string, MetricLabel[]> = {
    Body: ["Body Weight (kg)", "Waist (cm)", "Body Fat (%)", "Lean Body Mass (kg)", "Chest (cm)"],
    Upper: ["Shoulder (cm)", "Left Bicep (cm)", "Right Bicep (cm)", "Left Forearm (cm)", "Right Forearm (cm)"],
    Core: ["Neck (cm)", "Abdomen (cm)"],
    Lower: ["Left Thigh (cm)", "Right Thigh (cm)", "Left Calf (cm)", "Right Calf (cm)"],
};

const DEFAULT_METRIC: MetricLabel = "Body Weight (kg)";

const EMPTY_MEASUREMENTS: Record<MetricLabel, number | null> = {
    "Body Weight (kg)": null,
    "Waist (cm)": null,
    "Body Fat (%)": null,
    "Lean Body Mass (kg)": null,
    "Chest (cm)": null,
    "Shoulder (cm)": null,
    "Left Bicep (cm)": null,
    "Right Bicep (cm)": null,
    "Left Forearm (cm)": null,
    "Right Forearm (cm)": null,
    "Abdomen (cm)": null,
    "Left Thigh (cm)": null,
    "Right Thigh (cm)": null,
    "Left Calf (cm)": null,
    "Right Calf (cm)": null,
    "Neck (cm)": null,
};

function parseMeasurementValue(value: unknown): number | null {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value.replace(/,/g, ""));
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

function formatMetricLabel(metric: string) {
    if (metric.includes("Left")) return `L ${metric.split(" ")[1]}`;
    if (metric.includes("Right")) return `R ${metric.split(" ")[1]}`;
    return metric.split(" (")[0];
}

function normalizeJourneyEntries(rawHistory: any[]): JourneyEntry[] {
    return [...rawHistory]
        .map((item, index) => {
            const rawMeasurements = item?.measurements || {};
            const measurements = { ...EMPTY_MEASUREMENTS };
            (Object.keys(EMPTY_MEASUREMENTS) as MetricLabel[]).forEach((key) => {
                measurements[key] = parseMeasurementValue(rawMeasurements[key]);
            });

            const date = typeof item?.date === "string" ? item.date : new Date().toISOString();
            return {
                id: `${date}-${index}`,
                date,
                weight: measurements["Body Weight (kg)"],
                bodyFat: measurements["Body Fat (%)"],
                muscleMass: measurements["Lean Body Mass (kg)"],
                measurements,
                photoUrl: typeof item?.entry_image_url === "string" ? item.entry_image_url : null,
            };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function toDayKey(isoDate: string) {
    return new Date(isoDate).toISOString().slice(0, 10);
}

function isWithinPeriod(date: Date, period: "week" | "month" | "year") {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    if (period === "week") start.setDate(now.getDate() - 6);
    if (period === "month") start.setMonth(now.getMonth() - 1);
    if (period === "year") start.setFullYear(now.getFullYear() - 1);
    return date.getTime() >= start.getTime() && date.getTime() <= now.getTime();
}

function buildComparisons(entries: JourneyEntry[]): ComparisonItem[] {
    if (entries.length < 2) return [];
    const first = entries[0];
    const latest = entries[entries.length - 1];
    const avg = (values: Array<number | null>) => {
        const nums = values.filter((value): value is number => value != null);
        if (!nums.length) return null;
        return nums.reduce((sum, value) => sum + value, 0) / nums.length;
    };

    const pairs: Array<{ label: string; current: number | null; previous: number | null; unit: string }> = [
        { label: "Weight", current: latest.weight, previous: first.weight, unit: "kg" },
        { label: "Body Fat", current: latest.bodyFat, previous: first.bodyFat, unit: "%" },
        { label: "Muscle Mass", current: latest.muscleMass, previous: first.muscleMass, unit: "kg" },
        { label: "Chest", current: latest.measurements["Chest (cm)"], previous: first.measurements["Chest (cm)"], unit: "cm" },
        {
            label: "Arms",
            current: avg([latest.measurements["Left Bicep (cm)"], latest.measurements["Right Bicep (cm)"]]),
            previous: avg([first.measurements["Left Bicep (cm)"], first.measurements["Right Bicep (cm)"]]),
            unit: "cm",
        },
        { label: "Waist", current: latest.measurements["Waist (cm)"], previous: first.measurements["Waist (cm)"], unit: "cm" },
        {
            label: "Legs",
            current: avg([latest.measurements["Left Thigh (cm)"], latest.measurements["Right Thigh (cm)"]]),
            previous: avg([first.measurements["Left Thigh (cm)"], first.measurements["Right Thigh (cm)"]]),
            unit: "cm",
        },
    ];

    return pairs
        .filter((item) => item.current != null && item.previous != null)
        .map((item) => ({
            ...item,
            delta: Number(((item.current || 0) - (item.previous || 0)).toFixed(1)),
        }));
}

function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
    return new Date(date).toLocaleDateString("en-US", options || {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatValue(value: number | null, unit: string) {
    if (value == null) return "--";
    return `${value.toFixed(1)}${unit ? ` ${unit}` : ""}`;
}

function JourneyHeader({ entries }: { entries: JourneyEntry[] }) {
    const first = entries[0];
    const latest = entries[entries.length - 1];
    const logs = entries.length;
    const startedLabel = first ? formatDate(first.date, { month: "short", year: "numeric" }) : "today";
    const deltaWeight = latest?.weight != null && first?.weight != null ? latest.weight - first.weight : null;

    return (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.heroCard}>
            <LinearGradient colors={["rgba(255,120,37,0.22)", "rgba(255,120,37,0.03)", "rgba(255,255,255,0.04)"]} style={StyleSheet.absoluteFill} />
            <Text style={styles.heroEyebrow}>Your Journey</Text>
            <Text style={styles.heroTitle}>See how far you've come</Text>
            <Text style={styles.heroSubtitle}>
                {logs > 0
                    ? `${logs} checkpoints since ${startedLabel}. Your story is bigger than any single stat.`
                    : "Start logging to unlock your full transformation story."}
            </Text>

            <View style={styles.heroStatsRow}>
                <View style={styles.heroStatChip}>
                    <Text style={styles.heroStatLabel}>Latest</Text>
                    <Text style={styles.heroStatValue}>{latest ? formatDate(latest.date, { month: "short", day: "numeric" }) : "--"}</Text>
                </View>
                <View style={styles.heroStatChip}>
                    <Text style={styles.heroStatLabel}>Entries</Text>
                    <Text style={styles.heroStatValue}>{logs}</Text>
                </View>
                <View style={styles.heroStatChip}>
                    <Text style={styles.heroStatLabel}>Weight Delta</Text>
                    <Text style={styles.heroStatValue}>
                        {deltaWeight == null ? "--" : `${deltaWeight > 0 ? "+" : ""}${deltaWeight.toFixed(1)} kg`}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
}

function ProgressGraph({
    entries,
    selectedMetric,
    onMetricChange,
}: {
    entries: JourneyEntry[];
    selectedMetric: MetricLabel;
    onMetricChange: (metric: MetricLabel) => void;
}) {
    const filteredEntries = useMemo(
        () => entries.filter((entry) => entry.measurements[selectedMetric] != null),
        [entries, selectedMetric]
    );
    const values = filteredEntries.map((entry) => entry.measurements[selectedMetric] || 0);
    const graphWidth = Math.max(SCREEN_WIDTH - 40, filteredEntries.length * 64);

    return (
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
                <View>
                    <Text style={styles.sectionEyebrow}>Progress Graph</Text>
                    <Text style={styles.sectionTitle}>Your trend arc</Text>
                </View>
                <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>{formatMetricLabel(selectedMetric)}</Text>
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricGroupsWrap}>
                {Object.entries(METRIC_GROUPS).map(([group, items]) => (
                    <View key={group} style={styles.metricGroupBlock}>
                        <Text style={styles.metricGroupTitle}>{group}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricPillsRow}>
                            {items.map((metric) => (
                                <TouchableOpacity
                                    key={metric}
                                    style={[styles.metricPill, selectedMetric === metric && styles.metricPillActive]}
                                    onPress={() => onMetricChange(metric)}
                                >
                                    <Text style={[styles.metricPillText, selectedMetric === metric && styles.metricPillTextActive]}>
                                        {formatMetricLabel(metric)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>

            {filteredEntries.length > 1 ? (
                <Animated.View entering={FadeInRight.delay(180).duration(550)} style={styles.chartShell}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <LineChart
                            data={{
                                labels: filteredEntries.map((entry) =>
                                    new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                ),
                                datasets: [{
                                    data: values,
                                    color: (opacity = 1) => `rgba(255, 120, 37, ${opacity})`,
                                    strokeWidth: 4,
                                }],
                            }}
                            width={graphWidth}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            withShadow
                            withInnerLines={false}
                            withOuterLines={false}
                            transparent
                            style={styles.chart}
                        />
                    </ScrollView>
                </Animated.View>
            ) : (
                <View style={styles.emptyState}>
                    <Feather name="activity" size={24} color="#5f5f5f" />
                    <Text style={styles.emptyStateTitle}>Need at least two check-ins</Text>
                    <Text style={styles.emptyStateText}>Add another measurement to unlock the animated trend line.</Text>
                </View>
            )}
        </Animated.View>
    );
}

function BodyComparisonSection({ comparisons }: { comparisons: ComparisonItem[] }) {
    return (
        <Animated.View entering={FadeInDown.delay(180).duration(520)} style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
                <View>
                    <Text style={styles.sectionEyebrow}>Body Comparison</Text>
                    <Text style={styles.sectionTitle}>What changed most</Text>
                </View>
                <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>Then vs now</Text>
                </View>
            </View>

            {comparisons.length ? (
                <View style={styles.comparisonGrid}>
                    {comparisons.map((item, index) => {
                        const positive = item.delta >= 0;
                        return (
                            <Animated.View
                                entering={FadeInDown.delay(220 + index * 40).duration(420)}
                                key={item.label}
                                style={styles.comparisonCard}
                            >
                                <Text style={styles.comparisonLabel}>{item.label}</Text>
                                <Text style={styles.comparisonCurrent}>{formatValue(item.current, item.unit)}</Text>
                                <Text style={styles.comparisonPrevious}>Started at {formatValue(item.previous, item.unit)}</Text>
                                <View style={[styles.deltaChip, { backgroundColor: positive ? "rgba(87,217,141,0.18)" : "rgba(255,107,107,0.18)" }]}>
                                    <Text style={[styles.deltaText, { color: positive ? GREEN : RED }]}>
                                        {positive ? "+" : ""}{item.delta.toFixed(1)} {item.unit}
                                    </Text>
                                </View>
                            </Animated.View>
                        );
                    })}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Feather name="bar-chart-2" size={24} color="#5f5f5f" />
                    <Text style={styles.emptyStateTitle}>Your comparison will appear here</Text>
                    <Text style={styles.emptyStateText}>Once you have two entries, this section highlights what moved.</Text>
                </View>
            )}
        </Animated.View>
    );
}

function ProgressGallery({ entries }: { entries: JourneyEntry[] }) {
    const [period, setPeriod] = useState<"week" | "month" | "year">("month");
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const photoEntries = useMemo(() => entries.filter((entry) => Boolean(entry.photoUrl)), [entries]);
    const periodEntries = useMemo(
        () => photoEntries.filter((entry) => isWithinPeriod(new Date(entry.date), period)),
        [photoEntries, period]
    );
    const dayGroups = useMemo(() => {
        const map: Record<string, JourneyEntry[]> = {};
        periodEntries.forEach((entry) => {
            const key = toDayKey(entry.date);
            if (!map[key]) map[key] = [];
            map[key].push(entry);
        });
        return Object.entries(map)
            .map(([day, photos]) => ({ day, photos }))
            .sort((a, b) => new Date(b.day).getTime() - new Date(a.day).getTime());
    }, [periodEntries]);
    const selectedGroup = selectedDay ? dayGroups.find((g) => g.day === selectedDay) : undefined;
    const selectedScrollX = useSharedValue(0);
    const onSelectedScroll = useAnimatedScrollHandler((event) => {
        selectedScrollX.value = event.contentOffset.x;
    });

    return (
        <Animated.View entering={FadeInDown.delay(240).duration(540)} style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
                <View>
                    <Text style={styles.sectionEyebrow}>Progress Gallery</Text>
                    <Text style={styles.sectionTitle}>Your wrapped photo recap</Text>
                </View>
                <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>{periodEntries.length} photos</Text>
                </View>
            </View>

            <View style={styles.metricPillsRow}>
                {(["week", "month", "year"] as const).map((value) => (
                    <TouchableOpacity
                        key={value}
                        style={[styles.metricPill, period === value && styles.metricPillActive]}
                        onPress={() => {
                            setPeriod(value);
                            setSelectedDay(null);
                        }}
                    >
                        <Text style={[styles.metricPillText, period === value && styles.metricPillTextActive]}>
                            {value[0].toUpperCase() + value.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {periodEntries.length ? (
                selectedGroup ? (
                    <View>
                        <TouchableOpacity style={styles.dayBackBtn} onPress={() => setSelectedDay(null)}>
                            <Feather name="chevron-left" size={16} color={ORANGE} />
                            <Text style={styles.dayBackText}>Back to dates</Text>
                        </TouchableOpacity>
                        <Text style={styles.dayTitle}>{formatDate(selectedGroup.day, { month: "long", day: "numeric", year: "numeric" })}</Text>
                        <Animated.FlatList
                            data={selectedGroup.photos}
                            keyExtractor={(item, index) => `${item.id}-${index}`}
                            renderItem={({ item, index }) => <ProgressGalleryCard item={item} index={index} scrollX={selectedScrollX} />}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={GALLERY_CARD_WIDTH + 18}
                            decelerationRate="fast"
                            contentContainerStyle={styles.galleryListContent}
                            onScroll={onSelectedScroll}
                            scrollEventThrottle={16}
                        />
                    </View>
                ) : (
                    <View style={styles.comparisonGrid}>
                        {dayGroups.map((group) => (
                            <TouchableOpacity key={group.day} style={styles.comparisonCard} onPress={() => setSelectedDay(group.day)}>
                                <Text style={styles.comparisonLabel}>{formatDate(group.day, { month: "short", day: "numeric" })}</Text>
                                <Text style={styles.comparisonCurrent}>{group.photos.length} photo{group.photos.length > 1 ? "s" : ""}</Text>
                                <Text style={styles.comparisonPrevious}>{formatDate(group.day, { year: "numeric" })}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )
            ) : (
                <View style={styles.emptyState}>
                    <Feather name="image" size={24} color="#5f5f5f" />
                    <Text style={styles.emptyStateTitle}>No progress photos yet</Text>
                    <Text style={styles.emptyStateText}>Add a photo during a measurement log to build your visual recap.</Text>
                </View>
            )}
        </Animated.View>
    );
}

function ProgressGalleryCard({
    item,
    index,
    scrollX,
}: {
    item: JourneyEntry;
    index: number;
    scrollX: SharedValue<number>;
}) {
    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * (GALLERY_CARD_WIDTH + 18),
            index * (GALLERY_CARD_WIDTH + 18),
            (index + 1) * (GALLERY_CARD_WIDTH + 18),
        ];

        return {
            transform: [
                { scale: interpolate(scrollX.value, inputRange, [0.92, 1, 0.92], "clamp") },
                { translateY: interpolate(scrollX.value, inputRange, [12, 0, 12], "clamp") },
            ],
            opacity: interpolate(scrollX.value, inputRange, [0.65, 1, 0.65], "clamp"),
        };
    });

    return (
        <Animated.View style={[styles.galleryCard, animatedStyle]}>
            <Image source={{ uri: item.photoUrl || "" }} style={styles.galleryImage} />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.galleryOverlay} />
            <View style={styles.galleryMeta}>
                <Text style={styles.galleryDate}>{formatDate(item.date, { month: "long", day: "numeric" })}</Text>
                <Text style={styles.galleryStats}>
                    {item.weight != null ? `${item.weight.toFixed(1)} kg` : "Checkpoint"}
                    {item.bodyFat != null ? `  •  ${item.bodyFat.toFixed(1)}% fat` : ""}
                </Text>
            </View>
        </Animated.View>
    );
}

function MeasurementsTimeline({
    item,
    index,
}: {
    item: JourneyEntry;
    index: number;
}) {
    const statItems = [
        { label: "Weight", value: item.weight, unit: "kg" },
        { label: "Body Fat", value: item.bodyFat, unit: "%" },
        { label: "Muscle", value: item.muscleMass, unit: "kg" },
        { label: "Waist", value: item.measurements["Waist (cm)"], unit: "cm" },
    ].filter((stat) => stat.value != null);

    return (
        <Animated.View entering={FadeInDown.delay(280 + index * 45).duration(420)} style={styles.timelineCard}>
            <View style={styles.timelineDateBlock}>
                <Text style={styles.timelineMonth}>{new Date(item.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</Text>
                <Text style={styles.timelineDay}>{new Date(item.date).getDate()}</Text>
                <Text style={styles.timelineYear}>{new Date(item.date).getFullYear()}</Text>
            </View>

            <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Checkpoint {index + 1}</Text>
                <View style={styles.timelineStatsRow}>
                    {statItems.map((stat) => (
                        <View key={stat.label} style={styles.timelineStatChip}>
                            <Text style={styles.timelineStatLabel}>{stat.label}</Text>
                            <Text style={styles.timelineStatValue}>{formatValue(stat.value, stat.unit)}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {item.photoUrl ? (
                <Image source={{ uri: item.photoUrl }} style={styles.timelineThumb} />
            ) : (
                <View style={styles.timelineThumbPlaceholder}>
                    <Feather name="camera" size={18} color="#5d5d5d" />
                </View>
            )}
        </Animated.View>
    );
}

export default function MeasurementsHistoryScreen() {
    const router = useRouter();
    const [selectedMetric, setSelectedMetric] = useState<MetricLabel>(DEFAULT_METRIC);
    const [rawHistory, setRawHistory] = useState<any[]>([]);
    const [timelineFrom, setTimelineFrom] = useState<Date | null>(null);
    const [timelineTo, setTimelineTo] = useState<Date | null>(null);
    const [activePicker, setActivePicker] = useState<"from" | "to" | null>(null);
    const [timelineMode, setTimelineMode] = useState<"range" | "cherry">("range");
    const [stepDaysInput, setStepDaysInput] = useState("1");
    const [selectedDates, setSelectedDates] = useState<string[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await measurementsService.getMeasurements();
                const measurements = Array.isArray(data?.measurements) ? data.measurements : [];
                const mapped = measurements.map((item: any) => ({
                    date: item.measurement_date,
                    entry_image_url: item.entry_image_url,
                    measurements: {
                        "Body Weight (kg)": item.body_weight,
                        "Waist (cm)": item.waist,
                        "Body Fat (%)": item.body_fat,
                        "Lean Body Mass (kg)": item.lean_body_mass,
                        "Neck (cm)": item.neck,
                        "Shoulder (cm)": item.shoulder,
                        "Chest (cm)": item.chest,
                        "Left Bicep (cm)": item.left_bicep,
                        "Right Bicep (cm)": item.right_bicep,
                        "Left Forearm (cm)": item.left_forearm,
                        "Right Forearm (cm)": item.right_forearm,
                        "Abdomen (cm)": item.abdomen,
                        "Left Thigh (cm)": item.left_thigh,
                        "Right Thigh (cm)": item.right_thigh,
                        "Left Calf (cm)": item.left_calf,
                        "Right Calf (cm)": item.right_calf,
                    },
                }));
                setRawHistory(mapped);
            } catch (error) {
                console.warn("Failed to fetch measurements history", error);
                setRawHistory([]);
            }
        };
        load();
    }, []);

    const entries = useMemo(() => normalizeJourneyEntries(rawHistory), [rawHistory]);
    const comparisons = useMemo(() => buildComparisons(entries), [entries]);
    const filteredTimelineEntries = useMemo(() => {
        const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (timelineMode === "cherry") {
            const selected = new Set(selectedDates);
            return sorted.filter((entry) => selected.has(toDayKey(entry.date)));
        }

        if (!timelineFrom || !timelineTo) return entries;
        const fromTime = new Date(timelineFrom).setHours(0, 0, 0, 0);
        const toTime = new Date(timelineTo).setHours(23, 59, 59, 999);
        const withinRange = sorted.filter((entry) => {
            const t = new Date(entry.date).getTime();
            return t >= fromTime && t <= toTime;
        });
        const stepDays = Math.max(1, Number.parseInt(stepDaysInput || "1", 10) || 1);
        if (stepDays <= 1) return withinRange;

        const stepped: JourneyEntry[] = [];
        let lastIncludedTime: number | null = null;
        withinRange.forEach((entry) => {
            const currentTime = new Date(entry.date).getTime();
            if (lastIncludedTime == null) {
                stepped.push(entry);
                lastIncludedTime = currentTime;
                return;
            }
            const diffDays = (currentTime - lastIncludedTime) / (1000 * 60 * 60 * 24);
            if (diffDays >= stepDays) {
                stepped.push(entry);
                lastIncludedTime = currentTime;
            }
        });
        return stepped;
    }, [entries, timelineFrom, timelineTo, timelineMode, selectedDates, stepDaysInput]);

    const availableTimelineDates = useMemo(
        () =>
            Array.from(new Set(entries.map((entry) => toDayKey(entry.date))))
                .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
        [entries]
    );

    useEffect(() => {
        if (!entries.length) return;
        if (timelineFrom && timelineTo) return;
        setTimelineFrom(new Date(entries[0].date));
        setTimelineTo(new Date(entries[entries.length - 1].date));
    }, [entries, timelineFrom, timelineTo]);

    useEffect(() => {
        if (!availableTimelineDates.length) return;
        setSelectedDates((prev) => {
            if (prev.length) return prev.filter((d) => availableTimelineDates.includes(d));
            return [availableTimelineDates[0]];
        });
    }, [availableTimelineDates]);

    const onPickTimelineDate = (event: DateTimePickerEvent, value?: Date) => {
        if (event.type === "dismissed" || !value) {
            setActivePicker(null);
            return;
        }
        if (activePicker === "from") {
            setTimelineFrom(value);
            if (timelineTo && value > timelineTo) setTimelineTo(value);
        }
        if (activePicker === "to") {
            setTimelineTo(value);
            if (timelineFrom && value < timelineFrom) setTimelineFrom(value);
        }
        setActivePicker(null);
    };

    return (
        <View style={styles.screen}>
            <LinearGradient colors={["#040404", "#0C0A08", "#160B05"]} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                        <Feather name="chevron-left" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>View Measurements</Text>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => router.push("/Profile/add-measurement")}>
                        <Feather name="plus" size={20} color={ORANGE} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={filteredTimelineEntries}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => <MeasurementsTimeline item={item} index={index} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={8}
                    maxToRenderPerBatch={8}
                    windowSize={7}
                    ListHeaderComponent={
                        <View>
                            <JourneyHeader entries={entries} />
                            <ProgressGraph entries={entries} selectedMetric={selectedMetric} onMetricChange={setSelectedMetric} />
                            <BodyComparisonSection comparisons={comparisons} />
                            <ProgressGallery entries={entries} />
                            <View style={styles.timelineHeader}>
                                <Text style={styles.sectionEyebrow}>Timeline</Text>
                                <Text style={styles.sectionTitle}>Every checkpoint, in order</Text>
                                <View style={styles.timelineFiltersRow}>
                                    <TouchableOpacity
                                        style={[styles.metricPill, timelineMode === "range" && styles.metricPillActive]}
                                        onPress={() => setTimelineMode("range")}
                                    >
                                        <Text style={[styles.metricPillText, timelineMode === "range" && styles.metricPillTextActive]}>Range + Step</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.metricPill, timelineMode === "cherry" && styles.metricPillActive]}
                                        onPress={() => setTimelineMode("cherry")}
                                    >
                                        <Text style={[styles.metricPillText, timelineMode === "cherry" && styles.metricPillTextActive]}>Cherry Pick</Text>
                                    </TouchableOpacity>
                                </View>
                                {timelineMode === "range" ? (
                                    <>
                                        <View style={styles.timelineFiltersRow}>
                                            <TouchableOpacity style={styles.timelineFilterBtn} onPress={() => setActivePicker("from")}>
                                                <Text style={styles.timelineFilterLabel}>From</Text>
                                                <Text style={styles.timelineFilterValue}>
                                                    {timelineFrom ? formatDate(timelineFrom.toISOString()) : "Select date"}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.timelineFilterBtn} onPress={() => setActivePicker("to")}>
                                                <Text style={styles.timelineFilterLabel}>To</Text>
                                                <Text style={styles.timelineFilterValue}>
                                                    {timelineTo ? formatDate(timelineTo.toISOString()) : "Select date"}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.timelineStepRow}>
                                            <Text style={styles.timelineFilterLabel}>Step (days between checkpoints)</Text>
                                            <TextInput
                                                style={styles.stepInput}
                                                value={stepDaysInput}
                                                onChangeText={setStepDaysInput}
                                                keyboardType="number-pad"
                                                placeholder="1"
                                                placeholderTextColor="#6f6f6f"
                                            />
                                        </View>
                                    </>
                                ) : (
                                    <View style={styles.cherryWrap}>
                                        {availableTimelineDates.map((day) => {
                                            const active = selectedDates.includes(day);
                                            return (
                                                <TouchableOpacity
                                                    key={day}
                                                    style={[styles.metricPill, active && styles.metricPillActive]}
                                                    onPress={() =>
                                                        setSelectedDates((prev) =>
                                                            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                                                        )
                                                    }
                                                >
                                                    <Text style={[styles.metricPillText, active && styles.metricPillTextActive]}>
                                                        {formatDate(day, { month: "short", day: "numeric", year: "numeric" })}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                                {activePicker && timelineMode === "range" ? (
                                    <DateTimePicker
                                        value={activePicker === "from" ? (timelineFrom || new Date()) : (timelineTo || new Date())}
                                        mode="date"
                                        display="default"
                                        onChange={onPickTimelineDate}
                                        maximumDate={new Date()}
                                    />
                                ) : null}
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        entries.length === 0 ? (
                            <View style={styles.emptyJourneyState}>
                                <Feather name="moon" size={28} color="#737373" />
                                <Text style={styles.emptyJourneyTitle}>Your story starts with the first entry</Text>
                                <Text style={styles.emptyJourneyText}>
                                    Add a measurement to unlock the trend graph, comparisons, timeline, and wrapped-style gallery.
                                </Text>
                                <TouchableOpacity style={styles.emptyJourneyBtn} onPress={() => router.push("/Profile/add-measurement")}>
                                    <Text style={styles.emptyJourneyBtnText}>Add Measurement</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Feather name="calendar" size={24} color="#5f5f5f" />
                                <Text style={styles.emptyStateTitle}>No checkpoints in this date range</Text>
                                <Text style={styles.emptyStateText}>Choose different dates to see available checkpoints.</Text>
                            </View>
                        )
                    }
                />
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
    labelColor: (opacity = 1) => `rgba(214, 214, 214, ${opacity})`,
    strokeWidth: 3,
    propsForDots: {
        r: "5",
        strokeWidth: "2",
        stroke: "#170E08",
        fill: ORANGE,
    },
    propsForBackgroundLines: {
        stroke: "rgba(255,255,255,0.08)",
        strokeDasharray: "",
    },
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#050505" },
    safeArea: { flex: 1 },
    header: {
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "rgba(255,255,255,0.04)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
    listContent: { paddingHorizontal: 18, paddingBottom: 48 },
    dayBackBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 10,
        marginBottom: 6,
    },
    dayBackText: { color: ORANGE, fontSize: 13, fontWeight: "700" },
    dayTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 10 },
    heroCard: {
        borderRadius: 30,
        padding: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.03)",
        marginTop: 6,
        marginBottom: 18,
    },
    heroEyebrow: {
        color: "#F6B28B",
        fontSize: 12,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 2,
        marginBottom: 8,
    },
    heroTitle: { color: "#fff", fontSize: 34, lineHeight: 38, fontWeight: "900", maxWidth: "80%" },
    heroSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 21, marginTop: 12, maxWidth: "92%" },
    heroStatsRow: { flexDirection: "row", gap: 10, marginTop: 20 },
    heroStatChip: {
        flex: 1,
        borderRadius: 18,
        backgroundColor: "rgba(0,0,0,0.22)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    heroStatLabel: { color: "#A9A9A9", fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginBottom: 6 },
    heroStatValue: { color: "#fff", fontSize: 14, fontWeight: "800" },
    sectionCard: {
        borderRadius: 28,
        padding: 18,
        backgroundColor: "rgba(255,255,255,0.035)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        marginBottom: 18,
    },
    sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    sectionEyebrow: {
        color: "#B8B8B8",
        fontSize: 11,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 1.4,
        marginBottom: 6,
    },
    sectionTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
    sectionBadge: {
        alignSelf: "flex-start",
        backgroundColor: "rgba(255,120,37,0.12)",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    sectionBadgeText: { color: "#FFB88C", fontSize: 11, fontWeight: "800" },
    metricGroupsWrap: { paddingTop: 18, paddingBottom: 8 },
    metricGroupBlock: { marginRight: 16 },
    metricGroupTitle: { color: "#747474", fontSize: 11, fontWeight: "700", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1.2 },
    metricPillsRow: { gap: 8, paddingRight: 12 },
    metricPill: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    metricPillActive: {
        backgroundColor: ORANGE,
        borderColor: ORANGE,
    },
    metricPillText: { color: "#B4B4B4", fontSize: 12, fontWeight: "700" },
    metricPillTextActive: { color: "#fff" },
    chartShell: {
        marginTop: 8,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: "rgba(0,0,0,0.22)",
    },
    chart: { borderRadius: 22, marginLeft: -6 },
    comparisonGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 18 },
    comparisonCard: {
        width: "48%",
        borderRadius: 20,
        padding: 14,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },
    comparisonLabel: { color: "#A7A7A7", fontSize: 12, fontWeight: "700", marginBottom: 8 },
    comparisonCurrent: { color: "#fff", fontSize: 20, fontWeight: "900", marginBottom: 4 },
    comparisonPrevious: { color: "#7F7F7F", fontSize: 12, fontWeight: "600", marginBottom: 12 },
    deltaChip: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
    deltaText: { fontSize: 12, fontWeight: "800" },
    galleryListContent: { paddingTop: 18, paddingRight: 8 },
    galleryCard: {
        width: GALLERY_CARD_WIDTH,
        height: 250,
        marginRight: 18,
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: "#111",
    },
    galleryImage: { width: "100%", height: "100%" },
    galleryOverlay: { ...StyleSheet.absoluteFillObject },
    galleryMeta: { position: "absolute", left: 18, right: 18, bottom: 18 },
    galleryDate: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 6 },
    galleryStats: { color: "rgba(255,255,255,0.78)", fontSize: 13, fontWeight: "700" },
    timelineHeader: { paddingVertical: 8, marginBottom: 6 },
    timelineFiltersRow: { flexDirection: "row", gap: 10, marginTop: 12 },
    timelineFilterBtn: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    timelineFilterLabel: { color: "#A7A7A7", fontSize: 11, fontWeight: "700", marginBottom: 4, textTransform: "uppercase" },
    timelineFilterValue: { color: "#fff", fontSize: 13, fontWeight: "700" },
    timelineStepRow: {
        marginTop: 10,
        borderRadius: 14,
        padding: 12,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    stepInput: {
        marginTop: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(0,0,0,0.25)",
        color: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        fontWeight: "700",
    },
    cherryWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
    timelineCard: {
        borderRadius: 26,
        padding: 16,
        marginBottom: 14,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    timelineDateBlock: {
        width: 66,
        borderRadius: 18,
        backgroundColor: "rgba(255,120,37,0.12)",
        paddingVertical: 10,
        alignItems: "center",
    },
    timelineMonth: { color: "#FFB88C", fontSize: 10, fontWeight: "800", marginBottom: 4 },
    timelineDay: { color: "#fff", fontSize: 24, fontWeight: "900", lineHeight: 26 },
    timelineYear: { color: "#AFAFAF", fontSize: 11, fontWeight: "700", marginTop: 4 },
    timelineContent: { flex: 1 },
    timelineTitle: { color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 10 },
    timelineStatsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    timelineStatChip: {
        borderRadius: 14,
        backgroundColor: "rgba(0,0,0,0.24)",
        paddingHorizontal: 10,
        paddingVertical: 8,
        minWidth: 82,
    },
    timelineStatLabel: { color: "#9F9F9F", fontSize: 10, fontWeight: "700", marginBottom: 4, textTransform: "uppercase" },
    timelineStatValue: { color: "#fff", fontSize: 12, fontWeight: "800" },
    timelineThumb: { width: 64, height: 64, borderRadius: 18, backgroundColor: "#111" },
    timelineThumbPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.04)",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyState: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.02)",
        paddingVertical: 22,
        paddingHorizontal: 18,
        alignItems: "center",
        marginTop: 16,
    },
    emptyStateTitle: { color: "#E0E0E0", fontSize: 14, fontWeight: "700", marginTop: 12, marginBottom: 4 },
    emptyStateText: { color: "#7C7C7C", fontSize: 12, lineHeight: 18, textAlign: "center" },
    emptyJourneyState: {
        marginTop: 80,
        borderRadius: 28,
        paddingVertical: 30,
        paddingHorizontal: 24,
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.035)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    emptyJourneyTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 14, marginBottom: 8, textAlign: "center" },
    emptyJourneyText: { color: "#9C9C9C", fontSize: 13, lineHeight: 20, textAlign: "center" },
    emptyJourneyBtn: {
        marginTop: 20,
        borderRadius: 18,
        backgroundColor: ORANGE,
        paddingHorizontal: 18,
        paddingVertical: 12,
    },
    emptyJourneyBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});
