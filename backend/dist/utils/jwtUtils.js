"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = exports.REFRESH_TOKEN_EXPIRES_IN_MS = exports.ACCESS_TOKEN_EXPIRES_IN_MS = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Secrets (must come from environment variables)
 */
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
/**
 * Expiry configuration
 */
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
// Safe fallback defaults when env vars are absent.
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
// Parse simple duration strings like "10s", "5m", "2h", "7d" into milliseconds
const parseDurationToMs = (value) => {
    const trimmed = String(value).trim();
    const m = trimmed.match(/^(\d+)(s|m|h|d)?$/i);
    if (!m)
        return 0;
    const n = parseInt(m[1], 10);
    const unit = (m[2] || "s").toLowerCase();
    switch (unit) {
        case "s":
            return n * 1000;
        case "m":
            return n * 60 * 1000;
        case "h":
            return n * 60 * 60 * 1000;
        case "d":
            return n * 24 * 60 * 60 * 1000;
        default:
            return n * 1000;
    }
};
exports.ACCESS_TOKEN_EXPIRES_IN_MS = parseDurationToMs(String(ACCESS_TOKEN_EXPIRES_IN));
exports.REFRESH_TOKEN_EXPIRES_IN_MS = parseDurationToMs(String(REFRESH_TOKEN_EXPIRES_IN));
/**
 * Fail fast if secrets are missing
 * (important for both dev and prod)
 */
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error("JWT secrets are not defined in environment variables");
}
/**
 * 🔐 Generate Access Token
 */
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
};
exports.generateAccessToken = generateAccessToken;
/**
 * 🔁 Generate Refresh Token
 */
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * ✅ Verify Access Token
 */
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * ✅ Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
