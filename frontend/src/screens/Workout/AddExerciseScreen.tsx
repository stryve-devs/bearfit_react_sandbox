import React, { useState, useMemo } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../constants/colors';
import { Exercise, ExerciseTarget } from '../../types/workout.types';
import { useRoutine } from '../../context/RoutineContext';

const SAMPLE_EXERCISES: Exercise[] = [
    { name: 'Bench Press (Barbell)', muscle: 'Chest', equipment: 'Barbell', imageAsset: 'icon' },
    { name: 'Incline Bench (Barbell)', muscle: 'Chest', equipment: 'Barbell', imageAsset: 'icon' },
    { name: 'Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbell', imageAsset: 'icon' },
    { name: 'Lat Pulldown', muscle: 'Back', equipment: 'Machine', imageAsset: 'icon' },
    { name: 'Barbell Row', muscle: 'Back', equipment: 'Barbell', imageAsset: 'icon' },
    { name: 'Bicep Curl', muscle: 'Biceps', equipment: 'Dumbbell', imageAsset: 'icon' },
    { name: 'Tricep Dips', muscle: 'Triceps', equipment: 'No Equipment', imageAsset: 'icon' },
    { name: 'Squats', muscle: 'Quads', equipment: 'Barbell', imageAsset: 'icon' },
    { name: 'Leg Press', muscle: 'Quads', equipment: 'Machine', imageAsset: 'icon' },
    { name: 'Deadlift', muscle: 'Back', equipment: 'Barbell', imageAsset: 'icon' },
];

const MUSCLE_LIST = [
    'All Muscles', 'Abs', 'Abductors', 'Adductors', 'Back', 'Biceps',
    'Calves', 'Cardio', 'Chest', 'Forearms', 'Full Body', 'Glutes',
    'Hamstrings', 'Lats', 'Lower Back', 'Neck', 'Quads', 'Shoulders',
    'Traps', 'Triceps', 'Upper Back'
];

const EQUIPMENT_LIST = [
    'All Equipment', 'No Equipment', 'Barbell', 'Dumbbell', 'Kettlebell',
    'Machine', 'Plate', 'Resistance Band', 'Suspension Band'
];

export default function AddExerciseScreen() {
    const router = useRouter();
    const routeParams = useLocalSearchParams();
    const { addTarget } = useRoutine();
    const [searchText, setSearchText] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
    const [equipmentSheetVisible, setEquipmentSheetVisible] = useState(false);
    const [muscleSheetVisible, setMuscleSheetVisible] = useState(false);

    // Check if we're coming from workout logging
    const isFromWorkout = routeParams?.fromWorkout === 'true';

    const hasActiveFilters = (selectedEquipment && selectedEquipment !== 'All Equipment') ||
        (selectedMuscle && selectedMuscle !== 'All Muscles');

    const filteredExercises = useMemo(() => {
        const query = searchText.toLowerCase();
        return SAMPLE_EXERCISES.filter((ex) => {
            const eqMatch = !selectedEquipment || selectedEquipment === 'All Equipment' || ex.equipment === selectedEquipment;
            const mMatch = !selectedMuscle || selectedMuscle === 'All Muscles' || ex.muscle === selectedMuscle;
            const sMatch = !query || ex.name.toLowerCase().includes(query);
            return eqMatch && mMatch && sMatch;
        });
    }, [searchText, selectedEquipment, selectedMuscle]);

    const handleExerciseSelect = (exercise: Exercise) => {
        if (isFromWorkout) {
            router.back();
            setTimeout(() => {
                router.setParams({ addExerciseName: exercise.name } as any);
            }, 100);
        } else {
            const newTarget: ExerciseTarget = {
                name: exercise.name,
                sets: 0,
                targetWeightKg: 0,
                targetReps: 0,
                restSeconds: 60,
            };
            addTarget(newTarget);
            router.back();
        }
    };

    const handleResetFilters = () => {
        setSelectedEquipment(null);
        setSelectedMuscle(null);
    };

    const handleEquipmentSelect = (equipment: string) => {
        setSelectedEquipment(equipment === 'All Equipment' ? null : equipment);
        setEquipmentSheetVisible(false);
    };

    const handleMuscleSelect = (muscle: string) => {
        setSelectedMuscle(muscle === 'All Muscles' ? null : muscle);
        setMuscleSheetVisible(false);
    };
/*
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={AppColors.orange} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.headerTitle}>Workout</Text>

                <View style={styles.headerRight} />
            </View>
*/
    return (
        <SafeAreaView style={styles.container} edges={['bottom','left','right']}>
            <View style={styles.spacing} />
        <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.spacing} />

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={AppColors.orange} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Exercises"
                        placeholderTextColor={AppColors.orange}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                <View style={styles.spacing} />

                {/* Filter Buttons */}
                <View style={styles.filterRow}>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setEquipmentSheetVisible(true)}
                    >
                        <Text style={styles.filterButtonText}>
                            {selectedEquipment || 'All Equipment'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setMuscleSheetVisible(true)}
                    >
                        <Text style={styles.filterButtonText}>
                            {selectedMuscle || 'All Muscles'}
                        </Text>
                    </TouchableOpacity>

                    {hasActiveFilters && (
                        <TouchableOpacity
                            style={styles.clearFiltersButton}
                            onPress={handleResetFilters}
                        >
                            <Ionicons name="close-circle" size={17} color={AppColors.orange} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.spacing} />

                {/* Popular Exercises Label */}
                <Text style={styles.popularLabel}>Popular Exercises</Text>

                <View style={styles.spacing} />

                {/* Exercises List */}
                {filteredExercises.length > 0 ? (
                    filteredExercises.map((exercise) => (
                        <ExerciseListItem
                            key={exercise.name}
                            exercise={exercise}
                            onSelect={() => handleExerciseSelect(exercise)}
                        />
                    ))
                ) : (
                    <Text style={styles.noResultsText}>No exercises found</Text>
                )}

                <View style={styles.largeSpacing} />
            </ScrollView>

            {/* Equipment Filter Sheet */}
            <FilterSheet
                visible={equipmentSheetVisible}
                title="Equipment"
                items={EQUIPMENT_LIST}
                selected={selectedEquipment || 'All Equipment'}
                onSelect={handleEquipmentSelect}
                onClose={() => setEquipmentSheetVisible(false)}
            />

            {/* Muscle Filter Sheet */}
            <FilterSheet
                visible={muscleSheetVisible}
                title="Muscles"
                items={MUSCLE_LIST}
                selected={selectedMuscle || 'All Muscles'}
                onSelect={handleMuscleSelect}
                onClose={() => setMuscleSheetVisible(false)}
            />
        </SafeAreaView>
    );
}

