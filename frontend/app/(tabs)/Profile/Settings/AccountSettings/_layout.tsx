import { Stack } from 'expo-router';
import React from "react";

export default function AccountLayout() {
    return (
        <Stack screenOptions={{
            headerShown: true, // This is the ONLY one that should be true
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#ff9d00',

            headerShadowVisible: false
        }}>
            <Stack.Screen name="index" options={{ title:null }} />
            <Stack.Screen name="change-email" options={{ title: null}} />
        </Stack>
    );
}