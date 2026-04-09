import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Pressable,
    Animated, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AnimatedReanimated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
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

    const screenFade = useRef(new Animated.Value(0)).current;
    const screenTranslate = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(screenFade, {
                toValue: 1,
                duration: 450,
                useNativeDriver: true,
            }),
            Animated.timing(screenTranslate, {
                toValue: 0,
                duration: 450,
                useNativeDriver: true,
            }),
        ]).start();
    }, [screenFade, screenTranslate]);

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
                    ],
                    restSeconds: 0,
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
                restSeconds: target.restSeconds || 0,
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
            return sum + ex.sets.reduce((exSum, set) => exSum + set.weightKg * set.reps, 0);
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
        setTimeout(() => {
            router.push('/(tabs)/Workout');
        }, 50);
    };

    const handleFinish = useCallback(() => {
        if (exercises.length === 0) {
            setNoExercisestoastVisible(true);
            return;
        }

        if (currentRoutine) {
            setTimeout(() => {
                router.push('/(tabs)/Workout');
            }, 50);
        } else {
            setSaveRoutineVisible(true);
        }
    }, [exercises.length, currentRoutine, router]);

    const handleSaveAsRoutine = () => {
        setSaveRoutineVisible(false);


        setTimeout(() => {
            router.push({
                pathname: '/(tabs)/Workout/routine',
                params: {exercisesFromWorkout: JSON.stringify(exercises)},
            });
        },50);
    };

    const handleSkipSaveRoutine = () => {
        setSaveRoutineVisible(false);
        setTimeout(() => {
            router.push('/(tabs)/Workout');
        }, 50);
    };

    const handleAddExercise = () => {

        setTimeout(() => {
            router.push({
                pathname: '/(tabs)/Workout/addexercise',
                params: { fromWorkout: 'true' },
            });
        },50);

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
            if (restTimersRef.current[exerciseIndex]) {
                clearInterval(restTimersRef.current[exerciseIndex]);
                delete restTimersRef.current[exerciseIndex];
            }
            startRestTimer(exerciseIndex);
        }

        setLocalExercises(updatedExercises);
    };

    const startRestTimer = (exerciseIndex: number) => {
        if (restTimersRef.current[exerciseIndex]) {
            clearInterval(restTimersRef.current[exerciseIndex]);
            delete restTimersRef.current[exerciseIndex];
        }

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

    const handleSetWeightChange = (exerciseIndex: number, setIndex: number, newValue: number) => {
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex].sets[setIndex].weightKg = Math.max(0, newValue);
        setLocalExercises(updatedExercises);
    };

    const handleSetRepsChange = (exerciseIndex: number, setIndex: number, newValue: number) => {
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex].sets[setIndex].reps = Math.max(0, newValue);
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

    const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
        setLocalExercises(updatedExercises);
    };

    const handleRestTimeChange = (exerciseIndex: number, seconds: number) => {
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex].restSeconds = seconds;
        setLocalExercises(updatedExercises);
    };

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
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <Animated.View
                style={[
                    styles.animatedScreen,
                    {
                        opacity: screenFade,
                        transform: [{ translateY: screenTranslate }],
                    },
                ]}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.section}>
                        <BlurView intensity={28} tint="dark" style={styles.metricsContainer}>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Duration</Text>
                                <Text style={styles.metricValue}>{formatTime(elapsed)}</Text>
                            </View>

                            <View style={styles.metricDivider} />

                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Volume</Text>
                                <Text style={styles.metricValue}>{getTotalVolume().toFixed(0)} kg</Text>
                            </View>

                            <View style={styles.metricDivider} />

                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Sets</Text>
                                <Text style={styles.metricValue}>{getTotalSets()}</Text>
                            </View>
                        </BlurView>
                        <View style={styles.spacing} />

                        {currentRoutine && (
                            <>
                                <GlassButton style={styles.routineButton} onPress={handleChooseRoutine}>
                                    <Ionicons name="list" size={20} color={AppColors.white} />
                                    <Text style={styles.routineButtonText}>{currentRoutine.title}</Text>
                                </GlassButton>
                                <View style={styles.spacing} />
                            </>
                        )}

                        <GlassButton style={styles.addExerciseButton} onPress={handleAddExercise}>
                            <Ionicons name="add" size={20} color={AppColors.orange} />
                            <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
                        </GlassButton>

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
                                onDeleteSet={handleDeleteSet}
                                onRestTimeChange={handleRestTimeChange}
                            />
                        ))}

                        <View style={styles.spacing} />

                        {currentRoutine && (
                            <>
                                <GlassButton style={styles.updateRoutineButton} onPress={handleUpdateRoutine}>
                                    <Text style={styles.updateRoutineButtonText}>
                                        Update Routine with current workout
                                    </Text>
                                </GlassButton>

                                <View style={styles.mediumSpacing} />
                            </>
                        )}

                        <View style={styles.horizontalButtons}>
                            <GlassButton style={styles.halfButton}>
                                <Text style={styles.actionButtonText}>Settings</Text>
                            </GlassButton>

                            <GlassButton
                                style={styles.halfButton}
                                onPress={() => setDiscardConfirmAlertVisible(true)}
                            >
                                <Text style={styles.actionButtonText}>Discard</Text>
                            </GlassButton>
                        </View>

                        <View style={styles.largeSpacing} />
                    </View>
                </ScrollView>
            </Animated.View>

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
                    <BlurView intensity={28} tint="dark" style={styles.toastContainer}>
                        <Text style={styles.toastText}>Routine updated successfully!</Text>
                    </BlurView>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={chooseRoutineVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setChooseRoutineVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <BlurView intensity={28} tint="dark" style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Routine</Text>
                        <ScrollView style={styles.routinesList} showsVerticalScrollIndicator={false}>
                            <View style={styles.section}>
                                {savedRoutines.map((routine, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.routineItemButton}
                                        onPress={() => handleSelectRoutine(routine)}
                                    >
                                        <View style={styles.routineItemText}>
                                            <Text style={styles.routineItemTitle}>{routine.title}</Text>
                                            <Text style={styles.routineItemSubtitle}>
                                                {routine.targets.length} exercise{routine.targets.length !== 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={AppColors.orange} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setChooseRoutineVisible(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </BlurView>
                </View>
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

function GlassPanel({
                        children,
                        style,
                    }: {
    children: React.ReactNode;
    style?: any;
}) {
    return (
        <BlurView intensity={24} tint="dark" style={[styles.glassBase, style]}>
            {children}
        </BlurView>
    );
}
function GlassButton({
                         children,
                         style,
                         onPress,
                     }: {
    children: React.ReactNode;
    style?: any;
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.88}
            onPress={onPress}
            style={style} // ✅ FIXED
        >
            <BlurView intensity={28} tint="dark" style={styles.blur}>
                <View style={styles.inner}>
                    {children}
                </View>
            </BlurView>
        </TouchableOpacity>
    );
}
function ExerciseCard({
                          exercise,
                          exerciseIndex,
                          onSetDone,
                          onWeightChange,
                          onRepsChange,
                          onAddSet,
                          onDeleteSet,
                          onRestTimeChange,
                      }: any) {
    const [restPickerVisible, setRestPickerVisible] = useState(false);
    const scale = useSharedValue(1);

    const checkboxAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressDone = (setIndex: number) => {
        scale.value = withSpring(0.88, { damping: 12, stiffness: 180 }, () => {
            scale.value = withSpring(1);
        });
        onSetDone(exerciseIndex, setIndex);
    };

    const handleWeightChange = (setIndex: number, text: string) => {
        if (text === '') {
            onWeightChange(exerciseIndex, setIndex, 0);
            return;
        }

        const numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericValue)) {
            onWeightChange(exerciseIndex, setIndex, numericValue);
        }
    };
    const handleRepsChange = (setIndex: number, text: string) => {
        if (text === '') {
            onRepsChange(exerciseIndex, setIndex, 0);
            return;
        }

        const numericValue = parseInt(text.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(numericValue)) {
            onRepsChange(exerciseIndex, setIndex, numericValue);
        }
    };

    return (
        <AnimatedReanimated.View entering={FadeInDown.duration(200)}>
            <BlurView intensity={28} tint="dark" style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>

                    <TouchableOpacity
                        style={styles.restButton}
                        onPress={() => setRestPickerVisible(true)}
                    >
                        <Ionicons name="timer-outline" size={18} color={AppColors.orange} />
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
                            <TextInput
                                style={styles.valuePillInput}
                                value={set.weightKg === 0 ? '' : String(set.weightKg)}
                                keyboardType="numeric"
                                onChangeText={(text) => handleWeightChange(setIndex, text)}
                            />
                        </View>

                        <View style={[styles.tableCellContainer, { flex: 1 }]}>
                            <TextInput
                                style={styles.valuePillInput}
                                value={set.reps === 0 ? '' : String(set.reps)}
                                keyboardType="numeric"
                                onChangeText={(text) => handleRepsChange(setIndex, text)}
                            />
                        </View>

                        <View style={[styles.doneCheckboxContainer, { flex: 0.8 }]}>
                            <AnimatedReanimated.View style={checkboxAnimatedStyle}>
                                <TouchableOpacity
                                    style={[
                                        styles.doneCheckbox,
                                        set.done && styles.doneCheckboxChecked,
                                    ]}
                                    onPress={() => handlePressDone(setIndex)}
                                >
                                    {set.done && (
                                        <Ionicons name="checkmark" size={18} color={AppColors.white} />
                                    )}
                                </TouchableOpacity>
                            </AnimatedReanimated.View>
                        </View>
                    </View>
                ))}

                <View style={styles.exerciseSpacing} />

                <View style={styles.setButtonsRow}>
                    <TouchableOpacity
                        style={styles.addSetButton}
                        onPress={() => onAddSet(exerciseIndex)}
                    >
                        <Text style={styles.addSetButtonText}>+ Add Set</Text>
                    </TouchableOpacity>

                    {exercise.sets.length > 1 && (
                        <TouchableOpacity
                            style={styles.deleteSetButton}
                            onPress={() => onDeleteSet(exerciseIndex, exercise.sets.length - 1)}
                        >
                            <Text style={styles.deleteSetButtonText}>- Delete Set</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <RestPickerSheet
                    visible={restPickerVisible}
                    initial={exercise.restSeconds}
                    onSelect={(seconds: number) => {
                        onRestTimeChange(exerciseIndex, seconds);
                        setRestPickerVisible(false);
                    }}
                    onClose={() => setRestPickerVisible(false)}
                />
            </BlurView>
        </AnimatedReanimated.View>
    );
}

function RestPickerSheet({ visible, initial, onSelect, onClose }: any) {
    const generateRestOptions = (): number[] => {
        const options: number[] = [0];
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
            <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={onClose}>
                <BlurView intensity={25} tint="dark" style={styles.filterSheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.pickerTitle}>Pick rest time</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {options.map((seconds) => (
                            <TouchableOpacity
                                key={seconds}
                                onPress={() => onSelect(seconds)}
                            >
                                <BlurView intensity={15} tint="dark" style={styles.filterOption}>
                                    <Text style={styles.filterOptionText}>
                                        {formatRestLabel(seconds)}
                                    </Text>
                                    {seconds === initial && (
                                        <Ionicons name="checkmark" size={20} color={AppColors.orange} />
                                    )}
                                </BlurView>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </BlurView>
            </TouchableOpacity>
        </Modal>
    );
}

function NumberPadModal({ visible, onSelect, onClose, mode }: any) {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (text: string) => {
        if (mode === 'weight') {
            if (/^\d*\.?\d*$/.test(text)) {
                setInputValue(text);
            }
        } else {
            if (/^\d*$/.test(text)) {
                setInputValue(text);
            }
        }
    };

    const handleConfirm = () => {
        const value = mode === 'weight' ? parseFloat(inputValue) || 0 : parseInt(inputValue) || 0;
        onSelect(value);
        setInputValue('');
        onClose();
    };

    const handleCancel = () => {
        setInputValue('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
            <View style={styles.numberPadBackdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
                <BlurView intensity={30} tint="dark" style={styles.numberPadContainer}>
                    <View style={styles.numberPadHeader}>
                        <Text style={styles.numberPadTitle}>
                            {mode === 'sets' ? 'Sets' : mode === 'weight' ? 'Weight (kg)' : 'Reps'}
                        </Text>
                        <TouchableOpacity onPress={handleCancel}>
                            <Ionicons name="close" size={24} color={AppColors.orange} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.numberPadDisplay}>
                        <Text style={styles.numberPadDisplayText}>{inputValue || '0'}</Text>
                    </View>

                    <TextInput
                        style={styles.valuePillInput}
                        value={inputValue}
                        keyboardType="numeric"
                        onChangeText={handleInputChange}
                        autoFocus
                        placeholder="Enter value"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                    />

                    <View style={styles.numberPadButtonsRow}>
                        <TouchableOpacity
                            style={[styles.numberPadActionButton, styles.numberPadCancelButton]}
                            onPress={handleCancel}
                        >
                            <Text style={styles.numberPadActionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.numberPadActionButton, styles.numberPadConfirmButton]}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.numberPadConfirmButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </View>
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
                <BlurView intensity={28} tint="dark" style={styles.clockOverlay}>
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
                </BlurView>
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

                <BlurView intensity={30} tint="dark" style={styles.durationPickerSheet}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.durationPickerTitle}>Select duration</Text>

                    <View style={styles.durationInputRow}>
                        <ScrollView
                            style={{ height: ITEM_HEIGHT * 3, width: '40%' }}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
                            scrollEventThrottle={16}
                            onMomentumScrollEnd={(e) => {
                                const offset = e.nativeEvent.contentOffset.y;
                                const index = Math.round(offset / ITEM_HEIGHT);
                                setMinutes(Math.max(0, Math.min(59, index)));
                            }}
                        >
                            {minutesList.map((m) => (
                                <View
                                    key={m}
                                    style={{
                                        height: ITEM_HEIGHT,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={styles.durationValue}>
                                        {String(m).padStart(2, '0')}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>

                        <Text style={styles.durationSeparator}>:</Text>

                        <ScrollView
                            style={{ height: ITEM_HEIGHT * 3, width: '40%' }}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
                            scrollEventThrottle={16}
                            onMomentumScrollEnd={(e) => {
                                const offset = e.nativeEvent.contentOffset.y;
                                const index = Math.round(offset / ITEM_HEIGHT);
                                setSeconds(Math.max(0, Math.min(59, index)));
                            }}
                        >
                            {secondsList.map((s) => (
                                <View
                                    key={s}
                                    style={{
                                        height: ITEM_HEIGHT,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={styles.durationValue}>
                                        {String(s).padStart(2, '0')}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>

                        <View
                            pointerEvents="none"
                            style={{
                                position: 'absolute',
                                top: ITEM_HEIGHT,
                                bottom: ITEM_HEIGHT,
                                left: '5%',
                                right: '5%',
                                borderTopWidth: 1,
                                borderRadius: 10,
                                borderBottomWidth: 1,
                                borderLeftWidth: 1,
                                borderRightWidth: 1,
                                borderColor: AppColors.lightGrey,
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
                </BlurView>
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
                    activeOpacity={1}
                    onPress={() => {}}
                >
                    <BlurView intensity={30} tint="dark" style={styles.workoutInProgressSheet}>
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
                        <View style={styles.largeSpacing}/>
                    </BlurView>
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
                <BlurView intensity={28} tint="dark" style={styles.restCompleteOverlay}>
                    <Text style={styles.restCompleteText}>Time for the next set!</Text>
                </BlurView>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090909',
        width: '100%',

    },

    animatedScreen: {
        flex: 1,
    },

    scrollView: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 14,
        marginTop: 8,
    },
    blur: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
    },
    inner: {
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 14,
        gap:8
    },

    scrollContent: {
        paddingBottom: 20,
        paddingTop: 20
    },

    glassBase: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },

    metricsRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 12,
        overflow: 'hidden',
    },

    metricBlock: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        overflow: 'hidden',
    },

    metricLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 6,
    },

    metricValue: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },

    topSpacing: {
        height: 20,
    },

    spacing: {
        height: 12,
    },

    mediumSpacing: {
        height: 18,
    },
    largeSpacing: {
        height: 14,
    },

    routineButton:{
        width: '100%',             // full width to show blur
        flexDirection: 'row',      // for icon + text inline
        alignItems: 'center',      // vertical center
        justifyContent: 'center',  // center horizontally
        borderRadius: 14,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.05)', // subtle background tint to enhance blur
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        gap: 8,
    },

    routineButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },

    addExerciseButton: {
        width: '100%',             // full width to show blur
        flexDirection: 'row',      // for icon + text inline
        alignItems: 'center',      // vertical center
        justifyContent: 'center',  // center horizontally
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)', // subtle background tint to enhance blur
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        gap: 8,                   // spacing between icon & text
    },

    addExerciseButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },

    exerciseCard: {
        borderRadius: 20,
        padding: 14,
        marginBottom: 12,

        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
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
        flex: 1,
        marginRight: 10,
    },

    restButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,120,37,0.10)',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,120,37,0.20)',
    },

    sheetBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    filterSheet: {
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingHorizontal: 12,
        paddingVertical: 16,
        maxHeight: '70%',
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: AppColors.orange,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 12,
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
    },
    filterOptionText: {fontSize: 15, fontWeight: '500', color: AppColors.orange},

    pickerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        textAlign: 'center',
        marginBottom: 12,
    },
    restButtonText: {
        fontSize: 14,
        color: AppColors.orange,
        fontWeight: '600',
    },

    restCountdown: {
        marginTop: 10,
        backgroundColor: 'rgba(255,120,37,0.10)',
        paddingVertical: 10,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,120,37,0.18)',
    },

    restCountdownText: {
        fontSize: 14,
        fontWeight: '700',
        color: AppColors.orange,
    },

    exerciseSpacing: {
        height: 10,
    },

    tableHeaderRow: {
        flexDirection: 'row',
        marginBottom: 6,
        paddingHorizontal: 4,
    },

    tableHeaderCell: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.65)',
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
        opacity: 0.95,
    },

    tableCellContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },

    valuePill: {
        minWidth: 68,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    valuePillInput: {
        minWidth: 78,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: AppColors.white,
        fontWeight: '600',
        fontSize: 15,
        padding: 0,
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
        width: 28,
        height: 28,
        borderWidth: 1.5,
        borderColor: 'rgba(255,120,37,0.55)',
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.04)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    doneCheckboxChecked: {
        backgroundColor: 'rgba(255,120,37,0.26)',
        borderColor: AppColors.orange,
    },

    setButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },

    addSetButton: {
        flex: 1,
        backgroundColor: 'rgba(255,120,37,0.15)',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,120,37,0.35)',
    },

    addSetButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },

    deleteSetButton: {
        flex: 1,
        backgroundColor: 'rgba(255,120,37,0.12)',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,120,37,0.25)',
    },

    deleteSetButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },

    updateRoutineButton: {
        width: '100%',             // full width to show blur
        alignItems: 'center',      // vertical center
        justifyContent: 'center',  // center horizontally
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)', // subtle background tint to enhance blur
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        gap: 8,
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

    },

    actionButton: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },

    settingsButton: {},

    discardButton: {},

    actionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },

    overlayBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    toastBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    toastContainer: {
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },

    toastText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        textAlign: 'center',
    },
    clockBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clockOverlay: {
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 20,
        width: '80%',
        maxWidth: 337,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
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
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
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
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
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
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
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
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
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


    workoutInProgressSheet: {
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingHorizontal: 12,
        paddingVertical: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
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
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },

    sheetButtonDiscard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },

    sheetButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },

    restCompleteOverlay: {
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },

    restCompleteText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        textAlign: 'center',
    },

    restPickerSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 12,
        maxHeight: '70%',
        backgroundColor: 'rgba(255,255,255,0.09)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
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
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },

    pickerOptionText: {
        fontSize: 16,
        color: AppColors.white,
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        borderRadius: 24,
        width: '90%',
        height: '50%',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        flexDirection: 'column',
    },

    routineItemButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // text left, chevron right
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        gap: 12,
    },

    routineItemText: {
        flexShrink: 0,  // never let text shrink to 0
        flexGrow: 1,    // fill available space
        marginRight: 8, // small space before chevron
    },

    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        textAlign: 'center',
        marginBottom: 20,
    },

    routinesList: {
        flex: 1,
        marginBottom: 12,
        width: '100%',
    },

    routineItemTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: AppColors.orange,
        marginBottom: 4,
    },

    routineItemSubtitle: {
        fontSize: 12,
        color: AppColors.grey,
    },

    modalCloseButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
    },

    modalCloseButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },

    inputTouchable: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    numberPadBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberPadContainer: {
        borderRadius: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        paddingVertical: 20,
        width: '85%',
        maxWidth: 350,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },

    numberPadHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        alignSelf: 'stretch',
    },

    numberPadTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        flex: 1,
    },

    numberPadDisplay: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        paddingVertical: 16,
        marginBottom: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },

    numberPadDisplayText: {
        fontSize: 20,
        fontWeight: '700',
        color: AppColors.orange,
    },

    numberPadGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 16,
    },

    numberPadButton: {
        width: '25%',
        aspectRatio: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 4,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    numberPadButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.orange,
    },

    numberPadBackspaceButton: {
        backgroundColor: 'rgba(255,120,37,0.18)',
        borderColor: 'rgba(255,120,37,0.35)',
    },

    numberPadButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },

    numberPadActionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 14,
        alignItems: 'center',
    },

    numberPadCancelButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    numberPadConfirmButton: {
        backgroundColor: AppColors.orange,
    },

    numberPadActionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },

    numberPadConfirmButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.black,
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow:'hidden',
        paddingVertical: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    metricItem: {
        flex: 1,
        alignItems: 'center',
    },

    metricDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    fullWidthButtons: {

        gap: 12,
    },

    fullButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    horizontalButtons: {
        flexDirection: 'row',
        gap: 8,

        justifyContent: 'space-between',
    },

    halfButton: {
        flex: 1,
        height: 55,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
});
