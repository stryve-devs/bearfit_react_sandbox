import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
    Platform,
    TextInput,
    KeyboardAvoidingView,
    Modal,
    Share,
    FlatList,
} from 'react-native';

import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
    FadeInDown,
    SlideInRight,
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    withSpring,
    withTiming,
    withDelay,
    withSequence,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';

import { useState, useEffect, useRef } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 260;

// ─── THEME ────────────────────────────────────────────────────
const C = {
    bg:      '#080810',
    surface: 'rgba(255,255,255,0.04)',
    border:  'rgba(255,255,255,0.10)',
    orange:  '#FF7825',
    orangeD: '#E55A00',
    orangeL: '#FFB347',
    white:   '#FFFFFF',
    gray:    'rgba(255,255,255,0.45)',
    grayD:   'rgba(255,255,255,0.20)',
};

// ─── MOCK DATA ────────────────────────────────────────────────
const PHOTO_GRID = [
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
];

const GRAPH_DATA = [
    { label: 'J 12', value: 1.2 },
    { label: 'J 26', value: 0.8 },
    { label: 'F 9',  value: 3.0 },
    { label: 'F 23', value: 2.2 },
    { label: 'M 9',  value: 3.5 },
    { label: 'M 23', value: 2.7 },
];

const ROUTINES = [
    { id: 'cardio',   title: 'Cardio',    emoji: '🏃‍♀️', count: '12 exercises' },
    { id: 'muaythai', title: 'Muay Thai', emoji: '🥊',  count: '8 exercises'  },
    { id: 'strength', title: 'Strength',  emoji: '🏋️',  count: '15 exercises' },
];

const INITIAL_POSTS = [
    {
        id: '1',
        title: 'Random Upper',
        routineId: 'strength',
        routineName: 'Strength Routine',
        desc: 'At a mates place and they asked if we could workout, which worked well!',
        time: '40min', volume: '2,181 kg', records: '3', bpm: '103',
        date: 'Monday, Mar 9, 2026',
        images: [
            'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600',
            'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600',
        ],
        likes: 116, liked: false,
        comments: [
            {
                id: 'c1', user: 'davefergs',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
                text: 'Hell yeah awesome stuff ❤️💪', time: '2h ago', likes: 5, liked: false,
                replies: [
                    {
                        id: 'r1', user: 'jadewolfe',
                        avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80',
                        text: 'Thanks so much! 🙏', time: '1h ago', likes: 2, liked: false,
                    },
                ],
            },
            {
                id: 'c2', user: 'mikelifts',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80',
                text: 'Incredible volume for a random session!', time: '3h ago', likes: 3, liked: false,
                replies: [],
            },
        ],
    },
    {
        id: '2',
        title: 'Morning HIIT',
        routineId: 'cardio',
        routineName: 'Cardio Routine',
        desc: 'Early morning session before work. Felt incredible after this one 🔥',
        time: '28min', volume: '1,540 kg', records: '1', bpm: '142',
        date: 'Friday, Mar 6, 2026',
        images: ['https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600'],
        likes: 89, liked: false,
        comments: [
            {
                id: 'c3', user: 'fitnessfan',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80',
                text: 'Morning workouts hit different 🌅', time: '5h ago', likes: 7, liked: false,
                replies: [],
            },
        ],
    },
];

