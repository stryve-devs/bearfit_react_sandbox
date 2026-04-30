import { Request, Response } from 'express';
import prisma from '../config/prismaClient';

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

    // Fetch counts in parallel
    const [workoutCount, followingCount, followersCount] = await Promise.all([
      prisma.workouts.count({ where: { user_id: id } }),
      prisma.user_follows.count({ where: { follower_id: id } }),
      prisma.user_follows.count({ where: { following_id: id } }),
    ]);

    return res.status(200).json({
      ...user,
      workoutCount,
      followingCount,
      followersCount,
    });
  } catch (error: any) {
    console.error('[users.controller] getUserById error', error);
    return res.status(500).json({ message: error?.message || 'Failed to fetch user' });
  }
};
