import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();

const getDerivedApiUrl = (): string => {
    if (ENV_API_URL) {
        return ENV_API_URL;
    }

    const hostUri = (Constants.expoConfig as any)?.hostUri as string | undefined;
    const host = hostUri?.split(':')[0];
    if (host) {
        return `http://${host}:3001/api`;
    }

    return 'http://localhost:3001/api';
};

const API_URL = getDerivedApiUrl();

console.log('API Configuration:', {
    envApiUrl: ENV_API_URL || null,
    hostUri: (Constants.expoConfig as any)?.hostUri || null,
    finalApiUrl: API_URL,
});

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        if (config.url && config.url.includes('_t=')) {
            config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
            config.headers.Pragma = 'no-cache';
            config.headers.Expires = '0';
        }

        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const originalRequest = error.config;

        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data;

                    await AsyncStorage.setItem('accessToken', accessToken);
                    await AsyncStorage.setItem('refreshToken', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
