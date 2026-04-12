import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Animated, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { AppColors } from '../../constants/colors';
import { Exercise } from '../../types/workout.types';
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
        if (routeParams?.fromWorkout === 'true') {
            router.back();
            setTimeout(() => {
                router.setParams({ addExerciseName: exercise.name } as any);
            }, 100);
        } else {
            addTarget({
                name: exercise.name,
                sets: 0,
                targetWeightKg: 0,
                targetReps: 0,
                restSeconds: 0,
            });
            router.back();
        }
    };

    const handleResetFilters = () => {
        setSelectedEquipment(null);
        setSelectedMuscle(null);
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <View style={{ flex: 1 }}>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* SEARCH BAR */}
                    <BlurView intensity={25} tint="dark" style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={AppColors.orange} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search Exercises"
                            placeholderTextColor={AppColors.orange}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </BlurView>

                    {/* FILTER BUTTONS */}
                    <View style={styles.filterRow}>
                        <TouchableOpacity
                            onPress={() => setEquipmentSheetVisible(true)}
                            style={[
                                styles.filterButton,
                                { flex: selectedEquipment || selectedMuscle ? 0.45 : 0.5 },
                            ]}
                        >
                            <BlurView intensity={25} tint="dark" style={styles.filterButtonBlur}>
                                <Text style={styles.filterButtonText}>
                                    {selectedEquipment || 'All Equipment'}
                                </Text>
                            </BlurView>
                        </TouchableOpacity >

                        <TouchableOpacity
                            onPress={() => setMuscleSheetVisible(true)}
                            style={[
                                styles.filterButton,
                                { flex: selectedEquipment || selectedMuscle ? 0.45 : 0.5 },
                            ]}
                        >
                            <BlurView intensity={25} tint="dark" style={styles.filterButtonBlur}>
                                <Text style={styles.filterButtonText}>
                                    {selectedMuscle || 'All Muscles'}
                                </Text>
                            </BlurView>
                        </TouchableOpacity >

                        {(selectedEquipment || selectedMuscle) && (
                            <TouchableOpacity
                                onPress={handleResetFilters}
                                style={[styles.filterButton, { flex: 0.1 }]}
                            >
                                <Ionicons name="close-circle" size={24} color={AppColors.orange} />

                            </TouchableOpacity >
                        )}
                    </View>

                    {/* EXERCISE LIST */}
                    {filteredExercises.map((exercise, index) => (
                        <ExerciseItem
                            key={exercise.name}
                            exercise={exercise}
                            delay={index * 50}
                            onPress={() => handleExerciseSelect(exercise)}
                        />
                    ))}
                </ScrollView>

                {/* FILTER SHEETS */}
                <FilterSheet
                    visible={equipmentSheetVisible}
                    title="Equipment"
                    items={EQUIPMENT_LIST}
                    selected={selectedEquipment || 'All Equipment'}
                    onSelect={(item) => {
                        setSelectedEquipment(item === 'All Equipment' ? null : item);
                        setEquipmentSheetVisible(false);
                    }}
                    onClose={() => setEquipmentSheetVisible(false)}
                />

                <FilterSheet
                    visible={muscleSheetVisible}
                    title="Muscles"
                    items={MUSCLE_LIST}
                    selected={selectedMuscle || 'All Muscles'}
                    onSelect={(item) => {
                        setSelectedMuscle(item === 'All Muscles' ? null : item);
                        setMuscleSheetVisible(false);
                    }}
                    onClose={() => setMuscleSheetVisible(false)}
                />
            </View>
        </SafeAreaView>
    );
}

function ExerciseItem({ exercise, onPress, delay }: any) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <BlurView intensity={25} tint="dark" style={styles.card}>
                <View style={styles.cardLeft}>
                    <Ionicons name="barbell" size={22} color={AppColors.orange} />
                    <View>
                        <Text style={styles.title}>{exercise.name}</Text>
                        <Text style={styles.subtitle}>{exercise.muscle}</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={AppColors.white} />
            </BlurView>
        </TouchableOpacity>
    );
}


function FilterSheet({ visible, title, items, selected, onSelect, onClose }: any) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={onClose}>
                <BlurView intensity={25} tint="dark" style={styles.filterSheet}>
                    <View style={styles.sheetHandle} />
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {items.map((item: string) => (
                            <TouchableOpacity  key={item} onPress={() => onSelect(item)}>
                                <BlurView intensity={15} tint="dark" style={styles.filterOption}>
                                    <Text style={styles.filterOptionText}>{item}</Text>
                                    {item === selected && (
                                        <Ionicons name="checkmark" size={20} color={AppColors.orange} />
                                    )}
                                </BlurView>
                            </TouchableOpacity >
                        ))}
                    </ScrollView>
                </BlurView>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#090909' },
    scrollContent: { paddingTop: 20, paddingBottom: 20, paddingHorizontal: 16 },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 16,
        borderRadius: 22,
        marginBottom: 14,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    searchInput: { flex: 1, color: AppColors.orange, fontSize: 15, fontWeight: '700' },

    filterRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginBottom: 20,
    },

    filterButton: {
        borderRadius: 20,
        overflow: 'hidden',
    },

    filterButtonBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: "hidden",
        borderRadius: 20,
    },

    filterButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: AppColors.orange,
    },

    clearFiltersButton: { width: 40, height: 40,borderRadius: 20, },

    clearButtonBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },

    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 18,
        borderRadius: 22,
        marginBottom: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    title: { fontSize: 15, fontWeight: '600', color: AppColors.white },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.55)' },

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
        backgroundColor: AppColors.darkBg,//'rgba(255,255,255,0.06)',
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
        backgroundColor: AppColors.darkGrey,//'rgba(255,255,255,0.03)',
        overflow: 'hidden',
    },
    filterOptionText: { fontSize: 15, fontWeight: '500', color: AppColors.orange },
}
);