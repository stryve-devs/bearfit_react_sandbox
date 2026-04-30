"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = void 0;
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
