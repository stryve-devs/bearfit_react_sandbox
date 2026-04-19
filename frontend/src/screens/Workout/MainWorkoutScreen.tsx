import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { AppColors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function MainWorkoutScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/Workout/test/viewdemo')}
                    style={styles.headerActionButton}
                    activeOpacity={0.75}
                >
                    <Ionicons name="barbell" size={20} color={AppColors.orange} style={styles.headerActionIcon} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, router]);

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {/* Quick Start Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Start</Text>
                    <View style={styles.mediumSpacing} />

                    {/* Add Exercise Button */}
                    <TouchableOpacity
                        style={styles.addExerciseButton}
                        onPress={() => router.push('/(tabs)/Workout/log')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={20} color={AppColors.white} />
                        <Text style={styles.addExerciseText}>Start Empty Workout</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.mediumSpacing} />

                {/* Routines Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Routines</Text>
                    <View style={styles.mediumSpacing} />

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

                <View style={styles.mediumSpacing} />

                {/* Placeholder Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Workouts</Text>
                    <View style={styles.mediumSpacing} />

                    <View style={styles.placeholderCard}>
                        <Text style={styles.placeholderTitle}>No recent workouts yet.</Text>
                        <Text style={styles.placeholderSubtitle}>Start one now to see your history and progress here.</Text>
                    </View>
                </View>

                <View style={styles.largeSpacing} />
            </ScrollView>
        </SafeAreaView>
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
    headerActionButton: {
        marginRight: 12,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: AppColors.black,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerActionIcon: {
        transform: [{ rotate: '-30deg' }],
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
        height: 12,
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
    placeholderCard: {
        backgroundColor: AppColors.darkBg,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
    },
    placeholderTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: AppColors.white,
    },
    placeholderSubtitle: {
        fontSize: 13,
        color: AppColors.grey,
        lineHeight: 18,
    },
});
