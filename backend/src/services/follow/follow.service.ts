import prisma from '../../config/prismaClient';

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

