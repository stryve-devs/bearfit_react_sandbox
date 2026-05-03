import prisma from '../../config/prismaClient';

export interface PublicUserProfile {
  user_id: number;
  username: string | null;
  name: string;
}

export interface MeProfileResponse {
  username: string | null;
  name: string;
  bio: string | null;
  link_url: string | null;
  sex: string | null;
  birthday: string | null;
  profile_pic_url?: string | null;
  banner_url?: string | null;
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
      link_url: true,
      gender: true,
      date_of_birth: true,
      profile_pic_url: true,
      banner_url: true,
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
    throw new Error('User not found');
  }

  return {
    username: user.username,
    name: user.name,
    bio: user.bio,
    link_url: user.link_url,
    sex: user.gender,
    birthday: user.date_of_birth ? user.date_of_birth.toISOString().slice(0, 10) : null,
    profile_pic_url: user.profile_pic_url,
    banner_url: user.banner_url,
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

