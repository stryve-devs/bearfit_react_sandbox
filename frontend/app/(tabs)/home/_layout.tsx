import { Stack } from 'expo-router';
import { AppColors } from "../../../src/constants/colors";

export default function HomeLayout() {
    // Fallback colors in case AppColors is failing
    const activeColors = {
        black: AppColors?.black || '#000000',
        white: AppColors?.white || '#ffffff',
        orange: AppColors?.orange || '#cc5500',
    };

    return (
        <Stack
            screenOptions={{
                headerShown: false, // Keeping this false since your HomeScreen has its own header
                contentStyle: { backgroundColor: activeColors.black },
                animation: 'slide_from_right', // Smoother transition for BearFit
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="explore" />
            <Stack.Screen name="discover" />
            <Stack.Screen name="post-detail" />
            <Stack.Screen name="home17" />
            <Stack.Screen name="contacts" />
            <Stack.Screen name="notifications" />
        </Stack>
    );
}