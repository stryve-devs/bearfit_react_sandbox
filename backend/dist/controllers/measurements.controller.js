"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMeasurement = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
// Create a new measurement record for the authenticated user
const createMeasurement = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { measurement_date, body_weight, waist, body_fat, lean_body_mass, neck, shoulder, chest, left_bicep, right_bicep, left_forearm, right_forearm, abdomen, left_thigh, right_thigh, left_calf, right_calf, entry_image_url, } = req.body || {};
        if (!measurement_date)
            return res.status(400).json({ message: 'measurement_date is required' });
        const record = await prismaClient_1.default.measurement.create({
            data: {
                user_id: userId,
                measurement_date: new Date(measurement_date),
                body_weight: body_weight ?? null,
                waist: waist ?? null,
                body_fat: body_fat ?? null,
                lean_body_mass: lean_body_mass ?? null,
                neck: neck ?? null,
                shoulder: shoulder ?? null,
                chest: chest ?? null,
                left_bicep: left_bicep ?? null,
                right_bicep: right_bicep ?? null,
                left_forearm: left_forearm ?? null,
                right_forearm: right_forearm ?? null,
                abdomen: abdomen ?? null,
                left_thigh: left_thigh ?? null,
                right_thigh: right_thigh ?? null,
                left_calf: left_calf ?? null,
                right_calf: right_calf ?? null,
                entry_image_url: entry_image_url ?? null,
            },
        });
        return res.status(201).json({ message: 'Measurement created', measurement: record });
    }
    catch (error) {
        console.error('[measurements.controller] createMeasurement error', error);
        return res.status(500).json({ message: error.message || 'Failed to create measurement' });
    }
};
exports.createMeasurement = createMeasurement;
