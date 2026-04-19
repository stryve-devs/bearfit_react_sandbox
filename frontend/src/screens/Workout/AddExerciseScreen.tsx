import React, { useState, useMemo, useRef, useCallback, useLayoutEffect, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    FlatList,
    Platform,
    Dimensions,
    PanResponder,
    Animated,
    StatusBar,
    ScrollView,
    GestureResponderEvent,
    PanResponderGestureState,
    ListRenderItemInfo,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { AppColors } from '../../constants/colors';
import { Exercise } from '../../types/workout.types';
import { useRoutine } from '../../context/RoutineContext';

type LocalExerciseRecord = {
    id?: string;
    name: string;
    target?: string;
    body_part?: string;
    equipment?: string;
    image?: string;
    gif_url?: string;
};

type ScreenExercise = Exercise & {
    listKey: string;
    exerciseId?: string;
    imagePath?: string;
};

const localExerciseRecords = require('../../constants/exercise-data.json') as LocalExerciseRecord[];

const EXERCISE_ASSET_BASE = 'https://pub-d0fbe48b068b460e96f026d1d9fe3c68.r2.dev/exercises';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_IOS = Platform.OS === 'ios';
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.55;
const ACCENT = AppColors.orange;

// ---------------- DATA ----------------

const ALL_MUSCLES = 'All Muscles';
const ALL_EQUIPMENT = 'All Equipment';
const EXERCISE_BATCH_SIZE = 15;

function formatExerciseLabel(value?: string): string {
    if (!value) return 'Unknown';
    return value
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
}

function formatExerciseName(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/(^|[\s(-])[a-z]/g, (match) => match.toUpperCase());
}

function resolveAssetUrl(pathLike?: string): string {
    if (!pathLike) return '';
    if (pathLike.startsWith('http://') || pathLike.startsWith('https://')) {
        return pathLike;
    }

    const normalizedPath = pathLike.startsWith('/') ? pathLike.slice(1) : pathLike;
    return `${EXERCISE_ASSET_BASE}/${normalizedPath}`;
}

// old-style icon feeling, but orange theme
const EXERCISE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    'Bench Press (Barbell)': 'barbell-outline',
    'Incline Bench (Barbell)': 'barbell-outline',
    'Dumbbell Press': 'fitness-outline',
    'Lat Pulldown': 'arrow-down-circle-outline',
    'Barbell Row': 'barbell-outline',
    'Bicep Curl': 'body-outline',
    'Tricep Dips': 'hand-left-outline',
    'Squats': 'walk-outline',
    'Leg Press': 'footsteps-outline',
    'Deadlift': 'barbell-outline',
};

// ---------------- MAIN SCREEN ----------------

