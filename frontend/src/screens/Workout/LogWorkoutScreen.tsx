import React, { useState, useEffect, useRef, useCallback } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../constants/colors';
import { Routine, SetEntry, ExerciseLog } from '../../types/workout.types';
import Toast from '../../components/workout/Toast';
import AlertDialog from '../../components/workout/AlertDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { setHeaderActions } from '../../../app/(tabs)/Workout/_layout';

export default function LogWorkoutScreen() {
    const router = useRouter();
    const routeParams = useLocalSearchParams();
    const navigation = useNavigation();

    const [elapsed, setElapsed] = useState(0);
    const [exercises, setLocalExercises] = useState<ExerciseLog[]>([]);
    const [currentRoutine, setLocalRoutine] = useState<Routine | null>(null);
    const [workoutInProgressVisible, setWorkoutInProgressVisible] = useState(false);
    const [clockOverlayVisible, setClockOverlayVisible] = useState(false);
    const [restCompleteVisible, setRestCompleteVisible] = useState(false);
    const [restCompleteExercise, setRestCompleteExercise] = useState('');
    const [noExercisestoastVisible, setNoExercisestoastVisible] = useState(false);
    const [discardConfirmAlertVisible, setDiscardConfirmAlertVisible] = useState(false);
    const [routineUpdatedToastVisible, setRoutineUpdatedToastVisible] = useState(false);
    const [chooseRoutineVisible, setChooseRoutineVisible] = useState(false);
    const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);
    const [saveRoutineVisible, setSaveRoutineVisible] = useState(false);
    const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
    const restTimersRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

    useEffect(() => {
        elapsedTimerRef.current = setInterval(() => {
            setElapsed((prev) => prev + 1);
        }, 1000);

        return () => {
            if (elapsedTimerRef.current) {
                clearInterval(elapsedTimerRef.current);
            }
            Object.values(restTimersRef.current).forEach(timer => clearInterval(timer));
        };
    }, []);

    useEffect(() => {
        if (routeParams?.routine) {
            try {
                const routine = JSON.parse(routeParams.routine as string) as Routine;
                applyRoutine(routine);
            } catch (error) {
                console.error('Error parsing routine:', error);
            }
        }
    }, [routeParams?.routine]);

    useFocusEffect(
        React.useCallback(() => {
            if (routeParams?.addExerciseName && typeof routeParams.addExerciseName === 'string') {
                const exerciseName = routeParams.addExerciseName;

                const newExercise: ExerciseLog = {
                    name: exerciseName,
                    sets: [
                        { weightKg: 0, reps: 0, done: false },
                        { weightKg: 0, reps: 0, done: false },
                        { weightKg: 0, reps: 0, done: false },
                    ],
                    restSeconds: 60,
                    restRemaining: 0,
                    restTimerRef: null,
                };

                setLocalExercises(prev => [...prev, newExercise]);
                router.setParams({ addExerciseName: undefined } as any);
            }
        }, [routeParams?.addExerciseName, router])
    );

    const loadRoutines = async () => {
        try {
            const saved = await AsyncStorage.getItem('savedRoutines');
            const routinesArray = saved ? JSON.parse(saved) : [];
            setSavedRoutines(routinesArray);
        } catch (error) {
            console.error('Error loading routines:', error);
        }
    };

    const applyRoutine = (routine: Routine) => {
        const newExercises = routine.targets.map((target) => {
            const initialSets: SetEntry[] = Array.from({ length: target.sets }, () => ({
                weightKg: target.targetWeightKg,
                reps: target.targetReps,
                done: false,
            }));
            return {
                name: target.name,
                sets: initialSets,
                restSeconds: target.restSeconds,
                restRemaining: 0,
                restTimerRef: null,
            };
        });
        setLocalExercises(newExercises);
        setLocalRoutine(routine);
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getTotalVolume = (): number => {
        return exercises.reduce((sum, ex) => {
            return (
                sum +
                ex.sets.reduce((exSum, set) => exSum + set.weightKg * set.reps, 0)
            );
        }, 0);
    };

    const getTotalSets = (): number => {
        return exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    };

    const handleBack = useCallback(() => {
        setWorkoutInProgressVisible(true);
    }, []);

    const handleDiscardWorkout = () => {
        setWorkoutInProgressVisible(false);
        setDiscardConfirmAlertVisible(true);
    };

    const handleConfirmDiscard = () => {
        setDiscardConfirmAlertVisible(false);
        router.push('/(tabs)/Workout');
    };

    const handleFinish = useCallback(() => {
        if (exercises.length === 0) {
            setNoExercisestoastVisible(true);
            return;
        }

        if (currentRoutine) {
            router.push('/(tabs)/Workout');
        } else {
            setSaveRoutineVisible(true);
        }
    }, [exercises.length, currentRoutine, router]);

    const handleSaveAsRoutine = () => {
        setSaveRoutineVisible(false);
        router.push({
            pathname: '/(tabs)/Workout/routine',
            params: { exercisesFromWorkout: JSON.stringify(exercises) },
        });
    };

    const handleSkipSaveRoutine = () => {
        setSaveRoutineVisible(false);
        router.push('/(tabs)/Workout');
    };

    const handleAddExercise = () => {
        router.push({
            pathname: '/(tabs)/Workout/addexercise',
            params: { fromWorkout: 'true' },
        });
    };

    const handleChooseRoutine = () => {
        loadRoutines();
        setChooseRoutineVisible(true);
    };

    const handleSelectRoutine = (routine: Routine) => {
        applyRoutine(routine);
        setChooseRoutineVisible(false);
    };

    const handleUpdateRoutine = async () => {
        if (exercises.length === 0) {
            setNoExercisestoastVisible(true);
            return;
        }

        try {
            if (currentRoutine) {
                const updatedRoutine: Routine = {
                    title: currentRoutine.title,
                    targets: exercises.map((ex) => ({
                        name: ex.name,
                        sets: ex.sets.length,
                        targetWeightKg: ex.sets[0]?.weightKg || 0,
                        targetReps: ex.sets[0]?.reps || 0,
                        restSeconds: ex.restSeconds,
                    })),
                };

                const existingRoutines = await AsyncStorage.getItem('savedRoutines');
                const routinesArray = existingRoutines ? JSON.parse(existingRoutines) : [];

                const routineIndex = routinesArray.findIndex((r: Routine) => r.title === currentRoutine.title);
                if (routineIndex >= 0) {
                    routinesArray[routineIndex] = updatedRoutine;
                } else {
                    routinesArray.push(updatedRoutine);
                }

                await AsyncStorage.setItem('savedRoutines', JSON.stringify(routinesArray));
                setRoutineUpdatedToastVisible(true);
            }
        } catch (error) {
            console.error('Error updating routine:', error);
        }
    };

    const handleSetDone = (exerciseIndex: number, setIndex: number) => {
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex].sets[setIndex].done =
            !updatedExercises[exerciseIndex].sets[setIndex].done;

        if (updatedExercises[exerciseIndex].sets[setIndex].done) {
            startRestTimer(exerciseIndex);
        }

        setLocalExercises(updatedExercises);
    };

    const startRestTimer = (exerciseIndex: number) => {
        const exercise = exercises[exerciseIndex];
        let remaining = exercise.restSeconds;

        const timer = setInterval(() => {
            remaining--;
            if (remaining >= 0) {
                const updatedExercises = [...exercises];
                updatedExercises[exerciseIndex].restRemaining = remaining;
                setLocalExercises(updatedExercises);
            } else {
                clearInterval(timer);
                delete restTimersRef.current[exerciseIndex];
                setRestCompleteExercise(exercise.name);
                setRestCompleteVisible(true);
            }
        }, 1000);

        restTimersRef.current[exerciseIndex] = timer;
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex].restRemaining = remaining;
        setLocalExercises(updatedExercises);
    };

    const handleSetWeightChange = (exerciseIndex: number, setIndex: number, delta: number) => {
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex].sets[setIndex].weightKg = Math.max(
            0,
            updatedExercises[exerciseIndex].sets[setIndex].weightKg + delta
        );
        setLocalExercises(updatedExercises);
    };

    const handleSetRepsChange = (exerciseIndex: number, setIndex: number, delta: number) => {
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex].sets[setIndex].reps = Math.max(
            0,
            updatedExercises[exerciseIndex].sets[setIndex].reps + delta
        );
        setLocalExercises(updatedExercises);
    };

    const handleAddSet = (exerciseIndex: number) => {
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex].sets.push({
            weightKg: 0,
            reps: 0,
            done: false,
        });
        setLocalExercises(updatedExercises);
    };

    const handleRestTimeChange = (exerciseIndex: number, seconds: number) => {
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex].restSeconds = seconds;
        setLocalExercises(updatedExercises);
    };

    // Set header actions
    useEffect(() => {
        setHeaderActions({
            openClock: () => setClockOverlayVisible(true),
            finishWorkout: handleFinish,
            saveRoutine: () => {},
            handleBack: handleBack,
        });

        return () => {
            setHeaderActions({
                openClock: () => {},
                finishWorkout: () => {},
                saveRoutine: () => {},
                handleBack: () => {},
            });
        };
    }, [handleFinish, handleBack]);

    return (
        <SafeAreaView style={styles.container} edges={['bottom','left','right']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topSpacing} />
                <View style={styles.metricsRow}>
                    <View style={styles.metricBlock}>
                        <Text style={styles.metricLabel}>Duration</Text>
                        <Text style={styles.metricValue}>{formatTime(elapsed)}</Text>
                    </View>
                    <View style={styles.metricBlock}>
                        <Text style={styles.metricLabel}>Volume</Text>
                        <Text style={styles.metricValue}>{getTotalVolume().toFixed(0)} kg</Text>
                    </View>
                    <View style={styles.metricBlock}>
                        <Text style={styles.metricLabel}>Sets</Text>
                        <Text style={styles.metricValue}>{getTotalSets()}</Text>
                    </View>
                </View>

                <View style={styles.spacing} />

                {currentRoutine && (
                    <>
                        <TouchableOpacity
                            style={styles.routineButton}
                            onPress={handleChooseRoutine}
                        >
                            <Ionicons name="menu" size={20} color={AppColors.orange} />
                            <Text style={styles.routineButtonText}>{currentRoutine.title}</Text>
                        </TouchableOpacity>
                        <View style={styles.spacing} />
                    </>
                )}

                <TouchableOpacity
                    style={styles.addExerciseButton}
                    onPress={handleAddExercise}
                >
                    <Ionicons name="add" size={20} color={AppColors.orange} />
                    <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
                </TouchableOpacity>

                <View style={styles.spacing} />

                {exercises.map((exercise, exerciseIndex) => (
                    <ExerciseCard
                        key={`${exercise.name}-${exerciseIndex}`}
                        exercise={exercise}
                        exerciseIndex={exerciseIndex}
                        onSetDone={handleSetDone}
                        onWeightChange={handleSetWeightChange}
                        onRepsChange={handleSetRepsChange}
                        onAddSet={handleAddSet}
                        onRestTimeChange={handleRestTimeChange}
                    />
                ))}

                <View style={styles.spacing} />

                {currentRoutine && (
                    <>
                        <TouchableOpacity
                            style={styles.updateRoutineButton}
                            onPress={handleUpdateRoutine}
                        >
                            <Text style={styles.updateRoutineButtonText}>
                                Update Routine with current workout
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.mediumSpacing} />
                    </>
                )}

                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={[styles.actionButton, styles.settingsButton]}>
                        <Text style={styles.actionButtonText}>Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.discardButton]}
                        onPress={() => setDiscardConfirmAlertVisible(true)}
                    >
                        <Text style={styles.actionButtonText}>Discard</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.largeSpacing} />
            </ScrollView>

            <ClockOverlay
                visible={clockOverlayVisible}
                onClose={() => setClockOverlayVisible(false)}
            />

            <WorkoutInProgressSheet
                visible={workoutInProgressVisible}
                onResume={() => setWorkoutInProgressVisible(false)}
                onDiscard={handleDiscardWorkout}
            />

            <RestCompleteOverlay
                visible={restCompleteVisible}
                exerciseName={restCompleteExercise}
                onClose={() => setRestCompleteVisible(false)}
            />

            <Toast
                visible={noExercisestoastVisible}
                message="Add an exercise first"
                onClose={() => setNoExercisestoastVisible(false)}
                duration={0}
                buttonText="OK"
            />

            <Modal visible={routineUpdatedToastVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.toastBackdrop}
                    activeOpacity={1}
                    onPress={() => setRoutineUpdatedToastVisible(false)}
                >
                    <View style={styles.toastContainer}>
                        <Text style={styles.toastText}>Routine updated successfully!</Text>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={chooseRoutineVisible} transparent animationType="fade" onRequestClose={() => setChooseRoutineVisible(false)}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setChooseRoutineVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContent}
                        activeOpacity={1}
                        onPress={() => {}}
                    >
                        <Text style={styles.modalTitle}>Choose Routine</Text>
                        <ScrollView style={styles.routinesList}>
                            {savedRoutines.map((routine, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.routineItemButton}
                                    onPress={() => handleSelectRoutine(routine)}
                                >
                                    <Ionicons name="list" size={20} color={AppColors.orange} />
                                    <View style={styles.routineItemText}>
                                        <Text style={styles.routineItemTitle}>{routine.title}</Text>
                                        <Text style={styles.routineItemSubtitle}>
                                            {routine.targets.length} exercise{routine.targets.length !== 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={AppColors.orange} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setChooseRoutineVisible(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <AlertDialog
                visible={discardConfirmAlertVisible}
                title="Discard Workout?"
                message="Are you sure you want to discard your workout?"
                buttons={[
                    {
                        text: 'Cancel',
                        onPress: () => setDiscardConfirmAlertVisible(false),
                        style: 'default',
                    },
                    {
                        text: 'Discard',
                        onPress: handleConfirmDiscard,
                        style: 'destructive',
                    },
                ]}
            />

            <AlertDialog
                visible={saveRoutineVisible}
                title="Save as Routine?"
                message="Would you like to save this workout as a routine?"
                buttons={[
                    {
                        text: 'Yes',
                        onPress: handleSaveAsRoutine,
                        style: 'default',
                    },
                    {
                        text: 'No',
                        onPress: handleSkipSaveRoutine,
                        style: 'destructive',
                    },
                ]}
            />
        </SafeAreaView>
    );
}

function ExerciseCard({
                          exercise,
                          exerciseIndex,
                          onSetDone,
                          onWeightChange,
                          onRepsChange,
                          onAddSet,
                          onRestTimeChange,
                      }: any) {
    const [restPickerVisible, setRestPickerVisible] = useState(false);

    return (
        <View style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <TouchableOpacity
                    style={styles.restButton}
                    onPress={() => setRestPickerVisible(true)}
                >
                    <Ionicons name="timer" size={18} color={AppColors.orange} />
                    <Text style={styles.restButtonText}>
                        Rest: {exercise.restSeconds >= 60
                        ? `${Math.floor(exercise.restSeconds / 60)}m`
                        : `${exercise.restSeconds}s`}
                    </Text>
                </TouchableOpacity>
            </View>

            {exercise.restRemaining > 0 && (
                <View style={styles.restCountdown}>
                    <Text style={styles.restCountdownText}>
                        Rest: {String(Math.floor(exercise.restRemaining / 60)).padStart(2, '0')}:
                        {String(exercise.restRemaining % 60).padStart(2, '0')}
                    </Text>
                </View>
            )}

            <View style={styles.exerciseSpacing} />

            <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>Set</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Weight</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Reps</Text>
                <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Done</Text>
            </View>

            <View style={styles.exerciseSpacing} />

            {exercise.sets.map((set: SetEntry, setIndex: number) => (
                <View key={setIndex} style={styles.tableDataRow}>
                    <Text style={[styles.tableCell, { flex: 0.5 }]}>{setIndex + 1}</Text>

                    <View style={[styles.tableCellContainer, { flex: 1.5 }]}>
                        <TouchableOpacity onPress={() => onWeightChange(exerciseIndex, setIndex, -1)}>
                            <Text style={styles.iconButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.tableCell}>{set.weightKg.toFixed(0)} kg</Text>
                        <TouchableOpacity onPress={() => onWeightChange(exerciseIndex, setIndex, 1)}>
                            <Text style={styles.iconButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.tableCellContainer, { flex: 1 }]}>
                        <TouchableOpacity onPress={() => onRepsChange(exerciseIndex, setIndex, -1)}>
                            <Text style={styles.iconButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.tableCell}>{set.reps}</Text>
                        <TouchableOpacity onPress={() => onRepsChange(exerciseIndex, setIndex, 1)}>
                            <Text style={styles.iconButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.doneCheckboxContainer, { flex: 0.8 }]}>
                        <TouchableOpacity
                            style={[
                                styles.doneCheckbox,
                                set.done && styles.doneCheckboxChecked,
                            ]}
                            onPress={() => onSetDone(exerciseIndex, setIndex)}
                        />
                    </View>
                </View>
            ))}

            <View style={styles.exerciseSpacing} />

            <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => onAddSet(exerciseIndex)}
            >
                <Text style={styles.addSetButtonText}>+ Add Set</Text>
            </TouchableOpacity>

            <RestPickerSheet
                visible={restPickerVisible}
                initial={exercise.restSeconds}
                onSelect={(seconds: number) => {
                    onRestTimeChange(exerciseIndex, seconds);
                    setRestPickerVisible(false);
                }}
                onClose={() => setRestPickerVisible(false)}
            />
        </View>
    );
}

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

