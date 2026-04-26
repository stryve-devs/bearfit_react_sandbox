import { Stack } from 'expo-router';
import React from "react";

export default function NotificationsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,            // No Stack header on any screen
            }}
        >
            <Stack.Screen name="index" options={{headerShown: false}}/>
        </Stack>
    );
}