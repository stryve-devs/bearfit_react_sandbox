"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostComment = exports.togglePostLike = exports.getDiscoverPostById = exports.getUserProfilePosts = exports.getDiscoverPosts = exports.saveWorkoutPost = void 0;
const client_1 = require("@prisma/client");
const prismaClient_1 = __importDefault(require("../../config/prismaClient"));
const avatarFromUserId = (userId) => {
    const avatarIndex = (userId % 70) + 1;
    return `https://i.pravatar.cc/150?img=${avatarIndex}`;
};
const formatRelativeTime = (date) => {
    const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (diffSec < 60)
        return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60)
        return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24)
        return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
};
const formatDuration = (durationMinutes) => {
    if (!durationMinutes || durationMinutes <= 0)
        return '0min';
    if (durationMinutes < 60)
        return `${durationMinutes}min`;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes}min`;
};
const toNumber = (value) => {
    if (value === null || value === undefined)
        return 0;
    return Number(value);
};
const resolveExerciseId = async (tx, name, externalId) => {
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
const mapCommentTree = (comment) => ({
    id: String(comment.comment_id),
    user: comment.users?.username || comment.users?.name || `user-${comment.user_id}`,
    // Prefer stored profile_pic_url when available; otherwise fall back to generated placeholder
    avatarUrl: (comment.users && comment.users.profile_pic_url) ? comment.users.profile_pic_url : avatarFromUserId(comment.user_id),
    text: comment.text,
    time: formatRelativeTime(comment.created_at),
    likes: 0,
    liked: false,
    replies: (comment.other_Comment || []).map((reply) => mapCommentTree(reply)),
});
const buildPostStats = (workout) => {
    const sets = (workout?.workout_exercises || []).flatMap((entry) => entry.WorkoutSet || []);
    const totalReps = sets.reduce((sum, set) => sum + (set.reps || 0), 0);
    const bpmValues = sets.map((set) => set.bpm).filter((bpm) => typeof bpm === 'number');
    const avgBpm = bpmValues.length > 0
        ? Math.round(bpmValues.reduce((sum, bpm) => sum + bpm, 0) / bpmValues.length)
        : undefined;
    const totalDistance = sets.reduce((sum, set) => sum + toNumber(set.distance), 0);
    let totalVolume = 0;
    try {
        const parsedNotes = workout?.notes ? JSON.parse(workout.notes) : null;
        if (parsedNotes && typeof parsedNotes.totalVolume === 'number') {
            totalVolume = parsedNotes.totalVolume;
        }
    }
    catch {
        // Fall back to deriving from set data.
    }
    if (totalVolume === 0) {
        totalVolume = sets.reduce((sum, set) => {
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
const buildExerciseSummary = (workout) => {
    const items = (workout?.workout_exercises || []).map((entry) => ({
        name: entry?.exercises?.name || entry?.notes || 'Exercise',
        setsCount: Array.isArray(entry?.WorkoutSet) ? entry.WorkoutSet.length : 0,
        imagePath: entry?.exercises?.image || undefined,
    }));
    return items.filter((item) => !!item.name);
};
const saveWorkoutPost = async (userId, input) => {
    return prismaClient_1.default.$transaction(async (tx) => {
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
        await tx.$executeRaw(client_1.Prisma.sql `UPDATE "Post" SET "visibility" = ${input.visibility.toUpperCase()}::"PostVisibility" WHERE "post_id" = ${post.post_id}`);
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
exports.saveWorkoutPost = saveWorkoutPost;
const mapPrismaPostToDiscoverPost = (post, userId) => {
    const likes = Array.isArray(post.Like) ? post.Like : [];
    const firstLike = likes[0];
    return {
        id: String(post.post_id),
        userId: post.users.user_id,
        title: post.title || '',
        caption: post.caption || post.title || '',
        time: formatRelativeTime(post.created_at),
        stats: buildPostStats(post.workouts),
        // Prefer the stored profile_pic_url when available (public R2 URL or proxy URL),
        // otherwise fall back to the deterministic placeholder avatar.
        athlete: {
            name: post.users.name || post.users.username || `user-${post.users.user_id}`,
            username: post.users.username || `user-${post.users.user_id}`,
            avatarUrl: post.users.profile_pic_url || avatarFromUserId(post.users.user_id),
        },
        media: (post.PostMedia || []).map((media) => ({
            url: media.url,
            type: media.type,
        })),
        exercises: buildExerciseSummary(post.workouts),
        likesCount: likes.length,
        likedByMe: likes.some((like) => like.user_id === userId),
        likedByUsername: firstLike?.users?.username ||
            firstLike?.users?.name ||
            (firstLike ? `user-${firstLike.user_id}` : undefined),
        likedByAvatarUrls: likes.slice(0, 2).map((like) => (like.users && like.users.profile_pic_url) ? like.users.profile_pic_url : avatarFromUserId(like.user_id)),
        commentsCount: post.Comment?.length || 0,
        comments: (post.Comment || []).map((comment) => mapCommentTree(comment)),
    };
};
const discoverPostInclude = {
    users: { select: { user_id: true, username: true, name: true, profile_pic_url: true } },
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
            users: { select: { username: true, name: true, profile_pic_url: true } },
        },
    },
    Comment: {
        where: { parent_id: null },
        include: {
            users: { select: { username: true, name: true, profile_pic_url: true } },
            other_Comment: {
                include: {
                    users: { select: { username: true, name: true, profile_pic_url: true } },
                },
                orderBy: { created_at: 'asc' },
            },
        },
        orderBy: { created_at: 'asc' },
    },
};
const getPostFeed = async (userId, options) => {
    const { limit, cursor, where, orderBy } = options;
    const rows = await prismaClient_1.default.post.findMany({
        where,
        ...(cursor
            ? {
                skip: 1,
                cursor: { post_id: cursor },
            }
            : {}),
        take: limit + 1,
        orderBy: orderBy || [
            { created_at: 'desc' },
            { post_id: 'desc' },
        ],
        include: discoverPostInclude,
    });
    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const posts = pageRows.map((post) => mapPrismaPostToDiscoverPost(post, userId));
    const nextCursor = hasMore && pageRows.length > 0
        ? String(pageRows[pageRows.length - 1].post_id)
        : null;
    return { posts, nextCursor };
};
const getDiscoverPosts = async (userId, limit, cursor) => {
    return getPostFeed(userId, {
        limit,
        cursor,
        // Exclude the requesting user's own posts so Discover shows content from others
        where: { visibility: 'PUBLIC', user_id: { not: userId } },
        orderBy: [
            { likes_count: 'desc' },
            { created_at: 'desc' },
            { post_id: 'desc' },
        ],
    });
};
exports.getDiscoverPosts = getDiscoverPosts;
const getUserProfilePosts = async (viewerUserId, targetUserId, limit, cursor) => {
    const where = {
        user_id: targetUserId,
        ...(viewerUserId === targetUserId ? {} : { visibility: 'PUBLIC' }),
    };
    return getPostFeed(viewerUserId, {
        limit,
        cursor,
        where,
    });
};
exports.getUserProfilePosts = getUserProfilePosts;
const getDiscoverPostById = async (userId, postId) => {
    const post = await prismaClient_1.default.post.findFirst({
        where: {
            post_id: postId,
            visibility: 'PUBLIC',
        },
        include: {
            users: { select: { user_id: true, username: true, name: true, profile_pic_url: true } },
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
                    users: { select: { username: true, name: true, profile_pic_url: true } },
                    other_Comment: {
                        include: {
                            users: { select: { username: true, name: true, profile_pic_url: true } },
                        },
                        orderBy: { created_at: 'asc' },
                    },
                },
                orderBy: { created_at: 'asc' },
            },
        },
    });
    if (!post)
        return null;
    return mapPrismaPostToDiscoverPost(post, userId);
};
exports.getDiscoverPostById = getDiscoverPostById;
const togglePostLike = async (userId, postId) => {
    return prismaClient_1.default.$transaction(async (tx) => {
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
        }
        else {
            await tx.like.create({ data: { post_id: postId, user_id: userId } });
        }
        const likes = await tx.like.findMany({
            where: { post_id: postId },
            orderBy: { created_at: 'asc' },
            take: 2,
            select: {
                user_id: true,
                users: { select: { username: true, name: true, profile_pic_url: true } },
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
            likedByUsername: firstLike?.users?.username ||
                firstLike?.users?.name ||
                (firstLike ? `user-${firstLike.user_id}` : undefined),
            // Prefer stored profile_pic_url when available, otherwise fallback to generated avatar
            likedByAvatarUrls: likes.map((like) => (like.users && like.users.profile_pic_url) ? like.users.profile_pic_url : avatarFromUserId(like.user_id)),
        };
    });
};
exports.togglePostLike = togglePostLike;
const createPostComment = async (userId, postId, input) => {
    return prismaClient_1.default.$transaction(async (tx) => {
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
exports.createPostComment = createPostComment;
