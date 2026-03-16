import { Stack } from 'expo-router';
import React from "react";


export default function SettingsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // Hides the main "Settings" header
            }}
        >
            <Stack.Screen
                name="index"
            />
            <Stack.Screen
                name="AccountSettings"
            />
            <Stack.Screen
                name="Notifications"
            />
        </Stack>
    );
}