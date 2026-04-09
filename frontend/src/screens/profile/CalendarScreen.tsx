import React from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions, TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const ORANGE = "#FF7825";

const days = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];
const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
};

const todayDate = new Date();
const currentMonth = todayDate.getMonth(); // 0–11
const currentYear = todayDate.getFullYear();

const currentMonthDays = Array.from(
    { length: getDaysInMonth(currentMonth, currentYear) },
    (_, i) => i + 1
);

const nextMonth = (currentMonth + 1) % 12;
const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

const nextMonthDays = Array.from(
    { length: getDaysInMonth(nextMonth, nextMonthYear) },
    (_, i) => i + 1
);

const getMonthName = (month) => {
    return new Date(0, month).toLocaleString("default", { month: "long" });
};


export default function CalendarScreen() {
    const [activeModal, setActiveModal] = React.useState<"streak" | "rest" | null>(null);
    const [showPicker, setShowPicker] = React.useState(false);
    const [selectedView, setSelectedView] = React.useState("Month");
    const router = useRouter(); // 👈 MUST HAVE
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth(); // 0 = Jan, 1 = Feb, 2 = March
    return (
        <View style={{ flex: 1, backgroundColor: "#080808" }}>

            {/* 🔥 AMBIENT GLOW */}
            <LinearGradient
                colors={["rgba(255,120,37,0.25)", "transparent"]}
                start={{ x: 0.8, y: 0 }}
                end={{ x: 0.2, y: 0.6 }}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>

                {/* 🔥 HEADER (GLASS BAR) */}
                <View style={styles.headerRow}>
                    <BlurView intensity={60} tint="dark" style={styles.iconBtn}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.iconPress}
                        >
                            <Feather name="chevron-left" size={20} color="#fff" />
                        </TouchableOpacity>
                    </BlurView>

                    <View style={styles.headerCenter}>
                        <TouchableOpacity
                            onPress={() => setShowPicker(true)}
                            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                        >
                            <Text style={styles.monthText}>{selectedView}</Text>
                            <Feather name="chevron-down" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rightIcons}>
                        <BlurView intensity={60} tint="dark" style={styles.iconBtn}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                style={styles.iconPress}
                            >
                                <Feather name="upload" size={18} color="#fff" />
                            </TouchableOpacity>
                        </BlurView>

                        <BlurView intensity={60} tint="dark" style={styles.iconBtn}>
                            <TouchableOpacity
                                onPress={() => router.push("/Profile/first-weekday")}  // 👈 ADD THIS
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                style={styles.iconPress}
                            >
                                <Feather name="sliders" size={18} color="#fff" />
                            </TouchableOpacity>
                        </BlurView>
                    </View>
                </View>




                {/* 🔥 STATS CARDS */}
                <View style={styles.statsRow}>

                    {/* 🔥 STREAK */}
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={0.8}
                        onPress={() => setActiveModal("streak")}
                    >
                        <GlassCard text="0 streak days" icon="🔥" />
                    </TouchableOpacity>

                    {/* 🌙 REST */}
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={0.8}
                        onPress={() => setActiveModal("rest")}
                    >
                        <GlassCard text="0 rest days" icon="🌙" blue />
                    </TouchableOpacity>

                </View>

                {/* DAYS */}
                {/*<View style={styles.daysRow}>
                    {days.map((d) => (
                        <Text key={d} style={styles.dayText}>{d}</Text>
                    ))}
                </View>*/}

                <BlurView intensity={50} tint="dark" style={styles.daysContainer}>
                    {days.map((d) => (
                        <Text key={d} style={styles.dayText}>
                            {d}
                        </Text>
                    ))}
                </BlurView>

                <BlurView intensity={25} tint="dark" style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        <Text style={styles.month}>
                            {getMonthName(currentMonth)} {currentYear}
                        </Text>
                        <View style={styles.grid}>
                            {currentMonthDays.map((d) => (
                                <Day
                                    key={d}
                                    d={d}
                                    today={today}
                                    month={currentMonth}
                                    currentMonth={currentMonth}
                                />
                            ))}
                        </View>

                        <Text style={styles.month}>
                            {getMonthName(nextMonth)} {nextMonthYear}
                        </Text>
                        <View style={styles.grid}>
                            {nextMonthDays.map((d) => (
                                <Day
                                    key={d}
                                    d={d}
                                    today={today}
                                    month={nextMonth}
                                    currentMonth={currentMonth}
                                />
                            ))}
                        </View>

                    </ScrollView>
                </BlurView>

                {/*{showStreakInfo && (
                    <View style={styles.modalOverlay}>

                        <BlurView intensity={80} tint="dark" style={styles.modalCard}>

                            <Text style={styles.modalTitle}>🔥 Streak</Text>

                            <Text style={styles.modalText}>
                                Streak shows you how many weeks in a row,
                                including this week, you have logged at least one workout.
                            </Text>

                            <TouchableOpacity
                                style={styles.modalBtn}
                                onPress={() => setShowStreakInfo(false)}
                            >
                                <Text style={styles.modalBtnText}>Got it</Text>
                            </TouchableOpacity>

                        </BlurView>
                    </View>
                )}*/}

                {activeModal && (
                    <View style={styles.modalOverlay}>

                        <BlurView intensity={80} tint="dark" style={styles.modalCard}>

                            {/* ICON */}
                            <Text style={{ fontSize: 28, marginBottom: 10 }}>
                                {activeModal === "streak" ? "🔥" : "🌙"}
                            </Text>

                            {/* TITLE */}
                            <Text style={styles.modalTitle}>
                                {activeModal === "streak" ? "Streak" : "Rest Days"}
                            </Text>

                            {/* TEXT */}
                            <Text style={styles.modalText}>
                                {activeModal === "streak"
                                    ? "Streak shows you how many weeks in a row, including this week, you have logged at least one workout."
                                    : "Rest shows you the number of days since your last logged workout."}
                            </Text>

                            {/* BUTTON */}
                            <TouchableOpacity
                                style={styles.modalBtn}
                                onPress={() => setActiveModal(null)}
                            >
                                <Text style={styles.modalBtnText}>Got it</Text>
                            </TouchableOpacity>

                        </BlurView>
                    </View>
                )
                }


                {showPicker && (
                    <View style={styles.sheetOverlay}>

                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            onPress={() => setShowPicker(false)}
                        />

                        <BlurView intensity={80} tint="dark" style={styles.sheetContainer}>

                            <View style={styles.handle} />

                            {["Month", "Year", "Multi-year"].map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.sheetCard}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        setSelectedView(item);
                                        setShowPicker(false);

                                        if (item === "Year") {
                                            router.push("/Profile/year-view");
                                        }

                                        if (item === "Multi-year") {
                                            router.push("/Profile/multi-year-view");
                                        }
                                    }}
                                >
                                    <View style={styles.sheetCardContent}>

                                        {/* LEFT ICON (optional but makes it PREMIUM) */}
                                        <View style={styles.sheetIcon}>
                                            <Feather
                                                name={
                                                    item === "Month"
                                                        ? "calendar"
                                                        : item === "Year"
                                                            ? "bar-chart"
                                                            : "layers"
                                                }
                                                size={18}
                                                color="#FF7825"
                                            />
                                        </View>

                                        {/* TEXT */}
                                        <Text style={styles.sheetText}>{item}</Text>

                                        {/* RIGHT CHECK */}
                                        {selectedView === item && (
                                            <Feather name="check" size={20} color="#FF7825" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}

                        </BlurView>
                    </View>
                )}


            </SafeAreaView>
        </View>
    );
}


