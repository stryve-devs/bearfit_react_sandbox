import React, { useState, useLayoutEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';

const orange = '#FF7825';
const lightOrange = 'rgba(255, 120, 37, 0.15)';
const deepDarkGrey = '#121212'; // Solid dark grey header color

const routines = [
    {
        title: "Dumbbell Arms Workout",
        description: "The workout is ideal for newbies. You can add extra sets if you're more advanced.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Bicep Curl (Dumbbell)", sets: "3 sets (8–15 reps)" },
            { name: "Preacher Curl (Dumbbell)", sets: "2 sets (15–20 reps)" },
            { name: "Concentration Curl", sets: "2 sets (15–20 reps)" },
            { name: "Skull Crusher (Dumbbell)", sets: "2 sets (12–15 reps)" },
            { name: "Single Arm Tricep Extension", sets: "2 sets (15–20 reps)" },
            { name: "Tricep Kickback (Dumbbell)", sets: "2 sets (15–20 reps)" },
        ]
    },
    {
        title: "Dumbbell Upper Body Focus",
        description: "This workout has moderate volume and is ideal for beginners/early intermediate level trainees.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Incline Bench Press (Dumbbell)", sets: "4 sets (10–12 reps)" },
            { name: "Dumbbell Row", sets: "4 sets (10–12 reps)" },
            { name: "Overhead Press (Dumbbells)", sets: "3 sets (12–15 reps)" },
            { name: "Bent Over Row (Dumbbell)", sets: "3 sets (12–15 reps)" },
            { name: "Lateral Raise (Dumbbells)", sets: "3 sets (12–15 reps)" },
            { name: "Hammer Curl (Dumbbell)", sets: "2 sets (15–20 reps)" },
        ]
    },
    {
        title: "Full Body Mass Builder",
        description: "None of the exercises require more than a pair of dumbbells. Ideal for home workouts.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Floor Press (Dumbbells)", sets: "4 sets (10–12 reps)" },
            { name: "Bulgarian Split Squat", sets: "4 sets (12–15 reps)" },
            { name: "Bent Over Row (Dumbbells)", sets: "3 sets (12–15 reps)" },
            { name: "Shoulder Press (Dumbbells)", sets: "3 sets (12–15 reps)" },
            { name: "Single Leg Hip Thrust", sets: "3 sets (12–15 reps)" },
            { name: "Bicep Curl (Dumbbells)", sets: "2 sets (15–20 reps)" },
            { name: "Tricep Extension (Dumbbells)", sets: "2 sets (15–20 reps)" },
        ]
    },
    {
        title: "Lower Body And Glutes",
        description: "This workout has moderate volume and is ideal for intermediate-level lifters.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Bulgarian Split Squat", sets: "4 sets (12–15 reps)" },
            { name: "Romanian Deadlift (DB)", sets: "3 sets (10–12 reps)" },
            { name: "Split Squat (Dumbbell)", sets: "3 sets (12–15 reps)" },
            { name: "Standing Calf Raise (DB)", sets: "3 sets (15–20 reps)" },
        ]
    },
    {
        title: "Dumbbell HIIT Session",
        description: "Metabolic conditioning. 40s work / 20s rest. 3 total rounds.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Renegade Row (DB)", sets: "3 sets" },
            { name: "Lunge (Dumbbell)", sets: "3 sets" },
            { name: "Bent Over Row (DB)", sets: "3 sets" },
            { name: "Frog Pumps (DB)", sets: "3 sets" },
            { name: "Dumbbell Snatch", sets: "3 sets" },
        ]
    }
];

