import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// 👇 ADD THIS - Log the API URL on startup
console.log('🌐 API Configuration:');
console.log('   EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('   Final API_URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    async (config) => {
        // 👇 ADD THIS - Log every request
        console.log('📤 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            fullUrl: `${config.baseURL}${config.url}`,
        });

        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
    },
    async (error) => {
        const status = error.response?.status;
        const info = {
            message: error.message,
            url: error.config?.url,
            fullUrl: `${error.config?.baseURL}${error.config?.url}`,
            status: status,
        };

        // For expected auth errors (401) or not found (404) avoid noisy error logging — log as warning
        if (status === 401 || status === 404) {
            console.warn('⚠️ API Auth/NotFound:', info);
        } else {
            console.error('❌ API Error:', info);
        }

        const originalRequest = error.config;

        // If 401 and not already retried, try refreshing token
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
                // Clear tokens and reject (caller can handle navigation to login)
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                console.warn('⚠️ Token refresh failed, cleared stored tokens.');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;