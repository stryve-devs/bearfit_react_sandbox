import { Request, Response } from 'express';
import prisma from '../config/prismaClient';

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid user id' });

    const user = await prisma.users.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        username: true,
        name: true,
        profile_pic_url: true,
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json(user);
  } catch (error: any) {
    console.error('[users.controller] getUserById error', error);
    return res.status(500).json({ message: error?.message || 'Failed to fetch user' });
  }
};
