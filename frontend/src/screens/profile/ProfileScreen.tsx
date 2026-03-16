import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState<
        "Duration" | "Volume" | "Reps"
    >("Duration");

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            {/* ===== TOP USER HEADER ===== */}
            <View style={styles.topHeader}>
                <Text style={styles.topName}>Arthika</Text>

                <View style={styles.topIconRow}>
                    <TouchableOpacity onPress={() => router.push("/Profile/edit-profile")}>
                        <Ionicons name="pencil-outline" size={26} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ marginLeft: 20 }}
                        onPress={() => alert("Share pressed")}
                    >
                        <Ionicons name="share-social-outline" size={26} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ marginLeft: 20 }}
                        onPress={() => router.push('/Profile/Settings')}>
                        <Ionicons name="settings-outline" size={26} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ===== PROFILE INFO SECTION ===== */}
            <View style={styles.profileInfoRow}>
                <Image
                    source={{ uri: "https://i.pravatar.cc/150" }}
                    style={styles.largeAvatar}
                />

                <View style={styles.userInfoColumn}>
                    <Text style={styles.username}>Arthika</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statBlock}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Workouts</Text>
                        </View>

                        <View style={styles.statBlock}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </View>

                        <View style={styles.statBlock}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* ===== GRAPH CARD ===== */}
            <View style={styles.graphCard}>
                <MaterialCommunityIcons name="chart-bar" size={40} color="#aaa" />
                <Text style={styles.noData}>No data yet</Text>
            </View>

            {/* ===== TOGGLE BUTTONS ===== */}
            <View style={styles.toggleRow}>
                {["Duration", "Volume", "Reps"].map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={[
                            styles.toggleButton,
                            selectedTab === item && styles.activeToggle,
                        ]}
                        onPress={() => setSelectedTab(item as any)}
                    >
                        <Text
                            style={[
                                styles.toggleText,
                                selectedTab === item && styles.activeToggleText,
                            ]}
                        >
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ===== DASHBOARD ===== */}
            <Text style={styles.sectionTitle}>Dashboard</Text>

            <View style={styles.dashboardGrid}>
                <DashboardButton
                    icon="chart-line"
                    label="Statistics"
                    onPress={() => alert("Statistics")}
                />

                <DashboardButton
                    icon="dumbbell"
                    label="Exercises"
                    onPress={() => alert("Exercises")}
                />

                <DashboardButton
                    icon="human-male-height"
                    label="Measures"
                    onPress={() => alert("Measures")}
                />

                <DashboardButton
                    icon="calendar"
                    label="Calendar"
                    onPress={() => alert("Calendar")}
                />
            </View>

            {/* ===== WORKOUTS ===== */}
            <Text style={styles.sectionTitle}>Workouts</Text>

            <View style={styles.workoutCard}>
                <MaterialCommunityIcons name="dumbbell" size={40} color="#aaa" />
                <Text style={styles.noWorkout}>No Workout</Text>
            </View>

            <TouchableOpacity
                style={styles.startTracking}
                onPress={() => alert("Start Tracking")}
            >
                <Text style={styles.startText}>Start tracking here</Text>
                <Ionicons name="chevron-down" size={18} color="#FF7825" />
            </TouchableOpacity>
        </ScrollView>
    );
}

function DashboardButton({
                             icon,
                             label,
                             onPress,
                         }: {
    icon: any;
    label: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity style={styles.dashboardButton} onPress={onPress}>
            <MaterialCommunityIcons name={icon} size={22} color="white" />
            <Text style={styles.dashboardText}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        padding: 16,
    },

    /* ===== TOP HEADER ===== */
    topHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    topName: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
    },

    topIconRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    /* ===== PROFILE INFO ===== */
    profileInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },

    largeAvatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginRight: 20,
    },

    userInfoColumn: {
        flex: 1,
    },

    username: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    statBlock: {
        alignItems: "center",
    },

    statNumber: {
        color: "#FF7825",
        fontSize: 16,
        fontWeight: "bold",
    },

    statLabel: {
        color: "#aaa",
        fontSize: 12,
        marginTop: 4,
    },

    graphCard: {
        backgroundColor: "#222",
        borderRadius: 16,
        padding: 30,
        alignItems: "center",
        marginBottom: 20,
    },

    noData: {
        color: "#aaa",
        marginTop: 10,
    },

    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    toggleButton: {
        flex: 1,
        backgroundColor: "#333",
        paddingVertical: 10,
        marginHorizontal: 4,
        borderRadius: 20,
        alignItems: "center",
    },

    activeToggle: {
        backgroundColor: "#FF7825",
    },

    toggleText: {
        color: "#aaa",
    },

    activeToggleText: {
        color: "white",
        fontWeight: "bold",
    },

    sectionTitle: {
        color: "white",
        fontSize: 16,
        marginBottom: 12,
    },

    dashboardGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    dashboardButton: {
        width: "48%",
        backgroundColor: "#222",
        padding: 18,
        borderRadius: 16,
        marginBottom: 14,
        alignItems: "center",
    },

    dashboardText: {
        color: "white",
        marginTop: 6,
    },

    workoutCard: {
        backgroundColor: "#222",
        borderRadius: 16,
        padding: 36,
        alignItems: "center",
    },

    noWorkout: {
        color: "#aaa",
        marginTop: 8,
    },

    startTracking: {
        marginTop: 20,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },

    startText: {
        color: "#FF7825",
        marginRight: 4,
    },
});