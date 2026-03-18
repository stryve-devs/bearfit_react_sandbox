import React, { useMemo, useState, useEffect } from "react";
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
    TouchableOpacity,
    KeyboardAvoidingView,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    interpolate,
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    ZoomIn,
    runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AppColors } from "../../constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
type Athlete = { name: string; username: string; avatarUrl: string };
type Post     = { id: string; caption: string; imageUrl: string; comments: string[]; athlete: Athlete };

type Comment = {
    id: string; user: string; avatarUrl: string;
    text: string; time: string; likes: number; liked: boolean;
    replies: Reply[]; showReplies: boolean;
};
type Reply = {
    id: string; user: string; avatarUrl: string;
    text: string; time: string; likes: number; liked: boolean;
};

type WorkoutInfo = {
    title: string; primary: string; secondary: string;
    equipment: string; steps: string[];
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ORANGE     = AppColors.orange;
const BG         = AppColors.black;
const IS_ANDROID = Platform.OS === "android";
const SMOOTH     = { duration: 200, easing: Easing.out(Easing.cubic) };
const QUICK_EMOJIS = ["💪", "🔥", "👏", "🏋️", "👊", "🥵", "🏆"];

function makeMockPosts(): Post[] {
    const athletes: Athlete[] = [
        { name: "Alex Rivera",  username: "alexfit",      avatarUrl: "https://i.pravatar.cc/150?img=12" },
        { name: "Morgan Lee",   username: "morganlifts",  avatarUrl: "https://i.pravatar.cc/150?img=32" },
        { name: "Noah Khan",    username: "noahrun",      avatarUrl: "https://i.pravatar.cc/150?img=56" },
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
    return Array.from({ length: 8 }).map((_, i) => ({
        id: `p-${i + 1}`,
        caption: caps[i % caps.length],
        imageUrl: images[i % images.length],
        comments: i % 2 === 0 ? ["Nice!", "🔥🔥", "Great form"] : [],
        athlete: athletes[i % athletes.length],
    }));
}

function makeInitialComments(): Comment[] {
    return [
        { id: "c1", user: "mayalifts", avatarUrl: "https://i.pravatar.cc/150?img=32", text: "Incredible session! What's your PR? 💪", time: "2h ago", likes: 5, liked: false, replies: [
                { id: "c1-r1", user: "noahrun", avatarUrl: "https://i.pravatar.cc/150?img=56", text: "Right?! Absolute beast mode 🔥", time: "1h ago", likes: 2, liked: false },
            ], showReplies: false },
        { id: "c2", user: "sarahit",   avatarUrl: "https://i.pravatar.cc/150?img=3",  text: "Great form on those reps!", time: "1h ago", likes: 3, liked: false, replies: [], showReplies: false },
        { id: "c3", user: "alexfit",   avatarUrl: "https://i.pravatar.cc/150?img=12", text: "🔥🔥🔥 lets gooo", time: "45m ago", likes: 1, liked: false, replies: [], showReplies: false },
    ];
}

// ─── MiniStat ─────────────────────────────────────────────────────────────────
function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.miniStat}>
            <Text allowFontScaling={false} style={styles.miniStatLabel}>{label}</Text>
            <Text allowFontScaling={false} style={styles.miniStatValue}>{value}</Text>
        </View>
    );
}

// ─── Split Bar ────────────────────────────────────────────────────────────────
function SplitBar({ label, value }: { label: string; value: number }) {
    const width = useSharedValue(0);

    useEffect(() => {
        width.value = withTiming(value, { duration: 800, easing: Easing.out(Easing.cubic) });
    }, []);

    const fillStyle = useAnimatedStyle(() => ({
        width: `${width.value * 100}%` as any,
    }));

    return (
        <View style={styles.splitRow}>
            <Text allowFontScaling={false} style={styles.splitLabel}>{label}</Text>
            <View style={styles.splitTrack}>
                <Animated.View style={[styles.splitFill, fillStyle]} />
            </View>
            <Text allowFontScaling={false} style={styles.splitPct}>{Math.round(value * 100)}%</Text>
        </View>
    );
}

