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
    externalId?: string | null;
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

export interface SelectedWorkoutMediaAsset {
    id: string;
    uri: string;
    type: 'photo' | 'video';
    durationMs?: number;
}

export interface WorkoutSetPayload {
    setNumber: number;
    weightKg?: number;
    reps?: number;
    isCompleted: boolean;
}

export interface WorkoutExercisePayload {
    name: string;
    externalId?: string | null;
    sets: WorkoutSetPayload[];
}

export interface WorkoutPostMediaPayload {
    url: string;
    type: 'IMAGE' | 'VIDEO';
    order: number;
}

export interface SaveWorkoutPostPayload {
    title: string;
    description?: string;
    visibility: 'private' | 'public' | 'friends';
    durationSeconds: number;
    totalVolume: number;
    totalSets: number;
    createdAt?: string;
    exercises: WorkoutExercisePayload[];
    media: WorkoutPostMediaPayload[];
}

export interface SaveWorkoutPostResponse {
    message: string;
    workoutId: number;
    postId: number;
    isFirstWorkout: boolean;
    createdAt: string;
}

export interface SavedWorkout {
    id: string;
    title: string;
    duration: number;
    volume: number;
    sets: number;
    exercises: ExerciseLog[];
    description: string;
    timestamp: string;
    visibility: 'private' | 'public' | 'friends';
    media?: SelectedWorkoutMediaAsset[];
}
