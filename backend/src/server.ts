import 'dotenv/config';
import express from 'express';
import { json } from 'body-parser';
import routes from './routes';
import corsConfig from './config/corsConfig';
import { connectRedis } from './config/redisClient';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

// Middleware
app.use(json());
app.use(corsConfig);

// Routes
app.use('/api', routes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

const start = async () => {
    try {
        await connectRedis();
        console.log('✅ Redis connected');
    } catch (err) {
        console.warn('⚠️  Warning: Failed to connect to Redis. Continuing without Redis.', err);
    }

    const HOST = process.env.HOST || '0.0.0.0';
    app.listen(PORT, HOST, () => {
        console.log(`🚀 Server is running at http://${HOST}:${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV}`);
        console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    });
};

start();