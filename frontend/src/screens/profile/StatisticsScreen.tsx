import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

const ORANGE = "#FF7825";

/* ✅ Dynamic date generator */
const generateDates = (num = 14) => {
    const today = new Date();

    return Array.from({ length: num }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (num - 1 - i));

        return {
            day: d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
            date: d.getDate(),
            full: d.toDateString(),
        };
    });
};

export default function StatisticsScreen() {
    const router = useRouter();

    const datesData = generateDates(14);

    const todayIndex = datesData.findIndex(
        (d) => d.full === new Date().toDateString()
    );

    const [selectedDay, setSelectedDay] = React.useState(todayIndex);

    const scrollRef = React.useRef<any>(null);

    React.useEffect(() => {
        if (scrollRef.current && todayIndex !== -1) {
            scrollRef.current.scrollTo({
                x: todayIndex * 60,
                animated: true,
            });
        }
    }, []);

    const glow = useSharedValue(0);

    React.useEffect(() => {
        glow.value = 0;
        glow.value = withTiming(1, { duration: 400 });
    }, [selectedDay]);

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glow.value,
    }));

    return (
        <LinearGradient colors={["#0e0e11", "#080808"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={{ zIndex: 10 }}>
                        <Feather name="chevron-left" size={22} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Statistics</Text>

                    <View style={{ width: 24 }} />
                </View>

                <ScrollView>

                    {/* BODY GRAPH */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Last 7 days body graph
                        </Text>

                        {/* ✅ SCROLLABLE DATES */}
                        <ScrollView
                            ref={scrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={70}
                            decelerationRate="fast"
                            contentContainerStyle={{ paddingHorizontal: 10 }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {datesData.map((item, i) => {
                                    const isActive = i === selectedDay;

                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            onPress={() => setSelectedDay(i)}
                                            activeOpacity={0.8}
                                            style={{ alignItems: "center", marginHorizontal: 6 }}
                                        >
                                            {/* DAY */}
                                            <Text
                                                style={[
                                                    styles.dayText,
                                                    isActive && { color: ORANGE },
                                                ]}
                                            >
                                                {item.day}
                                            </Text>

                                            {/* DATE PILL */}
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
                        </ScrollView>

                        {/* BODY IMAGES */}
                        <View style={styles.bodyRow}>
                            <View style={{ position: "relative" }}>
                                <Image
                                    source={{ uri: "https://i.imgur.com/8Km9tLL.png" }}
                                    style={styles.bodyImg}
                                />
                                <Animated.View
                                    style={[
                                        styles.heatOverlay,
                                        glowStyle,
                                        {
                                            backgroundColor:
                                                selectedDay % 2 === 0
                                                    ? "rgba(255,120,37,0.25)"
                                                    : "rgba(255,120,37,0.15)",
                                        },
                                    ]}
                                />
                            </View>

                            <View style={{ position: "relative" }}>
                                <Image
                                    source={{ uri: "https://i.imgur.com/8Km9tLL.png" }}
                                    style={[
                                        styles.bodyImg,
                                        { transform: [{ scaleX: -1 }] },
                                    ]}
                                />
                                <Animated.View
                                    style={[
                                        styles.heatOverlay,
                                        glowStyle,
                                        {
                                            backgroundColor:
                                                selectedDay % 2 === 0
                                                    ? "rgba(255,120,37,0.25)"
                                                    : "rgba(255,120,37,0.15)",
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    </View>

                    {/* ADVANCED */}
                    <View style={styles.divider}>
                        <Text style={styles.dividerText}>
                            Advanced statistics
                        </Text>
                    </View>

                    {/* LIST */}
                    <View style={styles.list}>

                        <Item
                            icon="chart-pie"
                            title="Muscle distribution (Chart)"
                            sub="Compare your current and previous muscle distributions."
                            route="/(tabs)/Profile/muscle-chart"
                        />

                        <Item
                            icon="human"
                            title="Muscle distribution (Body)"
                            sub="Weekly heat map of muscles worked."
                            route="/(tabs)/Profile/muscle-body"
                        />

                        <Item
                            icon="dumbbell"
                            title="Main exercises"
                            sub="List of exercises you do most often."
                            route="/(tabs)/Profile/main-exercises"
                        />

                        <Item
                            icon="trophy-outline"
                            title="Leaderboard Exercises"
                            sub="List of the leaderboard-eligible exercises."
                            route="/(tabs)/Profile/leaderboard"
                        />

                        <Item
                            icon="file-chart-outline"
                            title="Monthly Report"
                            sub="Recap of your monthly workouts and statistics."
                            route="/(tabs)/Profile/monthly-report"
                        />

                    </View>

                </ScrollView>

            </SafeAreaView>
        </LinearGradient>
    );
}

function Item({ icon, title, sub, pro, route }: any) {
    const router = useRouter();

    return (
        <TouchableOpacity
            style={styles.item}
            activeOpacity={0.8}
            onPress={() => {
                if (route) {
                    router.push(route);
                }
            }}
        >
            <View style={styles.left}>
                <MaterialCommunityIcons
                    name={icon}
                    size={20}
                    color="#ccc"
                    style={{ marginRight: 12 }}
                />

                <View>
                    <Text style={styles.itemTitle}>{title}</Text>
                    <Text style={styles.itemSub}>{sub}</Text>
                </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
                {pro && (
                    <View style={styles.proBadge}>
                        <Text style={styles.proText}>PRO</Text>
                    </View>
                )}
                <Feather name="chevron-right" size={24} color="#777" />
            </View>
        </TouchableOpacity>
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
        color: ORANGE,
        fontSize: 18,
        fontWeight: "600",
    },

    section: {
        paddingHorizontal: 18,
        marginTop: 10,
    },

    sectionTitle: {
        color: "#fff",
        fontSize: 15,
        marginBottom: 12,
    },

    dayBox: {
        backgroundColor: "#1a1a1a",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignItems: "center",
    },

    activeDayBox: {
        borderWidth: 1,
        borderColor: ORANGE,
        backgroundColor: "rgba(255,120,37,0.08)",
    },

    dayText: {
        color: "#888",
        fontSize: 12,
    },

    dateText: {
        color: "#fff",
        fontSize: 14,
        marginTop: 4,
    },

    activeDate: {
        color: ORANGE,
        fontWeight: "700",
    },

    bodyRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },

    bodyImg: {
        width: 120,
        height: 250,
        resizeMode: "contain",
    },

    heatOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.6,
    },

    divider: {
        backgroundColor: "#1a1a1a",
        paddingVertical: 10,
        marginTop: 20,
        paddingHorizontal: 16,
    },

    dividerText: {
        color: "#888",
    },

    list: {
        paddingHorizontal: 16,
    },

    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: "#222",
    },

    left: {
        flexDirection: "row",
        flex: 1,
    },

    itemTitle: {
        color: "#fff",
        fontSize: 15,
    },

    itemSub: {
        color: "#888",
        fontSize: 12,
        marginTop: 4,
    },

    proBadge: {
        backgroundColor: "#FFD700",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 6,
    },

    proText: {
        fontSize: 10,
        fontWeight: "700",
    },

    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
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

});