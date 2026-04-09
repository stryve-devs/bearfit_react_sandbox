
import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Routine,
  ExerciseLog,
  SetEntry,
  WorkoutContextType,
  Exercise,
  ExerciseTarget,
} from '../types/workout.types';

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentRoutine, setCurrentRoutine] = useState<Routine | null>(null);
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const addExercise = (exercise: Exercise) => {
    const newExerciseLog: ExerciseLog = {
      name: exercise.name,
      sets: [{ weightKg: 0, reps: 0, done: false }],
      restSeconds: 0,
      restRemaining: 0,
      restTimerRef: null,
    };
    setExercises([...exercises, newExerciseLog]);
  };

  const removeExercise = (exerciseIndex: number) => {
    const updatedExercises = exercises.filter((_, index) => index !== exerciseIndex);
    setExercises(updatedExercises);
  };

  const updateExerciseTarget = (
    exerciseIndex: number,
    field: keyof ExerciseTarget,
    value: any
  ) => {
    const updatedExercises = [...exercises];
    // Note: ExerciseLog doesn't have all ExerciseTarget fields, adjust as needed
    if (field === 'restSeconds') {
      updatedExercises[exerciseIndex].restSeconds = value;
    }
    setExercises(updatedExercises);
  };

  const clearWorkout = () => {
    setCurrentRoutine(null);
    setExercises([]);
    setElapsed(0);
  };

  const value: WorkoutContextType = {
    currentRoutine,
    exercises,
    elapsed,
    setCurrentRoutine,
    setExercises,
    setElapsed,
    addExercise,
    removeExercise,
    updateExerciseTarget,
    clearWorkout,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = (): WorkoutContextType => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within WorkoutProvider');
  }
  return context;
};