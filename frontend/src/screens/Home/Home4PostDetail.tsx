import React, { useMemo, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// --------------------
// Types
// --------------------
type Athlete = {
    name: string;
    username: string;
    avatarUrl: string;
};

type Post = {
    id: string;
    caption: string;
    imageUrl: string;
    comments: string[];
    athlete: Athlete;
};

// --------------------
// Theme
// --------------------
const ORANGE = "#FF7825";
const BG = "#000000";
const CARD_BG = "#121212";
const TILE_BG = "#1A1A1A";
const GREY = "#B0B0B0";
const WHITE = "#FFFFFF";
const BORDER = "#222222";
const PLACEHOLDER = "#2A2A2A";
const MENU_ITEM_BG = "#7A7A7A";

const FONT = "CalSans";
const IS_ANDROID = Platform.OS === "android";

// --------------------
// Demo data
// --------------------
function makeMockPosts(): Post[] {
    const athletes: Athlete[] = [
        { name: "Alex Rivera", username: "alexfit", avatarUrl: "https://i.pravatar.cc/150?img=12" },
        { name: "Morgan Lee", username: "morganlifts", avatarUrl: "https://i.pravatar.cc/150?img=32" },
        { name: "Noah Khan", username: "noahrun", avatarUrl: "https://i.pravatar.cc/150?img=56" },
    ];

    const images = [
        "https://picsum.photos/800/800?random=41",
        "https://picsum.photos/800/800?random=42",
        "https://picsum.photos/800/800?random=43",
        "https://picsum.photos/800/800?random=44",
    ];

    const caps = [
        "Push day routine with progressive overload.",
        "Core + endurance session. Feeling great!",
        "Chest + triceps burn. Consistency > motivation.",
    ];

    return Array.from({ length: 8 }).map((_, i) => {
        const a = athletes[i % athletes.length];
        return {
            id: `p-${i + 1}`,
            caption: caps[i % caps.length],
            imageUrl: images[i % images.length],
            comments: i % 2 === 0 ? ["Nice!", "🔥🔥", "Great form"] : [],
            athlete: a,
        };
    });
}

// --------------------
// Component
// --------------------
export default function Home4PostDetail() {
    const params = useLocalSearchParams<{ postId?: string }>();

    const posts = useMemo(() => makeMockPosts(), []);
    const post = useMemo(() => {
        const found = posts.find((p) => p.id === params?.postId);
        return found ?? posts[0];
    }, [posts, params?.postId]);

    const [isLiked, setIsLiked] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);

    const [moreOpen, setMoreOpen] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [workoutOpen, setWorkoutOpen] = useState(false);

    const [commentText, setCommentText] = useState("");

    const [workoutData, setWorkoutData] = useState<{
        title: string;
        primary: string;
        secondary: string;
        equipment: string;
        steps: string[];
    } | null>(null);

    const openProfile = () => {
        router.push("/(tabs)/profile");
    };

    const relativeTimeLabel = () => "3 days ago";

    const sharePost = async () => {
        try {
            const Clipboard = await import("expo-clipboard");
            const text = `BearFit Workout\n@${post.athlete.username}\n${post.caption}`;
            await Clipboard.setStringAsync(text);
            Alert.alert("Copied share text to clipboard ✅");
        } catch {
            Alert.alert("Share", "Copied share text ✅ (Install expo-clipboard for real copy)");
        }
    };

    const showWorkoutPopup = (data: {
        title: string;
        primary: string;
        secondary: string;
        equipment: string;
        steps: string[];
    }) => {
        setWorkoutData(data);
        setWorkoutOpen(true);
    };

    const openFullImage = () => {
        router.push({
            pathname: "/(tabs)/home/full-image",
            params: { imageUrl: post.imageUrl },
        });
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            {/* AppBar */}
            <View style={styles.appbar}>
                <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={IS_ANDROID ? 20 : 22} color={WHITE} />
                </Pressable>

                <Text allowFontScaling={false} style={styles.appbarTitle}>Workout Routine</Text>

                <Pressable onPress={() => setMoreOpen(true)} style={styles.iconBtn}>
                    <Ionicons name="ellipsis-horizontal" size={IS_ANDROID ? 20 : 22} color={WHITE} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <Pressable onPress={openProfile} style={styles.avatarWrap}>
                            <Image source={{ uri: post.athlete.avatarUrl }} style={styles.avatar} />
                        </Pressable>

                        <Pressable onPress={openProfile} style={{ flex: 1 }}>
                            <Text allowFontScaling={false} style={styles.username}>@{post.athlete.username}</Text>
                            <Text allowFontScaling={false} style={styles.time}>{relativeTimeLabel()}</Text>
                        </Pressable>

                        <Pressable onPress={() => setIsFollowed((v) => !v)} style={styles.followLink}>
                            <Text allowFontScaling={false} style={styles.followLinkText}>
                                {isFollowed ? "Followed" : "+ Follow"}
                            </Text>
                        </Pressable>
                    </View>

                    <Text allowFontScaling={false} style={styles.caption}>{post.caption}</Text>

                    <View style={{ height: IS_ANDROID ? 8 : 10 }} />

                    <View style={styles.statsRow}>
                        <MiniStat label="Time" value="1h 25min" />
                        <MiniStat label="Weight taken" value="400 kgs" />
                        <MiniStat label="Distance" value="4.5 km" />
                    </View>

                    <View style={{ height: IS_ANDROID ? 8 : 10 }} />

                    <Pressable onPress={openFullImage} style={styles.imageWrap}>
                        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                    </Pressable>

                    <View style={{ height: IS_ANDROID ? 10 : 12 }} />

                    <View style={styles.actionsRow}>
                        <Pressable onPress={() => setIsLiked((v) => !v)} style={styles.actionIcon}>
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={IS_ANDROID ? 20 : 22}
                                color={isLiked ? ORANGE : "#E6E6E6"}
                            />
                        </Pressable>
                        <Text allowFontScaling={false} style={styles.actionCount}>100</Text>

                        <View style={{ width: IS_ANDROID ? 10 : 14 }} />

                        <Pressable onPress={() => setCommentsOpen(true)} style={styles.actionIcon}>
                            <Ionicons name="chatbubble-outline" size={IS_ANDROID ? 19 : 21} color="#E6E6E6" />
                        </Pressable>
                        <Text allowFontScaling={false} style={styles.actionCount}>10</Text>

                        <View style={{ flex: 1 }} />

                        <Pressable onPress={sharePost} style={styles.actionIcon}>
                            <Ionicons name="share-outline" size={IS_ANDROID ? 19 : 21} color="#E6E6E6" />
                        </Pressable>
                    </View>

                    <View style={styles.likedRow}>
                        <Image source={{ uri: post.athlete.avatarUrl }} style={styles.smallAvatar} />
                        <Text allowFontScaling={false} style={styles.likedText} numberOfLines={1}>
                            Liked by {post.athlete.username} and others
                        </Text>
                    </View>

                    <View style={{ height: IS_ANDROID ? 10 : 12 }} />

                    <Text allowFontScaling={false} style={styles.sectionHeader}>Muscle Split</Text>
                    <View style={{ height: 10 }} />
                    <SplitBar label="Arms" value={0.35} />
                    <View style={{ height: 8 }} />
                    <SplitBar label="Core" value={0.15} />
                    <View style={{ height: 8 }} />
                    <SplitBar label="Shoulders" value={0.5} />
                </View>

                <View style={{ height: 12 }} />

                <WorkoutBlock
                    title="Bench Press (Barbell)"
                    subtitle="10Kg • 15 reps"
                    sets={["10Kg • 15 reps", "10Kg • 15 reps", "10Kg • 15 reps"]}
                    onTap={() =>
                        showWorkoutPopup({
                            title: "Bench Press (Barbell)",
                            primary: "Chest",
                            secondary: "Shoulders, Triceps",
                            equipment: "Barbell",
                            steps: [
                                "Lie down on the bench with your eyes under the bar.",
                                "Hold the bar slightly wider than shoulder width.",
                                "Unrack the bar and lower it slowly to your chest.",
                                "Press the bar up with control.",
                                "Repeat for the required reps.",
                            ],
                        })
                    }
                />

                <View style={{ height: 10 }} />

                <WorkoutBlock
                    title="Back Extension (Hyperextension)"
                    subtitle="10 reps"
                    sets={["10 reps", "10 reps"]}
                    onTap={() =>
                        showWorkoutPopup({
                            title: "Back Extension (Hyperextension)",
                            primary: "Core",
                            secondary: "Shoulders, Triceps",
                            equipment: "Dumbbell",
                            steps: [
                                "Set yourself on the hyperextension bench safely.",
                                "Keep spine neutral and core engaged.",
                                "Lower your torso slowly with control.",
                                "Raise back up using your lower back muscles.",
                                "Repeat without jerking.",
                            ],
                        })
                    }
                />

                <View style={{ height: 10 }} />

                <WorkoutBlock
                    title="Parallel Bars"
                    subtitle="12 reps"
                    sets={["12 reps", "12 reps"]}
                    onTap={() =>
                        showWorkoutPopup({
                            title: "Knee Raise Parallel Bars",
                            primary: "Core",
                            secondary: "Shoulders, Triceps",
                            equipment: "Dumbbell",
                            steps: [
                                "Support yourself on the bars with arms locked.",
                                "Lift knees towards chest slowly.",
                                "Lower legs back down with control.",
                                "Avoid swinging your body.",
                                "Repeat for reps.",
                            ],
                        })
                    }
                />
            </ScrollView>

            {/* More Menu Bottom Sheet */}
            <Modal visible={moreOpen} transparent animationType="fade">
                <Pressable style={styles.backdrop} onPress={() => setMoreOpen(false)} />
                <View style={styles.sheet}>
                    <SheetItem
                        title="Save As Routine"
                        onTap={() => {
                            setMoreOpen(false);
                            Alert.alert("Saved as routine ✅");
                        }}
                    />
                    <View style={{ height: 10 }} />
                    <SheetItem
                        title="Copy Workout"
                        onTap={async () => {
                            setMoreOpen(false);
                            try {
                                const Clipboard = await import("expo-clipboard");
                                const text = `Workout copied from @${post.athlete.username}\n${post.caption}`;
                                await Clipboard.setStringAsync(text);
                                Alert.alert("Workout copied ✅");
                            } catch {
                                Alert.alert("Workout copied ✅");
                            }
                        }}
                    />
                    <View style={{ height: 10 }} />
                    <SheetItem
                        title="Report Workout"
                        onTap={() => {
                            setMoreOpen(false);
                            Alert.alert("Reported. Thank you ✅");
                        }}
                    />
                </View>
            </Modal>

            {/* Comments Bottom Sheet */}
            <Modal visible={commentsOpen} transparent animationType="fade">
                <Pressable style={styles.backdrop} onPress={() => setCommentsOpen(false)} />
                <View style={styles.commentsSheet}>
                    <Text allowFontScaling={false} style={styles.sheetTitle}>Comments</Text>
                    <View style={{ height: 10 }} />

                    {post.comments.length === 0 ? (
                        <View style={styles.emptyCenter}>
                            <Text allowFontScaling={false} style={styles.emptyText}>No comments yet</Text>
                        </View>
                    ) : (
                        <ScrollView style={{ maxHeight: IS_ANDROID ? 220 : 260 }} showsVerticalScrollIndicator={false}>
                            {post.comments.map((c, idx) => (
                                <View key={`${idx}-${c}`} style={styles.commentRow}>
                                    <Text allowFontScaling={false} style={styles.commentText}>{c}</Text>
                                    <View style={styles.commentDivider} />
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <View style={{ height: 8 }} />

                    <View style={styles.commentInputRow}>
                        <TextInput
                            value={commentText}
                            onChangeText={setCommentText}
                            placeholder="Add a comment..."
                            placeholderTextColor="#888"
                            style={styles.commentInput}
                            allowFontScaling={false}
                        />
                        <View style={{ width: 10 }} />
                        <Pressable
                            onPress={() => {
                                setCommentsOpen(false);
                                setCommentText("");
                            }}
                            style={styles.sendBtn}
                        >
                            <Text allowFontScaling={false} style={styles.sendText}>Send</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Workout Popup */}
            <Modal visible={workoutOpen} transparent animationType="fade">
                <Pressable style={styles.backdrop} onPress={() => setWorkoutOpen(false)} />
                <View style={styles.popup}>
                    <View style={styles.popupCard}>
                        <Text allowFontScaling={false} style={styles.popupTitle}>{workoutData?.title ?? ""}</Text>

                        <View style={{ height: 10 }} />

                        <InfoRow label="Primary" value={workoutData?.primary ?? ""} />
                        <InfoRow label="Secondary" value={workoutData?.secondary ?? ""} />
                        <InfoRow label="Equipment" value={workoutData?.equipment ?? ""} />

                        <View style={{ height: 12 }} />
                        <Text allowFontScaling={false} style={styles.popupSub}>Steps</Text>
                        <View style={{ height: 8 }} />

                        <ScrollView style={{ maxHeight: IS_ANDROID ? 180 : 220 }} showsVerticalScrollIndicator={false}>
                            {(workoutData?.steps ?? []).map((s, i) => (
                                <Text allowFontScaling={false} key={i} style={styles.step}>
                                    {i + 1}. {s}
                                </Text>
                            ))}
                        </ScrollView>

                        <View style={{ height: 12 }} />
                        <Pressable onPress={() => setWorkoutOpen(false)} style={styles.popupBtn}>
                            <Text allowFontScaling={false} style={styles.popupBtnText}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// -------------------- Small components --------------------
function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ flex: 1 }}>
            <Text allowFontScaling={false} style={styles.statLabel}>{label}</Text>
            <Text allowFontScaling={false} style={styles.statValue}>{value}</Text>
        </View>
    );
}

function SplitBar({ label, value }: { label: string; value: number }) {
    return (
        <View style={styles.splitRow}>
            <View style={{ width: IS_ANDROID ? 80 : 90 }}>
                <Text allowFontScaling={false} style={styles.splitLabel}>{label}</Text>
            </View>

            <View style={styles.splitTrack}>
                <View style={[styles.splitFill, { width: `${Math.round(value * 100)}%` }]} />
            </View>

            <View style={{ width: IS_ANDROID ? 38 : 42, alignItems: "flex-end" }}>
                <Text allowFontScaling={false} style={styles.splitPct}>{Math.round(value * 100)}%</Text>
            </View>
        </View>
    );
}

function WorkoutBlock({
                          title,
                          subtitle,
                          sets,
                          onTap,
                      }: {
    title: string;
    subtitle: string;
    sets: string[];
    onTap: () => void;
}) {
    return (
        <Pressable onPress={onTap} style={styles.blockCard}>
            <Text allowFontScaling={false} style={styles.blockTitle}>{title}</Text>
            <Text allowFontScaling={false} style={styles.blockSub}>{subtitle}</Text>

            <View style={{ height: 10 }} />

            {sets.map((s, i) => (
                <View key={`${i}-${s}`} style={[styles.setTile, i !== 0 && { marginTop: 8 }]}>
                    <View style={styles.setNum}>
                        <Text allowFontScaling={false} style={styles.setNumText}>{i + 1}</Text>
                    </View>
                    <View style={{ width: 10 }} />
                    <Text allowFontScaling={false} style={styles.setText}>{s}</Text>
                </View>
            ))}
        </Pressable>
    );
}

function SheetItem({ title, onTap }: { title: string; onTap: () => void }) {
    return (
        <Pressable onPress={onTap} style={styles.sheetItem}>
            <Text allowFontScaling={false} style={styles.sheetItemText}>{title}</Text>
        </Pressable>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text allowFontScaling={false} style={styles.infoLabel}>{label}</Text>
            <Text allowFontScaling={false} style={styles.infoValue}>{value}</Text>
        </View>
    );
}

// -------------------- Styles --------------------
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },

    appbar: {
        height: IS_ANDROID ? 52 : 56,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#141414",
    },
    iconBtn: {
        width: IS_ANDROID ? 40 : 44,
        height: IS_ANDROID ? 40 : 44,
        alignItems: "center",
        justifyContent: "center"
    },
    appbarTitle: {
        color: WHITE,
        fontSize: IS_ANDROID ? 15 : 16,
        fontFamily: FONT
    },

    body: { padding: 12, paddingBottom: 18 },

    card: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: IS_ANDROID ? 10 : 12,
        borderWidth: 1,
        borderColor: "#1F1F1F",
    },

    headerRow: { flexDirection: "row", alignItems: "center" },
    avatarWrap: {
        width: IS_ANDROID ? 38 : 42,
        height: IS_ANDROID ? 38 : 42,
        borderRadius: IS_ANDROID ? 19 : 21,
        overflow: "hidden",
        marginRight: 10
    },
    avatar: {
        width: IS_ANDROID ? 38 : 42,
        height: IS_ANDROID ? 38 : 42,
        backgroundColor: PLACEHOLDER,
        borderRadius: IS_ANDROID ? 19 : 21
    },

    username: { color: WHITE, fontWeight: "700", fontFamily: FONT, fontSize: IS_ANDROID ? 13 : 14 },
    time: { color: GREY, fontSize: IS_ANDROID ? 10 : 11, marginTop: 2, fontFamily: FONT },

    followLink: { paddingHorizontal: 10, paddingVertical: 6 },
    followLinkText: { color: ORANGE, fontWeight: "700", fontFamily: FONT, fontSize: IS_ANDROID ? 13 : 14 },

    caption: { color: "#E6E6E6", marginTop: 8, fontFamily: FONT, fontSize: IS_ANDROID ? 13 : 14 },

    statsRow: { flexDirection: "row", gap: IS_ANDROID ? 8 : 12 },

    statLabel: { color: GREY, fontSize: IS_ANDROID ? 11 : 12, fontFamily: FONT },
    statValue: { color: WHITE, fontWeight: "700", marginTop: 2, fontFamily: FONT, fontSize: IS_ANDROID ? 12 : 13 },

    imageWrap: { borderRadius: 14, overflow: "hidden" },
    postImage: {
        width: "100%",
        height: IS_ANDROID ? 240 : 280,
        backgroundColor: PLACEHOLDER
    },

    actionsRow: { flexDirection: "row", alignItems: "center" },
    actionIcon: {
        width: IS_ANDROID ? 36 : 40,
        height: IS_ANDROID ? 36 : 40,
        alignItems: "center",
        justifyContent: "center"
    },
    actionCount: { color: "#E6E6E6", fontFamily: FONT, fontSize: IS_ANDROID ? 13 : 14 },

    likedRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
    smallAvatar: {
        width: IS_ANDROID ? 18 : 20,
        height: IS_ANDROID ? 18 : 20,
        borderRadius: IS_ANDROID ? 9 : 10,
        backgroundColor: PLACEHOLDER,
        marginLeft: 6
    },
    likedText: {
        color: GREY,
        fontSize: IS_ANDROID ? 11 : 12,
        marginLeft: 8,
        flex: 1,
        fontFamily: FONT
    },

    sectionHeader: { color: WHITE, fontWeight: "700", fontFamily: FONT, fontSize: IS_ANDROID ? 14 : 15 },

    splitRow: { flexDirection: "row", alignItems: "center" },
    splitLabel: { color: WHITE, fontFamily: FONT, fontSize: IS_ANDROID ? 12 : 13 },
    splitTrack: {
        flex: 1,
        height: IS_ANDROID ? 9 : 10,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: PLACEHOLDER,
    },
    splitFill: { height: IS_ANDROID ? 9 : 10, backgroundColor: ORANGE },
    splitPct: { color: GREY, fontFamily: FONT, fontSize: IS_ANDROID ? 11 : 12 },

    blockCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: IS_ANDROID ? 10 : 12,
        borderWidth: 1,
        borderColor: "#1F1F1F",
    },
    blockTitle: { color: WHITE, fontWeight: "700", fontFamily: FONT, fontSize: IS_ANDROID ? 13 : 14 },
    blockSub: { color: GREY, fontSize: IS_ANDROID ? 11 : 12, marginTop: 4, fontFamily: FONT },

    setTile: {
        backgroundColor: TILE_BG,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: IS_ANDROID ? 8 : 10,
        flexDirection: "row",
        alignItems: "center",
    },
    setNum: {
        width: IS_ANDROID ? 20 : 22,
        height: IS_ANDROID ? 20 : 22,
        borderRadius: 6,
        backgroundColor: PLACEHOLDER,
        alignItems: "center",
        justifyContent: "center",
    },
    setNumText: { color: WHITE, fontWeight: "700", fontSize: IS_ANDROID ? 11 : 12, fontFamily: FONT },
    setText: { color: WHITE, flex: 1, fontFamily: FONT, fontSize: IS_ANDROID ? 12 : 13 },

    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },

    sheet: {
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 12,
        backgroundColor: BG,
        borderRadius: 18,
        padding: IS_ANDROID ? 12 : 14,
        borderWidth: 1,
        borderColor: BORDER,
    },
    sheetItem: {
        backgroundColor: MENU_ITEM_BG,
        borderRadius: 12,
        paddingVertical: IS_ANDROID ? 12 : 14,
        paddingHorizontal: 14,
    },
    sheetItemText: { color: WHITE, fontSize: IS_ANDROID ? 13 : 14, fontFamily: FONT },

    commentsSheet: {
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 12,
        backgroundColor: "#0B0B0B",
        borderRadius: 18,
        padding: IS_ANDROID ? 12 : 14,
        borderWidth: 1,
        borderColor: BORDER,
    },
    sheetTitle: { color: WHITE, fontSize: IS_ANDROID ? 15 : 16, fontWeight: "600", fontFamily: FONT },

    emptyCenter: { height: IS_ANDROID ? 130 : 160, alignItems: "center", justifyContent: "center" },
    emptyText: { color: GREY, fontFamily: FONT, fontSize: IS_ANDROID ? 13 : 14 },

    commentRow: { paddingVertical: 8 },
    commentText: { color: "#E6E6E6", fontFamily: FONT, fontSize: IS_ANDROID ? 13 : 14 },
    commentDivider: { height: 1, backgroundColor: BORDER, marginTop: 10 },

    commentInputRow: { flexDirection: "row", alignItems: "center" },
    commentInput: {
        flex: 1,
        minHeight: IS_ANDROID ? 40 : 42,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#333",
        color: WHITE,
        paddingHorizontal: 12,
        backgroundColor: "#101010",
        fontFamily: FONT,
        fontSize: IS_ANDROID ? 13 : 14,
    },
    sendBtn: {
        backgroundColor: ORANGE,
        borderRadius: 10,
        paddingHorizontal: 14,
        height: IS_ANDROID ? 40 : 42,
        alignItems: "center",
        justifyContent: "center",
    },
    sendText: { color: "black", fontWeight: "700", fontFamily: FONT, fontSize: IS_ANDROID ? 13 : 14 },

    popup: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
    },
    popupCard: {
        width: "100%",
        maxWidth: IS_ANDROID ? 380 : 420,
        backgroundColor: "#111",
        borderRadius: 18,
        padding: IS_ANDROID ? 12 : 14,
        borderWidth: 1,
        borderColor: BORDER,
    },
    popupTitle: { color: WHITE, fontSize: IS_ANDROID ? 15 : 16, fontWeight: "800", fontFamily: FONT },
    popupSub: { color: WHITE, fontWeight: "700", fontFamily: FONT, fontSize: IS_ANDROID ? 13 : 14 },
    step: { color: "#E6E6E6", marginBottom: 8, lineHeight: IS_ANDROID ? 17 : 18, fontFamily: FONT, fontSize: IS_ANDROID ? 12 : 13 },

    infoRow: { flexDirection: "row", marginBottom: 6 },
    infoLabel: { width: IS_ANDROID ? 84 : 92, color: GREY, fontFamily: FONT, fontSize: IS_ANDROID ? 12 : 13 },
    infoValue: { flex: 1, color: WHITE, fontFamily: FONT, fontSize: IS_ANDROID ? 12 : 13 },

    popupBtn: {
        height: IS_ANDROID ? 40 : 42,
        borderRadius: 12,
        backgroundColor: ORANGE,
        alignItems: "center",
        justifyContent: "center",
    },
    popupBtnText: { color: "black", fontWeight: "800", fontFamily: FONT, fontSize: IS_ANDROID ? 13 : 14 },
});

