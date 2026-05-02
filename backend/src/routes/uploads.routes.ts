import { Router } from 'express';
import express from 'express';
import { authMiddleware } from '../middlewares/auth/authMiddleware';
import { getUploadUrl, getUploadUrlDebug, proxyImage, getMeasurementUploadUrl, uploadMeasurementProxy } from '../controllers/uploads.controller';

const router = Router();

// Protected route to request a presigned upload URL for profile pictures
router.post('/profile-picture', authMiddleware, getUploadUrl);

// New: presign for measurement photos
router.post('/measurement-photo', authMiddleware, getMeasurementUploadUrl);

// Proxy upload for measurement photos (raw image body)
router.post('/proxy-measurement', authMiddleware, express.raw({ type: '*/*', limit: '20mb' }), uploadMeasurementProxy);

// Debug route (unauthenticated) to request a presigned URL for local testing only
router.post('/debug/profile-picture', getUploadUrlDebug);

// Proxy route for serving images by key via backend (useful when clients can't access R2 directly)
router.get('/proxy', proxyImage);

export default router;
