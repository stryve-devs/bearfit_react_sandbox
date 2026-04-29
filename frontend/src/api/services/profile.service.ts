// Location: src/api/services/profile.service.ts

declare const process: any;

import api from '../client';

// Default to the known public R2 dev host used elsewhere in the project so keys become usable URLs
const R2_PUBLIC_URL = process.env.EXPO_PUBLIC_R2_PUBLIC_URL || 'https://pub-d0fbe48b068b460e96f026d1d9fe3c68.r2.dev';

const toBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    return await response.blob();
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

export interface ProfileUpdatePayload {
    name?: string;
    bio?: string;
    link_url?: string;
    profile_pic_url?: string;
}

export const profileService = {
    /**
     * Upload profile picture using backend presigned URL and return public URL + key
     */
    async uploadProfilePicture(imageUri: string, onProgress?: (progress: number) => void): Promise<{ url: string; key: string }> {
        // 1) Fetch blob to determine content type
        const blob = await toBlob(imageUri);
        const contentType = (blob && (blob as any).type) || 'image/jpeg';

        // 2) Ask backend for presigned URL
        const extension = getImageExtension(imageUri).replace('.', '');
        const filename = `profile_pic.${extension}`;

        const presignResp = await api.post('/uploads/profile-picture', { filename, contentType });
        const { uploadUrl, publicUrl, key } = presignResp.data;

        // 3) Upload via fetch PUT to presigned URL
        if (onProgress) onProgress(0.1);

        const res = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
            },
            body: blob as any,
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`Upload failed: ${res.status} ${res.statusText} ${text}`);
        }

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

        const rawUrl = publicUrl || (R2_PUBLIC_URL ? `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key.replace(/^\//, '')}` : key);
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
