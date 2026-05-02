"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuggestedUsers = exports.removeFollower = exports.unfollowUser = exports.followUser = void 0;
const prismaClient_1 = __importDefault(require("../../config/prismaClient"));
const ensureTargetUserExists = async (targetUserId) => {
    const target = await prismaClient_1.default.users.findUnique({
        where: { user_id: targetUserId },
        select: { user_id: true },
    });
    if (!target) {
        throw new Error('User not found');
    }
};
const followUser = async (followerId, followingId) => {
    if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
    }
    await ensureTargetUserExists(followingId);
    try {
        await prismaClient_1.default.user_follows.create({
            data: {
                follower_id: followerId,
                following_id: followingId,
            },
        });
    }
    catch (error) {
        if (error?.code !== 'P2002') {
            throw error;
        }
    }
    return { isFollowing: true };
};
exports.followUser = followUser;
const unfollowUser = async (followerId, followingId) => {
    if (followerId === followingId) {
        throw new Error('Cannot unfollow yourself');
    }
    await ensureTargetUserExists(followingId);
    await prismaClient_1.default.user_follows.deleteMany({
        where: {
            follower_id: followerId,
            following_id: followingId,
        },
    });
    return { isFollowing: false };
};
exports.unfollowUser = unfollowUser;
const removeFollower = async (userId, followerId) => {
    if (userId === followerId) {
        throw new Error('Cannot remove yourself');
    }
    await ensureTargetUserExists(followerId);
    const deleted = await prismaClient_1.default.user_follows.deleteMany({
        where: {
            follower_id: followerId,
            following_id: userId,
        },
    });
    return { removed: deleted.count > 0 };
};
exports.removeFollower = removeFollower;
const getSuggestedUsers = async (userId, limit = 8) => {
    const followingRows = await prismaClient_1.default.user_follows.findMany({
        where: { follower_id: userId },
        select: { following_id: true },
    });
    const excludeIds = followingRows.map((r) => r.following_id);
    excludeIds.push(userId);
    const users = await prismaClient_1.default.users.findMany({
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
exports.getSuggestedUsers = getSuggestedUsers;
