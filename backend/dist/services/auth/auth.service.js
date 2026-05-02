"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleSignIn = exports.revokeRefreshToken = exports.refreshAccessToken = exports.loginUser = exports.registerUser = void 0;
const prismaClient_1 = __importDefault(require("../../config/prismaClient"));
const passwordUtils_1 = require("../../utils/passwordUtils");
const jwtUtils_1 = require("../../utils/jwtUtils");
const registerUser = async (data) => {
    const { name, email, password, username } = data;
    const existingUser = await prismaClient_1.default.users.findUnique({
        where: { email },
        select: { user_id: true },
    });
    if (existingUser) {
        throw new Error("User exists");
    }
    const hashedPassword = await (0, passwordUtils_1.hashPassword)(password);
    const user = await prismaClient_1.default.users.create({
        data: {
            name: name || "",
            email,
            password_hash: hashedPassword,
            username: username || null,
        },
        select: {
            user_id: true,
            name: true,
            email: true,
            username: true,
            created_at: true,
        },
    });
    return user;
};
exports.registerUser = registerUser;
const loginUser = async (data) => {
    const { email, password } = data;
    const user = await prismaClient_1.default.users.findUnique({
        where: { email },
        select: {
            user_id: true,
            name: true,
            email: true,
            username: true,
            password_hash: true,
            is_active: true,
        },
    });
    if (!user || !user.is_active) {
        throw new Error("Invalid email or password");
    }
    const isValidPassword = await (0, passwordUtils_1.comparePassword)(password, user.password_hash);
    if (!isValidPassword) {
        throw new Error("Invalid email or password");
    }
    // ✅ FIX: Added ! to ensure these are treated as strings for the JWT
    const payload = {
        userId: user.user_id,
        email: user.email,
        role: 'USER',
    };
    const accessToken = (0, jwtUtils_1.generateAccessToken)(payload);
    const refreshToken = (0, jwtUtils_1.generateRefreshToken)(payload);
    await prismaClient_1.default.refresh_tokens.create({
        data: {
            token: refreshToken,
            user_id: user.user_id,
            expires_at: new Date(Date.now() + jwtUtils_1.REFRESH_TOKEN_EXPIRES_IN_MS),
        },
    });
    return {
        accessToken,
        refreshToken,
        user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: 'USER',
        },
    };
};
exports.loginUser = loginUser;
/* =======================
   REFRESH TOKEN
======================= */
const refreshAccessToken = async (refreshToken) => {
    const decoded = (0, jwtUtils_1.verifyRefreshToken)(refreshToken);
    const storedToken = await prismaClient_1.default.refresh_tokens.findUnique({
        where: { token: refreshToken },
    });
    if (!storedToken || storedToken.revoked) {
        throw new Error("Invalid refresh token");
    }
    if (storedToken.expires_at < new Date()) {
        throw new Error("Refresh token expired");
    }
    // ✅ FIX: Added ! to decoded email
    const payload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
    };
    const newAccessToken = (0, jwtUtils_1.generateAccessToken)(payload);
    const newRefreshToken = (0, jwtUtils_1.generateRefreshToken)(payload);
    try {
        await prismaClient_1.default.refresh_tokens.create({
            data: {
                token: newRefreshToken,
                user_id: storedToken.user_id,
                expires_at: storedToken.expires_at,
            },
        });
    }
    catch (err) {
        const msg = String(err?.message || err);
        if (!msg.includes('Unique constraint failed') && err?.code !== 'P2002') {
            throw err;
        }
    }
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};
exports.refreshAccessToken = refreshAccessToken;
const revokeRefreshToken = async (refreshToken) => {
    await prismaClient_1.default.refresh_tokens.updateMany({
        where: {
            token: refreshToken,
            revoked: false,
        },
        data: {
            revoked: true,
        },
    });
};
exports.revokeRefreshToken = revokeRefreshToken;
/* =======================
   GOOGLE SIGN-IN
======================= */
const googleSignIn = async (idToken, opts) => {
    if (!idToken)
        throw new Error('idToken is required');
    const parts = idToken.split('.');
    if (parts.length < 2)
        throw new Error('Invalid idToken format');
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    const email = payload.email;
    const tokenName = payload.name || payload.given_name;
    if (!email)
        throw new Error('Google token does not contain an email');
    let user = await prismaClient_1.default.users.findUnique({
        where: { email },
        select: { user_id: true, name: true, email: true, username: true },
    });
    if (!user) {
        if (opts?.username) {
            const existingByUsername = await prismaClient_1.default.users.findUnique({ where: { username: opts.username }, select: { user_id: true } });
            if (existingByUsername) {
                throw new Error('Username already taken');
            }
        }
        const randomPassword = Math.random().toString(36) + Date.now().toString(36);
        const hashedPassword = await (0, passwordUtils_1.hashPassword)(randomPassword);
        user = await prismaClient_1.default.users.create({
            data: {
                name: opts?.name || tokenName || email.split('@')[0],
                email,
                password_hash: hashedPassword,
                username: opts?.username,
            },
            select: { user_id: true, name: true, email: true, username: true, created_at: true },
        });
    }
    // ✅ FIX: Added ! to user.email
    const payloadJwt = {
        userId: user.user_id,
        email: user.email,
        role: 'USER',
    };
    const accessToken = (0, jwtUtils_1.generateAccessToken)(payloadJwt);
    const refreshToken = (0, jwtUtils_1.generateRefreshToken)(payloadJwt);
    await prismaClient_1.default.refresh_tokens.create({
        data: {
            token: refreshToken,
            user_id: user.user_id,
            expires_at: new Date(Date.now() + jwtUtils_1.REFRESH_TOKEN_EXPIRES_IN_MS),
        },
    });
    return {
        accessToken,
        refreshToken,
        user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: 'USER',
        },
    };
};
exports.googleSignIn = googleSignIn;
