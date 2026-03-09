import React, { useState, useEffect, useCallback } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../constants/colors';
import { ExerciseTarget, Routine, ExerciseLog } from '../../types/workout.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '../../components/workout/Toast';
import AlertDialog from '../../components/workout/AlertDialog';
import { useRoutine } from '../../context/RoutineContext';
import { setHeaderActions } from '../../../app/(tabs)/Workout/_layout';

import { useNavigation } from '@react-navigation/native';

export default function RoutineEditorScreen() {
    const router = useRouter();
    const routeParams = useLocalSearchParams();
    const { routineTitle, setRoutineTitle, targets, addTarget, updateTarget, removeTarget, clearRoutine } = useRoutine();

    const navigation = useNavigation();

    const [editingTitle, setEditingTitle] = useState(false);
    const [emptyRoutineToastVisible, setEmptyRoutineToastVisible] = useState(false);
    const [routineSavedToastVisible, setRoutineSavedToastVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedRoutine, setSavedRoutine] = useState<Routine | null>(null);
    const [isFromWorkout, setIsFromWorkout] = useState(false);

    useEffect(() => {
        if (routeParams?.exercisesFromWorkout) {
            try {
                const exercisesFromWorkout = JSON.parse(routeParams.exercisesFromWorkout as string) as ExerciseLog[];
                setIsFromWorkout(true);

                exercisesFromWorkout.forEach((exercise) => {
                    const newTarget: ExerciseTarget = {
                        name: exercise.name,
                        sets: exercise.sets.length,
                        targetWeightKg: exercise.sets[0]?.weightKg || 0,
                        targetReps: exercise.sets[0]?.reps || 0,
                        restSeconds: exercise.restSeconds,
                    };
                    addTarget(newTarget);
                });
            } catch (error) {
                console.error('Error parsing exercises:', error);
            }
        }
    }, [routeParams?.exercisesFromWorkout]);

    useEffect(() => {
        const listener = navigation.addListener('event', (e: any) => {
            const type = e.data?.type;
            if (type === 'saveRoutine') {
                handleSave();
            }
        });

        return () => listener?.();
    }, []);

    useEffect(() => {
        if (routeParams?.exerciseName && typeof routeParams.exerciseName === 'string') {
            const exerciseName = routeParams.exerciseName;

            const newTarget: ExerciseTarget = {
                name: exerciseName,
                sets: 0,
                targetWeightKg: 0,
                targetReps: 0,
                restSeconds: 60,
            };

            addTarget(newTarget);
            router.setParams({ exerciseName: undefined });
        }
    }, [routeParams?.exerciseName]);

    const handleSave = useCallback(async () => {
        if (targets.length === 0) {
            setEmptyRoutineToastVisible(true);
            return;
        }

        setSaving(true);
        try {
            const finalTitle = routineTitle.trim() || 'Untitled Routine';
            const routine: Routine = {
                title: finalTitle,
                targets: targets,
            };

            const existingRoutines = await AsyncStorage.getItem('savedRoutines');
            const routinesArray = existingRoutines ? JSON.parse(existingRoutines) : [];
            routinesArray.push(routine);
            await AsyncStorage.setItem('savedRoutines', JSON.stringify(routinesArray));

            setSavedRoutine(routine);
            setRoutineSavedToastVisible(true);
        } catch (error) {
            console.error('Error saving routine:', error);
        } finally {
            setSaving(false);
        }
    }, [targets, routineTitle]);

    useEffect(() => {
        setHeaderActions({
            openClock: () => {},
            finishWorkout: () => {},
            saveRoutine: handleSave,
        });

        return () => {
            setHeaderActions({
                openClock: () => {},
                finishWorkout: () => {},
                saveRoutine: () => {},
            });
        };
    }, [handleSave]);

    const handleStartWorkout = () => {
        if (savedRoutine) {
            setRoutineSavedToastVisible(false);
            router.push({
                pathname: '/(tabs)/Workout/log',
                params: { routine: JSON.stringify(savedRoutine) },
            });
        }
    };

    const handleCloseRoutine = () => {
        setRoutineSavedToastVisible(false);
        clearRoutine();
        router.push('/(tabs)/Workout');
    };

    const handleAddExercise = () => {
        router.push('/(tabs)/Workout/addexercise');
    };

    const handleTargetChange = (
        index: number,
        field: keyof ExerciseTarget,
        value: any
    ) => {
        const updatedTarget = { ...targets[index], [field]: value };
        updateTarget(index, updatedTarget);
    };

    const handleRemoveExercise = (index: number) => {
        removeTarget(index);
    };

    const handleBack = () => {
        clearRoutine();
        router.back();
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom','left','right']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topSpacing} />

                {/* Routine Title */}
                <View style={styles.section}>
                    {!editingTitle ? (
                        <TouchableOpacity onPress={() => setEditingTitle(true)}>
                            <Text style={styles.routineTitle}>
                                {routineTitle || 'Routine title'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TextInput
                            style={styles.routineTitleInput}
                            value={routineTitle}
                            onChangeText={setRoutineTitle}
                            placeholder="Enter routine title"
                            placeholderTextColor={AppColors.grey}
                            autoFocus
                            onBlur={() => setEditingTitle(false)}
                            onSubmitEditing={() => setEditingTitle(false)}
                        />
                    )}

                    <View style={styles.spacing} />

                    {/* Muscle Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="barbell-outline" size={48} color={AppColors.white} />
                    </View>

                    <View style={styles.mediumSpacing} />

                    {/* Add Exercise Button */}
                    <TouchableOpacity
                        style={styles.addExerciseButton}
                        onPress={handleAddExercise}
                    >
                        <Ionicons name="add" size={20} color={AppColors.orange} />
                        <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
                    </TouchableOpacity>

                    <View style={styles.mediumSpacing} />

                    {/* Exercises List */}
                    {targets.map((target, index) => (
                        <TargetCard
                            key={`${index}-${target.name}`}
                            target={target}
                            index={index}
                            onTargetChange={handleTargetChange}
                            onRemove={handleRemoveExercise}
                        />
                    ))}
                </View>

                <View style={styles.largeSpacing} />
            </ScrollView>

            {/* Empty Routine Toast */}
            <Toast
                visible={emptyRoutineToastVisible}
                message="Your routine needs at least one exercise"
                onClose={() => setEmptyRoutineToastVisible(false)}
                duration={0}
                buttonText="OK"
            />

            {/* Routine Saved Alert */}
            <AlertDialog
                visible={routineSavedToastVisible}
                title="Routine saved successfully!"
                message={isFromWorkout ? "What would you like to do?" : "What would you like to do?"}
                buttons={[
                    {
                        text: 'Start Workout',
                        onPress: () => handleStartWorkout(),
                        style: 'destructive' as const,
                    },
                    {
                        text: 'Close',
                        onPress: () => handleCloseRoutine(),
                        style: 'default' as const,
                    },
                ]}
            />
        </SafeAreaView>
    );
}

// Target Card Component
function TargetCard({ target, index, onTargetChange, onRemove }: any) {
    const [restPickerVisible, setRestPickerVisible] = useState(false);

    return (
        <View style={styles.targetCard}>
            <View style={styles.targetCardHeader}>
                <Text style={styles.targetName}>{target.name}</Text>
                <TouchableOpacity onPress={() => onRemove(index)}>
                    <Ionicons name="close" size={20} color={AppColors.orange} />
                </TouchableOpacity>
            </View>

            <View style={styles.targetSpacing} />

            {/* Rest Selector */}
            <View style={styles.restSelector}>
                <Ionicons name="timer" size={18} color={AppColors.orange} />
                <TouchableOpacity
                    style={styles.restSelectorButton}
                    onPress={() => setRestPickerVisible(true)}
                >
                    <Text style={styles.restSelectorText}>
                        Rest: {target.restSeconds >= 60
                        ? `${Math.floor(target.restSeconds / 60)}m`
                        : `${target.restSeconds}s`}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.targetSpacing} />

            {/* Table Headers */}
            <View style={styles.tableRow}>
                <View style={styles.tableColumn}>
                    <Text style={styles.tableHeaderCell}>Sets</Text>
                </View>
                <View style={styles.tableColumn}>
                    <Text style={styles.tableHeaderCell}>Target Weight</Text>
                </View>
                <View style={styles.tableColumn}>
                    <Text style={styles.tableHeaderCell}>Target Reps</Text>
                </View>
            </View>

            <View style={styles.targetSpacing} />

            {/* Values Row */}
            <View style={styles.tableRow}>
                {/* Sets */}
                <View style={styles.tableColumn}>
                    <View style={styles.inputGroup}>
                        <TouchableOpacity
                            onPress={() => onTargetChange(index, 'sets', Math.max(1, target.sets - 1))}
                        >
                            <Text style={styles.iconButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.inputValue}>{target.sets}</Text>
                        <TouchableOpacity
                            onPress={() => onTargetChange(index, 'sets', Math.min(999, target.sets + 1))}
                        >
                            <Text style={styles.iconButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Weight */}
                <View style={styles.tableColumn}>
                    <View style={styles.inputGroup}>
                        <TouchableOpacity
                            onPress={() => onTargetChange(index, 'targetWeightKg', Math.max(0, target.targetWeightKg - 1))}
                        >
                            <Text style={styles.iconButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.inputValue}>{target.targetWeightKg.toFixed(0)} kg</Text>
                        <TouchableOpacity
                            onPress={() => onTargetChange(index, 'targetWeightKg', target.targetWeightKg + 1)}
                        >
                            <Text style={styles.iconButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Reps */}
                <View style={styles.tableColumn}>
                    <View style={styles.inputGroup}>
                        <TouchableOpacity
                            onPress={() => onTargetChange(index, 'targetReps', Math.max(1, target.targetReps - 1))}
                        >
                            <Text style={styles.iconButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.inputValue}>{target.targetReps}</Text>
                        <TouchableOpacity
                            onPress={() => onTargetChange(index, 'targetReps', Math.min(999, target.targetReps + 1))}
                        >
                            <Text style={styles.iconButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Rest Picker */}
            <RestPickerSheet
                visible={restPickerVisible}
                initial={target.restSeconds}
                onSelect={(seconds: number) => {
                    onTargetChange(index, 'restSeconds', seconds);
                    setRestPickerVisible(false);
                }}
                onClose={() => setRestPickerVisible(false)}
            />
        </View>
    );
}

