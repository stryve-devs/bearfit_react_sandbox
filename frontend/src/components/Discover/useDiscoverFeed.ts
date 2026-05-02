import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { fetchPostService } from '@/api/services/fetchpost.service';
import { userService } from '@/api/services/user.service';
import { useAuth } from '@/context/AuthContext';
import utils from './utils';
import api from '@/api/client';

// Convert known backend-hosted image URLs (R2, profile-pic path) into our backend proxy URL
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

const toLocalComment = utils.toLocalComment;
const toLocalPost = utils.toLocalPost;

export default function useDiscoverFeed() {
  const { user: authUser } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>({});
  const [commentDraft, setCommentDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [activeMediaByPost, setActiveMediaByPost] = useState<Record<string, number>>({});
  const [activePlaybackPostId, setActivePlaybackPostId] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadDiscoverPosts = async (reset = false) => {
    const response = await fetchPostService.getDiscoverPosts(3, reset ? undefined : nextCursor ?? undefined);
    const initialPosts = response.posts.map(toLocalPost);

    // Hydrate posts with missing exercise details and attach user profile pictures.
    const userCache: Record<string | number, any> = {};

    const hydratedPosts = await Promise.all(
      initialPosts.map(async (post) => {
        let current = post;
        try {
          if (post.exercises.length === 0) {
            const detail = await fetchPostService.getDiscoverPostById(post.id);
            current = toLocalPost(detail.post);
          }

          // Attach profile pic for the post's user by fetching user data once (cached)
          // Prefer the top-level userId; fallback to athlete.username if necessary
          const uid = current.userId ?? current.athlete?.username ?? null;
          if (uid != null && !userCache[uid]) {
            try {
              userCache[uid] = await userService.getUserById(uid);
              console.debug('[useDiscoverFeed] fetched user for uid', uid, userCache[uid]?.profile_pic_url);
            } catch (err) {
              // ignore user fetch failures — we'll keep whatever avatar exists on the post
              console.warn('Failed fetching user for post', post.id, err);
              userCache[uid] = null;
            }
          }

          const user = uid != null ? userCache[uid] : null;
          if (user && user.profile_pic_url) {
            console.debug('[useDiscoverFeed] attaching profile_pic_url to post', post.id, user.profile_pic_url);
            // Normalize athlete object to include avatarUrl field expected by components
            current = { ...current, athlete: { ...current.athlete, avatarUrl: user.profile_pic_url } };
          }

          return current;
        } catch (e) {
          console.warn('hydrate failed', e);
          return current;
        }
      }),
    );

    // Ensure an active playback post is set when we load posts.
    setActivePlaybackPostId((prev) => {
      const combined = reset ? hydratedPosts : [...posts, ...hydratedPosts];
      if (prev && combined.some((post) => post.id === prev)) {
        return prev;
      }
      return (reset ? hydratedPosts[0] : posts[0] || hydratedPosts[0])?.id ?? null;
    });

    setPosts((prev) => (reset ? hydratedPosts : [...prev, ...hydratedPosts.filter((p) => !prev.some((x) => x.id === p.id))]));

    setActiveMediaByPost((prev) => ({
      ...prev,
      ...Object.fromEntries(hydratedPosts.map((post) => [post.id, Math.min(prev[post.id] ?? 0, Math.max(0, post.media.length))])),
    }));

    setLikeCounts((prev) => ({ ...prev, ...Object.fromEntries(hydratedPosts.map((post) => [post.id, post.likesCount])) }));

    setLikedIds((prev) => {
      const next = new Set(prev);
      for (const post of hydratedPosts) if (post.likedByMe) next.add(post.id);
      return next;
    });

    setCommentsByPost((prev) => ({
      ...prev,
      ...Object.fromEntries(hydratedPosts.map((post) => [post.id, (Array.isArray(post.comments) ? post.comments : []).map(toLocalComment)])),
    }));

    setNextCursor(response.nextCursor);
    setHasMore(response.nextCursor !== null && hydratedPosts.length > 0);
  };

  const loadMoreDiscoverPosts = async () => {
    if (isLoadingMore || !hasMore || !nextCursor) return;
    setIsLoadingMore(true);
    try {
      await loadDiscoverPosts(false);
    } catch (e) {
      console.error('load more failed', e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadDiscoverPosts(true).catch((e) => console.error(e));
  }, []);

  const toggleLike = async (id: string) => {
    const wasLiked = likedIds.has(id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setLikeCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + (wasLiked ? -1 : 1)) }));

    try {
      const result = await fetchPostService.togglePostLike(id);
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (result.liked) next.add(id); else next.delete(id);
        return next;
      });
      setLikeCounts((c) => ({ ...c, [id]: result.likesCount }));
    } catch (e) {
      console.error('toggle like failed', e);
      setLikedIds((prev) => {
        const next = new Set(prev);
        wasLiked ? next.add(id) : next.delete(id);
        return next;
      });
    }
  };

  const openComments = (postId: string, setOpen: (v: boolean) => void, setActivePostId: (id: string | null) => void) => {
    setActivePostId(postId);
    setCommentDraft('');
    setReplyingTo(null);
    setOpen(true);
  };

  const likeComment = (postId: string, commentId: string) => {
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? []).map((c) => (c.id === commentId ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c)),
    }));
  };

  const likeReply = (postId: string, commentId: string, replyId: string) => {
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? []).map((c) => (c.id === commentId ? { ...c, replies: c.replies.map((r: any) => (r.id === replyId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r)) } : c)),
    }));
  };

  const toggleReplies = (postId: string, commentId: string) => {
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? []).map((c) => (c.id === commentId ? { ...c, showReplies: !c.showReplies } : c)),
    }));
  };

  const sendComment = async (activePostId: string | null) => {
    if (!activePostId || !commentDraft.trim()) return;
    const text = commentDraft.trim();
    try {
      const response = await fetchPostService.createPostComment(activePostId, text, replyingTo?.commentId);
      const postedComment = toLocalComment(response.comment);
      // Treat pravatar placeholders as invalid for optimistic UI — force hydration
      try {
        const av = String(postedComment.avatarUrl || postedComment.avatar || '') || '';
        if (av.toLowerCase().includes('pravatar.cc') || av.toLowerCase().includes('i.pravatar.cc')) {
          console.debug('[useDiscoverFeed] sendComment: backend returned pravatar placeholder, treating as missing', av);
          postedComment.avatarUrl = null;
          postedComment.avatar = null;
        }
      } catch (e) {}

      // If the API did not include an avatarUrl for the commenter (common),
      // try to hydrate it from the current user's profile so the new comment
      // immediately shows the correct profile image without a refresh.
      // Helper: given a raw URL or profile_pic_key from auth user, return proxied URL or null.
      const resolveAuthUserAvatar = (cached: any) => {
        try {
          const cachedUrl = cached?.profile_pic_url ?? cached?.profile_picUrl ?? null;
          if (cachedUrl) {
            const CL = String(cachedUrl).toLowerCase();
            if (CL.includes('pravatar.cc') || CL.includes('i.pravatar.cc')) return null;
            return proxifyIfNeeded(cachedUrl);
          }
          if (cached?.profile_pic_key) {
            return `${api.defaults.baseURL.replace(/\/$/, '')}/uploads/proxy?key=${encodeURIComponent(String(cached.profile_pic_key))}`;
          }
        } catch (e) {}
        return null;
      };

      if ((!postedComment.avatarUrl || postedComment.avatarUrl === null) && authUser) {
        try {
          // Prefer cached profile_pic_url present on the stored auth user
          const cached: any = (authUser as any) || {};
          const candidate = resolveAuthUserAvatar(cached);
          if (candidate) {
            postedComment.avatarUrl = candidate;
            postedComment.avatar = postedComment.avatar || candidate;
            if (Array.isArray(postedComment.replies)) {
              postedComment.replies = postedComment.replies.map((r: any) => {
                const rCandidate = r.avatarUrl || r.avatar || candidate;
                return { ...r, avatarUrl: r.avatarUrl || proxifyIfNeeded(rCandidate), avatar: r.avatar || proxifyIfNeeded(rCandidate) };
              });
            }
            console.debug('[useDiscoverFeed] sendComment: hydrated from cachedUrl (or key)', candidate, postedComment);
          } else {
            // Fall back to fetching the user record if cached info isn't available
            try {
              console.debug('[useDiscoverFeed] sendComment: falling back to userService.getUserById for', cached.user_id ?? cached.username ?? String(cached));
              const me = await userService.getUserById(cached.user_id ?? cached.username ?? String(cached));
              const meCandidate = resolveAuthUserAvatar(me);
              if (meCandidate) {
                postedComment.avatarUrl = meCandidate;
                postedComment.avatar = postedComment.avatar || meCandidate;
                if (Array.isArray(postedComment.replies)) {
                  postedComment.replies = postedComment.replies.map((r: any) => ({ ...r, avatarUrl: r.avatarUrl || proxifyIfNeeded(r.avatar || r.avatarUrl || meCandidate), avatar: r.avatar || proxifyIfNeeded(r.avatar || r.avatarUrl || meCandidate) }));
                }
                console.debug('[useDiscoverFeed] sendComment: hydrated from userService.getUserById', meCandidate, postedComment);
              }
            } catch (err) {
              // ignore
            }
          }
        } catch (err) {
          // ignore hydration failures — fall back to whatever the API returned
          console.warn('Failed to hydrate posted comment avatar', err);
        }
      }

      // Debug: log final avatar URL before inserting optimistic comment
      console.debug('[useDiscoverFeed] sendComment: final postedComment.avatarUrl', postedComment.avatarUrl);
      if (replyingTo) {
        setCommentsByPost((prev) => ({
          ...prev,
          [activePostId]: (prev[activePostId] ?? []).map((c) => (c.id === replyingTo.commentId ? { ...c, replies: [...c.replies, { ...postedComment, replies: [] }], showReplies: true } : c)),
        }));
      } else {
        setCommentsByPost((prev) => ({ ...prev, [activePostId]: [...(prev[activePostId] ?? []), postedComment] }));
      }
      setCommentDraft('');
      setReplyingTo(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error('create comment failed', e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const toggleFollowUser = async (targetUserId: number | string, username?: string) => {
    const key = username ?? String(targetUserId);
    const currentlyFollowing = followedIds.has(key);

    // Optimistic update
    setFollowedIds((prev) => {
      const next = new Set(prev);
      currentlyFollowing ? next.delete(key) : next.add(key);
      return next;
    });

    try {
      const res = currentlyFollowing ? await userService.unfollowUser(targetUserId) : await userService.followUser(targetUserId);
      const isFollowing = res?.isFollowing ?? !currentlyFollowing;
      // Ensure final state matches server
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.add(key); else next.delete(key);
        return next;
      });
      return isFollowing;
    } catch (err) {
      // Rollback optimistic
      setFollowedIds((prev) => {
        const next = new Set(prev);
        currentlyFollowing ? next.add(key) : next.delete(key);
        return next;
      });
      console.error('toggleFollowUser failed', err);
      throw err;
    }
  };

  return {
    posts,
    likedIds,
    savedIds,
    followedIds,
    toggleFollowUser,
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
    hasMore,
    nextCursor,
    setNextCursor,
    toggleLike,
    openComments,
    likeComment,
    likeReply,
    toggleReplies,
    sendComment,
    setSavedIds,
    setFollowedIds,
  };
}
