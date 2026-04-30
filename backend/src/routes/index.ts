import { Router, Request, Response } from 'express';
import authRoutes from './auth/auth.routes';
import usersRoutes from './users.routes';
import uploadsRoutes from './uploads.routes';
import workoutRoutes from './workout/workout.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/workouts', workoutRoutes);

// Health check (can also be in server.ts)
router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;