function ClockOverlay({ visible, onClose }: any) {
    const [isTimer, setIsTimer] = useState(true);
    const [timerDuration, setTimerDuration] = useState(0);
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [durationPickerVisible, setDurationPickerVisible] = useState(false);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    const handleStart = () => {
        if (isRunning) return;
        setIsRunning(true);
        timerIntervalRef.current = setInterval(() => {
            if (isTimer) {
                setTimerDuration((prev) => (prev > 0 ? prev - 1 : 0));
            } else {
                setStopwatchTime((prev) => prev + 1);
            }
        }, 1000);
    };

    const handleStop = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        setIsRunning(false);
    };

    const handleReset = () => {
        handleStop();
        if (isTimer) {
            setTimerDuration(0);
        } else {
            setStopwatchTime(0);
        }
    };

    const formatDisplayTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.clockBackdrop}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={styles.clockOverlay}>
                    <View style={styles.clockHeader}>
                        <View style={{ width: 24 }} />
                        <Text style={styles.clockTitle}>Clock</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={AppColors.orange} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.timerToggle}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                isTimer && styles.toggleButtonActive,
                            ]}
                            onPress={() => setIsTimer(true)}
                        >
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    isTimer && styles.toggleButtonTextActive,
                                ]}
                            >
                                Timer
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                !isTimer && styles.toggleButtonActive,
                            ]}
                            onPress={() => setIsTimer(false)}
                        >
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    !isTimer && styles.toggleButtonTextActive,
                                ]}
                            >
                                Stopwatch
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.timeDisplay}>
                        {formatDisplayTime(isTimer ? timerDuration : stopwatchTime)}
                    </Text>

                    {isTimer && (
                        <TouchableOpacity
                            style={styles.setDurationButton}
                            onPress={() => setDurationPickerVisible(true)}
                        >
                            <Text style={styles.setDurationButtonText}>Set duration</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.controlButtons}>
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={handleStart}
                        >
                            <Text style={styles.controlButtonText}>Start</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={handleStop}
                        >
                            <Text style={styles.controlButtonText}>Stop</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={handleReset}
                        >
                            <Text style={styles.controlButtonText}>Reset</Text>
                        </TouchableOpacity>
                    </View>

                    <DurationPickerModal
                        visible={durationPickerVisible}
                        onSelect={(duration: number) => {
                            setTimerDuration(duration);
                            setDurationPickerVisible(false);
                        }}
                        onClose={() => setDurationPickerVisible(false)}
                    />
                </View>
            </View>
        </Modal>
    );
}

