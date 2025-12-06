import { tasksAPI, notesAPI, goalsAPI, routinesAPI } from '../services/api';
import { getTasks, getNotes, getGoals, getRoutines, clearAllData } from './storage';

export const migrateToCloud = async () => {
    try {
        console.log('🔄 Starting migration to cloud...');

        // Get all localStorage data
        const tasks = getTasks();
        const notes = getNotes();
        const goals = getGoals();
        const routines = getRoutines();

        const stats = {
            tasks: 0,
            notes: 0,
            goals: 0,
            routines: 0,
            errors: [],
        };

        // Migrate tasks
        for (const task of tasks) {
            try {
                const { id, createdAt, ...taskData } = task; // Remove old ID
                await tasksAPI.create(taskData);
                stats.tasks++;
            } catch (error) {
                console.error('Error migrating task:', error);
                stats.errors.push(`Task: ${task.title}`);
            }
        }

        // Migrate notes
        for (const note of notes) {
            try {
                const { id, createdAt, updatedAt, ...noteData } = note;
                await notesAPI.create(noteData);
                stats.notes++;
            } catch (error) {
                console.error('Error migrating note:', error);
                stats.errors.push(`Note: ${note.title}`);
            }
        }

        // Migrate goals
        for (const goal of goals) {
            try {
                const { id, createdAt, updatedAt, ...goalData } = goal;
                await goalsAPI.create(goalData);
                stats.goals++;
            } catch (error) {
                console.error('Error migrating goal:', error);
                stats.errors.push(`Goal: ${goal.title}`);
            }
        }

        // Migrate routines
        for (const routine of routines) {
            try {
                const { id, createdAt, updatedAt, ...routineData } = routine;
                await routinesAPI.create(routineData);
                stats.routines++;
            } catch (error) {
                console.error('Error migrating routine:', error);
                stats.errors.push(`Routine: ${routine.title}`);
            }
        }

        console.log('✅ Migration complete!', stats);
        return stats;
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
};

export const clearLocalData = () => {
    if (window.confirm('⚠️ This will delete all local data. Your cloud data is safe. Continue?')) {
        clearAllData();
        console.log('🗑️ Local data cleared');
        return true;
    }
    return false;
};

export const hasLocalData = () => {
    const tasks = getTasks();
    const notes = getNotes();
    const goals = getGoals();
    const routines = getRoutines();

    return tasks.length > 0 || notes.length > 0 || goals.length > 0 || routines.length > 0;
};
