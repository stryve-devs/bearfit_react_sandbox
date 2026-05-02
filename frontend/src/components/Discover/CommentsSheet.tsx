import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import st, { ORANGE, MUTED, HINT, IS_ANDROID, BG } from './styles';
import AvatarImage from '@/components/common/AvatarImage';
import CommentLike from './CommentLike';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/client';
import type { Dispatch, SetStateAction } from 'react';

type Reply = {
  id: string;
  user: string;
  avatarUrl: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
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

interface Props {
  visible: boolean;
  activeComments: Comment[];
  commentDraft: string;
  setCommentDraft: Dispatch<SetStateAction<string>>;
  replyingTo: { commentId: string; user: string } | null;
  setReplyingTo: (r: { commentId: string; user: string } | null) => void;
  sendComment: () => Promise<void> | void;
  likeComment: (postId: string, commentId: string) => void;
  likeReply: (postId: string, commentId: string, replyId: string) => void;
  toggleReplies: (postId: string, commentId: string) => void;
  close: () => void;
  activePostId: string | null;
  quickEmojis: string[];
}

export default function CommentsSheet({
  visible,
  activeComments,
  commentDraft,
  setCommentDraft,
  replyingTo,
  setReplyingTo,
  sendComment,
  likeComment,
  likeReply,
  toggleReplies,
  close,
  activePostId,
  quickEmojis,
}: Props) {
  const { user: authUser } = useAuth();
  const sheetY = useSharedValue(700);

  useEffect(() => {
    // Debug: log activeComments snapshot whenever the sheet mounts or activeComments changes
    console.debug('[CommentsSheet] activeComments snapshot', activeComments?.map((c: any) => ({ id: c.id, avatarUrl: c.avatarUrl, avatar: (c as any).avatar, text: c.text })));
  }, [activeComments]);

  useEffect(() => {
    sheetY.value = visible
      ? withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) })
      : withTiming(700, { duration: 280, easing: Easing.in(Easing.cubic) });
  }, [visible]);

  const sheetAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }] }));

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={st.backdrop} onPress={close} />
      <KeyboardAvoidingView behavior={IS_ANDROID ? 'height' : 'padding'} style={st.sheetKav}>
        <Animated.View style={[st.commentsSheet, sheetAnimStyle]}>
          <View style={st.sheetHandle} />
          <Text allowFontScaling={false} style={st.sheetTitle}>
            Comments
          </Text>

          <ScrollView style={st.commentsList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                    {/* Prefer comment.avatarUrl/avatar, then fall back to current authenticated user's cached profile pic */}
                    {(() => {
                      const fallback = (authUser as any)?.profile_pic_url ?? (authUser as any)?.profile_picUrl ?? (authUser as any)?.profile_pic_key ? `${api.defaults.baseURL.replace(/\/$/, '')}/uploads/proxy?key=${encodeURIComponent(String((authUser as any).profile_pic_key))}` : null;
                      let avatarSrc = c.avatarUrl ?? (c as any).avatar ?? fallback ?? undefined;
                      // never accept dev placeholder providers (pravatar) as valid avatars
                      try {
                        const L = String(avatarSrc || '').toLowerCase();
                        if (L.includes('pravatar.cc') || L.includes('i.pravatar.cc')) {
                          avatarSrc = null as any;
                        }
                      } catch (err) {}
                      // If this looks like a backend-hosted (R2) URL, prefer routing it through our proxy
                      // so the native Image doesn't fail due to CORS or signed URL nuances.
                      const proxyBase = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') + '/uploads/proxy?url=' : null;
                      let finalSrc = avatarSrc;
                      if (avatarSrc && proxyBase && (avatarSrc.includes('.r2.dev') || avatarSrc.includes('/profile/profile-pic/'))) {
                        finalSrc = `${proxyBase}${encodeURIComponent(avatarSrc)}`;
                        console.debug('[CommentsSheet] proxying avatar for comment', { commentId: c.id, avatarSrc, proxied: finalSrc });
                      } else {
                        console.debug('[CommentsSheet] rendering avatar for comment', { commentId: c.id, avatarSrc });
                      }
                      return <AvatarImage src={finalSrc} style={st.commentAvatar} />;
                    })()}
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
                          <TouchableOpacity onPress={() => activePostId && toggleReplies(activePostId, c.id)} style={st.viewRepliesBtn}>
                            <Ionicons name={c.showReplies ? 'chevron-up' : 'chevron-down'} size={11} color={ORANGE} />
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
                            {(() => {
                              const fallback = (authUser as any)?.profile_pic_url ?? (authUser as any)?.profile_picUrl ?? (authUser as any)?.profile_pic_key ? `${api.defaults.baseURL.replace(/\/$/, '')}/uploads/proxy?key=${encodeURIComponent(String((authUser as any).profile_pic_key))}` : null;
                              let avatarSrc = r.avatarUrl ?? (r as any).avatar ?? fallback ?? undefined;
                              try {
                                const L = String(avatarSrc || '').toLowerCase();
                                if (L.includes('pravatar.cc') || L.includes('i.pravatar.cc')) avatarSrc = null as any;
                              } catch (err) {}
                              const proxyBase = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/$/, '') + '/uploads/proxy?url=' : null;
                              let finalSrc = avatarSrc;
                              if (avatarSrc && proxyBase && (avatarSrc.includes('.r2.dev') || avatarSrc.includes('/profile/profile-pic/'))) {
                                finalSrc = `${proxyBase}${encodeURIComponent(avatarSrc)}`;
                                console.debug('[CommentsSheet] proxying avatar for reply', { replyId: r.id, avatarSrc, proxied: finalSrc });
                              } else {
                                console.debug('[CommentsSheet] rendering avatar for reply', { replyId: r.id, avatarSrc });
                              }
                              return <AvatarImage src={finalSrc} style={st.replyAvatar} />;
                            })()}
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
                    <CommentLike liked={c.liked} count={c.likes} onPress={() => activePostId && likeComment(activePostId, c.id)} />
                  </View>
                  {idx < activeComments.length - 1 && <View style={st.commentDivider} />}
                </Animated.View>
              ))
            )}
          </ScrollView>

          <View style={st.emojiRow}>
            {quickEmojis.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => {
                  Haptics.selectionAsync();
                  // annotate prev type to avoid implicit any in some TS environments
                  setCommentDraft((prev: string) => `${prev}${emoji}`);
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
            <Animated.View style={st.commentInputGrad}>
              <TextInput
                value={commentDraft}
                onChangeText={setCommentDraft}
                placeholder={replyingTo ? `Reply to @${replyingTo.user}...` : 'Add a comment...'}
                placeholderTextColor={HINT}
                style={st.commentInput}
                allowFontScaling={false}
                selectionColor={ORANGE}
              />
            </Animated.View>
            <TouchableOpacity
              onPress={sendComment}
              activeOpacity={0.8}
              style={[st.sendBtn, !commentDraft.trim() && { opacity: 0.4 }]}
              disabled={!commentDraft.trim()}
            >
              {/* icon sits on the orange circular button; use BG color so it contrasts */}
              <Ionicons name="arrow-up" size={IS_ANDROID ? 18 : 20} color={BG} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
