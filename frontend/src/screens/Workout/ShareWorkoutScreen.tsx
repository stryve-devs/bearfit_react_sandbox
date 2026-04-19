import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Share,
    Animated,
    FlatList,
    Dimensions,
    BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AppColors } from '../../constants/colors';
import { SavedWorkout } from '../../types/workout.types';

const { width } = Dimensions.get('window');

const SHARE_OPTIONS = [
    { icon: 'logo-instagram', label: 'Stories', color: '#E1306C' },
    { icon: 'arrow-up-outline', label: 'More', color: AppColors.darkGrey },
    { icon: 'download-outline', label: 'Download', color: AppColors.darkGrey },
    { icon: 'link-outline', label: 'Copy Link', color: AppColors.darkGrey },
    { icon: 'copy-outline', label: 'Copy Text', color: AppColors.darkGrey },
];

export default function ShareWorkoutScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [workout, setWorkout] = useState<SavedWorkout | null>(null);
    const [isFirst, setIsFirst] = useState(false);
    const [currentCard, setCurrentCard] = useState(0);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (params?.workoutData) {
            setWorkout(JSON.parse(params.workoutData as string));
        }

        setIsFirst(params?.isFirst === 'true');

        if (hasAnimated.current) return;
        hasAnimated.current = true;

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    // Disable back navigation
    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => true // Consume the back press, don't navigate
        );

        return () => backHandler.remove();
    }, [navigation]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    const handleShare = async () => {
        if (!workout) return;

        const workoutText =
            `${workout.title}

${formatTime(workout.duration)} • ${workout.volume}kg • ${workout.sets} sets

Tag @arthika`;

        await Share.share({
            message: workoutText,
            title: 'Share Workout',
        });
    };

    const handleDone = () => {
        router.push('/(tabs)/Workout');
    };

    if (!workout) return null;

    // ===================== CARD VARIANTS =====================
    const cardVariants = [
        {
            key: '1',
            render: () => (
                <View style={styles.cardInner}>
                    <Text style={styles.cardTitle}>{workout.title}</Text>

                    <View style={styles.row}>
                        <View style={styles.stat}>
                            <Text style={styles.value}>{formatTime(workout.duration)}</Text>
                            <Text style={styles.label}>Duration</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.value}>{workout.volume} kg</Text>
                            <Text style={styles.label}>Volume</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.value}>{workout.sets}</Text>
                            <Text style={styles.label}>Sets</Text>
                        </View>
                    </View>
                </View>
            ),
        },
        {
            key: '2',
            render: () => (
                <View style={styles.cardInner}>
                    <View style={styles.vertical}>
                        <Text style={styles.value}>{formatTime(workout.duration)}</Text>
                        <Text style={styles.label}>Duration</Text>
                    </View>
                    <View style={styles.vertical}>
                        <Text style={styles.value}>{workout.volume} kg</Text>
                        <Text style={styles.label}>Volume</Text>
                    </View>
                    <View style={styles.vertical}>
                        <Text style={styles.value}>{workout.sets}</Text>
                        <Text style={styles.label}>Sets</Text>
                    </View>
                </View>
            ),
        },
        {
            key: '3',
            render: () => (
                <View style={styles.cardInner}>
                    <View style={styles.gridRow}>
                        <View style={styles.gridItem}>
                            <Text style={styles.value}>{formatTime(workout.duration)}</Text>
                            <Text style={styles.label}>Duration</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.value}>{workout.volume} kg</Text>
                            <Text style={styles.label}>Volume</Text>
                        </View>
                    </View>

                    <View style={styles.gridRow}>
                        <View style={styles.gridItem}>
                            <Text style={styles.value}>{workout.sets}</Text>
                            <Text style={styles.label}>Sets</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.value}>{workout.exercises.length}</Text>
                            <Text style={styles.label}>Exercises</Text>
                        </View>
                    </View>
                </View>
            ),
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>

                {/* HEADER (moved slightly down) */}
                <View style={styles.header}>
                    <Text style={styles.title}>Nice work!</Text>
                    <Text style={styles.subtitle}>
                        {isFirst ? "This is your 1st workout 🎉" : "Keep it going 🔥"}
                    </Text>
                </View>

                {/* CAROUSEL */}
                <View style={styles.carouselWrap}>
                    <FlatList
                        data={cardVariants}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.key}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(
                                e.nativeEvent.contentOffset.x / width
                            );
                            setCurrentCard(index);
                        }}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View style={{ alignItems: 'center' }}>
                                    <BlurView intensity={25} tint="dark" style={styles.blur}>
                                        {item.render()}
                                    </BlurView>
                                </View>
                            </View>
                        )}
                    />

                    {/* INDICATORS */}
                    <View style={styles.indicators}>
                        {cardVariants.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    i === currentCard && styles.dotActive,
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* SHARE */}
                <Text style={styles.shareTitle}>Share workout - Tag @arthika</Text>

                <View style={styles.shareRow}>
                    {SHARE_OPTIONS.map((opt, i) => (
                        <TouchableOpacity key={i} onPress={handleShare} style={styles.shareItem}>
                            <View style={[styles.icon, { backgroundColor: opt.color }]}>
                                <Ionicons name={opt.icon as any} size={22} color="white" />
                            </View>
                            <Text style={styles.shareLabel}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* DONE */}
                <TouchableOpacity style={styles.done} onPress={handleDone}>
                    <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>

            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090909',
        paddingTop: 20, // pushes header down
    },

    header: {
        alignItems: 'center',
        marginBottom: 18,
        marginTop: 28, // pushes "Nice work" down nicely
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
        color: AppColors.white,
    },

    subtitle: {
        fontSize: 16,
        color: AppColors.grey,
        marginTop: 6,
    },

    carouselWrap: {
        height: 260,
        marginTop: 10,
    },

    card: {
        width: width,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },

    blur: {
        width: width - 32,
        height: 220,
        borderRadius: 24,
        padding: 20,
        backgroundColor: AppColors.darkBg,
        overflow: 'hidden',
        justifyContent: 'center',
    },

    cardInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.orange, // ✅ FIXED
        marginBottom: 16,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },

    stat: {
        flex: 1,
        alignItems: 'center',
    },

    vertical: {
        alignItems: 'center',
        marginVertical: 10,
    },

    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginVertical: 8,
    },

    gridItem: {
        flex: 1,
        alignItems: 'center',
    },

    value: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.white,
    },

    label: {
        fontSize: 12,
        color: AppColors.grey,
        marginTop: 4,
    },

    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: AppColors.darkGrey,
        marginHorizontal: 4,
    },

    dotActive: {
        width: 20,
        backgroundColor: AppColors.orange,
    },

    shareTitle: {
        marginTop: 10,
        marginBottom: 10,
        color: AppColors.white,
        textAlign: 'center',
    },

    shareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },

    shareItem: {
        alignItems: 'center',
        flex: 1,
    },

    icon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },

    shareLabel: {
        fontSize: 11,
        color: AppColors.white,
        marginTop: 6,
        textAlign: 'center',
    },

    done: {
        backgroundColor: AppColors.orange,
        marginHorizontal: 16,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },

    doneText: {
        fontWeight: '700',
        color: AppColors.black,
    },
});