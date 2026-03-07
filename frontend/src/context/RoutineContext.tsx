import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ExerciseTarget } from '../types/workout.types';

interface RoutineContextType {
    routineTitle: string;
    setRoutineTitle: (title: string) => void;
    targets: ExerciseTarget[];
    addTarget: (target: ExerciseTarget) => void;
    updateTarget: (index: number, target: ExerciseTarget) => void;
    removeTarget: (index: number) => void;
    clearRoutine: () => void;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export function RoutineProvider({ children }: { children: ReactNode }) {
    const [routineTitle, setRoutineTitle] = useState('');
    const [targets, setTargets] = useState<ExerciseTarget[]>([]);

    const addTarget = (target: ExerciseTarget) => {
        // Check if exercise already exists
        const exists = targets.some(t => t.name === target.name);
        if (!exists) {
            setTargets([...targets, target]);
        }
    };

    const updateTarget = (index: number, target: ExerciseTarget) => {
        const updatedTargets = [...targets];
        updatedTargets[index] = target;
        setTargets(updatedTargets);
    };

    const removeTarget = (index: number) => {
        setTargets(targets.filter((_, i) => i !== index));
    };

    const clearRoutine = () => {
        setRoutineTitle('');
        setTargets([]);
    };

    return (
        <RoutineContext.Provider
            value={{
                routineTitle,
                setRoutineTitle,
                targets,
                addTarget,
                updateTarget,
                removeTarget,
                clearRoutine,
            }}
        >
            {children}
        </RoutineContext.Provider>
    );
}

export function useRoutine() {
    const context = useContext(RoutineContext);
    if (context === undefined) {
        throw new Error('useRoutine must be used within RoutineProvider');
    }
    return context;
}