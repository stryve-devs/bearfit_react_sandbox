"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/auth/authMiddleware");
const uploads_controller_1 = require("../controllers/uploads.controller");
const router = (0, express_1.Router)();
// Protected route to request a presigned upload URL for profile pictures
router.post('/profile-picture', authMiddleware_1.authMiddleware, uploads_controller_1.getUploadUrl);
// New: presign for measurement photos
router.post('/measurement-photo', authMiddleware_1.authMiddleware, uploads_controller_1.getMeasurementUploadUrl);
// Proxy upload for measurement photos (raw image body)
router.post('/proxy-measurement', authMiddleware_1.authMiddleware, express_2.default.raw({ type: '*/*', limit: '20mb' }), uploads_controller_1.uploadMeasurementProxy);
// Debug route (unauthenticated) to request a presigned URL for local testing only
router.post('/debug/profile-picture', uploads_controller_1.getUploadUrlDebug);
// Proxy route for serving images by key via backend (useful when clients can't access R2 directly)
router.get('/proxy', uploads_controller_1.proxyImage);
exports.default = router;
