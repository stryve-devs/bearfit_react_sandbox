import { Router } from 'express';
import {
  createWorkoutPost,
  createWorkoutPostComment,
  discoverWorkoutPostById,
  discoverWorkoutPosts,
  toggleWorkoutPostLike,
} from '../../controllers/workout/workout.controller';
import { authMiddleware } from '../../middlewares/auth/authMiddleware';
import { validate } from '../../middlewares/validationMiddleware';
import { createPostCommentSchema, saveWorkoutPostSchema } from '../../utils/validationSchemas';

const router = Router();

router.post('/', authMiddleware, validate(saveWorkoutPostSchema), createWorkoutPost);
router.get('/discover', authMiddleware, discoverWorkoutPosts);
router.get('/posts/:postId', authMiddleware, discoverWorkoutPostById);
router.post('/posts/:postId/like', authMiddleware, toggleWorkoutPostLike);
router.post('/posts/:postId/comments', authMiddleware, validate(createPostCommentSchema), createWorkoutPostComment);

export default router;
