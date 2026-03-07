import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../client';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth.types';

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
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
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
};