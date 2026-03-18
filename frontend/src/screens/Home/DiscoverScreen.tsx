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
    withRepeat,
    interpolate,
    Easing,
    FadeIn,
    FadeInDown,
    runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { AppColors } from "../../constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
type Athlete = { name: string; username: string; avatarUrl: string };

type Comment = {
    id: string;
    user: string;
    avatarUrl: string;
    text: string;
    time: string;
    likes: number;
    liked: boolean;
    replies: Reply[];
    showReplies: boolean;
};

type Reply = {
    id: string;
    user: string;
    avatarUrl: string;
    text: string;
    time: string;
    likes: number;
    liked: boolean;
};

type Post = {
    id: string;
    caption: string;
    time: string;
    stats: { time: string; bpm?: string; reps?: string; weight?: string; distance?: string };
    athlete: Athlete;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ORANGE     = AppColors.orange;
const BG         = AppColors.black;
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
        { id: `${postId}-c3`, user: "sarahit",   avatarUrl: "https://i.pravatar.cc/150?img=3",  text: "Great form, what's your PR?", time: "30m ago", likes: 0, liked: false, replies: [], showReplies: false },
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

// ─── Icon Button ──────────────────────────────────────────────────────────────
function IconButton({ name, onPress, badge }: { name: any; onPress: () => void; badge?: boolean }) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const press = () => {
        runOnJS(Haptics.selectionAsync)();
        scale.value = withSequence(
            withTiming(0.85, { duration: 80, easing: Easing.out(Easing.cubic) }),
            withTiming(1,    { duration: 150, easing: Easing.out(Easing.cubic) })
        );
        runOnJS(onPress)();
    };
    return (
        <TouchableOpacity onPress={press} activeOpacity={1}>
            <Animated.View style={[styles.iconBtn, animStyle]}>
                <Ionicons name={name} size={IS_ANDROID ? 19 : 21} color={ORANGE} />
                {badge && <View style={styles.badge} />}
            </Animated.View>
        </TouchableOpacity>
    );
}

