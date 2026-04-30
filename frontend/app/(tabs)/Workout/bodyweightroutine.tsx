import React from 'react';
import { Stack } from 'expo-router';
import BodyweightRoutineScreen from '../../../src/screens/Workout/BodyweightRoutineScreen';

export default function BodyweightRoutine() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <BodyweightRoutineScreen />
        </>
    );
}