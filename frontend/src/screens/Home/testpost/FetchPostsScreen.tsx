import React, { useMemo, useState, useEffect, useRef } from 'react';
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
  KeyboardAvoidingView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ViewToken,
  ActivityIndicator,
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
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { AppColors } from '@/constants/colors';
import { fetchPostService } from '@/api/services/fetchpost.service';
import { DiscoverComment, DiscoverPost } from '@/types/fetchpost.types';
import { VideoView, useVideoPlayer } from 'expo-video';

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

type LocalExerciseRecord = {
  name: string;
  image?: string;
};

const ORANGE = AppColors.orange;
const ORANGE2 = '#cc5500';
const BG = '#080808';
const TEXT = '#f0ede8';
const MUTED = 'rgba(240,237,232,0.42)';
const HINT = 'rgba(240,237,232,0.18)';
const IS_ANDROID = Platform.OS === 'android';
const SMOOTH = { duration: 200, easing: Easing.out(Easing.cubic) };
const SMOOTH_IN = { duration: 160, easing: Easing.in(Easing.cubic) };

const SCREEN_WIDTH = Dimensions.get('window').width;

const ATHLETES: Athlete[] = [
  { name: 'Alex', username: 'alexfit', avatarUrl: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Maya', username: 'mayalifts', avatarUrl: 'https://i.pravatar.cc/150?img=32' },
  { name: 'Noah', username: 'noahrun', avatarUrl: 'https://i.pravatar.cc/150?img=56' },
  { name: 'Sara', username: 'sarahit', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
];

const QUICK_EMOJIS = ['💪', '🔥', '👏', '🏋️', '👊', '🥵', '🏆'];

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

const EXERCISE_ASSET_BASE = 'https://pub-d0fbe48b068b460e96f026d1d9fe3c68.r2.dev/exercises';
const localExerciseRecords = require('../../../constants/exercise-data.json') as LocalExerciseRecord[];
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

const toLocalPost = (post: DiscoverPost): Post => ({
  id: post.id,
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

const POSTS: Post[] = [];

function makeInitialComments(postId: string): Comment[] {
  return [
    {
      id: `${postId}-c1`,
      user: 'mayalifts',
      avatarUrl: 'https://i.pravatar.cc/150?img=32',
      text: 'Nice work! Keep grinding',
      time: '2h ago',
      likes: 4,
      liked: false,
      replies: [],
      showReplies: false,
    },
    {
      id: `${postId}-c2`,
      user: 'noahrun',
      avatarUrl: 'https://i.pravatar.cc/150?img=56',
      text: 'absolute beast mode',
      time: '1h ago',
      likes: 2,
      liked: false,
      replies: [
        {
          id: `${postId}-c2-r1`,
          user: 'sarahit',
          avatarUrl: 'https://i.pravatar.cc/150?img=3',
          text: 'Agreed! Legend',
          time: '45m ago',
          likes: 1,
          liked: false,
        },
      ],
      showReplies: false,
    },
    {
      id: `${postId}-c3`,
      user: 'sarahit',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
      text: "Great form, what's your PR?",
      time: '30m ago',
      likes: 0,
      liked: false,
      replies: [],
      showReplies: false,
    },
  ];
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={st.miniStat}>
      <Text allowFontScaling={false} style={st.miniStatLabel}>
        {label}
      </Text>
      <Text allowFontScaling={false} style={st.miniStatValue}>
        {value}
      </Text>
    </View>
  );
}

function IconButton({ name, onPress, badge }: { name: any; onPress: () => void; badge?: boolean }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const press = () => {
    runOnJS(Haptics.selectionAsync)();
    scale.value = withSequence(
      withTiming(0.85, { duration: 80, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) })
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

function FollowButton({ followed, onPress }: { followed: boolean; onPress: () => void }) {
  const followedVal = useSharedValue(followed ? 1 : 0);
  useEffect(() => {
    followedVal.value = withTiming(followed ? 1 : 0, SMOOTH);
  }, [followed]);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(255,120,37,${interpolate(followedVal.value, [0, 1], [0, 0.14])})`,
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  }));

  const press = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    runOnJS(onPress)();
  };

  return (
    <TouchableOpacity onPress={press} activeOpacity={0.8}>
      <Animated.View style={animStyle}>
        {followed ? (
          <Ionicons name="checkmark" size={11} color={ORANGE} style={{ marginRight: 3 }} />
        ) : (
          <Ionicons name="add" size={11} color={ORANGE} style={{ marginRight: 3 }} />
        )}
        <Text allowFontScaling={false} style={st.followBtnText}>
          {followed ? 'Following' : 'Follow'}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function LikeButton({ liked, count, onPress }: { liked: boolean; count: number; onPress: () => void }) {
  const heartScale = useSharedValue(1);
  const press = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    heartScale.value = withSequence(
      withTiming(0.7, { duration: 80 }),
      withTiming(1.2, { duration: 120 }),
      withTiming(1, { duration: 100 })
    );
    runOnJS(onPress)();
  };
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));
  return (
    <TouchableOpacity onPress={press} activeOpacity={1} style={st.likeBtn}>
      <Animated.View style={heartStyle}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={IS_ANDROID ? 20 : 22}
          color={liked ? '#FF4D6D' : 'rgba(255,255,255,0.7)'}
        />
      </Animated.View>
      <Text allowFontScaling={false} style={[st.likeCount, liked && { color: '#FF4D6D' }]}>
        {count}
      </Text>
    </TouchableOpacity>
  );
}

function CommentLike({ liked, count, onPress }: { liked: boolean; count: number; onPress: () => void }) {
  const scale = useSharedValue(1);
  const press = () => {
    runOnJS(Haptics.selectionAsync)();
    scale.value = withSequence(
      withTiming(0.7, { duration: 70 }),
      withTiming(1.15, { duration: 100 }),
      withTiming(1, { duration: 80 })
    );
    runOnJS(onPress)();
  };
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <TouchableOpacity onPress={press} activeOpacity={1} style={st.commentLikeRow}>
      <Animated.View style={animStyle}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={13}
          color={liked ? '#FF4D6D' : 'rgba(255,255,255,0.4)'}
        />
      </Animated.View>
      {count > 0 && <Text style={st.commentLikeCount}>{count}</Text>}
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

  return <VideoView player={player} style={st.postImage} contentFit="cover" nativeControls={false} />;
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
      <View style={st.mediaEmptyWrap}>
        <View style={st.mediaEmptyIconWrap}>
          <Ionicons name="image-outline" size={20} color={MUTED} />
        </View>
        <Text allowFontScaling={false} style={st.mediaEmptyText}>
          Missing media URL
        </Text>
      </View>
    );
  }

  if (media.type === 'VIDEO') {
    return (
      <View>
        <VideoMedia uri={media.url} isActive={isActive} />
        <View style={st.videoHint}>
          <Ionicons name="videocam" size={11} color={TEXT} />
          <Text allowFontScaling={false} style={st.videoHintText}>
            Video
          </Text>
        </View>
      </View>
    );
  }

  return <Image source={{ uri: media.url }} style={st.postImage} />;
}

function PostCard({
  item,
  index,
  activeMediaIndex,
  isPostActive,
  isScreenFocused,
  isLiked,
  isSaved,
  isFollowed,
  likeCount,
  commentCount,
  onLike,
  onSave,
  onFollow,
  onComment,
  onMediaPress,
  onMediaIndexChange,
  onMoreExercisesPress,
  onPress,
  onAvatarPress,
}: {
  item: Post;
  index: number;
  activeMediaIndex: number;
  isPostActive: boolean;
  isScreenFocused: boolean;
  isLiked: boolean;
  isSaved: boolean;
  isFollowed: boolean;
  likeCount: number;
  commentCount: number;
  onLike: () => void;
  onSave: () => void;
  onFollow: () => void;
  onComment: () => void;
  onMediaPress: (mediaIndex: number) => void;
  onMediaIndexChange: (mediaIndex: number) => void;
  onMoreExercisesPress: () => void;
  onPress: () => void;
  onAvatarPress: () => void;
}) {
  const mediaCount = item.media.length;
  const totalSlides = mediaCount + 1;
  const safeMediaIndex = Math.min(Math.max(0, activeMediaIndex), Math.max(0, totalSlides - 1));
  const [mediaWidth, setMediaWidth] = useState(0);
  const slideWidth = mediaWidth || SCREEN_WIDTH - 56;

  const onMediaScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (totalSlides <= 1) return;
    const measuredWidth = event.nativeEvent.layoutMeasurement.width || slideWidth;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / measuredWidth);
    const clampedIndex = Math.min(Math.max(0, nextIndex), totalSlides - 1);
    if (clampedIndex !== safeMediaIndex) {
      onMediaIndexChange(clampedIndex);
    }
  };

  const cardScale = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));
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

  const likedByName = item.likedByUsername;
  const likedByAvatars = (
    item.likedByAvatarUrls && item.likedByAvatarUrls.length > 0
      ? item.likedByAvatarUrls
      : likeCount > 1
        ? [item.athlete.avatarUrl, item.athlete.avatarUrl]
        : [item.athlete.avatarUrl]
  ).slice(0, 2);

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400).easing(Easing.out(Easing.cubic))}>
      <Pressable
        onPressIn={() => {
          cardScale.value = withTiming(0.988, { duration: 100 });
        }}
        onPressOut={() => {
          cardScale.value = withTiming(1, { duration: 180 });
        }}
        onPress={onPress}
      >
        <Animated.View style={cardStyle}>
          <LinearGradient
            colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={st.card}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.08)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={st.cardShine}
              pointerEvents="none"
            />
            <LinearGradient
              colors={[ORANGE, ORANGE2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={st.cardAccentBar}
            />

            <View style={st.cardHeader}>
              <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8}>
                <View style={st.avatarWrap}>
                  <Image source={{ uri: item.athlete.avatarUrl }} style={st.avatar} />
                  <View style={st.avatarOnline} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8} style={{ flex: 1 }}>
                <Text allowFontScaling={false} style={st.username}>
                  {item.athlete.username}
                </Text>
                <Text allowFontScaling={false} style={st.time}>
                  {item.time}
                </Text>
              </TouchableOpacity>
              <FollowButton followed={isFollowed} onPress={onFollow} />
              <View style={{ width: 8 }} />
              <TouchableOpacity onPress={pressSave} activeOpacity={1}>
                <Animated.View style={saveStyle}>
                  <Ionicons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={IS_ANDROID ? 18 : 20}
                    color={isSaved ? ORANGE : 'rgba(255,255,255,0.5)'}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>

            <View style={{ height: IS_ANDROID ? 10 : 12 }} />
            {item.title && (
              <Text allowFontScaling={false} style={st.postTitle}>
                {item.title}
              </Text>
            )}
            <Text allowFontScaling={false} style={st.caption}>
              {item.caption}
            </Text>

            <View style={st.statsRow}>
              <MiniStat label="Time" value={item.stats.time} />
              {item.stats.bpm && <MiniStat label="Avg bpm" value={item.stats.bpm} />}
              {item.stats.reps && <MiniStat label="Reps" value={item.stats.reps} />}
              {item.stats.weight && <MiniStat label="Weight taken" value={item.stats.weight} />}
              {item.stats.distance && <MiniStat label="Distance" value={item.stats.distance} />}
            </View>

            <View
              style={st.imageWrap}
              onLayout={(event) => setMediaWidth(event.nativeEvent.layout.width)}
            >
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onMediaScrollEnd}
              >
                {item.media.map((media, mediaIndex) => (
                  <TouchableOpacity
                    key={`${item.id}-media-${mediaIndex}`}
                    activeOpacity={0.92}
                    onPress={() => onMediaPress(mediaIndex)}
                  >
                    <View style={[st.mediaSlide, { width: slideWidth }]}>
                      <MediaSlide
                        media={media}
                        isActive={isScreenFocused && isPostActive && safeMediaIndex === mediaIndex}
                      />
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity activeOpacity={0.9} onPress={onMoreExercisesPress}>
                  <View style={[
                    st.exerciseSlide,
                    { width: slideWidth },
                    (item.exercises || []).length === 1 && st.exerciseSlideSingle
                  ]}>
                    {(item.exercises || []).length === 1 ? (
                      <View style={st.singleExerciseContainer}>
                        <View style={st.singleExerciseIconWrap}>
                          {(item.exercises[0]).iconUrl ? (
                            <Image source={{ uri: (item.exercises[0]).iconUrl }} style={st.singleExerciseIcon} />
                          ) : (
                            <Ionicons name="barbell-outline" size={48} color={ORANGE} />
                          )}
                        </View>
                        <Text allowFontScaling={false} style={st.singleExerciseSetsText}>
                          {(item.exercises[0]).setsCount} {(item.exercises[0]).setsCount === 1 ? 'set' : 'sets'}
                        </Text>
                        <Text allowFontScaling={false} style={st.singleExerciseNameText}>
                          {(item.exercises[0]).name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </Text>
                      </View>
                    ) : (
                      <>
                        {(item.exercises || []).slice(0, 3).map((exercise, exerciseIndex) => (
                          <View key={`${item.id}-exercise-${exerciseIndex}`} style={st.exerciseRow}>
                            <View style={st.exerciseIconWrap}>
                              {exercise.iconUrl ? (
                                <Image source={{ uri: exercise.iconUrl }} style={st.exerciseIcon} />
                              ) : (
                                <Ionicons name="barbell-outline" size={16} color={ORANGE} />
                              )}
                            </View>
                            <Text allowFontScaling={false} style={st.exerciseSetsText}>
                              {exercise.setsCount} {exercise.setsCount === 1 ? 'set' : 'sets'}
                            </Text>
                            <Text allowFontScaling={false} style={st.exerciseNameText} numberOfLines={1}>
                              {exercise.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                            </Text>
                          </View>
                        ))}

                        {(!item.exercises || item.exercises.length === 0) && (
                          <Text allowFontScaling={false} style={st.exerciseEmptyText}>
                            No exercise details
                          </Text>
                        )}

                        {(item.exercises && item.exercises.length > 3) && (
                          <TouchableOpacity onPress={onMoreExercisesPress} activeOpacity={0.75} style={st.moreExercisesBtn}>
                            <Text allowFontScaling={false} style={st.moreExercisesText}>
                              More exercises
                            </Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </ScrollView>
              <View style={st.imageOverlay} />
            </View>

            {totalSlides > 1 && (
              <View style={st.mediaDotsRow}>
                {Array.from({ length: totalSlides }).map((_, mediaIndex) => (
                  <View
                    key={`${item.id}-dot-${mediaIndex}`}
                    style={[st.mediaDot, mediaIndex === safeMediaIndex && st.mediaDotActive]}
                  />
                ))}
              </View>
            )}

            <View style={st.actionRow}>
              <LikeButton liked={isLiked} count={likeCount} onPress={onLike} />
              <TouchableOpacity onPress={onComment} activeOpacity={0.7} style={st.commentBtn}>
                <Ionicons
                  name="chatbubble-outline"
                  size={IS_ANDROID ? 18 : 20}
                  color="rgba(255,255,255,0.6)"
                />
                <Text allowFontScaling={false} style={st.commentCount}>
                  {commentCount}
                </Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => Haptics.selectionAsync()} activeOpacity={0.7} style={st.shareBtn}>
                <Ionicons
                  name="arrow-redo-outline"
                  size={IS_ANDROID ? 18 : 20}
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>
            </View>

            {likeCount > 0 && likedByName && (
              <View style={st.likedByRow}>
                {likedByAvatars.map((avatarUrl, idx) => (
                  <Image
                    key={`${item.id}-liked-avatar-${idx}`}
                    source={{ uri: avatarUrl }}
                    style={[st.tinyAvatar, idx > 0 && { marginLeft: -8 }]}
                  />
                ))}
                <Text allowFontScaling={false} numberOfLines={1} style={st.likedByText}>
                  Liked by <Text style={{ color: TEXT, fontWeight: '700' }}>{likedByName}</Text>
                  {likeCount > 1 ? ' and others' : ''}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function MenuItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const press = () => {
    runOnJS(Haptics.selectionAsync)();
    runOnJS(onPress)();
  };
  return (
    <TouchableOpacity onPress={press} activeOpacity={0.8}>
      <View style={[st.menuItem, active && st.menuItemActive]}>
        <View style={[st.menuIconWrap, active && st.menuIconActive]}>
          <Ionicons name={icon} size={15} color={active ? ORANGE : 'rgba(255,255,255,0.5)'} />
        </View>
        <Text allowFontScaling={false} style={[st.menuText, active && st.menuTextActive]}>
          {label}
        </Text>
        {active && <View style={st.activeDot} />}
      </View>
    </TouchableOpacity>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const isScreenFocused = useIsFocused();

  const [posts, setPosts] = useState<Post[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const [commentDraft, setCommentDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; user: string } | null>(null);
  const [activeMediaByPost, setActiveMediaByPost] = useState<Record<string, number>>({});
  const [activePlaybackPostId, setActivePlaybackPostId] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 120,
  });

  const onViewableItemsChangedRef = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems?.[0]?.item as Post | undefined;
      if (firstVisible?.id) {
        setActivePlaybackPostId(firstVisible.id);
      }
    },
  );

  const loadDiscoverPosts = async (reset = false) => {
    const response = await fetchPostService.getDiscoverPosts(3, reset ? undefined : nextCursor ?? undefined);
    const initialPosts = response.posts.map(toLocalPost);

    const hydratedPosts = await Promise.all(
      initialPosts.map(async (post) => {
        if (post.exercises.length > 0) {
          return post;
        }

        try {
          const detail = await fetchPostService.getDiscoverPostById(post.id);
          return toLocalPost(detail.post);
        } catch (error) {
          console.warn(`Failed to hydrate exercises for post ${post.id}:`, error);
          return post;
        }
      }),
    );

    setPosts((prev) => {
      if (reset) {
        return hydratedPosts;
      }

      const seen = new Set(prev.map((post) => post.id));
      const uniqueIncoming = hydratedPosts.filter((post) => !seen.has(post.id));
      return [...prev, ...uniqueIncoming];
    });

    setActiveMediaByPost((prev) => ({
      ...prev,
      ...Object.fromEntries(
        hydratedPosts.map((post) => [
          post.id,
          // +1 slide is reserved for the exercises card at the end of carousel.
          Math.min(prev[post.id] ?? 0, Math.max(0, post.media.length)),
        ]),
      ),
    }));

    setLikeCounts((prev) => ({
      ...prev,
      ...Object.fromEntries(hydratedPosts.map((post) => [post.id, post.likesCount])),
    }));

    setLikedIds((prev) => {
      const next = reset ? new Set<string>() : new Set(prev);
      for (const post of hydratedPosts) {
        if (post.likedByMe) {
          next.add(post.id);
        }
      }
      return next;
    });

    setCommentsByPost((prev) => ({
      ...prev,
      ...Object.fromEntries(
        hydratedPosts.map((post) => [
          post.id,
          (Array.isArray(post.comments) ? post.comments : []).map(toLocalComment),
        ]),
      ),
    }));

    setNextCursor(response.nextCursor);
    setHasMore(response.nextCursor !== null && hydratedPosts.length > 0);

    setActivePlaybackPostId((prev) => {
      if (prev && (reset ? hydratedPosts : [...posts, ...hydratedPosts]).some((post) => post.id === prev)) {
        return prev;
      }
      return (reset ? hydratedPosts[0] : posts[0] || hydratedPosts[0])?.id ?? null;
    });
  };

  const loadMoreDiscoverPosts = async () => {
    if (isLoadingMore || !hasMore || !nextCursor || query.trim()) {
      return;
    }

    setIsLoadingMore(true);
    try {
      await loadDiscoverPosts(false);
    } catch (error) {
      console.error('Failed to load more discover posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadDiscoverPosts(true).catch((error) => {
      console.error('Failed to load discover posts:', error);
    });
  }, []);

  useEffect(() => {
    if (!isScreenFocused) {
      // Pause all feed videos when this screen is not focused.
      setActivePlaybackPostId(null);
    }
  }, [isScreenFocused]);

  const menuOpacity = useSharedValue(0);
  const menuScale = useSharedValue(0.92);
  const sheetY = useSharedValue(700);
  const syncRotation = useSharedValue(0);

  useEffect(() => {
    if (menuOpen) {
      menuOpacity.value = withTiming(1, SMOOTH);
      menuScale.value = withTiming(1, SMOOTH);
    } else {
      menuOpacity.value = withTiming(0, SMOOTH_IN);
      menuScale.value = withTiming(0.92, SMOOTH_IN);
    }
  }, [menuOpen]);

  useEffect(() => {
    sheetY.value = commentsOpen
      ? withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) })
      : withTiming(700, { duration: 280, easing: Easing.in(Easing.cubic) });
  }, [commentsOpen]);

  const menuAnimStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
    transform: [{ scale: menuScale.value }],
  }));
  const sheetAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }] }));
  const syncAnimStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${syncRotation.value}deg` }] }));

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => `${p.athlete.name} ${p.athlete.username} ${p.caption}`.toLowerCase().includes(q));
  }, [query, posts]);

  const toggleLike = async (id: string) => {
    const wasLiked = likedIds.has(id);

    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    setLikeCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + (wasLiked ? -1 : 1)) }));

    try {
      const result = await fetchPostService.togglePostLike(id);
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (result.liked) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
      setLikeCounts((c) => ({ ...c, [id]: result.likesCount }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? {
                ...post,
                likedByUsername: result.likedByUsername ?? post.likedByUsername,
                likedByAvatarUrls: Array.isArray(result.likedByAvatarUrls)
                  ? result.likedByAvatarUrls.slice(0, 2)
                  : post.likedByAvatarUrls,
              }
            : post,
        ),
      );
    } catch (error) {
      console.error('Failed to toggle post like:', error);
      // Roll back optimistic state.
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
      setLikeCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + (wasLiked ? 1 : -1)) }));
    }
  };

  const openComments = (postId: string) => {
    setActivePostId(postId);
    setCommentDraft('');
    setReplyingTo(null);
    setCommentsOpen(true);
  };
  const closeComments = () => {
    setCommentsOpen(false);
    setReplyingTo(null);
    setCommentDraft('');
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
          ? {
              ...c,
              replies: c.replies.map((r) =>
                r.id === replyId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r
              ),
            }
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

  const sendComment = async () => {
    if (!activePostId || !commentDraft.trim()) return;
    const text = commentDraft.trim();

    try {
      const response = await fetchPostService.createPostComment(
        activePostId,
        text,
        replyingTo?.commentId,
      );

      const postedComment = toLocalComment(response.comment);

      if (replyingTo) {
        setCommentsByPost((prev) => ({
          ...prev,
          [activePostId]: (prev[activePostId] ?? []).map((c) =>
            c.id === replyingTo.commentId
              ? { ...c, replies: [...c.replies, { ...postedComment, replies: [] }], showReplies: true }
              : c,
          ),
        }));
      } else {
        setCommentsByPost((prev) => ({
          ...prev,
          [activePostId]: [...(prev[activePostId] ?? []), postedComment],
        }));
      }

      setCommentDraft('');
      setReplyingTo(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to create comment:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const activeComments = activePostId ? (commentsByPost[activePostId] ?? []) : [];

    const handleSyncPress = async () => {
    if (isSyncing) return;
    Haptics.selectionAsync();
    setIsSyncing(true);
    syncRotation.value = withTiming(360, { duration: 550, easing: Easing.out(Easing.cubic) });

    try {
      // Explicitly reset infinite-feed pagination state before fetching page 1.
      setNextCursor(null);
      setHasMore(true);
      setIsLoadingMore(false);
      await loadDiscoverPosts(true);
    } catch (error) {
      console.error('Failed syncing discover posts:', error);
    } finally {
      syncRotation.value = 0;
      setIsSyncing(false);
    }
    };

  return (
    <LinearGradient
      colors={['#0e0e11', '#0a0906', '#080808', '#0a0906', '#0b0b0e']}
      locations={[0, 0.2, 0.5, 0.75, 1]}
      start={{ x: 0.16, y: 0 }}
      end={{ x: 0.84, y: 1 }}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={['rgba(255,100,20,0.05)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.4 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <SafeAreaView style={st.safe} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <Animated.View
          entering={FadeInDown.duration(400).easing(Easing.out(Easing.cubic))}
          style={st.header}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setMenuOpen(true);
            }}
            style={st.titleRow}
            activeOpacity={0.7}
          >
            <Text allowFontScaling={false} style={st.title}>
              Discover
            </Text>
            <View style={st.chevronWrap}>
              <Ionicons name="chevron-down" size={12} color={ORANGE} />
            </View>
          </TouchableOpacity>
          <View style={st.actions}>
            <IconButton name="search-outline" onPress={() => setSearchOpen(true)} />
            <TouchableOpacity onPress={handleSyncPress} activeOpacity={0.8} disabled={isSyncing}>
              <Animated.View style={[st.syncBtn, syncAnimStyle, isSyncing && st.syncBtnActive]}>
                <Ionicons
                  name="sync"
                  size={IS_ANDROID ? 18 : 20}
                  color={isSyncing ? '#FFFFFF' : ORANGE}
                />
              </Animated.View>
            </TouchableOpacity>
            <IconButton
              name="notifications-outline"
              onPress={() => router.push('/(tabs)/home/notifications')}
              badge
            />
          </View>
        </Animated.View>

        <FlatList
          contentContainerStyle={st.list}
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: IS_ANDROID ? 12 : 14 }} />}
          onViewableItemsChanged={onViewableItemsChangedRef.current}
          viewabilityConfig={viewabilityConfigRef.current}
          onEndReached={loadMoreDiscoverPosts}
          onEndReachedThreshold={0.55}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={st.loadMoreWrap}>
                <ActivityIndicator size="small" color={ORANGE} />
                <Text allowFontScaling={false} style={st.loadMoreText}>
                  Loading more posts...
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item, index }) => (
            <PostCard
              item={item}
              index={index}
              activeMediaIndex={activeMediaByPost[item.id] ?? 0}
              isPostActive={activePlaybackPostId === item.id}
              isScreenFocused={isScreenFocused}
              isLiked={likedIds.has(item.id)}
              isSaved={savedIds.has(item.id)}
              isFollowed={followedIds.has(item.athlete.username)}
              likeCount={likeCounts[item.id] ?? 120}
              commentCount={commentsByPost[item.id]?.length ?? item.commentsCount}
              onLike={() => toggleLike(item.id)}
              onSave={() =>
                setSavedIds((prev) => {
                  const n = new Set(prev);
                  n.has(item.id) ? n.delete(item.id) : n.add(item.id);
                  return n;
                })
              }
              onFollow={() =>
                setFollowedIds((prev) => {
                  const n = new Set(prev);
                  n.has(item.athlete.username) ? n.delete(item.athlete.username) : n.add(item.athlete.username);
                  return n;
                })
              }
              onComment={() => openComments(item.id)}
              onMediaPress={(mediaIndex) => {
                setActivePlaybackPostId(item.id);
                const media = item.media[mediaIndex];
                if (!media || media.type !== 'IMAGE') return;

                setActivePlaybackPostId(null);
                router.push({
                  pathname: '/(tabs)/home/full-image',
                  params: {
                    imageUrl: media.url,
                    caption: item.caption,
                    username: item.athlete.username,
                  },
                });
              }}
              onMediaIndexChange={(mediaIndex) =>
                setActiveMediaByPost((prev) => ({
                  ...prev,
                  [item.id]: mediaIndex,
                }))
              }
              onMoreExercisesPress={() => {
                setActivePlaybackPostId(null);
                router.push({
                  pathname: '/(tabs)/home/post-detail',
                  params: { postId: item.id },
                });
              }}
              onPress={() => {
                setActivePlaybackPostId(null);
                router.push({
                  pathname: '/(tabs)/home/post-detail',
                  params: { postId: item.id },
                });
              }}
              onAvatarPress={() =>
                router.push({
                  pathname: '/(tabs)/home/userid',
                  params: {
                    name: item.athlete.name,
                    user: item.athlete.username,
                    avatar: item.athlete.avatarUrl,
                  },
                })
              }
            />
          )}
        />

        <Modal visible={menuOpen} transparent animationType="none">
          <Pressable style={st.backdrop} onPress={() => setMenuOpen(false)} />
          <Animated.View style={[st.menu, menuAnimStyle]}>
            <BlurView intensity={60} tint="dark" style={st.menuBlur}>
              <MenuItem
                icon="home-outline"
                label="Home (Following)"
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/(tabs)/home');
                }}
              />
              <View style={st.menuDivider} />
              <MenuItem icon="compass-outline" label="Discover" active onPress={() => setMenuOpen(false)} />
            </BlurView>
          </Animated.View>
        </Modal>

        <Modal visible={searchOpen} animationType="slide">
          <LinearGradient
            colors={['#0e0e11', '#080808', '#0b0b0e']}
            start={{ x: 0.16, y: 0 }}
            end={{ x: 0.84, y: 1 }}
            style={{
              flex: 1,
              paddingTop: Platform.OS === 'ios' ? insets.top : 0,
              paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
            }}
          >
            <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
              <Animated.View
                entering={FadeInDown.duration(280).easing(Easing.out(Easing.cubic))}
                style={st.searchHeader}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSearchOpen(false);
                    setQuery('');
                  }}
                  style={st.backBtn}
                >
                  <Ionicons name="arrow-back" size={IS_ANDROID ? 18 : 20} color={TEXT} />
                </TouchableOpacity>
                <LinearGradient
                  colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.04)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={st.searchBar}
                >
                  <Ionicons name="search" size={15} color={MUTED} />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search athletes or captions..."
                    placeholderTextColor={HINT}
                    style={st.searchInput}
                    autoFocus
                    allowFontScaling={false}
                    selectionColor={ORANGE}
                  />
                  {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')}>
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
                  <Text allowFontScaling={false} style={st.emptyText}>
                    No results found
                  </Text>
                </Animated.View>
              ) : (
                <FlatList
                  data={filteredPosts}
                  keyExtractor={(p) => p.id}
                  contentContainerStyle={{ paddingBottom: 40 }}
                  ItemSeparatorComponent={() => (
                    <View style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                  )}
                  renderItem={({ item, index }) => (
                    <Animated.View
                      entering={FadeInDown.delay(index * 35)
                        .duration(280)
                        .easing(Easing.out(Easing.cubic))}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setSearchOpen(false);
                          setQuery('');
                          setActivePlaybackPostId(null);
                          router.push({
                            pathname: '/(tabs)/home/post-detail',
                            params: { postId: item.id },
                          });
                        }}
                        style={st.searchRow}
                        activeOpacity={0.7}
                      >
                        <View style={st.searchAvatarWrap}>
                          <Image source={{ uri: item.athlete.avatarUrl }} style={st.searchAvatar} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text allowFontScaling={false} style={st.searchName}>
                            {item.athlete.name}
                          </Text>
                          <Text allowFontScaling={false} style={st.searchCaption} numberOfLines={1}>
                            {item.caption}
                          </Text>
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

        <Modal visible={commentsOpen} transparent animationType="none">
          <Pressable style={st.backdrop} onPress={closeComments} />
          <KeyboardAvoidingView behavior={IS_ANDROID ? 'height' : 'padding'} style={st.sheetKav}>
            <Animated.View style={[st.commentsSheet, sheetAnimStyle]}>
              <View style={st.sheetHandle} />
              <Text allowFontScaling={false} style={st.sheetTitle}>
                Comments
              </Text>

              <ScrollView
                style={st.commentsList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {activeComments.length === 0 ? (
                  <View style={st.emptyComments}>
                    <Ionicons name="chatbubble-outline" size={32} color={MUTED} />
                    <Text allowFontScaling={false} style={st.emptyCommentsText}>
                      No comments yet. Be first!
                    </Text>
                  </View>
                ) : (
                  activeComments.map((c, idx) => (
                    <Animated.View
                      key={c.id}
                      entering={FadeInDown.delay(idx * 30).duration(260).easing(Easing.out(Easing.cubic))}
                    >
                      <View style={st.commentItem}>
                        <Image source={{ uri: c.avatarUrl }} style={st.commentAvatar} />
                        <View style={{ flex: 1 }}>
                          <View style={st.commentTopRow}>
                            <Text allowFontScaling={false} style={st.commentUser}>
                              {c.user}
                            </Text>
                            <Text allowFontScaling={false} style={st.commentTime}>
                              {c.time}
                            </Text>
                          </View>
                          <Text allowFontScaling={false} style={st.commentText}>
                            {c.text}
                          </Text>
                          <View style={st.commentActions}>
                            <TouchableOpacity
                              onPress={() => {
                                Haptics.selectionAsync();
                                setReplyingTo({ commentId: c.id, user: c.user });
                              }}
                              style={st.replyBtn}
                            >
                              <Text allowFontScaling={false} style={st.replyBtnText}>
                                Reply
                              </Text>
                            </TouchableOpacity>
                            {c.replies.length > 0 && (
                              <TouchableOpacity
                                onPress={() => activePostId && toggleReplies(activePostId, c.id)}
                                style={st.viewRepliesBtn}
                              >
                                <Ionicons
                                  name={c.showReplies ? 'chevron-up' : 'chevron-down'}
                                  size={11}
                                  color={ORANGE}
                                />
                                <Text allowFontScaling={false} style={st.viewRepliesText}>
                                  {c.showReplies ? 'Hide' : `${c.replies.length}`}{' '}
                                  {c.replies.length === 1 ? 'reply' : 'replies'}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                          {c.showReplies &&
                            c.replies.map((r) => (
                              <View key={r.id} style={st.replyItem}>
                                <Image source={{ uri: r.avatarUrl }} style={st.replyAvatar} />
                                <View style={{ flex: 1 }}>
                                  <View style={st.commentTopRow}>
                                    <Text allowFontScaling={false} style={st.commentUser}>
                                      {r.user}
                                    </Text>
                                    <Text allowFontScaling={false} style={st.commentTime}>
                                      {r.time}
                                    </Text>
                                  </View>
                                  <Text allowFontScaling={false} style={st.commentText}>
                                    {r.text}
                                  </Text>
                                </View>
                                <CommentLike
                                  liked={r.liked}
                                  count={r.likes}
                                  onPress={() => activePostId && likeReply(activePostId, c.id, r.id)}
                                />
                              </View>
                            ))}
                        </View>
                        <CommentLike
                          liked={c.liked}
                          count={c.likes}
                          onPress={() => activePostId && likeComment(activePostId, c.id)}
                        />
                      </View>
                      {idx < activeComments.length - 1 && <View style={st.commentDivider} />}
                    </Animated.View>
                  ))
                )}
              </ScrollView>

              <View style={st.emojiRow}>
                {QUICK_EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setCommentDraft((prev) => `${prev}${emoji}`);
                    }}
                    style={st.emojiBtn}
                  >
                    <Text style={st.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {replyingTo && (
                <Animated.View entering={FadeIn.duration(200)} style={st.replyBanner}>
                  <Ionicons name="return-down-forward" size={13} color={ORANGE} />
                  <Text allowFontScaling={false} style={st.replyBannerText}>
                    Replying to <Text style={{ color: ORANGE, fontWeight: '700' }}>@{replyingTo.user}</Text>
                  </Text>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                    <Ionicons name="close" size={14} color={MUTED} />
                  </TouchableOpacity>
                </Animated.View>
              )}

              <View style={st.commentInputBar}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.04)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={st.commentInputGrad}
                >
                  <TextInput
                    value={commentDraft}
                    onChangeText={setCommentDraft}
                    placeholder={replyingTo ? `Reply to @${replyingTo.user}...` : 'Add a comment...'}
                    placeholderTextColor={HINT}
                    style={st.commentInput}
                    allowFontScaling={false}
                    selectionColor={ORANGE}
                  />
                </LinearGradient>
                <TouchableOpacity
                  onPress={sendComment}
                  activeOpacity={0.8}
                  style={[st.sendBtn, !commentDraft.trim() && { opacity: 0.4 }]}
                  disabled={!commentDraft.trim()}
                >
                  <LinearGradient
                    colors={[ORANGE, ORANGE2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
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

const st = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    height: IS_ANDROID ? 54 : 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: { color: TEXT, fontWeight: '800', fontSize: IS_ANDROID ? 22 : 24, letterSpacing: -0.4 },
  chevronWrap: {
    backgroundColor: 'rgba(255,120,37,0.14)',
    borderRadius: 7,
    padding: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(255,120,37,0.25)',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: IS_ANDROID ? 36 : 38,
    height: IS_ANDROID ? 36 : 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ORANGE,
    borderWidth: 1.5,
    borderColor: BG,
  },
  syncBtn: {
    width: IS_ANDROID ? 36 : 38,
    height: IS_ANDROID ? 36 : 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBtnActive: {
    backgroundColor: 'rgba(255,107,53,0.14)',
    borderColor: 'rgba(255,107,53,0.35)',
  },

  list: { paddingHorizontal: 14, paddingTop: IS_ANDROID ? 6 : 8, paddingBottom: 100 },

  card: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  cardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  cardAccentBar: { height: 2, width: '40%', borderBottomRightRadius: 2 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: IS_ANDROID ? 8 : 10,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: IS_ANDROID ? 36 : 40,
    height: IS_ANDROID ? 36 : 40,
    borderRadius: IS_ANDROID ? 18 : 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: 'rgba(255,120,37,0.4)',
  },
  avatarOnline: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#34c759',
    borderWidth: 1.5,
    borderColor: BG,
  },
  username: { color: TEXT, fontWeight: '700', fontSize: IS_ANDROID ? 13 : 14 },
  time: { color: MUTED, fontSize: IS_ANDROID ? 11 : 12, marginTop: 1 },
  followBtnText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: '700' },
  postTitle: {
    color: TEXT,
    fontSize: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  caption: {
    color: 'rgba(240,237,232,0.88)',
    fontSize: IS_ANDROID ? 14 : 15,
    lineHeight: IS_ANDROID ? 21 : 23,
    paddingHorizontal: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: IS_ANDROID ? 10 : 12,
    gap: IS_ANDROID ? 16 : 20,
  },
  miniStat: {},
  miniStatLabel: { color: MUTED, fontSize: IS_ANDROID ? 10 : 11, marginBottom: 2 },
  miniStatValue: { color: TEXT, fontWeight: '700', fontSize: IS_ANDROID ? 13 : 14 },
  imageWrap: { position: 'relative', marginHorizontal: 14, borderRadius: 14, overflow: 'hidden' },
  mediaSlide: { overflow: 'hidden' },
  postImage: { width: '100%', height: IS_ANDROID ? 220 : 250, backgroundColor: '#1a1a1a' },
  mediaEmptyWrap: {
    width: '100%',
    height: IS_ANDROID ? 220 : 250,
    backgroundColor: '#151515',
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
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: IS_ANDROID ? 10 : 12,
    paddingBottom: 4,
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 14 },
  likeCount: { color: 'rgba(255,255,255,0.7)', fontSize: IS_ANDROID ? 13 : 14, fontWeight: '600' },
  commentBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  commentCount: { color: 'rgba(255,255,255,0.5)', fontSize: IS_ANDROID ? 12 : 13 },
  shareBtn: { padding: 4 },
  likedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 8,
    marginTop: 4,
  },
  tinyAvatar: {
    width: IS_ANDROID ? 18 : 20,
    height: IS_ANDROID ? 18 : 20,
    borderRadius: IS_ANDROID ? 9 : 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1.5,
    borderColor: BG,
  },
  likedByText: { color: MUTED, fontSize: IS_ANDROID ? 11 : 12, flex: 1 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  menu: {
    position: 'absolute',
    top: IS_ANDROID ? 64 : 72,
    left: 14,
    width: 250,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  menuBlur: { padding: 6, backgroundColor: 'rgba(10,10,10,0.96)' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  menuItemActive: { backgroundColor: 'rgba(255,120,37,0.06)' },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuIconActive: { backgroundColor: 'rgba(255,120,37,0.14)' },
  menuText: { color: 'rgba(255,255,255,0.6)', flex: 1, fontSize: IS_ANDROID ? 14 : 15, fontWeight: '600' },
  menuTextActive: { color: TEXT, fontWeight: '700' },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: ORANGE },
  menuDivider: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 10 },

  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    height: IS_ANDROID ? 42 : 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  searchInput: { flex: 1, color: TEXT, fontSize: IS_ANDROID ? 13 : 15, paddingVertical: 0 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: IS_ANDROID ? 11 : 13,
    gap: 12,
  },
  searchAvatarWrap: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,120,37,0.3)',
    borderRadius: IS_ANDROID ? 22 : 24,
    padding: 1.5,
  },
  searchAvatar: {
    width: IS_ANDROID ? 40 : 44,
    height: IS_ANDROID ? 40 : 44,
    borderRadius: IS_ANDROID ? 20 : 22,
    backgroundColor: '#1a1a1a',
  },
  searchName: { color: TEXT, fontWeight: '700', fontSize: IS_ANDROID ? 14 : 15 },
  searchCaption: { color: MUTED, fontSize: IS_ANDROID ? 12 : 13, marginTop: 2 },
  emptySearch: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingTop: 80 },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: MUTED, fontSize: IS_ANDROID ? 14 : 15 },

  sheetKav: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, justifyContent: 'flex-end' },
  commentsSheet: {
    backgroundColor: '#0e0d0b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: IS_ANDROID ? 16 : 20,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.09)',
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetTitle: {
    color: TEXT,
    fontWeight: '700',
    fontSize: IS_ANDROID ? 15 : 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  commentsList: { maxHeight: IS_ANDROID ? 280 : 340, paddingHorizontal: 14 },
  emptyComments: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30, gap: 10 },
  emptyCommentsText: { color: MUTED, fontSize: IS_ANDROID ? 13 : 14 },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: IS_ANDROID ? 10 : 12 },
  commentAvatar: {
    width: IS_ANDROID ? 34 : 38,
    height: IS_ANDROID ? 34 : 38,
    borderRadius: IS_ANDROID ? 17 : 19,
    backgroundColor: '#1a1a1a',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,120,37,0.3)',
  },
  commentTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  commentUser: { color: TEXT, fontWeight: '700', fontSize: IS_ANDROID ? 13 : 14 },
  commentTime: { color: MUTED, fontSize: IS_ANDROID ? 11 : 12 },
  commentText: {
    color: 'rgba(240,237,232,0.8)',
    fontSize: IS_ANDROID ? 13 : 14,
    lineHeight: IS_ANDROID ? 19 : 21,
  },
  commentActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  replyBtn: { paddingVertical: 2 },
  replyBtnText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: '700' },
  viewRepliesBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewRepliesText: { color: ORANGE, fontSize: IS_ANDROID ? 11 : 12, fontWeight: '600' },
  commentLikeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingLeft: 8, paddingTop: 2 },
  commentLikeCount: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  commentDivider: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' },
  replyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingLeft: 14,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,120,37,0.2)',
  },
  replyAvatar: {
    width: IS_ANDROID ? 26 : 28,
    height: IS_ANDROID ? 26 : 28,
    borderRadius: IS_ANDROID ? 13 : 14,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,120,37,0.25)',
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,120,37,0.08)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,120,37,0.15)',
  },
  replyBannerText: { flex: 1, color: 'rgba(255,255,255,0.6)', fontSize: IS_ANDROID ? 12 : 13 },
  emojiRow: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: IS_ANDROID ? 10 : 12,
    paddingBottom: IS_ANDROID ? 8 : 10,
    marginTop: 4,
  },
  emojiBtn: { paddingHorizontal: 2 },
  emojiText: { fontSize: IS_ANDROID ? 22 : 26 },
  commentInputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  commentInputGrad: {
    flex: 1,
    height: IS_ANDROID ? 46 : 50,
    borderRadius: IS_ANDROID ? 23 : 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  commentInput: {
    flex: 1,
    color: TEXT,
    paddingHorizontal: 18,
    fontSize: IS_ANDROID ? 14 : 15,
    height: '100%',
  },
  sendBtn: {
    width: IS_ANDROID ? 46 : 50,
    height: IS_ANDROID ? 46 : 50,
    borderRadius: IS_ANDROID ? 23 : 25,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
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
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    },
    singleExerciseContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    },
    singleExerciseIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    },
    singleExerciseIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    },
    singleExerciseSetsText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    },
    singleExerciseNameText: {
    color: 'rgba(240,237,232,0.86)',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    },
    exerciseCard: {
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
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
  loadMoreWrap: {
    paddingTop: 14,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadMoreText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '600',
  },
});
