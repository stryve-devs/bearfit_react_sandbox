// Location: src/api/services/profile.service.ts

declare const process: any;

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import api from '../client';

// Default to the known public R2 dev host used elsewhere in the project so keys become usable URLs
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

const toFileData = async (uri: string): Promise<{ blob: Blob; bytes: Uint8Array }> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            resolve({ blob, bytes: new Uint8Array(arrayBuffer) });
        };
        reader.onerror = () => reject(reader.error || new Error('Failed reading image blob'));
        reader.readAsArrayBuffer(blob);
    });
};

const getImageExtension = (uri: string): string => {
    const uriWithoutQuery = uri.split('?')[0];
    const dotIndex = uriWithoutQuery.lastIndexOf('.');
    if (dotIndex > -1) {
        const ext = uriWithoutQuery.slice(dotIndex).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return ext;
    }
    return '.jpg';
};

const ensureR2Config = () => {
    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
        throw new Error('Missing R2 config. Set EXPO_PUBLIC_R2_ENDPOINT, EXPO_PUBLIC_R2_ACCESS_KEY_ID, EXPO_PUBLIC_R2_SECRET_ACCESS_KEY, EXPO_PUBLIC_R2_BUCKET_NAME.');
    }
};

const getCrypto = (): Crypto | undefined => {
    const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
    if (!globalObj || !('crypto' in globalObj)) {
        return undefined;
    }

    return globalObj.crypto as Crypto | undefined;
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

export interface ProfileUpdatePayload {
    name?: string;
    bio?: string;
    link_url?: string;
    profile_pic_url?: string;
}

export const profileService = {
    /**
     * Upload profile picture directly to R2 and return public URL + key
     */
    async uploadProfilePicture(imageUri: string, onProgress?: (progress: number) => void): Promise<{ url: string; key: string }> {
        ensureR2Config();

        const { blob, bytes } = await toFileData(imageUri);
        const extension = getImageExtension(imageUri);
        const contentType = (blob && (blob as any).type) || 'image/jpeg';
        const key = `profile/profile-pic/${generateUuid()}${extension}`;

        if (onProgress) onProgress(0.2);

        await s3Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: bytes,
            ContentType: contentType,
        }));

        if (onProgress) onProgress(1);

        // 4) Return public URL and key
        // Normalize/encode publicUrl so RN Image can fetch (encode path segments only)
        const normalizeUrl = (u: string) => {
            if (!u) return u;
            try {
                // If URL already appears absolute, encode each path segment
                const urlObj = new URL(u);
                urlObj.pathname = urlObj.pathname
                    .split('/')
                    .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
                    .join('/');
                return urlObj.toString();
            } catch (e) {
                // fallback to encodeURI for non-standard URLs
                return encodeURI(u);
            }
        };

        const rawUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key.replace(/^\//, '')}` : key;
        const url = normalizeUrl(rawUrl);
        return { url, key };
    },

    async updateProfile(payload: ProfileUpdatePayload): Promise<any> {
        try {
            const response = await api.put('/auth/profile', payload);
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    async getProfile(): Promise<any> {
        try {
            // The backend exposes the current user's profile at GET /auth/me
            const response = await api.get('/auth/me');
            const profile = response.data;

            // Normalize profile_pic_url: ensure it's an absolute, encoded URL
            if (profile && profile.profile_pic_url && typeof profile.profile_pic_url === 'string') {
                const v = profile.profile_pic_url;
                if (!/^https?:\/\//i.test(v)) {
                    if (R2_PUBLIC_URL) {
                        profile.profile_pic_url = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${v.replace(/^\//, '')}`;
                    } else {
                        console.warn('profileService.getProfile: profile_pic_url looks like a key but R2 public URL is not configured', v);
                    }
                }

                // Encode path segments to be safe for RN Image
                try {
                    const urlObj = new URL(profile.profile_pic_url);
                    urlObj.pathname = urlObj.pathname
                        .split('/')
                        .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
                        .join('/');
                    profile.profile_pic_url = urlObj.toString();
                } catch (e) {
                    profile.profile_pic_url = encodeURI(profile.profile_pic_url);
                }
            }

            // If backend returned a profile_pic_key (the storage key), use our backend proxy endpoint
            if (profile && !profile.profile_pic_url && profile.profile_pic_key) {
                const key = String(profile.profile_pic_key);
                const proxyUrl = `${api.defaults.baseURL.replace(/\/$/, '')}/uploads/proxy?key=${encodeURIComponent(key)}`;
                profile.profile_pic_url = proxyUrl;
            }

            return profile;
        } catch (error: any) {
            // If 404 or 401, return null to let the UI show defaults
            if (error.response?.status === 404 || error.response?.status === 401) {
                console.warn('Profile not found or unauthenticated:', error.response?.status);
                return null;
            }
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    async deleteProfilePicture(key: string): Promise<void> {
        // Optional: call backend to delete by key or keep client-side delete. For now attempt backend route if exists.
        try {
            await api.delete('/uploads', { data: { key } });
        } catch (error) {
            console.error('Failed to delete profile picture via backend:', error);
        }
    },
};