export default function DumbbellsRoutineScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [savedMap, setSavedMap] = useState<{ [key: string]: boolean }>({});
    const [shareVisible, setShareVisible] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Dumbbell Routines",
            headerTitleStyle: {
                color: orange,
                fontWeight: 'bold',
                fontSize: 18
            },
            headerStyle: {
                backgroundColor: deepDarkGrey, // Solid background
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0,
            },
            headerShadowVisible: false,
            headerTitleAlign: 'center',
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ marginLeft: 15 }}
                >
                    <Ionicons name="arrow-back" size={24} color={orange} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const toggleSave = (title: string) => {
        setSavedMap(prev => ({ ...prev, [title]: !prev[title] }));
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor={deepDarkGrey} />

            <LinearGradient
                colors={['rgba(255,120,37,0.12)', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {routines.map((routine, index) => (
                    <View key={index} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{routine.title}</Text>
                            <TouchableOpacity
                                onPress={() => setShareVisible(true)}
                                hitSlop={20}
                                style={{ paddingRight: 16 }}
                            >
                                <Ionicons name="ellipsis-horizontal" size={22} color="white" />
                            </TouchableOpacity>
                        </View>

                        {routine.description && (
                            <Text style={styles.description}>{routine.description}</Text>
                        )}

                        <TouchableOpacity
                            style={[styles.glassActionBtnWrapper, { marginBottom: 12 }]}
                            onPress={() => toggleSave(routine.title)}
                        >
                            <BlurView intensity={20} tint="light" style={styles.glassActionBtn}>
                                <Text style={styles.saveBtnText}>
                                    {savedMap[routine.title] ? "Saved" : "Save Routine"}
                                </Text>
                            </BlurView>
                        </TouchableOpacity>

                        {routine.exercises.map((ex, i) => (
                            <TouchableOpacity
                                key={i}
                                activeOpacity={0.7}
                                onPress={() => router.push({ pathname: "/empty-page", params: { title: ex.name } })}
                            >
                                <BlurView intensity={10} tint="light" style={styles.exerciseCard}>
                                    <View style={styles.iconBox}>
                                        <Ionicons name="barbell" size={20} color={orange} />
                                    </View>
                                    <View style={styles.exerciseInfo}>
                                        <Text style={styles.exerciseName}>{ex.name}</Text>
                                        <Text style={styles.exerciseSets}>{ex.sets}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
                                </BlurView>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal visible={shareVisible} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShareVisible(false)}>
                    <BlurView intensity={90} tint="dark" style={styles.sheetContainer}>
                        <View style={styles.dragHandle} />
                        <TouchableOpacity style={styles.glassActionBtnWrapper} onPress={() => setShareVisible(false)}>
                            <BlurView intensity={25} tint="light" style={styles.glassActionBtn}>
                                <Ionicons name="share-social-outline" size={20} color={orange} />
                                <Text style={styles.optionText}>Share Routine</Text>
                            </BlurView>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.glassActionBtnWrapper, { marginTop: 12 }]} onPress={() => setShareVisible(false)}>
                            <BlurView intensity={15} tint="light" style={styles.glassActionBtn}>
                                <Text style={{ color: 'white', fontWeight: '600' }}>Cancel</Text>
                            </BlurView>
                        </TouchableOpacity>
                    </BlurView>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#000' },
    scrollContent: { padding: 16, paddingTop: 10 },
    section: { marginBottom: 30 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    sectionTitle: { color: orange, fontSize: 16, fontWeight: 'bold', flex: 1, paddingLeft: 4 },
    description: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 18, marginBottom: 15, paddingHorizontal: 5 },
    glassActionBtnWrapper: { borderRadius: 20, overflow: 'hidden' },
    glassActionBtn: { paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 8 },
    saveBtnText: { color: orange, fontWeight: '600', fontSize: 15 },
    optionText: { color: orange, fontSize: 15, fontWeight: '700' },
    exerciseCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
    iconBox: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: lightOrange, borderWidth: 1, borderColor: 'rgba(255,120,37,0.2)', marginRight: 12 },
    exerciseInfo: { flex: 1 },
    exerciseName: { color: 'white', fontSize: 15 },
    exerciseSets: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    sheetContainer: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
    dragHandle: { width: 40, height: 5, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
});