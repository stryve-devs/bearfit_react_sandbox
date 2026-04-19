import React, { useState, useEffect, useCallback, useRef } from 'react';
import Toast from '../../components/workout/Toast';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Image,
    Modal,
    Animated,
    Dimensions,
    InteractionManager,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { AppColors } from '../../constants/colors';
import AlertDialog from '../../components/workout/AlertDialog';
import { workoutService } from '../../api/services/workout.service';
import {
    SavedWorkout,
    SaveWorkoutPostPayload,
    SelectedWorkoutMediaAsset,
    WorkoutExercisePayload,
} from '../../types/workout.types';

type SelectedMedia = SelectedWorkoutMediaAsset & {
    uploadProgress?: number;
    uploading?: boolean;
    uploadError?: string;
    r2Key?: string;
    url?: string;
    retryCount?: number;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_IOS = Platform.OS === 'ios';
const MEDIA_SHEET_HEIGHT = Math.min(300, SCREEN_HEIGHT * 0.36);
const MAX_VIDEO_DURATION_SECONDS = 20;
const MAX_VIDEO_DURATION_MS = MAX_VIDEO_DURATION_SECONDS * 1000;
const VIDEO_TOO_LONG_MESSAGE = `Video must be ${MAX_VIDEO_DURATION_SECONDS} seconds or less.`;
const PHOTO_CROP_ASPECT: [number, number] = [4, 5];

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
    const [discardAlertVisible, setDiscardAlertVisible] = useState(false);
    const [takeMediaAlertVisible, setTakeMediaAlertVisible] = useState(false);
    const [pendingCaptureMediaTypes, setPendingCaptureMediaTypes] = useState<
        NonNullable<ImagePicker.ImagePickerOptions['mediaTypes']> | null
    >(null);
    const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
    const [mediaSheetVisible, setMediaSheetVisible] = useState(false);
    const [isDraggingMedia, setIsDraggingMedia] = useState(false);
    const isLaunchingCameraRef = useRef(false);
    const cameraLaunchAttemptRef = useRef(0);

    const handleToastClose = useCallback(() => {
        setToastVisible(false);
    }, []);

    // Request permissions on mount
    useEffect(() => {
        const requestPermissions = async () => {
            const imagePickerStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (imagePickerStatus.status !== 'granted') {
                setToastMessage('Gallery and camera permissions are needed');
                setToastVisible(true);
            }
        };

        requestPermissions();
    }, []);

    // Parse workout data from params only when params change.
    useEffect(() => {
        if (params?.workoutData) {
            const data = JSON.parse(params.workoutData as string);
            setWorkoutData(data);
        }
    }, [params?.workoutData]); // Only depends on params

    const mapExercisesToPayload = useCallback((rawExercises: any[]): WorkoutExercisePayload[] => {
        if (!Array.isArray(rawExercises)) return [];

        return rawExercises
            .filter((exercise) => exercise?.name && Array.isArray(exercise?.sets))
            .map((exercise) => ({
                name: String(exercise.name),
                externalId: typeof exercise.externalId === 'string' ? exercise.externalId : null,
                sets: exercise.sets.map((setItem: any, index: number) => ({
                    setNumber: index + 1,
                    weightKg: typeof setItem?.weightKg === 'number' ? setItem.weightKg : 0,
                    reps: typeof setItem?.reps === 'number' ? setItem.reps : 0,
                    isCompleted: Boolean(setItem?.done),
                })),
            }));
    }, []);

    const handleSave = async () => {
        if (!title.trim()) {
            setToastMessage('Please enter a workout title');
            setToastVisible(true);
            return;
        }

        if (!workoutData) {
            setToastMessage('Workout data is missing. Please go back and try again.');
            setToastVisible(true);
            return;
        }

        const uploadingCount = selectedMedia.filter((m) => m.uploading).length;
        const failedCount = selectedMedia.filter((m) => m.uploadError).length;

        if (uploadingCount > 0) {
            setToastMessage(`Please wait - ${uploadingCount} media still uploading`);
            setToastVisible(true);
            return;
        }

        if (failedCount > 0) {
            setToastMessage(`${failedCount} media upload(s) failed. Tap "Retry" or delete them before saving.`);
            setToastVisible(true);
            return;
        }

        const uploadedMedia = selectedMedia.filter((m) => !m.uploading && !m.uploadError && m.url && m.r2Key);

        setLoading(true);
        try {
            const media = uploadedMedia.map((m, idx) => ({
                url: m.url!,
                type: (m.type === 'video' ? 'VIDEO' : 'IMAGE') as const,
                order: idx,
            }));

            const payload: SaveWorkoutPostPayload = {
                title: title.trim(),
                description: description.trim(),
                visibility,
                durationSeconds: Number(workoutData.elapsed || 0),
                totalVolume: Number(workoutData.totalVolume || 0),
                totalSets: Number(workoutData.totalSets || 0),
                createdAt: new Date().toISOString(),
                exercises: mapExercisesToPayload(workoutData.exercises || []),
                media,
            };

            const response = await workoutService.saveWorkoutPost(payload);

            const newWorkout: SavedWorkout = {
                id: String(response.postId),
                title: payload.title,
                duration: payload.durationSeconds,
                volume: payload.totalVolume,
                sets: payload.totalSets,
                exercises: workoutData.exercises,
                description: payload.description || '',
                timestamp: response.createdAt,
                visibility,
                media: selectedMedia,
            };

            // Navigate to share screen
            requestAnimationFrame(() => {
                router.push({
                    pathname: '/(tabs)/Workout/share',
                    params: {
                        workoutData: JSON.stringify(newWorkout),
                        isFirst: response.isFirstWorkout ? 'true' : 'false',
                    },
                });
            });
        } catch (error: any) {
            console.error('Error saving workout:', error);
            const apiMessage = error?.response?.data?.message;
            setToastMessage(apiMessage || 'Failed to save workout');
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

    const openMediaOptions = () => {
        setMediaSheetVisible(true);
    };

    const closeMediaOptions = useCallback(() => {
        setMediaSheetVisible(false);
    }, []);

    const getMediaType = useCallback((asset: ImagePicker.ImagePickerAsset) => {
        return asset.type === 'video' ? 'video' : 'photo';
    }, []);

    const addCapturedMedia = useCallback((asset: ImagePicker.ImagePickerAsset) => {
        const mediaType = getMediaType(asset);
        const durationMs = typeof asset.duration === 'number' && !Number.isNaN(asset.duration) ? asset.duration : undefined;
        const mediaId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const newMedia: SelectedMedia = {
            id: mediaId,
            uri: asset.uri,
            type: mediaType,
            durationMs,
            uploading: true,
            uploadProgress: 0,
        };

        setSelectedMedia((prev) => [...prev, newMedia]);
        setToastMessage(`${mediaType === 'video' ? 'Video' : 'Photo'} uploading...`);
        setToastVisible(true);

        // Immediately upload in background
        uploadMediaToR2(newMedia);
    }, [getMediaType]);

    const uploadMediaToR2 = useCallback(async (media: SelectedMedia) => {
        const MAX_RETRIES = 2;
        const UPLOAD_TIMEOUT_MS = 60000; // 60 seconds

        const attemptUpload = async (retryAttempt: number = 0) => {
            try {
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Upload timeout - request took too long')), UPLOAD_TIMEOUT_MS)
                );

                const uploadPromise = workoutService.uploadSingleWorkoutMedia(media, (progress: number) => {
                    setSelectedMedia((prev) =>
                        prev.map((m) =>
                            m.id === media.id
                                ? { ...m, uploadProgress: progress }
                                : m
                        )
                    );
                });

                const uploadedData = await Promise.race([uploadPromise, timeoutPromise]);

                setSelectedMedia((prev) =>
                    prev.map((m) =>
                        m.id === media.id
                            ? {
                                ...m,
                                uploading: false,
                                uploadProgress: 100,
                                url: (uploadedData as any).url,
                                r2Key: (uploadedData as any).key,
                                uploadError: undefined,
                                retryCount: 0,
                            }
                            : m
                    )
                );

                setToastMessage(`${media.type === 'video' ? 'Video' : 'Photo'} uploaded successfully`);
                setToastVisible(true);
            } catch (error: any) {
                const errorMsg = error?.message || 'Unknown upload error';
                const retryable = retryAttempt < MAX_RETRIES;

                console.error(`Upload attempt ${retryAttempt + 1} failed for media ${media.id}:`, errorMsg);

                if (retryable) {
                    // Auto-retry after 2 seconds
                    setToastMessage(`Upload failed, retrying... (attempt ${retryAttempt + 2}/${MAX_RETRIES + 1})`);
                    setToastVisible(true);

                    setTimeout(() => {
                        attemptUpload(retryAttempt + 1);
                    }, 2000);
                } else {
                    // Final failure
                    setSelectedMedia((prev) =>
                        prev.map((m) =>
                            m.id === media.id
                                ? {
                                    ...m,
                                    uploading: false,
                                    uploadError: errorMsg,
                                    retryCount: retryAttempt,
                                }
                                : m
                        )
                    );

                    setToastMessage(`Upload failed after ${MAX_RETRIES + 1} attempts: ${errorMsg}`);
                    setToastVisible(true);
                }
            }
        };

        await attemptUpload(0);
    }, []);

    const validateSelectedVideo = useCallback((asset: ImagePicker.ImagePickerAsset) => {
        const durationMs = typeof asset.duration === 'number' ? asset.duration : 0;
        if (!durationMs || durationMs > MAX_VIDEO_DURATION_MS) {
            setToastMessage(VIDEO_TOO_LONG_MESSAGE);
            setToastVisible(true);
            return false;
        }

        return true;
    }, []);

    const handleMediaAsset = useCallback((asset: ImagePicker.ImagePickerAsset) => {
        if (asset.type === 'video' && !validateSelectedVideo(asset)) {
            return;
        }

        addCapturedMedia(asset);
    }, [addCapturedMedia, validateSelectedVideo]);

    const captureWithCamera = useCallback(async (
        mediaTypes: NonNullable<ImagePicker.ImagePickerOptions['mediaTypes']>,
        launchAttempt: number,
    ) => {
        try {
            const permissionStatus = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionStatus.status !== 'granted') {
                setToastMessage('Camera permission denied');
                setToastVisible(true);
                return;
            }

            const isPhotoOnly = mediaTypes.length === 1 && mediaTypes[0] === 'images';
            const cameraOptions: ImagePicker.ImagePickerOptions = {
                mediaTypes,
                allowsEditing: isPhotoOnly,
                ...(isPhotoOnly ? { aspect: PHOTO_CROP_ASPECT } : {}),
                quality: 0.8,
            };
            const result = await ImagePicker.launchCameraAsync(cameraOptions);

            if (!result.canceled && result.assets?.length) {
                handleMediaAsset(result.assets[0]);
            }
        } catch (error) {
            console.error(`Camera error on launch attempt ${launchAttempt}:`, error);
            setToastMessage('Failed to open camera');
            setToastVisible(true);
        }
    }, [handleMediaAsset]);

    const flushPendingCameraLaunch = useCallback(() => {
        if (!pendingCaptureMediaTypes || isLaunchingCameraRef.current) {
            return;
        }

        const mediaTypesToLaunch = pendingCaptureMediaTypes;
        setPendingCaptureMediaTypes(null);
        isLaunchingCameraRef.current = true;
        cameraLaunchAttemptRef.current += 1;
        const launchAttempt = cameraLaunchAttemptRef.current;

        // iOS can fail to present camera if another modal just closed; wait until UI settles.
        const launchCamera = () => {
            captureWithCamera(mediaTypesToLaunch, launchAttempt).finally(() => {
                isLaunchingCameraRef.current = false;
            });
        };

        InteractionManager.runAfterInteractions(() => {
            setTimeout(launchCamera, IS_IOS ? 260 : 80);
        });
    }, [captureWithCamera, pendingCaptureMediaTypes]);

    const handleTakeMedia = useCallback(() => {
        setTakeMediaAlertVisible(true);
    }, []);

    const closeTakeMediaModal = useCallback(() => {
        setPendingCaptureMediaTypes(null);
        setTakeMediaAlertVisible(false);
    }, []);

    const handleTakeMediaModalDismiss = useCallback(() => {
        flushPendingCameraLaunch();
    }, [flushPendingCameraLaunch]);

    useEffect(() => {
        // `onDismiss` is iOS-only for Modal; keep Android path functional.
        if (!IS_IOS && !takeMediaAlertVisible) {
            flushPendingCameraLaunch();
        }
    }, [flushPendingCameraLaunch, takeMediaAlertVisible]);

    const handleTakePhotoOption = useCallback(() => {
        if (isLaunchingCameraRef.current) return;

        setPendingCaptureMediaTypes(['images']);
        setTakeMediaAlertVisible(false);
    }, []);

    const handleTakeVideoOption = useCallback(() => {
        if (isLaunchingCameraRef.current) return;

        setPendingCaptureMediaTypes(['videos']);
        setTakeMediaAlertVisible(false);
    }, []);

    const handleUploadMedia = useCallback(async () => {
        try {
            const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (galleryStatus.status !== 'granted') {
                setToastMessage('Gallery permission denied');
                setToastVisible(true);
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos'],
                allowsEditing: true,
                aspect: PHOTO_CROP_ASPECT,
                quality: 0.8,
            });

             if (!result.canceled && result.assets?.length) {
                 handleMediaAsset(result.assets[0]);
             }
        } catch (error) {
            console.error('Gallery picker error:', error);
            setToastMessage('Failed to open gallery');
            setToastVisible(true);
        }
    }, [handleMediaAsset]);

    const removeMedia = useCallback((id: string) => {
        const mediaToRemove = selectedMedia.find((m) => m.id === id);

        // Delete from R2 if it was uploaded
        if (mediaToRemove?.r2Key) {
            workoutService.deleteMediaFromR2(mediaToRemove.r2Key).catch((error: any) => {
                console.error('Error deleting media from R2:', error);
            });
        }

        setSelectedMedia((prev) => prev.filter((m) => m.id !== id));
    }, [selectedMedia]);

    const handleMediaPress = useCallback((media: SelectedMedia) => {
        router.push({
            pathname: '/(tabs)/Workout/mediapreview',
            params: {
                uri: media.uri,
                type: media.type,
            },
        });
    }, [router]);

    const handleOpenTakeMediaFromSheet = useCallback(() => {
        closeMediaOptions();
        setTimeout(() => {
            handleTakeMedia();
        }, 120);
    }, [closeMediaOptions, handleTakeMedia]);

    const handleOpenUploadMediaFromSheet = useCallback(() => {
        closeMediaOptions();
        setTimeout(() => {
            handleUploadMedia();
        }, 120);
    }, [closeMediaOptions, handleUploadMedia]);

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
        });
    };

    const renderMediaTile = useCallback(({ item, drag, isActive }: RenderItemParams<SelectedMedia>) => {
        const isUploading = item.uploading && item.uploadProgress !== undefined;
        const uploadPercent = Math.round((item.uploadProgress || 0) * 100);
        const hasError = !!item.uploadError && !item.uploading;

        const handleRetry = () => {
            setSelectedMedia((prev) =>
                prev.map((m) =>
                    m.id === item.id
                        ? {
                            ...m,
                            uploading: true,
                            uploadProgress: 0,
                            uploadError: undefined,
                            retryCount: (m.retryCount || 0) + 1,
                        }
                        : m
                )
            );
            uploadMediaToR2(item);
        };

        return (
            <View style={[styles.mediaTile, isActive && styles.mediaTileActive, hasError && styles.mediaTileError]}>
                <TouchableOpacity
                    style={styles.mediaThumbTapArea}
                    onPress={() => handleMediaPress(item)}
                    onLongPress={drag}
                    delayLongPress={180}
                    activeOpacity={0.9}
                    disabled={isUploading || hasError}
                >
                    <Image source={{ uri: item.uri }} style={styles.mediaThumb} resizeMode="cover" />
                </TouchableOpacity>

                {item.type === 'video' && (
                    <View style={styles.videoBadge}>
                        <Ionicons name="play" size={12} color={AppColors.white} />
                    </View>
                )}

                {isUploading && (
                    <View style={styles.uploadProgressOverlay}>
                        <View style={styles.progressCircleContainer}>
                            <View
                                style={[
                                    styles.progressCircle,
                                    { borderWidth: 2, borderTopColor: AppColors.orange, borderRightColor: AppColors.orange },
                                ]}
                            />
                            <Text style={styles.uploadPercentText}>{uploadPercent}%</Text>
                        </View>
                    </View>
                )}

                {hasError && (
                    <TouchableOpacity
                        style={styles.uploadErrorOverlay}
                        onPress={handleRetry}
                        activeOpacity={0.8}
                    >
                        <View style={styles.errorContent}>
                            <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
                            <Text style={styles.errorRetryText}>Retry</Text>
                        </View>
                        <View style={styles.errorTooltip}>
                            <Text style={styles.errorTooltipText}>{item.uploadError}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.removeMediaBtn}
                    onPress={() => removeMedia(item.id)}
                    disabled={isUploading}
                >
                    <Ionicons name="close" size={12} color={AppColors.white} />
                </TouchableOpacity>
            </View>
        );
    }, [handleMediaPress, removeMedia, uploadMediaToR2]);

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
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={!isDraggingMedia}
            >
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

                {/* Photo/Video Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Photos / Videos</Text>

                    {selectedMedia.length > 1 && (
                        <Text style={styles.reorderHint}>Long-press and drag to rearrange photos and videos.</Text>
                    )}

                    <DraggableFlatList
                        horizontal
                        data={selectedMedia}
                        keyExtractor={(item) => item.id}
                        onDragBegin={() => setIsDraggingMedia(true)}
                        onDragEnd={({ data }) => {
                            setSelectedMedia(data);
                            setIsDraggingMedia(false);
                        }}
                        onRelease={() => setIsDraggingMedia(false)}
                        activationDistance={12}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.mediaStrip}
                        renderItem={renderMediaTile}
                        ListHeaderComponent={(
                            <TouchableOpacity style={styles.addMediaTile} onPress={openMediaOptions}>
                                <Ionicons name="add" size={22} color={AppColors.orange} />
                                <Text style={styles.addMediaText}>Add photo / video</Text>
                            </TouchableOpacity>
                        )}
                    />
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
                                {visibility.charAt(0).toUpperCase() + visibility.slice(1)} {'>'}</Text>
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

            <MediaSourceSheet
                visible={mediaSheetVisible}
                onClose={closeMediaOptions}
                onUploadMedia={handleOpenUploadMediaFromSheet}
                onTakeMedia={handleOpenTakeMediaFromSheet}
            />

            <Modal
                transparent
                animationType="fade"
                visible={takeMediaAlertVisible}
                statusBarTranslucent
                onRequestClose={closeTakeMediaModal}
                onDismiss={handleTakeMediaModalDismiss}
            >
                <View style={styles.takeMediaModalBackdrop}>
                    <TouchableOpacity
                        style={styles.takeMediaBackdropTapArea}
                        activeOpacity={1}
                        onPress={closeTakeMediaModal}
                    />

                    <View style={styles.takeMediaModalCard}>
                        <Text style={styles.takeMediaTitle}>Take Media</Text>
                        <Text style={styles.takeMediaSubtitle}>Choose what you want to capture</Text>

                        <View style={styles.takeMediaActionRow}>
                            <TouchableOpacity style={styles.takeMediaActionButton} onPress={handleTakePhotoOption}>
                                <View style={styles.takeMediaActionIcon}>
                                    <Ionicons name="camera-outline" size={18} color={AppColors.orange} />
                                </View>
                                <Text style={styles.takeMediaActionText}>Take Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.takeMediaActionButton} onPress={handleTakeVideoOption}>
                                <View style={styles.takeMediaActionIcon}>
                                    <Ionicons name="videocam-outline" size={18} color={AppColors.orange} />
                                </View>
                                <Text style={styles.takeMediaActionText}>Take Video</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.takeMediaCancelButton}
                            onPress={closeTakeMediaModal}
                        >
                            <Text style={styles.takeMediaCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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

function MediaSourceSheet({
    visible,
    onClose,
    onUploadMedia,
    onTakeMedia,
}: {
    visible: boolean;
    onClose: () => void;
    onUploadMedia: () => void;
    onTakeMedia: () => void;
}) {
    const translateY = useRef(new Animated.Value(MEDIA_SHEET_HEIGHT)).current;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!visible) {
            translateY.setValue(MEDIA_SHEET_HEIGHT);
            return;
        }

        Animated.spring(translateY, {
            toValue: 0,
            damping: 24,
            stiffness: 190,
            useNativeDriver: true,
        }).start();
    }, [translateY, visible]);

    const dismiss = useCallback(() => {
        Animated.timing(translateY, {
            toValue: MEDIA_SHEET_HEIGHT,
            duration: 200,
            useNativeDriver: true,
        }).start(() => onClose());
    }, [onClose, translateY]);

    if (!visible) return null;

    return (
        <Modal transparent animationType="none" statusBarTranslucent onRequestClose={dismiss}>
            <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={dismiss} />

            <Animated.View
                style={[
                    styles.sheetContainer,
                    { maxHeight: MEDIA_SHEET_HEIGHT + insets.bottom, transform: [{ translateY }] },
                ]}
            >
                <BlurView
                    intensity={IS_IOS ? 35 : 25}
                    tint="dark"
                    style={[styles.sheetBlur, { paddingBottom: 20 + insets.bottom }]}
                >
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>Add media</Text>

                    <TouchableOpacity style={styles.sheetOption} onPress={onUploadMedia}>
                        <View style={styles.sheetIconCircle}>
                            <Ionicons name="cloud-upload-outline" size={18} color={AppColors.orange} />
                        </View>
                        <Text style={styles.sheetOptionText}>Upload Media</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.sheetOption} onPress={onTakeMedia}>
                        <View style={styles.sheetIconCircle}>
                            <Ionicons name="camera-outline" size={18} color={AppColors.orange} />
                        </View>
                        <Text style={styles.sheetOptionText}>Take Media</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.sheetOption, styles.sheetCancelOption]} onPress={dismiss}>
                        <Text style={styles.sheetCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </BlurView>
            </Animated.View>
        </Modal>
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
    mediaStrip: {
        paddingVertical: 4,
        alignItems: 'center',
        gap: 10,
    },
    addMediaTile: {
        width: 136,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: AppColors.inputBg,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 10,
    },
    addMediaText: {
        fontSize: 12,
        color: AppColors.white,
        marginTop: 6,
        textAlign: 'center',
    },
    mediaTile: {
        width: 100,
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: AppColors.inputBg,
        backgroundColor: '#1a1a1a',
        marginRight: 10,
    },
    mediaTileActive: {
        opacity: 0.78,
        transform: [{ scale: 1.03 }],
    },
    mediaThumbTapArea: {
        flex: 1,
    },
    mediaThumb: {
        width: '100%',
        height: '100%',
    },
    videoBadge: {
        position: 'absolute',
        left: 8,
        bottom: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadProgressOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    progressCircleContainer: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        borderLeftColor: 'rgba(255,255,255,0.2)',
    },
    uploadPercentText: {
        position: 'absolute',
        fontSize: 12,
        fontWeight: '700',
        color: AppColors.orange,
    },
    uploadErrorOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 107, 107, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    errorContent: {
        alignItems: 'center',
        gap: 6,
    },
    errorRetryText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FF6B6B',
    },
    errorTooltip: {
        position: 'absolute',
        bottom: -50,
        left: -40,
        right: -40,
        backgroundColor: 'rgba(0,0,0,0.9)',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        zIndex: 999,
    },
    errorTooltipText: {
        fontSize: 10,
        color: '#FF6B6B',
        textAlign: 'center',
        fontWeight: '600',
    },
    mediaTileError: {
        borderColor: '#FF6B6B',
    },
    removeMediaBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reorderHint: {
        color: AppColors.grey,
        fontSize: 12,
        marginBottom: 10,
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
    takeMediaModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    takeMediaBackdropTapArea: {
        ...StyleSheet.absoluteFillObject,
    },
    takeMediaModalCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#141414',
        padding: 14,
    },
    takeMediaTitle: {
        color: AppColors.orange,
        fontSize: 17,
        fontWeight: '700',
        textAlign: 'center',
    },
    takeMediaSubtitle: {
        color: AppColors.grey,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 12,
    },
    takeMediaActionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    takeMediaActionButton: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    takeMediaActionIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,120,37,0.14)',
        marginBottom: 6,
    },
    takeMediaActionText: {
        color: AppColors.white,
        fontSize: 13,
        fontWeight: '600',
    },
    takeMediaCancelButton: {
        marginTop: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        paddingVertical: 12,
        alignItems: 'center',
    },
    takeMediaCancelText: {
        color: AppColors.grey,
        fontSize: 14,
        fontWeight: '600',
    },
    sheetBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheetContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight: MEDIA_SHEET_HEIGHT,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    sheetBlur: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: 'rgba(15, 15, 15, 0.93)',
    },
    sheetHandle: {
        width: 40,
        height: 5,
        borderRadius: 4,
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
        marginBottom: 10,
    },
    sheetTitle: {
        color: AppColors.orange,
        fontWeight: '700',
        fontSize: 17,
        marginBottom: 12,
        textAlign: 'center',
    },
    sheetOption: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    sheetIconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,120,37,0.16)',
    },
    sheetOptionText: {
        color: AppColors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    sheetCancelOption: {
        justifyContent: 'center',
    },
    sheetCancelText: {
        color: AppColors.grey,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        width: '100%',
    },
});

