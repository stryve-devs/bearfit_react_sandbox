export interface Exercise {
    name: string;
    muscle: string;
    equipment: string;
    imageAsset: string;
}

export interface ExerciseTarget {
    name: string;
    sets: number;
    targetWeightKg: number;
    targetReps: number;
    restSeconds: number;
}

export interface Routine {
    title: string;
    targets: ExerciseTarget[];
}

export interface SetEntry {
    weightKg: number;
    reps: number;
    done: boolean;
}

export interface ExerciseLog {
    name: string;
    sets: SetEntry[];
    restSeconds: number;
    restRemaining: number;
    restTimerRef: NodeJS.Timeout | null;
}

export interface WorkoutContextType {
    currentRoutine: Routine | null;
    exercises: ExerciseLog[];
    elapsed: number;
    setCurrentRoutine: (routine: Routine | null) => void;
    setExercises: (exercises: ExerciseLog[]) => void;
    setElapsed: (elapsed: number) => void;
    addExercise: (exercise: Exercise) => void;
    removeExercise: (exerciseIndex: number) => void;
    updateExerciseTarget: (
        exerciseIndex: number,
        field: keyof ExerciseTarget,
        value: any
    ) => void;
    clearWorkout: () => void;
}