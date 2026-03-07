import React, { useMemo, useRef, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Athlete = {
    name: string;
    username: string;
    avatarUrl: string;
};

type Post = {
    id: string;
    caption: string;
    comments: string[];
    athlete: Athlete;
};

const ORANGE = "#FF7825";
const BG = "#000000";
const MENU_BG = "#121212";
const CARD_BG = "#1A1A1A";
const PLACEHOLDER = "#2A2A2A";
const SMALL_GREY = "#B0B0B0";
const LIGHT = "#E6E6E6";

const IS_ANDROID = Platform.OS === "android";

export default function DiscoverScreen() {
    const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
    const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
    const [followedAthleteKeys, setFollowedAthleteKeys] = useState<Set<string>>(new Set());

    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");

    const [commentsOpen, setCommentsOpen] = useState(false);
    const [activePost, setActivePost] = useState<Post | null>(null);
    const [commentDraft, setCommentDraft] = useState("");

    const randomImages = useMemo(
        () => [
            "https://picsum.photos/800/800?random=1",
            "https://picsum.photos/800/800?random=2",
            "https://picsum.photos/800/800?random=3",
            "https://picsum.photos/800/800?random=4",
            "https://picsum.photos/800/800?random=5",
            "https://picsum.photos/800/800?random=6",
            "https://picsum.photos/800/800?random=7",
            "https://picsum.photos/800/800?random=8",
        ],
        []
    );

    const postImageMap = useRef<Record<string, string>>({});

    const imageForPost = (post: Post, index: number) => {
        if (!postImageMap.current[post.id]) {
            postImageMap.current[post.id] = randomImages[index % randomImages.length];
        }
        return postImageMap.current[post.id];
    };

    const posts: Post[] = useMemo(() => {
        const athletes: Athlete[] = [
            { name: "Alex", username: "alexfit", avatarUrl: "https://i.pravatar.cc/150?img=12" },
            { name: "Maya", username: "mayalifts", avatarUrl: "https://i.pravatar.cc/150?img=32" },
            { name: "Noah", username: "noahrun", avatarUrl: "https://i.pravatar.cc/150?img=56" },
            { name: "Sara", username: "sarahit", avatarUrl: "https://i.pravatar.cc/150?img=3" },
        ];

        return Array.from({ length: 10 }).map((_, i) => ({
            id: `post-${i}`,
            caption: `Workout session ${i + 1} 🔥`,
            comments: ["Nice!", "Great work 💪", "🔥🔥🔥", "Keep going!"],
            athlete: athletes[i % athletes.length],
        }));
    }, []);

    const [commentsByPost, setCommentsByPost] = useState<Record<string, string[]>>(() => {
        const map: Record<string, string[]> = {};
        posts.forEach((post) => {
            map[post.id] = [...post.comments];
        });
        return map;
    });

    const filteredPosts = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return posts;
        return posts.filter((p) => {
            const athlete = `${p.athlete.name} ${p.athlete.username}`.toLowerCase();
            const cap = p.caption.toLowerCase();
            return athlete.includes(q) || cap.includes(q);
        });
    }, [query, posts]);

    const toggleLike = (postId: string) => {
        setLikedPostIds((prev) => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });
    };

    const toggleSave = (postId: string) => {
        setSavedPostIds((prev) => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });
    };

    const toggleFollow = (athleteKey: string) => {
        setFollowedAthleteKeys((prev) => {
            const next = new Set(prev);
            if (next.has(athleteKey)) next.delete(athleteKey);
            else next.add(athleteKey);
            return next;
        });
    };

    const openPostDetail = (post: Post) => {
        router.push({
            pathname: "/(tabs)/home/post-detail",
            params: {
                id: post.id,
                caption: post.caption,
                username: post.athlete.username,
                name: post.athlete.name,
                avatarUrl: post.athlete.avatarUrl,
            },
        });
    };

    const openFullImage = (imageUrl: string) => {
        router.push({
            pathname: "/(tabs)/home/full-image",
            params: { imageUrl },
        });
    };

    const openComments = (post: Post) => {
        setActivePost(post);
        setCommentDraft("");
        setCommentsOpen(true);
    };

    const activeComments = activePost ? commentsByPost[activePost.id] ?? [] : [];

    const sendComment = () => {
        if (!activePost) return;
        const text = commentDraft.trim();
        if (!text) return;

        setCommentsByPost((prev) => ({
            ...prev,
            [activePost.id]: [...(prev[activePost.id] ?? []), text],
        }));

        setCommentDraft("");
    };

    const quickEmojis = ["💪", "🔥", "👏", "🏋️", "👊", "🥵", "🏆"];

    return (
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.header}>
                <Pressable onPress={() => setMenuOpen(true)} style={styles.titleRow}>
                    <Text allowFontScaling={false} style={styles.title}>Discover</Text>
                    <Ionicons name="chevron-down" size={IS_ANDROID ? 16 : 18} color={ORANGE} />
                </Pressable>

                <View style={styles.actions}>
                    <Pressable onPress={() => setSearchOpen(true)} style={styles.iconBtn}>
                        <Ionicons name="search" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                    </Pressable>

                    <Pressable onPress={() => router.push("/(tabs)/home/notifications")} style={styles.iconBtn}>
                        <Ionicons name="notifications-outline" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                    </Pressable>

                    <View style={{ width: 6 }} />
                </View>
            </View>

            <FlatList
                contentContainerStyle={styles.list}
                data={filteredPosts}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={{ height: IS_ANDROID ? 10 : 12 }} />}
                renderItem={({ item, index }) => {
                    const imageUrl = imageForPost(item, index);
                    const isLiked = likedPostIds.has(item.id);
                    const isSaved = savedPostIds.has(item.id);

                    const athleteKey = item.athlete.username;
                    const isFollowed = followedAthleteKeys.has(athleteKey);

                    return (
                        <Pressable onPress={() => openPostDetail(item)} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Image source={{ uri: item.athlete.avatarUrl }} style={styles.avatar} />

                                <View style={{ flex: 1 }}>
                                    <Text allowFontScaling={false} style={styles.username}>{item.athlete.username}</Text>
                                    <Text allowFontScaling={false} style={styles.time}>3 hours ago</Text>
                                </View>

                                <Pressable onPress={() => toggleFollow(athleteKey)} style={styles.followTextBtn}>
                                    <Text allowFontScaling={false} style={styles.followTextLink}>
                                        {isFollowed ? "Followed" : "+ Follow"}
                                    </Text>
                                </Pressable>

                                <Pressable onPress={() => toggleSave(item.id)} style={styles.iconBtnSm}>
                                    <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={IS_ANDROID ? 18 : 20} color={LIGHT} />
                                </Pressable>
                            </View>

                            <View style={{ height: IS_ANDROID ? 4 : 6 }} />
                            <Text allowFontScaling={false} style={styles.caption}>{item.caption}</Text>

                            <View style={{ height: IS_ANDROID ? 8 : 10 }} />

                            <View style={styles.statsRow}>
                                <MiniStat label="Time" value="1h 0min" />
                                <MiniStat label="Avg bpm" value="110" />
                                <MiniStat label="Reps" value="10" />
                            </View>

                            <View style={{ height: IS_ANDROID ? 8 : 10 }} />

                            <Pressable onPress={() => openFullImage(imageUrl)}>
                                <Image source={{ uri: imageUrl }} style={styles.postImage} />
                            </Pressable>

                            <View style={{ height: IS_ANDROID ? 8 : 10 }} />

                            <View style={styles.actionRow}>
                                <Pressable onPress={() => toggleLike(item.id)} style={styles.iconBtnSm}>
                                    <Ionicons
                                        name={isLiked ? "heart" : "heart-outline"}
                                        size={IS_ANDROID ? 20 : 22}
                                        color={isLiked ? ORANGE : LIGHT}
                                    />
                                </Pressable>

                                <Text allowFontScaling={false} style={styles.likesCount}>120</Text>

                                <Pressable onPress={() => openComments(item)} style={styles.iconBtnSm}>
                                    <Ionicons name="chatbubble-outline" size={IS_ANDROID ? 18 : 20} color={LIGHT} />
                                </Pressable>

                                <View style={{ flex: 1 }} />
                            </View>

                            <View style={styles.likedByRow}>
                                <Image source={{ uri: item.athlete.avatarUrl }} style={styles.tinyAvatar} />
                                <Text allowFontScaling={false} numberOfLines={1} style={styles.likedByText}>
                                    Liked by {item.athlete.username} and others
                                </Text>
                            </View>
                        </Pressable>
                    );
                }}
                showsVerticalScrollIndicator={false}
            />

            <Modal visible={menuOpen} transparent animationType="fade">
                <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
                <View style={styles.menu}>
                    <Pressable
                        style={styles.menuItem}
                        onPress={() => {
                            setMenuOpen(false);
                            router.push("/(tabs)/home");
                        }}
                    >
                        <Ionicons name="home" size={IS_ANDROID ? 16 : 18} color={ORANGE} />
                        <Text allowFontScaling={false} style={styles.menuText}>Home (Following)</Text>
                    </Pressable>

                    <View style={styles.divider} />

                    <Pressable
                        style={styles.menuItem}
                        onPress={() => {
                            setMenuOpen(false);
                        }}
                    >
                        <Ionicons name="compass" size={IS_ANDROID ? 16 : 18} color={ORANGE} />
                        <Text allowFontScaling={false} style={styles.menuText}>Discover</Text>
                        <Ionicons name="checkmark" size={IS_ANDROID ? 16 : 18} color={ORANGE} />
                    </Pressable>
                </View>
            </Modal>

            <Modal visible={searchOpen} transparent animationType="slide">
                <SafeAreaView style={styles.searchWrap}>
                    <View style={styles.searchHeader}>
                        <Pressable
                            onPress={() => {
                                setSearchOpen(false);
                                setQuery("");
                            }}
                            style={styles.iconBtn}
                        >
                            <Ionicons name="arrow-back" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                        </Pressable>

                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search athletes / captions"
                            placeholderTextColor="#777"
                            style={styles.searchInput}
                            autoFocus
                            allowFontScaling={false}
                        />

                        {query.length > 0 ? (
                            <Pressable onPress={() => setQuery("")} style={styles.iconBtn}>
                                <Ionicons name="close" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
                            </Pressable>
                        ) : (
                            <View style={{ width: 42 }} />
                        )}
                    </View>

                    {filteredPosts.length === 0 ? (
                        <View style={styles.empty}>
                            <Text allowFontScaling={false} style={{ color: "white" }}>No athletes found</Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {filteredPosts.map((p) => (
                                <Pressable
                                    key={p.id}
                                    onPress={() => {
                                        setSearchOpen(false);
                                        setQuery("");
                                        openPostDetail(p);
                                    }}
                                    style={styles.searchRow}
                                >
                                    <Image source={{ uri: p.athlete.avatarUrl }} style={styles.searchAvatar} />
                                    <View style={{ flex: 1 }}>
                                        <Text allowFontScaling={false} style={styles.searchName}>{p.athlete.name}</Text>
                                        <Text allowFontScaling={false} style={styles.searchUsername}>{p.athlete.username}</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    )}
                </SafeAreaView>
            </Modal>

            <Modal visible={commentsOpen} transparent animationType="slide">
                <Pressable style={styles.backdrop} onPress={() => setCommentsOpen(false)} />
                <View style={styles.commentsSheet}>
                    <View style={styles.commentsHandle} />

                    <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
                        {activeComments.map((c, idx) => (
                            <View key={idx} style={styles.commentItem}>
                                <Image
                                    source={{
                                        uri:
                                            activePost?.athlete.avatarUrl ??
                                            "https://i.pravatar.cc/100?img=12",
                                    }}
                                    style={styles.commentAvatar}
                                />

                                <View style={{ flex: 1 }}>
                                    <View style={styles.commentTopRow}>
                                        <Text allowFontScaling={false} style={styles.commentUser}>
                                            user{idx + 1}
                                        </Text>
                                        <Text allowFontScaling={false} style={styles.commentTime}>
                                            {idx === activeComments.length - 1 ? "now" : `${44 - idx * 7}m`}
                                        </Text>
                                    </View>

                                    <Text allowFontScaling={false} style={styles.commentText}>{c}</Text>

                                    <Text allowFontScaling={false} style={styles.replyText}>Reply</Text>
                                </View>

                                <Pressable style={styles.commentLikeBtn}>
                                    <Ionicons name="thumbs-up-outline" size={IS_ANDROID ? 18 : 20} color={LIGHT} />
                                </Pressable>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.emojiRow}>
                        {quickEmojis.map((emoji) => (
                            <Pressable
                                key={emoji}
                                onPress={() => setCommentDraft((prev) => `${prev}${emoji}`)}
                                style={styles.emojiBtn}
                            >
                                <Text allowFontScaling={false} style={styles.emojiText}>{emoji}</Text>
                            </Pressable>
                        ))}
                    </View>

                    <View style={styles.commentInputBar}>
                        <TextInput
                            value={commentDraft}
                            onChangeText={setCommentDraft}
                            placeholder="Add a comment..."
                            placeholderTextColor="#8B8B8B"
                            style={styles.commentInput}
                            allowFontScaling={false}
                        />
                        <Pressable onPress={sendComment} style={styles.sendCircle}>
                            <Ionicons name="arrow-up" size={IS_ANDROID ? 22 : 26} color="white" />
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ marginRight: IS_ANDROID ? 12 : 16 }}>
            <Text allowFontScaling={false} style={{ color: SMALL_GREY, fontSize: IS_ANDROID ? 11 : 12 }}>{label}</Text>
            <View style={{ height: 2 }} />
            <Text allowFontScaling={false} style={{ color: "white", fontWeight: "600", fontSize: IS_ANDROID ? 13 : 14 }}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },

    header: {
        height: IS_ANDROID ? 52 : 56,
        backgroundColor: BG,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    title: { color: ORANGE, fontWeight: "700", fontSize: IS_ANDROID ? 18 : 20 },

    actions: { flexDirection: "row", alignItems: "center" },
    iconBtn: { padding: IS_ANDROID ? 8 : 10 },
    iconBtnSm: { padding: IS_ANDROID ? 4 : 6 },

    list: { paddingHorizontal: 12, paddingTop: IS_ANDROID ? 6 : 8, paddingBottom: 14 },

    card: {
        backgroundColor: CARD_BG,
        borderRadius: 14,
        padding: IS_ANDROID ? 10 : 12,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: IS_ANDROID ? 8 : 10 },
    avatar: {
        width: IS_ANDROID ? 34 : 36,
        height: IS_ANDROID ? 34 : 36,
        borderRadius: IS_ANDROID ? 17 : 18,
        backgroundColor: PLACEHOLDER
    },

    username: { color: "white", fontWeight: "600", fontSize: IS_ANDROID ? 13 : 14 },
    time: { color: SMALL_GREY, fontSize: IS_ANDROID ? 11 : 12, marginTop: 2 },

    followTextBtn: { paddingHorizontal: 6, paddingVertical: 6 },
    followTextLink: { color: ORANGE, fontWeight: "600", fontSize: IS_ANDROID ? 13 : 14 },

    caption: { color: LIGHT, fontSize: IS_ANDROID ? 14 : 15 },

    statsRow: { flexDirection: "row", alignItems: "center" },

    postImage: {
        width: "100%",
        height: IS_ANDROID ? 230 : 260,
        borderRadius: 14,
        backgroundColor: PLACEHOLDER,
    },

    actionRow: { flexDirection: "row", alignItems: "center" },
    likesCount: { color: LIGHT, marginLeft: 2, marginRight: 12, fontSize: IS_ANDROID ? 13 : 14 },

    likedByRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
    tinyAvatar: {
        width: IS_ANDROID ? 18 : 20,
        height: IS_ANDROID ? 18 : 20,
        borderRadius: IS_ANDROID ? 9 : 10,
        backgroundColor: PLACEHOLDER
    },
    likedByText: { color: SMALL_GREY, fontSize: IS_ANDROID ? 11 : 12, flex: 1 },

    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },

    menu: {
        position: "absolute",
        top: IS_ANDROID ? 66 : 72,
        left: 12,
        width: 250,
        backgroundColor: MENU_BG,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#1F1F1F",
    },
    menuItem: {
        paddingHorizontal: 12,
        paddingVertical: IS_ANDROID ? 10 : 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    menuText: { color: "white", flex: 1, fontSize: IS_ANDROID ? 13 : 14 },
    divider: { height: 1, backgroundColor: "#232323" },

    searchWrap: { flex: 1, backgroundColor: BG },
    searchHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingTop: 6,
        paddingBottom: 10,
        gap: 6,
    },
    searchInput: {
        flex: 1,
        height: IS_ANDROID ? 40 : 42,
        borderRadius: 10,
        backgroundColor: MENU_BG,
        color: "white",
        paddingHorizontal: 12,
        fontSize: IS_ANDROID ? 14 : 16,
        paddingVertical: 0,
    },
    empty: { flex: 1, alignItems: "center", justifyContent: "center" },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: IS_ANDROID ? 10 : 12,
        borderBottomWidth: 1,
        borderBottomColor: "#1B1B1B",
    },
    searchAvatar: {
        width: IS_ANDROID ? 34 : 36,
        height: IS_ANDROID ? 34 : 36,
        borderRadius: IS_ANDROID ? 17 : 18,
        backgroundColor: PLACEHOLDER
    },
    searchName: { color: "white", fontWeight: "600", fontSize: IS_ANDROID ? 14 : 15 },
    searchUsername: { color: SMALL_GREY, fontSize: IS_ANDROID ? 12 : 13 },

    commentsSheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#000000",
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingTop: 10,
        paddingBottom: IS_ANDROID ? 12 : 14,
        borderTopWidth: 1,
        borderTopColor: "#222",
    },
    commentsHandle: {
        width: 42,
        height: 4,
        borderRadius: 4,
        backgroundColor: "#3A3A3A",
        alignSelf: "center",
        marginBottom: 12,
    },
    commentsList: {
        maxHeight: IS_ANDROID ? 320 : 380,
        paddingHorizontal: 14,
    },
    commentItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: IS_ANDROID ? 10 : 12,
    },
    commentAvatar: {
        width: IS_ANDROID ? 38 : 42,
        height: IS_ANDROID ? 38 : 42,
        borderRadius: IS_ANDROID ? 19 : 21,
        backgroundColor: PLACEHOLDER,
        marginRight: 12,
    },
    commentTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    commentUser: {
        color: "white",
        fontWeight: "700",
        fontSize: IS_ANDROID ? 14 : 15,
    },
    commentTime: {
        color: SMALL_GREY,
        fontSize: IS_ANDROID ? 12 : 13,
    },
    commentText: {
        color: LIGHT,
        fontSize: IS_ANDROID ? 14 : 15,
        lineHeight: IS_ANDROID ? 20 : 22,
    },
    replyText: {
        color: SMALL_GREY,
        fontSize: IS_ANDROID ? 12 : 13,
        marginTop: 8,
    },
    commentLikeBtn: {
        paddingLeft: 8,
        paddingTop: 2,
    },

    emojiRow: {
        borderTopWidth: 1,
        borderTopColor: "#1E1E1E",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingTop: IS_ANDROID ? 10 : 12,
        paddingBottom: IS_ANDROID ? 8 : 10,
        marginTop: 4,
    },
    emojiBtn: {
        paddingHorizontal: 2,
    },
    emojiText: {
        fontSize: IS_ANDROID ? 24 : 28,
    },

    commentInputBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        gap: 12,
    },
    commentInput: {
        flex: 1,
        height: IS_ANDROID ? 50 : 56,
        borderRadius: IS_ANDROID ? 25 : 28,
        backgroundColor: "#1A1A22",
        color: "white",
        paddingHorizontal: 20,
        fontSize: IS_ANDROID ? 14 : 16,
    },
    sendCircle: {
        width: IS_ANDROID ? 50 : 56,
        height: IS_ANDROID ? 50 : 56,
        borderRadius: IS_ANDROID ? 25 : 28,
        backgroundColor: "#1A1A22",
        alignItems: "center",
        justifyContent: "center",
    },
});

