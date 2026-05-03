import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
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
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppColors } from '@/constants/colors';
import { fetchPostService } from '@/api/services/fetchpost.service';
import { DiscoverComment, DiscoverPost } from '@/types/fetchpost.types';
import { useAuth } from '@/context/AuthContext';
import { VideoView, useVideoPlayer } from 'expo-video';
import useResolvedImageUri from '@/hooks/useResolvedImageUri';
import AvatarImage from '@/components/common/AvatarImage';
import { userService } from '@/api/services/user.service';
import { authService } from '@/api/services/auth.service';
import api from '@/api/client';
import CommentsSheet from '@/components/Discover/CommentsSheet';

type Athlete = { name: string; username: string; avatarUrl: string };
type Post = {
  id: string;
  userId?: number;
  title?: string;
  caption: string;
  time: string;
  stats: { time: string; bpm?: string; reps?: string; weight?: string; distance?: string };
  athlete: Athlete;
  media: Array<{ url: string; type: 'IMAGE' | 'VIDEO' }>;
  exercises: Array<{ name: string; setsCount: number; imagePath?: string; iconUrl?: string }>;
  likesCount: number;
  likedByMe: boolean;
  likedByUsername?: string;
  likedByAvatarUrls?: string[];
  commentsCount: number;
  comments: DiscoverComment[];
};

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

type LocalExerciseRecord = {
  name: string;
  image?: string;
};

const ORANGE = AppColors.orange;
const BG = '#080808';
const MUTED = 'rgba(240,237,232,0.42)';
const TEXT = '#f0ede8';
const IS_ANDROID = Platform.OS === 'android';
const SMOOTH = { duration: 200, easing: Easing.out(Easing.cubic) };
const QUICK_EMOJIS = ['💪', '🔥', '👏', '🏋️', '👊', '🥵', '🏆'];

const SCREEN_WIDTH = Dimensions.get('window').width;

const EXERCISE_ASSET_BASE = 'https://pub-d0fbe48b068b460e96f026d1d9fe3c68.r2.dev/exercises';
const localExerciseRecords = require('../../constants/exercise-data.json') as LocalExerciseRecord[];
const exerciseImageByName = new Map<string, string>();
for (const record of localExerciseRecords) {
  if (!record?.name || !record?.image) continue;
  exerciseImageByName.set(record.name.trim().toLowerCase(), record.image);
}

const resolveExerciseAssetUrl = (pathLike?: string): string | undefined => {
  if (!pathLike) return undefined;
  if (pathLike.startsWith('http://') || pathLike.startsWith('https://')) {
    return pathLike;
  }
  const normalizedPath = pathLike.startsWith('/') ? pathLike.slice(1) : pathLike;
  return `${EXERCISE_ASSET_BASE}/${normalizedPath}`;
};

const resolveExerciseIcon = (name: string, imagePath?: string): string | undefined => {
  const fromPost = resolveExerciseAssetUrl(imagePath);
  if (fromPost) return fromPost;
  const localPath = exerciseImageByName.get(name.trim().toLowerCase());
  return resolveExerciseAssetUrl(localPath);
};

const toLocalComment = (comment: DiscoverComment): Comment => ({
  id: comment.id,
  user: comment.user,
  avatarUrl: comment.avatarUrl,
  text: comment.text,
  time: comment.time,
  likes: comment.likes,
  liked: comment.liked,
  replies: (Array.isArray(comment.replies) ? comment.replies : []).map((reply) => ({
    id: reply.id,
    user: reply.user,
    avatarUrl: reply.avatarUrl,
    text: reply.text,
    time: reply.time,
    likes: reply.likes,
    liked: reply.liked,
  })),
  showReplies: false,
});

const toLocalPost = (post: DiscoverPost): Post => ({
  id: post.id,
  userId: post.userId,
  title: post.title,
  caption: post.caption,
  time: post.time,
  stats: post.stats,
  athlete: post.athlete,
  media: Array.isArray(post.media) ? post.media : [],
  exercises: (Array.isArray(post.exercises) ? post.exercises : []).map((exercise) => ({
    ...exercise,
    iconUrl: resolveExerciseIcon(exercise.name, exercise.imagePath),
  })),
  likesCount: post.likesCount ?? 0,
  likedByMe: Boolean(post.likedByMe),
  likedByUsername: post.likedByUsername,
  likedByAvatarUrls: Array.isArray(post.likedByAvatarUrls) ? post.likedByAvatarUrls.slice(0, 2) : [],
  commentsCount: post.commentsCount ?? 0,
  comments: Array.isArray(post.comments) ? post.comments : [],
});

function makeInitialComments(): Comment[] {
  return [
    {
      id: 'c1',
      user: 'mayalifts',
      avatarUrl: null,
      text: "Incredible session! What's your PR?",
      time: '2h ago',
      likes: 5,
      liked: false,
      replies: [
        {
          id: 'c1-r1',
          user: 'noahrun',
          avatarUrl: null,
          text: 'Right?! Absolute beast mode',
          time: '1h ago',
          likes: 2,
          liked: false,
        },
      ],
      showReplies: false,
    },
    {
      id: 'c2',
      user: 'sarahit',
      avatarUrl: null,
      text: 'Great form on those reps!',
      time: '1h ago',
      likes: 3,
      liked: false,
      replies: [],
      showReplies: false,
    },
  ];
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text allowFontScaling={false} style={styles.miniStatLabel}>
        {label}
      </Text>
      <Text allowFontScaling={false} style={styles.miniStatValue}>
        {value}
      </Text>
    </View>
  );
}

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
      <Text allowFontScaling={false} style={styles.splitLabel}>
        {label}
      </Text>
      <View style={styles.splitTrack}>
        <Animated.View style={[styles.splitFill, fillStyle]} />
      </View>
      <Text allowFontScaling={false} style={styles.splitPct}>
        {Math.round(value * 100)}%
      </Text>
    </View>
  );
}

