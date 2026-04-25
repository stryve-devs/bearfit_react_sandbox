import exerciseData from './exercise-data.json';

// Build a fast lookup map (O(1)) for exercise metadata.
const exerciseMap = new Map(exerciseData.map((e) => [e.name.toLowerCase(), e]));

export type ExerciseLoggingMode = 'weight_reps' | 'reps_only' | 'timed';

const normalize = (v: unknown) => String(v ?? '').trim().toLowerCase();

export const getExerciseLoggingMode = (name: string): ExerciseLoggingMode => {
  const exercise: any = exerciseMap.get(name.toLowerCase());
  if (!exercise) return 'weight_reps';

  const category = normalize(exercise.category);
  const bodyPart = normalize(exercise.body_part);
  const equipment = normalize(exercise.equipment);

  // Timed/cardio style: derive directly from the dataset's cardio categorization.
  // In `exercise-data.json`, cardio items are consistently tagged via category/body_part.
  if (category === 'cardio' || bodyPart === 'cardio') return 'timed';

  // Reps-only (typically bodyweight / assisted / band work).
  const isRepsOnly =
    equipment === 'body weight' ||
    equipment === 'resistance band' ||
    equipment === 'assisted' ||
    equipment === 'stability ball' ||
    equipment === 'band';
  if (isRepsOnly) return 'reps_only';

  return 'weight_reps';
};

/**
 * Returns true if the exercise should use weight input (kg).
 * Falls back to "true" when metadata is missing.
 */
export const isWeightBasedExercise = (name: string): boolean => {
  return getExerciseLoggingMode(name) === 'weight_reps';
};

