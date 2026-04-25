import { Prisma } from '@prisma/client';
import prisma from '../../config/prismaClient';
import { CreatePostCommentInput, SaveWorkoutPostInput } from '../../utils/validationSchemas';

type SaveWorkoutResult = {
  workoutId: number;
  postId: number;
  isFirstWorkout: boolean;
  createdAt: string;
};

type DiscoverCommentDto = {
  id: string;
  user: string;
  avatarUrl: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  replies: DiscoverCommentDto[];
};

type DiscoverPostDto = {
  id: string;
  title?: string;
  caption: string;
  time: string;
  stats: {
    time: string;
    bpm?: string;
    reps?: string;
    weight?: string;
    distance?: string;
  };
  athlete: {
    name: string;
    username: string;
    avatarUrl: string;
  };
  media: Array<{ url: string; type: 'IMAGE' | 'VIDEO' }>;
  exercises: Array<{ name: string; setsCount: number; imagePath?: string }>;
  likesCount: number;
  likedByMe: boolean;
  likedByUsername?: string;
  likedByAvatarUrls: string[];
  commentsCount: number;
  comments: DiscoverCommentDto[];
};

type DiscoverFeedResult = {
  posts: DiscoverPostDto[];
  nextCursor: string | null;
};

const avatarFromUserId = (userId: number): string => {
  const avatarIndex = (userId % 70) + 1;
  return `https://i.pravatar.cc/150?img=${avatarIndex}`;
};