// Rest Picker Sheet Component
function RestPickerSheet({ visible, initial, onSelect, onClose }: any) {
    const generateRestOptions = (): number[] => {
        const options: number[] = [];
        for (let i = 1; i <= 11; i++) options.push(i * 5);
        for (let m = 1; m <= 4; m++) {
            for (const q of [0, 15, 30, 45]) {
                options.push(m * 60 + q);
            }
        }
        options.push(5 * 60);
        return options.sort((a, b) => a - b);
    };

    const formatRestLabel = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return s === 0 ? `${m}m` : `${m}m ${s}s`;
    };

    const options = generateRestOptions();

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity
                style={styles.sheetBackdrop}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    style={styles.restPickerSheet}
                    activeOpacity={1}
                    onPress={() => {}}
                >
                    <View style={styles.sheetHandle} />
                    <Text style={styles.pickerTitle}>Pick rest time</Text>

                    <ScrollView
                        style={styles.pickerOptions}
                        showsVerticalScrollIndicator={false}
                    >
                        {options.map((seconds) => (
                            <TouchableOpacity
                                key={seconds}
                                style={styles.pickerOption}
                                onPress={() => onSelect(seconds)}
                            >
                                <Text style={styles.pickerOptionText}>
                                    {formatRestLabel(seconds)}
                                </Text>
                                {seconds === initial && (
                                    <Ionicons name="checkmark" size={20} color={AppColors.orange} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.black,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: AppColors.darkBg,
        height: 56,
        paddingHorizontal: 12,
    },

    headerLeft: {
        width: 60,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.orange,
    },

    headerRight: {
        width: 60,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 8,
    },

    iconButton: {
        marginRight: 8,
    },

    saveButton: {
        backgroundColor: AppColors.orange,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },

    saveButtonText: {
        color: AppColors.black,
        fontWeight: '700',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    topSpacing : {
        height: 20
    },
    spacing: {
        height: 12,
    },
    mediumSpacing: {
        height: 22,
    },
    largeSpacing: {
        height: 40,
    },
    targetSpacing: { height: 10 },
    smallSpacing: { height: 40 },
    section: {
        paddingHorizontal: 12,
    },
    routineTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
    routineTitleInput: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
        paddingVertical: 8,
    },
    iconContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    addExerciseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: AppColors.darkBg,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    addExerciseButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
    targetCard: {
        backgroundColor: AppColors.darkBg,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    targetCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    targetName: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },
    restSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        justifyContent: 'center',
    },
    restSelectorButton: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        flex: 1,
    },
    restSelectorText: {
        fontSize: 14,
        color: AppColors.orange,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tableColumn: {
        flex: 1,
        alignItems: 'center',
    },
    tableHeaderCell: {
        fontSize: 12,
        color: AppColors.white,
        textAlign: 'center',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    inputValue: {
        fontSize: 16,
        color: AppColors.white,
        textAlign: 'center',
        minWidth: 40,
    },
    iconButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
        paddingHorizontal: 4,
    },
    sheetBackdrop: {
        flex: 1,
        backgroundColor: AppColors.darkBg,
        justifyContent: 'flex-end',
    },
    restPickerSheet: {
        backgroundColor: AppColors.black,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1.5,
        borderColor: AppColors.orange,
        borderBottomWidth: 0,
        paddingHorizontal: 12,
        paddingVertical: 12,
        maxHeight: '70%',
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: AppColors.orange,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 12,
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        textAlign: 'center',
        marginBottom: 12,
    },
    pickerOptions: {
        maxHeight: 400,
    },
    pickerOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: AppColors.darkBg,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 8,
    },
    pickerOptionText: {
        fontSize: 16,
        color: AppColors.white,
    },
});