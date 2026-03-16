import { Stack } from 'expo-router';
import React from "react";

export default function SettingsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,           // Hide Stack header for ALL screens
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="index"           options={{ headerShown: false }} />
            <Stack.Screen name="AccountSettings" options={{ headerShown: false }} />
            <Stack.Screen name="Notifications"   options={{ headerShown: false }} />
        </Stack>
    );
}
