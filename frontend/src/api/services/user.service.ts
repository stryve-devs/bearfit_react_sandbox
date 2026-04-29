import api from '../client';

declare const process: any;

// Keep same R2 public URL default as other services so keys become usable URLs
const R2_PUBLIC_URL = process.env.EXPO_PUBLIC_R2_PUBLIC_URL || 'https://pub-d0fbe48b068b460e96f026d1d9fe3c68.r2.dev';

const normalizeProfilePicUrl = (raw?: string | null): string | null => {
  if (!raw) return null;
  try {
    if (!/^https?:\/\//i.test(raw)) {
      // treat as key
      return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${String(raw).replace(/^\//, '')}`;
    }

    const urlObj = new URL(raw);
    urlObj.pathname = urlObj.pathname
      .split('/')
      .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
      .join('/');
    return urlObj.toString();
  } catch (e) {
    try {
      return encodeURI(String(raw));
    } catch {
      return String(raw);
    }
  }
};

export const userService = {
  async getUserById(userId: number | string): Promise<any> {
    const response = await api.get(`/users/${userId}`);
    const u = response.data;
    if (u && u.profile_pic_url && typeof u.profile_pic_url === 'string') {
      u.profile_pic_url = normalizeProfilePicUrl(u.profile_pic_url);
    } else if (u && !u.profile_pic_url && u.profile_pic_key) {
      // fallback to proxy by key if backend provides key
      u.profile_pic_url = `${api.defaults.baseURL.replace(/\/$/, '')}/uploads/proxy?key=${encodeURIComponent(String(u.profile_pic_key))}`;
    }
    return u;
  },

  async getSuggestions(limit = 8): Promise<any[]> {
    const response = await api.get(`/auth/suggestions?limit=${Number(limit)}`);
    const users = response.data?.users || [];
    return users.map((u: any) => ({
      user_id: u.user_id,
      username: u.username,
      name: u.name,
      profile_pic_url: u.profile_pic_url ? normalizeProfilePicUrl(u.profile_pic_url) : null,
    }));
  },

  async followUser(targetUserId: number | string): Promise<{ isFollowing: boolean }> {
    const response = await api.post(`/auth/follow/${Number(targetUserId)}`);
    return response.data;
  },

  async unfollowUser(targetUserId: number | string): Promise<{ isFollowing: boolean }> {
    const response = await api.delete(`/auth/follow/${Number(targetUserId)}`);
    return response.data;
  },
};

export default userService;

