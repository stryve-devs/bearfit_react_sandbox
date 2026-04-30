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

  const existingUser = await prisma.users.findUnique({
    where: { email },
    select: { user_id: true },
  });

  if (existingUser) {
    throw new Error("User exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.users.create({
    data: {
      name: name || "",
      email,
      password_hash: hashedPassword,
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

  const user = await prisma.users.findUnique({
    where: { email },
    select: {
      user_id: true,
      name: true,
      email: true,
      username: true,
      password_hash: true,
      is_active: true,
    },
  });

  if (!user || !user.is_active) {
    throw new Error("Invalid email or password");
  }

  const isValidPassword = await comparePassword(password, user.password_hash!);

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  // ✅ FIX: Added ! to ensure these are treated as strings for the JWT
  const payload: JwtPayload = {
    userId: user.user_id,
    email: user.email!,
    role: 'USER',
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

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

  // ✅ FIX: Added ! to decoded email
  const payload: JwtPayload = {
    userId: decoded.userId,
    email: decoded.email!,
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

export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  await prisma.refresh_tokens.updateMany({
    where: {
      token: refreshToken,
      revoked: false,
    },
    data: {
      revoked: true,
    },
  });
};

/* =======================
   GOOGLE SIGN-IN
======================= */

export const googleSignIn = async (idToken: string, opts?: { username?: string; name?: string }) => {
  if (!idToken) throw new Error('idToken is required');

  const parts = idToken.split('.');
  if (parts.length < 2) throw new Error('Invalid idToken format');
  const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));

  const email: string | undefined = payload.email;
  const tokenName: string | undefined = payload.name || payload.given_name;

  if (!email) throw new Error('Google token does not contain an email');

  let user = await prisma.users.findUnique({
    where: { email },
    select: { user_id: true, name: true, email: true, username: true },
  });

  if (!user) {
    if (opts?.username) {
      const existingByUsername = await prisma.users.findUnique({ where: { username: opts.username }, select: { user_id: true } });
      if (existingByUsername) {
        throw new Error('Username already taken');
      }
    }

    const randomPassword = Math.random().toString(36) + Date.now().toString(36);
    const hashedPassword = await hashPassword(randomPassword);
    user = await prisma.users.create({
      data: {
        name: opts?.name || tokenName || email.split('@')[0],
        email,
        password_hash: hashedPassword,
        username: opts?.username,
      },
      select: { user_id: true, name: true, email: true, username: true, created_at: true },
    });
  }

  // ✅ FIX: Added ! to user.email
  const payloadJwt: JwtPayload = {
    userId: user.user_id,
    email: user.email!,
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
      role: 'USER',
    },
  };
};

interface PublicUserProfile {
  user_id: number;
  username: string | null;
  name: string;
}

export interface MeProfileResponse {
  username: string | null;
  name: string;
  bio: string | null;
  profile_pic_url?: string | null;
  followers: PublicUserProfile[];
  following: PublicUserProfile[];
  _count: {
    followers: number;
    following: number;
    workouts: number;
  };
}

export const getCurrentUserProfile = async (userId: number): Promise<MeProfileResponse> => {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: {
      username: true,
      name: true,
      bio: true,
      profile_pic_url: true,
      following_links: {
        select: {
          following: {
            select: {
              user_id: true,
              username: true,
              name: true,
            },
          },
        },
      },
      follower_links: {
        select: {
          follower: {
            select: {
              user_id: true,
              username: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          following_links: true,
          follower_links: true,
          workouts: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    username: user.username,
    name: user.name,
    bio: user.bio,
    profile_pic_url: user.profile_pic_url,
    followers: user.follower_links.map((link) => ({
      user_id: link.follower.user_id,
      username: link.follower.username,
      name: link.follower.name,
    })),
    following: user.following_links.map((link) => ({
      user_id: link.following.user_id,
      username: link.following.username,
      name: link.following.name,
    })),
    _count: {
      followers: user._count.follower_links,
      following: user._count.following_links,
      workouts: user._count.workouts,
    },
  };
};

const ensureTargetUserExists = async (targetUserId: number): Promise<void> => {
  const target = await prisma.users.findUnique({
    where: { user_id: targetUserId },
    select: { user_id: true },
  });

  if (!target) {
    throw new Error('User not found');
  }
};

export const followUser = async (
  followerId: number,
  followingId: number,
): Promise<{ isFollowing: boolean }> => {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  await ensureTargetUserExists(followingId);

  try {
    await prisma.user_follows.create({
      data: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
  } catch (error: any) {
    if (error?.code !== 'P2002') {
      throw error;
    }
  }

  return { isFollowing: true };
};

export const unfollowUser = async (
  followerId: number,
  followingId: number,
): Promise<{ isFollowing: boolean }> => {
  if (followerId === followingId) {
    throw new Error('Cannot unfollow yourself');
  }

  await ensureTargetUserExists(followingId);

  await prisma.user_follows.deleteMany({
    where: {
      follower_id: followerId,
      following_id: followingId,
    },
  });

  return { isFollowing: false };
};

// Remove a follower from the given user's followers (i.e. current user removes target as a follower)
export const removeFollower = async (userId: number, followerId: number): Promise<{ removed: boolean }> => {
  if (userId === followerId) {
    throw new Error('Cannot remove yourself');
  }

  await ensureTargetUserExists(followerId);

  const deleted = await prisma.user_follows.deleteMany({
    where: {
      follower_id: followerId,
      following_id: userId,
    },
  });

  return { removed: deleted.count > 0 };
};

// Return a list of suggested users (those the requester does not follow and excluding themself)
export const getSuggestedUsers = async (userId: number, limit = 8) => {
  const followingRows = await prisma.user_follows.findMany({
    where: { follower_id: userId },
    select: { following_id: true },
  });

  const excludeIds = followingRows.map((r) => r.following_id);
  excludeIds.push(userId);

  const users = await prisma.users.findMany({
    where: { user_id: { notIn: excludeIds } },
    orderBy: { created_at: 'desc' },
    take: limit,
    select: {
      user_id: true,
      username: true,
      name: true,
      profile_pic_url: true,
    },
  });

  return users;
};
