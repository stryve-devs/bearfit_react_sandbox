import 'react-native-get-random-values';
import { Stack, useGlobalSearchParams, usePathname, useRootNavigationState, useRouter } from 'expo-router';
import React from "react";
import { AuthProvider } from '../src/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();
const LAST_ROUTE_KEY = 'bearfit:last-route';

export default function RootLayout() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useGlobalSearchParams();
    const navigationState = useRootNavigationState();
    const [fontsLoaded] = useFonts({
        'CalSans': require('../assets/fonts/CalSans-Regular.ttf'),
    });
    const [restoreChecked, setRestoreChecked] = useState(false);

    useEffect(() => {
        if (!navigationState?.key || restoreChecked) return;

        let active = true;
        (async () => {
            try {
                const lastRoute = await AsyncStorage.getItem(LAST_ROUTE_KEY);
                if (
                    active &&
                    lastRoute &&
                    lastRoute !== pathname &&
                    pathname === '/' &&
                    lastRoute.startsWith('/')
                ) {
                    router.replace(lastRoute as any);
                }
            } catch (error) {
                console.warn('Failed to restore last route', error);
            } finally {
                if (active) setRestoreChecked(true);
            }
        })();

        return () => {
            active = false;
        };
    }, [navigationState?.key, restoreChecked, pathname, router]);

    useEffect(() => {
        if (!navigationState?.key || !pathname || pathname === '/') return;
        const entries = Object.entries(searchParams ?? {})
            .filter(([, value]) => value !== undefined && value !== null && String(value).length > 0)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        const fullRoute = entries.length > 0 ? `${pathname}?${entries.join('&')}` : pathname;
        AsyncStorage.setItem(LAST_ROUTE_KEY, fullRoute).catch((error) => {
            console.warn('Failed to persist last route', error);
        });
    }, [navigationState?.key, pathname, searchParams]);

    useEffect(() => {
        if (fontsLoaded && restoreChecked) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, restoreChecked]);

    if (!fontsLoaded || !restoreChecked) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AuthProvider>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: '#000000' },
                        }}
                    />
                </AuthProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
