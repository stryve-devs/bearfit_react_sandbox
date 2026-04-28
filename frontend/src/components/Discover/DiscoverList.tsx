import React, { useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import PostCard from './PostCard';
import st from './styles';

export default function DiscoverList({
  posts,
  filteredPosts,
  activeMediaByPost,
  activePlaybackPostId,
  isScreenFocused,
  likedIds,
  savedIds,
  followedIds,
  likeCounts,
  commentsByPost,
  loadMoreDiscoverPosts,
  isLoadingMore,
  openComments,
  toggleLike,
  setSavedIds,
  setFollowedIds,
  setActiveMediaByPost,
  router,
  currentUserId,
  onViewableItemsChanged,
  viewabilityConfig,
}: any) {
  const defaultViewConfig = { itemVisiblePercentThreshold: 60, minimumViewTime: 120 };

  const handleViewableItemsChanged = useCallback(
    (info: any) => {
      console.log('[DiscoverList] onViewableItemsChanged:', info?.viewableItems?.map((v: any) => v.item?.id));
      if (typeof onViewableItemsChanged === 'function') {
        onViewableItemsChanged(info);
        return;
      }
      // if a ref object was passed, call the current function
      if (onViewableItemsChanged && typeof onViewableItemsChanged.current === 'function') {
        onViewableItemsChanged.current(info);
      }
    },
    [onViewableItemsChanged]
  );

  return (
    <FlatList
      contentContainerStyle={st.list}
      data={filteredPosts}
      extraData={activePlaybackPostId}
      keyExtractor={(item: any) => item.id}
      showsVerticalScrollIndicator={false}
      // keep items mounted to improve video autoplay reliability
      removeClippedSubviews={false}
      windowSize={7}
      initialNumToRender={3}
      maxToRenderPerBatch={6}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={viewabilityConfig ?? defaultViewConfig}
      onEndReached={loadMoreDiscoverPosts}
      onEndReachedThreshold={0.55}
      ListFooterComponent={
        isLoadingMore ? (
          <View style={st.loadMoreWrap}>
            <ActivityIndicator size="small" color={st ? (st.activeDot ? '#FFA500' : '#FFA500') : '#FFA500'} />
            <Text allowFontScaling={false} style={st.loadMoreText}>
              Loading more posts...
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item, index }: any) => (
        <PostCard
          item={item}
          index={index}
          activeMediaIndex={activeMediaByPost[item.id] ?? 0}
          isPostActive={activePlaybackPostId === item.id}
          isScreenFocused={isScreenFocused}
          isLiked={likedIds.has(item.id)}
          isSaved={savedIds.has(item.id)}
          isFollowed={followedIds.has(item.athlete.username)}
          likeCount={likeCounts[item.id] ?? 0}
          commentCount={commentsByPost[item.id]?.length ?? item.commentsCount}
          onLike={() => toggleLike(item.id)}
          onSave={() =>
            setSavedIds((prev: Set<string>) => {
              const n = new Set(prev);
              n.has(item.id) ? n.delete(item.id) : n.add(item.id);
              return n;
            })
          }
          onFollow={() =>
            setFollowedIds((prev: Set<string>) => {
              const n = new Set(prev);
              n.has(item.athlete.username) ? n.delete(item.athlete.username) : n.add(item.athlete.username);
              return n;
            })
          }
          onComment={() => openComments(item.id)}
          onMediaPress={(mediaIndex: number) => {
            const media = item.media[mediaIndex];
            if (!media || media.type !== 'IMAGE') return;
            router.push({ pathname: '/(tabs)/home/full-image', params: { imageUrl: media.url, caption: item.caption, username: item.athlete.username } });
          }}
          onMediaIndexChange={(mediaIndex: number) => setActiveMediaByPost((prev: any) => ({ ...prev, [item.id]: mediaIndex }))}
          onMoreExercisesPress={() => router.push({ pathname: '/(tabs)/home/exercises', params: { postId: item.id } })}
          onPress={() => router.push({ pathname: '/(tabs)/home/post-detail', params: { postId: item.id } })}
          // Navigate to the app's existing `userid` route so the profile screen resolves correctly
          onAvatarPress={() =>
            router.push({
              pathname: '/(tabs)/home/userid',
              params: { userId: item.athlete.username, name: item.athlete.name, image: item.athlete.avatarUrl },
            })
          }
          currentUserId={currentUserId}
        />
      )}
    />
  );
}
