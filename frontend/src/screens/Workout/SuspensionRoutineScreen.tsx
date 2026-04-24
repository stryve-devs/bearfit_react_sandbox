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
const deepDarkBrown = '#121212'; // This matches the solid look in your screenshot

const suspensionData = [
    {
        title: "Full Body TRX Workout",
        description: "Do each rep slowly and with good body control. Focus on quality over quantity. Train close to failure on each set, leaving approximately 2–3 reps in the tank.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Low Row (Suspension)", sets: "3 sets" },
            { name: "Squat (Suspension)", sets: "3 sets" },
            { name: "Chest Fly (Suspension)", sets: "3 sets" },
            { name: "Jackknife (Suspension)", sets: "3 sets" },
            { name: "Glute Bridge", sets: "3 sets" },
            { name: "Tricep Extension (Suspension)", sets: "3 sets" },
            { name: "Bicep Curl (Suspension)", sets: "3 sets" },
        ]
    },
    {
        title: "Upper Body TRX & Bodyweight",
        description: "Do each rep slowly and with good body control. Focus on quality over quantity. Train close to failure on each set, leaving approximately 2–3 reps in the tank.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Low Row (Suspension)", sets: "3 sets" },
            { name: "Push-up", sets: "3 sets" },
            { name: "Front Raise (Suspension)", sets: "3 sets" },
            { name: "Bicep Curl (Suspension)", sets: "3 sets" },
            { name: "Tricep Extension (Suspension)", sets: "3 sets" },
            { name: "Crunch", sets: "3 sets" },
        ]
    },
    {
        title: "Legs & Glutes TRX",
        description: "Do each rep slowly and with good body control. Focus on quality over quantity. Train close to failure on each set, leaving approximately 2–3 reps in the tank.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Squat (Suspension)", sets: "5 sets" },
            { name: "Glute Bridge", sets: "5 sets" },
            { name: "Standing Calf Raise", sets: "4 sets" },
        ]
    },
    {
        title: "Cardio TRX & Bodyweight Circuit",
        description: "Do each movement close to failure, but leave 2–3 reps in the tank. Don't take breaks between activities. Once finished, rest 2–2.5 minutes and repeat.",
        exercises: [
            { name: "Warm-up", sets: "1 set" },
            { name: "Low Row (Suspension)", sets: "2 sets" },
            { name: "Frog Jump", sets: "2 sets" },
            { name: "Front Raise (Suspension)", sets: "2 sets" },
            { name: "Jackknife (Suspension)", sets: "2 sets" },
            { name: "Mountain Climber", sets: "2 sets" },
        ]
    }
];

export default function SuspensionRoutineScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [savedMap, setSavedMap] = useState<{ [key: string]: boolean }>({});
    const [shareVisible, setShareVisible] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Suspension Routines",
            headerTitleStyle: {
                color: orange,
                fontWeight: 'bold',
                fontSize: 18
            },
            headerStyle: {
                backgroundColor: deepDarkBrown, // Solid dark background from screenshot
                elevation: 0,                // Android shadow fix
                shadowOpacity: 0,            // iOS shadow fix
                borderBottomWidth: 0,        // Removes that thin grey line
            },
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
            {/* Set the status bar to match the solid header color */}
            <StatusBar barStyle="light-content" backgroundColor={deepDarkBrown} />

            <LinearGradient
                colors={['rgba(255,120,37,0.12)', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {suspensionData.map((routine, index) => (
                    <View key={index} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{routine.title}</Text>
                            <TouchableOpacity onPress={() => setShareVisible(true)} hitSlop={20}>
                                <Ionicons name="ellipsis-horizontal" size={22} color="white" />
                            </TouchableOpacity>
                        </View>

                        {routine.description && (
                            <Text style={styles.description}>{routine.description}</Text>
                        )}

                        <TouchableOpacity
                            style={[styles.glassBtnWrapper, { marginBottom: 12, marginTop: routine.description ? 0 : 8 }]}
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
                        <TouchableOpacity style={[styles.glassBtnWrapper, { marginTop: 12 }]} onPress={() => setShareVisible(false)}>
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