// ─── Follow Button ────────────────────────────────────────────────────────────
function FollowButton({ followed, onPress }: { followed: boolean; onPress: () => void }) {
    const followed_ = useSharedValue(followed ? 1 : 0);

    useEffect(() => {
        followed_.value = withTiming(followed ? 1 : 0, SMOOTH);
    }, [followed]);

    const animStyle = useAnimatedStyle(() => ({
        backgroundColor: `rgba(255,107,53,${interpolate(followed_.value, [0, 1], [0, 0.12])})`,
        borderColor: ORANGE,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: "row" as const,
        alignItems: "center" as const,
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
                <Text allowFontScaling={false} style={styles.followBtnText}>
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
            withTiming(0.7,  { duration: 80,  easing: Easing.out(Easing.cubic) }),
            withTiming(1.2,  { duration: 120, easing: Easing.out(Easing.cubic) }),
            withTiming(1,    { duration: 100, easing: Easing.out(Easing.cubic) })
        );
        runOnJS(onPress)();
    };

    const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

    return (
        <TouchableOpacity onPress={press} activeOpacity={1} style={styles.likeBtn}>
            <Animated.View style={heartStyle}>
                <Ionicons name={liked ? "heart" : "heart-outline"} size={IS_ANDROID ? 20 : 22} color={liked ? "#FF4D6D" : "rgba(255,255,255,0.7)"} />
            </Animated.View>
            <Text allowFontScaling={false} style={[styles.likeCount, liked && { color: "#FF4D6D" }]}>{count}</Text>
        </TouchableOpacity>
    );
}

// ─── Comment Like Button ──────────────────────────────────────────────────────
function CommentLike({ liked, count, onPress }: { liked: boolean; count: number; onPress: () => void }) {
    const scale = useSharedValue(1);
    const press = () => {
        runOnJS(Haptics.selectionAsync)();
        scale.value = withSequence(
            withTiming(0.7, { duration: 70 }),
            withTiming(1.15, { duration: 100 }),
            withTiming(1,   { duration: 80  })
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

    // Save button
    const saveScale = useSharedValue(1);
    const saveStyle = useAnimatedStyle(() => ({ transform: [{ scale: saveScale.value }] }));
    const pressSave = () => {
        runOnJS(Haptics.selectionAsync)();
        saveScale.value = withSequence(
            withTiming(0.75, { duration: 80 }),
            withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) })
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
                <Animated.View style={[styles.card, cardStyle]}>
                    <View style={styles.cardAccentBar} />

                    {/* Header */}
                    <View style={styles.cardHeader}>
                        <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8}>
                            <View style={styles.avatarWrap}>
                                <Image source={{ uri: item.athlete.avatarUrl }} style={styles.avatar} />
                                <View style={styles.avatarOnline} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8} style={{ flex: 1 }}>
                            <Text allowFontScaling={false} style={styles.username}>{item.athlete.username}</Text>
                            <Text allowFontScaling={false} style={styles.time}>{item.time}</Text>
                        </TouchableOpacity>
                        <FollowButton followed={isFollowed} onPress={onFollow} />
                        <View style={{ width: 8 }} />
                        <TouchableOpacity onPress={pressSave} activeOpacity={1}>
                            <Animated.View style={saveStyle}>
                                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={IS_ANDROID ? 18 : 20} color={isSaved ? ORANGE : "rgba(255,255,255,0.6)"} />
                            </Animated.View>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: IS_ANDROID ? 10 : 12 }} />
                    <Text allowFontScaling={false} style={styles.caption}>{item.caption}</Text>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <MiniStat label="Time" value={item.stats.time} />
                        {item.stats.bpm      && <MiniStat label="Avg bpm"      value={item.stats.bpm} />}
                        {item.stats.reps     && <MiniStat label="Reps"         value={item.stats.reps} />}
                        {item.stats.weight   && <MiniStat label="Weight taken" value={item.stats.weight} />}
                        {item.stats.distance && <MiniStat label="Distance"     value={item.stats.distance} />}
                    </View>

                    {/* Image */}
                    <TouchableOpacity onPress={onImagePress} activeOpacity={0.92}>
                        <View style={styles.imageWrap}>
                            <Image source={{ uri: imageUrl }} style={styles.postImage} />
                            <View style={styles.imageOverlay} />
                        </View>
                    </TouchableOpacity>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                        <LikeButton liked={isLiked} count={likeCount} onPress={onLike} />
                        <TouchableOpacity onPress={onComment} activeOpacity={0.7} style={styles.commentBtn}>
                            <Ionicons name="chatbubble-outline" size={IS_ANDROID ? 18 : 20} color="rgba(255,255,255,0.6)" />
                            <Text allowFontScaling={false} style={styles.commentCount}>
                                {["24","12","8","16","5"][index % 5]}
                            </Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={() => Haptics.selectionAsync()} activeOpacity={0.7} style={styles.shareBtn}>
                            <Ionicons name="arrow-redo-outline" size={IS_ANDROID ? 18 : 20} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </View>

                    {/* Liked by */}
                    <View style={styles.likedByRow}>
                        <Image source={{ uri: item.athlete.avatarUrl }} style={styles.tinyAvatar} />
                        <Image source={{ uri: ATHLETES[(ATHLETES.indexOf(item.athlete) + 1) % ATHLETES.length].avatarUrl }} style={[styles.tinyAvatar, { marginLeft: -8 }]} />
                        <Text allowFontScaling={false} numberOfLines={1} style={styles.likedByText}>
                            Liked by <Text style={{ color: AppColors.white, fontWeight: "700" }}>{item.athlete.username}</Text> and others
                        </Text>
                    </View>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
}

