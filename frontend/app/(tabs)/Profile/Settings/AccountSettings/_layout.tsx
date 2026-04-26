import { Stack } from 'expo-router';
import React from "react";

export default function AccountSettingsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,            // No Stack header on any screen
            }}
        >
            <Stack.Screen name="index"           options={{ headerShown: false }} />
            <Stack.Screen name="change-email"    options={{ headerShown: false }} />
            <Stack.Screen name="change-username" options={{ headerShown: false }} />
            <Stack.Screen name="update-password" options={{ headerShown: false }} />
            <Stack.Screen name="delete-acc"      options={{ headerShown: false }} />
        </Stack>
    );
}
