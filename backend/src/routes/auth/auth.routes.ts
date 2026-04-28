// backend/src/routes/auth/auth.routes.ts
import { Router } from 'express';
import {
    register,
    login,
    refresh,
    logout,
    googleAuth,
    registerGoogle,
    checkEmailExists,
    checkUsernameExists,
    sendOtp,
    verifyOtp,
    me,
} from '../../controllers/auth/auth.controller';
import { validate } from '../../middlewares/validationMiddleware';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    googleAuthSchema,
} from '../../utils/validationSchemas';
import { authMiddleware } from '../../middlewares/auth/authMiddleware';

const router = Router();

// Email/Password Auth
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.post('/logout', validate(refreshTokenSchema), logout);

// Google Auth
router.post('/google', validate(googleAuthSchema), googleAuth);
router.post('/register-google', validate(googleAuthSchema), registerGoogle);

// Utility Checks
router.get('/exists', checkEmailExists);
router.get('/username-exists', checkUsernameExists);
router.get('/me', authMiddleware, me);

// OTP
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;