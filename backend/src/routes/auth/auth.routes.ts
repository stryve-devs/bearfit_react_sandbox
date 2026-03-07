// backend/src/routes/auth/auth.routes.ts
import { Router } from 'express';
import {
    register,
    login,
    refresh,
    googleAuth,
    registerGoogle,
    checkEmailExists,
    checkUsernameExists,
    sendOtp,
    verifyOtp,
} from '../../controllers/auth/auth.controller';
import { validate } from '../../middlewares/validationMiddleware';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    googleAuthSchema,
} from '../../utils/validationSchemas';

const router = Router();

// Email/Password Auth
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refresh);

// Google Auth
router.post('/google', validate(googleAuthSchema), googleAuth);
router.post('/register-google', validate(googleAuthSchema), registerGoogle);

// Utility Checks
router.get('/exists', checkEmailExists);
router.get('/username-exists', checkUsernameExists);

// OTP
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;