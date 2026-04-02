import React, { useMemo, useState, useEffect, useRef } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StatusBar,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    withRepeat,
    withDelay,
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

// ─── Constants ────────────────────────────────────────────────────────────────
const ORANGE     = AppColors.orange;
const BG         = AppColors.black;
const IS_ANDROID = Platform.OS === "android";
const { width: SCREEN_W } = Dimensions.get("window");
const SMOOTH = { duration: 220, easing: Easing.out(Easing.cubic) };

// ─── Types ────────────────────────────────────────────────────────────────────
type Athlete = { name: string; username: string; avatarUrl: string };
type Post = {
    id: string; athlete: Athlete; caption: string;
    imageUrl: string; comments: string[];
    stats: { time: string; weight: string; sets: string };
};
type Comment = {
    id: string; user: string; avatarUrl: string;
    text: string; time: string; likes: number; liked: boolean;
    replies: Reply[]; showReplies: boolean;
};
type Reply = {
    id: string; user: string; avatarUrl: string;
    text: string; time: string; likes: number; liked: boolean;
};

// ─── Graph data ───────────────────────────────────────────────────────────────
const GRAPH_HOURS  = [11, 5, 16, 13, 14, 3, 15, 8, 12, 6, 17, 10];
const GRAPH_LABELS = ["Aug15","Aug30","Sep15","Sep30","Oct15","Oct30","Nov15","Nov30","Dec15","Dec30","Jan15","Jan30"];
const QUICK_EMOJIS = ["💪","🔥","👏","🏋️","👊","🥵","🏆"];

// ─── Demo data ────────────────────────────────────────────────────────────────
function makeDemoPosts(athlete: Athlete): Post[] {
    const captions = ["Back + Stuff", "leg day , lets goo", "Loose belly fat"];
    return Array.from({ length: 3 }).map((_, i) => ({
        id: `${athlete.username}_p${i}`,
        athlete,
        caption: captions[i],
        imageUrl: `https://picsum.photos/seed/${athlete.username}_${i + 1}/900/900`,
        comments: ["Nice!", "Good work!", "🔥🔥"],
        stats: { time: "1h 25min", weight: "4,000 kg", sets: "30" },
    }));
}

function makeComments(postId: string): Comment[] {
    return [
        { id: `${postId}-c1`, user: "mayalifts", avatarUrl: "https://i.pravatar.cc/150?img=32", text: "Great session! What's your PR? 💪", time: "2h ago", likes: 4, liked: false, replies: [
                { id: `${postId}-c1-r1`, user: "noahrun", avatarUrl: "https://i.pravatar.cc/150?img=56", text: "Beast mode 🔥", time: "1h ago", likes: 1, liked: false },
            ], showReplies: false },
        { id: `${postId}-c2`, user: "sarahit", avatarUrl: "https://i.pravatar.cc/150?img=3", text: "Incredible form on those reps!", time: "1h ago", likes: 2, liked: false, replies: [], showReplies: false },
    ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function usePressScale(amount = 0.96) {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const onIn  = () => { scale.value = withTiming(amount, { duration: 80 }); };
    const onOut = () => { scale.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) }); };
    return { style, onIn, onOut };
}

