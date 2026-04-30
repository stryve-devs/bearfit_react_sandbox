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
    ActivityIndicator,
    RefreshControl,
} from 'react-native';

import { useLocalSearchParams, router } from 'expo-router';
import Animated,
{
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
import { userService } from '@/api/services/user.service';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/client';
import { fetchPostService } from '@/api/services/fetchpost.service';
import { DiscoverPost } from '@/types/fetchpost.types';
import discoverUtils from '@/components/Discover/utils';
import { VideoView, useVideoPlayer } from 'expo-video';

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
const resolveExerciseIcon = discoverUtils.resolveExerciseIcon;

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

const formatAbsolutePostDate = (relativeTime?: string) => relativeTime || 'Recently';

const mapApiCommentToUiComment = (comment: any): any => ({
    id: comment.id,
    user: comment.user,
    avatar: comment.avatarUrl,
    avatarUrl: comment.avatarUrl,
    text: comment.text,
    time: comment.time,
    likes: comment.likes ?? 0,
    liked: !!comment.liked,
    showReplies: false,
    replies: Array.isArray(comment.replies) ? comment.replies.map(mapApiCommentToUiComment) : [],
});

const mapApiPostToUiPost = (post: DiscoverPost) => ({
    id: post.id,
    userId: post.userId,
    title: post.title || 'Workout',
    routineId: post.id,
    routineName: post.exercises?.[0]?.name || 'Workout',
    caption: post.caption || '',
    desc: post.caption || '',
    time: post.stats?.time || '0min',
    volume: post.stats?.weight || '0 kgs',
    records: '0',
    bpm: post.stats?.bpm || '--',
    date: formatAbsolutePostDate(post.time),
    media: Array.isArray(post.media) ? post.media : [],
    images: post.media?.length ? post.media.map((media) => media.url) : [],
    likes: post.likesCount || 0,
    liked: !!post.likedByMe,
    likesCount: post.likesCount || 0,
    likedByMe: !!post.likedByMe,
    likedByUsername: post.likedByUsername,
    likedByAvatarUrls: Array.isArray(post.likedByAvatarUrls) ? post.likedByAvatarUrls : [],
    athlete: post.athlete,
    stats: post.stats,
    exercises: Array.isArray(post.exercises)
        ? post.exercises.map((exercise) => ({
            ...exercise,
            iconUrl: resolveExerciseIcon(exercise.name, exercise.imagePath),
        }))
        : [],
    commentsCount: post.commentsCount || 0,
    comments: Array.isArray(post.comments) ? post.comments.map(mapApiCommentToUiComment) : [],
});

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

const ProfileVideoMedia = ({ uri, isActive }: { uri: string; isActive: boolean }) => {
    const player = useVideoPlayer(uri as any);

    useEffect(() => {
        player.loop = true;

        if (isActive) {
            player.muted = false;
            try {
                if (typeof (player as any).play === 'function') (player as any).play();
                if (typeof (player as any).playAsync === 'function') (player as any).playAsync();
            } catch {}
            return;
        }

        player.muted = true;
        try {
            if (typeof (player as any).pause === 'function') (player as any).pause();
            if (typeof (player as any).pauseAsync === 'function') (player as any).pauseAsync();
        } catch {}
        try {
            if (typeof (player as any).setCurrentTime === 'function') (player as any).setCurrentTime(0);
            (player as any).currentTime = 0;
        } catch {}
    }, [isActive, player]);

    return <VideoView player={player} style={styles.postImage} contentFit="cover" nativeControls={false} />;
};

const ProfileMediaSlide = ({ media, isActive }: { media: { url: string; type: 'IMAGE' | 'VIDEO' }; isActive: boolean }) => {
    if (media.type === 'VIDEO') {
        return (
            <View style={styles.mediaSlide}>
                <ProfileVideoMedia uri={media.url} isActive={isActive} />
                <View style={styles.videoHint}>
                    <Ionicons name="videocam" size={11} color={C.white} />
                    <Text style={styles.videoHintText}>Video</Text>
                </View>
            </View>
        );
    }

    return <Image source={{ uri: media.url }} style={styles.postImage} />;
};

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
const FollowButton = ({ isFollowing, onPress, pending, pendingAction }: any) => {
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
                        {pendingAction === 'follow' ? 'Following...' : pendingAction === 'unfollow' ? 'Unfollowing...' : (isFollowing ? 'Following' : 'Follow')}
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
const PeopleModal = ({ visible, onClose, title, targetUserId }: any) => {
     const SHEET_H = height * 0.62;
     const sheetY = useSharedValue<number>(SHEET_H);
     const dragY  = useSharedValue<number>(0);

     const { user: authUser } = useAuth();
     const [list, setList] = useState<any[]>([]);
     const [loadingList, setLoadingList] = useState(false);
     const [pendingMap, setPendingMap] = useState<Record<number, boolean>>({});
     const [myFollowingSet, setMyFollowingSet] = useState<Set<number>>(new Set());

     const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetY.value + dragY.value }] as { translateY: number }[],
    }));

    useEffect(() => {
        sheetY.value = visible
            ? withTiming(0,       { duration: 320, easing: Easing.out(Easing.cubic) })
            : withTiming(SHEET_H, { duration: 280, easing: Easing.in(Easing.cubic)  });
        if (!visible) dragY.value = 0;
    }, [visible]);

    // Fetch list when modal opens or when targetUserId/title changes
    useEffect(() => {
        let mounted = true;
        if (!visible) return;
        if (!targetUserId) return;

        (async () => {
            try {
                setLoadingList(true);

                // Fetch the list of people (followers or following for the target user)
                const users = title === 'Followers'
                    ? await userService.getFollowers(targetUserId)
                    : await userService.getFollowing(targetUserId);

                // If authenticated, fetch the current user's following so we can mark which of these users the current user already follows
                let myFollowingIds: number[] = [];
                if (authUser?.user_id) {
                    try {
                        const myFollowing = await userService.getFollowing(authUser.user_id);
                        myFollowingIds = myFollowing.map((u: any) => Number(u.user_id));
                    } catch (err) {
                        // ignore - we can still show the list without follow state
                        console.warn('[UserScreen.PeopleModal] failed to fetch my following list', err);
                    }
                }

                if (!mounted) return;

                const mySet = new Set(myFollowingIds);
                setMyFollowingSet(mySet);

                // Annotate each user with isFollowing (whether current user follows them) and removed flag
                const annotated = users.map((u: any) => ({
                    ...u,
                    isFollowing: mySet.has(Number(u.user_id)),
                    removed: false,
                }));

                setList(annotated);
            } catch (err) {
                console.warn('[UserScreen.PeopleModal] failed to fetch people', err);
                setList([]);
            } finally {
                if (mounted) setLoadingList(false);
            }
        })();

        return () => { mounted = false; };
    }, [visible, targetUserId, title, authUser?.user_id]);

    const onHandleRelease = (dy: number) => {
        if (dy > 60) {
            dragY.value = withTiming(0, { duration: 0 });
            onClose();
        } else {
            dragY.value = withSpring(0);
        }
    };

    const handleFollow = async (userId: number) => {
        if (pendingMap[userId]) return;
        setPendingMap(p => ({ ...p, [userId]: true }));
        try {
            await userService.followUser(userId);
            setList(prev => prev.map(p => p.user_id === userId ? { ...p, isFollowing: true } : p));
        } catch (err) {
            console.warn('follow failed', err);
        } finally {
            setPendingMap(p => { const n = { ...p }; delete n[userId]; return n; });
        }
    };

    const handleUnfollow = async (userId: number) => {
        if (pendingMap[userId]) return;
        setPendingMap(p => ({ ...p, [userId]: true }));
        try {
            await userService.unfollowUser(userId);
            setList(prev => prev.map(p => p.user_id === userId ? { ...p, isFollowing: false } : p));
        } catch (err) {
            console.warn('unfollow failed', err);
        } finally {
            setPendingMap(p => { const n = { ...p }; delete n[userId]; return n; });
        }
    };

    const handleRemoveFollower = async (userId: number) => {
        if (pendingMap[userId]) return;
        setPendingMap(p => ({ ...p, [userId]: true }));
        try {
            await userService.removeFollower(userId);
            setList(prev => prev.map(p => p.user_id === userId ? { ...p, removed: true } : p));
        } catch (err) {
            console.warn('remove follower failed', err);
        } finally {
            setPendingMap(p => { const n = { ...p }; delete n[userId]; return n; });
        }
    };

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

                    {loadingList ? (
                        <View style={{ padding: 24, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color={C.orange} />
                        </View>
                    ) : (
                        <FlatList
                            data={list}
                            keyExtractor={(item: any) => String(item.user_id)}
                            contentContainerStyle={{ padding: 16 }}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }: any) => (
                                <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={styles.peopleItem}>
                                    <View style={styles.peopleAvatarWrap}>
                                        <Image source={{ uri: item.profile_pic_url || `https://i.pravatar.cc/150?u=${item.user_id}` }} style={styles.peopleAvatar} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.peopleName}>{item.name}</Text>
                                        <Text style={styles.peopleHandle}>@{item.username}</Text>
                                    </View>
                                    {/* Don't show follow/unfollow/remove controls for the current signed-in user */}
                                    {(() => {
                                        const isSelf = !!(authUser && Number(item.user_id) === Number(authUser.user_id));
                                        return (
                                            <>
                                                {title === 'Following' && !isSelf && (
                                                    <TouchableOpacity
                                                        onPress={() => item.isFollowing ? handleUnfollow(item.user_id) : handleFollow(item.user_id)}
                                                        activeOpacity={0.8}
                                                    >
                                                        <LinearGradient
                                                            colors={item.isFollowing ? ['rgba(255,120,37,0.12)', 'rgba(255,120,37,0.06)'] : [C.orangeL, C.orange]}
                                                            style={styles.peopleBtn}
                                                        >
                                                            {item.isFollowing && <Ionicons name="checkmark" size={11} color={C.orange} style={{ marginRight: 3 }} />}
                                                            <Text style={[styles.peopleBtnText, item.isFollowing && { color: C.orange }]}>
                                                                {pendingMap[item.user_id] ? (item.isFollowing ? 'Unfollowing...' : 'Following...') : (item.isFollowing ? 'Following' : 'Follow')}
                                                            </Text>
                                                        </LinearGradient>
                                                    </TouchableOpacity>
                                                )}

                                                {title === 'Followers' && !isSelf && (
                                                    authUser && Number(targetUserId) === Number(authUser.user_id) ? (
                                                        // owner view: allow removing followers
                                                        <TouchableOpacity
                                                            onPress={() => handleRemoveFollower(item.user_id)}
                                                            activeOpacity={0.8}
                                                        >
                                                            <LinearGradient
                                                                colors={[C.orangeL, C.orange]}
                                                                style={styles.peopleBtn}
                                                            >
                                                                <Text style={[styles.peopleBtnText, { color: '#111' }]}>
                                                                    {pendingMap[item.user_id] ? 'Removing...' : 'Remove'}
                                                                </Text>
                                                            </LinearGradient>
                                                        </TouchableOpacity>
                                                    ) : (
                                                        // public view: show follow/unfollow state
                                                        <TouchableOpacity
                                                            onPress={() => item.isFollowing ? handleUnfollow(item.user_id) : handleFollow(item.user_id)}
                                                            activeOpacity={0.8}
                                                        >
                                                            <LinearGradient
                                                                colors={item.isFollowing ? ['rgba(255,120,37,0.12)', 'rgba(255,120,37,0.06)'] : [C.orangeL, C.orange]}
                                                                style={styles.peopleBtn}
                                                            >
                                                                {item.isFollowing && <Ionicons name="checkmark" size={11} color={C.orange} style={{ marginRight: 3 }} />}
                                                                <Text style={[styles.peopleBtnText, item.isFollowing && { color: C.orange }]}>
                                                                    {pendingMap[item.user_id] ? (item.isFollowing ? 'Unfollowing...' : 'Following...') : (item.isFollowing ? 'Following' : 'Follow')}
                                                                </Text>
                                                            </LinearGradient>
                                                        </TouchableOpacity>
                                                    )
                                                )}
                                            </>
                                        );
                                    })()}
                                 </Animated.View>
                             )}
                         />
                     )}
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
    const [mediaWidth, setMediaWidth] = useState(0);
    const mediaCount = Array.isArray(post.media) ? post.media.length : 0;
    const totalSlides = mediaCount + 1;
    const slideWidth = mediaWidth || (width - 28);

    useEffect(() => {
        setLiked(post.liked);
        setLikes(post.likes);
    }, [post.id, post.liked, post.likes]);

    const heartScale = useSharedValue<number>(1);
    const heartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartScale.value }] as { scale: number }[],
    }));

    const toggleLike = async () => {
        heartScale.value = withSequence(
            withTiming(0.7,  { duration: 80  }),
            withTiming(1.25, { duration: 120 }),
            withTiming(1,    { duration: 100 })
        );

        const prevLiked = liked;
        const prevLikes = likes;
        const nextLiked = !prevLiked;
        const nextLikes = prevLikes + (prevLiked ? -1 : 1);

        setLiked(nextLiked);
        setLikes(nextLikes);
        onUpdatePost({ ...post, liked: nextLiked, likedByMe: nextLiked, likes: nextLikes, likesCount: nextLikes });

        try {
            const result = await fetchPostService.togglePostLike(post.id);
            setLiked(result.liked);
            setLikes(result.likesCount);
            onUpdatePost({
                ...post,
                liked: result.liked,
                likedByMe: result.liked,
                likes: result.likesCount,
                likesCount: result.likesCount,
                likedByUsername: result.likedByUsername,
                likedByAvatarUrls: result.likedByAvatarUrls,
            });
        } catch (error) {
            console.warn('Failed to toggle post like', error);
            setLiked(prevLiked);
            setLikes(prevLikes);
            onUpdatePost({ ...post, liked: prevLiked, likedByMe: prevLiked, likes: prevLikes, likesCount: prevLikes });
        }
    };

    const handleShare = async () => {
        try { await Share.share({ message: `Check out this workout: "${post.title}" - ${post.desc}`, title: post.title }); } catch {}
    };

    const onMediaScrollEnd = (event: any) => {
        if (totalSlides <= 1) return;
        const measuredWidth = event.nativeEvent.layoutMeasurement.width || slideWidth;
        const nextIndex = Math.round(event.nativeEvent.contentOffset.x / measuredWidth);
        const clampedIndex = Math.min(Math.max(0, nextIndex), totalSlides - 1);
        if (clampedIndex !== imgIndex) {
            setImgIndex(clampedIndex);
        }
    };

    return (
        <Animated.View entering={FadeInDown.delay(index * 120).springify()}>
            <LinearGradient
                colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.postCard}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.07)', 'transparent']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.cardShine} pointerEvents="none"
                />
                <LinearGradient colors={[C.orange, C.orangeD]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardAccentBar} />

                <View style={styles.postHeader}>
                    <View style={styles.avatarWrap}>
                        <Image
                            source={{ uri: post.athlete?.avatarUrl || 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80' }}
                            style={styles.postAvatar}
                        />
                        <View style={styles.avatarOnline} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.postUser} numberOfLines={1}>{post.athlete?.username || 'user'}</Text>
                        <Text style={styles.postDate}>{post.date}</Text>
                    </View>
                    <GlassCard style={styles.bpmBadge} shine={false}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="heart" size={14} color={C.pink} />
                            <Text style={styles.bpmText}>{post.bpm}</Text>
                        </View>
                    </GlassCard>
                </View>

                <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    {!!post.routineName && (
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/home/workout-detail', params: { routineId: post.routineId, title: post.routineName } })}
                            style={{ alignSelf: 'flex-start', marginBottom: 8 }}
                        >
                            <LinearGradient colors={['rgba(255,120,37,0.18)', 'rgba(255,120,37,0.06)']} style={styles.routineBadgeGrad}>
                                <Text style={styles.routineBadgeText}>🏋️  {post.routineName}  →</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.postDesc}>{post.desc}</Text>
                </View>

                <View style={styles.postStats}>
                    {[{ icon: '⏱', val: post.time }, { icon: '🏋️', val: post.volume }, { icon: '🏅', val: `${post.records} PRs` }].map((s, i) => (
                        <View key={i} style={styles.statChip}>
                            <Text style={styles.statChipIcon}>{s.icon}</Text>
                            <Text style={styles.statChipVal}>{s.val}</Text>
                        </View>
                    ))}
                </View>

                {(post.media?.length > 0 || (post.exercises?.length ?? 0) > 0) && (
                    <View
                        style={styles.imageWrap}
                        onLayout={(event) => setMediaWidth(event.nativeEvent.layout.width)}
                    >
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={onMediaScrollEnd}
                        >
                            {(post.media || []).map((media: { url: string; type: 'IMAGE' | 'VIDEO' }, i: number) => (
                                <View key={i} style={[styles.mediaSlide, { width: slideWidth }]}>
                                    <ProfileMediaSlide media={media} isActive={imgIndex === i} />
                                </View>
                            ))}

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => router.push({ pathname: '/(tabs)/home/post-detail', params: { postId: post.id } })}
                            >
                                <View
                                    style={[
                                        styles.exerciseSlide,
                                        { width: slideWidth },
                                        (post.exercises || []).length === 1 && styles.exerciseSlideSingle,
                                    ]}
                                >
                                    {(post.exercises || []).length === 1 ? (
                                        <View style={styles.singleExerciseContainer}>
                                            <View style={styles.singleExerciseIconWrap}>
                                                {post.exercises[0]?.iconUrl ? (
                                                    <Image source={{ uri: post.exercises[0].iconUrl }} style={styles.singleExerciseIcon} />
                                                ) : (
                                                    <Ionicons name="barbell-outline" size={48} color={C.orange} />
                                                )}
                                            </View>
                                            <Text style={styles.singleExerciseSetsText}>
                                                {post.exercises[0]?.setsCount || 0} {(post.exercises[0]?.setsCount || 0) === 1 ? 'set' : 'sets'}
                                            </Text>
                                            <Text style={styles.singleExerciseNameText}>
                                                {post.exercises[0]?.name?.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') || 'Exercise'}
                                            </Text>
                                        </View>
                                    ) : (
                                        <>
                                            {(post.exercises || []).slice(0, 3).map((exercise: any, exerciseIndex: number) => (
                                                <View key={`${post.id}-exercise-${exerciseIndex}`} style={styles.exerciseRow}>
                                                    <View style={styles.exerciseIconWrap}>
                                                        {exercise.iconUrl ? (
                                                            <Image source={{ uri: exercise.iconUrl }} style={styles.exerciseIcon} />
                                                        ) : (
                                                            <Ionicons name="barbell-outline" size={16} color={C.orange} />
                                                        )}
                                                    </View>
                                                    <Text style={styles.exerciseSetsText}>
                                                        {exercise.setsCount} {exercise.setsCount === 1 ? 'set' : 'sets'}
                                                    </Text>
                                                    <Text style={styles.exerciseNameText} numberOfLines={1}>
                                                        {exercise.name.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                                    </Text>
                                                </View>
                                            ))}

                                            {(!post.exercises || post.exercises.length === 0) && (
                                                <Text style={styles.exerciseEmptyText}>
                                                    No exercise details
                                                </Text>
                                            )}

                                            {(post.exercises && post.exercises.length > 3) && (
                                                <TouchableOpacity
                                                    onPress={() => router.push({ pathname: '/(tabs)/home/post-detail', params: { postId: post.id } })}
                                                    activeOpacity={0.75}
                                                    style={styles.moreExercisesBtn}
                                                >
                                                    <Text style={styles.moreExercisesText}>
                                                        More exercises
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </ScrollView>
                        <View style={styles.imageOverlay} />
                        {totalSlides > 1 && (
                            <View style={styles.dotRow}>
                                {Array.from({ length: totalSlides }).map((_: any, i: number) => (
                                    <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />
                                ))}
                            </View>
                        )}
                    </View>
                )}

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

                {post.comments?.length > 0 && (
                    <TouchableOpacity onPress={() => onOpenComments(post)} style={styles.commentPreviewRow}>
                        <Image source={{ uri: post.comments[0].avatar || post.comments[0].avatarUrl }} style={styles.commentPreviewAvatar} />
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
    const params = useLocalSearchParams();
    // support multiple param names used across the app
    const userIdParam = (params?.userId ?? params?.user ?? params?.id ?? params?.username ?? params?.userid) as string | undefined;
    console.log('🧭 UserScreen params:', params);
    console.log('🧭 Resolved userIdParam:', userIdParam);
    const userParam = userIdParam;
    const insets = useSafeAreaInsets();
    const [userData, setUserData] = useState<any>(null);
    // don't show perpetual loading when no param provided — start false
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [pendingFollow, setPendingFollow] = useState(false);
    const [pendingAction, setPendingAction] = useState<'follow' | 'unfollow' | null>(null);
    const { user: authUser } = useAuth();
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

    // Centralized profile fetch used on mount and pull-to-refresh
    const [refreshing, setRefreshing] = useState(false);
    const [postsLoading, setPostsLoading] = useState(false);

    const fetchUser = async (idParam: string) => {
        setError(null);
        setPostsLoading(true);
        try {
            const [data, postsResponse] = await Promise.all([
                userService.getUserById(idParam),
                userService.getUserPosts(idParam),
            ]);
            console.log('🧾 getUserById response:', data);
            setUserData(data);
            const mappedPosts = (postsResponse.posts || []).map(mapApiPostToUiPost);
            setPosts(mappedPosts);
            if (typeof data.is_followed_by_current_user !== 'undefined') {
                setIsFollowing(!!data.is_followed_by_current_user);
            }
        } catch (e: any) {
            console.error('Failed to load user:', e);
            setError(e?.message || 'Failed to load user');
            setPosts([]);
        } finally {
            setPostsLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) return;
            setLoading(true);
            if (userParam) {
                await fetchUser(userParam);
            } else {
                setError('Missing user id parameter');
                setUserData(null);
            }
            if (mounted) setLoading(false);
        })();
        return () => { mounted = false; };
    }, [userParam]);

    const onRefresh = async () => {
        if (!userParam) return;
        setRefreshing(true);
        await fetchUser(userParam);
        setRefreshing(false);
    };

    // Toggle follow/unfollow for the profile being viewed
    const handleProfileFollowToggle = async () => {
        if (!userData?.user_id) return;
        if (!authUser?.user_id) {
            console.warn('User must be signed in to follow/unfollow');
            return;
        }

        const targetId = Number(userData.user_id);
        if (authUser.user_id === targetId) return; // defensive

        if (pendingFollow) return; // avoid double submits
        setPendingFollow(true);
        const prev = isFollowing;
        setPendingAction(prev ? 'unfollow' : 'follow');
        // optimistic update
        setIsFollowing(!prev);
        setUserData((u: any) => ({ ...u, followersCount: prev ? Math.max(0, (u?.followersCount || 1) - 1) : ((u?.followersCount || 0) + 1) }));
        try {
            if (prev) {
                await userService.unfollowUser(targetId);
            } else {
                await userService.followUser(targetId);
            }
            // refresh from server to get canonical state (and updated counts)
            await fetchUser(String(targetId));
        } catch (err) {
            console.warn('Profile follow toggle failed', err);
            // revert optimistic update
            setIsFollowing(prev);
            setUserData((u: any) => ({ ...u, followersCount: prev ? ((u?.followersCount || 0) + 1) : Math.max(0, (u?.followersCount || 1) - 1) }));
        } finally {
            setPendingFollow(false);
            setPendingAction(null);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
                <ActivityIndicator size="large" color={C.white} />
            </View>
        );
    }
    if (error || !userData) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, padding: 20 }}>
                <Text style={{ color: C.white, marginBottom: 8 }}>{error || 'User not found'}</Text>
                {/* Show resolved params to help debugging */}
                <Text style={{ color: C.gray, fontSize: 12, marginTop: 8 }}>Params: {JSON.stringify(params || {})}</Text>
                <Text style={{ color: C.gray, fontSize: 12, marginTop: 6 }}>API baseURL: {String(api.defaults.baseURL || '')}</Text>
                <Text style={{ color: C.gray, fontSize: 12, marginTop: 6, textAlign: 'center' }}>If this is "http://localhost:3001/api" and you're running the app on a device/emulator, set EXPO_PUBLIC_API_URL to your machine IP (e.g., http://192.168.1.42:3001/api) and restart the app.</Text>
            </View>
        );
    }

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
                <Text style={styles.stickyName}>{userData.name || 'Jessica'}</Text>
            </Animated.View>

            <Animated.ScrollView
                ref={scrollRef}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.orange} />}
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
                            <Image source={{ uri: userData.profile_pic_url || 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200' }} style={styles.mainAvatar} />
                            {/* removed decorative gradient overlay to keep avatar unfiltered */}
                        </View>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={styles.name}>{userData.name || 'Jessica'}</Text>
                            <Text style={styles.handle}>@{userData.username || 'jadewolfe'}</Text>
                        </View>
                    </Animated.View>

                    <Animated.Text entering={FadeInDown.delay(160).springify()} style={styles.bio}>
                        I want to be strong enough to fight a bear 🐻
                    </Animated.Text>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <StatPill label="Workouts" value={userData.workoutCount?.toString() || '0'} delay={200} onPress={scrollToPosts} />
                        <StatPill label="Following" value={userData.followingCount?.toString() || '0'} delay={260} onPress={() => setPeopleModal('Following')} />
                        <StatPill label="Followers" value={userData.followersCount?.toString() || '0'} delay={320} onPress={() => setPeopleModal('Followers')} />
                    </View>

                    <Animated.View entering={FadeInDown.delay(350).springify()}>
                        {!(authUser && Number(authUser.user_id) === Number(userData.user_id)) && (
                            <FollowButton isFollowing={isFollowing} pending={pendingFollow} pendingAction={pendingAction} onPress={handleProfileFollowToggle} />
                        )}
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
                    {postsLoading ? (
                        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color={C.orange} />
                        </View>
                    ) : posts.length === 0 ? (
                        <GlassCard style={styles.emptyPostsCard}>
                            <Text style={styles.emptyPostsTitle}>No posts yet</Text>
                            <Text style={styles.emptyPostsText}>
                                This profile has not shared any workout posts yet.
                            </Text>
                        </GlassCard>
                    ) : (
                        posts.map((p, i) => (
                            <View key={p.id} style={{ marginBottom: 14 }}>
                                <PostCard post={p} index={i} onOpenComments={openComments} onUpdatePost={updatePost} />
                            </View>
                        ))
                    )}

                    <View style={{ height: 40 }} />
                </View>
            </Animated.ScrollView>

            <CommentsModal visible={commentsOpen} onClose={() => setCommentsOpen(false)} post={commentsPost} onUpdatePost={updatePost} />
            <PeopleModal   visible={!!peopleModal} onClose={() => setPeopleModal(null)} title={peopleModal || ''} targetUserId={userData.user_id} />
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
    glassShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },

    // Routines
    routineCard:  { width: 130, padding: 14 },
    routineEmoji: { fontSize: 28, marginBottom: 8 },
    routineTitle: { color: C.white, fontWeight: '700', fontSize: 14 },
    routineCount: { color: C.gray, fontSize: 11, marginTop: 2, marginBottom: 10 },
    routineBar:   { height: 3, borderRadius: 2 },
    emptyPostsCard: { padding: 18, marginTop: 4 },
    emptyPostsTitle: { color: C.white, fontSize: 16, fontWeight: '700', marginBottom: 6 },
    emptyPostsText: { color: C.gray, fontSize: 13, lineHeight: 18 },

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
    imageWrap:     { position: 'relative', marginHorizontal: 14, borderRadius: 14, overflow: 'hidden' },
    mediaSlide:    { overflow: 'hidden' },
    postImage:     { width: '100%', height: 240, backgroundColor: '#1a1a1a' },
    imageOverlay:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(0,0,0,0.2)' },
    videoHint:     { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(8,8,16,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    videoHintText: { color: C.white, fontSize: 11, fontWeight: '700' },
    dotRow:        { position: 'absolute', bottom: 12, flexDirection: 'row', gap: 6, left: 0, right: 0, justifyContent: 'center' },
    dot:           { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
    dotActive:     { width: 14, backgroundColor: C.orange },
    exerciseSlide: { height: 240, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 16, backgroundColor: 'rgba(16,16,20,0.96)' },
    exerciseSlideSingle: { paddingHorizontal: 20, alignItems: 'center' },
    singleExerciseContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    singleExerciseIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 8, overflow: 'hidden' },
    singleExerciseIcon: { width: 56, height: 56, borderRadius: 28 },
    singleExerciseSetsText: { color: C.orange, fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
    singleExerciseNameText: { color: C.white, fontSize: 22, fontWeight: '800', textAlign: 'center', lineHeight: 28 },
    exerciseRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    exerciseIconWrap: { width: 28, height: 28, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', marginRight: 12 },
    exerciseIcon:  { width: '100%', height: '100%' },
    exerciseSetsText: { color: C.orange, fontSize: 12, fontWeight: '700', marginRight: 12, minWidth: 48 },
    exerciseNameText: { color: C.white, fontSize: 14, fontWeight: '600', flex: 1 },
    exerciseEmptyText: { color: C.gray, fontSize: 14, textAlign: 'center' },
    moreExercisesBtn: { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,120,37,0.12)', borderWidth: 1, borderColor: 'rgba(255,120,37,0.18)' },
    moreExercisesText: { color: C.orange, fontSize: 12, fontWeight: '700' },
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
