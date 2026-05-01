import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  googleSignIn,
  revokeRefreshToken,
} from "../../services/auth/auth.service";
import { getCurrentUserProfile } from '../../services/user/user.service';
import { followUser, unfollowUser, getSuggestedUsers, removeFollower } from '../../services/follow/follow.service';
import {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_EXPIRES_IN_MS
} from "../../utils/jwtUtils";
import prisma from '../../config/prismaClient';
import otpService from '../../services/auth/otp.service';
import { targetUserIdParamsSchema } from '../../utils/validationSchemas';

/* =======================
   CHECK USERNAME EXISTS
======================= */
export const checkUsernameExists = async (req: Request, res: Response) => {
  try {
    const username = String(req.query.username || '').trim();

    if (!username) {
      return res.status(400).json({ message: 'username query parameter is required' });
    }

    const user = await prisma.users.findUnique({
      where: { username },
      select: { user_id: true }
    });

    return res.status(200).json({ exists: !!user });
  } catch (error: any) {
    console.error('❌ Database check error:', error);
    return res.status(500).json({ message: 'Failed to check username' });
  }
};

/* =======================
   REGISTER
======================= */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, name } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: "Username must be 3-20 characters (letters, numbers, _, -)",
      });
    }

    const existingUsername = await prisma.users.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await registerUser({
      name: name || username || email.split('@')[0],
      email,
      password,
      username,
    });

    const payload = { userId: user.user_id, email: user.email!, role: 'USER' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refresh_tokens.create({
      data: {
        token: refreshToken,
        user_id: user.user_id,
        expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
      },
    });

    return res.status(201).json({
      message: "Registration successful",
      accessToken,
      refreshToken,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    return res.status(400).json({
      message: error.message || "Registration failed",
    });
  }
};

/* =======================
   LOGIN
======================= */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const result = await loginUser({ email, password });
    return res.status(200).json({ message: "Login successful", ...result });
  } catch (error: any) {
    return res.status(401).json({ message: error.message || "Login failed" });
  }
};

/* =======================
   REFRESH TOKEN
======================= */
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "refreshToken is required" });

    const tokens = await refreshAccessToken(refreshToken);
    return res.status(200).json({ message: "Token refreshed successfully", ...tokens });
  } catch (error: any) {
    return res.status(401).json({ message: error.message || "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    await revokeRefreshToken(refreshToken);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Logout failed" });
  }
};

/* =======================
   GOOGLE AUTH
======================= */
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken, username, name, email } = req.body;

    if (idToken) {
      // ✅ Matches Service definition: googleSignIn(idToken, { username, name })
      const result = await googleSignIn(idToken, { username, name });
      return res.status(200).json({ message: 'Google sign-in successful', ...result });
    }

    if (email) {
      const existing = await prisma.users.findUnique({
        where: { email },
        select: { user_id: true, name: true, email: true, username: true }
      });

      if (existing) {
        const payload = { userId: existing.user_id, email: existing.email!, role: 'USER' };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await prisma.refresh_tokens.create({
          data: {
            token: refreshToken,
            user_id: existing.user_id,
            expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
          },
        });

        return res.status(200).json({
          message: 'Google sign-in (email fallback) successful',
          accessToken,
          refreshToken,
          user: existing
        });
      }

      const randomPassword = Math.random().toString(36) + Date.now().toString(36);
      await registerUser({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        username
      });

      const loginResult = await loginUser({ email, password: randomPassword });
      return res.status(200).json({ message: 'Google fallback registration successful', ...loginResult });
    }

    return res.status(400).json({ message: 'Either idToken or email is required' });
  } catch (error: any) {
    console.error('[authController] googleAuth error', error);
    return res.status(400).json({ message: error.message || "Google auth failed" });
  }
};

/* =======================
   REGISTER (GOOGLE COMPLETE)
======================= */
export const registerGoogle = async (req: Request, res: Response) => {
  try {
    const { idToken, email, username, name } = req.body;

    if (idToken) {
      const result = await googleSignIn(idToken, { username, name });
      return res.status(200).json({ message: 'Google registration successful', ...result });
    }

    if (!email) return res.status(400).json({ message: 'email is required' });

    const existing = await prisma.users.findUnique({ where: { email }, select: { user_id: true } });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const randomPassword = Math.random().toString(36) + Date.now().toString(36);
    await registerUser({ name: name || email.split('@')[0], email, password: randomPassword, username });

    const loginResult = await loginUser({ email, password: randomPassword });
    return res.status(201).json({ message: 'Google registration successful', ...loginResult });
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Google registration failed' });
  }
};

/* =======================
   CHECK EMAIL EXISTS
======================= */
export const checkEmailExists = async (req: Request, res: Response) => {
  try {
    const email = String(req.query.email || '').trim();
    if (!email) return res.status(400).json({ message: 'email is required' });

    const user = await prisma.users.findUnique({ where: { email }, select: { user_id: true } });
    return res.status(200).json({ exists: !!user });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to check email' });
  }
};

