import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/authMiddleware';
import { getUploadUrl, getUploadUrlDebug, proxyImage } from '../controllers/uploads.controller';

const router = Router();

// Protected route to request a presigned upload URL for profile pictures
router.post('/profile-picture', authMiddleware, getUploadUrl);

// Debug route (unauthenticated) to request a presigned URL for local testing only
router.post('/debug/profile-picture', getUploadUrlDebug);

// Proxy route for serving images by key via backend (useful when clients can't access R2 directly)
router.get('/proxy', proxyImage);

export default router;