function WorkoutBlock({
  title,
  subtitle,
  sets,
  onTap,
  exerciseIconUrl,
}: {
  title: string;
  subtitle: string;
  sets: string[];
  onTap: () => void;
  exerciseIconUrl?: string;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const press = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.98, { duration: 80 }),
      withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) })
    );
    runOnJS(onTap)();
  };

  return (
    <TouchableOpacity onPress={press} activeOpacity={1}>
      <Animated.View style={[styles.workoutBlock, animStyle]}>
        <View style={styles.workoutBlockHeader}>
          <View style={styles.workoutIconWrap}>
            {exerciseIconUrl ? (
              <Image source={{ uri: exerciseIconUrl }} style={styles.workoutBlockIcon} />
            ) : (
              <Ionicons name="barbell-outline" size={IS_ANDROID ? 16 : 18} color={ORANGE} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text allowFontScaling={false} style={styles.workoutTitle}>
              {title}
            </Text>
            <Text allowFontScaling={false} style={styles.workoutSubtitle}>
              {subtitle}
            </Text>
          </View>
          <Ionicons
            name="information-circle-outline"
            size={IS_ANDROID ? 18 : 20}
            color="rgba(255,255,255,0.3)"
          />
        </View>

        <View style={styles.workoutDivider} />

        {sets.map((s, i) => (
          <View key={`${i}-${s}`} style={[styles.setTile, i !== 0 && { marginTop: 6 }] }>
            <View style={styles.setNum}>
              <Text allowFontScaling={false} style={styles.setNumText}>
                {i + 1}
              </Text>
            </View>
            <Text allowFontScaling={false} style={styles.setText}>
              {s}
            </Text>
            <Ionicons name="checkmark-circle" size={14} color="rgba(255,107,53,0.4)" />
          </View>
        ))}
      </Animated.View>
    </TouchableOpacity>
  );
}

function CommentLike({
  liked,
  count,
  onPress,
}: {
  liked: boolean;
  count: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const press = () => {
    runOnJS(Haptics.selectionAsync)();
    scale.value = withSequence(
      withTiming(0.65, { duration: 70 }),
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 80 })
    );
    runOnJS(onPress)();
  };
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <TouchableOpacity onPress={press} activeOpacity={1} style={styles.commentLikeRow}>
      <Animated.View style={animStyle}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={13}
          color={liked ? '#FF4D6D' : 'rgba(255,255,255,0.4)'}
        />
      </Animated.View>
      {count > 0 && <Text style={styles.commentLikeCount}>{count}</Text>}
    </TouchableOpacity>
  );
}

function VideoMedia({ uri, isActive }: { uri: string; isActive: boolean }) {
  const player = useVideoPlayer(uri);

  useEffect(() => {
    player.loop = true;

    if (isActive) {
      player.muted = false;
      player.play();
      return;
    }

    player.muted = true;
    player.pause();
    player.currentTime = 0;
  }, [isActive, player]);

  return <VideoView player={player} style={styles.postImage} contentFit="cover" nativeControls={false} />;
}

function MediaSlide({
  media,
  isActive,
}: {
  media: { url: string; type: 'IMAGE' | 'VIDEO' };
  isActive: boolean;
}) {
  if (!media.url) {
    return (
      <View style={styles.mediaEmptyWrap}>
        <View style={styles.mediaEmptyIconWrap}>
          <Ionicons name="image-outline" size={20} color={MUTED} />
        </View>
        <Text allowFontScaling={false} style={styles.mediaEmptyText}>
          Missing media URL
        </Text>
      </View>
    );
  }

  if (media.type === 'VIDEO') {
    return (
      <View>
        <VideoMedia uri={media.url} isActive={isActive} />
        <View style={styles.videoHint}>
          <Ionicons name="videocam" size={11} color={TEXT} />
          <Text allowFontScaling={false} style={styles.videoHintText}>
            Video
          </Text>
        </View>
      </View>
    );
  }

  return <Image source={{ uri: media.url }} style={styles.postImage} />;
}

// Helper: turn backend-hosted image URLs into app proxy URLs when appropriate
const proxifyIfNeeded = (url?: string | null) => {
  if (!url) return url ?? null;
  try {
    const LOWER = String(url).toLowerCase();
    const isR2 = LOWER.includes('.r2.dev') || LOWER.includes('/profile/profile-pic/');
    if (isR2 && api?.defaults?.baseURL) {
      return `${api.defaults.baseURL.replace(/\/$/, '')}/uploads/proxy?url=${encodeURIComponent(String(url))}`;
    }
    return url;
  } catch (e) {
    return url;
  }
};

