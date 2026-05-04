import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/authMiddleware';
import { createMeasurement, getMeasurements } from '../controllers/measurements.controller';

const router = Router();

// Protected route to create a measurement (with optional entry_image_url)
router.post('/', authMiddleware, createMeasurement);
router.get('/', authMiddleware, getMeasurements);

export default router;

