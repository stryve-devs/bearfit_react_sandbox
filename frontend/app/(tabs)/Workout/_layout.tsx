import { Stack } from 'expo-router';
import {AppColors} from "@/constants/colors";

export default function WorkoutLayout() {
    return (
        <Stack screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: AppColors.black },
            headerTintColor: AppColors.white,
            headerTitleStyle: { color: AppColors.orange, fontWeight: 'bold' },
            headerTitleAlign: 'center',
            headerShadowVisible: false,
            contentStyle: { backgroundColor: AppColors.black },
        }}
        >
            <Stack.Screen name="index" options={{ title: 'Workouts' }} />
            <Stack.Screen name="routine" options={{ title: 'Routine' }} />
            <Stack.Screen name="log" options={{ title: 'Log' }} />
            <Stack.Screen name="addexercise" options={{ title: 'Add Exercise' }} />
            <Stack.Screen name="explore" options={{ title: 'Explore' }} />
        </Stack>
    );
}