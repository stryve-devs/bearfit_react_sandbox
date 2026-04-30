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
import { authService } from '@/api/services/auth.service';
import { fetchPostService } from '@/api/services/fetchpost.service';
import { DiscoverComment } from '@/types/fetchpost.types';
import useDiscoverFeed from '@/components/Discover/useDiscoverFeed';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/client';

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
    toggleFollowUser,
  } = useDiscoverFeed();

  // Initialize followedIds from server-side profile data so follow buttons reflect real state
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!currentUser) return;
      try {
        const profile = await authService.getMeProfile();
        if (!mounted) return;
        const following = profile?.following || [];
        const usernames = new Set<string>(following.map((f: any) => f.username).filter(Boolean));
        setFollowedIds((prev) => {
          // merge with any existing followedIds
          const next = new Set(prev);
          for (const u of usernames) next.add(u);
          return next;
        });
      } catch (err) {
        console.warn('[DiscoverScreen] Failed to initialize followedIds', err);
      }
    })();
    return () => { mounted = false; };
  }, [currentUser]);

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
    return posts.filter((p: Post) => `${p.athlete.name} ${p.athlete.username} ${p.caption}`.toLowerCase().includes(q));
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

  // Avatar resolution cache & map (postId -> resolved avatar URI)
  const resolvedAvatarCacheRef = useRef<Record<string, string>>({});
  const [avatarUriByPostId, setAvatarUriByPostId] = useState<Record<string, string>>({});

  // Resolve avatar URLs for posts: try original, encoded variants, then backend proxy fallback
  useEffect(() => {
    let mounted = true;
    if (!posts || posts.length === 0) return;

    const tryFetch = async (url: string) => {
      try {
        const res = await fetch(url, { method: 'GET' });
        return res.ok;
      } catch (err) {
        return false;
      }
    };

    (async () => {
      for (const p of posts) {
        try {
          const orig = p?.athlete?.avatarUrl;
          if (!orig) continue;

          // If we already have a resolved entry for this exact source URL, reuse it
          if (resolvedAvatarCacheRef.current[orig]) {
            if (mounted) setAvatarUriByPostId((prev: Record<string, string>) => ({ ...prev, [p.id]: resolvedAvatarCacheRef.current[orig] }));
            continue;
          }

          // Build proxy base if available
          const proxyBase = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') + '/uploads/proxy' : null;
          if (proxyBase && orig.startsWith(proxyBase)) {
            resolvedAvatarCacheRef.current[orig] = orig;
            if (mounted) setAvatarUriByPostId((prev: Record<string, string>) => ({ ...prev, [p.id]: orig }));
            console.debug('[DiscoverScreen] resolved (proxyBase) ', orig, '->', orig);
            continue;
          }

          // 1) try original
          if (await tryFetch(orig)) {
            resolvedAvatarCacheRef.current[orig] = orig;
            if (mounted) setAvatarUriByPostId((prev: Record<string, string>) => ({ ...prev, [p.id]: orig }));
            console.debug('[DiscoverScreen] resolved (original) ', orig, '->', orig);
            continue;
          }

          // 2) encodeURI
          const enc1 = encodeURI(orig);
          if (enc1 !== orig && await tryFetch(enc1)) {
            resolvedAvatarCacheRef.current[orig] = enc1;
            if (mounted) setAvatarUriByPostId((prev: Record<string, string>) => ({ ...prev, [p.id]: enc1 }));
            console.debug('[DiscoverScreen] resolved (encodeURI) ', orig, '->', enc1);
            continue;
          }

          // 3) per-segment encode
          const parts = orig.split('/');
          const encParts = parts.map((s: string) => encodeURIComponent(s));
          const enc2 = encParts.join('/');
          if (enc2 !== orig && await tryFetch(enc2)) {
            resolvedAvatarCacheRef.current[orig] = enc2;
            if (mounted) setAvatarUriByPostId((prev: Record<string, string>) => ({ ...prev, [p.id]: enc2 }));
            console.debug('[DiscoverScreen] resolved (encodeURIComponent) ', orig, '->', enc2);
            continue;
          }

          // 4) fallback to backend proxy once
          if (proxyBase) {
            const proxyUrl = `${proxyBase}?url=${encodeURIComponent(orig)}`;
            resolvedAvatarCacheRef.current[orig] = proxyUrl;
            if (mounted) setAvatarUriByPostId((prev: Record<string, string>) => ({ ...prev, [p.id]: proxyUrl }));
            console.debug('[DiscoverScreen] resolved (proxy fallback) ', orig, '->', proxyUrl);
            continue;
          }
        } catch (err) {
          // ignore per-post errors and leave original avatar in place
          console.error('Failed resolving avatar for post', p?.id, err);
        }
      }
    })();

    return () => { mounted = false; };
  }, [posts]);

  // Derived posts where athlete.avatarUrl is replaced with resolved avatar URI when available
  const derivedPosts = useMemo(() => {
    if (!posts) return posts;
    return posts.map((p: Post) => {
      const resolved = avatarUriByPostId[p.id];
      if (resolved) return { ...p, athlete: { ...p.athlete, avatarUrl: resolved } };
      return p;
    });
  }, [posts, avatarUriByPostId]);

  const derivedFilteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return derivedPosts;
    return derivedPosts.filter((p: Post) => `${p.athlete.name} ${p.athlete.username} ${p.caption}`.toLowerCase().includes(q));
  }, [query, derivedPosts]);

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
          posts={derivedPosts}
          filteredPosts={derivedFilteredPosts}
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
          toggleFollowUser={toggleFollowUser}
          setActiveMediaByPost={setActiveMediaByPost}
          router={router}
          currentUserId={currentUserId}
          onViewableItemsChanged={onViewableItemsChangedRef.current}
          viewabilityConfig={viewabilityConfigRef.current}
        />

        <DiscoverMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />

        <DiscoverSearch visible={searchOpen} query={query} setQuery={setQuery} filteredPosts={derivedFilteredPosts} onClose={() => setSearchOpen(false)} onOpenPost={(id: string) => { setSearchOpen(false); setQuery(''); setActivePlaybackPostId(null); router.push({ pathname: '/(tabs)/home/post-detail', params: { postId: id } }); }} />

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