// ─── MenuItem ─────────────────────────────────────────────────────────────────
function MenuItem({ icon, label, active, onPress }: { icon: any; label: string; active?: boolean; onPress: () => void }) {
    const press = () => {
        runOnJS(Haptics.selectionAsync)();
        runOnJS(onPress)();
    };
    return (
        <TouchableOpacity onPress={press} activeOpacity={0.8}>
            <View style={styles.menuItem}>
                <View style={[styles.menuIconWrap, active && styles.menuIconActive]}>
                    <Ionicons name={icon} size={15} color={active ? ORANGE : "#aaa"} />
                </View>
                <Text allowFontScaling={false} style={[styles.menuText, active && styles.menuTextActive]}>{label}</Text>
                {active && <View style={styles.activeDot} />}
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

    // Comments state per post
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

    // Menu animation — smooth, no bounce
    const menuOpacity = useSharedValue(0);
    const menuScale   = useSharedValue(0.92);

    // Comments sheet animation
    const sheetY = useSharedValue(700);

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
        if (commentsOpen) {
            sheetY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
        } else {
            sheetY.value = withTiming(700, { duration: 280, easing: Easing.in(Easing.cubic) });
        }
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
        setActivePostId(postId);
        setCommentDraft("");
        setReplyingTo(null);
        setCommentsOpen(true);
    };

    const closeComments = () => {
        setCommentsOpen(false);
        setReplyingTo(null);
        setCommentDraft("");
    };

    // ── Comment like ─────────────────────────────────────────────────────────
    const likeComment = (postId: string, commentId: string) => {
        setCommentsByPost((prev) => ({
            ...prev,
            [postId]: (prev[postId] ?? []).map((c) =>
                c.id === commentId
                    ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
                    : c
            ),
        }));
    };

    const likeReply = (postId: string, commentId: string, replyId: string) => {
        setCommentsByPost((prev) => ({
            ...prev,
            [postId]: (prev[postId] ?? []).map((c) =>
                c.id === commentId
                    ? { ...c, replies: c.replies.map((r) =>
                            r.id === replyId
                                ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
                                : r
                        )}
                    : c
            ),
        }));
    };

    // ── Toggle show replies ───────────────────────────────────────────────────
    const toggleReplies = (postId: string, commentId: string) => {
        setCommentsByPost((prev) => ({
            ...prev,
            [postId]: (prev[postId] ?? []).map((c) =>
                c.id === commentId ? { ...c, showReplies: !c.showReplies } : c
            ),
        }));
    };

    // ── Send comment or reply ─────────────────────────────────────────────────
    const sendComment = () => {
        if (!activePostId || !commentDraft.trim()) return;
        const text = commentDraft.trim();

        if (replyingTo) {
            // Add reply
            const newReply: Reply = {
                id: `${activePostId}-r-${Date.now()}`,
                user: "you",
                avatarUrl: "https://i.pravatar.cc/150?img=10",
                text,
                time: "just now",
                likes: 0,
                liked: false,
            };
            setCommentsByPost((prev) => ({
                ...prev,
                [activePostId]: (prev[activePostId] ?? []).map((c) =>
                    c.id === replyingTo.commentId
                        ? { ...c, replies: [...c.replies, newReply], showReplies: true }
                        : c
                ),
            }));
        } else {
            // Add top-level comment
            const newComment: Comment = {
                id: `${activePostId}-c-${Date.now()}`,
                user: "you",
                avatarUrl: "https://i.pravatar.cc/150?img=10",
                text,
                time: "just now",
                likes: 0,
                liked: false,
                replies: [],
                showReplies: false,
            };
            setCommentsByPost((prev) => ({
                ...prev,
                [activePostId]: [...(prev[activePostId] ?? []), newComment],
            }));
        }

        setCommentDraft("");
        setReplyingTo(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const activeComments = activePostId ? (commentsByPost[activePostId] ?? []) : [];

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.bgAccent1} />
            <View style={styles.bgAccent2} />

            {/* ── Header ── */}
            <Animated.View entering={FadeInDown.duration(400).easing(Easing.out(Easing.cubic))} style={styles.header}>
                <TouchableOpacity onPress={() => { Haptics.selectionAsync(); setMenuOpen(true); }} style={styles.titleRow} activeOpacity={0.7}>
                    <Text allowFontScaling={false} style={styles.title}>Discover</Text>
                    <View style={styles.chevronWrap}>
                        <Ionicons name="chevron-down" size={13} color={ORANGE} />
                    </View>
                </TouchableOpacity>
                <View style={styles.actions}>
                    <IconButton name="search-outline"        onPress={() => setSearchOpen(true)} />
                    <IconButton name="notifications-outline" onPress={() => router.push("/(tabs)/home/notifications")} badge />
                </View>
            </Animated.View>

            {/* ── Feed ── */}
            <FlatList
                contentContainerStyle={styles.list}
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
                <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
                <Animated.View style={[styles.menu, menuAnimStyle]}>
                    <BlurView intensity={60} tint="dark" style={styles.menuBlur}>
                        <MenuItem icon="home-outline"    label="Home (Following)" onPress={() => { setMenuOpen(false); router.push("/(tabs)/home"); }} />
                        <View style={styles.menuDivider} />
                        <MenuItem icon="compass-outline" label="Discover" active  onPress={() => setMenuOpen(false)} />
                    </BlurView>
                </Animated.View>
            </Modal>

            {/* ── Search Modal ── */}
            <Modal visible={searchOpen} animationType="slide">
                <SafeAreaView style={styles.searchWrap} edges={["top", "left", "right"]}>
                    <Animated.View entering={FadeInDown.duration(280).easing(Easing.out(Easing.cubic))} style={styles.searchHeader}>
                        <TouchableOpacity onPress={() => { setSearchOpen(false); setQuery(""); }} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                        </TouchableOpacity>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={16} color={AppColors.grey} />
                            <TextInput
                                value={query} onChangeText={setQuery}
                                placeholder="Search athletes or captions..."
                                placeholderTextColor={AppColors.grey}
                                style={styles.searchInput} autoFocus allowFontScaling={false}
                            />
                            {query.length > 0 && (
                                <TouchableOpacity onPress={() => setQuery("")}>
                                    <Ionicons name="close-circle" size={16} color={AppColors.grey} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>

                    {filteredPosts.length === 0 ? (
                        <Animated.View entering={FadeIn.duration(260)} style={styles.emptySearch}>
                            <Ionicons name="search" size={40} color={AppColors.darkGrey} />
                            <Text allowFontScaling={false} style={styles.emptyText}>No results found</Text>
                        </Animated.View>
                    ) : (
                        <FlatList
                            data={filteredPosts}
                            keyExtractor={(p) => p.id}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            renderItem={({ item, index }) => (
                                <Animated.View entering={FadeInDown.delay(index * 35).duration(280).easing(Easing.out(Easing.cubic))}>
                                    <TouchableOpacity
                                        onPress={() => { setSearchOpen(false); setQuery(""); router.push({ pathname: "/(tabs)/home/post-detail", params: { id: item.id, caption: item.caption, username: item.athlete.username, name: item.athlete.name, avatarUrl: item.athlete.avatarUrl } }); }}
                                        style={styles.searchRow} activeOpacity={0.7}
                                    >
                                        <Image source={{ uri: item.athlete.avatarUrl }} style={styles.searchAvatar} />
                                        <View style={{ flex: 1 }}>
                                            <Text allowFontScaling={false} style={styles.searchName}>{item.athlete.name}</Text>
                                            <Text allowFontScaling={false} style={styles.searchCaption} numberOfLines={1}>{item.caption}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={14} color={AppColors.grey} />
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        />
                    )}
                </SafeAreaView>
            </Modal>

            {/* ── Comments Sheet ── */}
            <Modal visible={commentsOpen} transparent animationType="none">
                <Pressable style={styles.backdrop} onPress={closeComments} />
                <KeyboardAvoidingView behavior={IS_ANDROID ? "height" : "padding"} style={styles.sheetKav}>
                    <Animated.View style={[styles.commentsSheet, sheetAnimStyle]}>
                        {/* Handle */}
                        <View style={styles.sheetHandle} />
                        <Text allowFontScaling={false} style={styles.sheetTitle}>Comments</Text>

                        {/* Comments List */}
                        <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {activeComments.length === 0 ? (
                                <View style={styles.emptyComments}>
                                    <Ionicons name="chatbubble-outline" size={32} color={AppColors.darkGrey} />
                                    <Text allowFontScaling={false} style={styles.emptyCommentsText}>No comments yet. Be first!</Text>
                                </View>
                            ) : (
                                activeComments.map((c, idx) => (
                                    <Animated.View
                                        key={c.id}
                                        entering={FadeInDown.delay(idx * 30).duration(260).easing(Easing.out(Easing.cubic))}
                                    >
                                        {/* Comment */}
                                        <View style={styles.commentItem}>
                                            <Image source={{ uri: c.avatarUrl }} style={styles.commentAvatar} />
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.commentTopRow}>
                                                    <Text allowFontScaling={false} style={styles.commentUser}>{c.user}</Text>
                                                    <Text allowFontScaling={false} style={styles.commentTime}>{c.time}</Text>
                                                </View>
                                                <Text allowFontScaling={false} style={styles.commentText}>{c.text}</Text>
                                                <View style={styles.commentActions}>
                                                    <TouchableOpacity
                                                        onPress={() => { Haptics.selectionAsync(); setReplyingTo({ commentId: c.id, user: c.user }); }}
                                                        style={styles.replyBtn}
                                                    >
                                                        <Text allowFontScaling={false} style={styles.replyBtnText}>Reply</Text>
                                                    </TouchableOpacity>
                                                    {c.replies.length > 0 && (
                                                        <TouchableOpacity
                                                            onPress={() => activePostId && toggleReplies(activePostId, c.id)}
                                                            style={styles.viewRepliesBtn}
                                                        >
                                                            <Ionicons name={c.showReplies ? "chevron-up" : "chevron-down"} size={11} color={ORANGE} />
                                                            <Text allowFontScaling={false} style={styles.viewRepliesText}>
                                                                {c.showReplies ? "Hide" : `${c.replies.length}`} {c.replies.length === 1 ? "reply" : "replies"}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>

                                                {/* Replies */}
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
                                                        <CommentLike
                                                            liked={r.liked} count={r.likes}
                                                            onPress={() => activePostId && likeReply(activePostId, c.id, r.id)}
                                                        />
                                                    </View>
                                                ))}
                                            </View>
                                            <CommentLike
                                                liked={c.liked} count={c.likes}
                                                onPress={() => activePostId && likeComment(activePostId, c.id)}
                                            />
                                        </View>
                                        {idx < activeComments.length - 1 && <View style={styles.commentDivider} />}
                                    </Animated.View>
                                ))
                            )}
                        </ScrollView>

                        {/* Quick Emojis */}
                        <View style={styles.emojiRow}>
                            {QUICK_EMOJIS.map((emoji) => (
                                <TouchableOpacity
                                    key={emoji}
                                    onPress={() => { Haptics.selectionAsync(); setCommentDraft((prev) => `${prev}${emoji}`); }}
                                    style={styles.emojiBtn}
                                >
                                    <Text style={styles.emojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Reply banner */}
                        {replyingTo && (
                            <Animated.View entering={FadeIn.duration(200)} style={styles.replyBanner}>
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
                            <TouchableOpacity
                                onPress={sendComment}
                                activeOpacity={0.8}
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    bgAccent1: { position: "absolute", width: 260, height: 260, borderRadius: 130, top: -80, right: -80, backgroundColor: "rgba(255,107,53,0.05)" },
    bgAccent2: { position: "absolute", width: 200, height: 200, borderRadius: 100, bottom: 140, left: -60, backgroundColor: "rgba(255,107,53,0.03)" },

    header: { height: IS_ANDROID ? 52 : 58, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    title: { color: AppColors.white, fontWeight: "800", fontSize: IS_ANDROID ? 22 : 24, letterSpacing: -0.4 },
    chevronWrap: { backgroundColor: "rgba(255,107,53,0.18)", borderRadius: 7, padding: 5 },
    actions: { flexDirection: "row", alignItems: "center", gap: 6 },
    iconBtn: { width: IS_ANDROID ? 36 : 38, height: IS_ANDROID ? 36 : 38, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
    badge: { position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: ORANGE, borderWidth: 1.5, borderColor: BG },

    list: { paddingHorizontal: 14, paddingTop: IS_ANDROID ? 6 : 8, paddingBottom: 100 },

    card: { backgroundColor: AppColors.darkBg, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    cardAccentBar: { height: 2, backgroundColor: ORANGE, width: "40%", borderBottomRightRadius: 2 },
    cardHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 12, gap: IS_ANDROID ? 8 : 10 },
    avatarWrap: { position: "relative" },
    avatar: { width: IS_ANDROID ? 36 : 40, height: IS_ANDROID ? 36 : 40, borderRadius: IS_ANDROID ? 18 : 20, backgroundColor: AppColors.darkGrey, borderWidth: 2, borderColor: "rgba(255,107,53,0.4)" },
    avatarOnline: { position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: 5, backgroundColor: AppColors.green, borderWidth: 1.5, borderColor: AppColors.darkBg },
    username: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    time: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, marginTop: 1 },
    followBtnText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "700" },
    caption: { color: "rgba(255,255,255,0.88)", fontSize: IS_ANDROID ? 14 : 15, lineHeight: IS_ANDROID ? 21 : 23, paddingHorizontal: 14 },
    statsRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: IS_ANDROID ? 10 : 12, gap: IS_ANDROID ? 16 : 20 },
    miniStat: {},
    miniStatLabel: { color: AppColors.grey, fontSize: IS_ANDROID ? 10 : 11, marginBottom: 2 },
    miniStatValue: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    imageWrap: { position: "relative", marginHorizontal: 14, borderRadius: 14, overflow: "hidden" },
    postImage: { width: "100%", height: IS_ANDROID ? 220 : 250, backgroundColor: AppColors.darkBg },
    imageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 60, backgroundColor: "rgba(0,0,0,0.2)" },
    actionRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: IS_ANDROID ? 10 : 12, paddingBottom: 4 },
    likeBtn: { flexDirection: "row", alignItems: "center", gap: 5, marginRight: 14 },
    likeCount: { color: "rgba(255,255,255,0.7)", fontSize: IS_ANDROID ? 13 : 14, fontWeight: "600" },
    commentBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
    commentCount: { color: "rgba(255,255,255,0.5)", fontSize: IS_ANDROID ? 12 : 13 },
    shareBtn: { padding: 4 },
    likedByRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingBottom: 12, gap: 8, marginTop: 4 },
    tinyAvatar: { width: IS_ANDROID ? 18 : 20, height: IS_ANDROID ? 18 : 20, borderRadius: IS_ANDROID ? 9 : 10, backgroundColor: AppColors.darkGrey, borderWidth: 1.5, borderColor: AppColors.darkBg },
    likedByText: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, flex: 1 },

    // Menu
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
    menu: { position: "absolute", top: IS_ANDROID ? 62 : 70, left: 14, width: 248, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
    menuBlur: { padding: 6, backgroundColor: "rgba(18,18,18,0.75)" },
    menuItem: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10 },
    menuIconWrap: { width: 32, height: 32, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginRight: 10 },
    menuIconActive: { backgroundColor: "rgba(255,107,53,0.18)" },
    menuText: { color: "rgba(255,255,255,0.75)", flex: 1, fontSize: IS_ANDROID ? 14 : 15, fontWeight: "600" },
    menuTextActive: { color: AppColors.white, fontWeight: "700" },
    activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: ORANGE },
    menuDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 10 },

    // Search
    searchWrap: { flex: 1, backgroundColor: BG },
    searchHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12, gap: 10 },
    backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,107,53,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
    searchBar: { flex: 1, height: IS_ANDROID ? 40 : 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.055)", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
    searchInput: { flex: 1, color: AppColors.white, fontSize: IS_ANDROID ? 13 : 15, paddingVertical: 0 },
    searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: IS_ANDROID ? 11 : 13, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)", gap: 12 },
    searchAvatar: { width: IS_ANDROID ? 40 : 44, height: IS_ANDROID ? 40 : 44, borderRadius: IS_ANDROID ? 20 : 22, backgroundColor: AppColors.darkBg, borderWidth: 1.5, borderColor: "rgba(255,107,53,0.3)" },
    searchName: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 14 : 15 },
    searchCaption: { color: AppColors.grey, fontSize: IS_ANDROID ? 12 : 13, marginTop: 2 },
    emptySearch: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    emptyText: { color: AppColors.grey, fontSize: IS_ANDROID ? 14 : 15 },

    // Comments Sheet
    sheetKav: { position: "absolute", left: 0, right: 0, bottom: 0, top: 0, justifyContent: "flex-end" },
    commentsSheet: { backgroundColor: "#0E0E0E", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: IS_ANDROID ? 16 : 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)", maxHeight: "85%" },
    sheetHandle: { width: 40, height: 4, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center", marginBottom: 10 },
    sheetTitle: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 15 : 16, textAlign: "center", marginBottom: 10 },
    commentsList: { maxHeight: IS_ANDROID ? 280 : 340, paddingHorizontal: 14 },
    emptyComments: { alignItems: "center", justifyContent: "center", paddingVertical: 30, gap: 10 },
    emptyCommentsText: { color: AppColors.grey, fontSize: IS_ANDROID ? 13 : 14 },
    commentItem: { flexDirection: "row", alignItems: "flex-start", paddingVertical: IS_ANDROID ? 10 : 12 },
    commentAvatar: { width: IS_ANDROID ? 34 : 38, height: IS_ANDROID ? 34 : 38, borderRadius: IS_ANDROID ? 17 : 19, backgroundColor: AppColors.darkBg, marginRight: 10, borderWidth: 1.5, borderColor: "rgba(255,107,53,0.3)" },
    commentTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    commentUser: { color: AppColors.white, fontWeight: "700", fontSize: IS_ANDROID ? 13 : 14 },
    commentTime: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12 },
    commentText: { color: "rgba(255,255,255,0.8)", fontSize: IS_ANDROID ? 13 : 14, lineHeight: IS_ANDROID ? 19 : 21 },
    commentActions: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 },
    replyBtn: { paddingVertical: 2 },
    replyBtnText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "700" },
    viewRepliesBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    viewRepliesText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: "600" },
    commentLikeRow: { flexDirection: "row", alignItems: "center", gap: 3, paddingLeft: 8, paddingTop: 2 },
    commentLikeCount: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
    commentDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.04)" },

    // Replies
    replyItem: { flexDirection: "row", alignItems: "flex-start", marginTop: 8, paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: "rgba(255,107,53,0.2)" },
    replyAvatar: { width: IS_ANDROID ? 26 : 28, height: IS_ANDROID ? 26 : 28, borderRadius: IS_ANDROID ? 13 : 14, backgroundColor: AppColors.darkBg, marginRight: 8, borderWidth: 1, borderColor: "rgba(255,107,53,0.25)" },

    // Reply banner
    replyBanner: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "rgba(255,107,53,0.08)", borderTopWidth: 1, borderTopColor: "rgba(255,107,53,0.15)" },
    replyBannerText: { flex: 1, color: "rgba(255,255,255,0.6)", fontSize: IS_ANDROID ? 12 : 13 },

    // Emoji + input
    emojiRow: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: IS_ANDROID ? 10 : 12, paddingBottom: IS_ANDROID ? 8 : 10, marginTop: 4 },
    emojiBtn: { paddingHorizontal: 2 },
    emojiText: { fontSize: IS_ANDROID ? 22 : 26 },
    commentInputBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
    commentInput: { flex: 1, height: IS_ANDROID ? 46 : 50, borderRadius: IS_ANDROID ? 23 : 25, backgroundColor: "rgba(255,255,255,0.07)", color: AppColors.white, paddingHorizontal: 18, fontSize: IS_ANDROID ? 14 : 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
    sendBtn: { width: IS_ANDROID ? 46 : 50, height: IS_ANDROID ? 46 : 50, borderRadius: IS_ANDROID ? 23 : 25, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center" },
});
