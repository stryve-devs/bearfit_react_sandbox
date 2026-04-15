import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../constants/colors';
import { setHeaderActions } from '../../../app/(tabs)/Workout/_layout';

const EXERCISE_ASSET_BASE = 'https://pub-d0fbe48b068b460e96f026d1d9fe3c68.r2.dev/exercises';

type LocalExerciseRecord = {
    id?: string;
    name?: string;
    instructions?: {
        en?: string;
    };
    instruction_steps?: {
        en?: string[];
    };
    logging_instructions?: string;
    gif_url?: string;
};

const localExerciseRecords = require('../../constants/exercise-data.json') as LocalExerciseRecord[];

function normalizeExerciseName(value: string): string {
    return value.trim().toLowerCase();
}

function getExerciseRecord(exerciseId: string, exerciseName: string) {
    const normalizedId = exerciseId.trim();
    const normalizedName = normalizeExerciseName(exerciseName);

    return localExerciseRecords.find((item) => {
        const itemId = (item.id || '').trim();
        const itemName = normalizeExerciseName(item.name || '');
        return itemId === normalizedId || itemName === normalizedName;
    });
}

function getExerciseSteps(record?: LocalExerciseRecord): string[] {
    const steps = record?.instruction_steps?.en;
    if (Array.isArray(steps) && steps.length > 0) {
        return steps.filter((step) => step.trim().length > 0);
    }

    const text = (record?.instructions?.en || '').trim();
    if (!text) {
        return [];
    }

    return text
        .split(/\.(?=\s|$)/g)
        .map((step) => step.trim())
        .filter(Boolean)
        .map((step) => (step.endsWith('.') ? step : `${step}.`));
}

function getExerciseLoggingInstruction(record?: LocalExerciseRecord): string {
    const instruction = (record?.logging_instructions || '').trim();
    if (instruction) {
        return instruction;
    }

    return 'No logging instructions available for this exercise yet.';
}

function buildHowToLogHighlights(loggingText: string): string[] {
    const normalized = loggingText.toLowerCase();

    let weightLine = 'Weight: Log the external load used for each set.';
    if (normalized.includes('keep weight at 0') || normalized.includes('use weight as 0')) {
        weightLine = 'Weight: Enter 0 in Weight unless external load is added.';
    } else if (normalized.includes('bar plus all plates')) {
        weightLine = 'Weight: Log total load (bar plus all plates).';
    } else if (normalized.includes('one dumbbell')) {
        weightLine = 'Weight: Log the load of one dumbbell per set.';
    } else if (normalized.includes('machine or stack load') || normalized.includes('stack load')) {
        weightLine = 'Weight: Log the machine/stack load shown.';
    } else if (normalized.includes('band tension')) {
        weightLine = 'Weight: Log your best estimated band tension.';
    }

    const formLine = 'Form: Record clean reps only with your chosen range standard.';
    const consistencyLine = 'Consistency: Keep setup, depth, and lockout the same across sets.';

    return [weightLine, formLine, consistencyLine];
}

function getStringParam(value: string | string[] | undefined): string {
    if (Array.isArray(value)) {
        return value[0] || '';
    }
    return value || '';
}

type DotLoaderProps = {
    size?: number;
};

function ThreeDotLoader({ size = 14 }: DotLoaderProps) {
    const dot1 = React.useRef(new Animated.Value(0.35)).current;
    const dot2 = React.useRef(new Animated.Value(0.35)).current;
    const dot3 = React.useRef(new Animated.Value(0.35)).current;

    React.useEffect(() => {
        const createLoop = (value: Animated.Value, delayMs: number) => (
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delayMs),
                    Animated.timing(value, {
                        toValue: 1,
                        duration: 420,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(value, {
                        toValue: 0.35,
                        duration: 420,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.delay(180),
                ])
            )
        );

        const loops = [
            createLoop(dot1, 0),
            createLoop(dot2, 140),
            createLoop(dot3, 280),
        ];

        loops.forEach((loop) => loop.start());
        return () => loops.forEach((loop) => loop.stop());
    }, [dot1, dot2, dot3]);

    const dotStyle = (value: Animated.Value, color: string) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        marginHorizontal: 6,
        backgroundColor: color,
        opacity: value,
        transform: [
            {
                scale: value.interpolate({
                    inputRange: [0.35, 1],
                    outputRange: [0.78, 1.22],
                }),
            },
        ],
    });

    return (
        <View style={styles.dotsRow}>
            <Animated.View style={dotStyle(dot1, '#FFB066')} />
            <Animated.View style={dotStyle(dot2, AppColors.orange)} />
            <Animated.View style={dotStyle(dot3, '#CC6A1F')} />
        </View>
    );
}

