"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/auth/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../../controllers/auth/auth.controller");
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const validationSchemas_1 = require("../../utils/validationSchemas");
const authMiddleware_1 = require("../../middlewares/auth/authMiddleware");
const router = (0, express_1.Router)();
// Email/Password Auth
router.post('/register', (0, validationMiddleware_1.validate)(validationSchemas_1.registerSchema), auth_controller_1.register);
router.post('/login', (0, validationMiddleware_1.validate)(validationSchemas_1.loginSchema), auth_controller_1.login);
router.post('/refresh', (0, validationMiddleware_1.validate)(validationSchemas_1.refreshTokenSchema), auth_controller_1.refresh);
router.post('/logout', (0, validationMiddleware_1.validate)(validationSchemas_1.refreshTokenSchema), auth_controller_1.logout);
// Google Auth
router.post('/google', (0, validationMiddleware_1.validate)(validationSchemas_1.googleAuthSchema), auth_controller_1.googleAuth);
router.post('/register-google', (0, validationMiddleware_1.validate)(validationSchemas_1.googleAuthSchema), auth_controller_1.registerGoogle);
// Utility Checks
router.get('/exists', auth_controller_1.checkEmailExists);
router.get('/username-exists', auth_controller_1.checkUsernameExists);
router.get('/me', authMiddleware_1.authMiddleware, auth_controller_1.me);
router.put('/profile', authMiddleware_1.authMiddleware, auth_controller_1.updateProfile);
router.get('/suggestions', authMiddleware_1.authMiddleware, auth_controller_1.suggestedUsers);
router.post('/follow/:targetUserId', authMiddleware_1.authMiddleware, auth_controller_1.follow);
router.delete('/follow/:targetUserId', authMiddleware_1.authMiddleware, auth_controller_1.unfollow);
router.delete('/follower/:followerId', authMiddleware_1.authMiddleware, auth_controller_1.removeFollowerController);
console.log('[auth.routes] registered: GET /auth/suggestions');
// OTP
router.post('/send-otp', auth_controller_1.sendOtp);
router.post('/verify-otp', auth_controller_1.verifyOtp);
exports.default = router;