function ExerciseListItem({ exercise, onSelect }: any) {
    return (
        <TouchableOpacity
            style={styles.exerciseItem}
            onPress={onSelect}
        >
            <View style={styles.exerciseItemLeft}>
                <Ionicons name="barbell" size={24} color={AppColors.white} />
                <View style={styles.exerciseItemText}>
                    <Text style={styles.exerciseItemTitle}>{exercise.name}</Text>
                    <Text style={styles.exerciseItemSubtitle}>{exercise.muscle}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={AppColors.white} />
        </TouchableOpacity>
    );
}

function FilterSheet({ visible, title, items, selected, onSelect, onClose }: any) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity
                style={styles.sheetBackdrop}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    style={styles.filterSheet}
                    activeOpacity={1}
                    onPress={() => {}}
                >
                    <View style={styles.sheetHandle} />

                    <ScrollView
                        style={styles.filterOptions}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={true}
                    >
                        {items.map((item: string) => (
                            <TouchableOpacity
                                key={item}
                                style={styles.filterOption}
                                onPress={() => onSelect(item)}
                            >
                                <Text style={styles.filterOptionText}>{item}</Text>
                                {item === selected && (
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

    finishButton: {
        backgroundColor: AppColors.black,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },

    finishButtonText: {
        color: AppColors.orange,
        fontWeight: '700',
        fontSize: 14,
    },

    saveButton: {
        backgroundColor: AppColors.black,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },

    saveButtonText: {
        color: AppColors.orange,
        fontWeight: '700',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 12,
        paddingBottom: 20,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: AppColors.darkBg,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    filterButton: {
        flex: 1,
        backgroundColor: AppColors.darkBg,
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderRadius: 12,
    },
    filterButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
        textAlign: 'center',
    },
    clearFiltersButton: {
        width: 17,
        height: 17,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popularLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
    noResultsText: {
        fontSize: 14,
        color: AppColors.grey,
        textAlign: 'center',
        marginTop: 20,
    },
    exerciseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: AppColors.darkBg,
        paddingHorizontal: 24,
        paddingVertical: 7,
        borderRadius: 12,
        marginBottom: 12,
        minHeight: 59,
    },
    exerciseItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    exerciseItemText: {
        flex: 1,
    },
    exerciseItemTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        marginBottom: 6,
    },
    exerciseItemSubtitle: {
        fontSize: 12,
        fontWeight: '400',
        color: AppColors.white,
    },
    sheetBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    filterSheet: {
        backgroundColor: AppColors.darkBg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1.5,
        //borderColor: AppColors.orange,
        borderBottomWidth: 0,
        paddingHorizontal: 12,
        paddingVertical: 16,
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
    filterOptions: {
        maxHeight: 400,
        scrollEnabled: true,
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: AppColors.darkGrey,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 12,
    },
    filterOptionText: {
        fontSize: 16,
        fontWeight: '400',
        color: AppColors.orange,
        textAlign: 'left',
    },
});