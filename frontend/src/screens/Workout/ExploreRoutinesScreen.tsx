//explore frontenddddd
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AnimatedReanimated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { AppColors } from '../../constants/colors';
import { Routine } from '../../types/workout.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReanimatedTouchable =
    AnimatedReanimated.createAnimatedComponent(TouchableOpacity);

export default function ExploreRoutinesScreen() {
    const router = useRouter();
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [loading, setLoading] = useState(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateAnim = useRef(new Animated.Value(18)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 420,
                useNativeDriver: true,
            }),
            Animated.timing(translateAnim, {
                toValue: 0,
                duration: 420,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, translateAnim]);

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
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <Animated.View
                style={[
                    styles.animatedScreen,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: translateAnim }],
                    },
                ]}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >


                    <AnimatedReanimated.View entering={FadeInUp.duration(450)}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Saved Routines</Text>
                            <Text style={styles.sectionSubtitle}>
                                Pick a saved plan and start quickly
                            </Text>
                            <View style={styles.mediumSpacing} />

                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <BlurView intensity={26} tint="dark" style={styles.loadingCard}>
                                        <ActivityIndicator size="large" color={AppColors.orange} />
                                        <Text style={styles.loadingText}>Loading routines...</Text>
                                    </BlurView>
                                </View>
                            ) : routines.length === 0 ? (
                                <EmptyState onCreatePress={handleCreateRoutine} />
                            ) : (
                                routines.map((routine, index) => (
                                    <RoutineCard
                                        key={`${routine.title}-${index}`}
                                        routine={routine}
                                        onSelect={() => handleRoutineSelect(routine)}
                                        delay={index * 80}
                                    />
                                ))
                            )}
                        </View>
                    </AnimatedReanimated.View>
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}

function EmptyState({ onCreatePress }: { onCreatePress: () => void }) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedReanimated.View entering={FadeInDown.springify().damping(16)}>
            <BlurView intensity={28} tint="dark" style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                    <Ionicons name="barbell-outline" size={26} color={AppColors.orange} />
                </View>

                <Text style={styles.emptyStateTitle}>No routines saved yet</Text>
                <View style={styles.emptyStateSpacing} />
                <Text style={styles.emptyStateSubtitle}>
                    Create a routine to see it here
                </Text>
                <View style={styles.emptyStateSpacing} />

                <ReanimatedTouchable
                    style={[styles.createButton, animatedStyle]}
                    activeOpacity={0.9}
                    onPressIn={() => {
                        scale.value = withSpring(0.97);
                    }}
                    onPressOut={() => {
                        scale.value = withSpring(1);
                    }}
                    onPress={onCreatePress}
                >
                    <BlurView intensity={18} tint="dark" style={styles.createButtonInner}>
                        <Ionicons name="add" size={18} color={AppColors.orange} />
                        <Text style={styles.createButtonText}>Create Routine</Text>
                    </BlurView>
                </ReanimatedTouchable>
            </BlurView>
        </AnimatedReanimated.View>
    );
}

function RoutineCard({
                         routine,
                         onSelect,
                         delay = 0,
                     }: {
    routine: Routine;
    onSelect: () => void;
    delay?: number;
}) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedReanimated.View
            entering={FadeInDown.delay(delay).springify().damping(16)}
        ><ReanimatedTouchable
                style={animatedStyle}
                activeOpacity={0.9}
                onPressIn={() => {
                    scale.value = withSpring(0.985);
                }}
                onPressOut={() => {
                    scale.value = withSpring(1);
                }}
                onPress={onSelect}
            >
                <BlurView intensity={28} tint="dark" style={styles.routineCard}>
                    <View style={styles.routineCardLeft}>
                        <View style={styles.routineIconWrap}>
                            <Ionicons name="star" size={20} color={AppColors.orange} />
                        </View>

                        <View style={styles.routineCardText}>
                            <Text style={styles.routineCardTitle}>{routine.title}</Text>
                            <Text style={styles.routineCardSubtitle}>
                                {routine.targets.length} exercise
                                {routine.targets.length !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.chevronWrap}>
                        <Ionicons name="chevron-forward" size={18} color={AppColors.white} />
                    </View>
                </BlurView>
            </ReanimatedTouchable>
        </AnimatedReanimated.View>
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
        paddingTop: 20,  // updated to match main screen
        paddingBottom: 20,  // updated to match main screen
    },

    section: {
        paddingHorizontal: 14,  // updated to match main screen
        marginTop: 8,
    },

    sectionTitle: {
        fontSize: 16,  // updated from 22
        fontWeight: '700',
        color: AppColors.orange,
        marginBottom: 4,
    },

    sectionSubtitle: {
        fontSize: 14,  // updated from 13 and fontWeight changed to normal for matching main screen
        fontWeight: '400',
        color: 'rgba(255,255,255,0.55)',  // updated alpha to match main screen
        marginTop: 4,  // added to match main screen subtitle spacing
    },

    topSpacing: {
        height: 10,
    },

    spacing: {
        height: 12,
    },

    mediumSpacing: {
        height: 18,
    },

    largeSpacing: {
        height: 14,  // changed from 40 to 14 to match main screen largeSpacing
    },

    loadingContainer: {
        paddingVertical: 10,
    },

    loadingCard: {
        minHeight: 140,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },

    loadingText: {
        color: AppColors.white,
        fontSize: 14,
        marginTop: 14,
        opacity: 0.8,
    },

    emptyState: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderRadius: 24,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },

    emptyIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,120,37,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,120,37,0.25)',
        marginBottom: 14,
    },

    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.white,
        textAlign: 'center',
    },

    emptyStateSpacing: {
        height: 8,
    },

    emptyStateSubtitle: {
        fontSize: 14,  // updated font size here to match main screen subtitle size
        fontWeight: '400',
        color: 'rgba(255,255,255,0.55)',  // updated alpha
        textAlign: 'center',
    },

    createButton: {
        marginTop: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },

    createButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,120,37,0.12)',
        borderWidth: 1,
        borderRadius:16,
        borderColor: 'rgba(255,120,37,0.28)',
        overflow:'hidden'
    },

    createButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },

    routineCard: {
        width: '100%',  // updated for consistent width like main screen cards
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderRadius: 22,
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },

    routineCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        // Removed marginRight: 10 to prevent shifting
    },

    routineIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,120,37,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,120,37,0.24)',
    },

    routineCardText: {
        flex: 1,
    },

    routineCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.white,
        marginBottom: 3,
    },

    routineCardSubtitle: {
        fontSize: 14,  // updated from 12 to match main screen's subtitle size
        fontWeight: '400',
        color: 'rgba(255,255,255,0.55)',
    },

    chevronWrap: {
        width: 34,
        height: 34,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
});