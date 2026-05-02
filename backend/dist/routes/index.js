"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const users_routes_1 = __importDefault(require("./users.routes"));
const uploads_routes_1 = __importDefault(require("./uploads.routes"));
const workout_routes_1 = __importDefault(require("./workout/workout.routes"));
const measurements_routes_1 = __importDefault(require("./measurements.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/users', users_routes_1.default);
router.use('/uploads', uploads_routes_1.default);
router.use('/workouts', workout_routes_1.default);
router.use('/measurements', measurements_routes_1.default);
// Health check (can also be in server.ts)
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.default = router;
