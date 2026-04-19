import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Share,
    Animated,
    FlatList,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AppColors } from '../../constants/colors';

const { width } = Dimensions.get('window');

type ExerciseShareData = {
    exerciseId?: string;
    exerciseName: string;
    bodyPart: string;
    equipment: string;
    weightUnit: 'kg' | 'lbs';
    records: {
        heaviest: string;
        oneRepMax: string;
        bestSetVol: string;
        sessionVol: string;
    };
};

const SHARE_OPTIONS = [
    { icon: 'logo-instagram', label: 'Stories', color: '#E1306C' },
    { icon: 'arrow-up-outline', label: 'More', color: AppColors.darkGrey },
    { icon: 'download-outline', label: 'Download', color: AppColors.darkGrey },
    { icon: 'link-outline', label: 'Copy Link', color: AppColors.darkGrey },
    { icon: 'copy-outline', label: 'Copy Text', color: AppColors.darkGrey },
];

function StatTile({
    icon,
    label,
    value,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.statTile}>
            <View style={styles.statIconWrap}>
                <Ionicons name={icon} size={15} color={AppColors.orange} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

export default function ShareExerciseScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [currentCard, setCurrentCard] = useState(0);
    const [shareData, setShareData] = useState<ExerciseShareData | null>(null);

    useEffect(() => {
        if (params?.exerciseShareData && typeof params.exerciseShareData === 'string') {
            try {
                setShareData(JSON.parse(params.exerciseShareData));
            } catch {
                setShareData(null);
            }
        }

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 550,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, params?.exerciseShareData]);

    const handleShare = async () => {
        if (!shareData) return;

        const shareText = `${shareData.exerciseName}\n\n` +
            `Heaviest: ${shareData.records.heaviest}\n` +
            `Best 1RM: ${shareData.records.oneRepMax}\n` +
            `Best Set Volume: ${shareData.records.bestSetVol}\n` +
            `Session Volume: ${shareData.records.sessionVol}\n\n` +
            `Equipment: ${shareData.equipment}\n` +
            `@bearfit`;

        await Share.share({
            message: shareText,
            title: 'Share Exercise Stats',
        });
    };

    const handleDone = () => {
        router.back();
    };

    if (!shareData) return null;

    const cardVariants = [
        {
            key: 'overview',
            render: () => (
                <View style={styles.cardInner}>
                    <Text style={styles.cardTitle}>{shareData.exerciseName}</Text>

                    <View style={styles.tileRow}>
                        <StatTile icon="barbell-outline" label="Heaviest" value={shareData.records.heaviest} />
                        <StatTile icon="trophy-outline" label="Best 1RM" value={shareData.records.oneRepMax} />
                    </View>
                    <View style={styles.tileRow}>
                        <StatTile icon="cube-outline" label="Set Volume" value={shareData.records.bestSetVol} />
                        <StatTile icon="stats-chart-outline" label="Session Vol" value={shareData.records.sessionVol} />
                    </View>
                </View>
            ),
        },
        {
            key: 'identity',
            render: () => (
                <View style={styles.cardInner}>
                    <View style={styles.heroIconWrap}>
                        <Ionicons name="fitness-outline" size={34} color={AppColors.orange} />
                    </View>

                    <Text style={styles.identityTitle}>{shareData.exerciseName}</Text>
                    <Text style={styles.identityMeta}>Track your progress every session</Text>

                    <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                            <Ionicons name="construct-outline" size={14} color={AppColors.orange} />
                            <Text style={styles.badgeText}>{shareData.equipment}</Text>
                        </View>
                        <View style={styles.badge}>
                            <Ionicons name="scale-outline" size={14} color={AppColors.orange} />
                            <Text style={styles.badgeText}>Unit: {shareData.weightUnit}</Text>
                        </View>
                    </View>
                </View>
            ),
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
                <View style={styles.carouselWrap}>
                    <FlatList
                        data={cardVariants}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.key}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setCurrentCard(index);
                        }}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View style={{ alignItems: 'center' }}>
                                    <BlurView intensity={25} tint="dark" style={styles.blur}>
                                        {item.render()}
                                        <Text style={styles.brandTag}>@bearfit</Text>
                                    </BlurView>
                                </View>
                            </View>
                        )}
                    />

                    <View style={styles.indicators}>
                        {cardVariants.map((_, i) => (
                            <View
                                key={i}
                                style={[styles.dot, i === currentCard && styles.dotActive]}
                            />
                        ))}
                    </View>
                </View>

                <Text style={styles.shareTitle}>Share exercise stats - Tag @bearfit</Text>

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
        paddingTop: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 18,
        marginTop: 28,
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
        flex: 1,
        marginTop: 4,
    },
    card: {
        width,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    blur: {
        width: width - 32,
        height: 400,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 28,
        backgroundColor: AppColors.darkBg,
        overflow: 'hidden',
        justifyContent: 'flex-start',
    },
    cardInner: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: AppColors.orange,
        marginBottom: 16,
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    cardSubtitle: {
        fontSize: 13,
        color: AppColors.lightGrey,
        marginBottom: 18,
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    tileRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    statTile: {
        width: (width - 86) / 2,
        minHeight: 96,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 10,
    },
    statIconWrap: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(255,120,37,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    statValue: {
        color: AppColors.white,
        fontWeight: '700',
        fontSize: 13,
        textAlign: 'center',
    },
    statLabel: {
        color: AppColors.grey,
        fontSize: 11,
        marginTop: 3,
        textAlign: 'center',
    },
    heroIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 1,
        borderColor: 'rgba(255,120,37,0.28)',
        backgroundColor: 'rgba(255,120,37,0.09)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    identityTitle: {
        color: AppColors.white,
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    identityMeta: {
        color: AppColors.grey,
        fontSize: 13,
        marginTop: 8,
        marginBottom: 20,
    },
    badgeRow: {
        width: '100%',
        gap: 10,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    badgeText: {
        color: AppColors.lightGrey,
        fontSize: 13,
        textTransform: 'capitalize',
    },
    brandTag: {
        position: 'absolute',
        right: 12,
        bottom: 4,
        color: AppColors.orange,
        fontSize: 11,
        fontWeight: '600',
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
        marginTop: 4,
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

