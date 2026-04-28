import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { authService } from '../api/services/auth.service';
import type { User, LoginRequest, RegisterRequest } from '../types/auth.types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [postAuthFlow, setPostAuthFlow] = useState<'login' | 'register' | null>(null);
    const [postLogoutRedirect, setPostLogoutRedirect] = useState(false);
    const router = useRouter();
    const segments = useSegments();

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, []);

    // Handle navigation based on auth state
    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            // Always redirect unauthenticated users to login
            const targetRoute = '/(auth)/login';
            console.log('🔒 Not authenticated, redirecting to:', targetRoute);
            router.replace(targetRoute);
        } else if (user && inAuthGroup) {
            // Only new registrations should go through onboarding.
            const targetRoute = postAuthFlow === 'register' ? '/(onboarding)/select-units' : '/(tabs)';
            console.log('✅ Authenticated, redirecting to:', targetRoute);
            router.replace(targetRoute);
            setPostAuthFlow(null);
        } else if (!user && inAuthGroup && postLogoutRedirect) {
            // Clear intent once we've landed in the auth group after logout.
            setPostLogoutRedirect(false);
        }
    }, [user, loading, segments, postAuthFlow, postLogoutRedirect]);

    const loadUser = async () => {
        console.log('🔍 Loading user from storage...');
        try {
            const storedUser = await authService.getUser();
            if (storedUser) {
                console.log('✅ User loaded:', storedUser.username || storedUser.email);
                setUser(storedUser);
            } else {
                console.log('ℹ️ No user found in storage');
                setUser(null);
            }
        } catch (error) {
            console.error('❌ Error loading user:', error);
            setUser(null);
        } finally {
            console.log('✅ Auth initialization complete');
            setLoading(false);
        }
    };

    const login = async (credentials: LoginRequest) => {
        console.log('🔐 Logging in...');
        try {
            const response = await authService.login(credentials);
            console.log('✅ Login successful:', response.user.username || response.user.email);
            setPostAuthFlow('login');
            setUser(response.user);
            // Navigation handled by useEffect
        } catch (error: any) {
            console.error('❌ Login failed:', error.response?.data?.message || error.message);
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        console.log('📝 Registering new user...');
        try {
            const response = await authService.register(data);
            console.log('✅ Registration successful:', response.user.username || response.user.email);
            setPostAuthFlow('register');
            setUser(response.user);
            // Navigation handled by useEffect
        } catch (error: any) {
            console.error('❌ Registration failed:', error.response?.data?.message || error.message);
            throw error;
        }
    };

    const logout = async () => {
        console.log('👋 Logging out...');
        setLoading(true);
        setPostLogoutRedirect(true);
        try {
            await authService.logout();
            console.log('✅ Logout successful');
            setPostAuthFlow(null);
            setUser(null);
            router.replace('/(auth)/login');
        } catch (error: any) {
            console.error('❌ Logout error:', error);
            // Clear user anyway even if API call fails
            setPostAuthFlow(null);
            setUser(null);
            router.replace('/(auth)/login');
        } finally {
            setLoading(false);
        }
    };

    const contextValue: AuthContextType = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };

    console.log('🎯 AuthContext state:', {
        loading,
        isAuthenticated: !!user,
        username: user?.username || 'none',
    });

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};