"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/auth/authMiddleware");
const uploads_controller_1 = require("../controllers/uploads.controller");
const router = (0, express_1.Router)();
// Protected route to request a presigned upload URL for profile pictures
router.post('/profile-picture', authMiddleware_1.authMiddleware, uploads_controller_1.getUploadUrl);
// New: presign for measurement photos
router.post('/measurement-photo', authMiddleware_1.authMiddleware, uploads_controller_1.getMeasurementUploadUrl);
// Debug route (unauthenticated) to request a presigned URL for local testing only
router.post('/debug/profile-picture', uploads_controller_1.getUploadUrlDebug);
// Proxy route for serving images by key via backend (useful when clients can't access R2 directly)
router.get('/proxy', uploads_controller_1.proxyImage);
exports.default = router;
