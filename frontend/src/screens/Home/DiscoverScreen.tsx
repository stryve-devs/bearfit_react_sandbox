import React, { useMemo, useRef, useState, useEffect } from "react";
import {
    FlatList,
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
    useWindowDimensions,
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
    runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { AppColors } from "../../constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
type Athlete = { name: string; username: string; avatarUrl: string };
type Comment = {
    id: string; user: string; avatarUrl: string;
    text: string; time: string; likes: number; liked: boolean;
    replies: Reply[]; showReplies: boolean;
};
type Reply = {
    id: string; user: string; avatarUrl: string;
    text: string; time: string; likes: number; liked: boolean;
};
type Post = {
    id: string; caption: string; time: string;
    stats: { time: string; bpm?: string; reps?: string; weight?: string; distance?: string };
    athlete: Athlete;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ORANGE     = AppColors.orange;
const ORANGE2    = "#cc5500";
const BG         = "#080808";
const TEXT       = "#f0ede8";
const MUTED      = "rgba(240,237,232,0.42)";
const HINT       = "rgba(240,237,232,0.18)";
const IS_ANDROID = Platform.OS === "android";
const SMOOTH     = { duration: 200, easing: Easing.out(Easing.cubic) };
const SMOOTH_IN  = { duration: 160, easing: Easing.in(Easing.cubic) };

const ATHLETES: Athlete[] = [
    { name: "Alex",  username: "alexfit",   avatarUrl: "https://i.pravatar.cc/150?img=12" },
    { name: "Maya",  username: "mayalifts", avatarUrl: "https://i.pravatar.cc/150?img=32" },
    { name: "Noah",  username: "noahrun",   avatarUrl: "https://i.pravatar.cc/150?img=56" },
    { name: "Sara",  username: "sarahit",   avatarUrl: "https://i.pravatar.cc/150?img=3"  },
];

const RANDOM_IMAGES = Array.from({ length: 8 }, (_, i) => `https://picsum.photos/800/800?random=${i + 1}`);
const QUICK_EMOJIS  = ["💪", "🔥", "👏", "🏋️", "👊", "🥵", "🏆"];

const POSTS: Post[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `post-${i}`,
    caption: [
        "back to gym ........ gotta workout a lot",
        "leg day , lets goo",
        "Morning grind 🌅 no days off",
        "PR day! New personal best 💥",
        "Recovery run, feeling good 🏃",
        "Upper body destruction 💪",
        "HIIT session done. Destroyed 🔥",
        "Meal prep Sunday complete ✅",
        "5am club. Rise and grind ⏰",
        "Last set. Best set. Always 🏆",
    ][i % 10],
    time: ["3 hours ago","2 hours ago","1 hour ago","30 min ago","Just now"][i % 5],
    stats: {
        time:     ["1h 0min","1h 25min","45min","2h 10min","30min"][i % 5],
        bpm:      i % 2 === 0 ? "110"      : undefined,
        reps:     i % 2 === 0 ? "10"       : undefined,
        weight:   i % 2 !== 0 ? "4000 kgs" : undefined,
        distance: i % 2 !== 0 ? "4.5 km"   : undefined,
    },
    athlete: ATHLETES[i % ATHLETES.length],
}));

function makeInitialComments(postId: string): Comment[] {
    return [
        { id: `${postId}-c1`, user: "mayalifts", avatarUrl: "https://i.pravatar.cc/150?img=32", text: "Nice work! Keep grinding 💪", time: "2h ago", likes: 4, liked: false, replies: [], showReplies: false },
        { id: `${postId}-c2`, user: "noahrun",   avatarUrl: "https://i.pravatar.cc/150?img=56", text: "🔥🔥🔥 absolute beast mode", time: "1h ago", likes: 2, liked: false, replies: [
                { id: `${postId}-c2-r1`, user: "sarahit", avatarUrl: "https://i.pravatar.cc/150?img=3", text: "Agreed! Legend 🏆", time: "45m ago", likes: 1, liked: false },
            ], showReplies: false },
        { id: `${postId}-c3`, user: "sarahit", avatarUrl: "https://i.pravatar.cc/150?img=3", text: "Great form, what's your PR?", time: "30m ago", likes: 0, liked: false, replies: [], showReplies: false },
    ];
}

// ─── MiniStat ─────────────────────────────────────────────────────────────────
function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <View style={st.miniStat}>
            <Text allowFontScaling={false} style={st.miniStatLabel}>{label}</Text>
            <Text allowFontScaling={false} style={st.miniStatValue}>{value}</Text>
        </View>
    );
}

