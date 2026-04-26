import { Stack } from 'expo-router';
import React from "react";
import { AppColors } from '../../../src/constants/colors';

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                // 1. Set to false to hide the Expo Router header
                // and keep only your custom screen header
                headerShown: false,

                // Keep these for content styling
                contentStyle: { backgroundColor: AppColors.black },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    // This is redundant if headerShown is false,
                    // but good for safety
                    title: "Edit Profile",
                }}
            />
        </Stack>
    );
}