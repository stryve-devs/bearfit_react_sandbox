import { Request, Response } from 'express';
import prisma from '../config/prismaClient';
import { verifyAccessToken } from '../utils/jwtUtils';

export const getUserById = async (req: Request, res: Response) => {
  try {
    const raw = String(req.params.id || '');
    if (!raw) return res.status(400).json({ message: 'Invalid user id' });

    // Determine if param is numeric user_id or username
    const asNum = Number(raw);
    const isNumeric = !Number.isNaN(asNum) && Number.isFinite(asNum) && String(asNum) === raw;

    // Fetch user basic info by id or username
    const user = await prisma.users.findUnique({
      where: isNumeric ? { user_id: asNum } : { username: raw },
      select: {
        user_id: true,
        username: true,
        name: true,
        profile_pic_url: true,
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const id = user.user_id;

    // Try to determine whether the requester follows this user. This is optional
    // — if the caller did not provide a valid Bearer token, we'll skip it.
    let is_followed_by_current_user = false;
    try {
      const authHeader = String(req.headers.authorization || '');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyAccessToken(token);
        const currentUserId = Number(decoded?.userId || 0);
        if (currentUserId && currentUserId !== id) {
          const cnt = await prisma.user_follows.count({ where: { follower_id: currentUserId, following_id: id } });
          is_followed_by_current_user = cnt > 0;
        }
      }
    } catch (err) {
      // ignore token errors and treat as unauthenticated
      is_followed_by_current_user = false;
    }

    // Fetch counts in parallel
    const [workoutCount, followingCount, followersCount] = await Promise.all([
      prisma.workouts.count({ where: { user_id: id } }),
      prisma.user_follows.count({ where: { follower_id: id } }),
      prisma.user_follows.count({ where: { following_id: id } }),
    ]);

    return res.status(200).json({
      ...user,
      is_followed_by_current_user,
      workoutCount,
      followingCount,
      followersCount,
    });
  } catch (error: any) {
    console.error('[users.controller] getUserById error', error);
    return res.status(500).json({ message: error?.message || 'Failed to fetch user' });
  }
};

export const getFollowersList = async (req: Request, res: Response) => {
  try {
    const raw = String(req.params.id || '');
    if (!raw) return res.status(400).json({ message: 'Invalid user id' });
    const asNum = Number(raw);
    const isNumeric = !Number.isNaN(asNum) && Number.isFinite(asNum) && String(asNum) === raw;

    // Resolve target user id
    const targetUser = isNumeric
      ? await prisma.users.findUnique({ where: { user_id: asNum }, select: { user_id: true } })
      : await prisma.users.findUnique({ where: { username: raw }, select: { user_id: true } });

    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const rows = await prisma.user_follows.findMany({
      where: { following_id: targetUser.user_id },
      select: {
        follower: {
          select: { user_id: true, username: true, name: true, profile_pic_url: true },
        },
      },
      orderBy: { created_at: 'desc' } as any,
    });

    const followers = rows.map((r) => ({
      user_id: r.follower.user_id,
      username: r.follower.username,
      name: r.follower.name,
      profile_pic_url: r.follower.profile_pic_url,
    }));

    return res.status(200).json({ followers });
  } catch (error: any) {
    console.error('[users.controller] getFollowersList error', error);
    return res.status(500).json({ message: error?.message || 'Failed to fetch followers' });
  }
};

export const getFollowingList = async (req: Request, res: Response) => {
  try {
    const raw = String(req.params.id || '');
    if (!raw) return res.status(400).json({ message: 'Invalid user id' });
    const asNum = Number(raw);
    const isNumeric = !Number.isNaN(asNum) && Number.isFinite(asNum) && String(asNum) === raw;

    const targetUser = isNumeric
      ? await prisma.users.findUnique({ where: { user_id: asNum }, select: { user_id: true } })
      : await prisma.users.findUnique({ where: { username: raw }, select: { user_id: true } });

    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const rows = await prisma.user_follows.findMany({
      where: { follower_id: targetUser.user_id },
      select: {
        following: {
          select: { user_id: true, username: true, name: true, profile_pic_url: true },
        },
      },
      orderBy: { created_at: 'desc' } as any,
    });

    const following = rows.map((r) => ({
      user_id: r.following.user_id,
      username: r.following.username,
      name: r.following.name,
      profile_pic_url: r.following.profile_pic_url,
    }));

    return res.status(200).json({ following });
  } catch (error: any) {
    console.error('[users.controller] getFollowingList error', error);
    return res.status(500).json({ message: error?.message || 'Failed to fetch following list' });
  }
};
