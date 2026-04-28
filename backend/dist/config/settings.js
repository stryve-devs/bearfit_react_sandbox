"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_CLIENT_ID_WEB = exports.GOOGLE_CLIENT_IDS = exports.REDIS_URL = exports.DATABASE_URL = exports.NODE_ENV = exports.PORT = exports.JWT_REFRESH_EXPIRES_IN = exports.JWT_ACCESS_EXPIRES_IN = exports.JWT_REFRESH_SECRET = exports.JWT_ACCESS_SECRET = void 0;
require("dotenv/config");
exports.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
exports.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
exports.JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
exports.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
exports.PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.DATABASE_URL = process.env.DATABASE_URL;
exports.REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
exports.GOOGLE_CLIENT_IDS = process.env.GOOGLE_CLIENT_IDS?.split(',') || [];
exports.GOOGLE_CLIENT_ID_WEB = process.env.GOOGLE_CLIENT_ID_WEB;
if (!exports.JWT_ACCESS_SECRET || !exports.JWT_REFRESH_SECRET) {
    throw new Error('Missing required JWT secrets in environment variables');
}
if (!exports.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL in environment variables');
}
