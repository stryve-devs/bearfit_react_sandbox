import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image, ScrollView, Pressable, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import st, { ORANGE, ORANGE2, IS_ANDROID, SCREEN_WIDTH } from './styles';
import { MediaSlide } from './MediaSlide';
import FollowButton from './FollowButton';
import LikeButton from './LikeButton';
import { Ionicons } from '@expo/vector-icons';
import useResolvedImageUri from '@/hooks/useResolvedImageUri';
import AvatarImage from '@/components/common/AvatarImage';

function MediaProgressDot({
  index,
  scrollX,
  slideWidth,
}: {
  index: number;
  scrollX: SharedValue<number>;
  slideWidth: number;
}) {
  const animStyle = useAnimatedStyle(() => {
    const widthBase = 5;
    const widthActive = 14;
    const safeWidth = slideWidth > 0 ? slideWidth : 1;
    const page = scrollX.value / safeWidth;
    const dist = Math.abs(page - index);

    return {
      width: interpolate(dist, [0, 1], [widthActive, widthBase], Extrapolation.CLAMP),
      opacity: interpolate(dist, [0, 1], [1, 0.45], Extrapolation.CLAMP),
      backgroundColor: dist < 0.5 ? ORANGE : 'rgba(255,255,255,0.30)',
    };
  });

  return <Animated.View style={[st.mediaDot, animStyle]} />;
}

export default function PostCard({
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
  currentUserId,
}: any) {
  const isOwnPost = currentUserId != null && Number(item.userId) === Number(currentUserId);
  const mediaCount = item.media.length;
  const totalSlides = mediaCount + 1;
  const safeMediaIndex = Math.min(Math.max(0, activeMediaIndex), Math.max(0, totalSlides - 1));
  const [mediaWidth, setMediaWidth] = useState(0);
  const slideWidth = mediaWidth || SCREEN_WIDTH - 56;
  const scrollX = useSharedValue(0);

  const onMediaScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (totalSlides <= 1) return;
    const measuredWidth = event.nativeEvent.layoutMeasurement.width || slideWidth;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / measuredWidth);
    const clampedIndex = Math.min(Math.max(0, nextIndex), totalSlides - 1);
    if (clampedIndex !== safeMediaIndex) {
      onMediaIndexChange(clampedIndex);
    }
  };
  const onMediaScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const cardScale = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));
  const saveScale = useSharedValue(1);
  const saveStyle = useAnimatedStyle(() => ({ transform: [{ scale: saveScale.value }] }));

  const pressSave = () => {
    // lightweight haptics
    (async () => {})();
    saveScale.value = withSequence(
      withTiming(0.75, { duration: 80 }),
      withTiming(1, { duration: 150 })
    );
    onSave();
  };

  const likedByName = item.likedByUsername;
  const captionText = typeof item.caption === 'string' ? item.caption.trim() : '';
  const likedByAvatars = (
    item.likedByAvatarUrls && item.likedByAvatarUrls.length > 0
      ? item.likedByAvatarUrls
      : likeCount > 1
        ? [item.athlete.avatarUrl, item.athlete.avatarUrl]
        : [item.athlete.avatarUrl]
  ).slice(0, 2);

  // Resolve avatar URL robustly using shared hook
  const { resolvedUri: avatarResolvedUri } = useResolvedImageUri(item?.athlete?.avatarUrl);

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
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
            colors={['rgba(255,255,255,0.045)', 'rgba(255,255,255,0.015)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={st.card}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.06)', 'transparent']}
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
                  <AvatarImage src={avatarResolvedUri || item?.athlete?.avatarUrl} style={st.avatar} skipResolve={!!avatarResolvedUri} />
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
              {!isOwnPost && (
                <>
                  <FollowButton followed={isFollowed} onPress={onFollow} />
                  <View style={{ width: 8 }} />
                </>
              )}
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

            <View
              style={st.imageWrap}
              onLayout={(event) => setMediaWidth(event.nativeEvent.layout.width)}
            >
              <Animated.ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onMediaScroll}
                scrollEventThrottle={16}
                onMomentumScrollEnd={onMediaScrollEnd}
              >
                {item.media.map((media: any, mediaIndex: number) => (
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
                    (item.exercises || []).length === 1 && st.exerciseSlideSingle,
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
                          {(item.exercises[0]).name.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </Text>
                      </View>
                    ) : (
                      <>
                        {(item.exercises || []).slice(0, 3).map((exercise: any, exerciseIndex: number) => (
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
                              {exercise.name.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
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
              </Animated.ScrollView>
            </View>

            {totalSlides > 1 && (
              <View style={st.mediaDotsRow}>
                {Array.from({ length: totalSlides }).map((_, mediaIndex) => (
                  <MediaProgressDot
                    key={`${item.id}-dot-${mediaIndex}`}
                    index={mediaIndex}
                    scrollX={scrollX}
                    slideWidth={slideWidth}
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
              <TouchableOpacity onPress={() => {}} activeOpacity={0.7} style={st.shareBtn}>
                <Ionicons
                  name="arrow-redo-outline"
                  size={IS_ANDROID ? 18 : 20}
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>
            </View>

            {likeCount > 0 && (
              <View style={st.likesCountRow}>
                <Text allowFontScaling={false} style={st.likesCountText}>
                  {likeCount.toLocaleString()} likes
                </Text>
              </View>
            )}

            {!!captionText && (
              <View style={st.captionRow}>
                <Text allowFontScaling={false} numberOfLines={2} style={st.captionInline}>
                  <Text style={st.captionUser}>{item.athlete.username}</Text> {captionText}
                </Text>
              </View>
            )}

            {likeCount > 0 && likedByName && (
              <View style={st.likedByRow}>
                {likedByAvatars.map((avatarUrl: string | null, idx: number) => (
                  <View key={`${item.id}-liked-avatar-${idx}`} style={idx > 0 ? { marginLeft: -8 } : undefined}>
                    <AvatarImage src={avatarUrl ?? null} style={st.tinyAvatar} skipResolve={false} />
                  </View>
                ))}
                <Text allowFontScaling={false} numberOfLines={1} style={st.likedByText}>
                  Liked by <Text style={{ color: 'White', fontWeight: '700' }}>{likedByName}</Text>
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
