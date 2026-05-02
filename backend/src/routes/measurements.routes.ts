import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/authMiddleware';
import { createMeasurement } from '../controllers/measurements.controller';

const router = Router();

// Protected route to create a measurement (with optional entry_image_url)
router.post('/', authMiddleware, createMeasurement);

export default router;

