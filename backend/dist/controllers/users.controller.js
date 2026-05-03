"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPosts = exports.getFollowingList = exports.getFollowersList = exports.getUserById = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const jwtUtils_1 = require("../utils/jwtUtils");
const validationSchemas_1 = require("../utils/validationSchemas");
const workout_service_1 = require("../services/workout/workout.service");
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
                bio: true,
                link_url: true,
                profile_pic_url: true,
            },
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const id = user.user_id;
        // Try to determine whether the requester follows this user. This is optional
        // — if the caller did not provide a valid Bearer token, we'll skip it.
        let is_followed_by_current_user = false;
        try {
            const authHeader = String(req.headers.authorization || '');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const decoded = (0, jwtUtils_1.verifyAccessToken)(token);
                const currentUserId = Number(decoded?.userId || 0);
                if (currentUserId && currentUserId !== id) {
                    const cnt = await prismaClient_1.default.user_follows.count({ where: { follower_id: currentUserId, following_id: id } });
                    is_followed_by_current_user = cnt > 0;
                }
            }
        }
        catch (err) {
            // ignore token errors and treat as unauthenticated
            is_followed_by_current_user = false;
        }
        // Fetch counts in parallel
        const [workoutCount, followingCount, followersCount] = await Promise.all([
            prismaClient_1.default.workouts.count({ where: { user_id: id } }),
            prismaClient_1.default.user_follows.count({ where: { follower_id: id } }),
            prismaClient_1.default.user_follows.count({ where: { following_id: id } }),
        ]);
        return res.status(200).json({
            ...user,
            is_followed_by_current_user,
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
const getUserPosts = async (req, res) => {
    try {
        const viewerUserId = req.user?.userId;
        if (!viewerUserId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
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
        const query = validationSchemas_1.discoverFeedQuerySchema.parse(req.query);
        const limit = query.limit ?? 20;
        const result = await (0, workout_service_1.getUserProfilePosts)(viewerUserId, targetUser.user_id, limit, query.cursor);
        return res.status(200).json({
            posts: result.posts,
            nextCursor: result.nextCursor,
        });
    }
    catch (error) {
        console.error('[users.controller] getUserPosts error', error);
        return res.status(500).json({ message: error?.message || 'Failed to fetch user posts' });
    }
};
exports.getUserPosts = getUserPosts;
