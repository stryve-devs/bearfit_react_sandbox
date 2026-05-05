import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname, useGlobalSearchParams, useSegments } from 'expo-router';
import { useWorkout } from '@/context/WorkoutContext';
import { AppColors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getExerciseLoggingMode } from '@/constants/exerciseHelpers';
import AlertDialog from '@/components/workout/AlertDialog';

const formatElapsed = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
};

export default function ActiveWorkoutBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const searchParams = useGlobalSearchParams();
  const {
    isWorkoutActive,
    elapsed,
    exercises,
    setExercises,
    clearWorkout,
    runningTimedSet,
    setRunningTimedSet,
  } = useWorkout();
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const timedSetIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLogWorkoutRoute =
    pathname === '/(tabs)/Workout/log' ||
    (Array.isArray(segments) && segments.includes('Workout') && segments[segments.length - 1] === 'log');

  const currentExerciseName = useMemo(() => {
    const firstWithPendingSet = exercises.find((ex) => ex.sets.some((set) => !set.done));
    return firstWithPendingSet?.name || exercises[0]?.name || 'No exercise yet';
  }, [exercises]);

  const goToWorkout = () => {
    router.push('/(tabs)/Workout/log');
  };

  const addSetToCurrent = () => {
    if (!exercises.length) return;
    const updated = [...exercises];
    updated[0].sets.push({ weightKg: 0, reps: 0, done: false });
    setExercises(updated);
  };

  const toggleSetDone = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex].done = !updated[exerciseIndex].sets[setIndex].done;
    setExercises(updated);
  };

  const setWeight = (exerciseIndex: number, setIndex: number, text: string) => {
    const parsed = Number(text.replace(/[^0-9.]/g, ''));
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex].weightKg = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    setExercises(updated);
  };

  const setReps = (exerciseIndex: number, setIndex: number, text: string) => {
    const parsed = Number(text.replace(/[^0-9]/g, ''));
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex].reps = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    setExercises(updated);
  };

  const incrementDuration = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    const current = updated[exerciseIndex].sets[setIndex].durationSeconds || 0;
    updated[exerciseIndex].sets[setIndex].durationSeconds = current + 1;
    setExercises(updated);
  };

  const stopRunningTimedSet = () => {
    if (timedSetIntervalRef.current) {
      clearInterval(timedSetIntervalRef.current);
      timedSetIntervalRef.current = null;
    }
    setRunningTimedSet(null);
  };

  const handleToggleTimedSet = (exerciseIndex: number, setIndex: number) => {
    const target = exercises[exerciseIndex]?.sets?.[setIndex];
    if (!target || target.done) return;

    if (
      runningTimedSet &&
      runningTimedSet.exerciseIndex === exerciseIndex &&
      runningTimedSet.setIndex === setIndex
    ) {
      stopRunningTimedSet();
      return;
    }

    stopRunningTimedSet();
    setRunningTimedSet({ exerciseIndex, setIndex });
    timedSetIntervalRef.current = setInterval(() => {
      incrementDuration(exerciseIndex, setIndex);
    }, 1000);
  };

  useEffect(() => {
    if (!runningTimedSet && timedSetIntervalRef.current) {
      clearInterval(timedSetIntervalRef.current);
      timedSetIntervalRef.current = null;
    }
  }, [runningTimedSet]);

  useEffect(() => {
    return () => {
      if (timedSetIntervalRef.current) clearInterval(timedSetIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isLogWorkoutRoute) setExpanded(false);
  }, [isLogWorkoutRoute]);

  useEffect(() => {
    if (String(searchParams?.quickEditOpen) !== 'true') return;
    if (isLogWorkoutRoute) return;
    setExpanded(true);
    router.setParams({ quickEditOpen: undefined } as any);
  }, [isLogWorkoutRoute, router, searchParams?.quickEditOpen]);

  const formatMMSS = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const addSetToExercise = (exerciseIndex: number) => {
    const updated = [...exercises];
    const mode = getExerciseLoggingMode(updated[exerciseIndex].name);
    updated[exerciseIndex].sets.push({
      weightKg: 0,
      reps: 0,
      durationSeconds: mode === 'timed' ? 0 : undefined,
      done: false,
    });
    setExercises(updated);
  };

  const addExercise = () => {
    setExpanded(false);
    router.push({
      pathname: '/(tabs)/Workout/addexercise',
      params: {
        fromWorkout: 'true',
        fromQuickEdit: 'true',
        returnTo: pathname,
      },
    });
  };

  const requestClearWorkout = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmClearWorkout = () => {
    setShowDeleteConfirm(false);
    setExpanded(false);
    clearWorkout();
  };

  const shouldShowBar =
    isWorkoutActive &&
    exercises.length > 0 &&
    !isLogWorkoutRoute;

  if (!shouldShowBar) return null;

  return (
    <>
      <View style={[styles.wrap, { bottom: insets.bottom + 64 }]}>
        <TouchableOpacity activeOpacity={0.9} onPress={goToWorkout} style={styles.bar}>
          <TouchableOpacity onPress={() => setExpanded(true)} style={styles.iconBtn}>
            <Ionicons name="chevron-up" size={18} color={AppColors.orange} />
          </TouchableOpacity>
          <View style={styles.main}>
            <Text style={styles.time}>Workout Time: {formatElapsed(elapsed)}</Text>
            <Text style={styles.exercise} numberOfLines={1}>{currentExerciseName}</Text>
          </View>
          <TouchableOpacity onPress={requestClearWorkout} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <Modal visible={expanded} transparent animationType="fade" onRequestClose={() => setExpanded(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setExpanded(false)} />
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Quick Workout Edit</Text>
            <TouchableOpacity style={styles.action} onPress={addExercise}>
              <Ionicons name="add-circle-outline" size={18} color={AppColors.orange} />
              <Text style={styles.actionText}>Add Exercise</Text>
            </TouchableOpacity>
            <ScrollView
              style={styles.editorScroll}
              contentContainerStyle={styles.editorScrollContent}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {exercises.map((exercise, exerciseIndex) => {
                const mode = getExerciseLoggingMode(exercise.name);
                return (
                  <View key={`${exercise.name}-${exerciseIndex}`} style={styles.exerciseCard}>
                    <View style={styles.exerciseHead}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                    </View>
                    {mode === 'weight_reps' ? (
                      <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tableHeaderCell, { flex: 0.45, textAlign: 'center' }]}>Set</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 1.25, textAlign: 'center' }]}>Weight</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Reps</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 0.7, textAlign: 'center' }]}>Done</Text>
                      </View>
                    ) : mode === 'timed' ? (
                      <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tableHeaderCell, { flex: 0.45, textAlign: 'center' }]}>Set</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 1.8, textAlign: 'center' }]}>Timer</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 0.7, textAlign: 'center' }]}>Done</Text>
                      </View>
                    ) : (
                      <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tableHeaderCell, { flex: 0.45, textAlign: 'center' }]}>Set</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 1.8, textAlign: 'center' }]}>Reps</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 0.7, textAlign: 'center' }]}>Done</Text>
                      </View>
                    )}
                    {exercise.sets.map((set, setIndex) => (
                      <View key={`${exerciseIndex}-${setIndex}`} style={styles.tableDataRow}>
                        <Text style={[styles.tableCell, { flex: 0.45, textAlign: 'center' }]}>{setIndex + 1}</Text>
                        {mode === 'weight_reps' ? (
                          <>
                            <View style={[styles.tableCellContainer, { flex: 1.25 }]}>
                              <TextInput
                                style={styles.valuePillInput}
                                keyboardType="decimal-pad"
                                value={set.weightKg === 0 ? '' : String(set.weightKg ?? 0)}
                                onChangeText={(v) => setWeight(exerciseIndex, setIndex, v)}
                                placeholderTextColor="#777"
                              />
                            </View>
                            <View style={[styles.tableCellContainer, { flex: 1 }]}>
                              <TextInput
                                style={styles.valuePillInput}
                                keyboardType="number-pad"
                                value={set.reps === 0 ? '' : String(set.reps ?? 0)}
                                onChangeText={(v) => setReps(exerciseIndex, setIndex, v)}
                                placeholderTextColor="#777"
                              />
                            </View>
                          </>
                        ) : mode === 'timed' ? (
                          <View style={[styles.tableCellContainer, { flex: 1.8 }]}>
                            <View style={styles.timerRowPill}>
                              <TouchableOpacity
                                style={styles.timerControlButton}
                                onPress={() => handleToggleTimedSet(exerciseIndex, setIndex)}
                                disabled={set.done}
                              >
                                <Ionicons
                                  name={
                                    runningTimedSet &&
                                    runningTimedSet.exerciseIndex === exerciseIndex &&
                                    runningTimedSet.setIndex === setIndex
                                      ? 'pause'
                                      : 'play'
                                  }
                                  size={14}
                                  color={set.done ? 'rgba(255,255,255,0.35)' : AppColors.orange}
                                />
                              </TouchableOpacity>
                              <Text style={styles.timerPillText}>{formatMMSS(set.durationSeconds || 0)}</Text>
                            </View>
                          </View>
                        ) : (
                          <View style={[styles.tableCellContainer, { flex: 1.8 }]}>
                            <TextInput
                              style={styles.valuePillInput}
                              keyboardType="number-pad"
                              value={set.reps === 0 ? '' : String(set.reps ?? 0)}
                              onChangeText={(v) => setReps(exerciseIndex, setIndex, v)}
                              placeholderTextColor="#777"
                            />
                          </View>
                        )}
                        <View style={[styles.doneCell, { flex: 0.7 }]}>
                          <TouchableOpacity
                            style={[styles.doneBtn, set.done && styles.doneBtnActive]}
                            onPress={() => toggleSetDone(exerciseIndex, setIndex)}
                          >
                            {set.done ? <Ionicons name="checkmark" size={16} color={AppColors.white} /> : null}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                    <View style={styles.setButtonsCompactRow}>
                      <TouchableOpacity style={styles.setCompactBtn} onPress={() => addSetToExercise(exerciseIndex)}>
                        <Text style={styles.setCompactBtnText}>+</Text>
                      </TouchableOpacity>
                      {exercise.sets.length > 1 ? (
                        <TouchableOpacity style={styles.setCompactBtn} onPress={() => {
                          const updated = [...exercises];
                          updated[exerciseIndex].sets.splice(updated[exerciseIndex].sets.length - 1, 1);
                          setExercises(updated);
                        }}>
                          <Text style={styles.setCompactBtnText}>-</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AlertDialog
        visible={showDeleteConfirm}
        title="Delete workout?"
        message="This will remove all exercises from your active workout."
        buttons={[
          { text: 'Cancel', onPress: () => setShowDeleteConfirm(false) },
          { text: 'Delete', style: 'destructive', onPress: handleConfirmClearWorkout },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    zIndex: 9999,
  },
  bar: {
    borderRadius: 24,
    borderWidth: 0,
    backgroundColor: '#151515',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  main: { flex: 1 },
  time: { color: '#fff', fontSize: 12, fontWeight: '700' },
  exercise: { color: '#BBBBBB', fontSize: 12, marginTop: 2 },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  panel: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    maxHeight: '78%',
  },
  panelTitle: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 4 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  actionText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  editorScroll: {
    marginTop: 6,
    maxHeight: 360,
  },
  editorScrollContent: {
    paddingBottom: 8,
    gap: 8,
  },
  exerciseCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    gap: 6,
  },
  exerciseHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  exerciseName: { color: '#fff', fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  tableHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tableHeaderCell: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  tableDataRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  tableCell: { color: '#fff', fontSize: 12, fontWeight: '600' },
  tableCellContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valuePillInput: {
    minWidth: 78,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: 'rgba(255,255,255,0.05)',
    textAlign: 'center',
    padding: 0,
  },
  timerRowPill: {
    minWidth: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timerControlButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,120,37,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,120,37,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerPillText: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  doneBtn: {
    width: 24,
    height: 24,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,120,37,0.35)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  doneBtnActive: {
    backgroundColor: AppColors.orange,
    borderColor: AppColors.orange,
  },
  doneCell: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setButtonsCompactRow: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 4 },
  setCompactBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  setCompactBtnText: { color: AppColors.orange, fontSize: 18, fontWeight: '800', lineHeight: 18 },
});
