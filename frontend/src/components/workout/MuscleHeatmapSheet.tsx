import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import Body from '../bodyHighlighter/Body';
import type { ExtendedBodyPart, Slug } from '../bodyHighlighter/types';
import { AppColors } from '../../constants/colors';
import type { ExerciseLog, SetEntry } from '../../types/workout.types';
import exerciseData from '../../constants/exercise-data.json';

type Props = {
  visible: boolean;
  exercises: ExerciseLog[];
  onClose: () => void;
};

const ORANGE_SHADES = ['#FFC48A', '#FFAA5A', '#FF8A2D', '#FF6B00', '#D94E00'] as const;

const toSlug = (raw: string): Slug | null => {
  const k = raw.trim().toLowerCase().replace(/[_]/g, ' ').replace(/\s+/g, ' ');
  const map: Record<string, Slug> = {
    abs: 'abs',
    abdominals: 'abs',
    core: 'abs',
    obliques: 'obliques',
    chest: 'chest',
    pecs: 'chest',
    pectorals: 'chest',
    biceps: 'biceps',
    bicep: 'biceps',
    triceps: 'triceps',
    tricep: 'triceps',
    deltoids: 'deltoids',
    shoulders: 'deltoids',
    traps: 'trapezius',
    trapezius: 'trapezius',
    'upper back': 'upper-back',
    upperback: 'upper-back',
    'lower back': 'lower-back',
    lowerback: 'lower-back',
    glutes: 'gluteal',
    glute: 'gluteal',
    gluteal: 'gluteal',
    hamstrings: 'hamstring',
    hamstring: 'hamstring',
    quads: 'quadriceps',
    quadriceps: 'quadriceps',
    adductors: 'adductors',
    calves: 'calves',
    calf: 'calves',
    forearms: 'forearm',
    forearm: 'forearm',
    neck: 'neck',
  };
  return map[k] ?? null;
};

const setWork = (set: SetEntry): number => {
  const duration = (set as any).durationSeconds;
  if (typeof duration === 'number' && duration > 0) return duration;

  const w = typeof set.weightKg === 'number' ? set.weightKg : 0;
  const r = typeof set.reps === 'number' ? set.reps : 0;
  if (w > 0 && r > 0) return w * r;
  if (r > 0) return r;
  return 0;
};

const getMuscleGroups = (exerciseName: string): string[] => {
  const normalizedName = exerciseName.toLowerCase();
  const exercise = (exerciseData as any[]).find((ex) => String(ex?.name ?? '').toLowerCase() === normalizedName);
  if (!exercise) return [];

  const muscles = (exercise as any).muscle_filters ?? (exercise as any).muscle_group ?? [];
  if (typeof muscles === 'string') return [muscles];
  return Array.isArray(muscles) ? muscles : [];
};

export default function MuscleHeatmapSheet({ visible, exercises, onClose }: Props) {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [side, setSide] = useState<'front' | 'back'>('front');

  const muscleScores = useMemo(() => {
    const scores = new Map<Slug, number>();

    for (const ex of exercises) {
      const muscles = getMuscleGroups(ex.name);
      if (!muscles.length) continue;

      const doneSets = ex.sets.filter((s) => s.done);
      if (!doneSets.length) continue;

      const work = doneSets.reduce((sum, s) => sum + setWork(s), 0);
      if (work <= 0) continue;

      for (const m of muscles) {
        const slug = toSlug(String(m));
        if (!slug) continue;
        scores.set(slug, (scores.get(slug) ?? 0) + work);
      }
    }

    return scores;
  }, [exercises]);

  const bodyData: ExtendedBodyPart[] = useMemo(() => {
    const max = Math.max(0, ...Array.from(muscleScores.values()));
    if (max <= 0) return [];

    const parts: ExtendedBodyPart[] = [];
    for (const [slug, score] of muscleScores.entries()) {
      const ratio = Math.max(0, Math.min(1, score / max));
      const intensity = Math.max(1, Math.min(ORANGE_SHADES.length, Math.ceil(ratio * ORANGE_SHADES.length)));
      parts.push({ slug, intensity });
    }
    return parts;
  }, [muscleScores]);

  const workedList = useMemo(() => {
    const max = Math.max(0, ...Array.from(muscleScores.values()));
    const items = Array.from(muscleScores.entries())
      .map(([slug, score]) => {
        const ratio = max > 0 ? score / max : 0;
        const intensity = Math.max(1, Math.min(ORANGE_SHADES.length, Math.ceil(ratio * ORANGE_SHADES.length)));
        return { slug, score, intensity };
      })
      .sort((a, b) => b.score - a.score);
    return items;
  }, [muscleScores]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={onClose}>
        <BlurView intensity={25} tint="dark" style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Muscle Heatmap</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={AppColors.orange} />
            </Pressable>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.segment}>
              <TouchableOpacity
                style={[styles.segmentBtn, gender === 'male' && styles.segmentBtnActive]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.segmentText, gender === 'male' && styles.segmentTextActive]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, gender === 'female' && styles.segmentBtnActive]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.segmentText, gender === 'female' && styles.segmentTextActive]}>Female</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.segment}>
              <TouchableOpacity
                style={[styles.segmentBtn, side === 'front' && styles.segmentBtnActive]}
                onPress={() => setSide('front')}
              >
                <Text style={[styles.segmentText, side === 'front' && styles.segmentTextActive]}>Front</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, side === 'back' && styles.segmentBtnActive]}
                onPress={() => setSide('back')}
              >
                <Text style={[styles.segmentText, side === 'back' && styles.segmentTextActive]}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bodyWrap}>
            <Body
              gender={gender}
              side={side}
              scale={1}
              colors={ORANGE_SHADES}
              data={bodyData}
              border="rgba(255,255,255,0.12)"
              defaultFill="rgba(255,255,255,0.06)"
              defaultStroke="rgba(255,255,255,0.08)"
              defaultStrokeWidth={1}
            />
          </View>

          <View style={styles.legendRow}>
            <Text style={styles.legendLabel}>Low</Text>
            <View style={styles.legendBar}>
              {ORANGE_SHADES.map((c) => (
                <View key={c} style={[styles.legendSwatch, { backgroundColor: c }]} />
              ))}
            </View>
            <Text style={styles.legendLabel}>High</Text>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
            {workedList.length === 0 ? (
              <Text style={styles.emptyText}>No completed sets yet.</Text>
            ) : (
              workedList.map((it) => (
                <View key={it.slug} style={styles.listItem}>
                  <View style={[styles.dot, { backgroundColor: ORANGE_SHADES[it.intensity - 1] }]} />
                  <Text style={styles.listText}>{it.slug}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </BlurView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 16,
    maxHeight: '90%',
    overflow: 'hidden',
    backgroundColor: AppColors.darkBg,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: AppColors.orange,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: AppColors.orange,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.white,
  },
  segmentTextActive: {
    color: AppColors.black,
  },
  bodyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
    justifyContent: 'center',
  },
  legendLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
  },
  legendBar: {
    flexDirection: 'row',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  legendSwatch: {
    width: 18,
    height: 8,
  },
  list: {
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 18,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  listText: {
    color: AppColors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});

