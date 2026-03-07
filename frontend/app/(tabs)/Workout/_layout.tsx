import { Stack } from 'expo-router';

export default function WorkoutLayout() {
    return (
        <Stack screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="routine" />
            <Stack.Screen name="log" />
            <Stack.Screen name="addexercise" />
            <Stack.Screen name="explore" />
        </Stack>
    );
}
