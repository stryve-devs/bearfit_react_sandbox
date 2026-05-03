import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../client';
import type { LoginRequest, RegisterRequest, AuthResponse, User, MeProfileResponse } from '@/types/auth.types';

export const authService = {
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await api.post('/auth/register', data);
        const { accessToken, refreshToken, user } = response.data;

        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        return response.data;
    },

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await api.post('/auth/login', credentials);
        const { accessToken, refreshToken, user } = response.data;

        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        return response.data;
    },

    async logout(): Promise<void> {
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        try {
            if (refreshToken) {
                await api.post('/auth/logout', { refreshToken });
            }
        } catch (error) {
            console.warn('Logout API failed, clearing local session anyway:', error);
        } finally {
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        }
    },

    async getUser(): Promise<User | null> {
        const userStr = await AsyncStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    async checkEmailExists(email: string): Promise<boolean> {
        try {
            const response = await api.get(`/auth/exists?email=${encodeURIComponent(email)}`);
            return response.data.exists;
        } catch {
            return false;
        }
    },

    async getMeProfile(force = false): Promise<MeProfileResponse> {
        // Add cache-busting query when force=true to bypass any intermediary caches
        const url = '/auth/me' + (force ? `?_t=${Date.now()}` : '');
        const response = await api.get(url);
        return response.data;
    },

    async mergeProfileIntoStoredUser(profile: Partial<MeProfileResponse>): Promise<User | null> {
        const current = await authService.getUser();
        if (!current) return null;

        const next: User = {
            ...current,
            name: profile.name ?? current.name,
            username: profile.username ?? current.username,
            ...(profile.profile_pic_url ? { profile_pic_url: profile.profile_pic_url } : {}),
        } as User;

        await AsyncStorage.setItem('user', JSON.stringify(next));
        return next;
    },
};
