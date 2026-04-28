"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpToEmail = sendOtpToEmail;
exports.verifyOtpForEmail = verifyOtpForEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const redisClient_1 = __importStar(require("../../config/redisClient"));
const OTP_TTL_SECONDS = 60 * 5; // 5 minutes
function _generateOtp() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}
async function sendOtpToEmail(email) {
    const otp = _generateOtp();
    const key = `otp:${email}`;
    // ensure redis connected
    try {
        await (0, redisClient_1.connectRedis)();
        await redisClient_1.default.set(key, otp, { EX: OTP_TTL_SECONDS });
    }
    catch (err) {
        console.error('Failed to store OTP in redis', err);
        throw new Error('internal');
    }
    // Prepare transporter using env config
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = Number(process.env.EMAIL_PORT || '587');
    const secure = (process.env.EMAIL_SECURE || 'false') === 'true';
    // Read env vars and normalize: strip surrounding quotes and internal whitespace in pass
    const rawUser = process.env.EMAIL_USER || '';
    const rawPass = process.env.EMAIL_PASS || '';
    const user = rawUser.replace(/(^\")|("$)/g, '').trim(); // remove possible surrounding quotes
    // some users paste app passwords with spaces — remove all whitespace characters
    const pass = rawPass.replace(/(^\")|("$)/g, '').replace(/\s+/g, '').trim(); // required
    const from = process.env.EMAIL_FROM || 'jeffamiduu@gmail.com';
    if (!user || !pass) {
        console.error('EMAIL_USER/EMAIL_PASS not configured');
        throw new Error('email_not_configured');
    }
    const transporter = nodemailer_1.default.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
    console.log('SMTP config', { host, port, secure, user, passLength: pass.length });
    try {
        // verify SMTP connection/auth early so errors are clearer
        // (this will surface auth errors like invalid credentials)
        // Note: verify() will throw if auth fails
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await transporter.verify();
    }
    catch (err) {
        console.error('SMTP verify failed', err);
        throw new Error('email_auth_error');
    }
    const mailOpts = {
        from,
        to: email,
        subject: 'Your Bearfit verification code',
        text: `Your Bearfit verification code is ${otp}. It expires in 5 minutes.`,
        html: `<p>Your Bearfit verification code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    };
    try {
        await transporter.sendMail(mailOpts);
    }
    catch (err) {
        console.error('Failed to send OTP email', err);
        // if this is an auth error surfaced at send time, map to auth error
        // nodemailer errors often include a `code` or `responseCode` property
        // but we'll keep mapping simple
        throw new Error('email_send_failed');
    }
}
async function verifyOtpForEmail(email, code) {
    try {
        await (0, redisClient_1.connectRedis)();
        const key = `otp:${email}`;
        const stored = await redisClient_1.default.get(key);
        if (!stored)
            return false;
        if (stored !== code)
            return false;
        // delete the key so code cannot be reused
        await redisClient_1.default.del(key);
        return true;
    }
    catch (err) {
        console.error('Failed to verify OTP', err);
        return false;
    }
}
exports.default = {
    sendOtpToEmail,
    verifyOtpForEmail,
};