const formatRelativeTime = (date: Date): string => {
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

const formatDuration = (durationMinutes?: number | null): string => {
  if (!durationMinutes || durationMinutes <= 0) return '0min';
  if (durationMinutes < 60) return `${durationMinutes}min`;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${hours}h ${minutes}min`;
};

const toNumber = (value: Prisma.Decimal | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  return Number(value);
};

const resolveExerciseId = async (
  tx: Prisma.TransactionClient,
  name: string,
  externalId?: string | null,
): Promise<number | null> => {
  if (externalId) {
    const byExternalId = await tx.exercise.findUnique({
      where: { external_id: externalId },
      select: { exercise_id: true },
    });

    if (byExternalId) {
      return byExternalId.exercise_id;
    }
  }

  const byName = await tx.exercise.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
    select: { exercise_id: true },
  });

  return byName?.exercise_id ?? null;
};

const mapCommentTree = (comment: any): DiscoverCommentDto => ({
  id: String(comment.comment_id),
  user: comment.users?.username || comment.users?.name || `user-${comment.user_id}`,
  avatarUrl: avatarFromUserId(comment.user_id),
  text: comment.text,
  time: formatRelativeTime(comment.created_at),
  likes: 0,
  liked: false,
  replies: (comment.other_Comment || []).map((reply: any) => mapCommentTree(reply)),
});

const buildPostStats = (workout: any) => {
  const sets = (workout?.workout_exercises || []).flatMap((entry: any) => entry.WorkoutSet || []);
  const totalReps = sets.reduce((sum: number, set: any) => sum + (set.reps || 0), 0);
  const bpmValues = sets.map((set: any) => set.bpm).filter((bpm: number | null) => typeof bpm === 'number');
  const avgBpm = bpmValues.length > 0
    ? Math.round(bpmValues.reduce((sum: number, bpm: number) => sum + bpm, 0) / bpmValues.length)
    : undefined;

  const totalDistance = sets.reduce((sum: number, set: any) => sum + toNumber(set.distance), 0);

  let totalVolume = 0;
  try {
    const parsedNotes = workout?.notes ? JSON.parse(workout.notes) : null;
    if (parsedNotes && typeof parsedNotes.totalVolume === 'number') {
      totalVolume = parsedNotes.totalVolume;
    }
  } catch {
    // Fall back to deriving from set data.
  }

  if (totalVolume === 0) {
    totalVolume = sets.reduce((sum: number, set: any) => {
      const weight = toNumber(set.weight);
      const reps = set.reps || 0;
      return sum + (weight * reps);
    }, 0);
  }

  return {
    time: formatDuration(workout?.duration_minutes),
    bpm: avgBpm ? String(avgBpm) : undefined,
    reps: totalReps > 0 ? String(totalReps) : undefined,
    weight: totalVolume > 0 ? `${Math.round(totalVolume)} kgs` : undefined,
    distance: totalDistance > 0 ? `${Number(totalDistance.toFixed(2))} km` : undefined,
  };
};

const buildExerciseSummary = (workout: any): Array<{ name: string; setsCount: number; imagePath?: string }> => {
  const items = (workout?.workout_exercises || []).map((entry: any) => ({
    name: entry?.exercises?.name || entry?.notes || 'Exercise',
    setsCount: Array.isArray(entry?.WorkoutSet) ? entry.WorkoutSet.length : 0,
    imagePath: entry?.exercises?.image || undefined,
  }));

  return items.filter((item: any) => !!item.name);
};

export const saveWorkoutPost = async (
  userId: number,
  input: SaveWorkoutPostInput,
): Promise<SaveWorkoutResult> => {
  return prisma.$transaction(async (tx) => {
    const workoutCount = await tx.workouts.count({ where: { user_id: userId } });
    const createdAt = input.createdAt ? new Date(input.createdAt) : new Date();
    const durationMinutes = Math.max(0, Math.round(input.durationSeconds / 60));

    const workout = await tx.workouts.create({
      data: {
        user_id: userId,
        date: createdAt,
        type: 'WORKOUT_POST',
        duration_minutes: durationMinutes,
        notes: JSON.stringify({
          totalVolume: input.totalVolume,
          totalSets: input.totalSets,
        }),
      },
      select: { workout_id: true },
    });

    for (const exercise of input.exercises) {
      const exerciseId = await resolveExerciseId(tx, exercise.name, exercise.externalId);

      const workoutExercise = await tx.workout_exercises.create({
        data: {
          workout_id: workout.workout_id,
          exercise_id: exerciseId,
          notes: exercise.name,
        },
        select: { workout_exercise_id: true },
      });

      if (exercise.sets.length > 0) {
        await tx.workoutSet.createMany({
          data: exercise.sets.map((setItem, index) => ({
            workout_exercise_id: workoutExercise.workout_exercise_id,
            set_number: setItem.setNumber || index + 1,
            weight: setItem.weightKg,
            reps: setItem.reps,
            is_completed: setItem.isCompleted,
            created_at: createdAt,
          })),
        });
      }
    }

    const post = await tx.post.create({
      data: {
        user_id: userId,
        workout_id: workout.workout_id,
        title: input.title,
        caption: input.description || '',
        created_at: createdAt,
      },
      select: { post_id: true, created_at: true },
    });

    await tx.$executeRaw(
      Prisma.sql`UPDATE "Post" SET "visibility" = ${input.visibility.toUpperCase()}::"PostVisibility" WHERE "post_id" = ${post.post_id}`,
    );

    if (input.media.length > 0) {
      await tx.postMedia.createMany({
        data: input.media.map((media) => ({
          post_id: post.post_id,
          url: media.url,
          type: media.type,
          order: media.order,
          created_at: createdAt,
        })),
      });
    }

    return {
      workoutId: workout.workout_id,
      postId: post.post_id,
      isFirstWorkout: workoutCount === 0,
      createdAt: post.created_at.toISOString(),
    };
  });
};

const mapPrismaPostToDiscoverPost = (post: any, userId: number): DiscoverPostDto => {
  const likes = Array.isArray(post.Like) ? post.Like : [];
  const firstLike = likes[0];

  return {
    id: String(post.post_id),
    title: post.title || '',
    caption: post.caption || post.title || '',
    time: formatRelativeTime(post.created_at),
    stats: buildPostStats(post.workouts),
    athlete: {
      name: post.users.name || post.users.username || `user-${post.users.user_id}`,
      username: post.users.username || `user-${post.users.user_id}`,
      avatarUrl: avatarFromUserId(post.users.user_id),
    },
    media: (post.PostMedia || []).map((media: any) => ({
      url: media.url,
      type: media.type,
    })),
    exercises: buildExerciseSummary(post.workouts),
    likesCount: likes.length,
    likedByMe: likes.some((like: any) => like.user_id === userId),
    likedByUsername:
      firstLike?.users?.username ||
      firstLike?.users?.name ||
      (firstLike ? `user-${firstLike.user_id}` : undefined),
    likedByAvatarUrls: likes.slice(0, 2).map((like: any) => avatarFromUserId(like.user_id)),
    commentsCount: post.Comment?.length || 0,
    comments: (post.Comment || []).map((comment: any) => mapCommentTree(comment)),
  };
};

export const getDiscoverPosts = async (
  userId: number,
  limit: number,
  cursor?: number,
): Promise<DiscoverFeedResult> => {
  const rows = await prisma.post.findMany({
    where: { visibility: 'PUBLIC' },
    ...(cursor
      ? {
          skip: 1,
          cursor: { post_id: cursor },
        }
      : {}),
    take: limit + 1,
    orderBy: [
      { likes_count: 'desc' },
      { created_at: 'desc' },
      { post_id: 'desc' },
    ],
    include: {
      users: { select: { user_id: true, username: true, name: true } },
      workouts: {
        include: {
          workout_exercises: {
            include: {
              WorkoutSet: true,
              exercises: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
      PostMedia: {
        orderBy: { order: 'asc' },
        select: { url: true, type: true },
      },
      Like: {
        orderBy: { created_at: 'asc' },
        select: {
          user_id: true,
          users: { select: { username: true, name: true } },
        },
      },
      Comment: {
        where: { parent_id: null },
        include: {
          users: { select: { username: true, name: true } },
          other_Comment: {
            include: {
              users: { select: { username: true, name: true } },
            },
            orderBy: { created_at: 'asc' },
          },
        },
        orderBy: { created_at: 'asc' },
      },
    },
  });

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const posts = pageRows.map((post) => mapPrismaPostToDiscoverPost(post, userId));

  const nextCursor = hasMore && pageRows.length > 0
    ? String(pageRows[pageRows.length - 1].post_id)
    : null;

  return { posts, nextCursor };
};

export const getDiscoverPostById = async (userId: number, postId: number): Promise<DiscoverPostDto | null> => {
  const post = await prisma.post.findFirst({
    where: {
      post_id: postId,
      visibility: 'PUBLIC',
    },
    include: {
      users: { select: { user_id: true, username: true, name: true } },
      workouts: {
        include: {
          workout_exercises: {
            include: {
              WorkoutSet: true,
              exercises: {
                select: { name: true, image: true },
              },
            },
          },
        },
      },
      PostMedia: {
        orderBy: { order: 'asc' },
        select: { url: true, type: true },
      },
      Like: {
        orderBy: { created_at: 'asc' },
        select: {
          user_id: true,
          users: { select: { username: true, name: true } },
        },
      },
      Comment: {
        where: { parent_id: null },
        include: {
          users: { select: { username: true, name: true } },
          other_Comment: {
            include: {
              users: { select: { username: true, name: true } },
            },
            orderBy: { created_at: 'asc' },
          },
        },
        orderBy: { created_at: 'asc' },
      },
    },
  });

  if (!post) return null;
  return mapPrismaPostToDiscoverPost(post, userId);
};

export const togglePostLike = async (
  userId: number,
  postId: number,
): Promise<{ liked: boolean; likesCount: number; likedByUsername?: string; likedByAvatarUrls: string[] }> => {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({ where: { post_id: postId }, select: { post_id: true } });
    if (!post) {
      throw new Error('Post not found');
    }

    const existing = await tx.like.findUnique({
      where: { post_id_user_id: { post_id: postId, user_id: userId } },
      select: { like_id: true },
    });

    const liked = !existing;

    if (existing) {
      await tx.like.delete({ where: { like_id: existing.like_id } });
    } else {
      await tx.like.create({ data: { post_id: postId, user_id: userId } });
    }

    const likes = await tx.like.findMany({
      where: { post_id: postId },
      orderBy: { created_at: 'asc' },
      take: 2,
      select: {
        user_id: true,
        users: { select: { username: true, name: true } },
      },
    });

    const likesCount = await tx.like.count({ where: { post_id: postId } });
    await tx.post.update({
      where: { post_id: postId },
      data: { likes_count: likesCount },
    });

    const firstLike = likes[0];

    return {
      liked,
      likesCount,
      likedByUsername:
        firstLike?.users?.username ||
        firstLike?.users?.name ||
        (firstLike ? `user-${firstLike.user_id}` : undefined),
      likedByAvatarUrls: likes.map((like) => avatarFromUserId(like.user_id)),
    };
  });
};

export const createPostComment = async (
  userId: number,
  postId: number,
  input: CreatePostCommentInput,
): Promise<DiscoverCommentDto> => {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({ where: { post_id: postId }, select: { post_id: true } });
    if (!post) {
      throw new Error('Post not found');
    }

    if (input.parentId) {
      const parent = await tx.comment.findFirst({
        where: { comment_id: input.parentId, post_id: postId },
        select: { comment_id: true },
      });
      if (!parent) {
        throw new Error('Parent comment not found');
      }
    }

    const comment = await tx.comment.create({
      data: {
        post_id: postId,
        user_id: userId,
        text: input.text,
        parent_id: input.parentId || null,
      },
      include: {
        users: { select: { username: true, name: true } },
      },
    });

    const commentsCount = await tx.comment.count({ where: { post_id: postId, parent_id: null } });
    await tx.post.update({
      where: { post_id: postId },
      data: { comments_count: commentsCount },
    });

    return {
      id: String(comment.comment_id),
      user: comment.users?.username || comment.users?.name || `user-${comment.user_id}`,
      avatarUrl: avatarFromUserId(comment.user_id),
      text: comment.text,
      time: formatRelativeTime(comment.created_at),
      likes: 0,
      liked: false,
      replies: [],
    };
  });
};
