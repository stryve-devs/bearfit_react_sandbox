import { Stack } from 'expo-router';
import { AppColors } from '../../../src/constants/colors';

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                headerStyle: { backgroundColor: AppColors.black },
                headerTintColor: AppColors.white,
                headerTitleStyle: { color: AppColors.orange },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: AppColors.black },
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Profile' }} />
        </Stack>
    );
}
