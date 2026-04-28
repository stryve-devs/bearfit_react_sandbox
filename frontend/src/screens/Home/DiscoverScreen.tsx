import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StatusBar, Dimensions, Platform, ActivityIndicator } from 'react-native';
import type { ViewToken } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { AppColors } from '@/constants/colors';
import { fetchPostService } from '@/api/services/fetchpost.service';
import { DiscoverComment } from '@/types/fetchpost.types';
import useDiscoverFeed from '@/components/Discover/useDiscoverFeed';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useAuth } from '@/context/AuthContext';

// New imports: small components and utils extracted from this file
import CommentsSheet from '@/components/Discover/CommentsSheet';
import Header from '@/components/Discover/Header';
import DiscoverMenu from '@/components/Discover/DiscoverMenu';
import DiscoverSearch from '@/components/Discover/DiscoverSearch';
import DiscoverList from '@/components/Discover/DiscoverList';
import utils from '@/components/Discover/utils';
import st from '@/components/Discover/styles';

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
  userId: number;
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

const SCREEN_WIDTH = Dimensions.get('window').width;

const ATHLETES: Athlete[] = [
  { name: 'Alex', username: 'alexfit', avatarUrl: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Maya', username: 'mayalifts', avatarUrl: 'https://i.pravatar.cc/150?img=32' },
  { name: 'Noah', username: 'noahrun', avatarUrl: 'https://i.pravatar.cc/150?img=56' },
  { name: 'Sara', username: 'sarahit', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
];

const QUICK_EMOJIS = ['💪', '🔥', '👏', '🏋️', '👊', '🥵', '🏆'];

const toLocalComment = utils.toLocalComment;
const toLocalPost = utils.toLocalPost;
const resolveExerciseIcon = utils.resolveExerciseIcon;
const makeInitialComments = utils.makeInitialComments;

// NOTE: Exercise asset constants and helpers were moved to components/Discover/utils.ts
// and are no longer defined here to avoid duplication and keep this file focused.

const POSTS: Post[] = [];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const isScreenFocused = useIsFocused();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.user_id ?? null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const {
    posts,
    likedIds,
    savedIds,
    followedIds,
    likeCounts,
    commentsByPost,
    commentDraft,
    setCommentDraft,
    replyingTo,
    setReplyingTo,
    activeMediaByPost,
    setActiveMediaByPost,
    activePlaybackPostId,
    setActivePlaybackPostId,
    loadDiscoverPosts,
    loadMoreDiscoverPosts,
    isLoadingMore,
    toggleLike,
    likeComment,
    likeReply,
    toggleReplies,
    sendComment,
    setSavedIds,
    setFollowedIds,
  } = useDiscoverFeed();

  const viewabilityConfigRef = useRef({ itemVisiblePercentThreshold: 60, minimumViewTime: 120 });

  const onViewableItemsChangedRef = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems?.[0]?.item as Post | undefined;
      if (firstVisible?.id) {
        // Debug log to confirm viewability changes at runtime
        // (check Metro logs to verify this prints when scrolling)
        console.log('Discover viewable first:', firstVisible.id);
        setActivePlaybackPostId(firstVisible.id);
      }
    },
  );

  useEffect(() => {
    // loadDiscoverPosts is called inside the hook on mount
  }, []);

  useEffect(() => {
    if (!isScreenFocused) {
      // Pause all feed videos when this screen is not focused.
      setActivePlaybackPostId(null);
    }
  }, [isScreenFocused]);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => `${p.athlete.name} ${p.athlete.username} ${p.caption}`.toLowerCase().includes(q));
  }, [query, posts]);

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

  const activeComments = activePostId ? (commentsByPost[activePostId] ?? []) : [];

  const handleSyncPress = async () => {
    if (isSyncing) return;
    Haptics.selectionAsync();
    setIsSyncing(true);
    try {
      await loadDiscoverPosts(true);
    } catch (error) {
      console.error('Failed syncing discover posts:', error);
    } finally {
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
      <LinearGradient colors={['rgba(255,100,20,0.05)', 'transparent']} start={{ x: 1, y: 0 }} end={{ x: 0.3, y: 0.4 }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} pointerEvents="none" />

      <SafeAreaView style={st.safe} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <Header onOpenMenu={() => setMenuOpen(true)} onSearchOpen={() => setSearchOpen(true)} onSyncPress={handleSyncPress} isSyncing={isSyncing} />

        <DiscoverList
          posts={posts}
          filteredPosts={filteredPosts}
          activeMediaByPost={activeMediaByPost}
          activePlaybackPostId={activePlaybackPostId}
          isScreenFocused={isScreenFocused}
          likedIds={likedIds}
          savedIds={savedIds}
          followedIds={followedIds}
          likeCounts={likeCounts}
          commentsByPost={commentsByPost}
          loadMoreDiscoverPosts={loadMoreDiscoverPosts}
          isLoadingMore={isLoadingMore}
          openComments={openComments}
          toggleLike={toggleLike}
          setSavedIds={setSavedIds}
          setFollowedIds={setFollowedIds}
          setActiveMediaByPost={setActiveMediaByPost}
          router={router}
          currentUserId={currentUserId}
          onViewableItemsChanged={onViewableItemsChangedRef.current}
          viewabilityConfig={viewabilityConfigRef.current}
        />

        <DiscoverMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />

        <DiscoverSearch visible={searchOpen} query={query} setQuery={setQuery} filteredPosts={filteredPosts} onClose={() => setSearchOpen(false)} onOpenPost={(id: string) => { setSearchOpen(false); setQuery(''); setActivePlaybackPostId(null); router.push({ pathname: '/(tabs)/home/post-detail', params: { postId: id } }); }} />

        <CommentsSheet
          visible={commentsOpen}
          activeComments={activeComments}
          commentDraft={commentDraft}
          setCommentDraft={setCommentDraft}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          sendComment={() => sendComment(activePostId)}
          likeComment={likeComment}
          likeReply={likeReply}
          toggleReplies={toggleReplies}
          close={closeComments}
          activePostId={activePostId}
          quickEmojis={QUICK_EMOJIS}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
