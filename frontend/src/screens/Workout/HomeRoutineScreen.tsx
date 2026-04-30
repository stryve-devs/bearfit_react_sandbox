import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const orange = '#FF7825';
const lightOrange = 'rgba(255, 120, 37, 0.15)';

const routines = [
    {
        title: "Full Body Muscle Builder",
        description: "The only items you will need are a stool or a chair for split squats, a sturdy table or desk for inverted rows, and some resistance bands with a door anchor.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Pike Push-up", sets: "3 sets" },
            { name: "Bulgarian Split Squat", sets: "3 sets" },
            { name: "Push-up", sets: "3 sets" },
            { name: "Inverted Row", sets: "3 sets" },
            { name: "Single Leg Hip Thrust", sets: "3 sets" },
            { name: "Lat Pull-down (Band)", sets: "3 sets" },
            { name: "Hammer Curl (Band)", sets: "2 sets (15–20 reps)" },
            { name: "Bench Dip", sets: "2 sets" },
        ]
    },
    {
        title: "Push-up Routine",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Decline Push-up", sets: "3 sets" },
            { name: "Pike Push-up", sets: "3 sets" },
            { name: "Push-up (Close Grip)", sets: "3 sets" },
            { name: "Push-up", sets: "3 sets" },
            { name: "Incline Push-up", sets: "2 sets" },
        ]
    },
    {
        title: "Upper Body Beginner",
        description: "You will need a pair of adjustable dumbbells and access to a sturdy desk or table for inverted rows.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Push-up", sets: "3 sets" },
            { name: "Inverted Row", sets: "3 sets" },
            { name: "Shoulder Press (Dumbbell)", sets: "3 sets (12–15 reps)" },
            { name: "Bicep Curl (Dumbbell)", sets: "3 sets (15–20 reps)" },
            { name: "Bench Dip", sets: "3 sets" },
        ]
    },
    {
        title: "Home Pull Workout",
        description: "You will need a pull-up bar, resistance bands with handles, and adjustable dumbbells.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Negative Pull-up", sets: "3 sets" },
            { name: "Bent Over (Dumbbell)", sets: "3 sets (10–12 reps)" },
            { name: "Lat Pull-down (Band)", sets: "3 sets (15–20 reps)" },
            { name: "Shrug (Dumbbell)", sets: "3 sets (12–15 reps)" },
            { name: "Bicep Curl (Dumbbell)", sets: "3 sets (15–20 reps)" },
        ]
    },
    {
        title: "No Equipment Lower Body",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Bulgarian Split Squat", sets: "3 sets" },
            { name: "Nordic Hamstring Curls", sets: "3 sets" },
            { name: "Squats (Bodyweight)", sets: "3 sets" },
            { name: "Reverse Lunge", sets: "3 sets" },
        ]
    }
];

export default function HomeRoutineScreen() {
    const router = useRouter();
    const [savedMap, setSavedMap] = useState<{ [key: string]: boolean }>({});
    const [shareVisible, setShareVisible] = useState(false);

    const toggleSave = (title: string) => {
        setSavedMap(prev => ({ ...prev, [title]: !prev[title] }));
    };

    return (
        <View style={styles.mainContainer}>
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
                                style={{ paddingRight: 8 }}
                            >
                                <Ionicons name="ellipsis-horizontal" size={22} color="white" />
                            </TouchableOpacity>
                        </View>

                        {routine.description && (
                            <Text style={styles.description}>{routine.description}</Text>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.glassActionBtnWrapper,
                                {
                                    marginBottom: 12,
                                    marginTop: routine.description ? 0 : 8 // Adds space if description is missing
                                }
                            ]}
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12, // Increased spacing
    },
    sectionTitle: { color: orange, fontSize: 16, fontWeight: 'bold', flex: 1, paddingLeft: 4 },
    description: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 18, marginBottom: 15, paddingHorizontal: 5 },

    glassActionBtnWrapper: { borderRadius: 20, overflow: 'hidden' },
    glassActionBtn: {
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 8
    },
    saveBtnText: { color: orange, fontWeight: '600', fontSize: 15 },
    optionText: { color: orange, fontSize: 15, fontWeight: '700' },

    exerciseCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
    iconBox: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: lightOrange, borderWidth: 1, borderColor: 'rgba(255,120,37,0.2)', marginRight: 12 },
    exerciseInfo: { flex: 1 },
    exerciseName: { color: 'white', fontSize: 15 },
    exerciseSets: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 },

    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    sheetContainer: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 20,
        paddingBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden'
    },
    dragHandle: { width: 40, height: 5, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
});