const FOLLOWING_LIST = [
    { id: '1', user: 'mikelifts',   name: 'Mike Johnson',  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80',  isFollowing: true  },
    { id: '2', user: 'fitnessfan',  name: 'Sara Williams', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80',   isFollowing: false },
    { id: '3', user: 'davefergs',   name: 'Dave Ferguson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',   isFollowing: true  },
    { id: '4', user: 'powerlifter', name: 'Alex Chen',     avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',   isFollowing: false },
];

// ─── GLASS CARD ───────────────────────────────────────────────
const GlassCard = ({ children, style, shine = true, glowColor }: any) => (
    <View style={[styles.glass, style]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
        {shine && (
            <LinearGradient colors={['rgba(255,255,255,0.13)', 'transparent']} style={styles.glassShine} />
        )}
        {glowColor && (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: glowColor, borderRadius: 18 }]} />
        )}
        <View style={{ zIndex: 2 }}>{children}</View>
    </View>
);

// ─── ANIMATED BAR ─────────────────────────────────────────────
const AnimatedBar = ({ value, label, index }: any) => {
    const h = useSharedValue(0);
    const MAX = 90;
    useEffect(() => {
        h.value = withDelay(index * 80, withSpring((value / 4) * MAX, { damping: 12 }));
    }, []);
    const barStyle = useAnimatedStyle(() => ({ height: h.value }));
    const isHighest = value === 3.5;
    return (
        <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ height: MAX, justifyContent: 'flex-end', alignItems: 'center' }}>
                <Animated.View style={[barStyle, { width: 8, borderRadius: 6, overflow: 'hidden' }]}>
                    <LinearGradient
                        colors={isHighest ? [C.orangeL, C.orange] : ['rgba(255,120,37,0.5)', 'rgba(255,120,37,0.2)']}
                        style={{ flex: 1, borderRadius: 6 }}
                    />
                </Animated.View>
                {isHighest && <View style={styles.barGlow} />}
            </View>
            <Text style={styles.barLabel}>{label}</Text>
        </View>
    );
};

// ─── FOLLOW BUTTON ────────────────────────────────────────────
const FollowButton = ({ isFollowing, onPress }: any) => {
    const scale = useSharedValue(1);
    const glow  = useSharedValue(0);
    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        shadowOpacity: glow.value,
    }));
    const handlePress = () => {
        scale.value = withSequence(withSpring(0.93), withSpring(1));
        glow.value  = withSequence(withTiming(1, { duration: 150 }), withTiming(0.4, { duration: 400 }));
        onPress();
    };
    return (
        <Animated.View style={[style, { shadowColor: C.orange, shadowRadius: 20, shadowOffset: { width: 0, height: 0 } }]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                <LinearGradient
                    colors={isFollowing ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : [C.orangeL, C.orange, C.orangeD]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.followBtn}
                >
                    {isFollowing && <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />}
                    <Text style={[styles.followText, isFollowing && { color: C.gray }]}>
                        {isFollowing ? '✓  Following' : '+ Follow'}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── STAT PILL ────────────────────────────────────────────────
const StatPill = ({ label, value, delay, onPress }: any) => (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1 }}>
        <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} style={{ flex: 1 }}>
            <GlassCard style={styles.statPill}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </GlassCard>
        </TouchableOpacity>
    </Animated.View>
);

