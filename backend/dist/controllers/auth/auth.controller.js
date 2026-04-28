"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfollow = exports.follow = exports.me = exports.verifyOtp = exports.sendOtp = exports.checkEmailExists = exports.registerGoogle = exports.googleAuth = exports.logout = exports.refresh = exports.login = exports.register = exports.checkUsernameExists = void 0;
const auth_service_1 = require("../../services/auth/auth.service");
const jwtUtils_1 = require("../../utils/jwtUtils");
const prismaClient_1 = __importDefault(require("../../config/prismaClient"));
const otp_service_1 = __importDefault(require("../../services/auth/otp.service"));
const validationSchemas_1 = require("../../utils/validationSchemas");
/* =======================
   CHECK USERNAME EXISTS
======================= */
const checkUsernameExists = async (req, res) => {
    try {
        const username = String(req.query.username || '').trim();
        if (!username) {
            return res.status(400).json({ message: 'username query parameter is required' });
        }
        const user = await prismaClient_1.default.users.findUnique({
            where: { username },
            select: { user_id: true }
        });
        return res.status(200).json({ exists: !!user });
    }
    catch (error) {
        console.error('❌ Database check error:', error);
        return res.status(500).json({ message: 'Failed to check username' });
    }
};
exports.checkUsernameExists = checkUsernameExists;
/* =======================
   REGISTER
======================= */
const register = async (req, res, next) => {
    try {
        const { username, email, password, name } = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({
                message: "Username, email, and password are required",
            });
        }
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                message: "Username must be 3-20 characters (letters, numbers, _, -)",
            });
        }
        const existingUsername = await prismaClient_1.default.users.findUnique({
            where: { username },
        });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already taken" });
        }
        const user = await (0, auth_service_1.registerUser)({
            name: name || username || email.split('@')[0],
            email,
            password,
            username,
        });
        const payload = { userId: user.user_id, email: user.email, role: 'USER' };
        const accessToken = (0, jwtUtils_1.generateAccessToken)(payload);
        const refreshToken = (0, jwtUtils_1.generateRefreshToken)(payload);
        await prismaClient_1.default.refresh_tokens.create({
            data: {
                token: refreshToken,
                user_id: user.user_id,
                expires_at: new Date(Date.now() + jwtUtils_1.REFRESH_TOKEN_EXPIRES_IN_MS),
            },
        });
        return res.status(201).json({
            message: "Registration successful",
            accessToken,
            refreshToken,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                name: user.name
            }
        });
    }
    catch (error) {
        console.error('❌ Registration error:', error);
        return res.status(400).json({
            message: error.message || "Registration failed",
        });
    }
};
exports.register = register;
/* =======================
   LOGIN
======================= */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }
        const result = await (0, auth_service_1.loginUser)({ email, password });
        return res.status(200).json({ message: "Login successful", ...result });
    }
    catch (error) {
        return res.status(401).json({ message: error.message || "Login failed" });
    }
};
exports.login = login;
/* =======================
   REFRESH TOKEN
======================= */
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ message: "refreshToken is required" });
        const tokens = await (0, auth_service_1.refreshAccessToken)(refreshToken);
        return res.status(200).json({ message: "Token refreshed successfully", ...tokens });
    }
    catch (error) {
        return res.status(401).json({ message: error.message || "Invalid refresh token" });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "refreshToken is required" });
        }
        await (0, auth_service_1.revokeRefreshToken)(refreshToken);
        return res.status(200).json({ message: "Logout successful" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message || "Logout failed" });
    }
};
exports.logout = logout;
/* =======================
   GOOGLE AUTH
======================= */
const googleAuth = async (req, res) => {
    try {
        const { idToken, username, name, email } = req.body;
        if (idToken) {
            // ✅ Matches Service definition: googleSignIn(idToken, { username, name })
            const result = await (0, auth_service_1.googleSignIn)(idToken, { username, name });
            return res.status(200).json({ message: 'Google sign-in successful', ...result });
        }
        if (email) {
            const existing = await prismaClient_1.default.users.findUnique({
                where: { email },
                select: { user_id: true, name: true, email: true, username: true }
            });
            if (existing) {
                const payload = { userId: existing.user_id, email: existing.email, role: 'USER' };
                const accessToken = (0, jwtUtils_1.generateAccessToken)(payload);
                const refreshToken = (0, jwtUtils_1.generateRefreshToken)(payload);
                await prismaClient_1.default.refresh_tokens.create({
                    data: {
                        token: refreshToken,
                        user_id: existing.user_id,
                        expires_at: new Date(Date.now() + jwtUtils_1.REFRESH_TOKEN_EXPIRES_IN_MS),
                    },
                });
                return res.status(200).json({
                    message: 'Google sign-in (email fallback) successful',
                    accessToken,
                    refreshToken,
                    user: existing
                });
            }
            const randomPassword = Math.random().toString(36) + Date.now().toString(36);
            await (0, auth_service_1.registerUser)({
                name: name || email.split('@')[0],
                email,
                password: randomPassword,
                username
            });
            const loginResult = await (0, auth_service_1.loginUser)({ email, password: randomPassword });
            return res.status(200).json({ message: 'Google fallback registration successful', ...loginResult });
        }
        return res.status(400).json({ message: 'Either idToken or email is required' });
    }
    catch (error) {
        console.error('[authController] googleAuth error', error);
        return res.status(400).json({ message: error.message || "Google auth failed" });
    }
};
exports.googleAuth = googleAuth;
/* =======================
   REGISTER (GOOGLE COMPLETE)
======================= */
const registerGoogle = async (req, res) => {
    try {
        const { idToken, email, username, name } = req.body;
        if (idToken) {
            const result = await (0, auth_service_1.googleSignIn)(idToken, { username, name });
            return res.status(200).json({ message: 'Google registration successful', ...result });
        }
        if (!email)
            return res.status(400).json({ message: 'email is required' });
        const existing = await prismaClient_1.default.users.findUnique({ where: { email }, select: { user_id: true } });
        if (existing)
            return res.status(409).json({ message: 'User already exists' });
        const randomPassword = Math.random().toString(36) + Date.now().toString(36);
        await (0, auth_service_1.registerUser)({ name: name || email.split('@')[0], email, password: randomPassword, username });
        const loginResult = await (0, auth_service_1.loginUser)({ email, password: randomPassword });
        return res.status(201).json({ message: 'Google registration successful', ...loginResult });
    }
    catch (error) {
        return res.status(400).json({ message: error.message || 'Google registration failed' });
    }
};
exports.registerGoogle = registerGoogle;
/* =======================
   CHECK EMAIL EXISTS
======================= */
const checkEmailExists = async (req, res) => {
    try {
        const email = String(req.query.email || '').trim();
        if (!email)
            return res.status(400).json({ message: 'email is required' });
        const user = await prismaClient_1.default.users.findUnique({ where: { email }, select: { user_id: true } });
        return res.status(200).json({ exists: !!user });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to check email' });
    }
};
exports.checkEmailExists = checkEmailExists;
/* =======================
   OTP SERVICES
======================= */
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: 'email is required' });
        await otp_service_1.default.sendOtpToEmail(String(email).trim());
        return res.status(200).json({ message: 'OTP sent' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message || 'Failed to send OTP' });
    }
};
exports.sendOtp = sendOtp;
const verifyOtp = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code)
            return res.status(400).json({ message: 'email and code required' });
        const ok = await otp_service_1.default.verifyOtpForEmail(String(email).trim(), String(code).trim());
        if (!ok)
            return res.status(400).json({ message: 'Invalid or expired code' });
        return res.status(200).json({ message: 'OTP verified' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to verify OTP' });
    }
};
exports.verifyOtp = verifyOtp;
const me = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const profile = await (0, auth_service_1.getCurrentUserProfile)(userId);
        return res.status(200).json(profile);
    }
    catch (error) {
        if (error?.message === "User not found") {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(500).json({ message: "Failed to fetch profile" });
    }
};
exports.me = me;
const follow = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const params = validationSchemas_1.targetUserIdParamsSchema.parse(req.params);
        const result = await (0, auth_service_1.followUser)(userId, params.targetUserId);
        return res.status(200).json(result);
    }
    catch (error) {
        if (error?.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        }
        if (error?.message === 'Cannot follow yourself') {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Failed to follow user' });
    }
};
exports.follow = follow;
const unfollow = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const params = validationSchemas_1.targetUserIdParamsSchema.parse(req.params);
        const result = await (0, auth_service_1.unfollowUser)(userId, params.targetUserId);
        return res.status(200).json(result);
    }
    catch (error) {
        if (error?.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        }
        if (error?.message === 'Cannot unfollow yourself') {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Failed to unfollow user' });
    }
};
exports.unfollow = unfollow;
