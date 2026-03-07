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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;