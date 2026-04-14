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
    Pressable,
} from 'react-native';

import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
    FadeInDown,
    SlideInRight,
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    withSpring,
    withTiming,
    withDelay,
    withSequence,
    interpolate,
    Extrapolation,
    Easing,
} from 'react-native-reanimated';

import { useState, useEffect, useRef } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 260;
const IS_ANDROID = Platform.OS === 'android';

// ─── THEME ────────────────────────────────────────────────────
const C = {
    bg:      '#080810',
    surface: 'rgba(255,255,255,0.04)',
    border:  'rgba(255,255,255,0.08)',
    orange:  '#FF7825',
    orangeD: '#cc5500',
    orangeL: '#FFB347',
    white:   '#f0ede8',
    gray:    'rgba(240,237,232,0.45)',
    grayD:   'rgba(240,237,232,0.18)',
    pink:    '#FF4D6D',
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

const QUICK_EMOJIS = ['💪', '🔥', '👏', '🏋️', '👊', '🥵', '🏆'];

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
                showReplies: false,
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
                showReplies: false,
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
                showReplies: false,
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
            <LinearGradient colors={['rgba(255,255,255,0.10)', 'transparent']} style={styles.glassShine} />
        )}
        {glowColor && (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: glowColor, borderRadius: 18 }]} />
        )}
        <View style={{ zIndex: 2 }}>{children}</View>
    </View>
);

// ─── ANIMATED BAR (PREMIUM) ───────────────────────────────────
const AnimatedBar = ({ value, label, index }: any) => {
    const h = useSharedValue<number>(0);
    const MAX = 100;
    const isHighest = value === 3.5;
    const barH = (value / 4) * MAX;

    useEffect(() => {
        h.value = withDelay(index * 90, withTiming(barH, { duration: 600, easing: Easing.out(Easing.cubic) }));
    }, []);

    const barStyle = useAnimatedStyle(() => ({
        height: h.value,
    }));

    return (
        <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View style={{ height: MAX, justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                {isHighest && (
                    <Animated.Text entering={FadeIn.delay(index * 90 + 600)} style={styles.barValueLabel}>
                        {value}t
                    </Animated.Text>
                )}
                <Animated.View style={[barStyle, { width: 10, borderRadius: 8, overflow: 'hidden', position: 'relative' }]}>
                    <LinearGradient
                        colors={isHighest ? [C.orangeL, C.orange, C.orangeD] : ['rgba(255,120,37,0.55)', 'rgba(255,120,37,0.15)']}
                        style={{ flex: 1, borderRadius: 8 }}
                    />
                    {isHighest && (
                        <View style={styles.barTopGlow} />
                    )}
                </Animated.View>
            </View>
            <Text style={styles.barLabel}>{label}</Text>
        </View>
    );
};

// ─── FOLLOW BUTTON ────────────────────────────────────────────
const FollowButton = ({ isFollowing, onPress }: any) => {
    const scale = useSharedValue<number>(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }] as { scale: number }[],
    }));
    const handlePress = () => {
        scale.value = withSequence(withSpring(0.94), withSpring(1));
        onPress();
    };
    return (
        <Animated.View style={animStyle}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                <LinearGradient
                    colors={isFollowing ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'] : [C.orangeL, C.orange, C.orangeD]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.followBtn}
                >
                    {isFollowing
                        ? <Ionicons name="checkmark" size={13} color={C.orange} style={{ marginRight: 4 }} />
                        : <Ionicons name="add"       size={13} color={C.white}  style={{ marginRight: 4 }} />
                    }
                    <Text style={[styles.followText, isFollowing && { color: C.orange }]}>
                        {isFollowing ? 'Following' : 'Follow'}
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
    const scale = useSharedValue<number>(1);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }] as { scale: number }[],
    }));
    return (
        <Animated.View entering={SlideInRight.delay(index * 80).springify()} style={animStyle}>
            <TouchableOpacity
                onPressIn={() => { scale.value = withSpring(0.96); }}
                onPressOut={() => { scale.value = withSpring(1); }}
                onPress={() => router.push({ pathname: '/home/routine-detail', params: { routineId: item.id, title: item.title } })}
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

// ─── COMMENT LIKE BUTTON ─────────────────────────────────────
const CommentLike = ({ liked, count, onPress }: any) => {
    const scale = useSharedValue<number>(1);
    const press = () => {
        scale.value = withSequence(
            withTiming(0.7, { duration: 70 }),
            withTiming(1.2, { duration: 100 }),
            withTiming(1,   { duration: 80  })
        );
        onPress();
    };
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }] as { scale: number }[],
    }));
    return (
        <TouchableOpacity onPress={press} activeOpacity={1} style={styles.commentLikeRow}>
            <Animated.View style={animStyle}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={13} color={liked ? C.pink : 'rgba(255,255,255,0.35)'} />
            </Animated.View>
            {count > 0 && <Text style={styles.commentLikeCount}>{count}</Text>}
        </TouchableOpacity>
    );
};

