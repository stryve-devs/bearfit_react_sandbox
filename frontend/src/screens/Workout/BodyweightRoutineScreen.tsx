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
const deepDarkGrey = '#121212'; // Consistent solid background color

const bodyweightData = [
    {
        title: "Bodyweight Strength & Stability (Full Body)",
        description: "Aim for at least 10 full range of motion reps on each set. If you struggle, consider easier variations like kneeling push-ups.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Negative Pull-up", sets: "3 sets" },
            { name: "Push-up", sets: "3 sets" },
            { name: "Bulgarian Split Squat", sets: "3 sets" },
            { name: "Single Leg Glute Bridge", sets: "2 sets" },
            { name: "Squat (Bodyweight)", sets: "2 sets" },
            { name: "Plank", sets: "2 sets" },
        ]
    },
    {
        title: "Bodyweight Upper Body",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Pike Push-up", sets: "3 sets" },
            { name: "Negative Pull-up", sets: "3 sets" },
            { name: "Bench Dip", sets: "3 sets" },
            { name: "Superman", sets: "3 sets" },
            { name: "Plank", sets: "2 sets" },
        ]
    },
    {
        title: "Bodyweight Lower Body",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Bulgarian Split Squat", sets: "3 sets" },
            { name: "Nordic Hamstring Curls", sets: "3 sets" },
            { name: "Reverse Lunge", sets: "2 sets" },
            { name: "Glute Bridge", sets: "2 sets" },
            { name: "Single Leg Standing Calf Raise", sets: "2 sets" },
        ]
    },
    {
        title: "Bodyweight Plyometric Workout",
        description: "Ideal for training explosiveness and power. Avoid going to failure to maintain performance.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Burpee", sets: "3 sets" },
            { name: "Jump Squats", sets: "3 sets" },
            { name: "Clap Push-up", sets: "3 sets" },
            { name: "Jumping Lunge", sets: "3 sets" },
        ]
    },
    {
        title: "Bodyweight Core Workout",
        description: "Targets full core including transverse abdominis, obliques and lower back.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Plank", sets: "1 set" },
            { name: "Dead Bug", sets: "1 set" },
            { name: "Side Plank", sets: "1 set" },
            { name: "Single Leg Glute Bridge", sets: "1 set" },
            { name: "Superman", sets: "1 set" },
        ]
    }
];

export default function BodyweightRoutineScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [savedMap, setSavedMap] = useState<{ [key: string]: boolean }>({});
    const [shareVisible, setShareVisible] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Bodyweight Routines",
            headerTitleStyle: {
                color: orange,
                fontWeight: 'bold',
                fontSize: 18
            },
            headerStyle: {
                backgroundColor: deepDarkGrey, // Changed to solid color
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0,
            },
            headerShadowVisible: false,
            headerTitleAlign: 'center',
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
                    <Ionicons name="arrow-back" size={24} color={orange} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

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
                {bodyweightData.map((routine, index) => (
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
                                styles.glassBtnWrapper,
                                { marginBottom: 12, marginTop: routine.description ? 0 : 8 }
                            ]}
                            onPress={() => setSavedMap(prev => ({ ...prev, [routine.title]: !prev[routine.title] }))}
                        >
                            <BlurView intensity={20} tint="light" style={styles.glassBtn}>
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
                        <TouchableOpacity style={styles.glassBtnWrapper} onPress={() => setShareVisible(false)}>
                            <BlurView intensity={25} tint="light" style={styles.glassBtn}>
                                <Ionicons name="share-social-outline" size={20} color={orange} />
                                <Text style={styles.optionText}>Share Routine</Text>
                            </BlurView>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.glassBtnWrapper, { marginTop: 12 }]}
                            onPress={() => setShareVisible(false)}
                        >
                            <BlurView intensity={15} tint="light" style={styles.glassBtn}>
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
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { color: orange, fontSize: 16, fontWeight: 'bold', flex: 1, paddingLeft: 4 },
    description: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 18, marginBottom: 15, paddingHorizontal: 5 },
    glassBtnWrapper: { borderRadius: 20, overflow: 'hidden' },
    glassBtn: { paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 8 },
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