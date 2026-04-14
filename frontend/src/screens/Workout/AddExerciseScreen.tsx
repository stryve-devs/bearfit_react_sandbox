import React, { useState, useMemo, useRef, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { AppColors } from '../../constants/colors';
import { Exercise } from '../../types/workout.types';
import { useRoutine } from '../../context/RoutineContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_IOS = Platform.OS === 'ios';
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.55;
const ACCENT = AppColors.orange;

// ---------------- DATA ----------------

const MUSCLE_LIST = [
    'All Muscles',
    'Abs',
    'Abductors',
    'Adductors',
    'Back',
    'Biceps',
    'Calves',
    'Cardio',
    'Chest',
    'Forearms',
    'Full Body',
    'Glutes',
    'Hamstrings',
    'Lats',
    'Lower Back',
    'Neck',
    'Quads',
    'Shoulders',
    'Traps',
    'Triceps',
    'Upper Back',
];

const EQUIPMENT_LIST = [
    'All Equipment',
    'No Equipment',
    'Barbell',
    'Dumbbell',
    'Kettlebell',
    'Machine',
    'Plate',
    'Resistance Band',
    'Suspension Band',
];

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

// ---------------- MAIN SCREEN ----------------

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
            const eqMatch =
                !selectedEquipment ||
                selectedEquipment === 'All Equipment' ||
                ex.equipment === selectedEquipment;

            const mMatch =
                !selectedMuscle ||
                selectedMuscle === 'All Muscles' ||
                ex.muscle === selectedMuscle;

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

    const activeFilters =
        (selectedEquipment && selectedEquipment !== 'All Equipment' ? 1 : 0) +
        (selectedMuscle && selectedMuscle !== 'All Muscles' ? 1 : 0);

    const clearFilters = () => {
        setSelectedEquipment(null);
        setSelectedMuscle(null);
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
                {activeFilters > 0 && (
                    <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
                        <Text style={styles.clearBtnText}>Clear</Text>
                    </TouchableOpacity>
                )}
            </View>
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
                        onChangeText={setSearchText}
                        returnKeyType="search"
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                    />
                </BlurView>
            </View>

            <View style={styles.filterRow}>
                <FilterChip
                    label={
                        selectedEquipment && selectedEquipment !== 'All Equipment'
                            ? selectedEquipment
                            : 'Equipment'
                    }
                    active={!!selectedEquipment && selectedEquipment !== 'All Equipment'}
                    icon="barbell-outline"
                    onPress={() => setEquipmentSheetVisible(true)}
                />

                <FilterChip
                    label={
                        selectedMuscle && selectedMuscle !== 'All Muscles'
                            ? selectedMuscle
                            : 'Muscle'
                    }
                    active={!!selectedMuscle && selectedMuscle !== 'All Muscles'}
                    icon="body-outline"
                    onPress={() => setMuscleSheetVisible(true)}
                />
            </View>

            <Text style={styles.countText}>
                {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <FlatList
                    data={filteredExercises}
                    keyExtractor={(item) => item.name}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                        <ExerciseItem exercise={item} onPress={() => handleExerciseSelect(item)} />
                    )}
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
                items={EQUIPMENT_LIST}
                selected={selectedEquipment || 'All Equipment'}
                onSelect={(item: string) => {
                    setSelectedEquipment(item === 'All Equipment' ? null : item);
                    setEquipmentSheetVisible(false);
                }}
                onClose={() => setEquipmentSheetVisible(false)}
            />

            <FilterSheet
                visible={muscleSheetVisible}
                title="Muscle Group"
                items={MUSCLE_LIST}
                selected={selectedMuscle || 'All Muscles'}
                onSelect={(item: string) => {
                    setSelectedMuscle(item === 'All Muscles' ? null : item);
                    setMuscleSheetVisible(false);
                }}
                onClose={() => setMuscleSheetVisible(false)}
            />
        </View>
    );
}

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
                          onPress,
                      }: {
    exercise: Exercise;
    onPress: () => void;
}) {
    const iconName = EXERCISE_ICONS[exercise.name] ?? 'fitness-outline';

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.itemWrapper}>
            <View style={styles.exerciseCard}>
                <View style={styles.accentStripe} />

                <View style={styles.iconBubble}>
                    <Ionicons name={iconName} size={20} color={ACCENT} />
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

                <View style={styles.arrowCircle}>
                    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.55)" />
                </View>
            </View>
        </TouchableOpacity>
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
            onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5,
            onPanResponderMove: (_, gs) => {
                if (gs.dy > 0) {
                    translateY.setValue(gs.dy);
                }
            },
            onPanResponderRelease: (_, gs) => {
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

    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 0,
        marginBottom: 6,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',  // 👈 pushes "Clear" to right
        marginBottom: 8,
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
        paddingVertical: 14,
        paddingHorizontal: 14,
        overflow: 'hidden',
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