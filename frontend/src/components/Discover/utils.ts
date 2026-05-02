import { EXPO_DEV } from 'expo-constants';
import { DiscoverComment, DiscoverPost } from '@/types/fetchpost.types';

export type Athlete = { name: string; username: string; avatarUrl: string };
export type Reply = { id: string; user: string; avatarUrl: string; text: string; time: string; likes: number; liked: boolean };
export type Comment = { id: string; user: string; avatarUrl: string; text: string; time: string; likes: number; liked: boolean; replies: Reply[]; showReplies: boolean };
export type Post = {
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

export const EXERCISE_ASSET_BASE = 'https://pub-d0fbe48b068b460e96f026d1d9fe3c68.r2.dev/exercises';
const localExerciseRecords = require('../../constants/exercise-data.json') as { name: string; image?: string }[];
const exerciseImageByName = new Map<string, string>();
for (const record of localExerciseRecords) {
  if (!record?.name || !record?.image) continue;
  exerciseImageByName.set(record.name.trim().toLowerCase(), record.image);
}

export const toLocalComment = (comment: DiscoverComment): Comment => ({
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

const resolveExerciseAssetUrl = (pathLike?: string): string | undefined => {
  if (!pathLike) return undefined;
  if (pathLike.startsWith('http://') || pathLike.startsWith('https://')) {
    return pathLike;
  }
  const normalizedPath = pathLike.startsWith('/') ? pathLike.slice(1) : pathLike;
  return `${EXERCISE_ASSET_BASE}/${normalizedPath}`;
};

export const resolveExerciseIcon = (name: string, imagePath?: string): string | undefined => {
  const fromPost = resolveExerciseAssetUrl(imagePath);
  if (fromPost) return fromPost;

  const localPath = exerciseImageByName.get(name.trim().toLowerCase());
  return resolveExerciseAssetUrl(localPath);
};

export const toLocalPost = (post: DiscoverPost): Post => ({
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

export function makeInitialComments(postId: string) {
  return [
    {
      id: `${postId}-c1`,
      user: 'mayalifts',
      avatarUrl: null,
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
      avatarUrl: null,
      text: 'absolute beast mode',
      time: '1h ago',
      likes: 2,
      liked: false,
      replies: [
        {
          id: `${postId}-c2-r1`,
          user: 'sarahit',
          avatarUrl: null,
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
      avatarUrl: null,
      text: "Great form, what's your PR?",
      time: '30m ago',
      likes: 0,
      liked: false,
      replies: [],
      showReplies: false,
    },
  ];
}

export default {
  toLocalComment,
  toLocalPost,
  resolveExerciseIcon,
  makeInitialComments,
};