{/*function GlassCard({ text, blue }: any) {
    return (
        <BlurView intensity={70} tint="dark" style={styles.card}>
            <View style={styles.cardShine} />

            <Text style={{ color: blue ? "#4da6ff" : ORANGE, fontSize: 15, fontWeight: "600" }}>
                {text}
            </Text>
        </BlurView>
    );
}*/}

function GlassCard({ text, icon, blue }: any) {
    return (
        <BlurView intensity={80} tint="dark" style={styles.card}>
            {/* ROW: ICON + TEXT BLOCK */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>

                {/* ICON */}
                <View style={styles.iconCircle}>
                    <Text style={{ fontSize: 18 }}>{icon}</Text>
                </View>

                {/* TEXT COLUMN */}
                <View style={{ marginLeft: 10, flex: 1, justifyContent: "center" }}>

                    {/* TITLE */}
                    <Text
                        style={{
                            color: blue ? "#4da6ff" : "#FF7825",
                            fontSize: 15, // 👈 reduce slightly from 16
                            fontWeight: "700",
                        }}
                    >
                        {text}
                    </Text>

                    {/* SUBTEXT */}
                    <Text style={styles.subText}>
                        {blue
                            ? "Rest & recover nights 🌙"
                            : "Start your momentum ✨"}
                    </Text>

                </View>
            </View>
        </BlurView>
    );
}

function Day({ d, today, month, currentMonth }: any) {
    const router = useRouter();
    const isToday = d === today && month === currentMonth;

    const monthLabel = `${new Date(0, month).toLocaleString("default", {
        month: "long",
    })} ${new Date().getFullYear()}`;

    return (
        <TouchableOpacity
            style={styles.dayWrap}
            activeOpacity={0.8}
            onPress={() =>
                router.push({
                    pathname: "/Profile/day-workout",
                    params: {
                        day: String(d),
                        monthLabel,
                    },
                })
            }
        >
            {isToday ? (
                <View style={styles.glowContainer}>
                    <View style={styles.outerGlow} />

                    <View style={styles.ring}>
                        <LinearGradient
                            colors={["rgba(255,120,37,0.25)", "rgba(255,120,37,0.05)"]}
                            style={styles.inner}
                        >
                            <Text style={styles.todayText}>{d}</Text>
                        </LinearGradient>
                    </View>
                </View>
            ) : (
                <Text style={styles.day}>{d}</Text>
            )}
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    header: {
        margin: 16,
        padding: 16,
        borderRadius: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        color: ORANGE,
        fontSize: 18,
        fontWeight: "700",
    },
    subtitle: {
        color: "#aaa",
        fontSize: 11,
    },
    statsRow: {
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 16,
        marginTop: 14, // 👈 ADD THIS
    },
    card: {
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.045)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
    },
    cardShine: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.14)",
    },

    cardWarmGlow: {
        position: "absolute",
        bottom: -8,
        left: 20,
        right: 20,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,120,37,0.03)",
    },

    daysRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 18,
    },
    dayText: {
        color: "#666",
    },
    month: {
        color: "#fff",
        fontSize: 18,
        margin: 20,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dayWrap: {
        width: width / 7,
        height: 52, // 👈 IMPORTANT (fixed height)
        alignItems: "center",
        paddingVertical: 12,
        justifyContent: "center", // 👈 centers vertically
    },
    day: {
        color: "#aaa",
    },

    /* 🔥 GLOW EFFECT */
    glowWrap: {
        shadowColor: "#FF7825",
        shadowOpacity: 0.35,   // 👈 reduced
        shadowRadius: 12,      // 👈 softer
        shadowOffset: { width: 0, height: 0 },
    },
    today: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: "center",
        justifyContent: "center",
    },
    todayText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },

    glowContainer: {
        alignItems: "center",
        justifyContent: "center",
    },

    outerGlow: {
        position: "absolute",
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "rgba(255,120,37,0.15)",
        shadowColor: "#FF7825",
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
    },

    ring: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1.5,
        borderColor: "rgba(255,120,37,0.6)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },

    inner: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,120,37,0.10)",
    },

    todayText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },

    title: {
        color: "#FF7825",
        fontSize: 18,
        fontWeight: "700",
    },

    subtitle: {
        color: "#aaa",
        fontSize: 11,
    },

    rightIcons: {
        flexDirection: "row",
        gap: 10,
    },

    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },

    headerRow: {
        marginHorizontal: 16,
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
    },

    headerCenter: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    rightIcons: {
        flexDirection: "row",
        gap: 10,
    },

    iconPress: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },


    iconGlass: {
        width: 34,
        height: 34,
        borderRadius: 10,
        overflow: "hidden",

        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",

        alignItems: "center",
        justifyContent: "center",
    },



    cardGlow: {
        position: "absolute",
        bottom: -10,
        left: 20,
        right: 20,
        height: 50,
        borderRadius: 30,
        backgroundColor: "rgba(255,120,37,0.02)",
    },

    iconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10, // 👈 ADD THIS

    },

    subText: {
        color: "#aaa",
        fontSize: 12,
        marginTop: 2,
    },
    dayGlass: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },


    daysContainer: {
        marginHorizontal: 16,
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 18,

        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",

        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    dayText: {
        color: "#888",
        fontSize: 13,
    },

    cardContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 14,
    },

    textBlock: {
        flex: 1,
        justifyContent: "center",
    },



    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalCard: {
        width: "85%",
        padding: 22,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },

    modalTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 10,
    },

    modalText: {
        color: "#ccc",
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 20,
    },

    modalBtn: {
        backgroundColor: "#FF7825", // 🔥 ORANGE (as you wanted)
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
    },

    modalBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },

    monthText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },



    sheetOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },

    sheetContainer: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingBottom: 30,
        paddingTop: 10,
        paddingHorizontal: 16,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderTopWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },

    handle: {
        width: 40,
        height: 5,
        backgroundColor: "#888",
        borderRadius: 10,
        alignSelf: "center",
        marginBottom: 12,
    },

    sheetRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 18,
        borderBottomWidth: 0.5,
        borderColor: "#222",
    },

    sheetText: {
        color: "#fff",
        fontSize: 16,
    },sheetOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },

    sheetContainer: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingBottom: 30,
        paddingTop: 10,
        paddingHorizontal: 16,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderTopWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },

    handle: {
        width: 40,
        height: 5,
        backgroundColor: "#888",
        borderRadius: 10,
        alignSelf: "center",
        marginBottom: 12,
    },

    sheetRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 18,
        borderBottomWidth: 0.5,
        borderColor: "#222",
    },

    sheetText: {
        color: "#fff",
        fontSize: 16,
    },

    sheetCard: {
        borderRadius: 18,
        marginBottom: 12,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    sheetCardContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
    },

    sheetIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: "rgba(255,120,37,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

});