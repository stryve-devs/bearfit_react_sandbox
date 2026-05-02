import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import https from 'https';

const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.EXPO_PUBLIC_R2_BUCKET_NAME || 'bearfit-assets';
const R2_PUBLIC_URL = process.env.EXPO_PUBLIC_R2_PUBLIC_URL || '';

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.warn('R2 config missing. Uploads will fail until EXPO_PUBLIC_R2_* env variables are set.');
}

const s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || '',
        secretAccessKey: R2_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: false,
});

function sanitizeFilename(name: string): string {
    const base = name.split('/').pop() || '';
    const noExt = base.replace(/\.[^.]*$/, '');
    const sanitized = noExt
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')           // spaces to hyphen
        .replace(/[^a-z0-9-_.]/g, ''); // remove other unsafe chars
    return sanitized || uuidv4();
}

function encodeKeyForUrl(key: string): string {
    return key.split('/').map(encodeURIComponent).join('/');
}

export const getUploadUrl = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { filename = 'profile_pic.jpg', contentType = 'image/jpeg' } = req.body;
        const ext = (filename.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase();
        const base = sanitizeFilename(filename);
        const key = `profile/profile-pic/${base}-${uuidv4()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 }); // 5 minutes

        let publicUrl: string;
        if (R2_PUBLIC_URL) {
            publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${encodeKeyForUrl(key)}`;
        } else if (R2_ENDPOINT) {
            publicUrl = `${R2_ENDPOINT.replace(/\/$/, '')}/${encodeKeyForUrl(key)}`;
        } else {
            publicUrl = `https://${R2_BUCKET_NAME}.s3.auto.amazonaws.com/${encodeKeyForUrl(key)}`;
        }

        console.log('[uploads.controller] generated publicUrl', publicUrl);

        return res.status(200).json({ uploadUrl: url, publicUrl, key });
    } catch (error) {
        console.error('[uploads.controller] getUploadUrl error', error);
        return res.status(500).json({ message: 'Failed to get upload URL' });
    }
};

export const getUploadUrlDebug = async (req: Request, res: Response) => {
    try {
        const { filename = 'debug.png', contentType = 'image/png' } = req.body || {};
        const ext = (filename.split('.').pop() || 'png').replace(/[^a-z0-9]/gi, '').toLowerCase();
        const base = sanitizeFilename(filename);
        const key = `debug/profile-pic/${base}-${uuidv4()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 });

        let publicUrl: string;
        if (R2_PUBLIC_URL) {
            publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${encodeKeyForUrl(key)}`;
        } else if (R2_ENDPOINT) {
            publicUrl = `${R2_ENDPOINT.replace(/\/$/, '')}/${encodeKeyForUrl(key)}`;
        } else {
            publicUrl = `https://${R2_BUCKET_NAME}.s3.auto.amazonaws.com/${encodeKeyForUrl(key)}`;
        }

        console.log('[uploads.controller] debug presign URL:', url);
        console.log('[uploads.controller] debug publicUrl:', publicUrl);

        return res.status(200).json({ uploadUrl: url, publicUrl, key });
    } catch (error) {
        console.error('[uploads.controller] getUploadUrlDebug error', error);
        return res.status(500).json({ message: 'Failed to get debug upload URL' });
    }
};

// New: presign specifically for Measurement entry photos under profile/Measurements/
export const getMeasurementUploadUrl = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { filename = 'measurement.jpg', contentType = 'image/jpeg' } = req.body;
        const ext = (filename.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase();
        const base = sanitizeFilename(filename);
        const key = `profile/Measurements/${base}-${uuidv4()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 }); // 5 minutes

        let publicUrl: string;
        if (R2_PUBLIC_URL) {
            publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${encodeKeyForUrl(key)}`;
        } else if (R2_ENDPOINT) {
            publicUrl = `${R2_ENDPOINT.replace(/\/$/, '')}/${encodeKeyForUrl(key)}`;
        } else {
            publicUrl = `https://${R2_BUCKET_NAME}.s3.auto.amazonaws.com/${encodeKeyForUrl(key)}`;
        }

        console.log('[uploads.controller] generated measurement publicUrl', publicUrl);

        return res.status(200).json({ uploadUrl: url, publicUrl, key });
    } catch (error) {
        console.error('[uploads.controller] getMeasurementUploadUrl error', error);
        return res.status(500).json({ message: 'Failed to get measurement upload URL' });
    }
};

