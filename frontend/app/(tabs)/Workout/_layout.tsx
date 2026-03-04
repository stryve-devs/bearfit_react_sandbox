import { Stack } from 'expo-router';
import { AppColors } from '../../../src/constants/colors';

export default function WorkoutLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: AppColors.black },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Workout',
                    headerTitle: 'Workout',
                    headerShown: false,
                }}
            />
        </Stack>
    );
}