// ─── ROUTINE CARD ─────────────────────────────────────────────
const RoutineCard = ({ item, index }: any) => {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    return (
        <Animated.View entering={SlideInRight.delay(index * 80).springify()} style={style}>
            <TouchableOpacity
                onPressIn={() => { scale.value = withSpring(0.96); }}
                onPressOut={() => { scale.value = withSpring(1); }}
                onPress={() =>
                    router.push({
                        pathname: '/home/routine-detail',
                        params: {
                            routineId: item.id,
                            title: item.title,
                        },
                    })
                }
                activeOpacity={1}
            >
                <GlassCard style={styles.routineCard} glowColor="rgba(255,120,37,0.03)">
                    <Text style={styles.routineEmoji}>{item.emoji}</Text>
                    <Text style={styles.routineTitle}>{item.title}</Text>
                    <Text style={styles.routineCount}>{item.count}</Text>
                    <LinearGradient colors={[C.orange, C.orangeD]} style={styles.routineBar} />
                </GlassCard>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── COMMENTS MODAL ───────────────────────────────────────────
const CommentsModal = ({ visible, onClose, post, onUpdatePost }: any) => {
    const [comments, setComments]         = useState<any[]>([]);
    const [text, setText]                 = useState('');
    const [replyingTo, setReplyingTo]     = useState<any>(null);
    const [expandedReplies, setExpanded]  = useState<Record<string, boolean>>({});
    const inputRef = useRef<TextInput>(null);

    useEffect(() => { if (post) setComments(post.comments || []); }, [post?.id]);

    const slideY     = useSharedValue(height);
    const modalStyle = useAnimatedStyle(() => ({ transform: [{ translateY: slideY.value }] }));
    useEffect(() => {
        slideY.value = visible
            ? withSpring(0, { damping: 22, stiffness: 200 })
            : withTiming(height, { duration: 260 });
    }, [visible]);

    const submitComment = () => {
        if (!text.trim()) return;
        let updated: any[];
        if (replyingTo) {
            updated = comments.map((c: any) =>
                c.id === replyingTo.id
                    ? { ...c, replies: [...(c.replies || []), { id: `r${Date.now()}`, user: 'you', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80', text: text.trim(), time: 'now', likes: 0, liked: false }] }
                    : c
            );
            setExpanded(prev => ({ ...prev, [replyingTo.id]: true }));
        } else {
            updated = [{ id: `c${Date.now()}`, user: 'you', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80', text: text.trim(), time: 'now', likes: 0, liked: false, replies: [] }, ...comments];
        }
        setComments(updated);
        onUpdatePost({ ...post, comments: updated });
        setText('');
        setReplyingTo(null);
    };

    const toggleCommentLike = (id: string) =>
        setComments(prev => prev.map((c: any) => c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c));

    const toggleReplyLike = (cId: string, rId: string) =>
        setComments(prev => prev.map((c: any) =>
            c.id === cId ? { ...c, replies: c.replies.map((r: any) => r.id === rId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r) } : c
        ));

    const startReply = (comment: any) => {
        setReplyingTo(comment);
        setText(`@${comment.user} `);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    if (!post) return null;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
                <Animated.View style={[styles.commentsSheet, modalStyle]}>
                    <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFillObject} />
                    <View style={{ zIndex: 2, flex: 1 }}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Comments</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={comments}
                            keyExtractor={(item: any) => item.id}
                            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item: comment }: any) => (
                                <View style={styles.commentItem}>
                                    <View style={styles.commentRowInner}>
                                        <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.commentBubble}>
                                                <Text style={styles.commentUser}>{comment.user}</Text>
                                                <Text style={styles.commentBody}>{comment.text}</Text>
                                            </View>
                                            <View style={styles.commentMeta}>
                                                <Text style={styles.commentTime}>{comment.time}</Text>
                                                <TouchableOpacity onPress={() => startReply(comment)}>
                                                    <Text style={styles.replyBtn}>Reply</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => toggleCommentLike(comment.id)} style={styles.commentLikeBtn}>
                                            <Text style={{ fontSize: 14 }}>{comment.liked ? '❤️' : '🤍'}</Text>
                                            <Text style={styles.commentLikeCount}>{comment.likes}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* view replies toggle */}
                                    {comment.replies?.length > 0 && (
                                        <TouchableOpacity
                                            style={styles.viewRepliesBtn}
                                            onPress={() => setExpanded(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                                        >
                                            <View style={styles.replyLine} />
                                            <Text style={styles.viewRepliesText}>
                                                {expandedReplies[comment.id] ? 'Hide replies' : `View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* replies */}
                                    {expandedReplies[comment.id] && comment.replies?.map((reply: any) => (
                                        <View key={reply.id} style={styles.replyItem}>
                                            <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} />
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.commentBubble}>
                                                    <Text style={styles.commentUser}>{reply.user}</Text>
                                                    <Text style={styles.commentBody}>{reply.text}</Text>
                                                </View>
                                                <View style={styles.commentMeta}>
                                                    <Text style={styles.commentTime}>{reply.time}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity onPress={() => toggleReplyLike(comment.id, reply.id)} style={styles.commentLikeBtn}>
                                                <Text style={{ fontSize: 12 }}>{reply.liked ? '❤️' : '🤍'}</Text>
                                                <Text style={styles.commentLikeCount}>{reply.likes}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        />

                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                            {replyingTo && (
                                <View style={styles.replyingBanner}>
                                    <Text style={styles.replyingText}>
                                        Replying to <Text style={{ color: C.orange }}>@{replyingTo.user}</Text>
                                    </Text>
                                    <TouchableOpacity onPress={() => { setReplyingTo(null); setText(''); }}>
                                        <Text style={{ color: C.gray, fontSize: 14 }}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            <View style={styles.inputRow}>
                                <Image source={{ uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80' }} style={styles.inputAvatar} />
                                <View style={styles.inputWrap}>
                                    <TextInput
                                        ref={inputRef}
                                        value={text}
                                        onChangeText={setText}
                                        placeholder={replyingTo ? `Reply to @${replyingTo.user}...` : 'Add a comment...'}
                                        placeholderTextColor={C.grayD}
                                        style={styles.input}
                                        multiline
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={submitComment}
                                    disabled={!text.trim()}
                                    style={[styles.sendBtn, !text.trim() && { opacity: 0.35 }]}
                                >
                                    <LinearGradient colors={[C.orangeL, C.orange]} style={styles.sendBtnGrad}>
                                        <Text style={styles.sendBtnText}>↑</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

// ─── PEOPLE MODAL (Following / Followers) ─────────────────────
const PeopleModal = ({ visible, onClose, title }: any) => {
    const [list, setList] = useState(FOLLOWING_LIST);
    const slideY     = useSharedValue(height);
    const modalStyle = useAnimatedStyle(() => ({ transform: [{ translateY: slideY.value }] }));
    useEffect(() => {
        slideY.value = visible
            ? withSpring(0, { damping: 22, stiffness: 200 })
            : withTiming(height, { duration: 260 });
    }, [visible]);

    const toggle = (id: string) =>
        setList(prev => prev.map(p => p.id === id ? { ...p, isFollowing: !p.isFollowing } : p));

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
                <Animated.View style={[styles.commentsSheet, { height: height * 0.6 }, modalStyle]}>
                    <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFillObject} />
                    <View style={{ zIndex: 2, flex: 1 }}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={list}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ padding: 16 }}
                            renderItem={({ item }) => (
                                <View style={styles.peopleItem}>
                                    <Image source={{ uri: item.avatar }} style={styles.peopleAvatar} />
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.peopleName}>{item.name}</Text>
                                        <Text style={styles.peopleHandle}>@{item.user}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => toggle(item.id)}>
                                        <LinearGradient
                                            colors={item.isFollowing
                                                ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
                                                : [C.orangeL, C.orange]}
                                            style={styles.peopleBtn}
                                        >
                                            <Text style={[styles.peopleBtnText, item.isFollowing && { color: C.gray }]}>
                                                {item.isFollowing ? 'Following' : 'Follow'}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

// ─── POST CARD ────────────────────────────────────────────────
const PostCard = ({ post, index, onOpenComments, onUpdatePost }: any) => {
    const [imgIndex, setImgIndex] = useState(0);
    const [liked, setLiked]       = useState(post.liked);
    const [likes, setLikes]       = useState(post.likes);
    const heartScale = useSharedValue(1);
    const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

    const toggleLike = () => {
        heartScale.value = withSequence(withSpring(1.5, { damping: 6 }), withSpring(1));
        setLiked((v: boolean) => { setLikes((l: number) => l + (v ? -1 : 1)); return !v; });
    };

    const handleShare = async () => {
        try {
            await Share.share({ message: `Check out this workout: "${post.title}" — ${post.desc}`, title: post.title });
        } catch {}
    };

    return (
        <Animated.View entering={FadeInDown.delay(index * 120).springify()}>
            <GlassCard style={styles.postCard}>

                {/* HEADER */}
                <View style={styles.postHeader}>
                    <View style={styles.avatarWrap}>
                        <Image source={{ uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80' }} style={styles.postAvatar} />
                        <LinearGradient colors={[C.orange, C.orangeL]} style={styles.avatarRing} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.postUser}>jadewolfe</Text>
                        <Text style={styles.postDate}>{post.date}</Text>
                    </View>
                    <GlassCard style={styles.bpmBadge} shine={false}>
                        <Text style={styles.bpmText}>♥ {post.bpm}</Text>
                    </GlassCard>
                </View>

                <View style={styles.divider} />

                {/* TITLE + ROUTINE BADGE */}
                <View style={{ paddingHorizontal: 14, paddingTop: 12 }}>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: '/home/workout-detail',
                                params: {
                                    routineId: post.routineId,
                                    title: post.routineName,
                                },
                            })
                        }
                        style={{ alignSelf: 'flex-start', marginBottom: 8 }}
                    >
                        <LinearGradient colors={['rgba(255,120,37,0.2)', 'rgba(255,120,37,0.07)']} style={styles.routineBadgeGrad}>
                            <Text style={styles.routineBadgeText}>🏋️  {post.routineName}  →</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.postDesc}>{post.desc}</Text>
                </View>

                {/* STATS */}
                <View style={styles.postStats}>
                    {[{ icon: '⏱', val: post.time }, { icon: '🏋️', val: post.volume }, { icon: '🏅', val: `${post.records} PRs` }].map((s, i) => (
                        <View key={i} style={styles.statChip}>
                            <Text style={styles.statChipIcon}>{s.icon}</Text>
                            <Text style={styles.statChipVal}>{s.val}</Text>
                        </View>
                    ))}
                </View>

                {/* IMAGES */}
                <View>
                    <ScrollView
                        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={e => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
                    >
                        {post.images.map((img: string, i: number) => (
                            <View key={i}>
                                <Image source={{ uri: img }} style={styles.postImage} />
                                <LinearGradient colors={['transparent', 'rgba(8,8,16,0.7)']} style={[StyleSheet.absoluteFillObject, { top: '50%' }]} />
                            </View>
                        ))}
                    </ScrollView>
                    {post.images.length > 1 && (
                        <View style={styles.dotRow}>
                            {post.images.map((_: any, i: number) => (
                                <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />
                            ))}
                        </View>
                    )}
                </View>

                {/* ACTIONS */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={toggleLike} style={styles.actionBtn}>
                        <Animated.Text style={[{ fontSize: 18 }, heartStyle]}>{liked ? '❤️' : '🤍'}</Animated.Text>
                        <Text style={styles.actionText}>{likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onOpenComments(post)} style={styles.actionBtn}>
                        <Text style={{ fontSize: 18 }}>💬</Text>
                        <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                        <Text style={{ fontSize: 18 }}>🔗</Text>
                        <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>
                </View>

                {/* COMMENT PREVIEW */}
                {post.comments?.length > 0 && (
                    <TouchableOpacity onPress={() => onOpenComments(post)} style={styles.commentPreviewRow}>
                        <Image source={{ uri: post.comments[0].avatar }} style={styles.commentPreviewAvatar} />
                        <Text style={styles.commentPreviewText} numberOfLines={1}>
                            <Text style={{ color: C.white, fontWeight: '700' }}>{post.comments[0].user}  </Text>
                            {post.comments[0].text}
                        </Text>
                        {post.comments.length > 1 && (
                            <Text style={styles.moreComments}>+{post.comments.length - 1}</Text>
                        )}
                    </TouchableOpacity>
                )}

            </GlassCard>
        </Animated.View>
    );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────
export default function UserScreen() {
    const { name } = useLocalSearchParams();
    const [isFollowing,    setIsFollowing]    = useState(false);
    const [posts,          setPosts]           = useState(INITIAL_POSTS);
    const [commentsPost,   setCommentsPost]    = useState<any>(null);
    const [commentsOpen,   setCommentsOpen]    = useState(false);
    const [peopleModal,    setPeopleModal]     = useState<string | null>(null);
    const scrollRef = useRef<any>(null);
    const postsY = useRef(0);

    const scrollToPosts = () => {
        scrollRef.current?.scrollTo({
            y: postsY.current - 50,
            animated: true,
        });
    };
    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler(e => { scrollY.value = e.contentOffset.y; });

    const headerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(scrollY.value, [0, HEADER_HEIGHT], [0, -HEADER_HEIGHT * 0.4], Extrapolation.CLAMP) }],
        opacity: interpolate(scrollY.value, [0, HEADER_HEIGHT * 0.6], [1, 0.3], Extrapolation.CLAMP),
    }));
    const navStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [HEADER_HEIGHT * 0.5, HEADER_HEIGHT], [0, 1], Extrapolation.CLAMP),
    }));

    const openComments = (post: any) => { setCommentsPost(post); setCommentsOpen(true); };
    const updatePost   = (updated: any) => {
        setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
        setCommentsPost(updated);
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* ── BACK BUTTON ── */}
            <Animated.View style={styles.backBtn} entering={FadeInDown.delay(50)}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtnInner}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* ── STICKY BAR ── */}
            <Animated.View style={[styles.stickyBar, navStyle]} pointerEvents="none">
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
                <LinearGradient colors={['rgba(8,8,16,0.9)', 'transparent']} style={StyleSheet.absoluteFillObject} />
                <Text style={styles.stickyName}>{name || 'Jessica'}</Text>
            </Animated.View>

            <Animated.ScrollView
                ref={scrollRef}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* PHOTO GRID */}
                <Animated.View style={[{ height: HEADER_HEIGHT }, headerStyle]}>
                    <View style={styles.grid}>
                        {PHOTO_GRID.map((img, i) => <Image key={i} source={{ uri: img }} style={styles.gridImg} />)}
                    </View>
                    <LinearGradient colors={['transparent', C.bg]} style={styles.gridFade} />
                </Animated.View>

                <View style={styles.body}>

                    {/* Profile Row */}
                    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.profileRow}>
                        <View style={styles.mainAvatarWrap}>
                            <Image source={{ uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200' }} style={styles.mainAvatar} />
                            <LinearGradient colors={[C.orange, C.orangeL, 'transparent']} style={styles.mainAvatarRing} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={styles.name}>{name || 'Jessica'}</Text>
                            <Text style={styles.handle}>@jadewolfe</Text>
                        </View>
                    </Animated.View>

                    <Animated.Text entering={FadeInDown.delay(160).springify()} style={styles.bio}>
                        I want to be strong enough to fight a bear 🐻
                    </Animated.Text>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <StatPill
                            label="Workouts"
                            value="142"
                            delay={200}
                            onPress={scrollToPosts}
                        />
                        <StatPill label="Following" value="88"  delay={260} onPress={() => setPeopleModal('Following')} />
                        <StatPill label="Followers" value="1.2k" delay={320} onPress={() => setPeopleModal('Followers')} />
                    </View>

                    <Animated.View entering={FadeInDown.delay(350).springify()}>
                        <FollowButton isFollowing={isFollowing} onPress={() => setIsFollowing(v => !v)} />
                    </Animated.View>

                    {/* Graph */}
                    <Animated.View entering={FadeInDown.delay(400).springify()}>
                        <Text style={styles.section}>Volume This Month</Text>
                        <GlassCard style={{ padding: 16 }}>
                            <View style={styles.graphHeader}>
                                <Text style={styles.graphTitle}>Total Lifted</Text>
                                <Text style={styles.graphSub}>↑ 28% vs last month</Text>
                            </View>
                            <View style={styles.graph}>
                                {GRAPH_DATA.map((d, i) => <AnimatedBar key={i} {...d} index={i} />)}
                            </View>
                        </GlassCard>
                    </Animated.View>

                    {/* Routines */}
                    <Text style={styles.section}>Routines</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
                        <View style={{ flexDirection: 'row', gap: 12, paddingRight: 16 }}>
                            {ROUTINES.map((r, i) => <RoutineCard key={r.id} item={r} index={i} />)}
                        </View>
                    </ScrollView>

                    {/* Posts */}
                    <View
                        onLayout={(e) => {
                            postsY.current = e.nativeEvent.layout.y;
                        }}
                    >
                        <Text style={styles.section}>Posts</Text>
                    </View>             {posts.map((p, i) => (
                        <PostCard key={p.id} post={p} index={i} onOpenComments={openComments} onUpdatePost={updatePost} />
                    ))}

                    <View style={{ height: 40 }} />
                </View>
            </Animated.ScrollView>

            <CommentsModal visible={commentsOpen} onClose={() => setCommentsOpen(false)} post={commentsPost} onUpdatePost={updatePost} />
            <PeopleModal visible={!!peopleModal} onClose={() => setPeopleModal(null)} title={peopleModal || ''} />
        </View>
    );
}

// ─── STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },

    backBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 54 : 20,
        left: 16, zIndex: 200,
    },
    backBtnInner: {
        width: 38, height: 38, borderRadius: 19,
        overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: C.border,
    },
    backArrow: { color: C.white, fontSize: 24, lineHeight: 28, fontWeight: '300', marginLeft: -2 },

    stickyBar: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 60 + (Platform.OS === 'ios' ? 44 : 0),
        paddingTop: Platform.OS === 'ios' ? 44 : 0,
        alignItems: 'center', justifyContent: 'center',
        zIndex: 100, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    stickyName: { color: C.white, fontSize: 15, fontWeight: '700' },

    grid: { flexDirection: 'row', height: HEADER_HEIGHT },
    gridImg: { flex: 1 },
    gridFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },

    body: { padding: 16, paddingTop: 0 },

    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    mainAvatarWrap: { width: 72, height: 72 },
    mainAvatar: { width: 66, height: 66, borderRadius: 33, margin: 3 },
    mainAvatarRing: { position: 'absolute', inset: 0, borderRadius: 36, borderWidth: 2.5, borderColor: 'transparent' },
    name: { color: C.white, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
    handle: { color: C.gray, fontSize: 13 },
    bio: { color: C.gray, fontSize: 14, lineHeight: 20, marginBottom: 16 },

    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statPill: { padding: 12, alignItems: 'center' },
    statValue: { color: C.white, fontSize: 18, fontWeight: '800' },
    statLabel: { color: C.gray, fontSize: 11, marginTop: 2 },

    followBtn: {
        height: 48, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', marginBottom: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    followText: { color: C.white, fontWeight: '700', fontSize: 15, letterSpacing: 0.4 },

    section: { color: C.white, fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 12, letterSpacing: -0.2 },

    graphHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    graphTitle: { color: C.white, fontWeight: '700', fontSize: 14 },
    graphSub: { color: C.orange, fontSize: 12, fontWeight: '600' },
    graph: { flexDirection: 'row', height: 110, alignItems: 'flex-end' },
    barLabel: { color: C.grayD, fontSize: 9, marginTop: 6 },
    barGlow: { position: 'absolute', bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: C.orange, opacity: 0.3, shadowColor: C.orange, shadowRadius: 10, shadowOpacity: 1 },

    glass: { borderRadius: 18, overflow: 'hidden', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    glassShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, zIndex: 1 },

    routineCard: { width: 130, padding: 14 },
    routineEmoji: { fontSize: 28, marginBottom: 8 },
    routineTitle: { color: C.white, fontWeight: '700', fontSize: 14 },
    routineCount: { color: C.gray, fontSize: 11, marginTop: 2, marginBottom: 10 },
    routineBar: { height: 3, borderRadius: 2 },

    postCard: { marginBottom: 16 },
    postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingBottom: 10 },
    avatarWrap: { width: 42, height: 42, marginRight: 10 },
    postAvatar: { width: 38, height: 38, borderRadius: 19, margin: 2 },
    avatarRing: { position: 'absolute', inset: 0, borderRadius: 21, borderWidth: 2, borderColor: 'transparent' },
    postUser: { color: C.white, fontWeight: '700', fontSize: 14 },
    postDate: { color: C.gray, fontSize: 11, marginTop: 1 },
    bpmBadge: { paddingHorizontal: 10, paddingVertical: 5 },
    bpmText: { color: C.orange, fontSize: 12, fontWeight: '600' },
    divider: { height: 1, backgroundColor: C.border, marginHorizontal: 12 },
    postTitle: { color: C.white, fontWeight: '800', fontSize: 16, marginBottom: 6 },

    routineBadgeGrad: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,120,37,0.3)' },
    routineBadgeText: { color: C.orange, fontSize: 12, fontWeight: '600' },

    postDesc: { color: C.gray, fontSize: 13, lineHeight: 18, marginBottom: 12 },
    postStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, marginHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.border },
    statChip: { alignItems: 'center', gap: 2 },
    statChipIcon: { fontSize: 16 },
    statChipVal: { color: C.white, fontWeight: '600', fontSize: 12 },
    postImage: { width, height: 240 },
    dotRow: { position: 'absolute', bottom: 12, flexDirection: 'row', gap: 6, left: 0, right: 0, justifyContent: 'center' },
    dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
    dotActive: { width: 14, backgroundColor: C.orange },

    actionsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 20 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionText: { color: C.gray, fontSize: 13, fontWeight: '600' },

    commentPreviewRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
    commentPreviewAvatar: { width: 22, height: 22, borderRadius: 11 },
    commentPreviewText: { color: C.gray, fontSize: 13, flex: 1 },
    moreComments: { color: C.orange, fontSize: 11, fontWeight: '700' },

    // modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    commentsSheet: { height: height * 0.82, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(12,12,20,0.97)', borderWidth: 1, borderColor: C.border },
    sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: C.grayD, alignSelf: 'center', marginTop: 10 },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
    sheetTitle: { color: C.white, fontSize: 16, fontWeight: '700' },
    closeBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    closeBtnText: { color: C.gray, fontSize: 16 },

    commentItem: { marginBottom: 16 },
    commentRowInner: { flexDirection: 'row', gap: 10 },
    commentAvatar: { width: 36, height: 36, borderRadius: 18, flexShrink: 0 },
    commentBubble: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderTopLeftRadius: 4, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
    commentUser: { color: C.white, fontWeight: '700', fontSize: 13, marginBottom: 2 },
    commentBody: { color: C.gray, fontSize: 14, lineHeight: 19 },
    commentMeta: { flexDirection: 'row', gap: 12, marginTop: 5, paddingLeft: 4 },
    commentTime: { color: C.grayD, fontSize: 12 },
    replyBtn: { color: C.orange, fontSize: 12, fontWeight: '600' },
    commentLikeBtn: { alignItems: 'center', gap: 2, paddingTop: 4, minWidth: 28 },
    commentLikeCount: { color: C.grayD, fontSize: 11 },

    viewRepliesBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 46, marginTop: 6 },
    replyLine: { width: 20, height: 1, backgroundColor: C.grayD },
    viewRepliesText: { color: C.orange, fontSize: 12, fontWeight: '600' },
    replyItem: { flexDirection: 'row', gap: 8, marginLeft: 46, marginTop: 8 },
    replyAvatar: { width: 28, height: 28, borderRadius: 14, flexShrink: 0 },

    replyingBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(255,120,37,0.08)', borderTopWidth: 1, borderTopColor: 'rgba(255,120,37,0.2)' },
    replyingText: { color: C.gray, fontSize: 13 },

    inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, gap: 10, borderTopWidth: 1, borderTopColor: C.border, paddingBottom: Platform.OS === 'ios' ? 30 : 12 },
    inputAvatar: { width: 34, height: 34, borderRadius: 17 },
    inputWrap: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.border, minHeight: 42 },
    input: { color: C.white, fontSize: 14, maxHeight: 100, lineHeight: 20 },
    sendBtn: {},
    sendBtnGrad: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    sendBtnText: { color: C.white, fontSize: 18, fontWeight: '700' },

    // people modal
    peopleItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    peopleAvatar: { width: 48, height: 48, borderRadius: 24 },
    peopleName: { color: C.white, fontWeight: '700', fontSize: 14 },
    peopleHandle: { color: C.gray, fontSize: 12, marginTop: 1 },
    peopleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    peopleBtnText: { color: C.white, fontSize: 13, fontWeight: '700' },
});