type ExercisePreviewTopTabParamList = {
    Summary: undefined;
    History: undefined;
    HowTo: undefined;
};

const { createMaterialTopTabNavigator } = require('@react-navigation/material-top-tabs') as {
    createMaterialTopTabNavigator: <T extends Record<string, object | undefined>>() => any;
};

const TopTab = createMaterialTopTabNavigator<ExercisePreviewTopTabParamList>();

type SummaryMetric = 'Heaviest Weight' | 'One Rep Max' | 'Best Set Volume' | 'Session Volume';

type PersonalRecords = {
    heaviest: string;
    oneRepMax: string;
    bestSetVol: string;
    sessionVol: string;
};

type HistoryPoint = {
    label: string;
    weight: number;
};

type HistorySession = {
    weight: number;
    daysAgo: string;
};

const METRIC_CHIPS: SummaryMetric[] = ['Heaviest Weight', 'One Rep Max', 'Best Set Volume', 'Session Volume'];
const HISTORY_DEMO_POINTS: HistoryPoint[] = [
    { label: 'Jan', weight: 30 },
    { label: 'Feb', weight: 35 },
    { label: 'Mar', weight: 40 },
    { label: 'Apr', weight: 42 },
    { label: 'May', weight: 45 },
];
const HISTORY_DEMO_SESSIONS: HistorySession[] = [
    { weight: 45, daysAgo: '2 days ago' },
    { weight: 42, daysAgo: '5 days ago' },
    { weight: 40, daysAgo: '9 days ago' },
    { weight: 35, daysAgo: '14 days ago' },
];

const SUMMARY_DEMO_SERIES: Record<SummaryMetric, number[]> = {
    'Heaviest Weight': [28, 32, 36, 40, 45],
    'One Rep Max': [31, 35, 40, 44, 50],
    'Best Set Volume': [180, 220, 270, 320, 380],
    'Session Volume': [620, 760, 910, 1080, 1260],
};

const SUMMARY_DEMO_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

function isWeightMetric(metric: SummaryMetric): boolean {
    return metric === 'Heaviest Weight' || metric === 'One Rep Max';
}

function buildSeed(source: string): number {
    return source.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function buildDummyStats(seedSource: string, unit: 'kg' | 'lbs'): PersonalRecords {
    const seed = Math.max(1, buildSeed(seedSource) % 97);
    const baseWeight = 20 + (seed % 80);
    const reps = 3 + (seed % 10);

    return {
        heaviest: `${baseWeight} ${unit}`,
        oneRepMax: `${baseWeight + 5} ${unit}`,
        bestSetVol: `${baseWeight * reps}`,
        sessionVol: `${baseWeight * reps * 3}`,
    };
}

function RecordRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.recordRow}>
            <Text style={styles.recordLabel}>{label}</Text>
            <Text style={styles.recordValue}>{value}</Text>
        </View>
    );
}

function MetricChip({
    label,
    active,
    onPress,
}: {
    label: SummaryMetric;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.metricChip, active && styles.metricChipActive]}
        >
            <Text style={[styles.metricChipText, active && styles.metricChipTextActive]}>{label}</Text>
        </TouchableOpacity>
    );
}

function HistoryEmptyState({ title }: { title: string }) {
    return (
        <ScrollView
            style={styles.summaryScroll}
            contentContainerStyle={styles.historyEmptyContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.historyEmptyCard}>
                <Text style={styles.historyEmptyTitle}>No exercise history</Text>
                <Text style={styles.historyEmptyText}>
                    When you log a workout with this
                    {'\n'}exercise, your history will appear here.
                </Text>
                <Text style={styles.historyEmptySubtitle}>{title}</Text>
            </View>
        </ScrollView>
    );
}

function HistorySessionRow({ weight, daysAgo, unit }: { weight: number; daysAgo: string; unit: 'kg' | 'lbs' }) {
    return (
        <View style={styles.historySessionRow}>
            <View>
                <Text style={styles.historySessionWeight}>{weight} {unit}</Text>
                <Text style={styles.historySessionDate}>{daysAgo}</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={AppColors.lightGrey} />
        </View>
    );
}

function HowToStep({ index, text }: { index: number; text: string }) {
    return (
        <View style={styles.howToStepRow}>
            <View style={styles.howToStepBullet}>
                <Text style={styles.howToStepBulletText}>{index + 1}</Text>
            </View>
            <Text style={styles.howToStepText}>{text}</Text>
        </View>
    );
}

