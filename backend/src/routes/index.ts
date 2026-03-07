import { Router } from 'express';
import authRoutes from './auth/auth.routes';

const router = Router();

router.use('/auth', authRoutes);

// Health check (can also be in server.ts)
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;