export default function FetchPostDetailScreen() {
  const params = useLocalSearchParams<{ postId?: string }>();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.user_id ?? null;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  const [moreOpen, setMoreOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const [comments, setComments] = useState<Comment[]>(makeInitialComments);
  const [commentDraft, setCommentDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; user: string } | null>(null);

  // Load post data on mount
  useEffect(() => {
    const loadPost = async () => {
      try {
        if (!params?.postId) {
          setLoading(false);
          return;
        }
        const response = await fetchPostService.getDiscoverPostById(params.postId);
        const localPost = toLocalPost(response.post);
        setPost(localPost);
        setLikeCount(localPost.likesCount);
        setIsLiked(localPost.likedByMe);

        // Load comments
        if (Array.isArray(localPost.comments)) {
          setComments(localPost.comments.map(toLocalComment));
        }

        // Initialize follow state for the post's author by fetching current user's profile
        try {
          const profile = await authService.getMeProfile();
          const following = Array.isArray(profile?.following) ? profile.following : [];
          // Normalize to username keys if available, fallback to user_id
          const followedUsernames = new Set(following.map((f: any) => f.username ?? String(f.user_id ?? '')));
          const authorKey = localPost.athlete?.username ?? String(localPost.userId ?? '');
          setIsFollowed(followedUsernames.has(authorKey));
        } catch (err) {
          // Ignore follow init failures — keep default false
          console.warn('Failed to initialize follow state for post detail', err);
        }
      } catch (error) {
        console.error('Failed to load post:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [params?.postId]);

  const moreSheetY = useSharedValue(300);

  useEffect(() => {
    moreSheetY.value = moreOpen
      ? withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) })
      : withTiming(300, { duration: 240, easing: Easing.in(Easing.cubic) });
  }, [moreOpen]);

  const moreSheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: moreSheetY.value }] }));

  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  const handleLike = async () => {
    if (!post?.id) return;

    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    heartScale.value = withSequence(
      withTiming(0, { duration: 80 }),
      withTiming(1.3, { duration: 120, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 100 })
    );

    const wasLiked = isLiked;
    setIsLiked((v) => {
      setLikeCount((c) => (v ? c - 1 : c + 1));
      return !v;
    });

    try {
      const result = await fetchPostService.togglePostLike(post.id);
      setIsLiked(result.liked);
      setLikeCount(result.likesCount ?? likeCount);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likedByUsername: result.likedByUsername ?? prev.likedByUsername,
              likedByAvatarUrls: Array.isArray(result.likedByAvatarUrls)
                ? result.likedByAvatarUrls.slice(0, 2)
                : prev.likedByAvatarUrls,
            }
          : prev,
      );
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert on error
      setIsLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const followedVal = useSharedValue(0);
  useEffect(() => {
    followedVal.value = withTiming(isFollowed ? 1 : 0, SMOOTH);
  }, [isFollowed]);
  const followStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(255,107,53,${interpolate(followedVal.value, [0, 1], [0, 0.14])})`,
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  }));

  // Pending follow/unfollow request state
  const [pendingFollow, setPendingFollow] = useState(false);
  const [pendingAction, setPendingAction] = useState<'follow' | 'unfollow' | null>(null);

  // Toggle follow with optimistic UI, matching useDiscoverFeed.toggleFollowUser
  const handleToggleFollow = async () => {
    if (!post) return;
    if (pendingFollow) return;

    // Prefer numeric userId; if missing try to resolve username -> numeric id
    let targetUserId: number | string | null = post.userId ?? null;
    const potentialUsername = post.athlete?.username ?? null;
    if (targetUserId == null && potentialUsername) {
      try {
        const fetchedUser = await userService.getUserById(potentialUsername);
        if (fetchedUser && (fetchedUser.user_id || fetchedUser.userId)) {
          targetUserId = fetchedUser.user_id ?? fetchedUser.userId;
        } else {
          // still fallback to username (may not be supported by backend)
          targetUserId = potentialUsername;
        }
      } catch (e) {
        console.warn('Failed to resolve username to user id, falling back to username', potentialUsername, e);
        targetUserId = potentialUsername;
      }
    }

    if (targetUserId == null) {
      console.warn('No target user id available to follow/unfollow');
      return;
    }

    const prev = isFollowed;
    const action = prev ? 'unfollow' : 'follow';
    // Optimistic UI
    setIsFollowed(!prev);
    setPendingFollow(true);
    setPendingAction(action);

    try {
      const res = prev ? await userService.unfollowUser(targetUserId) : await userService.followUser(targetUserId);
      const serverIsFollowing = res?.isFollowing ?? !prev;
      setIsFollowed(Boolean(serverIsFollowing));
    } catch (err) {
      console.error('Failed to toggle follow for user', err);
      // rollback
      setIsFollowed(prev);
      Alert.alert('Failed', 'Unable to update follow status. Please try again.');
    } finally {
      setPendingFollow(false);
      setPendingAction(null);
    }
  };

  const likeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
      )
    );
  };
  const likeReply = (commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: c.replies.map((r) =>
                r.id === replyId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r
              ),
            }
          : c
      )
    );
  };
  const toggleReplies = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, showReplies: !c.showReplies } : c))
    );
  };

  const sendComment = async () => {
    if (!post?.id || !commentDraft.trim()) return;
    const text = commentDraft.trim();

    try {
      const response = await fetchPostService.createPostComment(
        post.id,
        text,
        replyingTo?.commentId,
      );

      const postedComment = toLocalComment(response.comment);
      try {
        const av = String((postedComment as any).avatarUrl || (postedComment as any).avatar || '');
        if (av.toLowerCase().includes('pravatar.cc') || av.toLowerCase().includes('i.pravatar.cc')) {
          postedComment.avatarUrl = null as any;
          (postedComment as any).avatar = null;
        }
      } catch (e) {}

      // Ensure any avatar URLs coming from the backend are proxied if they point to internal/private storage (R2)
      if (postedComment.avatarUrl) {
        const proxied = proxifyIfNeeded(postedComment.avatarUrl);
        postedComment.avatarUrl = proxied;
        (postedComment as any).avatar = (postedComment as any).avatar || proxied;
      }
      if (Array.isArray(postedComment.replies)) {
        postedComment.replies = postedComment.replies.map((r) => {
          const prox = proxifyIfNeeded(r.avatarUrl || (r as any).avatar);
          return { ...r, avatarUrl: prox, avatar: (r as any).avatar || prox };
        });
      }

      // If backend didn't include avatarUrl for the newly posted comment, hydrate from current auth user first.
      try {
        const resolveAuthUserAvatar = (cached: any) => {
          try {
            const cachedUrl = cached?.profile_pic_url ?? cached?.profile_picUrl ?? null;
            if (cachedUrl) {
              const lower = String(cachedUrl).toLowerCase();
              if (lower.includes('pravatar.cc') || lower.includes('i.pravatar.cc')) return null;
              return proxifyIfNeeded(cachedUrl);
            }
            if (cached?.profile_pic_key) {
              return `${api.defaults.baseURL.replace(/\/$/, '')}/uploads/proxy?key=${encodeURIComponent(String(cached.profile_pic_key))}`;
            }
          } catch (e) {}
          return null;
        };

        if ((!postedComment.avatarUrl || postedComment.avatarUrl === null) && currentUser) {
          const cached: any = currentUser as any;
          const candidate = resolveAuthUserAvatar(cached);
          if (candidate) {
            postedComment.avatarUrl = candidate as any;
            (postedComment as any).avatar = (postedComment as any).avatar || candidate;
          } else {
            try {
              const me = await userService.getUserById(cached.user_id ?? cached.username ?? String(cached));
              const meCandidate = resolveAuthUserAvatar(me);
              if (meCandidate) {
                postedComment.avatarUrl = meCandidate as any;
                (postedComment as any).avatar = (postedComment as any).avatar || meCandidate;
              }
            } catch (err) {}
          }

          if (Array.isArray(postedComment.replies)) {
            postedComment.replies = postedComment.replies.map((r: any) => {
              const rCandidate = r.avatarUrl || r.avatar || postedComment.avatarUrl;
              return {
                ...r,
                avatarUrl: r.avatarUrl || proxifyIfNeeded(rCandidate),
                avatar: r.avatar || proxifyIfNeeded(rCandidate),
              };
            });
          }
        }
      } catch (err) {
        console.warn('[PostDetail] failed to hydrate posted comment avatar', err);
      }

      console.debug('[PostDetail] sendComment: final postedComment.avatarUrl', postedComment.avatarUrl);

      if (replyingTo) {
        setComments((prev) => {
          const next = prev.map((c) => (
            c.id === replyingTo.commentId
              ? { ...c, replies: [...c.replies, postedComment as any], showReplies: true }
              : c
          ));
          console.debug('[PostDetail] setComments (reply) new state snapshot', next.map((c) => ({ id: c.id, replies: c.replies.map((r: any) => ({ id: r.id, avatarUrl: r.avatarUrl, avatar: (r as any).avatar })) })));
          return next;
        });
      } else {
        setComments((prev) => {
          const next = [...prev, postedComment];
          console.debug('[PostDetail] setComments (top-level) new state snapshot', next.map((c) => ({ id: c.id, avatarUrl: c.avatarUrl, avatar: (c as any).avatar })));
          return next;
        });
      }

      setCommentDraft('');
      setReplyingTo(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to send comment:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Calculate total slides (ONLY media - exercises carousel is separate for text-only posts)
  const totalSlides = post?.media?.length ?? 0;

  // Calculate exercise slides for text-only posts
  const exerciseCount = post?.exercises?.length ?? 0;
  const totalExerciseSlides = (!post?.media || post.media.length === 0) && exerciseCount > 0 ? exerciseCount : 0;

  const onMediaScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (totalSlides <= 1) return;
    const measuredWidth = SCREEN_WIDTH - 56;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / measuredWidth);
    const clampedIndex = Math.min(Math.max(0, nextIndex), totalSlides - 1);
    if (clampedIndex !== activeMediaIndex) {
      setActiveMediaIndex(clampedIndex);
    }
  };

  const onExerciseScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (totalExerciseSlides <= 1) return;
    const measuredWidth = SCREEN_WIDTH - 56;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / measuredWidth);
    const clampedIndex = Math.min(Math.max(0, nextIndex), totalExerciseSlides - 1);
    if (clampedIndex !== activeExerciseIndex) {
      setActiveExerciseIndex(clampedIndex);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      ) : !post ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text allowFontScaling={false} style={{ color: MUTED }}>Failed to load post</Text>
        </View>
      ) : (
        <>
          <Animated.View entering={FadeInDown.duration(380).easing(Easing.out(Easing.cubic))} style={styles.appbar}>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                router.replace('/(tabs)/home/discover');
              }}
              style={styles.appbarBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={IS_ANDROID ? 20 : 22} color={ORANGE} />
            </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.appbarTitle}>
          Workout Routine
        </Text>
        <TouchableOpacity onPress={() => setMoreOpen(true)} style={styles.appbarBtn} activeOpacity={0.7}>
          <Ionicons
            name="ellipsis-horizontal"
            size={IS_ANDROID ? 20 : 22}
            color="rgba(255,255,255,0.7)"
          />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.delay(60).duration(400).easing(Easing.out(Easing.cubic))}
          style={styles.card}
        >
          <View style={styles.cardAccentBar} />

          <View style={styles.cardHeader}>
            <TouchableOpacity
              // Use the app's `userid` route so profile resolves correctly (same as Home screen)
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/home/userid',
                  params: { userId: post.athlete.username, name: post.athlete.name, image: post.athlete.avatarUrl },
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.avatarRing}>
                <AvatarImage src={post?.athlete?.avatarUrl} style={styles.avatar} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/home/userid',
                  params: { userId: post.athlete.username, name: post.athlete.name, image: post.athlete.avatarUrl },
                })
              }
              style={{ flex: 1 }}
              activeOpacity={0.8}
            >
              <Text allowFontScaling={false} style={styles.username}>
                @{post.athlete.username}
              </Text>
              <Text allowFontScaling={false} style={styles.time}>
                {post.time}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleToggleFollow();
              }}
              activeOpacity={1}
            >
              {/* Only render follow UI when the post is not owned by the current user */}
              {!(currentUserId != null && post?.userId === currentUserId) && (
                <Animated.View style={followStyle}>
                  {pendingFollow ? (
                    <ActivityIndicator size="small" color={ORANGE} style={{ marginRight: 6 }} />
                  ) : isFollowed ? (
                    <Ionicons name="checkmark" size={11} color={ORANGE} style={{ marginRight: 4 }} />
                  ) : (
                    <Ionicons name="add" size={11} color={ORANGE} style={{ marginRight: 4 }} />
                  )}
                  <Text allowFontScaling={false} style={styles.followText}>
                    {pendingFollow ? (pendingAction === 'unfollow' ? 'Unfollowing...' : 'Following...') : (isFollowed ? 'Following' : 'Follow')}
                  </Text>
                </Animated.View>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: IS_ANDROID ? 10 : 12 }} />
          {post.title && (
            <Text allowFontScaling={false} style={styles.postTitle}>
              {post.title}
            </Text>
          )}
          <Text allowFontScaling={false} style={styles.caption}>
            {post.caption}
          </Text>

          <View style={styles.statsRow}>
            <MiniStat label="Time" value={post.stats.time} />
            {post.stats.bpm && <MiniStat label="Avg bpm" value={post.stats.bpm} />}
            {post.stats.reps && <MiniStat label="Reps" value={post.stats.reps} />}
            {post.stats.weight && <MiniStat label="Weight taken" value={post.stats.weight} />}
            {post.stats.distance && <MiniStat label="Distance" value={post.stats.distance} />}
          </View>

          {post.media && post.media.length > 0 && (
            <View style={styles.imageWrap}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onMediaScrollEnd}
              >
                {post.media.map((media, mediaIndex) => (
                  <TouchableOpacity
                    key={`${post.id}-media-${mediaIndex}`}
                    activeOpacity={0.92}
                    onPress={() => {}}
                  >
                    <View style={[styles.mediaSlide, { width: SCREEN_WIDTH - 56 }]}>
                      <MediaSlide media={media} isActive={activeMediaIndex === mediaIndex} />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.imageOverlay} />
            </View>
          )}

          {/* Show exercises slide in carousel ONLY if NO media (text-only posts) */}
          {(!post.media || post.media.length === 0) && (post.exercises && post.exercises.length > 0) && (
            <View style={styles.imageWrap}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onExerciseScrollEnd}
              >
                <TouchableOpacity activeOpacity={0.9} onPress={() => {}}>
                  <View style={[styles.exerciseSlide, { width: SCREEN_WIDTH - 56 }, (post.exercises || []).length === 1 && styles.exerciseSlideSingle]}>
                    {(post.exercises || []).length === 1 ? (
                      // Single exercise: centered, larger
                      <View style={styles.singleExerciseContainer}>
                        <View style={styles.singleExerciseIconWrap}>
                          {(post.exercises[0]).iconUrl ? (
                            <Image source={{ uri: (post.exercises[0]).iconUrl }} style={styles.singleExerciseIcon} />
                          ) : (
                            <Ionicons name="barbell-outline" size={48} color={ORANGE} />
                          )}
                        </View>
                        <Text allowFontScaling={false} style={styles.singleExerciseSetsText}>
                          {(post.exercises[0]).setsCount} {(post.exercises[0]).setsCount === 1 ? 'set' : 'sets'}
                        </Text>
                        <Text allowFontScaling={false} style={styles.singleExerciseNameText}>
                          {(post.exercises[0]).name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </Text>
                      </View>
                    ) : (
                      // Multiple exercises: list format
                      <>
                        {(post.exercises || []).slice(0, 3).map((exercise, exerciseIndex) => (
                          <View key={`${post.id}-exercise-${exerciseIndex}`} style={styles.exerciseRow}>
                            <View style={styles.exerciseIconWrap}>
                              {exercise.iconUrl ? (
                                <Image source={{ uri: exercise.iconUrl }} style={styles.exerciseIcon} />
                              ) : (
                                <Ionicons name="barbell-outline" size={16} color={ORANGE} />
                              )}
                            </View>
                            <Text allowFontScaling={false} style={styles.exerciseSetsText}>
                              {exercise.setsCount} {exercise.setsCount === 1 ? 'set' : 'sets'}
                            </Text>
                            <Text allowFontScaling={false} style={styles.exerciseNameText} numberOfLines={1}>
                              {exercise.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                            </Text>
                          </View>
                        ))}


                        {(post.exercises && post.exercises.length > 3) && (
                          <TouchableOpacity onPress={() => {}} activeOpacity={0.75} style={styles.moreExercisesBtn}>
                            <Text allowFontScaling={false} style={styles.moreExercisesText}>
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
            </View>
          )}

          {totalSlides > 1 && (
            <View style={styles.mediaDotsRow}>
              {Array.from({ length: totalSlides }).map((_, mediaIndex) => (
                <View
                  key={`${post.id}-dot-${mediaIndex}`}
                  style={[styles.mediaDot, mediaIndex === activeMediaIndex && styles.mediaDotActive]}
                />
              ))}
            </View>
          )}

          {totalExerciseSlides > 1 && (
            <View style={styles.mediaDotsRow}>
              {Array.from({ length: totalExerciseSlides }).map((_, exerciseIndex) => (
                <View
                  key={`${post.id}-exercise-dot-${exerciseIndex}`}
                  style={[styles.mediaDot, exerciseIndex === activeExerciseIndex && styles.mediaDotActive]}
                />
              ))}
            </View>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={handleLike} activeOpacity={1} style={styles.actionBtn}>
              <Animated.View style={heartStyle}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={IS_ANDROID ? 20 : 22}
                  color={isLiked ? '#FF4D6D' : 'rgba(255,255,255,0.7)'}
                />
              </Animated.View>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={[styles.actionCount, isLiked && { color: '#FF4D6D' }]}>
              {likeCount}
            </Text>

            <View style={{ width: IS_ANDROID ? 10 : 14 }} />

            <TouchableOpacity onPress={() => setCommentsOpen(true)} style={styles.actionBtn} activeOpacity={0.7}>
              <Ionicons
                name="chatbubble-outline"
                size={IS_ANDROID ? 19 : 21}
                color="rgba(255,255,255,0.6)"
              />
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.actionCount}>
              {comments.length}
            </Text>

            <View style={{ flex: 1 }} />

            <TouchableOpacity onPress={() => Haptics.selectionAsync()} style={styles.actionBtn} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={IS_ANDROID ? 19 : 21} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>

          {likeCount > 0 && post.likedByUsername && (
            <View style={styles.likedByRow}>
              {(
                post.likedByAvatarUrls && post.likedByAvatarUrls.length > 0
                  ? post.likedByAvatarUrls
                  : likeCount > 1
                    ? [post.athlete.avatarUrl, post.athlete.avatarUrl]
                    : [post.athlete.avatarUrl]
              )
                .slice(0, 2)
                .map((avatarUrl, idx) => (
                  <Image
                    key={`${post.id}-likedby-avatar-${idx}`}
                    source={{ uri: avatarUrl }}
                    style={[styles.tinyAvatar, idx > 0 && { marginLeft: -8 }]}
                  />
                ))}
              <Text allowFontScaling={false} style={styles.likedByText} numberOfLines={1}>
                Liked by <Text style={{ color: AppColors.white, fontWeight: '700' }}>{post.likedByUsername}</Text>
                {likeCount > 1 ? ' and others' : ''}
              </Text>
            </View>
          )}

          <View style={{ height: IS_ANDROID ? 10 : 12 }} />

          <Text allowFontScaling={false} style={styles.sectionHeader}>
            Muscle Split
          </Text>
          <View style={{ height: 12 }} />
          <SplitBar label="Arms" value={0.35} />
          <View style={{ height: 8 }} />
          <SplitBar label="Core" value={0.15} />
          <View style={{ height: 8 }} />
          <SplitBar label="Shoulders" value={0.5} />
        </Animated.View>

        <View style={{ height: 14 }} />

        <Animated.View entering={FadeInDown.delay(120).duration(400).easing(Easing.out(Easing.cubic))}>
          <Text allowFontScaling={false} style={styles.sectionHeaderStandalone}>
            Exercises
          </Text>
          <View style={{ height: 10 }} />
        </Animated.View>

        {(post.exercises && post.exercises.length > 0) ? (
          post.exercises.map((exercise, i) => (
            <Animated.View
              key={`${exercise.name}-${i}`}
              entering={FadeInDown.delay(160 + i * 60).duration(400).easing(Easing.out(Easing.cubic))}
            >
              <WorkoutBlock
                title={exercise.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                subtitle={`${exercise.setsCount} ${exercise.setsCount === 1 ? 'set' : 'sets'}`}
                sets={Array(exercise.setsCount).fill(`${exercise.setsCount} ${exercise.setsCount === 1 ? 'set' : 'sets'}`)}
                exerciseIconUrl={exercise.iconUrl}
                onTap={() => {
                  // Open workout detail for this exercise
                }}
              />
              {i < (post.exercises?.length ?? 0) - 1 && <View style={{ height: 10 }} />}
            </Animated.View>
          ))
        ) : (
          <Text allowFontScaling={false} style={styles.sectionHeader}>
            No exercises recorded
          </Text>
        )}
      </ScrollView>

      <Modal visible={moreOpen} transparent animationType="none">
        <Pressable style={styles.backdrop} onPress={() => setMoreOpen(false)} />
        <Animated.View style={[styles.moreSheet, moreSheetStyle]}>
          <View style={styles.sheetHandle} />
          {[
            {
              label: 'Save As Routine',
              icon: 'bookmark-outline',
              action: () => {
                setMoreOpen(false);
                Alert.alert('Saved');
              },
            },
            {
              label: 'Copy Workout',
              icon: 'copy-outline',
              action: () => {
                setMoreOpen(false);
                Alert.alert('Copied');
              },
            },
            {
              label: 'Report Workout',
              icon: 'flag-outline',
              action: () => {
                setMoreOpen(false);
                Alert.alert('Reported');
              },
            },
          ].map((item, i) => (
            <TouchableOpacity key={item.label} onPress={item.action} activeOpacity={0.7}>
              <Animated.View entering={FadeInUp.delay(i * 40).duration(260)} style={styles.moreSheetItem}>
                <View style={styles.moreSheetIcon}>
                  <Ionicons name={item.icon as any} size={18} color={ORANGE} />
                </View>
                <Text allowFontScaling={false} style={styles.moreSheetText}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
              </Animated.View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Modal>

      <CommentsSheet
        visible={commentsOpen}
        activeComments={comments}
        commentDraft={commentDraft}
        setCommentDraft={setCommentDraft}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        sendComment={sendComment}
        likeComment={(_postId: string, commentId: string) => likeComment(commentId)}
        likeReply={(_postId: string, commentId: string, replyId: string) => likeReply(commentId, replyId)}
        toggleReplies={(_postId: string, commentId: string) => toggleReplies(commentId)}
        close={() => {
          setCommentsOpen(false);
          setReplyingTo(null);
        }}
        activePostId={post?.id ?? null}
        quickEmojis={QUICK_EMOJIS}
      />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  appbar: {
    height: IS_ANDROID ? 52 : 58,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  appbarBtn: {
    width: IS_ANDROID ? 36 : 38,
    height: IS_ANDROID ? 36 : 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.055)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appbarTitle: { color: AppColors.white, fontSize: IS_ANDROID ? 15 : 16, fontWeight: '700' },

  body: { padding: 14, paddingBottom: 40 },

  card: {
    backgroundColor: AppColors.darkBg,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  cardAccentBar: { height: 2, backgroundColor: ORANGE, width: '40%', borderBottomRightRadius: 2 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 10,
  },
  avatarRing: {
    width: IS_ANDROID ? 40 : 44,
    height: IS_ANDROID ? 40 : 44,
    borderRadius: IS_ANDROID ? 20 : 22,
    borderWidth: 2,
    borderColor: 'rgba(255,107,53,0.4)',
    padding: 1.5,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: IS_ANDROID ? 18 : 20,
    backgroundColor: AppColors.darkBg,
  },
  username: { color: AppColors.white, fontWeight: '700', fontSize: IS_ANDROID ? 13 : 14 },
  time: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, marginTop: 2 },
  followText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: '700' },
  postTitle: {
    color: AppColors.white,
    fontSize: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  caption: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: IS_ANDROID ? 14 : 15,
    lineHeight: IS_ANDROID ? 21 : 23,
    paddingHorizontal: 14,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: IS_ANDROID ? 10 : 12,
    gap: IS_ANDROID ? 14 : 18,
  },
  miniStat: {},
  miniStatLabel: { color: AppColors.grey, fontSize: IS_ANDROID ? 10 : 11, marginBottom: 2 },
  miniStatValue: { color: AppColors.white, fontWeight: '700', fontSize: IS_ANDROID ? 13 : 14 },
  imageWrap: { position: 'relative', marginHorizontal: 14, borderRadius: 14, overflow: 'hidden' },
  postImage: { width: '100%', height: IS_ANDROID ? 240 : 270, backgroundColor: AppColors.darkBg },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  imageExpandHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: IS_ANDROID ? 10 : 12,
    paddingBottom: 4,
  },
  actionBtn: {
    width: IS_ANDROID ? 36 : 40,
    height: IS_ANDROID ? 36 : 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCount: { color: 'rgba(255,255,255,0.7)', fontSize: IS_ANDROID ? 13 : 14, fontWeight: '600' },
  likedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 4,
    gap: 8,
    marginTop: 2,
  },
  tinyAvatar: {
    width: IS_ANDROID ? 18 : 20,
    height: IS_ANDROID ? 18 : 20,
    borderRadius: IS_ANDROID ? 9 : 10,
    backgroundColor: AppColors.darkBg,
    borderWidth: 1.5,
    borderColor: AppColors.darkBg,
  },
  likedByText: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, flex: 1 },
  sectionHeader: {
    color: AppColors.white,
    fontWeight: '700',
    fontSize: IS_ANDROID ? 14 : 15,
    paddingHorizontal: 14,
  },
  splitRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  splitLabel: { color: AppColors.white, fontSize: IS_ANDROID ? 12 : 13, width: IS_ANDROID ? 78 : 86 },
  splitTrack: {
    flex: 1,
    height: IS_ANDROID ? 7 : 8,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  splitFill: { height: '100%', backgroundColor: ORANGE, borderRadius: 6 },
  splitPct: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, width: 36, textAlign: 'right' },

  sectionHeaderStandalone: {
    color: AppColors.white,
    fontWeight: '800',
    fontSize: IS_ANDROID ? 15 : 16,
    letterSpacing: -0.3,
  },

  workoutBlock: {
    backgroundColor: AppColors.darkBg,
    borderRadius: 16,
    padding: IS_ANDROID ? 12 : 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  workoutBlockHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  workoutIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,107,53,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
    overflow: 'hidden',
  },
  workoutBlockIcon: {
    width: '100%',
    height: '100%',
  },
  workoutTitle: { color: AppColors.white, fontWeight: '700', fontSize: IS_ANDROID ? 13 : 14 },
  workoutSubtitle: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12, marginTop: 2 },
  workoutDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 10 },
  setTile: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: IS_ANDROID ? 8 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  setNum: {
    width: IS_ANDROID ? 20 : 22,
    height: IS_ANDROID ? 20 : 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255,107,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumText: { color: ORANGE, fontWeight: '800', fontSize: IS_ANDROID ? 11 : 12 },
  setText: { color: AppColors.white, flex: 1, fontSize: IS_ANDROID ? 12 : 13 },

  mediaSlide: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  mediaEmptyWrap: {
    width: '100%',
    height: IS_ANDROID ? 220 : 250,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mediaEmptyIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  mediaEmptyText: {
    color: MUTED,
    fontSize: IS_ANDROID ? 12 : 13,
    fontWeight: '600',
  },
  videoHint: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  videoHintText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: '700',
  },
  exerciseSlide: {
    height: IS_ANDROID ? 220 : 250,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#121212',
  },
  exerciseSlideSingle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleExerciseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  singleExerciseIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  singleExerciseIcon: {
    width: '100%',
    height: '100%',
  },
  singleExerciseSetsText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
  },
  singleExerciseNameText: {
    color: 'rgba(240,237,232,0.86)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 8,
  },
  exerciseIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  exerciseIcon: {
    width: '100%',
    height: '100%',
  },
  exerciseSetsText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    minWidth: 48,
  },
  exerciseNameText: {
    flex: 1,
    color: 'rgba(240,237,232,0.86)',
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseEmptyText: {
    color: MUTED,
    fontSize: 12,
    paddingVertical: 6,
  },
  moreExercisesBtn: {
    paddingTop: 4,
    paddingBottom: 2,
  },
  moreExercisesText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '600',
  },

  mediaDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    marginBottom: 2,
  },
  mediaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },
  mediaDotActive: {
    width: 18,
    backgroundColor: ORANGE,
  },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  kavWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, justifyContent: 'flex-end' },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    color: AppColors.white,
    fontWeight: '700',
    fontSize: IS_ANDROID ? 15 : 16,
    textAlign: 'center',
    marginBottom: 14,
  },

  moreSheet: {
    backgroundColor: '#0E0E0E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: IS_ANDROID ? 20 : 30,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  moreSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: IS_ANDROID ? 12 : 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  moreSheetIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,107,53,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreSheetText: { color: AppColors.white, fontSize: IS_ANDROID ? 14 : 15, fontWeight: '600', flex: 1 },

  commentsSheet: {
    backgroundColor: '#0E0E0E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: IS_ANDROID ? 16 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    maxHeight: '85%',
  },
  commentsList: { maxHeight: IS_ANDROID ? 280 : 340, paddingHorizontal: 14 },
  emptyComments: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30, gap: 10 },
  emptyCommentsText: { color: AppColors.grey, fontSize: IS_ANDROID ? 13 : 14 },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: IS_ANDROID ? 10 : 12 },
  commentAvatar: {
    width: IS_ANDROID ? 34 : 38,
    height: IS_ANDROID ? 34 : 38,
    borderRadius: IS_ANDROID ? 17 : 19,
    backgroundColor: AppColors.darkBg,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  commentTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  commentUser: { color: AppColors.white, fontWeight: '700', fontSize: IS_ANDROID ? 13 : 14 },
  commentTime: { color: AppColors.grey, fontSize: IS_ANDROID ? 11 : 12 },
  commentText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: IS_ANDROID ? 13 : 14,
    lineHeight: IS_ANDROID ? 19 : 21,
  },
  commentActions: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 6 },
  replyBtn: { paddingVertical: 2 },
  replyBtnText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: '700' },
  viewRepliesBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewRepliesText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: '600' },
  commentLikeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingLeft: 8 },
  commentLikeCount: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  commentDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  replyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingLeft: 14,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,107,53,0.2)',
  },
  replyAvatar: {
    width: IS_ANDROID ? 26 : 28,
    height: IS_ANDROID ? 26 : 28,
    borderRadius: IS_ANDROID ? 13 : 14,
    backgroundColor: AppColors.darkBg,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.25)',
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,107,53,0.15)',
  },
  replyBannerText: { flex: 1, color: 'rgba(255,255,255,0.6)', fontSize: IS_ANDROID ? 12 : 13 },
  emojiRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: IS_ANDROID ? 10 : 12,
  },
  emojiBtn: { paddingHorizontal: 2 },
  emojiText: { fontSize: IS_ANDROID ? 22 : 26 },
  commentInputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  commentInput: {
    flex: 1,
    height: IS_ANDROID ? 46 : 50,
    borderRadius: IS_ANDROID ? 23 : 25,
    backgroundColor: 'rgba(255,255,255,0.07)',
    color: AppColors.white,
    paddingHorizontal: 18,
    fontSize: IS_ANDROID ? 14 : 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sendBtn: {
    width: IS_ANDROID ? 46 : 50,
    height: IS_ANDROID ? 46 : 50,
    borderRadius: IS_ANDROID ? 23 : 25,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  workoutSheet: {
    backgroundColor: '#0E0E0E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: IS_ANDROID ? 20 : 28,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    maxHeight: '80%',
  },
  workoutInfoGrid: { gap: 8, marginBottom: 16 },
  workoutInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  workoutInfoLabel: { color: AppColors.grey, fontSize: IS_ANDROID ? 12 : 13, width: 80 },
  workoutInfoValueWrap: {
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  workoutInfoValue: { color: ORANGE, fontSize: IS_ANDROID ? 12 : 13, fontWeight: '600' },
  stepsHeader: {
    color: AppColors.white,
    fontWeight: '700',
    fontSize: IS_ANDROID ? 14 : 15,
    marginBottom: 10,
  },
  stepsList: { maxHeight: IS_ANDROID ? 200 : 240 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(255,107,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { color: ORANGE, fontWeight: '800', fontSize: 11 },
  stepText: {
    flex: 1,
    color: 'rgba(255,255,255,0.8)',
    fontSize: IS_ANDROID ? 13 : 14,
    lineHeight: IS_ANDROID ? 19 : 21,
  },
  closeWorkoutBtn: {
    height: IS_ANDROID ? 46 : 50,
    borderRadius: 14,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  closeWorkoutText: { color: BG, fontWeight: '800', fontSize: IS_ANDROID ? 14 : 15 },
});

