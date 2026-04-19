import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
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

    const addTarget = useCallback((target: ExerciseTarget) => {
        setTargets(prev => {
            const exists = prev.some(t => t.name === target.name);
            if (!exists) {
                return [...prev, target];
            }
            return prev;
        });
    }, []);

    const updateTarget = useCallback((index: number, target: ExerciseTarget) => {
        setTargets(prev => {
            const updatedTargets = [...prev];
            updatedTargets[index] = target;
            return updatedTargets;
        });
    }, []);

    const removeTarget = useCallback((index: number) => {
        setTargets(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearRoutine = useCallback(() => {
        setRoutineTitle('');
        setTargets([]);
    }, []);

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