// Location: src/api/services/workout.service.ts

import { apiClient } from '../client';
import { Routine, Exercise } from '../../types/workout.types';

export const workoutService = {
    // Exercises
    async getAllExercises(): Promise<Exercise[]> {
        try {
            const response = await apiClient.get('/exercises');
            return response.data;
        } catch (error) {
            console.error('Error fetching exercises:', error);
            throw error;
        }
    },

    async getExercisesByMuscle(muscle: string): Promise<Exercise[]> {
        try {
            const response = await apiClient.get(`/exercises?muscle=${muscle}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching exercises by muscle:', error);
            throw error;
        }
    },

    async getExercisesByEquipment(equipment: string): Promise<Exercise[]> {
        try {
            const response = await apiClient.get(`/exercises?equipment=${equipment}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching exercises by equipment:', error);
            throw error;
        }
    },

    async searchExercises(query: string): Promise<Exercise[]> {
        try {
            const response = await apiClient.get(`/exercises/search?q=${query}`);
            return response.data;
        } catch (error) {
            console.error('Error searching exercises:', error);
            throw error;
        }
    },

    // Routines
    async getAllRoutines(): Promise<Routine[]> {
        try {
            const response = await apiClient.get('/routines');
            return response.data;
        } catch (error) {
            console.error('Error fetching routines:', error);
            throw error;
        }
    },

    async getRoutineById(id: string): Promise<Routine> {
        try {
            const response = await apiClient.get(`/routines/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching routine:', error);
            throw error;
        }
    },

    async createRoutine(routine: Routine): Promise<Routine> {
        try {
            const response = await apiClient.post('/routines', routine);
            return response.data;
        } catch (error) {
            console.error('Error creating routine:', error);
            throw error;
        }
    },

    async updateRoutine(id: string, routine: Routine): Promise<Routine> {
        try {
            const response = await apiClient.put(`/routines/${id}`, routine);
            return response.data;
        } catch (error) {
            console.error('Error updating routine:', error);
            throw error;
        }
    },

    async deleteRoutine(id: string): Promise<void> {
        try {
            await apiClient.delete(`/routines/${id}`);
        } catch (error) {
            console.error('Error deleting routine:', error);
            throw error;
        }
    },

    // Workouts
    async logWorkout(workoutData: any): Promise<any> {
        try {
            const response = await apiClient.post('/workouts', workoutData);
            return response.data;
        } catch (error) {
            console.error('Error logging workout:', error);
            throw error;
        }
    },

    async getWorkoutHistory(): Promise<any[]> {
        try {
            const response = await apiClient.get('/workouts');
            return response.data;
        } catch (error) {
            console.error('Error fetching workout history:', error);
            throw error;
        }
    },
};