import { Router, Request, Response } from 'express';
import authRoutes from './auth/auth.routes';
import workoutRoutes from './workout/workout.routes';
import uploadsRoutes from './uploads.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workouts', workoutRoutes);
router.use('/uploads', uploadsRoutes);

// Health check (can also be in server.ts)
router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;