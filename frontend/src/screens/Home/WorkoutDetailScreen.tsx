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
import { useState } from 'react';

// ─── MOCK POST DATA ───────────────────────────────────────────────────────────
const POSTS: Record<string, {
    title: string;
    desc: string;
    fullDesc: string;
    time: string;
    volume: string;
    records: string;
    bpm: string;
    date: string;
    likes: number;
    comments: { user: string; text: string; time: string }[];
    exercises: { name: string; sets: number; image: string }[];
    gymImage: string;
}> = {
    '1': {
        title: 'Random Upper',
        desc: 'At a mates place and they asked if we could workout',
        fullDesc: 'At a mates place and they asked if we could workout, which worked well! Tiny setup but got the job done 💪',
        date: 'Monday, Mar 9, 2026',
        time: '40min',
        volume: '2,181 kg',
        records: '3',
        bpm: '103',
        likes: 116,
        gymImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
        exercises: [
            { name: 'Bicep Curl (Barbell)',    sets: 3, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&q=80' },
            { name: 'Arnold Press (Dumbbell)', sets: 3, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=100&q=80' },
            { name: 'Bench Press (Dumbbell)',  sets: 3, image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&q=80' },
            { name: 'Lateral Raise',           sets: 3, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=100&q=80' },
        ],
        comments: [
            { user: 'davefergs', text: 'Hell yeah awesome stuff ❤️💪', time: '3w' },
            { user: 'aleksbabic', text: '🔥', time: '3w' },
            { user: 'nicholas_lawlesss', text: 'Smashing it 💯', time: '3w' },
        ],
    },
    '2': {
        title: '5am Club Ceremony Games Sim',
        desc: '5am club at 7am (Happy Easter 🐣) and a short sharp You Go I Go workout.',
        fullDesc: '5am club at 7am (Happy Easter 🐣) and a short sharp You Go I Go workout. Good fun with the crew, love the community vibe 🙌',
        date: 'Thursday, Apr 2, 2026',
        time: '25min',
        volume: '1,450 kg',
        records: '3',
        bpm: '91',
        likes: 84,
        gymImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        exercises: [
            { name: 'Rowing Machine',          sets: 4, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100&q=80' },
            { name: 'Box Jump',                sets: 3, image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=100&q=80' },
            { name: 'Kettlebell Swing',        sets: 3, image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=100&q=80' },
        ],
        comments: [
            { user: 'markyp', text: 'Great session today mate 💪', time: '1d' },
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

// ─── STAT BLOCK ──────────────────────────────────────────────────────────────
const StatBlock = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
        <Text style={styles.statVal}>{value}</Text>
        <Text style={styles.statLbl}>{label}</Text>
    </View>
);

// ─── EXERCISE ROW ─────────────────────────────────────────────────────────────
const ExerciseRow = ({ item, index, isLast }: {
    item: { name: string; sets: number; image: string };
    index: number;
    isLast: boolean;
}) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 60).duration(300)}
            style={animStyle}
        >
            <View style={[styles.exerciseRow, !isLast && styles.exerciseBorder]}>
                <View style={styles.exerciseImgWrapper}>
                    <Image source={{ uri: item.image }} style={styles.exerciseImg} />
                    <LinearGradient
                        colors={['rgba(255,107,53,0.25)', 'transparent']}
                        style={StyleSheet.absoluteFill}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <Text style={styles.exerciseSets}>{item.sets} sets</Text>
                </View>
            </View>
        </Animated.View>
    );
};

// ─── LIKE BUTTON ─────────────────────────────────────────────────────────────
const LikeButton = ({ count }: { count: number }) => {
    const [liked, setLiked] = useState(false);
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const handleLike = () => {
        scale.value = withSpring(1.3, {}, () => { scale.value = withSpring(1); });
        setLiked(p => !p);
    };

    return (
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn} activeOpacity={0.8}>
            <Animated.Text style={[styles.actionIcon, animStyle]}>
                {liked ? '👍' : '👍🏼'}
            </Animated.Text>
            <Text style={[styles.actionCount, liked && { color: AppColors.orange }]}>
                {liked ? count + 1 : count}
            </Text>
        </TouchableOpacity>
    );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function WorkoutDetailScreen() {
    const { postId, title } = useLocalSearchParams<{ postId?: string; title?: string }>();

    const id = postId ?? '1';
    const post = POSTS[id] ?? POSTS['1'];

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.darkBg }}>
            <StatusBar barStyle="light-content" />

            {/* ── BACK BUTTON (fixed) ─────────────────────── */}
            <Animated.View entering={FadeIn.duration(400)} style={styles.headerBar}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <BlurView intensity={40} tint="dark" style={styles.backBlur}>
                        <Text style={styles.backArrow}>←</Text>
                    </BlurView>
                </TouchableOpacity>
                <View style={{ width: 40 }} />
            </Animated.View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* ── GYM IMAGE ───────────────────────────────── */}
                <Animated.View entering={FadeIn.duration(600)}>
                    <Image source={{ uri: post.gymImage }} style={styles.gymImage} />
                    <LinearGradient
                        colors={['transparent', AppColors.darkBg]}
                        style={styles.imgGradient}
                    />
                </Animated.View>

                <View style={{ paddingHorizontal: 16 }}>
                    {/* ── POSTER INFO ─────────────────────────── */}
                    <Animated.View entering={FadeInDown.duration(350)} style={styles.posterRow}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&q=80' }}
                            style={styles.posterAvatar}
                        />
                        <View>
                            <Text style={styles.posterName}>jadewolfe</Text>
                            <Text style={styles.posterDate}>{post.date}</Text>
                        </View>
                    </Animated.View>

                    {/* ── TITLE & DESC ─────────────────────────── */}
                    <Animated.View entering={FadeInDown.delay(60).duration(350)}>
                        <Text style={styles.workoutTitle}>{post.title}</Text>
                        <Text style={styles.workoutDesc}>{post.fullDesc}</Text>
                    </Animated.View>

                    {/* ── STATS ────────────────────────────────── */}
                    <Animated.View entering={FadeInDown.delay(120).duration(350)} style={{ marginBottom: 20 }}>
                        <GlassCard>
                            <StatBlock icon="⏱" label="Time"    value={post.time} />
                            <View style={styles.divider} />
                            <StatBlock icon="🏋️" label="Volume"  value={post.volume} />
                            <View style={styles.divider} />
                            <StatBlock icon="🏅" label="Records" value={post.records} />
                            <View style={styles.divider} />
                            <StatBlock icon="❤️" label="Avg BPM" value={post.bpm} />
                        </GlassCard>
                    </Animated.View>

                    {/* ── EXERCISES ────────────────────────────── */}
                    <Animated.View entering={FadeInDown.delay(180).duration(350)}>
                        <Text style={styles.sectionLabel}>Exercises</Text>
                        <GlassCard style={{ marginBottom: 20 }}>
                            <View style={{ flex: 1 }}>
                                {post.exercises.map((ex, i) => (
                                    <ExerciseRow
                                        key={ex.name}
                                        item={ex}
                                        index={i}
                                        isLast={i === post.exercises.length - 1}
                                    />
                                ))}
                            </View>
                        </GlassCard>
                    </Animated.View>

                    {/* ── ACTIONS ──────────────────────────────── */}
                    <Animated.View entering={FadeInDown.delay(240).duration(350)}>
                        <GlassCard style={{ marginBottom: 20 }}>
                            <LikeButton count={post.likes} />
                            <View style={styles.divider} />
                            <TouchableOpacity style={styles.actionBtn}>
                                <Text style={styles.actionIcon}>💬</Text>
                                <Text style={styles.actionCount}>{post.comments.length}</Text>
                            </TouchableOpacity>
                            <View style={styles.divider} />
                            <TouchableOpacity style={styles.actionBtn}>
                                <Text style={styles.actionIcon}>⬆️</Text>
                                <Text style={styles.actionCount}>Share</Text>
                            </TouchableOpacity>
                        </GlassCard>
                    </Animated.View>

                    {/* ── COMMENTS ─────────────────────────────── */}
                    <Animated.View entering={FadeInDown.delay(300).duration(350)}>
                        <Text style={styles.sectionLabel}>Comments</Text>
                        {post.comments.map((c, i) => (
                            <Animated.View
                                key={i}
                                entering={FadeInDown.delay(320 + i * 60).duration(300)}
                                style={{ marginBottom: 10 }}
                            >
                                <GlassCard>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.commentHeader}>
                                            <Text style={styles.commentUser}>{c.user}</Text>
                                            <Text style={styles.commentTime}>{c.time}</Text>
                                        </View>
                                        <Text style={styles.commentText}>{c.text}</Text>
                                    </View>
                                </GlassCard>
                            </Animated.View>
                        ))}
                    </Animated.View>
                </View>
            </ScrollView>
        </View>
    );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    headerBar: {
        position: 'absolute',
        top: 52,
        left: 16,
        right: 16,
        zIndex: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
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
    gymImage: {
        width: '100%',
        height: 260,
    },
    imgGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    posterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: -10,
        marginBottom: 12,
    },
    posterAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: AppColors.orange,
    },
    posterName: {
        color: AppColors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    posterDate: {
        color: AppColors.grey,
        fontSize: 11,
        marginTop: 1,
    },
    workoutTitle: {
        color: AppColors.white,
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 0.2,
        marginBottom: 8,
    },
    workoutDesc: {
        color: AppColors.grey,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
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
    statVal: {
        color: AppColors.white,
        fontWeight: '700',
        fontSize: 14,
        marginTop: 3,
    },
    statLbl: {
        color: AppColors.grey,
        fontSize: 10,
        marginTop: 1,
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginVertical: 4,
    },
    sectionLabel: {
        color: AppColors.grey,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 14,
    },
    exerciseBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    exerciseImgWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: AppColors.inputBg,
    },
    exerciseImg: {
        width: 48,
        height: 48,
    },
    exerciseName: {
        color: AppColors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    exerciseSets: {
        color: AppColors.grey,
        fontSize: 12,
        marginTop: 3,
    },
    actionBtn: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    actionIcon: {
        fontSize: 20,
    },
    actionCount: {
        color: AppColors.grey,
        fontSize: 12,
        fontWeight: '600',
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentUser: {
        color: AppColors.orange,
        fontWeight: '600',
        fontSize: 13,
    },
    commentTime: {
        color: AppColors.grey,
        fontSize: 11,
    },
    commentText: {
        color: AppColors.white,
        fontSize: 13,
        lineHeight: 18,
    },
});