// New: server-side proxy upload for measurement photos. Accepts raw image body (express.raw) and uploads to R2.
export const uploadMeasurementProxy = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Raw body expected (Buffer)
        const bodyBuffer = req.body as Buffer | undefined;
        if (!bodyBuffer || bodyBuffer.length === 0) return res.status(400).json({ message: 'Empty body' });

        const contentType = String(req.headers['content-type'] || 'image/jpeg');
        const filenameHeader = String(req.headers['x-filename'] || 'measurement.jpg');
        const ext = (filenameHeader.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase();
        const base = sanitizeFilename(filenameHeader || `measurement`);
        const key = `profile/Measurements/${base}-${uuidv4()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
            Body: bodyBuffer,
        });

        await s3Client.send(command);

        let publicUrl: string;
        if (R2_PUBLIC_URL) {
            publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${encodeKeyForUrl(key)}`;
        } else if (R2_ENDPOINT) {
            publicUrl = `${R2_ENDPOINT.replace(/\/$/, '')}/${encodeKeyForUrl(key)}`;
        } else {
            publicUrl = `https://${R2_BUCKET_NAME}.s3.auto.amazonaws.com/${encodeKeyForUrl(key)}`;
        }

        console.log('[uploads.controller] uploaded measurement via proxy, publicUrl:', publicUrl);
        return res.status(200).json({ publicUrl, key });
    } catch (error) {
        console.error('[uploads.controller] uploadMeasurementProxy error', error);
        return res.status(500).json({ message: 'Failed to upload measurement' });
    }
};

export const proxyImage = async (req: Request, res: Response) => {
    try {
        const key = String(req.query.key || '').trim();
        const urlParam = String(req.query.url || '').trim();

        // If client passed an encoded URL as query param, decode it repeatedly until it's a valid URL
        const decodeCandidateUrl = (candidate: string) => {
            if (!candidate) return candidate;
            let attempt = candidate;
            for (let i = 0; i < 5; i++) {
                try {
                    const parsed = new URL(attempt);
                    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
                } catch (err) {
                    try {
                        attempt = decodeURIComponent(attempt);
                    } catch (err2) {
                        break;
                    }
                }
            }
            return attempt;
        };

        let publicUrl: string | null = null;
        if (urlParam) {
            publicUrl = decodeCandidateUrl(urlParam);
        } else if (key) {
            const encodedKey = encodeKeyForUrl(key);
            if (R2_PUBLIC_URL) {
                publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${encodedKey}`;
            } else if (R2_ENDPOINT) {
                publicUrl = `${R2_ENDPOINT.replace(/\/$/, '')}/${encodedKey}`;
            } else {
                publicUrl = `https://${R2_BUCKET_NAME}.s3.auto.amazonaws.com/${encodedKey}`;
            }
        }

        if (!publicUrl) return res.status(400).json({ message: 'key or url query parameter is required' });

        console.log('[uploads.controller] proxying image for key/url ->', publicUrl, ' (original param:', urlParam || key, ')');

        // Use native http/https request to stream upstream response reliably
        try {
            const maxRedirects = 5;

            const doRequest = (urlToGet: string, redirectsLeft: number) => {
                try {
                    const urlObj = new URL(urlToGet);
                    const lib = urlObj.protocol === 'https:' ? https : http;
                    const options: any = {
                        headers: {
                            'User-Agent': 'Bearfit-Proxy/1.0',
                            'Accept': '*/*',
                        },
                    };

                    console.log('[uploads.controller] proxying via native http(s):', urlToGet);

                    const req = lib.get(urlToGet, options, (upstreamRes: any) => {
                        const statusCode = upstreamRes.statusCode || 0;
                        // Handle redirects
                        if (statusCode >= 300 && statusCode < 400 && upstreamRes.headers && upstreamRes.headers.location) {
                            if (redirectsLeft <= 0) {
                                console.error('[uploads.controller] too many redirects for', urlToGet);
                                res.status(508).send('Too many redirects');
                                return;
                            }
                            const next = new URL(upstreamRes.headers.location, urlToGet).toString();
                            upstreamRes.resume(); // drain
                            return doRequest(next, redirectsLeft - 1);
                        }

                        if (statusCode >= 400) {
                            console.error('[uploads.controller] upstream responded with error', statusCode, urlToGet);
                            const chunks: Buffer[] = [];
                            upstreamRes.on('data', (c: any) => chunks.push(Buffer.from(c)));
                            upstreamRes.on('end', () => {
                                const body = Buffer.concat(chunks).toString('utf8').slice(0, 2000);
                                return res.status(statusCode).send(body);
                            });
                            return;
                        }

                        const contentType = upstreamRes.headers['content-type'] || 'application/octet-stream';
                        const contentLength = upstreamRes.headers['content-length'];
                        if (contentLength) res.setHeader('Content-Length', contentLength);
                        res.setHeader('Content-Type', String(contentType));
                        res.status(200);
                        upstreamRes.pipe(res);
                    });

                    req.on('error', (err: any) => {
                        console.error('[uploads.controller] native request error', err);
                        try { res.status(502).send('Upstream request failed'); } catch (e) {}
                    });
                } catch (err) {
                    console.error('[uploads.controller] doRequest failed', err);
                    try { res.status(500).send('Failed to proxy'); } catch (e) {}
                }
            };

            return doRequest(publicUrl, maxRedirects);
        } catch (err) {
            console.error('[uploads.controller] native request setup failed', err);
            return res.status(500).send('Failed to proxy');
        }
    } catch (error) {
        console.error('[uploads.controller] proxyImage error', error);
        return res.status(500).json({ message: 'Failed to proxy image' });
    }
};
