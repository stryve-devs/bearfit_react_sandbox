import prisma from "../../config/prismaClient";
import { hashPassword, comparePassword } from "../../utils/passwordUtils";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtPayload,
  REFRESH_TOKEN_EXPIRES_IN_MS,
} from "../../utils/jwtUtils";

/* =======================
   REGISTER
======================= */

interface RegisterInput {
  name?: string;
  email: string;
  password: string;
  username?: string;
}

export const registerUser = async (data: RegisterInput) => {
  const { name, email, password, username } = data;

  // 1️⃣ Check if user already exists
  const existingUser = await prisma.users.findUnique({
    where: { email },
    select: { user_id: true },
  });

  if (existingUser) {
    throw new Error("User exists");
  }

  // 2️⃣ Hash password
  const hashedPassword = await hashPassword(password);

// 3️⃣ Create user
  const user = await prisma.users.create({
    data: {
      name: name || "", // 👈 CHANGE THIS from '?? null' to '|| ""'
      email,
      passwordHash: hashedPassword,
      username: username || null,
    },
    select: {
      user_id: true,
      name: true,
      email: true,
      username: true,
      created_at: true,
    },
  });

  return user;
};

/* =======================
   LOGIN
======================= */

interface LoginInput {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginInput) => {
  const { email, password } = data;

  // 1️⃣ Find user
  const user = await prisma.users.findUnique({
    where: { email },
    select: {
      user_id: true,
      name: true,
      email: true,
      username: true,
      passwordHash: true,
      is_active: true,
    },
  });

  if (!user || !user.is_active) {
    throw new Error("Invalid email or password");
  }

  if (!user.passwordHash) {
    throw new Error("This account uses Google sign-in. Please continue with Google.");
  }

  // 2️⃣ Compare password
  const isValidPassword = await comparePassword(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  // 3️⃣ JWT payload
  const payload: JwtPayload = {
    userId: user.user_id,
    email: user.email,
    role: 'USER',
  };

  // 4️⃣ Generate tokens
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // 5️⃣ Store refresh token in DB
  await prisma.refresh_tokens.create({
    data: {
      token: refreshToken,
      user_id: user.user_id,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
    },
  });

  // 6️⃣ Return response
  return {
    accessToken,
    refreshToken,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: 'USER',
    },
  };
};

/* =======================
   REFRESH TOKEN
======================= */

export const refreshAccessToken = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);

  const storedToken = await prisma.refresh_tokens.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.revoked) {
    throw new Error("Invalid refresh token");
  }

  if (storedToken.expires_at < new Date()) {
    throw new Error("Refresh token expired");
  }

  const payload: JwtPayload = {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  try {
    await prisma.refresh_tokens.create({
      data: {
        token: newRefreshToken,
        user_id: storedToken.user_id,
        expires_at: storedToken.expires_at,
      },
    });
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (!msg.includes('Unique constraint failed') && err?.code !== 'P2002') {
      throw err;
    }
  }

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/* =======================
   GOOGLE SIGN-IN
======================= */

export const googleAuth = async (googleId: string, email: string, name?: string) => {
  let user = await prisma.users.findUnique({
    where: { googleId },
    select: {
      user_id: true,
      name: true,
      email: true,
      username: true,
      googleId: true,
    },
  });

  if (!user) {
    const byEmail = await prisma.users.findUnique({
      where: { email },
      select: {
        user_id: true,
        name: true,
        email: true,
        username: true,
        googleId: true,
      },
    });

    if (byEmail?.googleId && byEmail.googleId !== googleId) {
      throw new Error('Google account does not match this email');
    }

    user = byEmail;
  }

  if (!user) {
    user = await prisma.users.create({
      data: {
        name: name || email.split('@')[0],
        email,
        googleId,
        passwordHash: null,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        username: true,
        googleId: true,
      },
    });
  } else if (!user.googleId) {
    user = await prisma.users.update({
      where: { user_id: user.user_id },
      data: { googleId },
      select: {
        user_id: true,
        name: true,
        email: true,
        username: true,
        googleId: true,
      },
    });
  }

  const payloadJwt: JwtPayload = {
    userId: user.user_id,
    email: user.email,
    role: 'USER',
  };

  const accessToken = generateAccessToken(payloadJwt);
  const refreshToken = generateRefreshToken(payloadJwt);

  await prisma.refresh_tokens.create({
    data: {
      token: refreshToken,
      user_id: user.user_id,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      username: user.username,
      googleId: user.googleId || undefined,
      role: 'USER',
    },
  };
};
