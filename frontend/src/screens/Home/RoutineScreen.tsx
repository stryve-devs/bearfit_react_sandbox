import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
    FadeInDown,
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { AppColors } from '../../constants/colors';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// ─── ROUTINE DATA ─────────────────────────────────────────────────────────────
const ROUTINE_DATA: Record<string, {
    title: string;
    icon: string;
    creator: string;
    exercises: { name: string; sets: number; image: string }[];
}> = {
    cardio: {
        title: 'Cardio',
        icon: '🏃‍♀️🤩',
        creator: 'jadewolfe',
        exercises: [
            { name: 'Cycling',              sets: 1, image: 'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=100&q=80' },
            { name: 'Stair Machine (Floors)', sets: 1, image: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=100&q=80' },
            { name: 'Treadmill',            sets: 1, image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=100&q=80' },
        ],
    },
    muaythai: {
        title: 'Muay Thai',
        icon: '🥊',
        creator: 'jadewolfe',
        exercises: [
            { name: 'Heavy Bag Rounds',    sets: 5, image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100&q=80' },
            { name: 'Pad Work',            sets: 3, image: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=100&q=80' },
            { name: 'Shadow Boxing',       sets: 3, image: 'https://images.unsplash.com/photo-1517438984742-1262db08379e?w=100&q=80' },
            { name: 'Skipping Rope',       sets: 4, image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=100&q=80' },
        ],
    },
};

// ─── GLASS CARD ──────────────────────────────────────────────────────────────
const GlassCard = ({ children, style }: any) => (
    <View style={[styles.glassCard, style]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
        <View style={styles.glassInner}>{children}</View>
    </View>
);
// ─── EXERCISE ROW ─────────────────────────────────────────────────────────────
const ExerciseRow = ({ item, index, isLast }: { item: { name: string; sets: number; image: string }; index: number; isLast: boolean }) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 80).duration(350)}
            style={animStyle}
        >
            <TouchableOpacity
                activeOpacity={0.85}
                onPressIn={() => { scale.value = withSpring(0.97); }}
                onPressOut={() => { scale.value = withSpring(1); }}
                onPress={() => router.push('/(tabs)/home/exercise-detail')}
            >
                <View style={[styles.exerciseRow, !isLast && styles.exerciseBorder]}>
                    <View style={styles.exerciseImageWrapper}>
                        <LinearGradient
                            colors={['rgba(255,107,53,0.3)', 'rgba(255,107,53,0.05)']}
                            style={StyleSheet.absoluteFill}
                        />
                        <Image source={{ uri: item.image }} style={styles.exerciseImage} />
                    </View>
                    <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseName}>{item.name}</Text>
                        <Text style={styles.exerciseSets}>{item.sets} {item.sets === 1 ? 'set' : 'sets'}</Text>
                    </View>
                    <View style={styles.chevronWrapper}>
                        <Text style={styles.chevron}>›</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── SAVE BUTTON ─────────────────────────────────────────────────────────────
const SaveButton = ({ onPress }: { onPress: () => void }) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <Animated.View style={[styles.saveWrapper, animStyle]}>
            <TouchableOpacity
                activeOpacity={0.85}
                onPressIn={() => { scale.value = withSpring(0.95); }}
                onPressOut={() => { scale.value = withSpring(1); }}
                onPress={onPress}
            >
                <LinearGradient
                    colors={[AppColors.orange, '#FF9A6C']}
                    style={styles.saveGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={styles.saveText}>Save Routine</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function RoutineDetailScreen() {
    const { routineId, title } = useLocalSearchParams<{ routineId?: string; title?: string }>();

    const id = routineId ?? 'cardio';
    const data = ROUTINE_DATA[id] ?? ROUTINE_DATA['cardio'];

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.darkBg }}>
            <StatusBar barStyle="light-content" />

            {/* ── HEADER BAR ───────────────────────────────── */}
            <Animated.View entering={FadeIn.duration(400)} style={styles.headerBar}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.backBtn}
                >
                    <BlurView intensity={40} tint="dark" style={styles.backBlur}>
                        <Text style={styles.backArrow}>←</Text>
                    </BlurView>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Routine</Text>

                <View style={{ width: 40 }} />
            </Animated.View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            >
                {/* ── ROUTINE TITLE ──────────────────────────── */}
                <Animated.View entering={FadeInDown.duration(400)} style={styles.titleSection}>
                    <Text style={styles.routineTitle}>
                        {data.title} <Text style={{ fontSize: 24 }}>{data.icon}</Text>
                    </Text>

                    <View style={styles.creatorRow}>
                        <View style={styles.creatorDot} />
                        <Text style={styles.creatorText}>Created by </Text>
                        <Text style={[styles.creatorText, { color: AppColors.orange }]}>{data.creator}</Text>
                    </View>
                </Animated.View>

                {/* ── SAVE BUTTON ────────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(80).duration(400)}>
                    <SaveButton onPress={() => { /* handle save */ }} />
                </Animated.View>

                {/* ── WORKOUT LABEL ──────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(140).duration(400)}>
                    <Text style={styles.sectionLabel}>Workout</Text>
                </Animated.View>

                {/* ── EXERCISE LIST ──────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(180).duration(400)}>
                    <GlassCard>
                        <View style={{ flex: 1 }}>
                            {data.exercises.map((ex, i) => (
                                <ExerciseRow
                                    key={ex.name}
                                    item={ex}
                                    index={i}
                                    isLast={i === data.exercises.length - 1}
                                />
                            ))}
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* ── STATS STRIP ────────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: 16 }}>
                    <GlassCard>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <Text style={styles.statsNum}>{data.exercises.length}</Text>
                            <Text style={styles.statsLbl}>Exercises</Text>
                        </View>
                        <View style={styles.stripDivider} />
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <Text style={styles.statsNum}>
                                {data.exercises.reduce((s, e) => s + e.sets, 0)}
                            </Text>
                            <Text style={styles.statsLbl}>Total Sets</Text>
                        </View>
                        <View style={styles.stripDivider} />
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <Text style={styles.statsNum}>~30</Text>
                            <Text style={styles.statsLbl}>Est. Mins</Text>
                        </View>
                    </GlassCard>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    backBtn: {},
    backBlur: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    backArrow: {
        color: AppColors.white,
        fontSize: 20,
    },
    headerTitle: {
        color: AppColors.white,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    titleSection: {
        marginTop: 8,
        marginBottom: 18,
    },
    routineTitle: {
        color: AppColors.white,
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    creatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    creatorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: AppColors.orange,
        marginRight: 7,
    },
    creatorText: {
        color: AppColors.grey,
        fontSize: 13,
    },
    saveWrapper: {
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: AppColors.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
        marginBottom: 24,
    },
    saveGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveText: {
        color: AppColors.white,
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.5,
    },
    sectionLabel: {
        color: AppColors.grey,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    glassCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(45,44,44,0.55)',
    },
    glassInner: {
        padding: 16,
        flexDirection: 'row',
    },
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 14,
    },
    exerciseBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    exerciseImageWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: AppColors.inputBg,
    },
    exerciseImage: {
        width: 50,
        height: 50,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        color: AppColors.orange,
        fontWeight: '600',
        fontSize: 15,
    },
    exerciseSets: {
        color: AppColors.grey,
        fontSize: 12,
        marginTop: 3,
    },
    chevronWrapper: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chevron: {
        color: AppColors.grey,
        fontSize: 20,
        lineHeight: 24,
    },
    stripDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginVertical: 4,
    },
    statsNum: {
        color: AppColors.white,
        fontWeight: '700',
        fontSize: 18,
    },
    statsLbl: {
        color: AppColors.grey,
        fontSize: 11,
        marginTop: 2,
    },
});
