import React, { useLayoutEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';

const { width } = Dimensions.get('window');

// --- YOUR COLOR PALETTE ---
const orange = '#FF7825';
const lightOrangeBackground = 'rgba(255, 120, 37, 0.08)';
const deepDarkGrey = '#121212';
const white = '#FFFFFF';
const textDim = 'rgba(255, 255, 255, 0.6)';
const borderColor = 'rgba(255, 255, 255, 0.08)';

const programData = {
    title: "Beginner Push/Pull/Legs (Gym Equipment)",
    creator: "Created by Hevy",
    saveButtonText: "Save Program",
    description: "This beginner program has three weekly workouts: push (chest, shoulders, and triceps), pull (back and biceps), and legs (quads, hamstrings, glutes, and calves).",
    stats: [
        { label: "Beginner", icon: "bar-chart" },
        { label: "Gym", icon: "fitness" },
        { label: "Gain Muscle", icon: "body" },
        { label: "3 Routines", icon: "calendar-outline" },
    ],
    routines: [
        {
            name: "Push",
            description: "The first workout of the week focuses on the push muscles of the upper body: the chest, shoulders, and triceps.",
            exercises: [
                { name: "Warm Up", sets: "1 set", image: 'https://images.squarespace-cdn.com/content/v1/5f16428741e33d265d3a516e/1601614742512-H97T1D6FND74X7X0A7D6/Warmup_Icon.png' },
                { name: "Bench Press (Barbell)", sets: "5 sets • 4-15 reps", image: 'https://img.icons8.com/plasticine/2x/bench-press.png' },
                { name: "Shoulder Press (Dumbbell)", sets: "3 sets • 12-15 reps", image: 'https://cdn-icons-png.flaticon.com/512/2503/2503527.png' },
                { name: "Butterfly (Pec Deck)", sets: "3 sets • 15-20 reps", image: 'https://cdn-icons-png.flaticon.com/512/2503/2503517.png' },
                { name: "Lateral Raise (Dumbbell)", sets: "3 sets • 15-20 reps", image: 'https://cdn-icons-png.flaticon.com/512/4721/4721102.png' },
                { name: "Triceps Rope Pushdown", sets: "3 sets • 15-20 reps", image: 'https://cdn-icons-png.flaticon.com/512/2503/2503529.png' },
            ]
        },
        {
            name: "Pull",
            description: "This workout focuses on the upper body muscles involved in pulling motions—the entire back (traps, rhomboids, rear deltoids, lats, and erector spinae) and biceps.",
            exercises: [
                { name: "Warm Up", sets: "1 set", image: 'https://images.squarespace-cdn.com/content/v1/5f16428741e33d265d3a516e/1601614742512-H97T1D6FND74X7X0A7D6/Warmup_Icon.png' },
                { name: "Lat Pulldown (Cable)", sets: "3 sets • 10-12 reps", image: 'https://cdn-icons-png.flaticon.com/512/2503/2503504.png' },
                { name: "Seated Cable Row - V Grip", sets: "3 sets • 12-15 reps", image: 'https://cdn-icons-png.flaticon.com/512/2503/2503509.png' },
                { name: "Shrug (Dumbbell)", sets: "3 sets • 12-15 reps", image: 'https://cdn-icons-png.flaticon.com/512/2503/2503522.png' },
                { name: "Hammer Curl (Dumbbell)", sets: "3 sets • 12-15 reps", image: 'https://cdn-icons-png.flaticon.com/512/2503/2503524.png' },
                { name: "Face Pull", sets: "3 sets • 15-20 reps", image: 'https://cdn-icons-png.flaticon.com/512/2503/2503506.png' },
            ]
        },
        {
            name: "Legs",
            description: "The final workout of the week focuses exclusively on the lower body muscles: the quadriceps, hamstrings, glutes, and calves.",
            exercises: [
                { name: "Warm Up", sets: "1 set", image: 'https://images.squarespace-cdn.com/content/v1/5f16428741e33d265d3a516e/1601614742512-H97T1D6FND74X7X0A7D6/Warmup_Icon.png' },
                { name: "Leg Press (Machine)", sets: "5 sets • 5-12 reps", image: 'https://cdn-icons-png.flaticon.com/512/2503/2503501.png' },
                { name: "Lying Leg Curl (Machine)", sets: "3 sets • 12-15 reps", image: 'https://cdn-icons-png.flaticon.com/512/2503/2503513.png' },
                { name: "Leg Extension (Machine)", sets: "3 sets • 12-15 reps", image: 'https://cdn-icons-png.flaticon.com/512/2503/2503502.png' },
                { name: "Standing Calf Raise", sets: "3 sets • 15-20 reps", image: 'https://cdn-icons-png.flaticon.com/512/2503/2503515.png' },
            ]
        }
    ]
};

export default function ProgramScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Program",
            headerTitleStyle: { color: white, fontWeight: '600', fontSize: 17 },
            headerStyle: {
                backgroundColor: deepDarkGrey,
                elevation: 0, shadowOpacity: 0, borderBottomWidth: 0,
            },
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                    <Ionicons name="arrow-back" size={24} color={orange} />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => { }} style={{ marginRight: 10 }}>
                    <Ionicons name="share-outline" size={24} color={orange} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor={deepDarkGrey} />

            <LinearGradient
                colors={['rgba(255,120,37,0.15)', 'transparent']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.4 }}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.programImageContainer}>
                        <Text style={styles.imageTitlePush}>PUSH</Text>
                        <Text style={styles.imageTitlePull}>PULL</Text>
                        <Text style={styles.imageTitleLegs}>LEGS</Text>
                    </View>
                    <Text style={styles.programTitle}>{programData.title}</Text>
                    <View style={styles.creatorContainer}>
                        <Ionicons name="link-outline" size={16} color={orange} style={{ marginRight: 6 }} />
                        <Text style={styles.creatorText}>{programData.creator}</Text>
                    </View>
                </View>

                {/* 2. Glassmorphism Stats Grid */}
                <View style={styles.statsContainer}>
                    {programData.stats.map((stat, index) => (
                        <View key={index} style={styles.statItem}>
                            <BlurView intensity={15} tint="light" style={styles.statGlassBox}>
                                <Ionicons name={stat.icon as any} size={20} color={orange} />
                            </BlurView>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* 3. Program Description */}
                <Text style={styles.programDescription}>{programData.description}</Text>

                {/* 4. Save Button */}
                <TouchableOpacity style={styles.glassBtnWrapper}>
                    <BlurView intensity={25} tint="light" style={styles.glassBtn}>
                        <Text style={styles.saveBtnText}>{programData.saveButtonText}</Text>
                    </BlurView>
                </TouchableOpacity>

                {/* 5. Routines heading */}
                <Text style={styles.routinesHeading}>Routines</Text>

                {/* 6. Push / Pull / Legs Sections */}
                {programData.routines.map((routine, routineIndex) => (
                    <View key={routineIndex} style={styles.routineSection}>
                        <View style={styles.routineHeader}>
                            <Text style={styles.routineName}>{routine.name}</Text>
                            <TouchableOpacity hitSlop={15}>
                                <Ionicons name="ellipsis-horizontal" size={20} color={white} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.routineDescription}>{routine.description}</Text>

                        {routine.exercises.map((ex, exerciseIndex) => (
                            <TouchableOpacity key={exerciseIndex} activeOpacity={0.8} style={styles.exerciseCardWrapper}>
                                <BlurView intensity={8} tint="light" style={styles.exerciseCard}>
                                    <View style={styles.iconBox}>
                                        <Image source={{ uri: ex.image }} style={styles.exerciseImage} resizeMode="contain" />
                                    </View>

                                    <View style={styles.exerciseInfo}>
                                        <Text style={styles.exerciseName}>{ex.name}</Text>
                                        <Text style={styles.exerciseSets}>{ex.sets}</Text>
                                    </View>
                                </BlurView>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: deepDarkGrey },
    scrollContent: { paddingHorizontal: 16, paddingTop: 10 },
    headerSection: { alignItems: 'center', marginBottom: 25 },
    programImageContainer: {
        width: width * 0.7, height: width * 0.7,
        backgroundColor: white, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
        marginBottom: 20
    },
    imageTitlePush: { fontSize: 32, fontWeight: '900', color: '#1E90FF', letterSpacing: -1 },
    imageTitlePull: { fontSize: 32, fontWeight: '900', color: '#222', marginVertical: -5 },
    imageTitleLegs: { fontSize: 32, fontWeight: '900', color: '#1E90FF' },
    programTitle: { color: white, fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, lineHeight: 24 },
    creatorContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    creatorText: { color: textDim, fontSize: 14 },
    statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    statItem: { width: '48%', flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    statGlassBox: {
        width: 38, height: 38, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: borderColor,
        overflow: 'hidden', marginRight: 10
    },
    statLabel: { color: white, fontSize: 15, fontWeight: '500' },
    programDescription: { color: textDim, fontSize: 14, lineHeight: 20, marginBottom: 25 },
    glassBtnWrapper: { borderRadius: 14, overflow: 'hidden', marginBottom: 30 },
    glassBtn: {
        paddingVertical: 15, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255, 120, 37, 0.1)',
        borderWidth: 1, borderColor: 'rgba(255,120,37,0.2)',
    },
    saveBtnText: { color: white, fontWeight: 'bold', fontSize: 16 },
    routinesHeading: { color: textDim, fontSize: 15, fontWeight: '600', marginBottom: 20, paddingLeft: 2 },
    routineSection: { marginBottom: 35 },
    routineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    routineName: { color: white, fontSize: 19, fontWeight: 'bold' },
    routineDescription: { color: textDim, fontSize: 13, lineHeight: 18, marginBottom: 18, paddingLeft: 1 },
    exerciseCardWrapper: { marginBottom: 10, borderRadius: 16, overflow: 'hidden' },
    exerciseCard: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12, paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.015)',
        borderWidth: 1, borderColor: borderColor,
    },
    iconBox: {
        width: 48, height: 48, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        marginRight: 15,
    },
    exerciseImage: { width: 32, height: 32 },
    exerciseInfo: { flex: 1 },
    exerciseName: { color: white, fontSize: 15, fontWeight: '600' },
    exerciseSets: { color: textDim, fontSize: 13, marginTop: 3 },
});