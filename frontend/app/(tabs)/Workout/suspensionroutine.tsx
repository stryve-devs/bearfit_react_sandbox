import React from 'react';
import { Stack } from 'expo-router';
import SuspensionRoutineScreen from '../../../src/screens/Workout/SuspensionRoutineScreen';

export default function SuspensionRoutine() {
    return (
        <>
            {/* The screen internal useLayoutEffect will override these options */}
            <Stack.Screen options={{ headerShown: true }} />
            <SuspensionRoutineScreen />
        </>
    );
}