// ─── COMMENTS MODAL (SWIPE TO DISMISS) ───────────────────────
const CommentsModal = ({ visible, onClose, post, onUpdatePost }: any) => {
    const [comments, setComments]     = useState<any[]>([]);
    const [draft, setDraft]           = useState('');
    const [replyingTo, setReplyingTo] = useState<{ id: string; user: string } | null>(null);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => { if (post) setComments(post.comments || []); }, [post?.id]);

    const SHEET_H = height * 0.87;
    const sheetY = useSharedValue<number>(SHEET_H);
    const dragY  = useSharedValue<number>(0);

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetY.value + dragY.value }] as { translateY: number }[],
    }));

    useEffect(() => {
        sheetY.value = visible
            ? withTiming(0,       { duration: 320, easing: Easing.out(Easing.cubic) })
            : withTiming(SHEET_H, { duration: 280, easing: Easing.in(Easing.cubic)  });
    }, [visible]);

    // Swipe handler on handle bar
    const onHandleMove = (dy: number) => {
        if (dy > 0) dragY.value = dy;
    };
    const onHandleRelease = (dy: number) => {
        if (dy > 80) {
            dragY.value = withTiming(0, { duration: 0 });
            onClose();
        } else {
            dragY.value = withSpring(0);
        }
    };

    const likeComment = (id: string) =>
        setComments(prev => prev.map((c: any) =>
            c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
        ));

    const likeReply = (cId: string, rId: string) =>
        setComments(prev => prev.map((c: any) =>
            c.id === cId ? { ...c, replies: c.replies.map((r: any) =>
                    r.id === rId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r
                )} : c
        ));

    const toggleReplies = (cId: string) =>
        setComments(prev => prev.map((c: any) =>
            c.id === cId ? { ...c, showReplies: !c.showReplies } : c
        ));

    const startReply = (comment: any) => {
        setReplyingTo({ id: comment.id, user: comment.user });
        setDraft(`@${comment.user} `);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const sendComment = () => {
        if (!draft.trim()) return;
        let updated: any[];
        if (replyingTo) {
            updated = comments.map((c: any) =>
                c.id === replyingTo.id
                    ? { ...c, showReplies: true, replies: [...(c.replies || []), { id: `r${Date.now()}`, user: 'you', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80', text: draft.trim(), time: 'just now', likes: 0, liked: false }] }
                    : c
            );
        } else {
            updated = [{ id: `c${Date.now()}`, user: 'you', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80', text: draft.trim(), time: 'just now', likes: 0, liked: false, showReplies: false, replies: [] }, ...comments];
        }
        setComments(updated);
        onUpdatePost({ ...post, comments: updated });
        setDraft('');
        setReplyingTo(null);
    };

    if (!post) return null;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={{ flex: 1 }} onPress={onClose} />
                <KeyboardAvoidingView behavior={IS_ANDROID ? 'height' : 'padding'} style={styles.sheetKav}>
                    <Animated.View style={[styles.commentsSheet, sheetStyle]}>
                        {/* Draggable Handle */}
                        <TouchableOpacity
                            activeOpacity={1}
                            onStartShouldSetResponder={() => true}
                            onResponderMove={(e) => onHandleMove(e.nativeEvent.pageY - e.nativeEvent.locationY)}
                            onResponderRelease={(e) => onHandleRelease(e.nativeEvent.pageY - e.nativeEvent.locationY)}
                            style={styles.handleArea}
                        >
                            <View style={styles.sheetHandle} />
                        </TouchableOpacity>
                        <Text style={styles.sheetTitle}>Comments</Text>

                        {/* Comments list */}
                        <ScrollView
                            style={styles.commentsList}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {comments.length === 0 ? (
                                <View style={styles.emptyComments}>
                                    <Ionicons name="chatbubble-outline" size={32} color={C.grayD} />
                                    <Text style={styles.emptyCommentsText}>No comments yet. Be first!</Text>
                                </View>
                            ) : (
                                comments.map((comment: any, idx: number) => (
                                    <Animated.View key={comment.id} entering={FadeInDown.delay(idx * 30).duration(260).easing(Easing.out(Easing.cubic))}>
                                        <View style={styles.commentItem}>
                                            <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.commentTopRow}>
                                                    <Text style={styles.commentUser}>{comment.user}</Text>
                                                    <Text style={styles.commentTime}>{comment.time}</Text>
                                                </View>
                                                <Text style={styles.commentBody}>{comment.text}</Text>
                                                <View style={styles.commentActions}>
                                                    <TouchableOpacity onPress={() => startReply(comment)} style={styles.replyTapBtn}>
                                                        <Text style={styles.replyBtnText}>Reply</Text>
                                                    </TouchableOpacity>
                                                    {comment.replies?.length > 0 && (
                                                        <TouchableOpacity onPress={() => toggleReplies(comment.id)} style={styles.viewRepliesBtn}>
                                                            <Ionicons name={comment.showReplies ? 'chevron-up' : 'chevron-down'} size={11} color={C.orange} />
                                                            <Text style={styles.viewRepliesText}>
                                                                {comment.showReplies ? 'Hide' : `${comment.replies.length}`} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                {comment.showReplies && comment.replies?.map((reply: any) => (
                                                    <View key={reply.id} style={styles.replyItem}>
                                                        <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} />
                                                        <View style={{ flex: 1 }}>
                                                            <View style={styles.commentTopRow}>
                                                                <Text style={styles.commentUser}>{reply.user}</Text>
                                                                <Text style={styles.commentTime}>{reply.time}</Text>
                                                            </View>
                                                            <Text style={styles.commentBody}>{reply.text}</Text>
                                                        </View>
                                                        <CommentLike liked={reply.liked} count={reply.likes} onPress={() => likeReply(comment.id, reply.id)} />
                                                    </View>
                                                ))}
                                            </View>
                                            <CommentLike liked={comment.liked} count={comment.likes} onPress={() => likeComment(comment.id)} />
                                        </View>
                                        {idx < comments.length - 1 && <View style={styles.commentDivider} />}
                                    </Animated.View>
                                ))
                            )}
                            <View style={{ height: 16 }} />
                        </ScrollView>

                        {/* Quick Emojis */}
                        <View style={styles.emojiRow}>
                            {QUICK_EMOJIS.map(emoji => (
                                <TouchableOpacity key={emoji} onPress={() => setDraft(prev => `${prev}${emoji}`)} style={styles.emojiBtn}>
                                    <Text style={styles.emojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Reply banner */}
                        {replyingTo && (
                            <Animated.View entering={FadeIn.duration(200)} style={styles.replyBanner}>
                                <Ionicons name="return-down-forward" size={13} color={C.orange} />
                                <Text style={styles.replyBannerText}>
                                    Replying to <Text style={{ color: C.orange, fontWeight: '700' }}>@{replyingTo.user}</Text>
                                </Text>
                                <TouchableOpacity onPress={() => { setReplyingTo(null); setDraft(''); }}>
                                    <Ionicons name="close" size={14} color={C.gray} />
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* Input bar */}
                        <View style={styles.commentInputBar}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={styles.commentInputGrad}
                            >
                                <TextInput
                                    ref={inputRef}
                                    value={draft}
                                    onChangeText={setDraft}
                                    placeholder={replyingTo ? `Reply to @${replyingTo.user}...` : 'Add a comment...'}
                                    placeholderTextColor={C.grayD}
                                    style={styles.commentInput}
                                    multiline
                                    selectionColor={C.orange}
                                />
                            </LinearGradient>
                            <TouchableOpacity
                                onPress={sendComment}
                                disabled={!draft.trim()}
                                style={[styles.sendBtn, !draft.trim() && { opacity: 0.35 }]}
                                activeOpacity={0.8}
                            >
                                <LinearGradient colors={[C.orangeL, C.orange, C.orangeD]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                                <Ionicons name="arrow-up" size={IS_ANDROID ? 18 : 20} color={C.bg} />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

// ─── PEOPLE MODAL ─────────────────────────────────────────────
const PeopleModal = ({ visible, onClose, title }: any) => {
    const [list, setList] = useState(FOLLOWING_LIST);
    const SHEET_H = height * 0.62;
    const sheetY = useSharedValue<number>(SHEET_H);
    const dragY  = useSharedValue<number>(0);

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetY.value + dragY.value }] as { translateY: number }[],
    }));
    useEffect(() => {
        sheetY.value = visible
            ? withTiming(0,       { duration: 320, easing: Easing.out(Easing.cubic) })
            : withTiming(SHEET_H, { duration: 280, easing: Easing.in(Easing.cubic)  });
        if (!visible) dragY.value = 0;
    }, [visible]);

    const onHandleRelease = (dy: number) => {
        if (dy > 60) {
            dragY.value = withTiming(0, { duration: 0 });
            onClose();
        } else {
            dragY.value = withSpring(0);
        }
    };

    const toggle = (id: string) =>
        setList(prev => prev.map(p => p.id === id ? { ...p, isFollowing: !p.isFollowing } : p));

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={{ flex: 1 }} onPress={onClose} />
                <Animated.View style={[styles.commentsSheet, { height: SHEET_H }, sheetStyle]}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onStartShouldSetResponder={() => true}
                        onResponderMove={(e) => { const dy = e.nativeEvent.pageY - e.nativeEvent.locationY; if (dy > 0) dragY.value = dy; }}
                        onResponderRelease={(e) => onHandleRelease(e.nativeEvent.pageY - e.nativeEvent.locationY)}
                        style={styles.handleArea}
                    >
                        <View style={styles.sheetHandle} />
                    </TouchableOpacity>
                    <Text style={styles.sheetTitle}>{title}</Text>
                    <FlatList
                        data={list}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={styles.peopleItem}>
                                <View style={styles.peopleAvatarWrap}>
                                    <Image source={{ uri: item.avatar }} style={styles.peopleAvatar} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.peopleName}>{item.name}</Text>
                                    <Text style={styles.peopleHandle}>@{item.user}</Text>
                                </View>
                                <TouchableOpacity onPress={() => toggle(item.id)} activeOpacity={0.8}>
                                    <LinearGradient
                                        colors={item.isFollowing ? ['rgba(255,120,37,0.12)', 'rgba(255,120,37,0.06)'] : [C.orangeL, C.orange]}
                                        style={styles.peopleBtn}
                                    >
                                        {item.isFollowing && <Ionicons name="checkmark" size={11} color={C.orange} style={{ marginRight: 3 }} />}
                                        <Text style={[styles.peopleBtnText, item.isFollowing && { color: C.orange }]}>
                                            {item.isFollowing ? 'Following' : 'Follow'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    />
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
    const heartScale = useSharedValue<number>(1);
    const heartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartScale.value }] as { scale: number }[],
    }));

    const toggleLike = () => {
        heartScale.value = withSequence(
            withTiming(0.7,  { duration: 80  }),
            withTiming(1.25, { duration: 120 }),
            withTiming(1,    { duration: 100 })
        );
        setLiked((v: boolean) => { setLikes((l: number) => l + (v ? -1 : 1)); return !v; });
    };

    const handleShare = async () => {
        try { await Share.share({ message: `Check out this workout: "${post.title}" — ${post.desc}`, title: post.title }); } catch {}
    };

    return (
        <Animated.View entering={FadeInDown.delay(index * 120).springify()}>
            <LinearGradient
                colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.postCard}
            >
                {/* Top shine */}
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.07)', 'transparent']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.cardShine} pointerEvents="none"
                />
                {/* Orange accent bar */}
                <LinearGradient colors={[C.orange, C.orangeD]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardAccentBar} />

                {/* HEADER */}
                <View style={styles.postHeader}>
                    <View style={styles.avatarWrap}>
                        <Image source={{ uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80' }} style={styles.postAvatar} />
                        <View style={styles.avatarOnline} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.postUser} numberOfLines={1}>jadewolfe</Text>
                        <Text style={styles.postDate}>{post.date}</Text>
                    </View>
                    <GlassCard style={styles.bpmBadge} shine={false}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="heart" size={14} color={C.pink} />
                            <Text style={styles.bpmText}>{post.bpm}</Text>
                        </View>
                    </GlassCard>
                </View>

                {/* TITLE + ROUTINE BADGE */}
                <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/home/workout-detail', params: { routineId: post.routineId, title: post.routineName } })}
                        style={{ alignSelf: 'flex-start', marginBottom: 8 }}
                    >
                        <LinearGradient colors={['rgba(255,120,37,0.18)', 'rgba(255,120,37,0.06)']} style={styles.routineBadgeGrad}>
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
                <View style={{ marginHorizontal: 14, borderRadius: 14, overflow: 'hidden' }}>
                    <ScrollView
                        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={e => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / (width - 28)))}
                    >
                        {post.images.map((img: string, i: number) => (
                            <View key={i} style={{ width: width - 28 }}>
                                <Image source={{ uri: img }} style={[styles.postImage, { width: width - 28 }]} />
                                <LinearGradient colors={['transparent', 'rgba(8,8,16,0.65)']} style={[StyleSheet.absoluteFillObject, { top: '40%' }]} />
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
                        <Animated.View style={heartStyle}>
                            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={IS_ANDROID ? 20 : 22} color={liked ? C.pink : 'rgba(255,255,255,0.65)'} />
                        </Animated.View>
                        <Text style={[styles.actionText, liked && { color: C.pink }]}>{likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onOpenComments(post)} style={styles.actionBtn}>
                        <Ionicons name="chatbubble-outline" size={IS_ANDROID ? 19 : 21} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                        <Ionicons name="arrow-redo-outline" size={IS_ANDROID ? 19 : 21} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="bookmark-outline" size={IS_ANDROID ? 19 : 21} color="rgba(255,255,255,0.4)" />
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
            </LinearGradient>
        </Animated.View>
    );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────
export default function UserScreen() {
    const { name, user, avatar } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [isFollowing,  setIsFollowing]  = useState(false);
    const [posts,        setPosts]        = useState(INITIAL_POSTS);
    const [commentsPost, setCommentsPost] = useState<any>(null);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [peopleModal,  setPeopleModal]  = useState<string | null>(null);
    const scrollRef = useRef<any>(null);
    const postsY    = useRef(0);

    const scrollToPosts = () => { scrollRef.current?.scrollTo({ y: postsY.current - 50, animated: true }); };

    const scrollY = useSharedValue<number>(0);
    const scrollHandler = useAnimatedScrollHandler(e => { scrollY.value = e.contentOffset.y; });

    const headerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(scrollY.value, [0, HEADER_HEIGHT], [0, -HEADER_HEIGHT * 0.4], Extrapolation.CLAMP) }] as { translateY: number }[],
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
            <Animated.View style={[styles.backBtn, { top: insets.top + (IS_ANDROID ? 8 : 10) }]} entering={FadeInDown.delay(50)}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtnInner} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
                    <Ionicons name="chevron-back" size={20} color={C.white} />
                </TouchableOpacity>
            </Animated.View>

            {/* ── STICKY NAV BAR ── */}
            <Animated.View style={[styles.stickyBar, { height: 60 + insets.top, paddingTop: insets.top }, navStyle]} pointerEvents="none">
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
                <LinearGradient colors={['rgba(8,8,16,0.92)', 'transparent']} style={StyleSheet.absoluteFillObject} />
                <Text style={styles.stickyName}>{name || 'Jessica'}</Text>
            </Animated.View>

            <Animated.ScrollView ref={scrollRef} onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>

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
                        <StatPill label="Workouts" value="142" delay={200} onPress={scrollToPosts} />
                        <StatPill label="Following" value="88"  delay={260} onPress={() => setPeopleModal('Following')} />
                        <StatPill label="Followers" value="1.2k" delay={320} onPress={() => setPeopleModal('Followers')} />
                    </View>

                    <Animated.View entering={FadeInDown.delay(350).springify()}>
                        <FollowButton isFollowing={isFollowing} onPress={() => setIsFollowing(v => !v)} />
                    </Animated.View>

                    {/* ── PREMIUM GRAPH ── */}
                    <Animated.View entering={FadeInDown.delay(400).springify()}>
                        <Text style={styles.section}>Volume This Month</Text>
                        <GlassCard style={{ padding: 18 }}>
                            {/* Graph header */}
                            <View style={styles.graphHeader}>
                                <View>
                                    <Text style={styles.graphTitle}>Total Lifted</Text>
                                    <Text style={styles.graphBigNum}>14.4 tonnes</Text>
                                </View>
                                <View style={styles.graphBadge}>
                                    <Ionicons name="trending-up" size={12} color={C.orange} />
                                    <Text style={styles.graphBadgeText}>↑ 28%</Text>
                                </View>
                            </View>

                            {/* Bars */}
                            <View style={styles.graph}>
                                {GRAPH_DATA.map((d, i) => <AnimatedBar key={i} {...d} index={i} />)}
                            </View>

                            {/* Bottom rule */}
                            <View style={styles.graphRule} />

                            {/* Mini legend */}
                            <View style={styles.graphLegend}>
                                <View style={styles.legendDot} />
                                <Text style={styles.legendText}>Bi-weekly volume (tonnes)</Text>
                            </View>
                        </GlassCard>
                    </Animated.View>

                    {/* ── ROUTINES ── */}
                    <Text style={styles.section}>Routines</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
                        <View style={{ flexDirection: 'row', gap: 12, paddingRight: 16 }}>
                            {ROUTINES.map((r, i) => <RoutineCard key={r.id} item={r} index={i} />)}
                        </View>
                    </ScrollView>

                    {/* ── POSTS ── */}
                    <View onLayout={(e) => { postsY.current = e.nativeEvent.layout.y; }}>
                        <Text style={styles.section}>Posts</Text>
                    </View>
                    {posts.map((p, i) => (
                        <View key={p.id} style={{ marginBottom: 14 }}>
                            <PostCard post={p} index={i} onOpenComments={openComments} onUpdatePost={updatePost} />
                        </View>
                    ))}

                    <View style={{ height: 40 }} />
                </View>
            </Animated.ScrollView>

            <CommentsModal visible={commentsOpen} onClose={() => setCommentsOpen(false)} post={commentsPost} onUpdatePost={updatePost} />
            <PeopleModal   visible={!!peopleModal} onClose={() => setPeopleModal(null)} title={peopleModal || ''} />
        </View>
    );
}

