import { Router } from 'express';
import { getUserById, getFollowersList, getFollowingList, getUserPosts } from '../controllers/users.controller';
import { authMiddleware } from '../middlewares/auth/authMiddleware';

const router = Router();

// Public user lookup
router.get('/:id/posts', authMiddleware, getUserPosts);
router.get('/:id', getUserById);
router.get('/:id/followers', getFollowersList);
router.get('/:id/following', getFollowingList);

export default router;
