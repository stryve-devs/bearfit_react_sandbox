import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Animated,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import { ExerciseTarget, Routine, ExerciseLog } from '../../types/workout.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '../../components/workout/Toast';
import AlertDialog from '../../components/workout/AlertDialog';
import { useRoutine } from '../../context/RoutineContext';
import { setHeaderActions } from '../../../app/(tabs)/Workout/_layout';
import { useNavigation } from '@react-navigation/native';

const ReanimatedTouchable =
    AnimatedReanimated.createAnimatedComponent(TouchableOpacity);

export default function RoutineEditorScreen() {
    const router = useRouter();
    const routeParams = useLocalSearchParams();
    const {
        routineTitle,
        setRoutineTitle,
        targets,
        addTarget,
        updateTarget,
        removeTarget,
        clearRoutine,
    } = useRoutine();
    const navigation = useNavigation();

    const [editingTitle, setEditingTitle] = useState(false);
    const [emptyRoutineToastVisible, setEmptyRoutineToastVisible] = useState(false);
    const [routineSavedToastVisible, setRoutineSavedToastVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedRoutine, setSavedRoutine] = useState<Routine | null>(null);
    const [isFromWorkout, setIsFromWorkout] = useState(false);

    const screenFade = useRef(new Animated.Value(0)).current;
    const screenTranslate = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        if (!routeParams?.exerciseName && !routeParams?.exercisesFromWorkout) {
            clearRoutine();
            setIsFromWorkout(false);
        }
    }, [clearRoutine, routeParams?.exerciseName, routeParams?.exercisesFromWorkout]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(screenFade, {
                toValue: 1,
                duration: 420,
                useNativeDriver: true,
            }),
            Animated.timing(screenTranslate, {
                toValue: 0,
                duration: 420,
                useNativeDriver: true,
            }),
        ]).start();
    }, [screenFade, screenTranslate]);

    useEffect(() => {
        if (routeParams?.exercisesFromWorkout) {
            try {
                const exercisesFromWorkout = JSON.parse(
                    routeParams.exercisesFromWorkout as string
                ) as ExerciseLog[];

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
    }, [navigation]);

    useEffect(() => {
        if (routeParams?.exerciseName && typeof routeParams.exerciseName === 'string') {
            const exerciseName = routeParams.exerciseName;

            const newTarget: ExerciseTarget = {
                name: exerciseName,
                sets: 1,
                targetWeightKg: 0,
                targetReps: 0,
                restSeconds: 0,
            };

            addTarget(newTarget);
            router.setParams({ exerciseName: undefined });
        }
    }, [routeParams?.exerciseName, addTarget, router]);

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
                targets,
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

            setTimeout(() => {
                router.push({
                pathname: '/(tabs)/Workout/log',
                params: { routine: JSON.stringify(savedRoutine) },
            });
        },50);
        }
    };

    const handleCloseRoutine = () => {
        setRoutineSavedToastVisible(false);
        clearRoutine();
        setTimeout(() => {
            router.push('/(tabs)/Workout');
        },50);
    };

    const handleAddExercise = () => {
        setTimeout(() => {
            router.push('/(tabs)/Workout/addexercise');
        },50);
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

                    <AnimatedReanimated.View entering={FadeInUp.duration(420)} style={styles.section}>
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

                        <View style={styles.iconContainer}>
                            <Ionicons name="barbell-outline" size={48} color={AppColors.white} />
                        </View>

                        <View style={styles.mediumSpacing} />

                        <GlassButton onPress={handleAddExercise} style={styles.addExerciseButton}>
                            <Ionicons name="add" size={20} color={AppColors.orange} />
                            <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
                        </GlassButton>

                        <View style={styles.mediumSpacing} />

                        {targets.map((target, index) => (
                            <TargetCard
                                key={`${target.name}-${index}`} // use index + name to prevent re-mount issues
                                target={target}
                                index={index}
                                onTargetChange={handleTargetChange}
                                onRemove={handleRemoveExercise}
                            />
                        ))}
                    </AnimatedReanimated.View>

                    <View style={styles.largeSpacing} />
                </ScrollView>
            </Animated.View>

            <Toast
                visible={emptyRoutineToastVisible}
                message="Your routine needs at least one exercise"
                onClose={() => setEmptyRoutineToastVisible(false)}
                duration={0}
                buttonText="OK"
            />

            <AlertDialog
                visible={routineSavedToastVisible}
                title="Routine saved successfully!"
                message={isFromWorkout ? 'What would you like to do?' : 'What would you like to do?'}
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

function GlassButton({
                         children,
                         onPress,
                         style,
                     }: {
    children: React.ReactNode;
    onPress?: () => void;
    style?: any;
}) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedReanimated.View style={animatedStyle}>
            <ReanimatedTouchable
                activeOpacity={0.92}
                onPress={onPress}
                onPressIn={() => {
                    scale.value = withSpring(0.97);
                }}
                onPressOut={() => {
                    scale.value = withSpring(1);
                }}
            >
                <BlurView intensity={26} tint="dark" style={[styles.glassButtonBase, style]}>
                    {children}
                </BlurView>
            </ReanimatedTouchable>
        </AnimatedReanimated.View>
    );
}

