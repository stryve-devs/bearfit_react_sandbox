import { Stack, useRouter } from 'expo-router';
import { AppColors } from "@/constants/colors";
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useCallback } from 'react';

const headerActionsRef = useRef({
    openClock: () => {},
    finishWorkout: () => {},
    saveRoutine: () => {},
    handleBack: () => {},
});

export const setHeaderActions = (actions: typeof headerActionsRef.current) => {
    headerActionsRef.current = { ...headerActionsRef.current, ...actions };
};

export default function WorkoutLayout() {
    const router = useRouter();

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: AppColors.darkBg },
                headerTintColor: AppColors.white,
                headerTitleStyle: { color: AppColors.orange, fontWeight: 'bold', fontSize: 18 },
                headerTitleContainerStyle: {paddingHorizontal: 12},
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                contentStyle: { backgroundColor: AppColors.black },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Workout',
                    headerLeft: () => null,
                }}
            />

            <Stack.Screen
                name="routine"
                options={{
                    title: 'Create Routine',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                            <Ionicons name="chevron-back" size={24} color={AppColors.orange} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            style={{ marginLeft: 16, backgroundColor: AppColors.orange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                            onPress={() => headerActionsRef.current.saveRoutine()}
                        >
                            <Text style={{ color: AppColors.black, fontWeight: '700', fontSize: 13 }}>Save</Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <Stack.Screen
                name="log"
                options={{
                    title: 'Log Workout',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => headerActionsRef.current.handleBack()} style={{ marginRight: 12 }}>
                            <Ionicons name="chevron-back" size={24} color={AppColors.orange} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap:8}}>
                            <TouchableOpacity style={{paddingHorizontal: 12,}}onPress={() => headerActionsRef.current.openClock()}>
                                <Ionicons name="timer-outline" size={24} color={AppColors.orange} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ backgroundColor: AppColors.orange, paddingVertical: 6, borderRadius: 8 }}
                                onPress={() => headerActionsRef.current.finishWorkout()}
                            >
                                <Text style={{ color: AppColors.black, fontWeight: '700', fontSize: 13,paddingHorizontal: 12 }}>Finish</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ),
                }}
            />

            <Stack.Screen
                name="addexercise"
                options={{
                    title: 'Add Exercise',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                            <Ionicons name="chevron-back" size={24} color={AppColors.orange} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <Stack.Screen
                name="explore"
                options={{
                    title: 'Routines',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                            <Ionicons name="chevron-back" size={24} color={AppColors.orange} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <Stack.Screen
                name="save"
                options={{
                    title: 'Save Workout',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color={AppColors.orange} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => null,
                }}
            />

            <Stack.Screen
                name="share"
                options={{
                    title: '',
                    headerLeft: () => null,
                    headerRight: () => null,
                    headerShown: false,
                }}
            />
        </Stack>
    );
}