function DurationPickerModal({ visible, onSelect, onClose }: any) {
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    const ITEM_HEIGHT = 40;

    const handleConfirm = () => {
        const totalSeconds = minutes * 60 + seconds;
        onSelect(totalSeconds);
    };

    const minutesList = Array.from({ length: 60 }, (_, i) => i);
    const secondsList = Array.from({ length: 60 }, (_, i) => i);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.pickerBackdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <View style={styles.durationPickerSheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.durationPickerTitle}>Select duration</Text>

                    <View style={styles.durationInputRow}>
                        <ScrollView
                            style={{ height: ITEM_HEIGHT * 3 }}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
                            onMomentumScrollEnd={(e) => {
                                const index = Math.round(
                                    e.nativeEvent.contentOffset.y / ITEM_HEIGHT
                                );
                                setMinutes(index);
                            }}
                        >
                            {minutesList.map((m) => (
                                <View
                                    key={m}
                                    style={{
                                        height: ITEM_HEIGHT,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={styles.durationValue}>
                                        {String(m).padStart(2, "0")}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>

                        <Text style={styles.durationSeparator}>:</Text>

                        <ScrollView
                            style={{ height: ITEM_HEIGHT * 3 }}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
                            onMomentumScrollEnd={(e) => {
                                const index = Math.round(
                                    e.nativeEvent.contentOffset.y / ITEM_HEIGHT
                                );
                                setSeconds(index);
                            }}
                        >
                            {secondsList.map((s) => (
                                <View
                                    key={s}
                                    style={{
                                        height: ITEM_HEIGHT,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={styles.durationValue}>
                                        {String(s).padStart(2, "0")}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>

                        <View
                            pointerEvents="none"
                            style={{
                                position: "absolute",
                                top: ITEM_HEIGHT,
                                bottom: ITEM_HEIGHT,
                                left: 15,
                                right: 15,
                                borderTopWidth: 1,
                                borderRadius: 10,
                                borderBottomWidth: 1,
                                borderLeftWidth: 1,
                                borderRightWidth: 1,
                                borderColor: AppColors.lightGrey
                            }}
                        />
                    </View>

                    <View style={styles.durationButtonsRow}>
                        <TouchableOpacity
                            style={[styles.durationButton, styles.durationCancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.durationButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.durationButton, styles.durationOKButton]}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.durationOKButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function WorkoutInProgressSheet({ visible, onResume, onDiscard }: any) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onResume}>
            <TouchableOpacity
                style={styles.sheetBackdrop}
                activeOpacity={1}
                onPress={onResume}
            >
                <TouchableOpacity
                    style={styles.workoutInProgressSheet}
                    activeOpacity={1}
                    onPress={() => {}}
                >
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>Workout in progress</Text>

                    <View style={styles.sheetButtonsRow}>
                        <TouchableOpacity
                            style={[styles.sheetButton, styles.sheetButtonResume]}
                            onPress={onResume}
                        >
                            <Text style={styles.sheetButtonText}>Resume</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.sheetButton, styles.sheetButtonDiscard]}
                            onPress={onDiscard}
                        >
                            <Text style={styles.sheetButtonText}>Discard</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

function RestCompleteOverlay({ visible, exerciseName, onClose }: any) {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [visible, onClose]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={styles.overlayBackdrop}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.restCompleteOverlay}>
                    <Text style={styles.restCompleteText}>Time for the next set!</Text>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.black,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 12,
        paddingBottom: 20,
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 12,
    },
    metricBlock: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    metricLabel: {
        fontSize: 12,
        color: AppColors.grey,
        marginBottom: 6,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
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
    routineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: AppColors.darkBg,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginHorizontal: 12,
    },
    routineButtonText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
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
        marginHorizontal: 12,
    },
    addExerciseButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
    exerciseCard: {
        backgroundColor: AppColors.darkBg,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        marginHorizontal: 12,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },
    restButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    restButtonText: {
        fontSize: 14,
        color: AppColors.orange,
    },
    restCountdown: {
        marginTop: 8,
        backgroundColor: AppColors.black,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'center',
    },
    restCountdownText: {
        fontSize: 14,
        fontWeight: '700',
        color: AppColors.orange,
    },
    exerciseSpacing: { height: 10 },
    tableHeaderRow: {
        flexDirection: 'row',
        marginBottom: 6,
        paddingHorizontal: 4,
    },
    tableHeaderCell: {
        fontSize: 12,
        color: AppColors.white,
        textAlign: 'center',
    },
    tableDataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
        paddingHorizontal: 4,
    },
    tableCell: {
        fontSize: 14,
        color: AppColors.white,
        textAlign: 'center',
    },
    tableCellContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    iconButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
        paddingHorizontal: 6,
    },
    doneCheckboxContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneCheckbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: AppColors.orange,
        borderRadius: 4,
    },
    doneCheckboxChecked: {
        backgroundColor: AppColors.orange,
    },
    addSetButton: {
        backgroundColor: AppColors.orange,
        paddingVertical: 12,
        paddingHorizontal:12,
        borderRadius: 12,
        alignItems: 'center',
    },
    addSetButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },
    updateRoutineButton: {
        backgroundColor: AppColors.darkBg,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 12,
    },
    updateRoutineButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: AppColors.orange,
        textAlign: 'center',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 12,
    },
    actionButton: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    settingsButton: {
        backgroundColor: AppColors.darkBg,
    },
    discardButton: {
        backgroundColor: AppColors.darkBg,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
        textAlign: 'center',
    },
    overlayBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toastBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toastContainer: {
        backgroundColor: AppColors.darkBg,
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    toastText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        textAlign: 'center',
    },
    clockBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clockOverlay: {
        backgroundColor: AppColors.darkBg,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 20,
        width: '80%',
        maxWidth: 337,
    },
    clockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    clockTitle: {
        fontSize: 16,
        fontWeight: '400',
        color: AppColors.white,
        flex: 1,
        textAlign: 'center',
    },
    timerToggle: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    toggleButton: {
        backgroundColor: AppColors.black,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        flex: 1,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: AppColors.orange,
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: AppColors.white,
        textAlign: 'center',
    },
    toggleButtonTextActive: {
        color: AppColors.black,
    },
    timeDisplay: {
        fontSize: 28,
        fontWeight: '700',
        color: AppColors.white,
        marginBottom: 12,
        textAlign: 'center',
    },
    setDurationButton: {
        backgroundColor: AppColors.black,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    setDurationButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },
    controlButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    controlButton: {
        flex: 1,
        backgroundColor: AppColors.black,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    controlButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },
    pickerBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    durationPickerSheet: {
        backgroundColor: AppColors.black,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1.5,
        borderColor: AppColors.orange,
        borderBottomWidth: 0,
        paddingHorizontal: 12,
        paddingVertical: 16,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: AppColors.orange,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 12,
    },
    durationPickerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        textAlign: 'center',
        marginBottom: 20,
    },
    durationInputRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    durationValue: {
        fontSize: 24,
        fontWeight: '700',
        color: AppColors.white,
        marginVertical: 8,
        minWidth: 50,
        textAlign: 'center',
    },
    durationSeparator: {
        fontSize: 24,
        fontWeight: '700',
        color: AppColors.white,
        marginHorizontal: 16,
    },
    durationButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    durationButton: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    durationCancelButton: {
        backgroundColor: AppColors.darkBg,
    },
    durationOKButton: {
        backgroundColor: AppColors.orange,
    },
    durationButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
    durationOKButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.black,
    },
    sheetBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    workoutInProgressSheet: {
        backgroundColor: AppColors.black,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1.5,
        borderColor: AppColors.orange,
        borderBottomWidth: 0,
        paddingHorizontal: 12,
        paddingVertical: 16,
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: '400',
        color: AppColors.white,
        textAlign: 'center',
        marginBottom: 12,
    },
    sheetButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    sheetButton: {
        flex: 1,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    sheetButtonResume: {
        backgroundColor: AppColors.darkBg,
    },
    sheetButtonDiscard: {
        backgroundColor: AppColors.darkBg,
    },
    sheetButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
    restCompleteOverlay: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    restCompleteText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        textAlign: 'center',
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
    modalBackdrop: {
        flex: 1,
        backgroundColor: AppColors.darkBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: AppColors.darkBg,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 16,
        width: '80%',
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        textAlign: 'center',
        marginBottom: 12,
    },
    routinesList: {
        maxHeight: 300,
        marginBottom: 12,
    },
    routineItemButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: AppColors.black,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    routineItemText: {
        flex: 1,
    },
    routineItemTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: AppColors.white,
        marginBottom: 4,
    },
    routineItemSubtitle: {
        fontSize: 12,
        color: AppColors.grey,
    },
    modalCloseButton: {
        backgroundColor: AppColors.black,
        borderWidth: 1.5,
        borderColor: AppColors.orange,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
});

