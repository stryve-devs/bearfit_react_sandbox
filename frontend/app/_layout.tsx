import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        'CalSans': require('../assets/fonts/CalSans-Regular.ttf'),
    });


    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <AuthProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#000000' },
                }}
            />
        </AuthProvider>
    );
}