export default function AddExerciseScreen() {
    const router = useRouter();
    const routeParams = useLocalSearchParams();
    const navigation = useNavigation();
    const { addTarget } = useRoutine();

    const [searchText, setSearchText] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
    const [equipmentSheetVisible, setEquipmentSheetVisible] = useState(false);
    const [muscleSheetVisible, setMuscleSheetVisible] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedExerciseKeys, setSelectedExerciseKeys] = useState<string[]>([]);
    const [visibleCount, setVisibleCount] = useState(EXERCISE_BATCH_SIZE);

    const exercises = useMemo<ScreenExercise[]>(() => {
        return localExerciseRecords.map((record, index) => ({
            listKey: record.id || `${record.name}-${index}`,
            exerciseId: record.id,
            name: formatExerciseName(record.name),
            muscle: formatExerciseLabel(record.target || record.body_part),
            equipment: formatExerciseLabel(record.equipment),
            imagePath: record.image,
            imageAsset: 'icon',
        }));
    }, []);

    const equipmentList = useMemo(() => {
        const unique = Array.from(new Set(exercises.map((item) => item.equipment).filter(Boolean)));
        return [ALL_EQUIPMENT, ...unique.sort((a, b) => a.localeCompare(b))];
    }, [exercises]);

    const muscleList = useMemo(() => {
        const unique = Array.from(new Set(exercises.map((item) => item.muscle).filter(Boolean)));
        return [ALL_MUSCLES, ...unique.sort((a, b) => a.localeCompare(b))];
    }, [exercises]);

    const filteredExercises = useMemo(() => {
        const query = searchText.toLowerCase();

        return exercises.filter((ex) => {
            const eqMatch =
                !selectedEquipment ||
                selectedEquipment === ALL_EQUIPMENT ||
                ex.equipment === selectedEquipment;

            const mMatch =
                !selectedMuscle ||
                selectedMuscle === ALL_MUSCLES ||
                ex.muscle === selectedMuscle;

            const sMatch = !query || ex.name.toLowerCase().includes(query);

            return eqMatch && mMatch && sMatch;
        });
    }, [exercises, searchText, selectedEquipment, selectedMuscle]);

    const visibleExercises = useMemo(
        () => filteredExercises.slice(0, visibleCount),
        [filteredExercises, visibleCount]
    );

    useEffect(() => {
        setVisibleCount(EXERCISE_BATCH_SIZE);
    }, [searchText, selectedEquipment, selectedMuscle]);

    const handleLoadMore = useCallback(() => {
        setVisibleCount((prev) => {
            if (prev >= filteredExercises.length) {
                return prev;
            }
            return Math.min(prev + EXERCISE_BATCH_SIZE, filteredExercises.length);
        });
    }, [filteredExercises.length]);

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

    const selectedExercises = useMemo(() => {
        if (selectedExerciseKeys.length === 0) return [] as ScreenExercise[];
        const selectedSet = new Set(selectedExerciseKeys);
        return exercises.filter((item) => selectedSet.has(item.listKey));
    }, [exercises, selectedExerciseKeys]);

    const toggleExerciseSelection = useCallback((exercise: ScreenExercise) => {
        setSelectedExerciseKeys((prev) => {
            const exists = prev.includes(exercise.listKey);
            const next = exists ? prev.filter((key) => key !== exercise.listKey) : [...prev, exercise.listKey];
            if (next.length === 0) {
                setIsSelectionMode(false);
            }
            return next;
        });
    }, []);

    const handleExercisePress = useCallback((exercise: ScreenExercise) => {
        if (isSelectionMode) {
            toggleExerciseSelection(exercise);
            return;
        }
        handleExerciseSelect(exercise);
    }, [isSelectionMode, toggleExerciseSelection]);

    const handleExerciseLongPress = useCallback((exercise: ScreenExercise) => {
        if (!isSelectionMode) {
            setIsSelectionMode(true);
            setSelectedExerciseKeys([exercise.listKey]);
            return;
        }
        toggleExerciseSelection(exercise);
    }, [isSelectionMode, toggleExerciseSelection]);

    const handleExercisePreview = useCallback((exercise: ScreenExercise) => {
        router.push({
            pathname: '/(tabs)/Workout/exercisepreview',
            params: {
                id: exercise.exerciseId || '',
                name: exercise.name,
                bodyPart: exercise.muscle,
                equipment: exercise.equipment,
                imagePath: exercise.imagePath || '',
            },
        });
    }, [router]);

    const handleDoneSelection = useCallback(() => {
        if (selectedExercises.length === 0) {
            setIsSelectionMode(false);
            return;
        }

        const selectedNames = selectedExercises.map((item) => item.name);

        if (routeParams?.fromWorkout === 'true') {
            setIsSelectionMode(false);
            setSelectedExerciseKeys([]);
            router.back();
            setTimeout(() => {
                router.setParams({ addExerciseNames: JSON.stringify(selectedNames) } as any);
            }, 100);
            return;
        }

        selectedNames.forEach((name) => {
            addTarget({
                name,
                sets: 0,
                targetWeightKg: 0,
                targetReps: 0,
                restSeconds: 0,
            });
        });

        setIsSelectionMode(false);
        setSelectedExerciseKeys([]);
        router.back();
    }, [addTarget, routeParams?.fromWorkout, router, selectedExercises]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: isSelectionMode
                ? () => (
                    <TouchableOpacity onPress={handleDoneSelection} style={styles.doneBtn}>
                        <Text style={styles.doneBtnText}>Done ({selectedExerciseKeys.length})</Text>
                    </TouchableOpacity>
                )
                : undefined,
        });
    }, [handleDoneSelection, isSelectionMode, navigation, selectedExerciseKeys.length]);

    const activeFilters =
        (selectedEquipment && selectedEquipment !== ALL_EQUIPMENT ? 1 : 0) +
        (selectedMuscle && selectedMuscle !== ALL_MUSCLES ? 1 : 0);

    const clearFilters = () => {
        setSelectedEquipment(null);
        setSelectedMuscle(null);
    };

    const handleOpenEquipmentSheet = useCallback(() => {
        setEquipmentSheetVisible(true);
    }, []);

    const handleOpenMuscleSheet = useCallback(() => {
        setMuscleSheetVisible(true);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
                <AddExerciseHeader
                    activeFilters={activeFilters}
                    searchText={searchText}
                    onChangeSearchText={setSearchText}
                    selectedEquipment={selectedEquipment}
                    selectedMuscle={selectedMuscle}
                    filteredCount={filteredExercises.length}
                    onClearFilters={clearFilters}
                    onOpenEquipmentSheet={handleOpenEquipmentSheet}
                    onOpenMuscleSheet={handleOpenMuscleSheet}
                />

                <FlatList<ScreenExercise>
                    data={visibleExercises}
                    keyExtractor={(item: ScreenExercise) => item.listKey}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    initialNumToRender={EXERCISE_BATCH_SIZE}
                    maxToRenderPerBatch={EXERCISE_BATCH_SIZE}
                    windowSize={7}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.35}
                    renderItem={({ item }: ListRenderItemInfo<ScreenExercise>) => (
                        <ExerciseItem
                            exercise={item}
                            selectionMode={isSelectionMode}
                            selected={selectedExerciseKeys.includes(item.listKey)}
                            onPress={() => handleExercisePress(item)}
                            onLongPress={() => handleExerciseLongPress(item)}
                            onPreviewPress={() => handleExercisePreview(item)}
                        />
                    )}
                    ListFooterComponent={
                        visibleExercises.length < filteredExercises.length ? (
                            <View style={styles.loadMoreFooter}>
                                <Text style={styles.loadMoreText}>Loading more exercises...</Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name="search-circle-outline"
                                size={64}
                                color="rgba(255,255,255,0.12)"
                            />
                            <Text style={styles.emptyText}>No exercises found</Text>
                            <Text style={styles.emptySubText}>Try adjusting your filters</Text>
                        </View>
                    }
                />
            </SafeAreaView>

            <FilterSheet
                visible={equipmentSheetVisible}
                title="Equipment"
                items={equipmentList}
                selected={selectedEquipment || ALL_EQUIPMENT}
                onSelect={(item: string) => {
                    setSelectedEquipment(item === ALL_EQUIPMENT ? null : item);
                    setEquipmentSheetVisible(false);
                }}
                onClose={() => setEquipmentSheetVisible(false)}
            />

            <FilterSheet
                visible={muscleSheetVisible}
                title="Muscle Group"
                items={muscleList}
                selected={selectedMuscle || ALL_MUSCLES}
                onSelect={(item: string) => {
                    setSelectedMuscle(item === ALL_MUSCLES ? null : item);
                    setMuscleSheetVisible(false);
                }}
                onClose={() => setMuscleSheetVisible(false)}
            />
        </View>
    );
}