function TargetCard({ target, index, onTargetChange, onRemove }: any) {
    const [restPickerVisible, setRestPickerVisible] = useState(false);
    const [numberPadVisible, setNumberPadVisible] = useState(false);
    const [numberPadMode, setNumberPadMode] = useState<'sets' | 'weight' | 'reps' | null>(null);

    return (
        <AnimatedReanimated.View entering={FadeInDown.duration(200)}>
            <BlurView intensity={28} tint="dark" style={styles.targetCard}>
                <View style={styles.targetCardHeader}>
                    <Text style={styles.targetName}>{target.name}</Text>
                    <TouchableOpacity onPress={() => onRemove(index)}>
                        <Ionicons name="close" size={20} color={AppColors.orange} />
                    </TouchableOpacity>
                </View>

                <View style={styles.targetSpacing} />

                <View style={styles.restSelector}>
                    <Ionicons name="timer-outline" size={18} color={AppColors.orange} />
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

                <View style={styles.tableRow}>
                    <View style={styles.tableColumn}>
                        <TouchableOpacity
                            style={styles.inputTouchableArea}
                            onPress={() => {
                                setNumberPadMode('sets');
                                setNumberPadVisible(true);
                            }}
                        >
                            <View style={styles.valuePill}>
                                <Text style={styles.inputValue}>{target.sets}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tableColumn}>
                        <TouchableOpacity
                            style={styles.inputTouchableArea}
                            onPress={() => {
                                setNumberPadMode('weight');
                                setNumberPadVisible(true);
                            }}
                        >
                            <View style={styles.valuePill}>
                                <Text style={styles.inputValue}>{target.targetWeightKg.toFixed(0)} kg</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tableColumn}>
                        <TouchableOpacity
                            style={styles.inputTouchableArea}
                            onPress={() => {
                                setNumberPadMode('reps');
                                setNumberPadVisible(true);
                            }}
                        >
                            <View style={styles.valuePill}>
                                <Text style={styles.inputValue}>{target.targetReps}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <RestPickerSheet
                    visible={restPickerVisible}
                    initial={target.restSeconds}
                    onSelect={(seconds: number) => {
                        onTargetChange(index, 'restSeconds', seconds);
                        setRestPickerVisible(false);
                    }}
                    onClose={() => setRestPickerVisible(false)}
                />

                <NumberPadModal
                    visible={numberPadVisible}
                    mode={numberPadMode}
                    onSelect={(value: number) => {
                        if (numberPadMode === 'sets') {
                            onTargetChange(index, 'sets', Math.max(1, Math.min(999, value)));
                        } else if (numberPadMode === 'weight') {
                            onTargetChange(index, 'targetWeightKg', Math.max(0, value));
                        } else if (numberPadMode === 'reps') {
                            onTargetChange(index, 'targetReps', Math.max(1, Math.min(999, value)));
                        }
                        setNumberPadMode(null);
                    }}
                    onClose={() => {
                        setNumberPadVisible(false);
                        setNumberPadMode(null);
                    }}
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
            <TouchableOpacity
                style={styles.sheetBackdrop}
                activeOpacity={1}
                onPress={onClose}
            >
                <BlurView intensity={25} tint="dark" style={styles.filterSheet}>
                    <View style={styles.sheetHandle}/>
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
                                        <Ionicons name="checkmark" size={20} color={AppColors.orange}/>
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
                setInputValue(text); // Only allow numeric input + decimal for weight
            }
        } else {
            if (/^\d*$/.test(text)) {
                setInputValue(text); // Only allow whole numbers for sets/reps
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090909',
    },

    animatedScreen: {
        flex: 1,
    },

    scrollView: {
        flex: 1,
    },


    scrollContent: {
        paddingBottom: 20,
        paddingTop: 20
    },

    topSpacing: {
        height: 20,
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

    targetSpacing: {
        height: 10,
    },

    section: {
        paddingHorizontal: 12,
        marginTop: 8,
    },

    titleGlass: {
        minHeight: 56,
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },

    routineTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },

    routineTitleInput: {
        fontSize: 16,
        fontWeight: '400',
        color: AppColors.orange,
        paddingVertical: 8,
    },

    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
        width: '100%'
    },

    glassButtonBase: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },

    addExerciseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 18,
    },

    addExerciseButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },

    targetCard: {
        borderRadius: 22,
        padding: 14,
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
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
        flex: 1,
        marginRight: 12,
    },

    restSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        justifyContent: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,120,37,0.12)',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,120,37,0.24)',
    },

    restSelectorButton: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        flex: 0,
    },

    restSelectorText: {
        fontSize: 14,
        color: AppColors.orange,
        fontWeight: '600',
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
        color: 'rgba(255,255,255,0.65)',
        textAlign: 'center',
    },

    inputTouchableArea: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },

    valuePill: {
        minWidth: 78,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    valuePillInput: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        textAlign: 'center',
        color: AppColors.white,
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 16,
    },
    inputValue: {
        fontSize: 15,
        color: AppColors.white,
        textAlign: 'center',
        fontWeight: '600',
    },


    sheetBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
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

    numberPadBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.52)',
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
        width: '100%',
    },

    numberPadTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        flex: 1,
    },

    numberPadDisplay: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        paddingVertical: 16,
        marginBottom: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        display: 'none',
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

    numberPadGhostButton: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
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
        borderWidth: 1,
        borderColor: AppColors.orange,
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
    }
});