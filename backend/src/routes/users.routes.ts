import { Router } from 'express';
import { getUserById } from '../controllers/users.controller';

const router = Router();

// Public user lookup
router.get('/:id', getUserById);

export default router;

