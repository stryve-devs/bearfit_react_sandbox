import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { fetchPostService } from '@/api/services/fetchpost.service';
import utils from './utils';

const toLocalComment = utils.toLocalComment;
const toLocalPost = utils.toLocalPost;

export default function useDiscoverFeed() {
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

    const hydratedPosts = await Promise.all(
      initialPosts.map(async (post) => {
        if (post.exercises.length > 0) return post;
        try {
          const detail = await fetchPostService.getDiscoverPostById(post.id);
          return toLocalPost(detail.post);
        } catch (e) {
          console.warn('hydrate failed', e);
          return post;
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

  return {
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