// ─── Workout Block ────────────────────────────────────────────────────────────
function WorkoutBlock({ title, subtitle, sets, onTap }: {
    title: string; subtitle: string; sets: string[]; onTap: () => void;
}) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const press = () => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withTiming(0.98, { duration: 80 }),
            withTiming(1,    { duration: 160, easing: Easing.out(Easing.cubic) })
        );
        runOnJS(onTap)();
    };

    return (
        <TouchableOpacity onPress={press} activeOpacity={1}>
            <Animated.View style={[styles.workoutBlock, animStyle]}>
                <View style={styles.workoutBlockHeader}>
                    <View style={styles.workoutIconWrap}>
                        <Ionicons name="barbell-outline" size={IS_ANDROID ? 16 : 18} color={ORANGE} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text allowFontScaling={false} style={styles.workoutTitle}>{title}</Text>
                        <Text allowFontScaling={false} style={styles.workoutSubtitle}>{subtitle}</Text>
                    </View>
                    <Ionicons name="information-circle-outline" size={IS_ANDROID ? 18 : 20} color="rgba(255,255,255,0.3)" />
                </View>

                <View style={styles.workoutDivider} />

                {sets.map((s, i) => (
                    <View key={`${i}-${s}`} style={[styles.setTile, i !== 0 && { marginTop: 6 }]}>
                        <View style={styles.setNum}>
                            <Text allowFontScaling={false} style={styles.setNumText}>{i + 1}</Text>
                        </View>
                        <Text allowFontScaling={false} style={styles.setText}>{s}</Text>
                        <Ionicons name="checkmark-circle" size={14} color="rgba(255,107,53,0.4)" />
                    </View>
                ))}
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Comment Like ─────────────────────────────────────────────────────────────
function CommentLike({ liked, count, onPress }: { liked: boolean; count: number; onPress: () => void }) {
    const scale = useSharedValue(1);
    const press = () => {
        runOnJS(Haptics.selectionAsync)();
        scale.value = withSequence(
            withTiming(0.65, { duration: 70 }),
            withTiming(1.2,  { duration: 100 }),
            withTiming(1,    { duration: 80  })
        );
        runOnJS(onPress)();
    };
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    return (
        <TouchableOpacity onPress={press} activeOpacity={1} style={styles.commentLikeRow}>
            <Animated.View style={animStyle}>
                <Ionicons name={liked ? "heart" : "heart-outline"} size={13} color={liked ? "#FF4D6D" : "rgba(255,255,255,0.4)"} />
            </Animated.View>
            {count > 0 && <Text style={styles.commentLikeCount}>{count}</Text>}
        </TouchableOpacity>
    );
}

// ─── Home4PostDetail ──────────────────────────────────────────────────────────
export default function Home4PostDetail() {
    const params = useLocalSearchParams<{ postId?: string }>();
    const posts  = useMemo(() => makeMockPosts(), []);
    const post   = useMemo(() => posts.find((p) => p.id === params?.postId) ?? posts[0], [posts, params?.postId]);

    const [isLiked,    setIsLiked]    = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);
    const [likeCount,  setLikeCount]  = useState(100);

    const [moreOpen,     setMoreOpen]     = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [workoutOpen,  setWorkoutOpen]  = useState(false);
    const [workoutData,  setWorkoutData]  = useState<WorkoutInfo | null>(null);

    const [comments,     setComments]     = useState<Comment[]>(makeInitialComments);
    const [commentDraft, setCommentDraft] = useState("");
    const [replyingTo,   setReplyingTo]   = useState<{ commentId: string; user: string } | null>(null);

    // Sheet animations
    const sheetY        = useSharedValue(700);
    const workoutSheetY = useSharedValue(700);
    const moreSheetY    = useSharedValue(300);

    useEffect(() => {
        sheetY.value = commentsOpen
            ? withTiming(0,   { duration: 320, easing: Easing.out(Easing.cubic) })
            : withTiming(700, { duration: 280, easing: Easing.in(Easing.cubic) });
    }, [commentsOpen]);

    useEffect(() => {
        workoutSheetY.value = workoutOpen
            ? withTiming(0,   { duration: 320, easing: Easing.out(Easing.cubic) })
            : withTiming(700, { duration: 280, easing: Easing.in(Easing.cubic) });
    }, [workoutOpen]);

    useEffect(() => {
        moreSheetY.value = moreOpen
            ? withTiming(0,   { duration: 300, easing: Easing.out(Easing.cubic) })
            : withTiming(300, { duration: 240, easing: Easing.in(Easing.cubic) });
    }, [moreOpen]);

    const sheetStyle        = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }] }));
    const workoutSheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: workoutSheetY.value }] }));
    const moreSheetStyle    = useAnimatedStyle(() => ({ transform: [{ translateY: moreSheetY.value }] }));

    // Like animation
    const heartScale = useSharedValue(1);
    const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

    const handleLike = () => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        heartScale.value = withSequence(
            withTiming(0,   { duration: 80  }),
            withTiming(1.3, { duration: 120, easing: Easing.out(Easing.cubic) }),
            withTiming(1,   { duration: 100 })
        );
        setIsLiked((v) => {
            setLikeCount((c) => v ? c - 1 : c + 1);
            return !v;
        });
    };

    // Follow animation
    const followedVal = useSharedValue(0);
    useEffect(() => {
        followedVal.value = withTiming(isFollowed ? 1 : 0, SMOOTH);
    }, [isFollowed]);
    const followStyle = useAnimatedStyle(() => ({
        backgroundColor: `rgba(255,107,53,${interpolate(followedVal.value, [0, 1], [0, 0.14])})`,
        borderColor: ORANGE, borderWidth: 1, borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 6,
        flexDirection: "row" as const, alignItems: "center" as const,
    }));

    // Comment like
    const likeComment = (commentId: string) => {
        setComments((prev) => prev.map((c) =>
            c.id === commentId
                ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
                : c
        ));
    };
    const likeReply = (commentId: string, replyId: string) => {
        setComments((prev) => prev.map((c) =>
            c.id === commentId
                ? { ...c, replies: c.replies.map((r) =>
                        r.id === replyId
                            ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
                            : r
                    )}
                : c
        ));
    };
    const toggleReplies = (commentId: string) => {
        setComments((prev) => prev.map((c) =>
            c.id === commentId ? { ...c, showReplies: !c.showReplies } : c
        ));
    };

    const sendComment = () => {
        if (!commentDraft.trim()) return;
        const text = commentDraft.trim();
        if (replyingTo) {
            const newReply: Reply = {
                id: `r-${Date.now()}`, user: "you",
                avatarUrl: "https://i.pravatar.cc/150?img=10",
                text, time: "just now", likes: 0, liked: false,
            };
            setComments((prev) => prev.map((c) =>
                c.id === replyingTo.commentId
                    ? { ...c, replies: [...c.replies, newReply], showReplies: true }
                    : c
            ));
        } else {
            const newComment: Comment = {
                id: `c-${Date.now()}`, user: "you",
                avatarUrl: "https://i.pravatar.cc/150?img=10",
                text, time: "just now", likes: 0, liked: false,
                replies: [], showReplies: false,
            };
            setComments((prev) => [...prev, newComment]);
        }
        setCommentDraft("");
        setReplyingTo(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const openWorkoutPopup = (data: WorkoutInfo) => {
        setWorkoutData(data);
        setWorkoutOpen(true);
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.bgAccent} />

            {/* ── AppBar ── */}
            <Animated.View entering={FadeInDown.duration(380).easing(Easing.out(Easing.cubic))} style={styles.appbar}>
                <TouchableOpacity
                    onPress={() => { Haptics.selectionAsync(); router.back(); }}
                    style={styles.appbarBtn}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                </TouchableOpacity>
                <Text allowFontScaling={false} style={styles.appbarTitle}>Workout Routine</Text>
                <TouchableOpacity onPress={() => setMoreOpen(true)} style={styles.appbarBtn} activeOpacity={0.7}>
                    <Ionicons name="ellipsis-horizontal" size={IS_ANDROID ? 20 : 22} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
            </Animated.View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

                {/* ── Post Card ── */}
                <Animated.View entering={FadeInDown.delay(60).duration(400).easing(Easing.out(Easing.cubic))} style={styles.card}>
                    <View style={styles.cardAccentBar} />

                    {/* Header */}
                    <View style={styles.cardHeader}>
                        <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/profile", params: { athleteName: post.athlete.name, athleteUsername: post.athlete.username, athleteAvatarUrl: post.athlete.avatarUrl } })} activeOpacity={0.8}>
                            <View style={styles.avatarRing}>
                                <Image source={{ uri: post.athlete.avatarUrl }} style={styles.avatar} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={{ flex: 1 }} activeOpacity={0.8}>
                            <Text allowFontScaling={false} style={styles.username}>@{post.athlete.username}</Text>
                            <Text allowFontScaling={false} style={styles.time}>3 days ago</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsFollowed((v) => !v); }} activeOpacity={1}>
                            <Animated.View style={followStyle}>
                                {isFollowed
                                    ? <Ionicons name="checkmark" size={11} color={ORANGE} style={{ marginRight: 4 }} />
                                    : <Ionicons name="add"       size={11} color={ORANGE} style={{ marginRight: 4 }} />
                                }
                                <Text allowFontScaling={false} style={styles.followText}>
                                    {isFollowed ? "Following" : "Follow"}
                                </Text>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: IS_ANDROID ? 10 : 12 }} />
                    <Text allowFontScaling={false} style={styles.caption}>{post.caption}</Text>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <MiniStat label="Time"         value="1h 25min" />
                        <MiniStat label="Weight taken" value="400 kgs"  />
                        <MiniStat label="Distance"     value="4.5 km"   />
                    </View>

                    {/* Image */}
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: "/(tabs)/home/full-image", params: { imageUrl: post.imageUrl, caption: post.caption, username: post.athlete.username } })}
                        activeOpacity={0.92}
                    >
                        <View style={styles.imageWrap}>
                            <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                            <View style={styles.imageOverlay} />
                            <View style={styles.imageExpandHint}>
                                <Ionicons name="expand-outline" size={14} color="rgba(255,255,255,0.7)" />
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Actions */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity onPress={handleLike} activeOpacity={1} style={styles.actionBtn}>
                            <Animated.View style={heartStyle}>
                                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={IS_ANDROID ? 20 : 22} color={isLiked ? "#FF4D6D" : "rgba(255,255,255,0.7)"} />
                            </Animated.View>
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={[styles.actionCount, isLiked && { color: "#FF4D6D" }]}>{likeCount}</Text>

                        <View style={{ width: IS_ANDROID ? 10 : 14 }} />

                        <TouchableOpacity onPress={() => setCommentsOpen(true)} style={styles.actionBtn} activeOpacity={0.7}>
                            <Ionicons name="chatbubble-outline" size={IS_ANDROID ? 19 : 21} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={styles.actionCount}>{comments.length}</Text>

                        <View style={{ flex: 1 }} />

                        <TouchableOpacity onPress={() => Haptics.selectionAsync()} style={styles.actionBtn} activeOpacity={0.7}>
                            <Ionicons name="share-outline" size={IS_ANDROID ? 19 : 21} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    </View>

                    {/* Liked by */}
                    <View style={styles.likedByRow}>
                        <Image source={{ uri: post.athlete.avatarUrl }} style={styles.tinyAvatar} />
                        <Text allowFontScaling={false} style={styles.likedByText} numberOfLines={1}>
                            Liked by <Text style={{ color: AppColors.white, fontWeight: "700" }}>{post.athlete.username}</Text> and others
                        </Text>
                    </View>

                    <View style={{ height: IS_ANDROID ? 10 : 12 }} />

                    {/* Muscle Split */}
                    <Text allowFontScaling={false} style={styles.sectionHeader}>Muscle Split</Text>
                    <View style={{ height: 12 }} />
                    <SplitBar label="Arms"      value={0.35} />
                    <View style={{ height: 8 }} />
                    <SplitBar label="Core"      value={0.15} />
                    <View style={{ height: 8 }} />
                    <SplitBar label="Shoulders" value={0.50} />
                </Animated.View>

                <View style={{ height: 14 }} />

                {/* ── Workout Blocks ── */}
                <Animated.View entering={FadeInDown.delay(120).duration(400).easing(Easing.out(Easing.cubic))}>
                    <Text allowFontScaling={false} style={styles.sectionHeaderStandalone}>Exercises</Text>
                    <View style={{ height: 10 }} />
                </Animated.View>

                {[
                    { title: "Bench Press (Barbell)",         subtitle: "10Kg • 15 reps", sets: ["10Kg • 15 reps","10Kg • 15 reps","10Kg • 15 reps"],
                        info: { title: "Bench Press (Barbell)", primary: "Chest", secondary: "Shoulders, Triceps", equipment: "Barbell",
                            steps: ["Lie down on the bench with eyes under the bar.","Hold slightly wider than shoulder width.","Unrack and lower slowly to chest.","Press up with control.","Repeat for required reps."] }},
                    { title: "Back Extension (Hyperextension)", subtitle: "10 reps", sets: ["10 reps","10 reps"],
                        info: { title: "Back Extension", primary: "Core", secondary: "Shoulders, Triceps", equipment: "Dumbbell",
                            steps: ["Set yourself on the hyperextension bench safely.","Keep spine neutral and core engaged.","Lower your torso slowly.","Raise back up using lower back muscles.","Repeat without jerking."] }},
                    { title: "Knee Raise Parallel Bars",       subtitle: "12 reps", sets: ["12 reps","12 reps"],
                        info: { title: "Knee Raise Parallel Bars", primary: "Core", secondary: "Shoulders, Triceps", equipment: "Dumbbell",
                            steps: ["Support yourself on bars with arms locked.","Lift knees towards chest slowly.","Lower legs back down with control.","Avoid swinging your body.","Repeat for reps."] }},
                ].map((block, i) => (
                    <Animated.View key={block.title} entering={FadeInDown.delay(160 + i * 60).duration(400).easing(Easing.out(Easing.cubic))}>
                        <WorkoutBlock
                            title={block.title} subtitle={block.subtitle} sets={block.sets}
                            onTap={() => openWorkoutPopup(block.info)}
                        />
                        {i < 2 && <View style={{ height: 10 }} />}
                    </Animated.View>
                ))}
            </ScrollView>

            {/* ── More Sheet ── */}
            <Modal visible={moreOpen} transparent animationType="none">
                <Pressable style={styles.backdrop} onPress={() => setMoreOpen(false)} />
                <Animated.View style={[styles.moreSheet, moreSheetStyle]}>
                    <View style={styles.sheetHandle} />
                    {[
                        { label: "Save As Routine",  icon: "bookmark-outline",  action: () => { setMoreOpen(false); Alert.alert("Saved ✅"); } },
                        { label: "Copy Workout",     icon: "copy-outline",      action: () => { setMoreOpen(false); Alert.alert("Copied ✅"); } },
                        { label: "Report Workout",   icon: "flag-outline",      action: () => { setMoreOpen(false); Alert.alert("Reported ✅"); } },
                    ].map((item, i) => (
                        <TouchableOpacity key={item.label} onPress={item.action} activeOpacity={0.7}>
                            <Animated.View entering={FadeInUp.delay(i * 40).duration(260)} style={styles.moreSheetItem}>
                                <View style={styles.moreSheetIcon}>
                                    <Ionicons name={item.icon as any} size={18} color={ORANGE} />
                                </View>
                                <Text allowFontScaling={false} style={styles.moreSheetText}>{item.label}</Text>
                                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
                            </Animated.View>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            </Modal>

            {/* ── Comments Sheet ── */}
            <Modal visible={commentsOpen} transparent animationType="none">
                <Pressable style={styles.backdrop} onPress={() => { setCommentsOpen(false); setReplyingTo(null); }} />
                <KeyboardAvoidingView behavior={IS_ANDROID ? "height" : "padding"} style={styles.kavWrap}>
                    <Animated.View style={[styles.commentsSheet, sheetStyle]}>
                        <View style={styles.sheetHandle} />
                        <Text allowFontScaling={false} style={styles.sheetTitle}>Comments</Text>

                        <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {comments.length === 0 ? (
                                <View style={styles.emptyComments}>
                                    <Ionicons name="chatbubble-outline" size={32} color={AppColors.darkGrey} />
                                    <Text allowFontScaling={false} style={styles.emptyCommentsText}>No comments yet!</Text>
                                </View>
                            ) : (
                                comments.map((c, idx) => (
                                    <Animated.View key={c.id} entering={FadeInDown.delay(idx * 30).duration(260).easing(Easing.out(Easing.cubic))}>
                                        <View style={styles.commentItem}>
                                            <Image source={{ uri: c.avatarUrl }} style={styles.commentAvatar} />
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.commentTopRow}>
                                                    <Text allowFontScaling={false} style={styles.commentUser}>{c.user}</Text>
                                                    <Text allowFontScaling={false} style={styles.commentTime}>{c.time}</Text>
                                                </View>
                                                <Text allowFontScaling={false} style={styles.commentText}>{c.text}</Text>
                                                <View style={styles.commentActions}>
                                                    <TouchableOpacity onPress={() => { Haptics.selectionAsync(); setReplyingTo({ commentId: c.id, user: c.user }); }} style={styles.replyBtn}>
                                                        <Text allowFontScaling={false} style={styles.replyBtnText}>Reply</Text>
                                                    </TouchableOpacity>
                                                    {c.replies.length > 0 && (
                                                        <TouchableOpacity onPress={() => toggleReplies(c.id)} style={styles.viewRepliesBtn}>
                                                            <Ionicons name={c.showReplies ? "chevron-up" : "chevron-down"} size={11} color={ORANGE} />
                                                            <Text allowFontScaling={false} style={styles.viewRepliesText}>
                                                                {c.showReplies ? "Hide" : `${c.replies.length}`} {c.replies.length === 1 ? "reply" : "replies"}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                {c.showReplies && c.replies.map((r) => (
                                                    <View key={r.id} style={styles.replyItem}>
                                                        <Image source={{ uri: r.avatarUrl }} style={styles.replyAvatar} />
                                                        <View style={{ flex: 1 }}>
                                                            <View style={styles.commentTopRow}>
                                                                <Text allowFontScaling={false} style={styles.commentUser}>{r.user}</Text>
                                                                <Text allowFontScaling={false} style={styles.commentTime}>{r.time}</Text>
                                                            </View>
                                                            <Text allowFontScaling={false} style={styles.commentText}>{r.text}</Text>
                                                        </View>
                                                        <CommentLike liked={r.liked} count={r.likes} onPress={() => likeReply(c.id, r.id)} />
                                                    </View>
                                                ))}
                                            </View>
                                            <CommentLike liked={c.liked} count={c.likes} onPress={() => likeComment(c.id)} />
                                        </View>
                                        {idx < comments.length - 1 && <View style={styles.commentDivider} />}
                                    </Animated.View>
                                ))
                            )}
                        </ScrollView>

                        {/* Emojis */}
                        <View style={styles.emojiRow}>
                            {QUICK_EMOJIS.map((emoji) => (
                                <TouchableOpacity key={emoji} onPress={() => { Haptics.selectionAsync(); setCommentDraft((p) => `${p}${emoji}`); }} style={styles.emojiBtn}>
                                    <Text style={styles.emojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Reply banner */}
                        {replyingTo && (
                            <Animated.View entering={FadeIn.duration(180)} style={styles.replyBanner}>
                                <Ionicons name="return-down-forward" size={13} color={ORANGE} />
                                <Text allowFontScaling={false} style={styles.replyBannerText}>
                                    Replying to <Text style={{ color: ORANGE, fontWeight: "700" }}>@{replyingTo.user}</Text>
                                </Text>
                                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                                    <Ionicons name="close" size={14} color={AppColors.grey} />
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* Input */}
                        <View style={styles.commentInputBar}>
                            <TextInput
                                value={commentDraft} onChangeText={setCommentDraft}
                                placeholder={replyingTo ? `Reply to @${replyingTo.user}...` : "Add a comment..."}
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                style={styles.commentInput} allowFontScaling={false}
                            />
                            <TouchableOpacity onPress={sendComment} activeOpacity={0.8}
                                              style={[styles.sendBtn, !commentDraft.trim() && { opacity: 0.4 }]}
                                              disabled={!commentDraft.trim()}
                            >
                                <Ionicons name="arrow-up" size={IS_ANDROID ? 18 : 20} color={BG} />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ── Workout Info Popup ── */}
            <Modal visible={workoutOpen} transparent animationType="none">
                <Pressable style={styles.backdrop} onPress={() => setWorkoutOpen(false)} />
                <KeyboardAvoidingView behavior={IS_ANDROID ? "height" : "padding"} style={styles.kavWrap}>
                    <Animated.View style={[styles.workoutSheet, workoutSheetStyle]}>
                        <View style={styles.sheetHandle} />
                        {workoutData && (
                            <>
                                <Text allowFontScaling={false} style={styles.sheetTitle}>{workoutData.title}</Text>
                                <View style={styles.workoutInfoGrid}>
                                    {[
                                        { label: "Primary",   value: workoutData.primary   },
                                        { label: "Secondary", value: workoutData.secondary  },
                                        { label: "Equipment", value: workoutData.equipment  },
                                    ].map((row) => (
                                        <View key={row.label} style={styles.workoutInfoRow}>
                                            <Text allowFontScaling={false} style={styles.workoutInfoLabel}>{row.label}</Text>
                                            <View style={styles.workoutInfoValueWrap}>
                                                <Text allowFontScaling={false} style={styles.workoutInfoValue}>{row.value}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                                <Text allowFontScaling={false} style={styles.stepsHeader}>Steps</Text>
                                <ScrollView style={styles.stepsList} showsVerticalScrollIndicator={false}>
                                    {workoutData.steps.map((s, i) => (
                                        <Animated.View key={i} entering={FadeInDown.delay(i * 40).duration(260)} style={styles.stepRow}>
                                            <View style={styles.stepNum}>
                                                <Text allowFontScaling={false} style={styles.stepNumText}>{i + 1}</Text>
                                            </View>
                                            <Text allowFontScaling={false} style={styles.stepText}>{s}</Text>
                                        </Animated.View>
                                    ))}
                                </ScrollView>
                                <TouchableOpacity onPress={() => setWorkoutOpen(false)} activeOpacity={0.8} style={styles.closeWorkoutBtn}>
                                    <Text allowFontScaling={false} style={styles.closeWorkoutText}>Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    bgAccent: { position: "absolute", width: 220, height: 220, borderRadius: 110, top: -60, right: -60, backgroundColor: "rgba(255,107,53,0.05)" },

    appbar: { height: IS_ANDROID ? 52 : 58, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
    appbarBtn: { width: IS_ANDROID ? 36 : 38, height: IS_ANDROID ? 36 : 38, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.055)", alignItems: "center", justifyContent: "center" },
    appbarTitle: { color: AppColors.white, fontSize: IS_ANDROID ? 15 : 16, fontWeight: "700" },

    body: { padding: 14, paddingBottom: 40 },

    card: { backgroundColor: AppColors.darkBg, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    cardAccentBar: { height: 2, backgroundColor: ORANGE, width: "40%", borderBottomRightRadius: 2 },
    cardHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 12, gap: 10 },
    avatarRing: { width: IS_ANDROID ? 40 : 44, height: IS_ANDROID ? 40 : 44, borderRadius: IS_ANDROID ? 20 : 22, borderWidth: 2, borderColor: "rgba(255,107,53,0.4)", padding: 1.5 },
    avatar: { width: "100%", height: "100%", borderRadius: IS_ANDROID ? 18 : 20, backgroundColor: AppColors.darkBg },
    username: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    time: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, marginTop: 2 },
    followText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "700" },
    caption: { color: "rgba(255,255,255,0.88)", fontSize: IS_ANDROID ? 14 : 15, lineHeight: IS_ANDROID ? 21 : 23, paddingHorizontal: 14 },
    statsRow: { flexDirection: "row", paddingHorizontal: 14, paddingVertical: IS_ANDROID ? 10 : 12, gap: IS_ANDROID ? 14 : 18 },
    miniStat: {},
    miniStatLabel: { color: AppColors.grey, fontSize: IS_ANDROID ? 10 : 11, marginBottom: 2 },
    miniStatValue: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    imageWrap: { position: "relative", marginHorizontal: 14, borderRadius: 14, overflow: "hidden" },
    postImage: { width: "100%", height: IS_ANDROID ? 240 : 270, backgroundColor: AppColors.darkBg },
    imageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 60, backgroundColor: "rgba(0,0,0,0.25)" },
    imageExpandHint: { position: "absolute", bottom: 10, right: 10, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 8, padding: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    actionsRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: IS_ANDROID ? 10 : 12, paddingBottom: 4 },
    actionBtn: { width: IS_ANDROID ? 36 : 40, height: IS_ANDROID ? 36 : 40, alignItems: "center", justifyContent: "center" },
    actionCount: { color: "rgba(255,255,255,0.7)", fontSize: IS_ANDROID ? 13 : 14, fontWeight: "600" },
    likedByRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingBottom: 4, gap: 8, marginTop: 2 },
    tinyAvatar: { width: IS_ANDROID ? 18 : 20, height: IS_ANDROID ? 18 : 20, borderRadius: IS_ANDROID ? 9 : 10, backgroundColor: AppColors.darkBg, borderWidth: 1.5, borderColor: AppColors.darkBg },
    likedByText: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, flex: 1 },
    sectionHeader: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 14 : 15, paddingHorizontal: 14 },
    splitRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
    splitLabel: { color: AppColors.white, fontSize: IS_ANDROID ? 12 : 13, width: IS_ANDROID ? 78 : 86 },
    splitTrack: { flex: 1, height: IS_ANDROID ? 7 : 8, borderRadius: 6, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.07)" },
    splitFill: { height: "100%", backgroundColor: ORANGE, borderRadius: 6 },
    splitPct: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, width: 36, textAlign: "right" },

    sectionHeaderStandalone: { color: AppColors.white, fontWeight: "800", fontSize: IS_ANDROID ? 15 : 16, letterSpacing: -0.3 },

    // Workout Block
    workoutBlock: { backgroundColor: AppColors.darkBg, borderRadius: 16, padding: IS_ANDROID ? 12 : 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    workoutBlockHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    workoutIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    workoutTitle: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    workoutSubtitle: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, marginTop: 2 },
    workoutDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginBottom: 10 },
    setTile: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: IS_ANDROID ? 8 : 10, flexDirection: "row", alignItems: "center", gap: 10 },
    setNum: { width: IS_ANDROID ? 20 : 22, height: IS_ANDROID ? 20 : 22, borderRadius: 6, backgroundColor: "rgba(255,107,53,0.15)", alignItems: "center", justifyContent: "center" },
    setNumText: { color: ORANGE, fontWeight: "800", fontSize: IS_ANDROID ? 11 : 12 },
    setText: { color: AppColors.white, flex: 1, fontSize: IS_ANDROID ? 12 : 13 },

    // Sheets
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
    kavWrap: { position: "absolute", left: 0, right: 0, bottom: 0, top: 0, justifyContent: "flex-end" },
    sheetHandle: { width: 40, height: 4, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center", marginBottom: 12 },
    sheetTitle: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 15 : 16, textAlign: "center", marginBottom: 14 },

    moreSheet: { backgroundColor: "#0E0E0E", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: IS_ANDROID ? 20 : 30, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },
    moreSheetItem: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: IS_ANDROID ? 12 : 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
    moreSheetIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center" },
    moreSheetText: { color: AppColors.white, fontSize: IS_ANDROID ? 14 : 15, fontWeight: "600", flex: 1 },

    commentsSheet: { backgroundColor: "#0E0E0E", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: IS_ANDROID ? 16 : 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)", maxHeight: "85%" },
    commentsList: { maxHeight: IS_ANDROID ? 280 : 340, paddingHorizontal: 14 },
    emptyComments: { alignItems: "center", justifyContent: "center", paddingVertical: 30, gap: 10 },
    emptyCommentsText: { color: AppColors.grey, fontSize: IS_ANDROID ? 13 : 14 },
    commentItem: { flexDirection: "row", alignItems: "flex-start", paddingVertical: IS_ANDROID ? 10 : 12 },
    commentAvatar: { width: IS_ANDROID ? 34 : 38, height: IS_ANDROID ? 34 : 38, borderRadius: IS_ANDROID ? 17 : 19, backgroundColor: AppColors.darkBg, marginRight: 10, borderWidth: 1.5, borderColor: "rgba(255,107,53,0.3)" },
    commentTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    commentUser: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    commentTime: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12 },
    commentText: { color: "rgba(255,255,255,0.8)", fontSize: IS_ANDROID ? 13 : 14, lineHeight: IS_ANDROID ? 19 : 21 },
    commentActions: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 6 },
    replyBtn: { paddingVertical: 2 },
    replyBtnText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "700" },
    viewRepliesBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    viewRepliesText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "600" },
    commentLikeRow: { flexDirection: "row", alignItems: "center", gap: 3, paddingLeft: 8 },
    commentLikeCount: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
    commentDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.04)" },
    replyItem: { flexDirection: "row", alignItems: "flex-start", marginTop: 8, paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: "rgba(255,107,53,0.2)" },
    replyAvatar: { width: IS_ANDROID ? 26 : 28, height: IS_ANDROID ? 26 : 28, borderRadius: IS_ANDROID ? 13 : 14, backgroundColor: AppColors.darkBg, marginRight: 8, borderWidth: 1, borderColor: "rgba(255,107,53,0.25)" },
    replyBanner: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "rgba(255,107,53,0.08)", borderTopWidth: 1, borderTopColor: "rgba(255,107,53,0.15)" },
    replyBannerText: { flex: 1, color: "rgba(255,255,255,0.6)", fontSize: IS_ANDROID ? 12 : 13 },
    emojiRow: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: IS_ANDROID ? 10 : 12 },
    emojiBtn: { paddingHorizontal: 2 },
    emojiText: { fontSize: IS_ANDROID ? 22 : 26 },
    commentInputBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
    commentInput: { flex: 1, height: IS_ANDROID ? 46 : 50, borderRadius: IS_ANDROID ? 23 : 25, backgroundColor: "rgba(255,255,255,0.07)", color: AppColors.white, paddingHorizontal: 18, fontSize: IS_ANDROID ? 14 : 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
    sendBtn: { width: IS_ANDROID ? 46 : 50, height: IS_ANDROID ? 46 : 50, borderRadius: IS_ANDROID ? 23 : 25, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center" },

    // Workout Sheet
    workoutSheet: { backgroundColor: "#0E0E0E", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: IS_ANDROID ? 20 : 28, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)", maxHeight: "80%" },
    workoutInfoGrid: { gap: 8, marginBottom: 16 },
    workoutInfoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    workoutInfoLabel: { color: AppColors.grey, fontSize: IS_ANDROID ? 12 : 13, width: 80 },
    workoutInfoValueWrap: { backgroundColor: "rgba(255,107,53,0.1)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    workoutInfoValue: { color: ORANGE, fontSize: IS_ANDROID ? 12 : 13, fontWeight: "600" },
    stepsHeader: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 14 : 15, marginBottom: 10 },
    stepsList: { maxHeight: IS_ANDROID ? 200 : 240 },
    stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
    stepNum: { width: 22, height: 22, borderRadius: 7, backgroundColor: "rgba(255,107,53,0.15)", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    stepNumText: { color: ORANGE, fontWeight: "800", fontSize: 11 },
    stepText: { flex: 1, color: "rgba(255,255,255,0.8)", fontSize: IS_ANDROID ? 13 : 14, lineHeight: IS_ANDROID ? 19 : 21 },
    closeWorkoutBtn: { height: IS_ANDROID ? 46 : 50, borderRadius: 14, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center", marginTop: 14 },
    closeWorkoutText: { color: BG, fontWeight: "800", fontSize: IS_ANDROID ? 14 : 15 },
});
