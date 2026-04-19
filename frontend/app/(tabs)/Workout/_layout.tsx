import { Stack, useRouter } from 'expo-router';
import { AppColors } from '@/constants/colors';
import { RoutineProvider } from '@/context/RoutineContext';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type HeaderActions = {
    openClock: () => void;
    finishWorkout: () => void;
    saveRoutine: () => void;
    handleBack: () => void;
    shareExercisePreview: () => void;
    openExercisePreviewMenu: () => void;
};

const headerActionsRef: HeaderActions = {
    openClock: () => {},
    finishWorkout: () => {},
    saveRoutine: () => {},
    handleBack: () => {},
    shareExercisePreview: () => {},
    openExercisePreviewMenu: () => {},
};

export const setHeaderActions = (actions: Partial<HeaderActions>) => {
    Object.assign(headerActionsRef, actions);
};

export default function WorkoutLayout() {
    const router = useRouter();

    return (
        <RoutineProvider>
            <Stack
                screenOptions={{
                    headerShown: true,
                    headerStyle: { backgroundColor: AppColors.darkBg },
                    headerTintColor: AppColors.white,
                    headerTitleStyle: { color: AppColors.orange, fontWeight: 'bold', fontSize: 18 },
                    headerTitleAlign: 'center',
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: AppColors.black },
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false,
                    }}
                />

                <Stack.Screen
                    name="routine"
                    options={{
                        title: 'Create Routine',
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                                <Ionicons name="arrow-back" size={24} color={AppColors.orange} />
                            </TouchableOpacity>
                        ),
                        headerRight: () => (
                            <TouchableOpacity
                                style={{
                                    marginLeft: 16,
                                    backgroundColor: AppColors.orange,
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 8,
                                }}
                                onPress={() => headerActionsRef.saveRoutine()}
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
                            <TouchableOpacity onPress={() => headerActionsRef.handleBack()} style={{ marginRight: 12 }}>
                                <Ionicons name="arrow-back" size={24} color={AppColors.orange} />
                            </TouchableOpacity>
                        ),
                        headerRight: () => (
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <TouchableOpacity style={{ paddingHorizontal: 12 }} onPress={() => headerActionsRef.openClock()}>
                                    <Ionicons name="timer-outline" size={24} color={AppColors.orange} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ backgroundColor: AppColors.orange, paddingVertical: 6, borderRadius: 8 }}
                                    onPress={() => headerActionsRef.finishWorkout()}
                                >
                                    <Text style={{ color: AppColors.black, fontWeight: '700', fontSize: 13, paddingHorizontal: 12 }}>
                                        Finish
                                    </Text>
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
                                <Ionicons name="arrow-back" size={24} color={AppColors.orange} />
                            </TouchableOpacity>
                        ),
                    }}
                />

                <Stack.Screen
                    name="exercisepreview"
                    options={{
                        title: 'Exercise Preview',
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                                <Ionicons name="arrow-back" size={24} color={AppColors.orange} />
                            </TouchableOpacity>
                        ),
                        headerRight: () => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <TouchableOpacity style={{ paddingHorizontal: 6 }} onPress={() => headerActionsRef.shareExercisePreview()}>
                                    <Ionicons name="share-outline" size={22} color={AppColors.orange} />
                                </TouchableOpacity>
                                <TouchableOpacity style={{ paddingHorizontal: 6 }} onPress={() => headerActionsRef.openExercisePreviewMenu()}>
                                    <Ionicons name="ellipsis-horizontal" size={22} color={AppColors.orange} />
                                </TouchableOpacity>
                            </View>
                        ),
                    }}
                />

                <Stack.Screen
                    name="explore"
                    options={{
                        title: 'Routines',
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                                <Ionicons name="arrow-back" size={24} color={AppColors.orange} />
                            </TouchableOpacity>
                        ),
                    }}
                />

                <Stack.Screen name="save" />
                <Stack.Screen
                    name="mediapreview"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen name="share" />
                <Stack.Screen
                    name="shareexercise"
                    options={{
                        title: 'Share Exercise',
                    }}
                />
                <Stack.Screen name="settings" />
            </Stack>
        </RoutineProvider>
    );
}
