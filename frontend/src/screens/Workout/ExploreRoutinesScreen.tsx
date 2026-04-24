import React, { useState, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Pressable,
    PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');
const orange = '#FF7825';
const lightOrange = 'rgba(255, 120, 37, 0.15)';

const routineData = [
    { title: "Home", icon: "home" },
    { title: "Travel", icon: "airplane" },
    { title: "Dumbbells", icon: "barbell-outline" },
    { title: "Band", icon: "git-branch" },
    { title: "Cardio", icon: "heart" },
    { title: "Gym", icon: "barbell" },
    { title: "Bodyweight", icon: "body" },
    { title: "Suspension", icon: "repeat" },
];

export default function ExploreRoutinesScreen() {
    const router = useRouter();
    const [showAll, setShowAll] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [level, setLevel] = useState(null);
    const [goal, setGoal] = useState(null);
    const [equipment, setEquipment] = useState(null);

    const translateY = useSharedValue(height);

    const openSheet = () => {
        setShowFilters(true);
        translateY.value = withTiming(0, { duration: 300 });
    };

    const closeSheet = () => {
        translateY.value = withTiming(height, { duration: 300 });
        setTimeout(() => setShowFilters(false), 300);
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
            onPanResponderMove: (_, g) => {
                if (g.dy > 0) translateY.value = g.dy;
            },
            onPanResponderRelease: (_, g) => {
                if (g.dy > 120) closeSheet();
                else translateY.value = withSpring(0);
            },
        })
    ).current;

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const programs = [
        "Beginner Push/Pull/Legs (Gym Equipment)",
        "Intermediate Full Body (Gym Equipment)",
        "Intermediate Push/Pull/Legs (Gym Equipment)",
        "Beginner Full Body (Equipment-Free)",
        "Beginner Full Body (Dumbbells)",
        "Beginner Upper/Lower (Dumbbells)",
        "Beginner Push/Pull/Legs (Dumbbells)",
        "Beginner Full Body (Gym Equipment)",
        "Beginner Upper/Lower (Gym Equipment)",
        "Beginner 5x5",
        "Intermediate Full Body (Equipment-Free)",
        "Intermediate Push/Pull/Legs (Equipment-Free)",
        "Intermediate Full Body (Dumbbells)",
        "Intermediate Upper/Lower (Dumbbells)",
        "Intermediate Push/Pull/Legs (Dumbbells)",
        "Intermediate Upper/Lower (Gym Equipment)",
        "4-Day PHUL (Gym Equipment)",
        "Madcow 5x5",
        "Advanced Full Body (Equipment-Free)",
        "Advanced Full Body (Dumbbells)",
        "Advanced Upper/Lower (Dumbbells)",
        "Advanced Push/Pull/Legs (Dumbbells)",
        "Advanced Full Body (Gym Equipment)",
        "Advanced Push/Pull/Legs (Gym Equipment)",
        "Advanced Upper/Lower (Gym Equipment)",
        "6-Day PHUL (Gym Equipment)",
    ];

    const filteredPrograms = useMemo(() => {
        return programs.filter(p => {
            const matchesLevel = !level || p.includes(level === 'Medium' ? 'Intermediate' : level);
            const matchesEquipment = !equipment ||
                (equipment === "Gym" && p.includes("Gym")) ||
                (equipment === "Dumbbells" && p.includes("Dumbbells")) ||
                (equipment === "None" && p.includes("Free"));
            return matchesLevel && matchesEquipment;
        });
    }, [level, equipment]);

    const displayedPrograms = showAll ? filteredPrograms : filteredPrograms.slice(0, 3);

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <LinearGradient
                colors={['rgba(255,120,37,0.12)', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.row}>
                    <Text style={styles.sectionTitle}>Programs</Text>
                    <TouchableOpacity onPress={openSheet} style={styles.filterBtnContainer}>
                        <BlurView intensity={20} tint="light" style={styles.filterBtnBlur}>
                            <Ionicons name="options-outline" size={18} color="white" />
                            <Text style={styles.filterText}>Filters</Text>
                        </BlurView>
                    </TouchableOpacity>
                </View>

                {displayedPrograms.map((title, i) => (
                    <TouchableOpacity
                        key={i}
                        activeOpacity={0.7}
                        onPress={() => {
                            // CLEANING LOGIC: Removes spaces, brackets, slashes, and dashes
                            const fileName = title
                                .toLowerCase()
                                .replace(/\s+/g, '')
                                .replace(/[()/-]/g, '');

                            router.push(`/Workout/${fileName}`);
                        }}
                    >
                        <BlurView intensity={10} tint="light" style={styles.card}>
                            <View style={styles.cardLeft}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="barbell" size={20} color={orange} />
                                </View>
                                <Text style={styles.cardTitle}>{title}</Text>
                            </View>
                            <Ionicons name="chevron-forward" color="rgba(255,255,255,0.4)" size={18} />
                        </BlurView>
                    </TouchableOpacity>
                ))}

                {filteredPrograms.length > 3 && (
                    <TouchableOpacity onPress={() => setShowAll(!showAll)} style={styles.showMoreWrapper}>
                        <BlurView intensity={20} tint="light" style={styles.showMoreBtn}>
                            <Text style={{ color: orange, fontSize: 15, fontWeight: '500' }}>
                                {showAll ? "Show less programs" : "Show all programs"}
                            </Text>
                        </BlurView>
                    </TouchableOpacity>
                )}

                <Text style={styles.routinesHeader}>Routines</Text>

                <View style={styles.grid}>
                    {routineData.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.routineTouch, i < 2 && { marginTop: 0 }]}
                            activeOpacity={0.7}
                            onPress={() => {
                                const pathName = item.title.toLowerCase().replace(" ", "");
                                router.push(`/Workout/${pathName}routine`);
                            }}
                        >
                            <BlurView intensity={10} tint="light" style={styles.routineCard}>
                                <View style={styles.iconBox}>
                                    <Ionicons name={item.icon} size={18} color={orange} />
                                </View>
                                <Text style={[styles.routineText, { marginLeft: 8 }]}>{item.title}</Text>
                            </BlurView>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {showFilters && (
                <>
                    <Pressable style={styles.overlay} onPress={closeSheet} />
                    <Animated.View style={[styles.sheet, sheetStyle]}>
                        <BlurView intensity={90} tint="dark" style={styles.sheetBlur}>
                            <View style={styles.sheetInner}>
                                <View {...panResponder.panHandlers} style={{ paddingVertical: 10 }}>
                                    <View style={styles.drag} />
                                </View>

                                <Text style={[styles.modalTitle, {color: orange}]}>Filters</Text>

                                <Text style={styles.filterSection}>Level</Text>
                                <View style={styles.filterGrid}>
                                    {[{ label: 'Beginner', val: '1' }, { label: 'Medium', val: '2' }, { label: 'Advanced', val: '3' }].map((item) => (
                                        <TouchableOpacity key={item.label} style={styles.filterTouch} onPress={() => setLevel(level === item.label ? null : item.label)}>
                                            <BlurView intensity={level === item.label ? 40 : 15} tint="light" style={[styles.filterCard, level === item.label && styles.activeBorder]}>
                                                <View style={[styles.levelCircle, {borderColor: orange}]}><Text style={[styles.levelNum, {color: orange}]}>{item.val}</Text></View>
                                                <Text style={styles.filterText2}>{item.label}</Text>
                                            </BlurView>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.filterSection}>Goal</Text>
                                <View style={styles.filterGrid}>
                                    {[{ label: 'Muscle', icon: 'trending-up' }, { label: 'Strength', icon: 'barbell-outline' }, { label: 'Fat Loss', icon: 'flame-outline' }].map((item) => (
                                        <TouchableOpacity key={item.label} style={styles.filterTouch} onPress={() => setGoal(goal === item.label ? null : item.label)}>
                                            <BlurView intensity={goal === item.label ? 40 : 15} tint="light" style={[styles.filterCard, goal === item.label && styles.activeBorder]}>
                                                <Ionicons name={item.icon} size={22} color={orange} />
                                                <Text style={styles.filterText2}>{item.label}</Text>
                                            </BlurView>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.filterSection}>Equipment</Text>
                                <View style={styles.filterGrid}>
                                    {[{ label: 'Gym', icon: 'barbell' }, { label: 'Dumbbells', icon: 'fitness-outline' }, { label: 'None', icon: 'body-outline' }].map((item) => (
                                        <TouchableOpacity key={item.label} style={styles.filterTouch} onPress={() => setEquipment(equipment === item.label ? null : item.label)}>
                                            <BlurView intensity={equipment === item.label ? 40 : 15} tint="light" style={[styles.filterCard, equipment === item.label && styles.activeBorder]}>
                                                <Ionicons name={item.icon} size={22} color={orange} />
                                                <Text style={styles.filterText2}>{item.label}</Text>
                                            </BlurView>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </BlurView>
                    </Animated.View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, paddingTop: 10 },
    sectionTitle: { color: orange, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    routinesHeader: {
        color: orange,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        marginTop: 15,
        marginBottom: 15,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    filterBtnContainer: { borderRadius: 20, overflow: 'hidden' },
    filterBtnBlur: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    filterText: { color: 'white', marginLeft: 6, fontSize: 15 },
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    cardTitle: { color: 'white', flex: 1, fontSize: 15 },
    iconBox: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: lightOrange, borderWidth: 1, borderColor: 'rgba(255,120,37,0.2)' },
    showMoreWrapper: { alignSelf: 'center', paddingVertical: 12 },
    showMoreBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    routineTouch: { width: '48%', marginTop: 12 },
    routineCard: { width: '100%', padding: 14, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
    routineText: { color: 'white', fontSize: 15 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: { position: 'absolute', bottom: 0, width: '100%', height: height * 0.65 },
    sheetBlur: { flex: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
    sheetInner: { flex: 1, padding: 20 },
    drag: { width: 40, height: 5, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10, alignSelf: 'center' },
    modalTitle: { fontSize: 22, textAlign: 'center', marginVertical: 12, fontWeight: '600' },
    filterSection: { color: orange, marginVertical: 10, fontSize: 15, marginLeft: 5, fontWeight: '500' },
    filterGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    filterTouch: { width: '31%' },
    filterCard: { height: 90, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', gap: 6 },
    activeBorder: { borderColor: orange, backgroundColor: 'rgba(255,120,37,0.1)' },
    filterText2: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 13 },
    levelCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    levelNum: { fontSize: 11, fontWeight: 'bold' }
});