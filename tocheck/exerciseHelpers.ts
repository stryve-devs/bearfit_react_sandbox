import exerciseData from '../constants/exercise-data.json';

/**
 * Build a fast lookup map (O(1))
 */
const exerciseMap = new Map(
    exerciseData.map(e => [e.name.toLowerCase(), e])
);

/**
 * Returns true if exercise SHOULD use weight
 */
export const isWeightBasedExercise = (name: string): boolean => {
    const exercise = exerciseMap.get(name.toLowerCase());

    if (!exercise) return true; // fallback

    const equipment = exercise.equipment?.toLowerCase();

    return !(
        equipment === 'body weight' ||
        equipment === 'resistance band' ||
        equipment === 'assisted' ||
    equipment === 'stability ball' ||
        equipment === 'band'
    );
};