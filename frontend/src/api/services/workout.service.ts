// Location: src/api/services/workout.service.ts

import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import api from '../client';
import {
    Routine,
    Exercise,
    SaveWorkoutPostPayload,
    SaveWorkoutPostResponse,
    SelectedWorkoutMediaAsset,
    WorkoutPostMediaPayload,
} from '../../types/workout.types';

const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT || '';
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.EXPO_PUBLIC_R2_BUCKET_NAME || 'bearfit-assets';
const R2_PUBLIC_URL = process.env.EXPO_PUBLIC_R2_PUBLIC_URL || 'https://pub-d0fbe48b068b460e96f026d1d9fe3c68.r2.dev';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

const ensureR2Config = () => {
    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
        throw new Error('Missing R2 config. Set EXPO_PUBLIC_R2_ENDPOINT, EXPO_PUBLIC_R2_ACCESS_KEY_ID, EXPO_PUBLIC_R2_SECRET_ACCESS_KEY, EXPO_PUBLIC_R2_BUCKET_NAME.');
    }
};

const toBytes = async (uri: string): Promise<Uint8Array> => {
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            resolve(new Uint8Array(arrayBuffer));
        };
        reader.onerror = () => reject(reader.error || new Error('Failed reading media blob'));
        reader.readAsArrayBuffer(blob);
    });
};

const getCrypto = (): Crypto | undefined => {
    // Some RN runtimes throw when directly accessing missing global properties.
    const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
    if (!globalObj || !('crypto' in globalObj)) {
        return undefined;
    }

    return globalObj['crypto'] as Crypto | undefined;
};

const randomHex = (): string | undefined => {
    const cryptoApi = getCrypto();
    if (!cryptoApi || typeof cryptoApi.getRandomValues !== 'function') {
        return undefined;
    }

    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
};

const fallbackUuid = (): string => {
    const ts = Date.now().toString(16);
    const rand = Math.random().toString(16).slice(2, 14).padEnd(12, '0');
    return `${ts.slice(-8)}-${rand.slice(0, 4)}-4${rand.slice(4, 7)}-a${rand.slice(7, 10)}-${rand.slice(10, 12)}${ts.slice(-10)}`;
};

const generateUuid = (): string => {
    const cryptoApi = getCrypto();
    if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
        return cryptoApi.randomUUID();
    }

    const hex = randomHex();
    if (hex) {
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
    }

    return fallbackUuid();
};

const getMediaExtension = (asset: SelectedWorkoutMediaAsset): string => {
    const uriWithoutQuery = asset.uri.split('?')[0];
    const dotIndex = uriWithoutQuery.lastIndexOf('.');
    if (dotIndex > -1) {
        return uriWithoutQuery.slice(dotIndex).toLowerCase();
    }

    return asset.type === 'video' ? '.mp4' : '.jpg';
};

const uploadSingleWorkoutMedia = async (
    asset: SelectedWorkoutMediaAsset,
    order: number,
): Promise<WorkoutPostMediaPayload> => {
    const folder = asset.type === 'video' ? 'Post/Videos' : 'Post/Images';
    const extension = getMediaExtension(asset);
    const objectName = `${generateUuid()}${extension}`;
    const key = `${folder}/${objectName}`;

    const body = await toBytes(asset.uri);

    await s3Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
    }));

    return {
        url: `${R2_PUBLIC_URL}/${key}`,
        type: asset.type === 'video' ? 'VIDEO' : 'IMAGE',
        order,
    };
};

export const workoutService = {
    // Exercises
    async getAllExercises(): Promise<Exercise[]> {
        try {
            const response = await api.get('/exercises');
            return response.data;
        } catch (error) {
            console.error('Error fetching exercises:', error);
            throw error;
        }
    },

    async getExercisesByMuscle(muscle: string): Promise<Exercise[]> {
        try {
            const response = await api.get(`/exercises?muscle=${muscle}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching exercises by muscle:', error);
            throw error;
        }
    },

    async getExercisesByEquipment(equipment: string): Promise<Exercise[]> {
        try {
            const response = await api.get(`/exercises?equipment=${equipment}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching exercises by equipment:', error);
            throw error;
        }
    },

    async searchExercises(query: string): Promise<Exercise[]> {
        try {
            const response = await api.get(`/exercises/search?q=${query}`);
            return response.data;
        } catch (error) {
            console.error('Error searching exercises:', error);
            throw error;
        }
    },

    // Routines
    async getAllRoutines(): Promise<Routine[]> {
        try {
            const response = await api.get('/routines');
            return response.data;
        } catch (error) {
            console.error('Error fetching routines:', error);
            throw error;
        }
    },

    async getRoutineById(id: string): Promise<Routine> {
        try {
            const response = await api.get(`/routines/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching routine:', error);
            throw error;
        }
    },

    async createRoutine(routine: Routine): Promise<Routine> {
        try {
            const response = await api.post('/routines', routine);
            return response.data;
        } catch (error) {
            console.error('Error creating routine:', error);
            throw error;
        }
    },

    async updateRoutine(id: string, routine: Routine): Promise<Routine> {
        try {
            const response = await api.put(`/routines/${id}`, routine);
            return response.data;
        } catch (error) {
            console.error('Error updating routine:', error);
            throw error;
        }
    },

    async deleteRoutine(id: string): Promise<void> {
        try {
            await api.delete(`/routines/${id}`);
        } catch (error) {
            console.error('Error deleting routine:', error);
            throw error;
        }
    },

    async uploadWorkoutMedia(assets: SelectedWorkoutMediaAsset[]): Promise<WorkoutPostMediaPayload[]> {
        ensureR2Config();

        if (!assets.length) {
            return [];
        }

        return Promise.all(assets.map((asset, index) => uploadSingleWorkoutMedia(asset, index)));
    },

    async saveWorkoutPost(payload: SaveWorkoutPostPayload): Promise<SaveWorkoutPostResponse> {
        const response = await api.post('/workouts', payload);
        return response.data;
    },

    // Legacy helper retained for compatibility.
    async logWorkout(workoutData: any): Promise<any> {
        try {
            const response = await api.post('/workouts', workoutData);
            return response.data;
        } catch (error) {
            console.error('Error logging workout:', error);
            throw error;
        }
    },

    async getWorkoutHistory(): Promise<any[]> {
        try {
            const response = await api.get('/workouts');
            return response.data;
        } catch (error) {
            console.error('Error fetching workout history:', error);
            throw error;
        }
    },

    async uploadSingleWorkoutMedia(
        asset: SelectedWorkoutMediaAsset,
        onProgress?: (progress: number) => void,
    ): Promise<{ url: string; key: string }> {
        ensureR2Config();

        const folder = asset.type === 'video' ? 'Post/Videos' : 'Post/Images';
        const extension = getMediaExtension(asset);
        const objectName = `${generateUuid()}${extension}`;
        const key = `${folder}/${objectName}`;

        const body = await toBytes(asset.uri);

        // Simple progress tracking (just report start and complete, no mid-upload)
        if (onProgress) {
            onProgress(0.2);
        }

        await s3Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
        }));

        if (onProgress) {
            onProgress(1);
        }

        const url = `${R2_PUBLIC_URL}/${key}`;
        return { url, key };
    },

    async deleteMediaFromR2(key: string): Promise<void> {
        ensureR2Config();

        try {
            await s3Client.send(new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
            }));
        } catch (error) {
            console.error(`Failed to delete media from R2 (${key}):`, error);
        }
    },
};