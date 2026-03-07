import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  googleSignIn,
} from "../../services/auth/auth.service";
import {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_EXPIRES_IN_MS
} from "../../utils/jwtUtils";
import prisma from '../../config/prismaClient';
import otpService from '../../services/auth/otp.service';

/* =======================
   CHECK USERNAME EXISTS
   GET /auth/username-exists?username=...
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

    const exists = !!user;
    return res.status(200).json({ exists });
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
        message: "Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens",
      });
    }

    const existingUsername = await prisma.users.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({
        message: "Username already taken",
      });
    }

    // 1️⃣ Create the user in DB
    const user = await registerUser({
      name: name || username || email.split('@')[0],
      email,
      password,
      username,
    });

    // 2️⃣ Generate JWT Tokens
    const payload = { userId: user.user_id, email: user.email, role: 'USER' };
    const accessToken = generateAccessToken(payload as any);
    const refreshToken = generateRefreshToken(payload as any);

    // 3️⃣ Store refresh token in DB
    await prisma.refresh_tokens.create({
      data: {
        token: refreshToken,
        user_id: user.user_id,
        expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
      },
    });

    // 🚀 4️⃣ Return success response (Fixes the timeout)
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
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    const result = await loginUser({ email, password });

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error: any) {
    return res.status(401).json({
      message: error.message || "Login failed",
    });
  }
};

/* =======================
   REFRESH TOKEN
======================= */
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "refreshToken is required",
      });
    }

    const tokens = await refreshAccessToken(refreshToken);

    return res.status(200).json({
      message: "Token refreshed successfully",
      ...tokens,
    });
  } catch (error: any) {
    return res.status(401).json({
      message: error.message || "Invalid refresh token",
    });
  }
};

/* =======================
   GOOGLE AUTH
======================= */
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken, username, name, email } = req.body as { idToken?: string; username?: string; name?: string; email?: string };

    if (idToken) {
      const result = await googleSignIn(idToken, { username, name });
      return res.status(200).json({ message: 'Google sign-in successful', ...result });
    }

    if (email) {
      const existing = await prisma.users.findUnique({ where: { email }, select: { user_id: true, name: true, email: true, username: true } });
      if (existing) {
        const payload = { userId: existing.user_id, email: existing.email, role: 'USER' };
        const accessToken = generateAccessToken(payload as any);
        const refreshToken = generateRefreshToken(payload as any);

        await prisma.refresh_tokens.create({
          data: {
            token: refreshToken,
            user_id: existing.user_id,
            expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
          },
        });

        return res.status(200).json({ message: 'Google sign-in (email fallback) successful', accessToken, refreshToken, user: existing });
      }

      const randomPassword = Math.random().toString(36) + Date.now().toString(36);
      await registerUser({ name: name || email.split('@')[0], email, password: randomPassword, username });

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
    const { idToken, email, username, name } = req.body as { idToken?: string; email?: string; username?: string; name?: string };

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
    if (!email) {
      return res.status(400).json({ message: 'email query parameter is required' });
    }

    const user = await prisma.users.findUnique({ where: { email }, select: { user_id: true } });
    return res.status(200).json({ exists: !!user });
  } catch (error: any) {
    console.error('checkEmailExists error', error);
    return res.status(500).json({ message: 'Failed to check email' });
  }
};

/* =======================
   SEND OTP
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

/* =======================
   VERIFY OTP
======================= */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'email and code are required' });

    const ok = await otpService.verifyOtpForEmail(String(email).trim(), String(code).trim());
    if (!ok) return res.status(400).json({ message: 'Invalid or expired code' });
    return res.status(200).json({ message: 'OTP verified' });
  } catch (error: any) {
    console.error('verifyOtp error', error);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
};