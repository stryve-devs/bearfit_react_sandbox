import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
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

const normalizeUrl = (u: string) => {
    if (!u) return u;
    try {
        const urlObj = new URL(u);
        urlObj.pathname = urlObj.pathname
            .split('/')
            .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
            .join('/');
        return urlObj.toString();
    } catch {
        return encodeURI(u);
    }
};

export const measurementsService = {
    async getMeasurements() {
        const res = await api.get('/measurements');
        return res.data;
    },

    async presignMeasurementPhoto(filename: string, contentType: string) {
        const res = await api.post('/uploads/measurement-photo', { filename, contentType });
        return res.data; // { uploadUrl, publicUrl, key }
    },

    async uploadMeasurementPhoto(imageUri: string): Promise<{ url: string; key: string }> {
        ensureR2Config();

        const { blob, bytes } = await toFileData(imageUri);
        const extension = getImageExtension(imageUri);
        const contentType = (blob && (blob as any).type) || 'image/jpeg';
        const key = `profile/Measurements/${generateUuid()}${extension}`;

        await s3Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: bytes,
            ContentType: contentType,
        }));

        const rawUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
        return { url: normalizeUrl(rawUrl), key };
    },

    async createMeasurement(payload: any) {
        const res = await api.post('/measurements', payload);
        return res.data;
    }
};