// ─── Bar Graph ────────────────────────────────────────────────────────────────
function BarGraph({ hours, labels, onBarTap }: {
    hours: number[]; labels: string[]; onBarTap: (i: number) => void;
}) {
    const maxH = Math.max(...hours);
    return (
        <View style={styles.graphWrap}>
            {hours.map((h, i) => {
                const pct = h / maxH;
                const barH = useSharedValue(0);

                useEffect(() => {
                    barH.value = withDelay(i * 50, withTiming(pct, { duration: 700, easing: Easing.out(Easing.cubic) }));
                }, []);

                const barStyle = useAnimatedStyle(() => ({
                    height: barH.value * 120,
                }));

                return (
                    <TouchableOpacity key={i} onPress={() => onBarTap(i)} activeOpacity={0.7} style={styles.barCol}>
                        <Animated.View style={[styles.bar, barStyle]} />
                        <Text allowFontScaling={false} style={styles.barLabel} numberOfLines={1}>{labels[i]}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label, onPress }: { value: string; label: string; onPress: () => void }) {
    const { style, onIn, onOut } = usePressScale(0.93);
    return (
        <TouchableOpacity onPressIn={onIn} onPressOut={onOut} onPress={onPress} activeOpacity={1}>
            <Animated.View style={[styles.statPill, style]}>
                <Text allowFontScaling={false} style={styles.statPillValue}>{value}</Text>
                <Text allowFontScaling={false} style={styles.statPillLabel}>{label}</Text>
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
            withTiming(0.6,  { duration: 70 }),
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

// ─── ProfileScreen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
    const params = useLocalSearchParams<{ athleteName?: string; athleteUsername?: string; athleteAvatarUrl?: string }>();

    const athlete: Athlete = useMemo(() => ({
        name:      params.athleteName     ?? "Star_butterf",
        username:  params.athleteUsername ?? "star_butterf",
        avatarUrl: params.athleteAvatarUrl ?? "https://i.pravatar.cc/150?img=12",
    }), [params]);

    const posts = useMemo(() => makeDemoPosts(athlete), [athlete]);

    const [isFollowed,    setIsFollowed]    = useState(false);
    const [likedPostIds,  setLikedPostIds]  = useState<Set<string>>(new Set());
    const [moreOpen,      setMoreOpen]      = useState(false);
    const [zoomOpen,      setZoomOpen]      = useState(false);
    const [listModal,     setListModal]     = useState<{ title: string; open: boolean }>({ title: "", open: false });
    const [commentsModal, setCommentsModal] = useState<{ post: Post | null; open: boolean }>({ post: null, open: false });
    const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>(() =>
        Object.fromEntries(posts.map((p) => [p.id, makeComments(p.id)]))
    );
    const [commentDraft,  setCommentDraft]  = useState("");
    const [replyingTo,    setReplyingTo]    = useState<{ commentId: string; user: string } | null>(null);

    const totalHours = GRAPH_HOURS.reduce((a, b) => a + b, 0).toFixed(0);

    // Sheet animations
    const moreSheetY    = useSharedValue(400);
    const moreOpacity   = useSharedValue(0);
    const commentsSheetY = useSharedValue(600);
    const listSheetY    = useSharedValue(600);

    useEffect(() => {
        moreSheetY.value  = moreOpen  ? withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }) : withTiming(400, { duration: 240, easing: Easing.in(Easing.cubic) });
        moreOpacity.value = moreOpen  ? withTiming(1, SMOOTH) : withTiming(0, { duration: 200 });
    }, [moreOpen]);

    useEffect(() => {
        commentsSheetY.value = commentsModal.open
            ? withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) })
            : withTiming(600, { duration: 280, easing: Easing.in(Easing.cubic) });
    }, [commentsModal.open]);

    useEffect(() => {
        listSheetY.value = listModal.open
            ? withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
            : withTiming(600, { duration: 260, easing: Easing.in(Easing.cubic) });
    }, [listModal.open]);

    const moreSheetStyle    = useAnimatedStyle(() => ({ transform: [{ translateY: moreSheetY.value }] }));
    const commentsSheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: commentsSheetY.value }] }));
    const listSheetStyle    = useAnimatedStyle(() => ({ transform: [{ translateY: listSheetY.value }] }));

    // Follow button
    const followedVal = useSharedValue(0);
    useEffect(() => {
        followedVal.value = withTiming(isFollowed ? 1 : 0, SMOOTH);
    }, [isFollowed]);
    const followBtnStyle = useAnimatedStyle(() => ({
        backgroundColor: followedVal.value > 0.5 ? "transparent" : ORANGE,
        borderWidth: 1.5,
        borderColor: ORANGE,
    }));

    const shareProfile = async () => {
        Haptics.selectionAsync();
        try { await Share.share({ message: `Check out @${athlete.username} on BearFit` }); } catch {}
    };

    const toggleLike = (postId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLikedPostIds((prev) => {
            const next = new Set(prev);
            next.has(postId) ? next.delete(postId) : next.add(postId);
            return next;
        });
    };

    const openComments = (post: Post) => {
        setCommentDraft("");
        setReplyingTo(null);
        setCommentsModal({ post, open: true });
    };

    const likeComment = (postId: string, commentId: string) => {
        setCommentsByPost((prev) => ({
            ...prev,
            [postId]: (prev[postId] ?? []).map((c) =>
                c.id === commentId ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
            ),
        }));
    };

    const likeReply = (postId: string, commentId: string, replyId: string) => {
        setCommentsByPost((prev) => ({
            ...prev,
            [postId]: (prev[postId] ?? []).map((c) =>
                c.id === commentId
                    ? { ...c, replies: c.replies.map((r) => r.id === replyId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r) }
                    : c
            ),
        }));
    };

    const toggleReplies = (postId: string, commentId: string) => {
        setCommentsByPost((prev) => ({
            ...prev,
            [postId]: (prev[postId] ?? []).map((c) =>
                c.id === commentId ? { ...c, showReplies: !c.showReplies } : c
            ),
        }));
    };

    const sendComment = () => {
        const post = commentsModal.post;
        if (!post || !commentDraft.trim()) return;
        const text = commentDraft.trim();
        if (replyingTo) {
            const newReply: Reply = { id: `r-${Date.now()}`, user: "you", avatarUrl: "https://i.pravatar.cc/150?img=10", text, time: "just now", likes: 0, liked: false };
            setCommentsByPost((prev) => ({
                ...prev,
                [post.id]: (prev[post.id] ?? []).map((c) =>
                    c.id === replyingTo.commentId ? { ...c, replies: [...c.replies, newReply], showReplies: true } : c
                ),
            }));
        } else {
            const newComment: Comment = { id: `c-${Date.now()}`, user: "you", avatarUrl: "https://i.pravatar.cc/150?img=10", text, time: "just now", likes: 0, liked: false, replies: [], showReplies: false };
            setCommentsByPost((prev) => ({ ...prev, [post.id]: [...(prev[post.id] ?? []), newComment] }));
        }
        setCommentDraft("");
        setReplyingTo(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.bgAccent1} />
            <View style={styles.bgAccent2} />

            {/* ── AppBar ── */}
            <Animated.View entering={FadeInDown.duration(380).easing(Easing.out(Easing.cubic))} style={styles.appbar}>
                <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.back(); }} style={styles.appbarBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                </TouchableOpacity>
                <Text allowFontScaling={false} style={styles.appbarTitle} numberOfLines={1}>@{athlete.username}</Text>
                <View style={styles.appbarRight}>
                    <TouchableOpacity onPress={shareProfile} style={styles.appbarBtn} activeOpacity={0.7}>
                        <Ionicons name="share-outline" size={IS_ANDROID ? 19 : 21} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMoreOpen(true)} style={styles.appbarBtn} activeOpacity={0.7}>
                        <Ionicons name="ellipsis-horizontal" size={IS_ANDROID ? 19 : 21} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

                {/* ── Top Photo Strip ── */}
                <Animated.View entering={FadeInDown.delay(40).duration(380).easing(Easing.out(Easing.cubic))}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoStrip}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => router.push({ pathname: "/(tabs)/home/profile-media", params: { athleteName: athlete.name, athleteUsername: athlete.username, athleteAvatarUrl: athlete.avatarUrl } })}
                                activeOpacity={0.85}
                            >
                                <Image
                                    source={{ uri: `https://picsum.photos/seed/${athlete.username}_top_${i}/300/200` }}
                                    style={styles.photoStripItem}
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* ── Profile Header ── */}
                <Animated.View entering={FadeInDown.delay(80).duration(400).easing(Easing.out(Easing.cubic))} style={styles.profileCard}>
                    <View style={styles.profileCardAccent} />

                    <View style={styles.profileTopRow}>
                        {/* Avatar */}
                        <TouchableOpacity onPress={() => setZoomOpen(true)} activeOpacity={0.85}>
                            <View style={styles.avatarOuter}>
                                <View style={styles.avatarRing}>
                                    <Image source={{ uri: athlete.avatarUrl }} style={styles.avatar} />
                                </View>
                                <View style={styles.onlineDot} />
                            </View>
                        </TouchableOpacity>

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <StatPill value="200"  label="Workouts"  onPress={() => setListModal({ title: "Workouts",  open: true })} />
                            <StatPill value="1.0k" label="Followers" onPress={() => setListModal({ title: "Followers", open: true })} />
                            <StatPill value="30"   label="Following" onPress={() => setListModal({ title: "Following", open: true })} />
                        </View>
                    </View>

                    {/* Name + bio */}
                    <Text allowFontScaling={false} style={styles.profileName}>{athlete.name}</Text>
                    <Text allowFontScaling={false} style={styles.profileBio}>
                        Motivation gets you started, discipline{"\n"}keeps you going.
                    </Text>
                    <Text allowFontScaling={false} style={styles.profileMeta}>23 · 170cm · 55kg</Text>

                    {/* Follow Button */}
                    <TouchableOpacity
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsFollowed((v) => !v); }}
                        activeOpacity={1}
                        style={{ marginTop: 14 }}
                    >
                        <Animated.View style={[styles.followBtn, followBtnStyle]}>
                            {isFollowed
                                ? <Ionicons name="checkmark" size={14} color={ORANGE} style={{ marginRight: 6 }} />
                                : <Ionicons name="person-add-outline" size={14} color={BG} style={{ marginRight: 6 }} />
                            }
                            <Text allowFontScaling={false} style={[styles.followBtnText, isFollowed && { color: ORANGE }]}>
                                {isFollowed ? "Following" : "Follow"}
                            </Text>
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Workout Hours Graph ── */}
                <Animated.View entering={FadeInDown.delay(120).duration(400).easing(Easing.out(Easing.cubic))} style={styles.graphCard}>
                    <View style={styles.graphCardAccent} />
                    <View style={styles.graphHeader}>
                        <View>
                            <Text allowFontScaling={false} style={styles.graphEyebrow}>ACTIVITY</Text>
                            <Text allowFontScaling={false} style={styles.graphTitle}>{totalHours} hours</Text>
                        </View>
                        <View style={styles.graphBadge}>
                            <Text allowFontScaling={false} style={styles.graphBadgeText}>2 weeks ago</Text>
                        </View>
                    </View>
                    <BarGraph
                        hours={GRAPH_HOURS}
                        labels={GRAPH_LABELS}
                        onBarTap={(i) => {
                            Haptics.selectionAsync();
                        }}
                    />
                </Animated.View>

                {/* ── Routines ── */}
                <Animated.View entering={FadeInDown.delay(160).duration(380).easing(Easing.out(Easing.cubic))}>
                    <View style={styles.sectionHeader}>
                        <Text allowFontScaling={false} style={styles.sectionEyebrow}>SAVED</Text>
                        <Text allowFontScaling={false} style={styles.sectionTitle}>Routines</Text>
                    </View>
                    <View style={styles.routinesRow}>
                        {["Upper Body +\nCardio", "Lower Body +\nAbs #1"].map((title, i) => {
                            const { style, onIn, onOut } = usePressScale(0.97);
                            return (
                                <TouchableOpacity key={i} onPressIn={onIn} onPressOut={onOut} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} activeOpacity={1} style={{ flex: 1 }}>
                                    <Animated.View style={[styles.routineCard, style]}>
                                        <View style={styles.routineIcon}>
                                            <Ionicons name="barbell-outline" size={16} color={ORANGE} />
                                        </View>
                                        <Text allowFontScaling={false} style={styles.routineTitle}>{title}</Text>
                                        <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.3)" />
                                    </Animated.View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* ── Recent Workouts ── */}
                <Animated.View entering={FadeInDown.delay(200).duration(380).easing(Easing.out(Easing.cubic))} style={{ marginTop: 24 }}>
                    <View style={styles.sectionHeader}>
                        <Text allowFontScaling={false} style={styles.sectionEyebrow}>HISTORY</Text>
                        <Text allowFontScaling={false} style={styles.sectionTitle}>Recent Workouts</Text>
                    </View>
                </Animated.View>

                {posts.map((post, idx) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        index={idx}
                        isLiked={likedPostIds.has(post.id)}
                        onLike={() => toggleLike(post.id)}
                        onComment={() => openComments(post)}
                        onShare={async () => {
                            Haptics.selectionAsync();
                            try { await Share.share({ message: `BearFit Workout\n@${post.athlete.username}\n${post.caption}` }); } catch {}
                        }}
                        onPostPress={() => router.push({ pathname: "/(tabs)/home/post-detail", params: { postId: post.id, caption: post.caption, username: post.athlete.username, name: post.athlete.name, avatarUrl: post.athlete.avatarUrl } })}
                    />
                ))}
            </ScrollView>

            {/* ── More Sheet ── */}
            <Modal visible={moreOpen} transparent animationType="none">
                <Pressable style={styles.backdrop} onPress={() => setMoreOpen(false)} />
                <Animated.View style={[styles.bottomSheet, moreSheetStyle]}>
                    <View style={styles.sheetHandle} />
                    {[
                        { label: "Workout Notifications", icon: "notifications-outline" },
                        { label: "Report User",           icon: "flag-outline"          },
                        { label: "Block User",            icon: "ban-outline"           },
                    ].map((item, i) => (
                        <TouchableOpacity key={item.label} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMoreOpen(false); }} activeOpacity={0.7}>
                            <Animated.View entering={FadeInUp.delay(i * 40).duration(260)} style={styles.sheetItem}>
                                <View style={styles.sheetItemIcon}>
                                    <Ionicons name={item.icon as any} size={18} color={ORANGE} />
                                </View>
                                <Text allowFontScaling={false} style={styles.sheetItemText}>{item.label}</Text>
                                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
                            </Animated.View>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            </Modal>

            {/* ── Zoom Avatar ── */}
            <Modal visible={zoomOpen} transparent animationType="fade">
                <Pressable style={styles.zoomBackdrop} onPress={() => setZoomOpen(false)}>
                    <Animated.View entering={ZoomIn.duration(260).springify().damping(18)} style={styles.zoomCard}>
                        <BlurView intensity={30} tint="dark" style={styles.zoomBlur}>
                            <Image source={{ uri: athlete.avatarUrl }} style={styles.zoomAvatar} />
                            <Text allowFontScaling={false} style={styles.zoomUsername}>@{athlete.username}</Text>
                        </BlurView>
                    </Animated.View>
                </Pressable>
                <TouchableOpacity onPress={() => setZoomOpen(false)} style={styles.zoomClose}>
                    <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
            </Modal>

            {/* ── List Modal (Followers / Following / Workouts) ── */}
            <Modal visible={listModal.open} transparent animationType="none">
                <Pressable style={styles.backdrop} onPress={() => setListModal((p) => ({ ...p, open: false }))} />
                <Animated.View style={[styles.bottomSheet, styles.listSheet, listSheetStyle]}>
                    <View style={styles.sheetHandle} />
                    <Text allowFontScaling={false} style={styles.sheetTitle}>{listModal.title}</Text>
                    <FlatList
                        data={Array.from({ length: 18 }, (_, i) => ({ id: `${i}`, label: `${listModal.title} ${i + 1}`, sub: `@user${100 + i}` }))}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={styles.listDivider} />}
                        renderItem={({ item, index }) => (
                            <Animated.View entering={FadeInDown.delay(index * 20).duration(200)} style={styles.listRow}>
                                <View style={styles.listAvatar} />
                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={styles.listName}>{item.label}</Text>
                                    <Text allowFontScaling={false} style={styles.listSub}>{item.sub}</Text>
                                </View>
                                <TouchableOpacity style={styles.listViewBtn} activeOpacity={0.7}>
                                    <Text allowFontScaling={false} style={styles.listViewText}>View</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    />
                </Animated.View>
            </Modal>

            {/* ── Comments Sheet ── */}
            <Modal visible={commentsModal.open} transparent animationType="none">
                <Pressable style={styles.backdrop} onPress={() => { setCommentsModal((p) => ({ ...p, open: false })); setReplyingTo(null); }} />
                <KeyboardAvoidingView behavior={IS_ANDROID ? "height" : "padding"} style={styles.kavWrap}>
                    <Animated.View style={[styles.commentsSheet, commentsSheetStyle]}>
                        <View style={styles.sheetHandle} />
                        <Text allowFontScaling={false} style={styles.sheetTitle}>Comments</Text>

                        <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {commentsModal.post && (commentsByPost[commentsModal.post.id] ?? []).map((c, idx) => (
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
                                                    <TouchableOpacity onPress={() => commentsModal.post && toggleReplies(commentsModal.post.id, c.id)} style={styles.viewRepliesBtn}>
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
                                                    <CommentLike liked={r.liked} count={r.likes} onPress={() => commentsModal.post && likeReply(commentsModal.post.id, c.id, r.id)} />
                                                </View>
                                            ))}
                                        </View>
                                        <CommentLike liked={c.liked} count={c.likes} onPress={() => commentsModal.post && likeComment(commentsModal.post.id, c.id)} />
                                    </View>
                                    {idx < (commentsModal.post ? (commentsByPost[commentsModal.post.id] ?? []).length : 0) - 1 && <View style={styles.commentDivider} />}
                                </Animated.View>
                            ))}
                        </ScrollView>

                        {/* Emoji row */}
                        <View style={styles.emojiRow}>
                            {QUICK_EMOJIS.map((emoji) => (
                                <TouchableOpacity key={emoji} onPress={() => { Haptics.selectionAsync(); setCommentDraft((p) => `${p}${emoji}`); }} style={styles.emojiBtn}>
                                    <Text style={styles.emojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

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
        </SafeAreaView>
    );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, index, isLiked, onLike, onComment, onShare, onPostPress }: {
    post: Post; index: number; isLiked: boolean;
    onLike: () => void; onComment: () => void;
    onShare: () => void; onPostPress: () => void;
}) {
    const heartScale = useSharedValue(1);
    const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

    const handleLike = () => {
        heartScale.value = withSequence(
            withTiming(0,   { duration: 80  }),
            withTiming(1.3, { duration: 120, easing: Easing.out(Easing.cubic) }),
            withTiming(1,   { duration: 100 })
        );
        onLike();
    };

    return (
        <Animated.View entering={FadeInDown.delay(index * 80).duration(400).easing(Easing.out(Easing.cubic))} style={styles.postCard}>
            <View style={styles.postCardAccent} />

            {/* Header */}
            <View style={styles.postHeader}>
                <View style={styles.postAvatarRing}>
                    <Image source={{ uri: post.athlete.avatarUrl }} style={styles.postAvatar} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text allowFontScaling={false} style={styles.postUsername}>{post.athlete.username}</Text>
                    <Text allowFontScaling={false} style={styles.postTime}>Monday, Nov 29, 2025 · 6:35</Text>
                </View>
            </View>

            <Text allowFontScaling={false} style={styles.postCaption}>{post.caption}</Text>

            {/* Stats */}
            <View style={styles.postStatsRow}>
                {[
                    { label: "Time",         value: post.stats.time   },
                    { label: "Weight taken", value: post.stats.weight },
                    { label: "Sets",         value: post.stats.sets   },
                ].map((s) => (
                    <View key={s.label} style={styles.postStat}>
                        <Text allowFontScaling={false} style={styles.postStatLabel}>{s.label}</Text>
                        <Text allowFontScaling={false} style={styles.postStatValue}>{s.value}</Text>
                    </View>
                ))}
            </View>

            {/* Image */}
            <TouchableOpacity onPress={onPostPress} activeOpacity={0.9}>
                <View style={styles.postImageWrap}>
                    <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
                    <View style={styles.postImageOverlay} />
                    <View style={styles.postImageExpandHint}>
                        <Ionicons name="expand-outline" size={13} color="rgba(255,255,255,0.7)" />
                    </View>
                </View>
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.postActions}>
                <TouchableOpacity onPress={handleLike} activeOpacity={1} style={styles.postActionBtn}>
                    <Animated.View style={heartStyle}>
                        <Ionicons name={isLiked ? "heart" : "heart-outline"} size={IS_ANDROID ? 20 : 22} color={isLiked ? "#FF4D6D" : "rgba(255,255,255,0.7)"} />
                    </Animated.View>
                </TouchableOpacity>
                <Text allowFontScaling={false} style={[styles.postActionCount, isLiked && { color: "#FF4D6D" }]}>100</Text>

                <View style={{ width: 12 }} />

                <TouchableOpacity onPress={onComment} activeOpacity={0.7} style={styles.postActionBtn}>
                    <Ionicons name="chatbubble-outline" size={IS_ANDROID ? 19 : 21} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
                <Text allowFontScaling={false} style={styles.postActionCount}>10</Text>

                <View style={{ flex: 1 }} />

                <TouchableOpacity onPress={onShare} activeOpacity={0.7} style={styles.postActionBtn}>
                    <Ionicons name="share-outline" size={IS_ANDROID ? 19 : 21} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
            </View>

            {/* Liked by */}
            <View style={styles.postLikedBy}>
                <Image source={{ uri: post.athlete.avatarUrl }} style={styles.postTinyAvatar} />
                <Text allowFontScaling={false} style={styles.postLikedByText} numberOfLines={1}>
                    Liked by <Text style={{ color: AppColors.white, fontWeight: "700" }}>darwell</Text> and others
                </Text>
            </View>

            <View style={styles.postDivider} />
        </Animated.View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    bgAccent1: { position: "absolute", width: 260, height: 260, borderRadius: 130, top: -80, right: -80, backgroundColor: "rgba(255,107,53,0.05)" },
    bgAccent2: { position: "absolute", width: 200, height: 200, borderRadius: 100, bottom: 120, left: -60, backgroundColor: "rgba(255,107,53,0.03)" },

    // AppBar
    appbar: { height: IS_ANDROID ? 52 : 58, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    appbarBtn: { width: IS_ANDROID ? 36 : 38, height: IS_ANDROID ? 36 : 38, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.055)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    appbarTitle: { flex: 1, color: AppColors.white, fontSize: IS_ANDROID ? 15 : 16, fontWeight: "700", textAlign: "center", letterSpacing: -0.2 },
    appbarRight: { flexDirection: "row", gap: 6 },

    body: { paddingHorizontal: 14, paddingBottom: 80 },

    // Photo strip
    photoStrip: { paddingBottom: 12, gap: 8 },
    photoStripItem: { width: 110, height: 72, borderRadius: 12, backgroundColor: AppColors.darkBg, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },

    // Profile card
    profileCard: { backgroundColor: AppColors.darkBg, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", padding: IS_ANDROID ? 14 : 16, marginBottom: 14 },
    profileCardAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: ORANGE },
    profileTopRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
    avatarOuter: { position: "relative" },
    avatarRing: { width: IS_ANDROID ? 68 : 76, height: IS_ANDROID ? 68 : 76, borderRadius: IS_ANDROID ? 34 : 38, borderWidth: 2.5, borderColor: "rgba(255,107,53,0.5)", padding: 2 },
    avatar: { width: "100%", height: "100%", borderRadius: IS_ANDROID ? 30 : 34, backgroundColor: AppColors.darkBg },
    onlineDot: { position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: AppColors.green, borderWidth: 2, borderColor: AppColors.darkBg },
    statsRow: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
    statPill: { alignItems: "center", padding: 6 },
    statPillValue: { color: AppColors.white, fontWeight: "800", fontSize: IS_ANDROID ? 17 : 19, letterSpacing: -0.3 },
    statPillLabel: { color: AppColors.grey, fontSize: IS_ANDROID ? 10 : 11, marginTop: 2 },
    profileName: { color: AppColors.white, fontSize: IS_ANDROID ? 16 : 18, fontWeight: "800", letterSpacing: -0.3 },
    profileBio: { color: "rgba(255,255,255,0.75)", fontSize: IS_ANDROID ? 13 : 14, lineHeight: IS_ANDROID ? 20 : 22, marginTop: 6 },
    profileMeta: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, marginTop: 5 },
    followBtn: { height: IS_ANDROID ? 44 : 48, borderRadius: 13, flexDirection: "row", alignItems: "center", justifyContent: "center" },
    followBtnText: { color: BG, fontWeight: "800", fontSize: IS_ANDROID ? 14 : 15 },

    // Graph card
    graphCard: { backgroundColor: AppColors.darkBg, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", padding: IS_ANDROID ? 14 : 16, marginBottom: 14 },
    graphCardAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: ORANGE },
    graphHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
    graphEyebrow: { fontSize: 9, fontWeight: "700", color: ORANGE, letterSpacing: 2.5, marginBottom: 3 },
    graphTitle: { color: AppColors.white, fontSize: IS_ANDROID ? 20 : 22, fontWeight: "800", letterSpacing: -0.5 },
    graphBadge: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
    graphBadgeText: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12 },
    graphWrap: { flexDirection: "row", alignItems: "flex-end", height: 150 },
    barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
    bar: { width: "70%", backgroundColor: ORANGE, borderRadius: 5, minHeight: 4 },
    barLabel: { color: AppColors.grey, fontSize: 7, marginTop: 5, textAlign: "center" },

    // Sections
    sectionHeader: { marginBottom: 10 },
    sectionEyebrow: { fontSize: 9, fontWeight: "700", color: ORANGE, letterSpacing: 2.5, marginBottom: 3 },
    sectionTitle: { color: AppColors.white, fontSize: IS_ANDROID ? 15 : 16, fontWeight: "700" },

    // Routines
    routinesRow: { flexDirection: "row", gap: 10, marginTop: 4 },
    routineCard: { backgroundColor: AppColors.darkBg, borderRadius: 14, padding: IS_ANDROID ? 12 : 14, height: IS_ANDROID ? 76 : 82, justifyContent: "space-between", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    routineIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 6 },
    routineTitle: { color: AppColors.white, fontWeight: "600", fontSize: IS_ANDROID ? 12 : 13, flex: 1 },

    // Post card
    postCard: { backgroundColor: AppColors.darkBg, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginBottom: 14 },
    postCardAccent: { height: 2, backgroundColor: ORANGE, width: "35%", borderBottomRightRadius: 2 },
    postHeader: { flexDirection: "row", alignItems: "center", padding: IS_ANDROID ? 12 : 14, paddingBottom: 8, gap: 10 },
    postAvatarRing: { width: IS_ANDROID ? 38 : 42, height: IS_ANDROID ? 38 : 42, borderRadius: IS_ANDROID ? 19 : 21, borderWidth: 2, borderColor: "rgba(255,107,53,0.4)", padding: 1.5 },
    postAvatar: { width: "100%", height: "100%", borderRadius: IS_ANDROID ? 17 : 19, backgroundColor: AppColors.darkBg },
    postUsername: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    postTime: { color: AppColors.grey, fontSize: IS_ANDROID ? 10 : 11, marginTop: 2 },
    postCaption: { color: "rgba(255,255,255,0.88)", fontSize: IS_ANDROID ? 14 : 15, fontWeight: "700", paddingHorizontal: IS_ANDROID ? 12 : 14, marginBottom: 10 },
    postStatsRow: { flexDirection: "row", paddingHorizontal: IS_ANDROID ? 12 : 14, marginBottom: 12, gap: IS_ANDROID ? 16 : 20 },
    postStat: {},
    postStatLabel: { color: AppColors.grey, fontSize: IS_ANDROID ? 10 : 11, marginBottom: 2 },
    postStatValue: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    postImageWrap: { position: "relative", marginHorizontal: IS_ANDROID ? 12 : 14, borderRadius: 14, overflow: "hidden" },
    postImage: { width: "100%", aspectRatio: 1.05, backgroundColor: AppColors.darkBg },
    postImageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 50, backgroundColor: "rgba(0,0,0,0.2)" },
    postImageExpandHint: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 7, padding: 4 },
    postActions: { flexDirection: "row", alignItems: "center", paddingHorizontal: IS_ANDROID ? 12 : 14, paddingTop: IS_ANDROID ? 10 : 12, paddingBottom: 4 },
    postActionBtn: { width: IS_ANDROID ? 36 : 38, height: IS_ANDROID ? 36 : 38, alignItems: "center", justifyContent: "center" },
    postActionCount: { color: "rgba(255,255,255,0.7)", fontSize: IS_ANDROID ? 13 : 14, fontWeight: "600" },
    postLikedBy: { flexDirection: "row", alignItems: "center", paddingHorizontal: IS_ANDROID ? 12 : 14, paddingBottom: 12, gap: 8 },
    postTinyAvatar: { width: IS_ANDROID ? 18 : 20, height: IS_ANDROID ? 18 : 20, borderRadius: IS_ANDROID ? 9 : 10, backgroundColor: AppColors.darkBg },
    postLikedByText: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, flex: 1 },
    postDivider: { height: 0 },

    // Sheets
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
    kavWrap: { position: "absolute", left: 0, right: 0, bottom: 0, top: 0, justifyContent: "flex-end" },
    sheetHandle: { width: 40, height: 4, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center", marginBottom: 14 },
    sheetTitle: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 15 : 16, textAlign: "center", marginBottom: 14 },

    bottomSheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#0E0E0E", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: IS_ANDROID ? 24 : 34, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)" },
    sheetItem: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: IS_ANDROID ? 12 : 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
    sheetItemIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center" },
    sheetItemText: { color: AppColors.white, fontSize: IS_ANDROID ? 14 : 15, fontWeight: "600", flex: 1 },

    listSheet: { maxHeight: "80%" },
    listDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
    listRow: { flexDirection: "row", alignItems: "center", paddingVertical: IS_ANDROID ? 10 : 12, gap: 12 },
    listAvatar: { width: IS_ANDROID ? 38 : 42, height: IS_ANDROID ? 38 : 42, borderRadius: IS_ANDROID ? 19 : 21, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1.5, borderColor: "rgba(255,107,53,0.2)" },
    listName: { color: AppColors.white, fontWeight: "600", fontSize: IS_ANDROID ? 13 : 14 },
    listSub: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, marginTop: 2 },
    listViewBtn: { backgroundColor: "rgba(255,107,53,0.12)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    listViewText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "700" },

    // Zoom
    zoomBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center" },
    zoomCard: { borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    zoomBlur: { padding: 24, alignItems: "center" },
    zoomAvatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: "rgba(255,107,53,0.5)" },
    zoomUsername: { color: AppColors.white, fontWeight: "700", fontSize: 15, marginTop: 12 },
    zoomClose: { position: "absolute", top: 50, right: 18, width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },

    // Comments
    commentsSheet: { backgroundColor: "#0E0E0E", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: IS_ANDROID ? 16 : 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)", maxHeight: "85%" },
    commentsList: { maxHeight: IS_ANDROID ? 260 : 310, paddingHorizontal: 14 },
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
});
