import { Stack } from 'expo-router';
import { AppColors } from '../../../src/constants/colors';

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                // 1. Changed to true so the header actually exists
                headerShown: true,
                headerStyle: { backgroundColor: AppColors.black },
                headerTintColor: AppColors.white,
                headerTitleStyle: {
                    color: AppColors.orange,
                    fontWeight: 'bold',
                    fontSize: 18
                },
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                contentStyle: { backgroundColor: AppColors.black },
            }}
        >
            {/* 2. Ensure the name matches your file (usually index.tsx) */}
            <Stack.Screen
                name="index"
                options={{
                    title: 'Profile'
                }}
            />
        </Stack>
    );
}