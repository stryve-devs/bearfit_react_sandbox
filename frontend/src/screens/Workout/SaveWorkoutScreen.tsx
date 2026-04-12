import React, { useState, useEffect, useCallback } from 'react';
import Toast from '../../components/workout/Toast';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Pressable,
    Share,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColors } from '../../constants/colors';
import { SavedWorkout, ExerciseLog } from '../../types/workout.types';
import AlertDialog from '../../components/workout/AlertDialog';

export default function SaveWorkoutScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState<'private' | 'public' | 'friends'>('private');
    const [loading, setLoading] = useState(false);
    const [workoutData, setWorkoutData] = useState<any>(null);
    const [isFirstWorkout, setIsFirstWorkout] = useState(false);
    const [discardAlertVisible, setDiscardAlertVisible] = useState(false);
    const handleToastClose = useCallback(() => {
        setToastVisible(false);
    }, []);
    useEffect(() => {
        const checkFirstWorkout = async () => {
            try {
                const saved = await AsyncStorage.getItem('savedWorkouts');
                setIsFirstWorkout(!saved || JSON.parse(saved).length === 0);
            } catch (error) {
                console.error('Error checking workouts:', error);
            }
        };

        checkFirstWorkout();
    }, []); // Empty dependency array - runs only once

    // ✅ Parse workout data from params - only when params change
    useEffect(() => {
        if (params?.workoutData) {
            const data = JSON.parse(params.workoutData as string);
            setWorkoutData(data);
        }
    }, [params?.workoutData]); // Only depends on params

    const handleSave = async () => {
        if (!title.trim()) {
            setToastMessage('Please enter a workout title');
            setToastVisible(true);
            return;
        }

        setLoading(true);
        try {
            const newWorkout: SavedWorkout = {
                id: Date.now().toString(),
                title,
                duration: workoutData.elapsed,
                volume: workoutData.totalVolume,
                sets: workoutData.totalSets,
                exercises: workoutData.exercises,
                description,
                timestamp: new Date().toISOString(),
                visibility,
            };

            const saved = await AsyncStorage.getItem('savedWorkouts');
            const workouts = saved ? JSON.parse(saved) : [];
            workouts.push(newWorkout);

            await AsyncStorage.setItem('savedWorkouts', JSON.stringify(workouts));

            // Navigate to share screen
            requestAnimationFrame(() => {
                router.push({
                    pathname: '/(tabs)/Workout/share',
                    params: {
                        workoutData: JSON.stringify(newWorkout),
                        isFirst: isFirstWorkout,
                    },
                });
            });
        } catch (error) {
            console.error('Error saving workout:', error);
            setToastMessage('Failed to save workout');
            setToastVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDiscardConfirm = () => {
        setDiscardAlertVisible(false);
        setTimeout(() => {
            setDiscardAlertVisible(false);

            requestAnimationFrame(() => {
                router.push('/(tabs)/Workout');
            });
        }, 50);
    };

    const toggleVisibility = () => {
        const visibilityOrder: ('private' | 'public' | 'friends')[] = ['private', 'public', 'friends'];
        const currentIndex = visibilityOrder.indexOf(visibility);
        const nextIndex = (currentIndex + 1) % visibilityOrder.length;
        setVisibility(visibilityOrder[nextIndex]);
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const paddedSeconds = secs.toString().padStart(2, '0');

        if (hours > 0) {
            return `${hours}h ${minutes}m ${paddedSeconds}s`;
        }
        return `${minutes}m ${paddedSeconds}s`;
    };

    const formatDate = () => {
        const date = new Date();
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
        });
    };

    if (!workoutData) {
        return (
            <SafeAreaView style={styles.container} edges={['left', 'right']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={AppColors.orange} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Workout Title */}
                <View style={styles.section}>
                    <Text style={styles.label}>Workout title</Text>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Name this Workout!"
                        placeholderTextColor={AppColors.grey}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Duration</Text>
                        <Text style={styles.statValue}>{formatTime(workoutData?.elapsed || 0)}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Volume</Text>
                        <Text style={styles.statValue}>{workoutData?.totalVolume || 0} kg</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Sets</Text>
                        <Text style={styles.statValue}>{workoutData?.totalSets || 0}</Text>
                    </View>
                </View>

                {/* Date/Time */}
                <View style={styles.section}>
                    <Text style={styles.label}>When</Text>
                    <Text style={styles.dateText}>{formatDate()}</Text>
                </View>

                {/* Photo Section */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.photoBox}>
                        <Ionicons name="image-outline" size={32} color={AppColors.orange} />
                        <Text style={styles.photoText}>Add a photo / video</Text>
                    </TouchableOpacity>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.descriptionInput}
                        placeholder="How did your workout go? Leave some notes here..."
                        placeholderTextColor={AppColors.grey}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Visibility */}
                <View style={styles.section}>
                    <View style={styles.visibilityHeader}>
                        <Text style={styles.label}>Visibility</Text>
                        <TouchableOpacity onPress={toggleVisibility}>
                            <Text style={styles.visibilityValue}>
                                {visibility.charAt(0).toUpperCase() + visibility.slice(1)} >
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Discard Button */}
                <TouchableOpacity
                    style={styles.discardButton}
                    onPress={() => setDiscardAlertVisible(true)}
                >
                    <Text style={styles.actionButtonText}>Discard Workout</Text>
                </TouchableOpacity>

                <View style={styles.extraSpacing} />
            </ScrollView>

            <Toast
                visible={toastVisible}
                message={toastMessage}
                onClose={handleToastClose}
            />

            {/* Save Button */}
            <View style={styles.saveButtonContainer}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={AppColors.black} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Discard Confirmation Alert */}
            <AlertDialog
                visible={discardAlertVisible}
                title="Discard Workout?"
                message="Are you sure you want to discard this workout?"
                buttons={[
                    {
                        text: 'Cancel',
                        onPress: () => setDiscardAlertVisible(false),
                        style: 'default',
                    },
                    {
                        text: 'Discard',
                        onPress: handleDiscardConfirm,
                        style: 'destructive',
                    },
                ]}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090909',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 120,
    },
    section: {
        marginBottom: 28,
    },
    label: {
        fontSize: 14,
        color: AppColors.grey,
        marginBottom: 8,
        fontWeight: '500',
    },
    titleInput: {
        fontSize: 18,
        color: AppColors.white,
        borderBottomWidth: 1,
        borderBottomColor: AppColors.inputBg,
        paddingBottom: 8,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: AppColors.inputBg,
        borderBottomWidth: 1,
        borderBottomColor: AppColors.inputBg,
        marginBottom: 28,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: AppColors.grey,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
    statDivider: {
        width: 1,
        backgroundColor: AppColors.inputBg,
    },
    dateText: {
        fontSize: 16,
        color: AppColors.orange,
        fontWeight: '700',
    },
    photoBox: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: AppColors.inputBg,
        borderRadius: 12,
        paddingVertical: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoText: {
        fontSize: 16,
        color: AppColors.white,
        marginTop: 12,
    },
    descriptionInput: {
        fontSize: 14,
        color: AppColors.white,
        borderWidth: 1,
        borderColor: AppColors.inputBg,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    visibilityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    visibilityValue: {
        fontSize: 14,
        color: AppColors.orange,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: AppColors.inputBg,
        marginVertical: 24,
    },
    discardText: {
        fontSize: 16,
        color: '#FF6B6B',
        textAlign: 'center',
        marginBottom: 24,
        fontWeight: '600',
    },
    extraSpacing: {
        height: 40,
    },
    saveButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
    },
    saveButton: {
        backgroundColor: AppColors.orange,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: AppColors.black,
        fontSize: 16,
        fontWeight: '700',
    },
    discardButton: {
        flex: 1,
        height: 55,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    actionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.orange,
    },
});