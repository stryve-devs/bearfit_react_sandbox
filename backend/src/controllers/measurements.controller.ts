import { Request, Response } from 'express';
import prisma from '../config/prismaClient';
import { S3Client, CopyObjectCommand } from '@aws-sdk/client-s3';

const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.EXPO_PUBLIC_R2_BUCKET_NAME || 'bearfit-assets';
const R2_PUBLIC_URL = process.env.EXPO_PUBLIC_R2_PUBLIC_URL || '';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || '',
        secretAccessKey: R2_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: false,
});

function encodeKeyForUrl(key: string): string {
    return key.split('/').map(encodeURIComponent).join('/');
}

// Create a new measurement record for the authenticated user
export const createMeasurement = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const {
            measurement_date,
            body_weight,
            waist,
            body_fat,
            lean_body_mass,
            neck,
            shoulder,
            chest,
            left_bicep,
            right_bicep,
            left_forearm,
            right_forearm,
            abdomen,
            left_thigh,
            right_thigh,
            left_calf,
            right_calf,
            entry_image_url,
            entry_image_key,
        } = req.body || {};

        if (!measurement_date) return res.status(400).json({ message: 'measurement_date is required' });

        const record = await prisma.measurement.create({
            data: {
                // Link existing user via relation connect (Prisma expects either nested users or unchecked user_id)
                users: { connect: { user_id: userId } },
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
                // Prisma schema requires updated_at (no default) so set to now
                updated_at: new Date(),
            },
        });

        // If the client sent an entry_image_key (the temporary uploaded key), move/copy it to a canonical key using measurement_id
        if (entry_image_key) {
            try {
                const parts = (entry_image_key as string).split('.');
                const ext = parts.length > 1 ? parts.pop() : 'jpg';
                const finalKey = `profile/Measurements/${record.measurement_id}.${ext}`;

                // Copy object within the same bucket
                const copyParams = {
                    Bucket: R2_BUCKET_NAME,
                    CopySource: `${R2_BUCKET_NAME}/${entry_image_key}`,
                    Key: finalKey,
                    // Preserve content type if desired
                };

                const copyCommand = new CopyObjectCommand(copyParams);
                await s3Client.send(copyCommand);

                // Build public URL for the final key
                let finalPublicUrl: string;
                if (R2_PUBLIC_URL) {
                    finalPublicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${encodeKeyForUrl(finalKey)}`;
                } else if (R2_ENDPOINT) {
                    finalPublicUrl = `${R2_ENDPOINT.replace(/\/$/, '')}/${encodeKeyForUrl(finalKey)}`;
                } else {
                    finalPublicUrl = `https://${R2_BUCKET_NAME}.s3.auto.amazonaws.com/${encodeKeyForUrl(finalKey)}`;
                }

                // Update the measurement record with canonical URL
                const updated = await prisma.measurement.update({
                    where: { measurement_id: record.measurement_id },
                    data: { entry_image_url: finalPublicUrl, updated_at: new Date() },
                });

                return res.status(201).json({ message: 'Measurement created', measurement: updated });
            } catch (err) {
                console.error('[measurements.controller] failed to copy image to final key', err);
                // Return the record with original entry_image_url if copy failed
                return res.status(201).json({ message: 'Measurement created (image copy failed)', measurement: record });
            }
        }

        return res.status(201).json({ message: 'Measurement created', measurement: record });
    } catch (error: any) {
        console.error('[measurements.controller] createMeasurement error', error);
        return res.status(500).json({ message: error.message || 'Failed to create measurement' });
    }
};

// Get all measurement records for authenticated user (latest first)
export const getMeasurements = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const records = await prisma.measurement.findMany({
            where: { user_id: userId },
            orderBy: { measurement_date: 'desc' },
        });

        return res.status(200).json({ measurements: records });
    } catch (error: any) {
        console.error('[measurements.controller] getMeasurements error', error);
        return res.status(500).json({ message: error.message || 'Failed to fetch measurements' });
    }
};
