import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../constants/colors';
import { Routine } from '../../types/workout.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExploreRoutinesScreen() {
    const router = useRouter();
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            loadRoutines();
        }, [])
    );

    const loadRoutines = async () => {
        setLoading(true);
        try {
            const savedRoutines = await AsyncStorage.getItem('savedRoutines');
            const routinesArray = savedRoutines ? JSON.parse(savedRoutines) : [];
            setRoutines(routinesArray);
        } catch (error) {
            console.error('Error loading routines:', error);
            setRoutines([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRoutineSelect = (routine: Routine) => {
        router.push({
            pathname: '/(tabs)/Workout/log',
            params: { routine: JSON.stringify(routine) },
        });
    };

    const handleCreateRoutine = () => {
        router.push('/(tabs)/Workout/routine');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={AppColors.orange} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.headerTitle}>Routines</Text>

                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Saved Routines</Text>
                    <View style={styles.spacing} />

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={AppColors.orange} />
                        </View>
                    ) : routines.length === 0 ? (
                        <EmptyState onCreatePress={handleCreateRoutine} />
                    ) : (
                        routines.map((routine, index) => (
                            <RoutineCard
                                key={`${routine.title}-${index}`}
                                routine={routine}
                                onSelect={() => handleRoutineSelect(routine)}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function EmptyState({ onCreatePress }: any) {
    return (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No routines saved yet</Text>
            <View style={styles.emptyStateSpacing} />
            <Text style={styles.emptyStateSubtitle}>
                Create a routine to see it here
            </Text>
            <View style={styles.emptyStateSpacing} />
            <TouchableOpacity
                style={styles.createButton}
                onPress={onCreatePress}
            >
                <Text style={styles.createButtonText}>Create Routine</Text>
            </TouchableOpacity>
        </View>
    );
}

function RoutineCard({ routine, onSelect }: any) {
    return (
        <TouchableOpacity
            style={styles.routineCard}
            onPress={onSelect}
        >
            <View style={styles.routineCardLeft}>
                <Ionicons name="list" size={24} color={AppColors.white} />
                <View style={styles.routineCardText}>
                    <Text style={styles.routineCardTitle}>{routine.title}</Text>
                    <Text style={styles.routineCardSubtitle}>
                        {routine.targets.length} exercise{routine.targets.length !== 1 ? 's' : ''}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={AppColors.white} />
        </TouchableOpacity>
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
        paddingBottom: 20,
    },
    section: {
        paddingHorizontal: 12,
        paddingTop: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
    spacing: { height: 12 },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyState: {
        backgroundColor: AppColors.darkBg,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    emptyStateTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },
    emptyStateSpacing: { height: 8 },
    emptyStateSubtitle: {
        fontSize: 12,
        fontWeight: '400',
        color: AppColors.white,
    },
    createButton: {
        backgroundColor: AppColors.black,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 12,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
    routineCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: AppColors.darkBg,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    routineCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    routineCardText: {
        flex: 1,
    },
    routineCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
    },
    routineCardSubtitle: {
        fontSize: 12,
        fontWeight: '400',
        color: AppColors.white,
    },
});