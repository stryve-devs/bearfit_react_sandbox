"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostCommentSchema = exports.targetUserIdParamsSchema = exports.postIdParamsSchema = exports.discoverFeedQuerySchema = exports.saveWorkoutPostSchema = exports.googleAuthSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
// backend/src/utils/validationSchemas.ts
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    // Allows name to be missing or empty to satisfy the database String? type
    name: zod_1.z.string().max(150, 'Name too long').optional().or(zod_1.z.literal("")),
    email: zod_1.z.string().email('Invalid email format').max(320, 'Email too long'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password too long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    // Username is strictly required (3-20 chars)
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username too long'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
const googleAuthBase = zod_1.z.object({
    username: zod_1.z.string().min(3).max(20).optional(),
    name: zod_1.z.string().max(150).optional().or(zod_1.z.literal("")),
});
exports.googleAuthSchema = zod_1.z.union([
    googleAuthBase.extend({ idToken: zod_1.z.string().min(1, 'ID token is required') }),
    googleAuthBase.extend({ email: zod_1.z.string().email().min(1) }),
]);
const postVisibilitySchema = zod_1.z.enum(['public', 'private', 'friends']);
const workoutSetSchema = zod_1.z.object({
    setNumber: zod_1.z.number().int().positive(),
    weightKg: zod_1.z.number().nonnegative().optional(),
    reps: zod_1.z.number().int().nonnegative().optional(),
    isCompleted: zod_1.z.boolean(),
});
const workoutExerciseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(150),
    externalId: zod_1.z.string().max(64).optional().nullable(),
    sets: zod_1.z.array(workoutSetSchema).min(1),
});
const workoutPostMediaSchema = zod_1.z.object({
    url: zod_1.z.string().url().max(500),
    type: zod_1.z.enum(['IMAGE', 'VIDEO']),
    order: zod_1.z.number().int().nonnegative(),
});
exports.saveWorkoutPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().max(4000).optional(),
    visibility: postVisibilitySchema,
    durationSeconds: zod_1.z.number().int().nonnegative(),
    totalVolume: zod_1.z.number().nonnegative(),
    totalSets: zod_1.z.number().int().nonnegative(),
    createdAt: zod_1.z.string().datetime().optional(),
    exercises: zod_1.z.array(workoutExerciseSchema).min(1),
    media: zod_1.z.array(workoutPostMediaSchema).default([]),
});
exports.discoverFeedQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(20).optional(),
    cursor: zod_1.z.coerce.number().int().positive().optional(),
});
exports.postIdParamsSchema = zod_1.z.object({
    postId: zod_1.z.coerce.number().int().positive(),
});
exports.targetUserIdParamsSchema = zod_1.z.object({
    targetUserId: zod_1.z.coerce.number().int().positive(),
});
exports.createPostCommentSchema = zod_1.z.object({
    text: zod_1.z.string().trim().min(1).max(2000),
    parentId: zod_1.z.number().int().positive().optional(),
});
