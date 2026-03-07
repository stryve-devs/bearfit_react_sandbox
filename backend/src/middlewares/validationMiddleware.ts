// backend/src/middlewares/validationMiddleware.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Log detailed errors to the Docker console for debugging
                console.log('❌ Validation Error:', JSON.stringify(error.errors, null, 2));

                return res.status(400).json({
                    message: 'Validation failed',
                    errors: error.errors.map((err) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
};