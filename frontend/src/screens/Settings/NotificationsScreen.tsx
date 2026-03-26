import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const accent = "#FF7A00";
const card = "#2A2A2A";

export default function NotificationsScreen() {
    const router = useRouter();

    // GENERAL
    const [restTimer, setRestTimer] = useState(true);
    const [follows, setFollows] = useState(false);
    const [monthlyReport, setMonthlyReport] = useState(true);
    const [subscribeEmails, setSubscribeEmails] = useState(false);

    // LIKES
    const [likesWorkouts, setLikesWorkouts] = useState(true);
    const [likesComments, setLikesComments] = useState(false);

    // COMMENTS
    const [commentsWorkouts, setCommentsWorkouts] = useState(true);
    const [commentReplies, setCommentReplies] = useState(true);
    const [commentMentions, setCommentMentions] = useState(false);
    const [workoutDiscussions, setWorkoutDiscussions] = useState(true);

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="#FF7825" />
                </TouchableOpacity>

                <Text style={styles.title}>Push Notifications</Text>

                <View style={{ width: 26 }} />
            </View>

            <ScrollView>
                {/* GENERAL */}
                <Section title="General" />
                <Tile title="Rest Timer" value={restTimer} onPress={() => setRestTimer(!restTimer)} />
                <Tile title="Follows" value={follows} onPress={() => setFollows(!follows)} />
                <Tile
                    title="Monthly Report"
                    subtitle="Get a notification when your monthly report is ready"
                    value={monthlyReport}
                    onPress={() => setMonthlyReport(!monthlyReport)}
                />
                <Tile
                    title="Subscribe to emails"
                    subtitle="Tips, updates, offers and more"
                    value={subscribeEmails}
                    onPress={() => setSubscribeEmails(!subscribeEmails)}
                />

                {/* LIKES */}
                <Section title="Likes" />
                <Tile title="Likes on your workouts" value={likesWorkouts} onPress={() => setLikesWorkouts(!likesWorkouts)} />
                <Tile title="Likes on your comments" value={likesComments} onPress={() => setLikesComments(!likesComments)} />

                {/* COMMENTS */}
                <Section title="Comments" />
                <Tile
                    title="Comments on workouts"
                    subtitle="Get notified when someone comments"
                    value={commentsWorkouts}
                    onPress={() => setCommentsWorkouts(!commentsWorkouts)}
                />
                <Tile
                    title="Comment Replies"
                    subtitle="When someone replies to you"
                    value={commentReplies}
                    onPress={() => setCommentReplies(!commentReplies)}
                />
                <Tile
                    title="Comment Mentions"
                    subtitle="@mentions in comments"
                    value={commentMentions}
                    onPress={() => setCommentMentions(!commentMentions)}
                />
                <Tile
                    title="Workout Discussions"
                    subtitle="Replies in threads you joined"
                    value={workoutDiscussions}
                    onPress={() => setWorkoutDiscussions(!workoutDiscussions)}
                />

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

/* SECTION */
const Section = ({ title }: any) => (
    <View style={styles.section}>
        <Text style={styles.sectionText}>{title}</Text>
    </View>
);

/* TILE */
const Tile = ({ title, subtitle, value, onPress }: any) => (
    <View style={styles.tile}>
        <View style={{ flex: 1 }}>
            <Text style={styles.tileTitle}>{title}</Text>

            {subtitle && (
                <Text style={styles.subtitle}>{subtitle}</Text>
            )}
        </View>

        <TouchableOpacity onPress={onPress}>
            <CircleSwitch active={value} />
        </TouchableOpacity>
    </View>
);

/* SWITCH */
const CircleSwitch = ({ active }: any) => (
    <View
        style={[
            styles.circle,
            { borderColor: active ? accent : "#aaa" },
        ]}
    >
        {active && <View style={styles.innerCircle} />}
    </View>
);

/* STYLES */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        backgroundColor: "#000",
    },

    title: {
        color: "white",
        fontSize: 20, // 🔥 bigger
        fontWeight: "600",
    },

    section: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },

    sectionText: {
        color: accent,
        fontSize: 16, // 🔥 bigger
        fontWeight: "bold",
    },

    tile: {
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 16,
        borderRadius: 18,
        backgroundColor: card,
        flexDirection: "row",
        alignItems: "flex-start",
    },

    tileTitle: {
        color: "white",
        fontSize: 16, // 🔥 bigger
    },

    subtitle: {
        color: "#aaa",
        fontSize: 13,
        marginTop: 4,
    },

    circle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },

    innerCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: accent,
    },
});