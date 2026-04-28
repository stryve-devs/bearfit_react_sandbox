"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const routes_1 = __importDefault(require("./routes"));
const corsConfig_1 = __importDefault(require("./config/corsConfig"));
const redisClient_1 = require("./config/redisClient");
const app = (0, express_1.default)();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
// Middleware
app.use((0, body_parser_1.json)());
app.use(corsConfig_1.default);
// Routes
app.use('/api', routes_1.default);
// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});
const start = async () => {
    try {
        await (0, redisClient_1.connectRedis)();
        console.log('✅ Redis connected');
    }
    catch (err) {
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