/* =======================
   OTP SERVICES
======================= */
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });
    await otpService.sendOtpToEmail(String(email).trim());
    return res.status(200).json({ message: 'OTP sent' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'email and code required' });
    const ok = await otpService.verifyOtpForEmail(String(email).trim(), String(code).trim());
    if (!ok) return res.status(400).json({ message: 'Invalid or expired code' });
    return res.status(200).json({ message: 'OTP verified' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await getCurrentUserProfile(userId);
    console.log('[auth.controller] me profile:', profile);
    return res.status(200).json(profile);
  } catch (error: any) {
    if (error?.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const follow = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const params = targetUserIdParamsSchema.parse(req.params);
    const result = await followUser(userId, params.targetUserId);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error?.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }

    if (error?.message === 'Cannot follow yourself') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Failed to follow user' });
  }
};

export const unfollow = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const params = targetUserIdParamsSchema.parse(req.params);
    const result = await unfollowUser(userId, params.targetUserId);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error?.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }

    if (error?.message === 'Cannot unfollow yourself') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Failed to unfollow user' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Accept additional fields for profile updates
    const { name, username, email, bio, link_url, profile_pic_url, profile_pic_key } = req.body;

    if (!name && !username && !email && !bio && !link_url && !profile_pic_url && !profile_pic_key) {
      return res.status(400).json({ message: 'At least one field (name, username, email, bio, link_url, profile_pic_url, profile_pic_key) is required' });
    }

    // Validate username if provided
    if (username) {
      const usernameTrim = String(username).trim();
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      if (!usernameRegex.test(usernameTrim)) {
        return res.status(400).json({ message: 'Username must be 3-20 characters (letters, numbers, _, -)' });
      }

      const existing = await prisma.users.findUnique({ where: { username: usernameTrim }, select: { user_id: true } });
      if (existing && existing.user_id !== userId) {
        return res.status(409).json({ message: 'Username already taken' });
      }
    }

    // Validate email if provided
    if (email) {
      const emailTrim = String(email).trim();
      // Basic email check
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailTrim)) {
        return res.status(400).json({ message: 'Invalid email' });
      }

      const existingEmail = await prisma.users.findUnique({ where: { email: emailTrim }, select: { user_id: true } });
      if (existingEmail && existingEmail.user_id !== userId) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = String(name).trim();
    if (username) updateData.username = String(username).trim();
    if (email) updateData.email = String(email).trim();

    // Accept optional profile fields
    if (typeof bio !== 'undefined') updateData.bio = bio === null ? null : String(bio).trim();
    if (typeof link_url !== 'undefined') updateData.link_url = link_url === null ? null : String(link_url).trim();

    // If client provided a profile_pic_key, convert to a public URL using R2 config
    if (typeof profile_pic_key !== 'undefined' && profile_pic_key !== null) {
      const R2_PUBLIC_URL = process.env.EXPO_PUBLIC_R2_PUBLIC_URL || '';
      const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT || '';
      const R2_BUCKET_NAME = process.env.EXPO_PUBLIC_R2_BUCKET_NAME || 'bearfit-assets';

      const encodeKeyForUrl = (key: string) => key.split('/').map(encodeURIComponent).join('/');
      const key = String(profile_pic_key).trim();
      let computedUrl: string;
      if (R2_PUBLIC_URL) {
        computedUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${encodeKeyForUrl(key)}`;
      } else if (R2_ENDPOINT) {
        computedUrl = `${R2_ENDPOINT.replace(/\/$/, '')}/${encodeKeyForUrl(key)}`;
      } else {
        computedUrl = `https://${R2_BUCKET_NAME}.s3.auto.amazonaws.com/${encodeKeyForUrl(key)}`;
      }
      updateData.profile_pic_url = computedUrl;
    }

    // If client provided a full profile_pic_url, allow it
    if (typeof profile_pic_url !== 'undefined') updateData.profile_pic_url = profile_pic_url === null ? null : String(profile_pic_url).trim();

    const updated = await prisma.users.update({
      where: { user_id: userId },
      data: updateData,
      select: { user_id: true, username: true, email: true, name: true, profile_pic_url: true }
    });

    return res.status(200).json({ message: 'Profile updated', user: updated });
  } catch (error: any) {
    console.error('[authController] updateProfile error', error);
    if (error?.code === 'P2025') { // Prisma record not found
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
};

export const suggestedUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const limit = Number(req.query.limit || 8);
    const users = await getSuggestedUsers(userId, limit);
    return res.status(200).json({ users });
  } catch (error: any) {
    console.error('[authController] suggestedUsers error', error);
    return res.status(500).json({ message: error?.message || 'Failed to fetch suggestions' });
  }
};

export const removeFollowerController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const followerId = Number(req.params.followerId);
    if (!followerId) return res.status(400).json({ message: 'Invalid follower id' });

    const result = await removeFollower(userId, followerId);
    return res.status(200).json({ removed: result.removed });
  } catch (error: any) {
    console.error('[authController] removeFollower error', error);
    if (error?.message === 'User not found') return res.status(404).json({ message: 'User not found' });
    return res.status(500).json({ message: error?.message || 'Failed to remove follower' });
  }
};