// ─── Icon Button ──────────────────────────────────────────────────────────────
function IconButton({ name, onPress, badge }: { name: any; onPress: () => void; badge?: boolean }) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const press = () => {
        runOnJS(Haptics.selectionAsync)();
        scale.value = withSequence(
            withTiming(0.85, { duration: 80,  easing: Easing.out(Easing.cubic) }),
            withTiming(1,    { duration: 150, easing: Easing.out(Easing.cubic) })
        );
        runOnJS(onPress)();
    };
    return (
        <TouchableOpacity onPress={press} activeOpacity={1}>
            <Animated.View style={[st.iconBtn, animStyle]}>
                <Ionicons name={name} size={IS_ANDROID ? 18 : 20} color={ORANGE} />
                {badge && <View style={st.badge} />}
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Follow Button ────────────────────────────────────────────────────────────
function FollowButton({ followed, onPress }: { followed: boolean; onPress: () => void }) {
    const followedVal = useSharedValue(followed ? 1 : 0);
    useEffect(() => { followedVal.value = withTiming(followed ? 1 : 0, SMOOTH); }, [followed]);

    const animStyle = useAnimatedStyle(() => ({
        backgroundColor: `rgba(255,120,37,${interpolate(followedVal.value, [0, 1], [0, 0.14])})`,
        borderColor: ORANGE, borderWidth: 1, borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 5,
        flexDirection: "row" as const, alignItems: "center" as const,
    }));

    const press = () => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(onPress)();
    };

    return (
        <TouchableOpacity onPress={press} activeOpacity={0.8}>
            <Animated.View style={animStyle}>
                {followed
                    ? <Ionicons name="checkmark" size={11} color={ORANGE} style={{ marginRight: 3 }} />
                    : <Ionicons name="add"       size={11} color={ORANGE} style={{ marginRight: 3 }} />
                }
                <Text allowFontScaling={false} style={st.followBtnText}>
                    {followed ? "Following" : "Follow"}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Like Button ──────────────────────────────────────────────────────────────
function LikeButton({ liked, count, onPress }: { liked: boolean; count: number; onPress: () => void }) {
    const heartScale = useSharedValue(1);
    const press = () => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        heartScale.value = withSequence(
            withTiming(0.7,  { duration: 80  }),
            withTiming(1.2,  { duration: 120 }),
            withTiming(1,    { duration: 100 })
        );
        runOnJS(onPress)();
    };
    const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));
    return (
        <TouchableOpacity onPress={press} activeOpacity={1} style={st.likeBtn}>
            <Animated.View style={heartStyle}>
                <Ionicons name={liked ? "heart" : "heart-outline"} size={IS_ANDROID ? 20 : 22}
                          color={liked ? "#FF4D6D" : "rgba(255,255,255,0.7)"} />
            </Animated.View>
            <Text allowFontScaling={false} style={[st.likeCount, liked && { color: "#FF4D6D" }]}>{count}</Text>
        </TouchableOpacity>
    );
}

