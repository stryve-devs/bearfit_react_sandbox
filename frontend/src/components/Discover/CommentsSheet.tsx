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
import st, { ORANGE, MUTED, HINT, IS_ANDROID } from './styles';
import CommentLike from './CommentLike';
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
  const sheetY = useSharedValue(700);

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
              <Animated.View style={st.sendBtn} />
              <Ionicons name="arrow-up" size={IS_ANDROID ? 18 : 20} color={"#080808"} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

