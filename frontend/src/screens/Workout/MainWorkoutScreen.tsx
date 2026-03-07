import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AppColors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function MainWorkoutScreen() {
    const router = useRouter();
    const [navIndex, setNavIndex] = useState(1); // Workout active

    const handleNavTap = (index: number) => {
        setNavIndex(index);
        if (index === 0) {
            router.push('/(tabs)');
        } else if (index === 1) {
            // Stay on Workout
        } else if (index === 2) {
            router.push('/(tabs)/profile');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {/* Quick Start Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Start</Text>
                    <View style={styles.spacing} />

                    {/* Add Exercise Button */}
                    <TouchableOpacity
                        style={styles.addExerciseButton}
                        onPress={() => router.push('/(tabs)/Workout/log')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={20} color={AppColors.white} />
                        <Text style={styles.addExerciseText}>Add Exercise</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.mediumSpacing} />

                {/* Routines Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Routines</Text>
                    <View style={styles.spacing} />

                    {/* Two Cards Row */}
                    <View style={styles.cardsRow}>
                        {/* New Routine Card */}
                        <TouchableOpacity
                            style={[styles.card, styles.cardFlex]}
                            onPress={() => router.push('/(tabs)/Workout/routine')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cardLabel}>New Routine</Text>
                            <View style={styles.cardGap} />
                            <Ionicons name="sparkles" size={20} color={AppColors.white} />
                        </TouchableOpacity>

                        <View style={styles.cardGapHorizontal} />

                        {/* Explore Routines Card */}
                        <TouchableOpacity
                            style={[styles.card, styles.cardFlex]}
                            onPress={() => router.push('/(tabs)/Workout/explore')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cardLabel}>Explore Routines</Text>
                            <View style={styles.cardGap} />
                            <Ionicons name="compass" size={20} color={AppColors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.largeSpacing} />
            </ScrollView>
        </View>
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
        paddingBottom: 20,
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
    section: {
        paddingHorizontal: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '400',
        color: AppColors.orange,
        marginTop: 20,
        marginBottom: 0,
    },
    spacing: {
        height: 22,
    },
    mediumSpacing: {
        height: 22,
    },
    largeSpacing: {
        height: 40,
    },
    addExerciseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: AppColors.darkBg,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    addExerciseText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        fontFamily: 'Quicksand',
    },
    cardsRow: {
        flexDirection: 'row',
        gap: 0,
    },
    cardGapHorizontal: {
        width: 12,
    },
    card: {
        backgroundColor: AppColors.darkBg,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 80,
    },
    cardFlex: {
        flex: 1,
    },
    cardGap: {
        height: 12,
    },
    cardLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        fontFamily: 'Quicksand',
        textAlign: 'center',
    },
});