// ─── STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },

    backBtn: { position: 'absolute', left: 16, zIndex: 200 },
    backBtnInner: {
        width: 38, height: 38, borderRadius: 19,
        overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: C.border,
    },

    stickyBar: {
        position: 'absolute', top: 0, left: 0, right: 0,
        alignItems: 'center', justifyContent: 'center',
        zIndex: 100, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    stickyName: { color: C.white, fontSize: 15, fontWeight: '700' },

    grid: { flexDirection: 'row', height: HEADER_HEIGHT },
    gridImg: { flex: 1 },
    gridFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 130 },

    body: { padding: 16, paddingTop: 0 },

    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    mainAvatarWrap: { width: 72, height: 72 },
    mainAvatar: { width: 66, height: 66, borderRadius: 33, margin: 3 },
    mainAvatarRing: { position: 'absolute', inset: 0, borderRadius: 36, borderWidth: 2.5, borderColor: 'transparent' },
    name: { color: C.white, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
    handle: { color: C.gray, fontSize: 13, marginTop: 1 },
    bio: { color: C.gray, fontSize: 14, lineHeight: 20, marginBottom: 16 },

    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statPill: { padding: 14, alignItems: 'center', borderRadius: 18 },
    statValue: { color: C.white, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
    statLabel: { color: C.gray, fontSize: 11, marginTop: 3, letterSpacing: 0.3, textTransform: 'uppercase' },

    followBtn: {
        height: 48, borderRadius: 24,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', marginBottom: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    followText: { color: C.white, fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },

    section: { color: C.white, fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 12, letterSpacing: -0.2 },

    // Graph
    graphHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
    graphTitle:  { color: C.gray, fontSize: 12, fontWeight: '600', marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' },
    graphBigNum: { color: C.white, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
    graphBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,120,37,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,120,37,0.25)' },
    graphBadgeText: { color: C.orange, fontSize: 12, fontWeight: '700' },
    graph:       { flexDirection: 'row', height: 120, alignItems: 'flex-end', gap: 2 },
    barLabel:    { color: C.grayD, fontSize: 9, marginTop: 6, textAlign: 'center' },
    barValueLabel: { color: C.orange, fontSize: 10, fontWeight: '700', marginBottom: 4 },
    barTopGlow:  { position: 'absolute', top: 0, left: 0, right: 0, height: 6, backgroundColor: C.orangeL, opacity: 0.6, borderRadius: 6 },
    graphRule:   { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginTop: 12, marginBottom: 8 },
    graphLegend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: C.orange },
    legendText:  { color: C.grayD, fontSize: 11 },

    // Glass
    glass: { borderRadius: 18, overflow: 'hidden', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    glassShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, zIndex: 1 },

    // Routines
    routineCard:  { width: 130, padding: 14 },
    routineEmoji: { fontSize: 28, marginBottom: 8 },
    routineTitle: { color: C.white, fontWeight: '700', fontSize: 14 },
    routineCount: { color: C.gray, fontSize: 11, marginTop: 2, marginBottom: 10 },
    routineBar:   { height: 3, borderRadius: 2 },

    // Post card
    postCard: {
        borderRadius: 18, overflow: 'hidden',
        borderWidth: 0.5, borderColor: C.border,
    },
    cardShine:     { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
    cardAccentBar: { height: 2, width: '40%', borderBottomRightRadius: 2 },
    postHeader:    { flexDirection: 'row', alignItems: 'center', padding: 14, paddingBottom: 10, gap: 10, flexWrap: 'nowrap' },
    avatarWrap:    { position: 'relative' },
    postAvatar:    { width: IS_ANDROID ? 36 : 40, height: IS_ANDROID ? 36 : 40, borderRadius: IS_ANDROID ? 18 : 20, borderWidth: 2, borderColor: 'rgba(255,120,37,0.4)' },
    avatarOnline:  { position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: 5, backgroundColor: '#34c759', borderWidth: 1.5, borderColor: C.bg },
    postUser:      { color: C.white, fontWeight: '700', fontSize: 14 },
    postDate:      { color: C.gray, fontSize: 11, marginTop: 1 },
    bpmBadge:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, flexShrink: 0 },
    bpmText:       { color: C.pink, fontSize: 13, fontWeight: '700', marginLeft: 3 },
    postTitle:     { color: C.white, fontWeight: '800', fontSize: 16, marginBottom: 6 },
    routineBadgeGrad: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,120,37,0.28)' },
    routineBadgeText: { color: C.orange, fontSize: 12, fontWeight: '600' },
    postDesc:      { color: C.gray, fontSize: 13, lineHeight: 18, marginBottom: 12 },
    postStats:     { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, marginHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.border },
    statChip:      { alignItems: 'center', gap: 2 },
    statChipIcon:  { fontSize: 16 },
    statChipVal:   { color: C.white, fontWeight: '600', fontSize: 12 },
    postImage:     { height: 240, backgroundColor: '#1a1a1a' },
    dotRow:        { position: 'absolute', bottom: 12, flexDirection: 'row', gap: 6, left: 0, right: 0, justifyContent: 'center' },
    dot:           { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
    dotActive:     { width: 14, backgroundColor: C.orange },
    actionsRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4, gap: 16 },
    actionBtn:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
    actionText:    { color: C.gray, fontSize: 13, fontWeight: '600' },
    commentPreviewRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 14, gap: 8, marginTop: 4 },
    commentPreviewAvatar: { width: 22, height: 22, borderRadius: 11 },
    commentPreviewText:   { color: C.gray, fontSize: 13, flex: 1 },
    moreComments:         { color: C.orange, fontSize: 11, fontWeight: '700' },

    // Modal / Sheet
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheetKav:     { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, justifyContent: 'flex-end' },
    commentsSheet: {
        backgroundColor: '#0e0d0b',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingTop: 10, paddingBottom: IS_ANDROID ? 16 : 24,
        borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.09)',
        maxHeight: '87%',
    },
    handleArea:  { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 60 },
    sheetHandle: { width: 40, height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center' },
    sheetTitle:  { color: C.white, fontWeight: '700', fontSize: 16, textAlign: 'center', marginBottom: 10 },

    // Comments
    commentsList: { maxHeight: IS_ANDROID ? 280 : 320, paddingHorizontal: 14 },
    emptyComments: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30, gap: 10 },
    emptyCommentsText: { color: C.gray, fontSize: 14 },
    commentItem:   { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12 },
    commentAvatar: { width: IS_ANDROID ? 34 : 38, height: IS_ANDROID ? 34 : 38, borderRadius: IS_ANDROID ? 17 : 19, backgroundColor: '#1a1a1a', marginRight: 10, borderWidth: 1.5, borderColor: 'rgba(255,120,37,0.3)' },
    commentTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    commentUser:   { color: C.white, fontWeight: '700', fontSize: 13 },
    commentTime:   { color: C.grayD, fontSize: 11 },
    commentBody:   { color: 'rgba(240,237,232,0.8)', fontSize: 14, lineHeight: 20 },
    commentActions:{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
    replyTapBtn:   { paddingVertical: 2 },
    replyBtnText:  { color: C.orange, fontSize: 12, fontWeight: '700' },
    viewRepliesBtn:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
    viewRepliesText: { color: C.orange, fontSize: 12, fontWeight: '600' },
    commentLikeRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, paddingLeft: 8, paddingTop: 2, minWidth: 28 },
    commentLikeCount:{ color: 'rgba(255,255,255,0.35)', fontSize: 11 },
    commentDivider:  { height: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' },
    replyItem:       { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10, paddingLeft: 14, borderLeftWidth: 2, borderLeftColor: 'rgba(255,120,37,0.18)' },
    replyAvatar:     { width: IS_ANDROID ? 26 : 28, height: IS_ANDROID ? 26 : 28, borderRadius: IS_ANDROID ? 13 : 14, backgroundColor: '#1a1a1a', marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,120,37,0.22)' },

    // Emoji row
    emojiRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: IS_ANDROID ? 10 : 12, paddingBottom: IS_ANDROID ? 8 : 10, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.06)', marginTop: 4 },
    emojiBtn:  { paddingHorizontal: 2 },
    emojiText: { fontSize: IS_ANDROID ? 22 : 26 },

    // Reply banner
    replyBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: 'rgba(255,120,37,0.07)', borderTopWidth: 0.5, borderTopColor: 'rgba(255,120,37,0.15)' },
    replyBannerText: { flex: 1, color: C.gray, fontSize: 13 },

    // Input bar
    commentInputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 8, gap: 10 },
    commentInputGrad: { flex: 1, minHeight: IS_ANDROID ? 46 : 50, borderRadius: IS_ANDROID ? 23 : 25, flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: C.border, overflow: 'hidden' },
    commentInput: { flex: 1, color: C.white, paddingHorizontal: 18, fontSize: IS_ANDROID ? 14 : 15, maxHeight: 100, lineHeight: 20 },
    sendBtn: { width: IS_ANDROID ? 46 : 50, height: IS_ANDROID ? 46 : 50, borderRadius: IS_ANDROID ? 23 : 25, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },

    // People modal
    peopleItem:      { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    peopleAvatarWrap:{ borderWidth: 1.5, borderColor: 'rgba(255,120,37,0.3)', borderRadius: 26, padding: 1.5 },
    peopleAvatar:    { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a1a1a' },
    peopleName:      { color: C.white, fontWeight: '700', fontSize: 14 },
    peopleHandle:    { color: C.gray, fontSize: 12, marginTop: 1 },
    peopleBtn:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    peopleBtnText:   { color: C.white, fontSize: 13, fontWeight: '700' },
});