// ─── Comment Like ─────────────────────────────────────────────────────────────
function CommentLike({ liked, count, onPress }: { liked: boolean; count: number; onPress: () => void }) {
    const scale = useSharedValue(1);
    const press = () => {
        runOnJS(Haptics.selectionAsync)();
        scale.value = withSequence(
            withTiming(0.7,  { duration: 70 }),
            withTiming(1.15, { duration: 100 }),
            withTiming(1,    { duration: 80 })
        );
        runOnJS(onPress)();
    };
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    return (
        <TouchableOpacity onPress={press} activeOpacity={1} style={st.commentLikeRow}>
            <Animated.View style={animStyle}>
                <Ionicons name={liked ? "heart" : "heart-outline"} size={13}
                          color={liked ? "#FF4D6D" : "rgba(255,255,255,0.4)"} />
            </Animated.View>
            {count > 0 && <Text style={st.commentLikeCount}>{count}</Text>}
        </TouchableOpacity>
    );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({
                      item, index, imageUrl, isLiked, isSaved, isFollowed, likeCount,
                      onLike, onSave, onFollow, onComment, onImagePress, onPress, onAvatarPress,
                  }: {
    item: Post; index: number; imageUrl: string;
    isLiked: boolean; isSaved: boolean; isFollowed: boolean; likeCount: number;
    onLike: () => void; onSave: () => void; onFollow: () => void;
    onComment: () => void; onImagePress: () => void;
    onPress: () => void; onAvatarPress: () => void;
}) {
    const cardScale = useSharedValue(1);
    const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));
    const saveScale = useSharedValue(1);
    const saveStyle = useAnimatedStyle(() => ({ transform: [{ scale: saveScale.value }] }));

    const pressSave = () => {
        runOnJS(Haptics.selectionAsync)();
        saveScale.value = withSequence(
            withTiming(0.75, { duration: 80 }),
            withTiming(1,    { duration: 150, easing: Easing.out(Easing.cubic) })
        );
        runOnJS(onSave)();
    };

    return (
        <Animated.View entering={FadeInDown.delay(index * 60).duration(400).easing(Easing.out(Easing.cubic))}>
            <Pressable
                onPressIn={() => { cardScale.value = withTiming(0.988, { duration: 100 }); }}
                onPressOut={() => { cardScale.value = withTiming(1, { duration: 180 }); }}
                onPress={onPress}
            >
                <Animated.View style={cardStyle}>
                    <LinearGradient
                        colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={st.card}
                    >
                        {/* Top shine */}
                        <LinearGradient
                            colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={st.cardShine} pointerEvents="none"
                        />
                        {/* Orange accent bar */}
                        <LinearGradient
                            colors={[ORANGE, ORANGE2]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={st.cardAccentBar}
                        />

                        {/* Header */}
                        <View style={st.cardHeader}>
                            <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8}>
                                <View style={st.avatarWrap}>
                                    <Image source={{ uri: item.athlete.avatarUrl }} style={st.avatar} />
                                    <View style={st.avatarOnline} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8} style={{ flex: 1 }}>
                                <Text allowFontScaling={false} style={st.username}>{item.athlete.username}</Text>
                                <Text allowFontScaling={false} style={st.time}>{item.time}</Text>
                            </TouchableOpacity>
                            <FollowButton followed={isFollowed} onPress={onFollow} />
                            <View style={{ width: 8 }} />
                            <TouchableOpacity onPress={pressSave} activeOpacity={1}>
                                <Animated.View style={saveStyle}>
                                    <Ionicons
                                        name={isSaved ? "bookmark" : "bookmark-outline"}
                                        size={IS_ANDROID ? 18 : 20}
                                        color={isSaved ? ORANGE : "rgba(255,255,255,0.5)"}
                                    />
                                </Animated.View>
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: IS_ANDROID ? 10 : 12 }} />
                        <Text allowFontScaling={false} style={st.caption}>{item.caption}</Text>

                        {/* Stats */}
                        <View style={st.statsRow}>
                            <MiniStat label="Time" value={item.stats.time} />
                            {item.stats.bpm      && <MiniStat label="Avg bpm"      value={item.stats.bpm} />}
                            {item.stats.reps     && <MiniStat label="Reps"         value={item.stats.reps} />}
                            {item.stats.weight   && <MiniStat label="Weight taken" value={item.stats.weight} />}
                            {item.stats.distance && <MiniStat label="Distance"     value={item.stats.distance} />}
                        </View>

                        {/* Image */}
                        <TouchableOpacity onPress={onImagePress} activeOpacity={0.92}>
                            <View style={st.imageWrap}>
                                <Image source={{ uri: imageUrl }} style={st.postImage} />
                                <View style={st.imageOverlay} />
                            </View>
                        </TouchableOpacity>

                        {/* Actions */}
                        <View style={st.actionRow}>
                            <LikeButton liked={isLiked} count={likeCount} onPress={onLike} />
                            <TouchableOpacity onPress={onComment} activeOpacity={0.7} style={st.commentBtn}>
                                <Ionicons name="chatbubble-outline" size={IS_ANDROID ? 18 : 20} color="rgba(255,255,255,0.6)" />
                                <Text allowFontScaling={false} style={st.commentCount}>
                                    {["24","12","8","16","5"][index % 5]}
                                </Text>
                            </TouchableOpacity>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity onPress={() => Haptics.selectionAsync()} activeOpacity={0.7} style={st.shareBtn}>
                                <Ionicons name="arrow-redo-outline" size={IS_ANDROID ? 18 : 20} color="rgba(255,255,255,0.4)" />
                            </TouchableOpacity>
                        </View>

                        {/* Liked by */}
                        <View style={st.likedByRow}>
                            <Image source={{ uri: item.athlete.avatarUrl }} style={st.tinyAvatar} />
                            <Image source={{ uri: ATHLETES[(ATHLETES.indexOf(item.athlete) + 1) % ATHLETES.length].avatarUrl }} style={[st.tinyAvatar, { marginLeft: -8 }]} />
                            <Text allowFontScaling={false} numberOfLines={1} style={st.likedByText}>
                                Liked by <Text style={{ color: TEXT, fontWeight: "700" }}>{item.athlete.username}</Text> and others
                            </Text>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
}

// ─── MenuItem ─────────────────────────────────────────────────────────────────
function MenuItem({ icon, label, active, onPress }: { icon: any; label: string; active?: boolean; onPress: () => void }) {
    const press = () => { runOnJS(Haptics.selectionAsync)(); runOnJS(onPress)(); };
    return (
        <TouchableOpacity onPress={press} activeOpacity={0.8}>
            <View style={[st.menuItem, active && st.menuItemActive]}>
                <View style={[st.menuIconWrap, active && st.menuIconActive]}>
                    <Ionicons name={icon} size={15} color={active ? ORANGE : "rgba(255,255,255,0.5)"} />
                </View>
                <Text allowFontScaling={false} style={[st.menuText, active && st.menuTextActive]}>{label}</Text>
                {active && <View style={st.activeDot} />}
            </View>
        </TouchableOpacity>
    );
}

