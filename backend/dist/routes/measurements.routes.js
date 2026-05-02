"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/auth/authMiddleware");
const measurements_controller_1 = require("../controllers/measurements.controller");
const router = (0, express_1.Router)();
// Protected route to create a measurement (with optional entry_image_url)
router.post('/', authMiddleware_1.authMiddleware, measurements_controller_1.createMeasurement);
exports.default = router;
