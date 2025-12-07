# Converting Components to Use MongoDB API

## Components to Update

### ✅ Already Using API
- TaskManager.jsx - DONE

### ⏳ Need to Update
1. **Notebook.jsx** - Uses getNotes, addNote, updateNote, deleteNote
2. **GoalTracker.jsx** - Uses getGoals, addGoal, updateGoal, deleteGoal, getTasks, addTask  
3. **RoutineTracker.jsx** - Uses getRoutines, addRoutine, updateRoutine, deleteRoutine, etc.
4. **ProgressDashboard.jsx** - Uses getTasks, getGoals (read-only)
5. **Reports.jsx** - Uses getTasks, getGoals, getProgress (read-only)

## Update Pattern

For each component:
1. Replace `import { ... } from '../utils/storage'` with `import { ...API } from '../services/api'`
2. Add `loading` state
3. Convert all functions to `async/await`
4. Add error handling with try/catch
5. Update `_id` instead of `id` for MongoDB documents
6. Handle date formatting for MongoDB dates

## Priority Order
1. Notebook (most used)
2. RoutineTracker (user's current issue)
3. GoalTracker
4. ProgressDashboard & Reports (read-only, lower priority)
