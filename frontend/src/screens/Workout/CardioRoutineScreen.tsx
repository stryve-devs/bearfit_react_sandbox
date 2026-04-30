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
const deepDarkGrey = '#121212'; // Solid dark grey to match suspension/travel

const cardioRoutines = [
    {
        title: "Core & Cardio",
        description: "Perform each exercise for a prescribed time or RPE, recover for 30 seconds and move to the next activity. Once you do a set of each, rest for two minutes and repeat for two more rounds. Three sets per exercise total.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Plank", sets: "3 sets" },
            { name: "Push-up", sets: "3 sets" },
            { name: "Russian Twist (Bodyweight)", sets: "3 sets" },
            { name: "Mountain Climber", sets: "3 sets" },
            { name: "Superman", sets: "3 sets" },
            { name: "High Knees", sets: "3 sets" },
        ]
    },
    {
        title: "High-Intensity Blast",
        description: "The goal is to perform each movement for 40 seconds. Take 20 seconds to recover and move on to the next activity. Once you do all four, take two minutes to recover and repeat. Aim for three rounds.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Jumping Jack", sets: "3 sets" },
            { name: "Flutter Kicks", sets: "3 sets" },
            { name: "Frog Jumps", sets: "3 sets" },
            { name: "High Knees Sprint", sets: "3 sets" },
        ]
    },
    {
        title: "Full Body Burn",
        description: "This cardio workout combines endurance and strength-based movements to improve overall athletic capacity, strength endurance and coordination. Perform each exercise for 40 or 60 seconds, rest for 30 seconds, then move to the next.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Burpee", sets: "2 sets" },
            { name: "High Knees", sets: "2 sets" },
            { name: "Jump Squats", sets: "2 sets" },
            { name: "Mountain Climber", sets: "2 sets" },
            { name: "Kneeling Push-up", sets: "2 sets" },
        ]
    },
    {
        title: "Explosive HIIT Workout",
        description: "Perform each movement for 30 seconds, recover for 30 seconds, and move to the next activity. Once you complete all five exercises, recover for two minutes and repeat. Aim for three rounds.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Box Jump", sets: "3 sets" },
            { name: "Clap Push-up", sets: "3 sets" },
            { name: "Single Leg Glute Bridge", sets: "3 sets" },
            { name: "Mountain Climber", sets: "3 sets" },
            { name: "Jumping Lunge", sets: "3 sets" },
        ]
    }
];

export default function CardioRoutineScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [savedMap, setSavedMap] = useState<{ [key: string]: boolean }>({});
    const [shareVisible, setShareVisible] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Cardio & HIIT Routines",
            headerTitleStyle: {
                color: orange,
                fontWeight: 'bold',
                fontSize: 18
            },
            headerStyle: {
                backgroundColor: deepDarkGrey,
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
                {cardioRoutines.map((routine, index) => (
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
                            style={[styles.glassBtnWrapper, { marginBottom: 12 }]}
                            onPress={() => toggleSave(routine.title)}
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
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
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