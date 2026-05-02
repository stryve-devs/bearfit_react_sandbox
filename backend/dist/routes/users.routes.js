"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const authMiddleware_1 = require("../middlewares/auth/authMiddleware");
const router = (0, express_1.Router)();
// Public user lookup
router.get('/:id/posts', authMiddleware_1.authMiddleware, users_controller_1.getUserPosts);
router.get('/:id', users_controller_1.getUserById);
router.get('/:id/followers', users_controller_1.getFollowersList);
router.get('/:id/following', users_controller_1.getFollowingList);
exports.default = router;
