import { Router } from 'express';
import { getUserById, getFollowersList, getFollowingList } from '../controllers/users.controller';

const router = Router();

// Public user lookup
router.get('/:id', getUserById);
router.get('/:id/followers', getFollowersList);
router.get('/:id/following', getFollowingList);

export default router;
