"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUserProfile = void 0;
const prismaClient_1 = __importDefault(require("../../config/prismaClient"));
const getCurrentUserProfile = async (userId) => {
    const user = await prismaClient_1.default.users.findUnique({
        where: { user_id: userId },
        select: {
            username: true,
            name: true,
            bio: true,
            link_url: true,
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
        throw new Error('User not found');
    }
    return {
        username: user.username,
        name: user.name,
        bio: user.bio,
        link_url: user.link_url,
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
exports.getCurrentUserProfile = getCurrentUserProfile;
