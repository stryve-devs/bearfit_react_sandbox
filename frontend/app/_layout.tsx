import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { WorkoutProvider } from '../src/context/WorkoutContext';
import { RoutineProvider } from '../src/context/RoutineContext';
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
            <WorkoutProvider>
                <RoutineProvider>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: '#000000' },
                        }}
                    />
                </RoutineProvider>
            </WorkoutProvider>
        </AuthProvider>
    );
}