export default function ExercisePreviewScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();

    const exerciseId = getStringParam(params.id);
    const exerciseName = getStringParam(params.name);
    const bodyPart = getStringParam(params.bodyPart);
    const equipment = getStringParam(params.equipment);
    const selectedExercise = useMemo(() => getExerciseRecord(exerciseId, exerciseName), [exerciseId, exerciseName]);
    const howToSteps = useMemo(() => getExerciseSteps(selectedExercise), [selectedExercise]);
    const howToLogText = useMemo(() => getExerciseLoggingInstruction(selectedExercise), [selectedExercise]);
    const howToLogHighlights = useMemo(() => buildHowToLogHighlights(howToLogText), [howToLogText]);

    const [gifUrl, setGifUrl] = useState('');
    const [gifLoading, setGifLoading] = useState(false);
    const [gifError, setGifError] = useState<string | null>(null);
    const [activeMetric, setActiveMetric] = useState<SummaryMetric>('Heaviest Weight');
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
    const [useDefaultUnit, setUseDefaultUnit] = useState(true);
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [showWeightUnitsModal, setShowWeightUnitsModal] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [showHowToLogModal, setShowHowToLogModal] = useState(false);
    // Tab swipe gestures are disabled, so lockTabSwipe state is removed.

    const seedSource = `${exerciseId}-${exerciseName}`;
    const [personalRecords, setPersonalRecords] = useState<PersonalRecords>(() => buildDummyStats(seedSource, weightUnit));

    const isSitUpSummaryDemo = useMemo(
        () => exerciseName.trim().toLowerCase() === '3/4 sit-up',
        [exerciseName]
    );

    const summaryDemoPoints = useMemo(() => {
        const baseValues = SUMMARY_DEMO_SERIES[activeMetric];
        return SUMMARY_DEMO_LABELS.map((label, index) => {
            const raw = baseValues[index] || 0;
            const value = isWeightMetric(activeMetric) && weightUnit === 'lbs'
                ? Math.round(raw * 2.20462)
                : raw;

            return { label, value };
        });
    }, [activeMetric, weightUnit]);

    const summaryChartMax = useMemo(
        () => Math.max(...summaryDemoPoints.map((point) => point.value), 1),
        [summaryDemoPoints]
    );

    const regenerateStats = useCallback(() => {
        const jitterSeed = `${seedSource}-${Date.now()}`;
        setPersonalRecords(buildDummyStats(jitterSeed, weightUnit));
    }, [seedSource, weightUnit]);

    const handleHowToInfo = useCallback(() => {
        setShowHowToLogModal(true);
    }, []);

    const handleRecordsInfo = useCallback(() => {
        Alert.alert(
            'Personal Records',
            'Heaviest Weight: highest lifted weight.\n\nBest 1RM: estimated max for one rep.\n\nBest Set Volume: max weight x reps in one set.\n\nBest Session Volume: max total volume in one session.'
        );
    }, []);

    const handleHeaderShare = useCallback(() => {
        const sharePayload = {
            exerciseId,
            exerciseName: exerciseName || 'Exercise Preview',
            bodyPart: bodyPart || 'Unknown',
            equipment: equipment || 'Unknown',
            weightUnit,
            records: personalRecords,
        };

        router.push({
            pathname: '/(tabs)/Workout/shareexercise',
            params: {
                exerciseShareData: JSON.stringify(sharePayload),
            },
        });
    }, [bodyPart, equipment, exerciseId, exerciseName, personalRecords, router, weightUnit]);

    const handleHeaderMenu = useCallback(() => {
        setShowMenuModal(true);
    }, []);

    useEffect(() => {
        setHeaderActions({
            shareExercisePreview: handleHeaderShare,
            openExercisePreviewMenu: handleHeaderMenu,
        });

        return () => {
            setHeaderActions({
                shareExercisePreview: () => {},
                openExercisePreviewMenu: () => {},
            });
        };
    }, [handleHeaderMenu, handleHeaderShare]);

    useEffect(() => {
        setPersonalRecords(buildDummyStats(seedSource, weightUnit));
    }, [seedSource, weightUnit]);

    useEffect(() => {
        const match = localExerciseRecords.find((item) => item.id === exerciseId);
        const nextGifUrl = (match?.gif_url || '').trim();

        if (!nextGifUrl) {
            setGifUrl('');
            setGifError(null);
            setGifLoading(false);
            return;
        }

        let resolved: string;
        if (nextGifUrl.startsWith('http://') || nextGifUrl.startsWith('https://')) {
            resolved = nextGifUrl.startsWith('http://')
                ? nextGifUrl.replace('http://', 'https://')
                : nextGifUrl;
        } else {
            const normalizedPath = nextGifUrl.startsWith('/') ? nextGifUrl.slice(1) : nextGifUrl;
            resolved = `${EXERCISE_ASSET_BASE}/${normalizedPath}`;
        }

        setGifUrl(resolved);
        setGifError(null);
        setGifLoading(true);
    }, [exerciseId]);

    useEffect(() => {
        setGifLoading(Boolean(gifUrl));
        setGifError(null);
    }, [gifUrl]);

    const renderSummaryTab = () => (
        <ScrollView
            style={styles.summaryScroll}
            contentContainerStyle={styles.summaryContent}
            showsVerticalScrollIndicator={false}
        >
            {renderGifHero()}

            <Text style={styles.title} numberOfLines={2}>{exerciseName || 'Exercise Preview'}</Text>
            <Text style={styles.meta}>Primary: {bodyPart || 'Unknown'}</Text>
            <Text style={styles.meta}>Equipment: {equipment || 'Unknown'}</Text>

            <TouchableOpacity style={styles.howToRow} activeOpacity={0.85} onPress={handleHowToInfo}>
                <Ionicons name="bulb-outline" size={18} color={AppColors.orange} />
                <Text style={styles.howToText}>How to log</Text>
            </TouchableOpacity>

            {isSitUpSummaryDemo ? (
                <View style={styles.historyCard}>
                    <Text style={styles.historyCardLabel}>
                        Demo trend ({activeMetric}{isWeightMetric(activeMetric) ? ` - ${weightUnit}` : ''})
                    </Text>

                    <View style={styles.historyChartWrap}>
                        {summaryDemoPoints.map((point) => {
                            const height = Math.max(12, (point.value / summaryChartMax) * 118);
                            return (
                                <View key={point.label} style={styles.historyChartItem}>
                                    <View style={[styles.historyBar, { height }]} />
                                    <Text style={styles.historyChartMonth}>{point.label}</Text>
                                    <Text style={styles.historyChartWeight}>{point.value}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            ) : (
                <View style={styles.noDataCard}>
                    <Ionicons name="stats-chart-outline" size={34} color={AppColors.grey} />
                    <Text style={styles.noDataText}>No data yet</Text>
                </View>
            )}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.metricRow}
            >
                {METRIC_CHIPS.map((chip) => (
                    <MetricChip
                        key={chip}
                        label={chip}
                        active={activeMetric === chip}
                        onPress={() => {
                            setActiveMetric(chip);
                            regenerateStats();
                        }}
                    />
                ))}
            </ScrollView>

            <View style={styles.recordsHeader}>
                <View style={styles.recordsHeaderLeft}>
                    <Ionicons name="trophy-outline" size={18} color={AppColors.lightGrey} />
                    <Text style={styles.recordsTitle}>Personal Records</Text>
                </View>
                <TouchableOpacity onPress={handleRecordsInfo}>
                    <Ionicons name="help-circle-outline" size={18} color={AppColors.grey} />
                </TouchableOpacity>
            </View>

            <RecordRow label="Heaviest Weight" value={personalRecords.heaviest} />
            <RecordRow label="Best 1RM" value={personalRecords.oneRepMax} />
            <RecordRow label="Best Set Volume" value={personalRecords.bestSetVol} />
            <RecordRow label="Best Session Volume" value={personalRecords.sessionVol} />
        </ScrollView>
    );

    const renderGifHero = () => (
        <View style={styles.gifHeroStrip}>
            <View style={styles.gifHeroBox}>
                {gifError ? (
                    <Text style={styles.statusText}>{gifError}</Text>
                ) : gifUrl ? (
                    <>
                        <ExpoImage
                            source={{ uri: gifUrl }}
                            style={styles.gifHeroImage}
                            contentFit="contain"
                            contentPosition="center"
                            allowDownscaling={false}
                            onLoadStart={() => {
                                setGifError(null);
                                setGifLoading(true);
                            }}
                            onLoad={() => setGifLoading(false)}
                            onError={() => {
                                setGifLoading(false);
                                setGifError('Failed to render GIF image on device');
                            }}
                        />
                        {gifLoading ? (
                            <View style={styles.gifLoadingOverlay}>
                                <ThreeDotLoader size={16} />
                                <Text style={styles.statusText}>loading</Text>
                            </View>
                        ) : null}
                    </>
                ) : (
                    <Text style={styles.statusText}>No GIF available</Text>
                )}
            </View>
        </View>
    );

    const renderHistoryTab = () => {
        const isSitUpDemo = exerciseName.trim().toLowerCase() === '3/4 sit-up';

        if (!isSitUpDemo) {
            return <HistoryEmptyState title={exerciseName || 'Exercise Preview'} />;
        }

        const maxWeight = HISTORY_DEMO_POINTS.reduce((max, point) => Math.max(max, point.weight), 0);

        return (
            <ScrollView
                style={styles.summaryScroll}
                contentContainerStyle={styles.historyContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.historyTopRow}>
                    <View style={styles.historyTopTitleWrap}>
                        <Text style={styles.historyTopTitle} numberOfLines={1}>{exerciseName || 'Exercise Preview'}</Text>
                        <Text style={styles.historyTopMeta} numberOfLines={1}>
                            {bodyPart || 'Unknown'} • {equipment || 'Unknown'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.historySectionTag}>Example history (demo)</Text>

                <View style={styles.historyCard}>
                    <Text style={styles.historyCardLabel}>Top set weight ({weightUnit})</Text>

                    <View style={styles.historyChartWrap}>
                        {HISTORY_DEMO_POINTS.map((point) => {
                            const height = Math.max(12, (point.weight / maxWeight) * 118);
                            return (
                                <View key={point.label} style={styles.historyChartItem}>
                                    <View style={[styles.historyBar, { height }]} />
                                    <Text style={styles.historyChartMonth}>{point.label}</Text>
                                    <Text style={styles.historyChartWeight}>{point.weight}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <Text style={styles.historySectionHeader}>Latest sessions</Text>

                <View style={styles.historySessionList}>
                    {HISTORY_DEMO_SESSIONS.map((session) => (
                        <HistorySessionRow
                            key={`${session.weight}-${session.daysAgo}`}
                            weight={session.weight}
                            daysAgo={session.daysAgo}
                            unit={weightUnit}
                        />
                    ))}
                </View>
            </ScrollView>
        );
    };

    const renderHowToTab = () => {
        if (!howToSteps.length) {
            return (
                <ScrollView
                    style={styles.summaryScroll}
                    contentContainerStyle={styles.historyEmptyContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.historyEmptyCard}>
                        <Text style={styles.historyEmptyTitle}>No instructions available</Text>
                        <Text style={styles.historyEmptyText}>
                            This exercise does not have instructions in `exercise-data.json` yet.
                        </Text>
                        <Text style={styles.historyEmptySubtitle}>{exerciseName || 'Exercise Preview'}</Text>
                    </View>
                </ScrollView>
            );
        }

        return (
            <ScrollView
                style={styles.summaryScroll}
                contentContainerStyle={styles.howToContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.historyTopRow}>
                    <View style={styles.historyTopTitleWrap}>
                        <Text style={styles.historyTopTitle} numberOfLines={1}>{exerciseName || 'Exercise Preview'}</Text>
                        <Text style={styles.historyTopMeta} numberOfLines={1}>
                            {bodyPart || 'Unknown'} • {equipment || 'Unknown'}
                        </Text>
                    </View>
                </View>

                {renderGifHero()}

                <Text style={styles.howToSectionHeader}>Instructions</Text>
                <View style={styles.howToStepsList}>
                    {howToSteps.map((step, index) => (
                        <HowToStep key={`${index}-${step}`} index={index} text={step} />
                    ))}
                </View>
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <View style={styles.contentWrap}>
                <View style={styles.tabView}>
                    <TopTab.Navigator
                        initialRouteName="Summary"
                        screenOptions={{
                            lazy: true,
                            swipeEnabled: false,
                            tabBarScrollEnabled: false,
                            tabBarActiveTintColor: AppColors.orange,
                            tabBarInactiveTintColor: AppColors.grey,
                            tabBarStyle: styles.topTabBar,
                            tabBarIndicatorStyle: styles.topTabIndicator,
                            tabBarItemStyle: styles.topTabItem,
                            tabBarLabelStyle: styles.topTabLabel,
                            sceneStyle: styles.topTabScene,
                            tabBarPressColor: 'transparent',
                        }}
                    >
                        <TopTab.Screen name="Summary">{renderSummaryTab}</TopTab.Screen>
                        <TopTab.Screen name="History">{renderHistoryTab}</TopTab.Screen>
                        <TopTab.Screen name="HowTo" options={{ title: 'How to' }}>
                            {renderHowToTab}
                        </TopTab.Screen>
                    </TopTab.Navigator>
                </View>
            </View>

            {/* How to log modal */}
            <Modal
                visible={showHowToLogModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowHowToLogModal(false)}
            >
                <TouchableOpacity
                    style={styles.howToLogOverlay}
                    activeOpacity={1}
                    onPress={() => setShowHowToLogModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {}}
                        style={styles.howToLogCard}
                    >
                        <View style={styles.howToLogHeader}>
                            <Ionicons name="bulb-outline" size={18} color={AppColors.orange} />
                            <Text style={styles.howToLogTitle}>How to log</Text>
                        </View>

                        <Text style={styles.howToLogBody}>{howToLogText}</Text>

                        <View style={styles.howToLogHighlightsWrap}>
                            {howToLogHighlights.map((line) => (
                                <View key={line} style={styles.howToLogHighlightRow}>
                                    <View style={styles.howToLogBullet} />
                                    <Text style={styles.howToLogHighlightText}>{line}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.howToLogFooter}>
                            <TouchableOpacity
                                onPress={() => setShowHowToLogModal(false)}
                                style={styles.howToLogOkButton}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.howToLogOkButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Main menu modal (Weight Units & Duplicate) */}
            <Modal
                visible={showMenuModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMenuModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowMenuModal(false)}
                >
                    <View style={styles.menuModalContent}>
                        <View style={styles.menuModalHandle} />
                        <TouchableOpacity
                            onPress={() => {
                                setShowMenuModal(false);
                                setShowWeightUnitsModal(true);
                            }}
                            activeOpacity={0.75}
                            style={styles.mainMenuOption}
                        >
                            <View style={styles.mainMenuOptionLeading}>
                                <Ionicons name="scale-outline" size={18} color={AppColors.lightGrey} />
                            </View>
                            <Text style={styles.mainMenuOptionTitle}>Weight Units</Text>
                            <Ionicons name="chevron-forward" size={18} color={AppColors.lightGrey} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setShowMenuModal(false);
                                setShowDuplicateModal(true);
                            }}
                            activeOpacity={0.75}
                            style={styles.mainMenuOption}
                        >
                            <View style={styles.mainMenuOptionLeading}>
                                <Ionicons name="copy" size={18} color={AppColors.lightGrey} />
                            </View>
                            <Text style={styles.mainMenuOptionTitle}>Duplicate Exercise</Text>
                            <Ionicons name="chevron-forward" size={18} color={AppColors.lightGrey} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Weight Units modal */}
            <Modal
                visible={showWeightUnitsModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowWeightUnitsModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowWeightUnitsModal(false)}
                >
                    <View style={styles.menuModalContent}>
                        <View style={styles.menuModalHandle} />
                        <Text style={styles.weightUnitsTitle}>Weight Units</Text>
                        <Text style={styles.weightUnitsSubtitle}>
                            {exerciseName || 'Exercise Preview'}
                        </Text>
                        <ScrollView style={styles.weightUnitsOptions} showsVerticalScrollIndicator={false}>
                            <TouchableOpacity
                                onPress={() => {
                                    setUseDefaultUnit(true);
                                    setWeightUnit('kg');
                                    setShowWeightUnitsModal(false);
                                }}
                                activeOpacity={0.7}
                                style={[styles.weightUnitsOption, useDefaultUnit && styles.weightUnitsOptionSelected]}
                            >
                                <Text
                                    style={[
                                        styles.weightUnitsOptionText,
                                        useDefaultUnit && styles.weightUnitsOptionTextSelected,
                                    ]}
                                >
                                    Default (kg)
                                </Text>
                                {useDefaultUnit && (
                                    <View style={styles.checkCircle}>
                                        <Ionicons
                                            name="checkmark"
                                            size={13}
                                            color={AppColors.black}
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setUseDefaultUnit(false);
                                    setWeightUnit('kg');
                                    setShowWeightUnitsModal(false);
                                }}
                                activeOpacity={0.7}
                                style={[styles.weightUnitsOption, !useDefaultUnit && weightUnit === 'kg' && styles.weightUnitsOptionSelected]}
                            >
                                <Text
                                    style={[
                                        styles.weightUnitsOptionText,
                                        !useDefaultUnit && weightUnit === 'kg' && styles.weightUnitsOptionTextSelected,
                                    ]}
                                >
                                    kg
                                </Text>
                                {!useDefaultUnit && weightUnit === 'kg' && (
                                    <View style={styles.checkCircle}>
                                        <Ionicons
                                            name="checkmark"
                                            size={13}
                                            color={AppColors.black}
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setUseDefaultUnit(false);
                                    setWeightUnit('lbs');
                                    setShowWeightUnitsModal(false);
                                }}
                                activeOpacity={0.7}
                                style={[styles.weightUnitsOption, !useDefaultUnit && weightUnit === 'lbs' && styles.weightUnitsOptionSelected]}
                            >
                                <Text
                                    style={[
                                        styles.weightUnitsOptionText,
                                        !useDefaultUnit && weightUnit === 'lbs' && styles.weightUnitsOptionTextSelected,
                                    ]}
                                >
                                    lbs
                                </Text>
                                {!useDefaultUnit && weightUnit === 'lbs' && (
                                    <View style={styles.checkCircle}>
                                        <Ionicons
                                            name="checkmark"
                                            size={13}
                                            color={AppColors.black}
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Duplicate exercise modal */}
            <Modal
                visible={showDuplicateModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDuplicateModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDuplicateModal(false)}
                >
                    <View style={styles.menuModalContent}>
                        <View style={styles.menuModalHandle} />
                        <Text style={styles.duplicateTitle}>
                            Duplicate "{exerciseName || 'Exercise'}" ?
                        </Text>
                        <View style={styles.duplicateButtonRow}>
                            <TouchableOpacity
                                onPress={() => setShowDuplicateModal(false)}
                                activeOpacity={0.7}
                                style={styles.duplicateButtonCancel}
                            >
                                <Text style={styles.duplicateButtonCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowDuplicateModal(false);
                                    Alert.alert('Success', 'Exercise duplicated ✅');
                                }}
                                activeOpacity={0.7}
                                style={styles.duplicateButtonContinue}
                            >
                                <Text style={styles.duplicateButtonContinueText}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.black,
    },
    contentWrap: {
        flex: 1,
        paddingHorizontal: 14,
        paddingTop: 0,
        paddingBottom: 14,
    },
    topTabBar: {
        backgroundColor: AppColors.black,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
    },
    topTabScene: {
        backgroundColor: AppColors.black,
    },
    topTabIndicator: {
        backgroundColor: AppColors.orange,
        height: 2,
    },
    topTabItem: {
        justifyContent: 'center',
    },
    topTabLabel: {
        fontFamily: 'CalSans',
        fontSize: 16,
        textTransform: 'none',
    },
    tabView: {
        flex: 1,
    },
    summaryScroll: {
        flex: 1,
    },
    summaryContent: {
        paddingTop: 10,
        paddingBottom: 24,
        gap: 8,
    },
    title: {
        color: AppColors.white,
        fontSize: 22,
        fontWeight: '700',
        textTransform: 'capitalize',
        marginTop: 6,
    },
    meta: {
        color: AppColors.lightGrey,
        fontSize: 13,
        textTransform: 'capitalize',
    },
    gifHeroStrip: {
        marginHorizontal: -14,
        backgroundColor: AppColors.white,
        paddingHorizontal: 14,
    },
    gifHeroBox: {
        width: '100%',
        minHeight: 240,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: AppColors.white,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    gifHeroImage: {
        width: '100%',
        height: 260,
        backgroundColor: AppColors.white,
    },
    howToRow: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    howToText: {
        color: AppColors.orange,
        fontSize: 13,
    },
    noDataCard: {
        marginTop: 8,
        height: 150,
        borderRadius: 14,
        backgroundColor: AppColors.darkBg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    noDataText: {
        color: AppColors.lightGrey,
        fontSize: 14,
    },
    metricRow: {
        gap: 8,
        paddingVertical: 6,
        paddingRight: 8,
    },
    metricChip: {
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        backgroundColor: AppColors.darkBg,
    },
    metricChipActive: {
        backgroundColor: AppColors.orange,
        borderColor: AppColors.orange,
    },
    metricChipText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
    },
    metricChipTextActive: {
        color: AppColors.black,
        fontWeight: '700',
    },
    recordsHeader: {
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    recordsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    recordsTitle: {
        color: AppColors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    recordRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A1A',
        paddingVertical: 14,
    },
    recordLabel: {
        color: AppColors.lightGrey,
        fontSize: 15,
    },
    recordValue: {
        color: AppColors.white,
        fontSize: 15,
        fontWeight: '700',
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    gifLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
    },
    statusText: {
        color: AppColors.white,
        fontSize: 14,
        textAlign: 'center',
    },
    emptyTabWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    emptyTabTitle: {
        color: AppColors.white,
        fontSize: 22,
        fontWeight: '700',
    },
    emptyTabText: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 14,
    },
    historyContent: {
        paddingTop: 10,
        paddingBottom: 24,
        gap: 14,
    },
    historyTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    historyTopTitleWrap: {
        flex: 1,
        gap: 4,
    },
    historyTopTitle: {
        color: AppColors.white,
        fontSize: 22,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    historyTopMeta: {
        color: AppColors.lightGrey,
        fontSize: 13,
        textTransform: 'capitalize',
    },
    historySectionTag: {
        color: AppColors.lightGrey,
        fontSize: 12,
        fontWeight: '700',
    },
    historyCard: {
        backgroundColor: AppColors.darkBg,
        borderRadius: 14,
        padding: 14,
        gap: 12,
    },
    historyCardLabel: {
        color: AppColors.lightGrey,
        fontSize: 12,
    },
    historyChartWrap: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 160,
        paddingTop: 8,
    },
    historyChartItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
    },
    historyBar: {
        width: '72%',
        minHeight: 12,
        backgroundColor: AppColors.orange,
        borderRadius: 10,
    },
    historyChartMonth: {
        color: AppColors.lightGrey,
        fontSize: 11,
    },
    historyChartWeight: {
        color: AppColors.white,
        fontSize: 11,
    },
    historySectionHeader: {
        color: AppColors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    historySessionList: {
        gap: 10,
    },
    historySessionRow: {
        backgroundColor: AppColors.darkBg,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    historySessionWeight: {
        color: AppColors.white,
        fontSize: 15,
        fontWeight: '600',
    },
    historySessionDate: {
        color: AppColors.lightGrey,
        fontSize: 12,
        marginTop: 2,
    },
    historyEmptyContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 24,
    },
    historyEmptyCard: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 16,
    },
    historyEmptyTitle: {
        color: AppColors.white,
        fontSize: 18,
        fontWeight: '700',
    },
    historyEmptyText: {
        color: AppColors.lightGrey,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
    historyEmptySubtitle: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 12,
    },
    howToContent: {
        paddingTop: 10,
        paddingBottom: 24,
        gap: 14,
    },
    howToSectionHeader: {
        color: AppColors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    howToStepsList: {
        gap: 10,
    },
    howToStepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: AppColors.darkBg,
        borderRadius: 12,
        padding: 12,
    },
    howToStepBullet: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: AppColors.orange,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    howToStepBulletText: {
        color: AppColors.black,
        fontSize: 12,
        fontWeight: '700',
    },
    howToStepText: {
        flex: 1,
        color: AppColors.white,
        fontSize: 14,
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    howToLogOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.68)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 18,
    },
    howToLogCard: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#181818',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 14,
        padding: 20,
        gap: 12,
    },
    howToLogHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    howToLogTitle: {
        color: AppColors.orange,
        fontSize: 18,
        fontWeight: '700',
    },
    howToLogBody: {
        color: '#E0E0E0',
        fontSize: 14,
        lineHeight: 20,
    },
    howToLogHighlightsWrap: {
        gap: 8,
    },
    howToLogHighlightRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    howToLogBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: AppColors.orange,
        marginTop: 7,
    },
    howToLogHighlightText: {
        flex: 1,
        color: '#E0E0E0',
        fontSize: 13,
        lineHeight: 18,
    },
    howToLogFooter: {
        alignItems: 'flex-end',
        marginTop: 4,
    },
    howToLogOkButton: {
        minWidth: 88,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: AppColors.orange,
        alignItems: 'center',
        justifyContent: 'center',
    },
    howToLogOkButtonText: {
        color: AppColors.black,
        fontSize: 14,
        fontWeight: '700',
    },
    menuModalContent: {
        backgroundColor: '#0B0B0B',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    menuModalHandle: {
        width: 44,
        height: 5,
        backgroundColor: 'rgba(255,120,37,0.9)',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 14,
    },
    mainMenuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    mainMenuOptionLeading: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    mainMenuOptionLeadingText: {
        color: 'rgba(255,255,255,0.78)',
        fontWeight: '700',
        fontSize: 14,
    },
    mainMenuOptionTitle: {
        flex: 1,
        color: 'rgba(255,255,255,0.78)',
        fontSize: 17,
        letterSpacing: 0.2,
    },
    weightUnitsTitle: {
        color: AppColors.white,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    weightUnitsSubtitle: {
        color: '#B0B0B0',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 12,
    },
    weightUnitsOptions: {
        gap: 0,
    },
    weightUnitsOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    weightUnitsOptionSelected: {
        backgroundColor: 'rgba(255,120,37,0.10)',
    },
    weightUnitsOptionText: {
        flex: 1,
        color: 'rgba(255,255,255,0.78)',
        fontSize: 17,
        letterSpacing: 0.2,
    },
    weightUnitsOptionTextSelected: {
        color: AppColors.orange,
        fontWeight: '700',
    },
    checkCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.orange,
    },
    duplicateTitle: {
        color: AppColors.white,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
    },
    duplicateButtonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    duplicateButtonCancel: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#7A7A7A',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    duplicateButtonCancelText: {
        color: AppColors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    duplicateButtonContinue: {
        flex: 1,
        backgroundColor: AppColors.orange,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    duplicateButtonContinueText: {
        color: AppColors.black,
        fontSize: 14,
        fontWeight: '700',
    },
});
