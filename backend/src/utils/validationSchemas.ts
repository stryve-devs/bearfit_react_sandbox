// backend/src/utils/validationSchemas.ts
import { z } from 'zod';

export const registerSchema = z.object({
  // Allows name to be missing or empty to satisfy the database String? type
  name: z.string().max(150, 'Name too long').optional().or(z.literal("")),

  email: z.string().email('Invalid email format').max(320, 'Email too long'),

  password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password too long')
      .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),

  // Username is strictly required (3-20 chars)
  username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const googleAuthBase = z.object({
  username: z.string().min(3).max(20).optional(),
  name: z.string().max(150).optional().or(z.literal("")),
});

export const googleAuthSchema = z.union([
  googleAuthBase.extend({ idToken: z.string().min(1, 'ID token is required') }),
  googleAuthBase.extend({ email: z.string().email().min(1) }),
]);

const postVisibilitySchema = z.enum(['public', 'private', 'friends']);

const workoutSetSchema = z.object({
  setNumber: z.number().int().positive(),
  weightKg: z.number().nonnegative().optional(),
  reps: z.number().int().nonnegative().optional(),
  isCompleted: z.boolean(),
});

const workoutExerciseSchema = z.object({
  name: z.string().min(1).max(150),
  externalId: z.string().max(64).optional().nullable(),
  sets: z.array(workoutSetSchema).min(1),
});

const workoutPostMediaSchema = z.object({
  url: z.string().url().max(500),
  type: z.enum(['IMAGE', 'VIDEO']),
  order: z.number().int().nonnegative(),
});

export const saveWorkoutPostSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(4000).optional(),
  visibility: postVisibilitySchema,
  durationSeconds: z.number().int().nonnegative(),
  totalVolume: z.number().nonnegative(),
  totalSets: z.number().int().nonnegative(),
  createdAt: z.string().datetime().optional(),
  exercises: z.array(workoutExerciseSchema).min(1),
  media: z.array(workoutPostMediaSchema).default([]),
});

export const discoverFeedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional(),
  cursor: z.coerce.number().int().positive().optional(),
});

export const postIdParamsSchema = z.object({
  postId: z.coerce.number().int().positive(),
});

export const createPostCommentSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  parentId: z.number().int().positive().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SaveWorkoutPostInput = z.infer<typeof saveWorkoutPostSchema>;
export type DiscoverFeedQueryInput = z.infer<typeof discoverFeedQuerySchema>;
export type PostIdParamsInput = z.infer<typeof postIdParamsSchema>;
export type CreatePostCommentInput = z.infer<typeof createPostCommentSchema>;