// ─── DiscoverScreen ───────────────────────────────────────────────────────────
export default function DiscoverScreen() {
    const { width } = useWindowDimensions();

    const [likedIds,    setLikedIds]    = useState<Set<string>>(new Set());
    const [savedIds,    setSavedIds]    = useState<Set<string>>(new Set());
    const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
    const [likeCounts,  setLikeCounts]  = useState<Record<string, number>>(() =>
        Object.fromEntries(POSTS.map((p) => [p.id, Math.floor(Math.random() * 200) + 50]))
    );

    const [menuOpen,     setMenuOpen]     = useState(false);
    const [searchOpen,   setSearchOpen]   = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [query,        setQuery]        = useState("");
    const [activePostId, setActivePostId] = useState<string | null>(null);

    const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>(() =>
        Object.fromEntries(POSTS.map((p) => [p.id, makeInitialComments(p.id)]))
    );
    const [commentDraft, setCommentDraft] = useState("");
    const [replyingTo,   setReplyingTo]   = useState<{ commentId: string; user: string } | null>(null);

    const postImageMap = useRef<Record<string, string>>({});
    const imageForPost = (post: Post, index: number) => {
        if (!postImageMap.current[post.id]) {
            postImageMap.current[post.id] = RANDOM_IMAGES[index % RANDOM_IMAGES.length];
        }
        return postImageMap.current[post.id];
    };

    const menuOpacity = useSharedValue(0);
    const menuScale   = useSharedValue(0.92);
    const sheetY      = useSharedValue(700);

    useEffect(() => {
        if (menuOpen) {
            menuOpacity.value = withTiming(1, SMOOTH);
            menuScale.value   = withTiming(1, SMOOTH);
        } else {
            menuOpacity.value = withTiming(0, SMOOTH_IN);
            menuScale.value   = withTiming(0.92, SMOOTH_IN);
        }
    }, [menuOpen]);

    useEffect(() => {
        sheetY.value = commentsOpen
            ? withTiming(0,   { duration: 320, easing: Easing.out(Easing.cubic) })
            : withTiming(700, { duration: 280, easing: Easing.in(Easing.cubic) });
    }, [commentsOpen]);

    const menuAnimStyle  = useAnimatedStyle(() => ({ opacity: menuOpacity.value, transform: [{ scale: menuScale.value }] }));
    const sheetAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }] }));

    const filteredPosts = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return POSTS;
        return POSTS.filter((p) => `${p.athlete.name} ${p.athlete.username} ${p.caption}`.toLowerCase().includes(q));
    }, [query]);

    const toggleLike = (id: string) => {
        setLikedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); setLikeCounts((c) => ({ ...c, [id]: (c[id] ?? 1) - 1 })); }
            else              { next.add(id);    setLikeCounts((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 })); }
            return next;
        });
    };

    const openComments = (postId: string) => {
        setActivePostId(postId); setCommentDraft(""); setReplyingTo(null); setCommentsOpen(true);
    };
    const closeComments = () => { setCommentsOpen(false); setReplyingTo(null); setCommentDraft(""); };

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
                    ? { ...c, replies: c.replies.map((r) =>
                            r.id === replyId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r
                        )} : c
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
        if (!activePostId || !commentDraft.trim()) return;
        const text = commentDraft.trim();
        if (replyingTo) {
            const newReply: Reply = {
                id: `${activePostId}-r-${Date.now()}`, user: "you",
                avatarUrl: "https://i.pravatar.cc/150?img=10",
                text, time: "just now", likes: 0, liked: false,
            };
            setCommentsByPost((prev) => ({
                ...prev,
                [activePostId]: (prev[activePostId] ?? []).map((c) =>
                    c.id === replyingTo.commentId
                        ? { ...c, replies: [...c.replies, newReply], showReplies: true } : c
                ),
            }));
        } else {
            const newComment: Comment = {
                id: `${activePostId}-c-${Date.now()}`, user: "you",
                avatarUrl: "https://i.pravatar.cc/150?img=10",
                text, time: "just now", likes: 0, liked: false, replies: [], showReplies: false,
            };
            setCommentsByPost((prev) => ({
                ...prev,
                [activePostId]: [...(prev[activePostId] ?? []), newComment],
            }));
        }
        setCommentDraft(""); setReplyingTo(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const activeComments = activePostId ? (commentsByPost[activePostId] ?? []) : [];

    return (
        <LinearGradient
            colors={["#0e0e11", "#0a0906", "#080808", "#0a0906", "#0b0b0e"]}
            locations={[0, 0.2, 0.5, 0.75, 1]}
            start={{ x: 0.16, y: 0 }} end={{ x: 0.84, y: 1 }}
            style={{ flex: 1 }}
        >
            <LinearGradient
                colors={["rgba(255,100,20,0.05)", "transparent"]}
                start={{ x: 1, y: 0 }} end={{ x: 0.3, y: 0.4 }}
                style={StyleSheet.absoluteFill} pointerEvents="none"
            />

            <SafeAreaView style={st.safe} edges={["top", "left", "right"]}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                {/* ── Header ── */}
                <Animated.View
                    entering={FadeInDown.duration(400).easing(Easing.out(Easing.cubic))}
                    style={st.header}
                >
                    <TouchableOpacity
                        onPress={() => { Haptics.selectionAsync(); setMenuOpen(true); }}
                        style={st.titleRow} activeOpacity={0.7}
                    >
                        <Text allowFontScaling={false} style={st.title}>Discover</Text>
                        <View style={st.chevronWrap}>
                            <Ionicons name="chevron-down" size={12} color={ORANGE} />
                        </View>
                    </TouchableOpacity>
                    <View style={st.actions}>
                        <IconButton name="search-outline"        onPress={() => setSearchOpen(true)} />
                        <IconButton name="notifications-outline" onPress={() => router.push("/(tabs)/home/notifications")} badge />
                    </View>
                </Animated.View>

                {/* ── Feed ── */}
                <FlatList
                    contentContainerStyle={st.list}
                    data={filteredPosts}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={{ height: IS_ANDROID ? 12 : 14 }} />}
                    renderItem={({ item, index }) => (
                        <PostCard
                            item={item} index={index}
                            imageUrl={imageForPost(item, index)}
                            isLiked={likedIds.has(item.id)}
                            isSaved={savedIds.has(item.id)}
                            isFollowed={followedIds.has(item.athlete.username)}
                            likeCount={likeCounts[item.id] ?? 120}
                            onLike={() => toggleLike(item.id)}
                            onSave={() => setSavedIds((prev) => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; })}
                            onFollow={() => setFollowedIds((prev) => { const n = new Set(prev); n.has(item.athlete.username) ? n.delete(item.athlete.username) : n.add(item.athlete.username); return n; })}
                            onComment={() => openComments(item.id)}
                            onImagePress={() => router.push({ pathname: "/(tabs)/home/full-image", params: { imageUrl: imageForPost(item, index), caption: item.caption, username: item.athlete.username } })}
                            onPress={() => router.push({ pathname: "/(tabs)/home/post-detail", params: { id: item.id, caption: item.caption, username: item.athlete.username, name: item.athlete.name, avatarUrl: item.athlete.avatarUrl } })}
                            onAvatarPress={() => router.push({ pathname: "/(tabs)/profile", params: { athleteName: item.athlete.name, athleteUsername: item.athlete.username, athleteAvatarUrl: item.athlete.avatarUrl } })}
                        />
                    )}
                />

                {/* ── Dropdown Menu ── */}
                <Modal visible={menuOpen} transparent animationType="none">
                    <Pressable style={st.backdrop} onPress={() => setMenuOpen(false)} />
                    <Animated.View style={[st.menu, menuAnimStyle]}>
                        <BlurView intensity={60} tint="dark" style={st.menuBlur}>
                            <MenuItem icon="home-outline"    label="Home (Following)" onPress={() => { setMenuOpen(false); router.push("/(tabs)/home"); }} />
                            <View style={st.menuDivider} />
                            <MenuItem icon="compass-outline" label="Discover" active   onPress={() => setMenuOpen(false)} />
                        </BlurView>
                    </Animated.View>
                </Modal>

                {/* ── Search Modal ── */}
                <Modal visible={searchOpen} animationType="slide">
                    <LinearGradient
                        colors={["#0e0e11", "#080808", "#0b0b0e"]}
                        start={{ x: 0.16, y: 0 }} end={{ x: 0.84, y: 1 }}
                        style={{ flex: 1 }}
                    >
                        <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
                            <Animated.View
                                entering={FadeInDown.duration(280).easing(Easing.out(Easing.cubic))}
                                style={st.searchHeader}
                            >
                                <TouchableOpacity
                                    onPress={() => { setSearchOpen(false); setQuery(""); }}
                                    style={st.backBtn}
                                >
                                    <Ionicons name="arrow-back" size={IS_ANDROID ? 18 : 20} color={TEXT} />
                                </TouchableOpacity>
                                <LinearGradient
                                    colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.04)"]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={st.searchBar}
                                >
                                    <Ionicons name="search" size={15} color={MUTED} />
                                    <TextInput
                                        value={query} onChangeText={setQuery}
                                        placeholder="Search athletes or captions..."
                                        placeholderTextColor={HINT}
                                        style={st.searchInput} autoFocus allowFontScaling={false}
                                        selectionColor={ORANGE}
                                    />
                                    {query.length > 0 && (
                                        <TouchableOpacity onPress={() => setQuery("")}>
                                            <Ionicons name="close-circle" size={15} color={MUTED} />
                                        </TouchableOpacity>
                                    )}
                                </LinearGradient>
                            </Animated.View>

                            {filteredPosts.length === 0 ? (
                                <Animated.View entering={FadeIn.duration(260)} style={st.emptySearch}>
                                    <View style={st.emptyIconWrap}>
                                        <Ionicons name="search" size={32} color={MUTED} />
                                    </View>
                                    <Text allowFontScaling={false} style={st.emptyText}>No results found</Text>
                                </Animated.View>
                            ) : (
                                <FlatList
                                    data={filteredPosts}
                                    keyExtractor={(p) => p.id}
                                    contentContainerStyle={{ paddingBottom: 40 }}
                                    ItemSeparatorComponent={() => <View style={{ height: 0.5, backgroundColor: "rgba(255,255,255,0.05)" }} />}
                                    renderItem={({ item, index }) => (
                                        <Animated.View entering={FadeInDown.delay(index * 35).duration(280).easing(Easing.out(Easing.cubic))}>
                                            <TouchableOpacity
                                                onPress={() => { setSearchOpen(false); setQuery(""); router.push({ pathname: "/(tabs)/home/post-detail", params: { id: item.id, caption: item.caption, username: item.athlete.username, name: item.athlete.name, avatarUrl: item.athlete.avatarUrl } }); }}
                                                style={st.searchRow} activeOpacity={0.7}
                                            >
                                                <View style={st.searchAvatarWrap}>
                                                    <Image source={{ uri: item.athlete.avatarUrl }} style={st.searchAvatar} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text allowFontScaling={false} style={st.searchName}>{item.athlete.name}</Text>
                                                    <Text allowFontScaling={false} style={st.searchCaption} numberOfLines={1}>{item.caption}</Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={14} color={MUTED} />
                                            </TouchableOpacity>
                                        </Animated.View>
                                    )}
                                />
                            )}
                        </SafeAreaView>
                    </LinearGradient>
                </Modal>

                {/* ── Comments Sheet ── */}
                <Modal visible={commentsOpen} transparent animationType="none">
                    <Pressable style={st.backdrop} onPress={closeComments} />
                    <KeyboardAvoidingView behavior={IS_ANDROID ? "height" : "padding"} style={st.sheetKav}>
                        <Animated.View style={[st.commentsSheet, sheetAnimStyle]}>
                            <View style={st.sheetHandle} />
                            <Text allowFontScaling={false} style={st.sheetTitle}>Comments</Text>

                            <ScrollView style={st.commentsList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                {activeComments.length === 0 ? (
                                    <View style={st.emptyComments}>
                                        <Ionicons name="chatbubble-outline" size={32} color={MUTED} />
                                        <Text allowFontScaling={false} style={st.emptyCommentsText}>No comments yet. Be first!</Text>
                                    </View>
                                ) : (
                                    activeComments.map((c, idx) => (
                                        <Animated.View key={c.id} entering={FadeInDown.delay(idx * 30).duration(260).easing(Easing.out(Easing.cubic))}>
                                            <View style={st.commentItem}>
                                                <Image source={{ uri: c.avatarUrl }} style={st.commentAvatar} />
                                                <View style={{ flex: 1 }}>
                                                    <View style={st.commentTopRow}>
                                                        <Text allowFontScaling={false} style={st.commentUser}>{c.user}</Text>
                                                        <Text allowFontScaling={false} style={st.commentTime}>{c.time}</Text>
                                                    </View>
                                                    <Text allowFontScaling={false} style={st.commentText}>{c.text}</Text>
                                                    <View style={st.commentActions}>
                                                        <TouchableOpacity
                                                            onPress={() => { Haptics.selectionAsync(); setReplyingTo({ commentId: c.id, user: c.user }); }}
                                                            style={st.replyBtn}
                                                        >
                                                            <Text allowFontScaling={false} style={st.replyBtnText}>Reply</Text>
                                                        </TouchableOpacity>
                                                        {c.replies.length > 0 && (
                                                            <TouchableOpacity
                                                                onPress={() => activePostId && toggleReplies(activePostId, c.id)}
                                                                style={st.viewRepliesBtn}
                                                            >
                                                                <Ionicons name={c.showReplies ? "chevron-up" : "chevron-down"} size={11} color={ORANGE} />
                                                                <Text allowFontScaling={false} style={st.viewRepliesText}>
                                                                    {c.showReplies ? "Hide" : `${c.replies.length}`} {c.replies.length === 1 ? "reply" : "replies"}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                    {c.showReplies && c.replies.map((r) => (
                                                        <View key={r.id} style={st.replyItem}>
                                                            <Image source={{ uri: r.avatarUrl }} style={st.replyAvatar} />
                                                            <View style={{ flex: 1 }}>
                                                                <View style={st.commentTopRow}>
                                                                    <Text allowFontScaling={false} style={st.commentUser}>{r.user}</Text>
                                                                    <Text allowFontScaling={false} style={st.commentTime}>{r.time}</Text>
                                                                </View>
                                                                <Text allowFontScaling={false} style={st.commentText}>{r.text}</Text>
                                                            </View>
                                                            <CommentLike liked={r.liked} count={r.likes}
                                                                         onPress={() => activePostId && likeReply(activePostId, c.id, r.id)} />
                                                        </View>
                                                    ))}
                                                </View>
                                                <CommentLike liked={c.liked} count={c.likes}
                                                             onPress={() => activePostId && likeComment(activePostId, c.id)} />
                                            </View>
                                            {idx < activeComments.length - 1 && <View style={st.commentDivider} />}
                                        </Animated.View>
                                    ))
                                )}
                            </ScrollView>

                            {/* Emojis */}
                            <View style={st.emojiRow}>
                                {QUICK_EMOJIS.map((emoji) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        onPress={() => { Haptics.selectionAsync(); setCommentDraft((prev) => `${prev}${emoji}`); }}
                                        style={st.emojiBtn}
                                    >
                                        <Text style={st.emojiText}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Reply banner */}
                            {replyingTo && (
                                <Animated.View entering={FadeIn.duration(200)} style={st.replyBanner}>
                                    <Ionicons name="return-down-forward" size={13} color={ORANGE} />
                                    <Text allowFontScaling={false} style={st.replyBannerText}>
                                        Replying to <Text style={{ color: ORANGE, fontWeight: "700" }}>@{replyingTo.user}</Text>
                                    </Text>
                                    <TouchableOpacity onPress={() => setReplyingTo(null)}>
                                        <Ionicons name="close" size={14} color={MUTED} />
                                    </TouchableOpacity>
                                </Animated.View>
                            )}

                            {/* Input */}
                            <View style={st.commentInputBar}>
                                <LinearGradient
                                    colors={["rgba(255,255,255,0.07)", "rgba(255,255,255,0.04)"]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={st.commentInputGrad}
                                >
                                    <TextInput
                                        value={commentDraft} onChangeText={setCommentDraft}
                                        placeholder={replyingTo ? `Reply to @${replyingTo.user}...` : "Add a comment..."}
                                        placeholderTextColor={HINT}
                                        style={st.commentInput} allowFontScaling={false}
                                        selectionColor={ORANGE}
                                    />
                                </LinearGradient>
                                <TouchableOpacity
                                    onPress={sendComment} activeOpacity={0.8}
                                    style={[st.sendBtn, !commentDraft.trim() && { opacity: 0.4 }]}
                                    disabled={!commentDraft.trim()}
                                >
                                    <LinearGradient
                                        colors={[ORANGE, ORANGE2]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                    <Ionicons name="arrow-up" size={IS_ANDROID ? 18 : 20} color={BG} />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
    safe: { flex: 1 },

    header: {
        height: IS_ANDROID ? 54 : 60, paddingHorizontal: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.05)",
    },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    title: { color: TEXT, fontWeight: "800", fontSize: IS_ANDROID ? 22 : 24, letterSpacing: -0.4 },
    chevronWrap: {
        backgroundColor: "rgba(255,120,37,0.14)", borderRadius: 7, padding: 5,
        borderWidth: 0.5, borderColor: "rgba(255,120,37,0.25)",
    },
    actions: { flexDirection: "row", alignItems: "center", gap: 8 },
    iconBtn: {
        width: IS_ANDROID ? 36 : 38, height: IS_ANDROID ? 36 : 38, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
        alignItems: "center", justifyContent: "center",
    },
    badge: {
        position: "absolute", top: 7, right: 7,
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: ORANGE, borderWidth: 1.5, borderColor: BG,
    },

    list: { paddingHorizontal: 14, paddingTop: IS_ANDROID ? 6 : 8, paddingBottom: 100 },

    // Post card
    card: {
        borderRadius: 18, overflow: "hidden",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        position: "relative",
    },
    cardShine: { position: "absolute", top: 0, left: 0, right: 0, height: 1 },
    cardAccentBar: { height: 2, width: "40%", borderBottomRightRadius: 2 },
    cardHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 12, gap: IS_ANDROID ? 8 : 10 },
    avatarWrap: { position: "relative" },
    avatar: {
        width: IS_ANDROID ? 36 : 40, height: IS_ANDROID ? 36 : 40,
        borderRadius: IS_ANDROID ? 18 : 20, backgroundColor: "#1a1a1a",
        borderWidth: 2, borderColor: "rgba(255,120,37,0.4)",
    },
    avatarOnline: {
        position: "absolute", bottom: 0, right: 0,
        width: 9, height: 9, borderRadius: 5,
        backgroundColor: "#34c759", borderWidth: 1.5, borderColor: BG,
    },
    username: { color: TEXT, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    time: { color: MUTED, fontSize: IS_ANDROID ? 11 : 12, marginTop: 1 },
    followBtnText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "700" },
    caption: { color: "rgba(240,237,232,0.88)", fontSize: IS_ANDROID ? 14 : 15, lineHeight: IS_ANDROID ? 21 : 23, paddingHorizontal: 14 },
    statsRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: IS_ANDROID ? 10 : 12, gap: IS_ANDROID ? 16 : 20 },
    miniStat: {},
    miniStatLabel: { color: MUTED, fontSize: IS_ANDROID ? 10 : 11, marginBottom: 2 },
    miniStatValue: { color: TEXT, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    imageWrap: { position: "relative", marginHorizontal: 14, borderRadius: 14, overflow: "hidden" },
    postImage: { width: "100%", height: IS_ANDROID ? 220 : 250, backgroundColor: "#1a1a1a" },
    imageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 60, backgroundColor: "rgba(0,0,0,0.2)" },
    actionRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: IS_ANDROID ? 10 : 12, paddingBottom: 4 },
    likeBtn: { flexDirection: "row", alignItems: "center", gap: 5, marginRight: 14 },
    likeCount: { color: "rgba(255,255,255,0.7)", fontSize: IS_ANDROID ? 13 : 14, fontWeight: "600" },
    commentBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
    commentCount: { color: "rgba(255,255,255,0.5)", fontSize: IS_ANDROID ? 12 : 13 },
    shareBtn: { padding: 4 },
    likedByRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingBottom: 12, gap: 8, marginTop: 4 },
    tinyAvatar: {
        width: IS_ANDROID ? 18 : 20, height: IS_ANDROID ? 18 : 20,
        borderRadius: IS_ANDROID ? 9 : 10, backgroundColor: "#1a1a1a",
        borderWidth: 1.5, borderColor: BG,
    },
    likedByText: { color: MUTED, fontSize: IS_ANDROID ? 11 : 12, flex: 1 },

    // Menu
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
    menu: {
        position: "absolute", top: IS_ANDROID ? 64 : 72, left: 14,
        width: 250, borderRadius: 18, overflow: "hidden",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
    },
    menuBlur: { padding: 6, backgroundColor: "rgba(10,10,10,0.96)" },
    menuItem: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12 },
    menuItemActive: { backgroundColor: "rgba(255,120,37,0.06)" },
    menuIconWrap: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center", justifyContent: "center", marginRight: 10,
    },
    menuIconActive: { backgroundColor: "rgba(255,120,37,0.14)" },
    menuText: { color: "rgba(255,255,255,0.6)", flex: 1, fontSize: IS_ANDROID ? 14 : 15, fontWeight: "600" },
    menuTextActive: { color: TEXT, fontWeight: "700" },
    activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: ORANGE },
    menuDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.07)", marginHorizontal: 10 },

    // Search
    searchHeader: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, gap: 10,
        borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.05)",
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
        alignItems: "center", justifyContent: "center",
    },
    searchBar: {
        flex: 1, height: IS_ANDROID ? 42 : 46, borderRadius: 14,
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 12, gap: 8,
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden",
    },
    searchInput: { flex: 1, color: TEXT, fontSize: IS_ANDROID ? 13 : 15, paddingVertical: 0 },
    searchRow: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 14, paddingVertical: IS_ANDROID ? 11 : 13, gap: 12,
    },
    searchAvatarWrap: {
        borderWidth: 1.5, borderColor: "rgba(255,120,37,0.3)",
        borderRadius: IS_ANDROID ? 22 : 24, padding: 1.5,
    },
    searchAvatar: {
        width: IS_ANDROID ? 40 : 44, height: IS_ANDROID ? 40 : 44,
        borderRadius: IS_ANDROID ? 20 : 22, backgroundColor: "#1a1a1a",
    },
    searchName: { color: TEXT, fontWeight: "700", fontSize: IS_ANDROID ? 14 : 15 },
    searchCaption: { color: MUTED, fontSize: IS_ANDROID ? 12 : 13, marginTop: 2 },
    emptySearch: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingTop: 80 },
    emptyIconWrap: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: "center", justifyContent: "center",
    },
    emptyText: { color: MUTED, fontSize: IS_ANDROID ? 14 : 15 },

    // Comments sheet
    sheetKav: { position: "absolute", left: 0, right: 0, bottom: 0, top: 0, justifyContent: "flex-end" },
    commentsSheet: {
        backgroundColor: "#0e0d0b",
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingTop: 10, paddingBottom: IS_ANDROID ? 16 : 20,
        borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.09)",
        maxHeight: "85%",
    },
    sheetHandle: {
        width: 40, height: 4, borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignSelf: "center", marginBottom: 10,
    },
    sheetTitle: { color: TEXT, fontWeight: "700", fontSize: IS_ANDROID ? 15 : 16, textAlign: "center", marginBottom: 10 },
    commentsList: { maxHeight: IS_ANDROID ? 280 : 340, paddingHorizontal: 14 },
    emptyComments: { alignItems: "center", justifyContent: "center", paddingVertical: 30, gap: 10 },
    emptyCommentsText: { color: MUTED, fontSize: IS_ANDROID ? 13 : 14 },
    commentItem: { flexDirection: "row", alignItems: "flex-start", paddingVertical: IS_ANDROID ? 10 : 12 },
    commentAvatar: {
        width: IS_ANDROID ? 34 : 38, height: IS_ANDROID ? 34 : 38,
        borderRadius: IS_ANDROID ? 17 : 19, backgroundColor: "#1a1a1a",
        marginRight: 10, borderWidth: 1.5, borderColor: "rgba(255,120,37,0.3)",
    },
    commentTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    commentUser: { color: TEXT, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    commentTime: { color: MUTED, fontSize: IS_ANDROID ? 11 : 12 },
    commentText: { color: "rgba(240,237,232,0.8)", fontSize: IS_ANDROID ? 13 : 14, lineHeight: IS_ANDROID ? 19 : 21 },
    commentActions: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 },
    replyBtn: { paddingVertical: 2 },
    replyBtnText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "700" },
    viewRepliesBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    viewRepliesText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "600" },
    commentLikeRow: { flexDirection: "row", alignItems: "center", gap: 3, paddingLeft: 8, paddingTop: 2 },
    commentLikeCount: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
    commentDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.05)" },
    replyItem: { flexDirection: "row", alignItems: "flex-start", marginTop: 8, paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: "rgba(255,120,37,0.2)" },
    replyAvatar: {
        width: IS_ANDROID ? 26 : 28, height: IS_ANDROID ? 26 : 28,
        borderRadius: IS_ANDROID ? 13 : 14, backgroundColor: "#1a1a1a",
        marginRight: 8, borderWidth: 1, borderColor: "rgba(255,120,37,0.25)",
    },
    replyBanner: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingHorizontal: 14, paddingVertical: 7,
        backgroundColor: "rgba(255,120,37,0.08)",
        borderTopWidth: 0.5, borderTopColor: "rgba(255,120,37,0.15)",
    },
    replyBannerText: { flex: 1, color: "rgba(255,255,255,0.6)", fontSize: IS_ANDROID ? 12 : 13 },
    emojiRow: {
        borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.06)",
        flexDirection: "row", justifyContent: "space-between",
        paddingHorizontal: 16, paddingTop: IS_ANDROID ? 10 : 12,
        paddingBottom: IS_ANDROID ? 8 : 10, marginTop: 4,
    },
    emojiBtn: { paddingHorizontal: 2 },
    emojiText: { fontSize: IS_ANDROID ? 22 : 26 },
    commentInputBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
    commentInputGrad: {
        flex: 1, height: IS_ANDROID ? 46 : 50,
        borderRadius: IS_ANDROID ? 23 : 25,
        flexDirection: "row", alignItems: "center",
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden",
    },
    commentInput: {
        flex: 1, color: TEXT,
        paddingHorizontal: 18, fontSize: IS_ANDROID ? 14 : 15,
        height: "100%",
    },
    sendBtn: {
        width: IS_ANDROID ? 46 : 50, height: IS_ANDROID ? 46 : 50,
        borderRadius: IS_ANDROID ? 23 : 25,
        alignItems: "center", justifyContent: "center",
        overflow: "hidden", position: "relative",
    },
});
