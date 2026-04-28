// Location: src/api/services/profile.service.ts

import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import api from '../client';

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
        reader.onerror = () => reject(reader.error || new Error('Failed reading image blob'));
        reader.readAsArrayBuffer(blob);
    });
};

const getCrypto = (): Crypto | undefined => {
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

const getImageExtension = (uri: string): string => {
    const uriWithoutQuery = uri.split('?')[0];
    const dotIndex = uriWithoutQuery.lastIndexOf('.');
    if (dotIndex > -1) {
        const ext = uriWithoutQuery.slice(dotIndex).toLowerCase();
        // Ensure it's a valid image extension
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            return ext;
        }
    }

    return '.jpg';
};

export interface ProfileUpdatePayload {
    name?: string;
    bio?: string;
    link_url?: string;
    profile_pic_url?: string;
}

export const profileService = {
    /**
     * Upload profile picture to R2 and return the URL
     */
    async uploadProfilePicture(
        imageUri: string,
        onProgress?: (progress: number) => void,
    ): Promise<{ url: string; key: string }> {
        ensureR2Config();

        const extension = getImageExtension(imageUri);
        const fileName = `${generateUuid()}${extension}`;
        const key = `profile/profile_pic/${fileName}`;

        const body = await toBytes(imageUri);

        if (onProgress) {
            onProgress(0.2);
        }

        await s3Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: 'image/jpeg',
        }));

        if (onProgress) {
            onProgress(1);
        }

        const url = `${R2_PUBLIC_URL}/${key}`;
        return { url, key };
    },

    /**
     * Update user profile with new data
     */
    async updateProfile(payload: ProfileUpdatePayload): Promise<any> {
        try {
            const response = await api.put('/auth/profile', payload);
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    /**
     * Get current user profile
     */
    async getProfile(): Promise<any> {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    /**
     * Delete profile picture from R2
     */
    async deleteProfilePicture(key: string): Promise<void> {
        ensureR2Config();

        try {
            await s3Client.send(new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
            }));
        } catch (error) {
            console.error(`Failed to delete profile picture from R2 (${key}):`, error);
        }
    },
};

