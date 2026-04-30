"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowingList = exports.getFollowersList = exports.getUserById = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const getUserById = async (req, res) => {
    try {
        const raw = String(req.params.id || '');
        if (!raw)
            return res.status(400).json({ message: 'Invalid user id' });
        // Determine if param is numeric user_id or username
        const asNum = Number(raw);
        const isNumeric = !Number.isNaN(asNum) && Number.isFinite(asNum) && String(asNum) === raw;
        // Fetch user basic info by id or username
        const user = await prismaClient_1.default.users.findUnique({
            where: isNumeric ? { user_id: asNum } : { username: raw },
            select: {
                user_id: true,
                username: true,
                name: true,
                profile_pic_url: true,
            },
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const id = user.user_id;
        // Fetch counts in parallel
        const [workoutCount, followingCount, followersCount] = await Promise.all([
            prismaClient_1.default.workouts.count({ where: { user_id: id } }),
            prismaClient_1.default.user_follows.count({ where: { follower_id: id } }),
            prismaClient_1.default.user_follows.count({ where: { following_id: id } }),
        ]);
        return res.status(200).json({
            ...user,
            workoutCount,
            followingCount,
            followersCount,
        });
    }
    catch (error) {
        console.error('[users.controller] getUserById error', error);
        return res.status(500).json({ message: error?.message || 'Failed to fetch user' });
    }
};
exports.getUserById = getUserById;
const getFollowersList = async (req, res) => {
    try {
        const raw = String(req.params.id || '');
        if (!raw)
            return res.status(400).json({ message: 'Invalid user id' });
        const asNum = Number(raw);
        const isNumeric = !Number.isNaN(asNum) && Number.isFinite(asNum) && String(asNum) === raw;
        // Resolve target user id
        const targetUser = isNumeric
            ? await prismaClient_1.default.users.findUnique({ where: { user_id: asNum }, select: { user_id: true } })
            : await prismaClient_1.default.users.findUnique({ where: { username: raw }, select: { user_id: true } });
        if (!targetUser)
            return res.status(404).json({ message: 'User not found' });
        const rows = await prismaClient_1.default.user_follows.findMany({
            where: { following_id: targetUser.user_id },
            select: {
                follower: {
                    select: { user_id: true, username: true, name: true, profile_pic_url: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        const followers = rows.map((r) => ({
            user_id: r.follower.user_id,
            username: r.follower.username,
            name: r.follower.name,
            profile_pic_url: r.follower.profile_pic_url,
        }));
        return res.status(200).json({ followers });
    }
    catch (error) {
        console.error('[users.controller] getFollowersList error', error);
        return res.status(500).json({ message: error?.message || 'Failed to fetch followers' });
    }
};
exports.getFollowersList = getFollowersList;
const getFollowingList = async (req, res) => {
    try {
        const raw = String(req.params.id || '');
        if (!raw)
            return res.status(400).json({ message: 'Invalid user id' });
        const asNum = Number(raw);
        const isNumeric = !Number.isNaN(asNum) && Number.isFinite(asNum) && String(asNum) === raw;
        const targetUser = isNumeric
            ? await prismaClient_1.default.users.findUnique({ where: { user_id: asNum }, select: { user_id: true } })
            : await prismaClient_1.default.users.findUnique({ where: { username: raw }, select: { user_id: true } });
        if (!targetUser)
            return res.status(404).json({ message: 'User not found' });
        const rows = await prismaClient_1.default.user_follows.findMany({
            where: { follower_id: targetUser.user_id },
            select: {
                following: {
                    select: { user_id: true, username: true, name: true, profile_pic_url: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        const following = rows.map((r) => ({
            user_id: r.following.user_id,
            username: r.following.username,
            name: r.following.name,
            profile_pic_url: r.following.profile_pic_url,
        }));
        return res.status(200).json({ following });
    }
    catch (error) {
        console.error('[users.controller] getFollowingList error', error);
        return res.status(500).json({ message: error?.message || 'Failed to fetch following list' });
    }
};
exports.getFollowingList = getFollowingList;