type AddExerciseHeaderProps = {
    activeFilters: number;
    searchText: string;
    onChangeSearchText: (value: string) => void;
    selectedEquipment: string | null;
    selectedMuscle: string | null;
    filteredCount: number;
    onClearFilters: () => void;
    onOpenEquipmentSheet: () => void;
    onOpenMuscleSheet: () => void;
};

const AddExerciseHeader = React.memo(function AddExerciseHeader({
    activeFilters,
    searchText,
    onChangeSearchText,
    selectedEquipment,
    selectedMuscle,
    filteredCount,
    onClearFilters,
    onOpenEquipmentSheet,
    onOpenMuscleSheet,
}: AddExerciseHeaderProps) {
    return (
        <View style={styles.headerContainer}>
            {activeFilters > 0 && (
                <View style={styles.titleRow}>
                    <View style={styles.headerActionsRow}>
                        <TouchableOpacity onPress={onClearFilters} style={styles.clearBtn}>
                            <Text style={styles.clearBtnText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <View style={styles.searchWrapper}>
                <BlurView intensity={IS_IOS ? 30 : 20} tint="dark" style={styles.searchBlur}>
                    <Ionicons
                        name="search"
                        size={18}
                        color={ACCENT}
                        style={{ marginRight: 10 }}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercises..."
                        placeholderTextColor="rgba(255,255,255,0.25)"
                        value={searchText}
                        onChangeText={onChangeSearchText}
                        returnKeyType="search"
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                    />
                </BlurView>
            </View>

            <View style={styles.filterRow}>
                <FilterChip
                    label={
                        selectedEquipment && selectedEquipment !== ALL_EQUIPMENT
                            ? selectedEquipment
                            : 'Equipment'
                    }
                    active={!!selectedEquipment && selectedEquipment !== ALL_EQUIPMENT}
                    icon="barbell-outline"
                    onPress={onOpenEquipmentSheet}
                />

                <FilterChip
                    label={
                        selectedMuscle && selectedMuscle !== ALL_MUSCLES
                            ? selectedMuscle
                            : 'Muscle'
                    }
                    active={!!selectedMuscle && selectedMuscle !== ALL_MUSCLES}
                    icon="body-outline"
                    onPress={onOpenMuscleSheet}
                />
            </View>

            <Text style={styles.countText}>
                {filteredCount} exercise{filteredCount !== 1 ? 's' : ''}
            </Text>
        </View>
    );
});

// ---------------- FILTER CHIP ----------------

function FilterChip({
                        label,
                        onPress,
                        active,
                        icon,
                    }: {
    label: string;
    onPress: () => void;
    active: boolean;
    icon: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.chipTouch}>
            <View style={[styles.chipInner, active && styles.chipInnerActive]}>
                <Ionicons
                    name={icon}
                    size={14}
                    color={active ? '#000' : ACCENT}
                    style={{ marginRight: 6 }}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                    {label}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={13}
                    color={active ? '#000' : 'rgba(255,255,255,0.45)'}
                    style={{ marginLeft: 4 }}
                />
            </View>
        </TouchableOpacity>
    );
}

// ---------------- EXERCISE ITEM ----------------

function ExerciseItem({
                          exercise,
                          selectionMode,
                          selected,
                          onPress,
                          onLongPress,
                          onPreviewPress,
                      }: {
    exercise: ScreenExercise;
    selectionMode: boolean;
    selected: boolean;
    onPress: () => void;
    onLongPress: () => void;
    onPreviewPress: () => void;
}) {
    const iconName = EXERCISE_ICONS[exercise.name] ?? 'fitness-outline';
    const imageUrl = resolveAssetUrl(exercise.imagePath);

    return (
        <View style={styles.itemWrapper}>
            <View style={[styles.exerciseCard, selected && styles.exerciseCardSelected]}>
                <View style={styles.accentStripe} />

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    delayLongPress={200}
                    style={styles.exerciseMainTapArea}
                >
                    <View style={styles.iconBubble}>
                        {imageUrl ? (
                            <ExpoImage source={{ uri: imageUrl }} style={styles.exerciseImage} contentFit="cover" />
                        ) : (
                            <Ionicons name={iconName} size={20} color={ACCENT} />
                        )}
                    </View>

                    <View style={styles.exerciseTextGroup}>
                        <Text style={styles.exerciseTitle} numberOfLines={1}>
                            {exercise.name}
                        </Text>

                        <View style={styles.tagRow}>
                            <MiniTag label={exercise.muscle} />
                            <MiniTag label={exercise.equipment} />
                        </View>
                    </View>
                </TouchableOpacity>

                {selectionMode ? (
                    <Ionicons
                        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={22}
                        color={selected ? ACCENT : 'rgba(255,255,255,0.45)'}
                        style={styles.selectionIcon}
                    />
                ) : (
                    <TouchableOpacity onPress={onPreviewPress} activeOpacity={0.8} style={styles.arrowCircle}>
                        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.55)" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

function MiniTag({ label }: { label: string }) {
    return (
        <View style={styles.miniTag}>
            <Text style={styles.miniTagText}>{label}</Text>
        </View>
    );
}

// ---------------- FILTER SHEET ----------------

function FilterSheet({
                         visible,
                         title,
                         items,
                         selected,
                         onSelect,
                         onClose,
                     }: {
    visible: boolean;
    title: string;
    items: string[];
    selected: string;
    onSelect: (item: string) => void;
    onClose: () => void;
}) {
    const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.spring(translateY, {
                toValue: 0,
                damping: 22,
                stiffness: 200,
                useNativeDriver: true,
            }).start();
        } else {
            translateY.setValue(SHEET_HEIGHT);
        }
    }, [visible, translateY]);

    const dismiss = useCallback(() => {
        Animated.timing(translateY, {
            toValue: SHEET_HEIGHT,
            duration: 220,
            useNativeDriver: true,
        }).start(() => onClose());
    }, [onClose, translateY]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_: GestureResponderEvent, gs: PanResponderGestureState) =>
                Math.abs(gs.dy) > 5,
            onPanResponderMove: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
                if (gs.dy > 0) {
                    translateY.setValue(gs.dy);
                }
            },
            onPanResponderRelease: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
                if (gs.dy > SHEET_HEIGHT * 0.2 || gs.vy > 0.7) {
                    dismiss();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        damping: 20,
                        stiffness: 180,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={dismiss}
        >
            <TouchableOpacity style={styles.backdrop} onPress={dismiss} activeOpacity={1} />

            <Animated.View
                style={[styles.sheetContainer, { transform: [{ translateY }] }]}
            >
                <BlurView intensity={IS_IOS ? 35 : 25} tint="dark" style={styles.sheetBlur}>
                    <View {...panResponder.panHandlers} style={styles.dragZone}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>{title}</Text>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        bounces={false}
                    >
                        {items.map((item) => {
                            const isSelected = selected === item;

                            return (
                                <TouchableOpacity
                                    key={item}
                                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                                    onPress={() => onSelect(item)}
                                    activeOpacity={0.75}
                                >
                                    <Text
                                        style={[styles.optionText, isSelected && styles.optionTextSelected]}
                                    >
                                        {item}
                                    </Text>

                                    {isSelected && (
                                        <View style={styles.checkCircle}>
                                            <Ionicons name="checkmark" size={13} color="#000" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </BlurView>
            </Animated.View>
        </Modal>
    );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },

    listContent: {
        paddingBottom: 60,
    },

    listHeaderSticky: {
        backgroundColor: '#0a0a0f',
        zIndex: 10,
    },

    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        marginBottom: 6,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 8,
    },

    headerActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    screenTitle: {
        color: ACCENT,
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.3,
    },

    clearBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: 'rgba(255,120,37,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,120,37,0.25)',
    },

    clearBtnText: {
        color: ACCENT,
        fontSize: 13,
        fontWeight: '600',
    },

    doneBtn: {
        backgroundColor: ACCENT,
        paddingVertical: 6,
        borderRadius: 8,
    },

    doneBtnDisabled: {
        opacity: 0.45,
    },

    doneBtnText: {
        color: '#000',
        fontSize: 13,
        fontWeight: '700',
        paddingHorizontal: 12,
    },

    headerDoneButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: 'rgba(255,120,37,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,120,37,0.35)',
    },

    headerDoneButtonText: {
        color: ACCENT,
        fontSize: 13,
        fontWeight: '700',
    },

    searchWrapper: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        marginBottom: 14,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },

    searchBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: Platform.OS === 'ios' ? 'rgba(18,18,18,0.65)' : 'rgba(18,18,18,0.9)',
    },

    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },

    filterRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
    },

    chipTouch: {
        flex: 1,
    },

    chipInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    chipInnerActive: {
        backgroundColor: ACCENT,
        borderColor: ACCENT,
    },

    chipText: {
        color: 'rgba(255,255,255,0.78)',
        fontWeight: '600',
        fontSize: 13,
        flexShrink: 1,
    },

    chipTextActive: {
        color: '#000',
    },

    countText: {
        color: 'rgba(255,255,255,0.28)',
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 4,
    },

    itemWrapper: {
        paddingHorizontal: 16,
        marginBottom: 10,
    },

    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        backgroundColor: 'rgba(18,18,18,0.96)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        overflow: 'hidden',
    },

    exerciseMainTapArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 14,
    },

    exerciseCardSelected: {
        borderColor: 'rgba(255,120,37,0.6)',
        backgroundColor: 'rgba(255,120,37,0.08)',
    },

    accentStripe: {
        position: 'absolute',
        left: 0,
        top: 10,
        bottom: 10,
        width: 3,
        borderRadius: 2,
        backgroundColor: ACCENT,
    },

    iconBubble: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,120,37,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
        overflow: 'hidden',
    },

    exerciseImage: {
        width: '100%',
        height: '100%',
    },

    exerciseTextGroup: {
        flex: 1,
        marginLeft: 14,
    },

    exerciseTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.2,
        marginBottom: 6,
    },

    tagRow: {
        flexDirection: 'row',
        gap: 6,
        flexWrap: 'wrap',
    },

    miniTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },

    miniTagText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.62)',
        fontWeight: '500',
    },

    arrowCircle: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.07)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        marginRight: 10,
    },

    selectionIcon: {
        marginRight: 6,
    },

    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        gap: 8,
    },

    emptyText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 18,
        fontWeight: '700',
    },

    emptySubText: {
        color: 'rgba(255,255,255,0.18)',
        fontSize: 14,
    },

    loadMoreFooter: {
        paddingVertical: 14,
        alignItems: 'center',
    },

    loadMoreText: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.75)',
    },

    sheetContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: SHEET_HEIGHT,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },

    sheetBlur: {
        flex: 1,
        backgroundColor: Platform.OS === 'ios' ? 'rgba(14,14,20,0.88)' : 'rgba(14,14,20,0.97)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },

    dragZone: {
        paddingTop: 10,
        paddingBottom: 8,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },

    sheetHandle: {
        width: 44,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(255,120,37,0.9)',
        alignSelf: 'center',
        marginBottom: 14,
    },

    sheetTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 0.3,
    },

    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },

    optionItemSelected: {
        backgroundColor: 'rgba(255,120,37,0.10)',
    },

    optionText: {
        flex: 1,
        color: 'rgba(255,255,255,0.78)',
        fontSize: 17,
        letterSpacing: 0.2,
    },

    optionTextSelected: {
        color: ACCENT,
        fontWeight: '700',
    },

    checkCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ACCENT,
    },
});

