// LocalStorage wrapper for data persistence

const STORAGE_VERSION = '1.0';
const STORAGE_KEYS = {
  TASKS: 'productivity_tasks',
  NOTES: 'productivity_notes',
  GOALS: 'productivity_goals',
  PROGRESS: 'productivity_progress',
  ROUTINES: 'productivity_routines',
  ROUTINE_COMPLETIONS: 'productivity_routine_completions',
  VERSION: 'productivity_version',
};

// Initialize storage with version check
export const initStorage = () => {
  const version = localStorage.getItem(STORAGE_KEYS.VERSION);
  if (!version || version !== STORAGE_VERSION) {
    localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
  }
};

// Generic storage operations
const getFromStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from storage (${key}):`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    return false;
  }
};

// Tasks
export const getTasks = () => getFromStorage(STORAGE_KEYS.TASKS);

export const saveTasks = (tasks) => saveToStorage(STORAGE_KEYS.TASKS, tasks);

export const addTask = (task) => {
  const tasks = getTasks();
  const newTask = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    completed: false,
    ...task,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
};

export const updateTask = (id, updates) => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    saveTasks(tasks);
    return tasks[index];
  }
  return null;
};

export const deleteTask = (id) => {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  saveTasks(filtered);
  return filtered;
};

// Notes
export const getNotes = () => getFromStorage(STORAGE_KEYS.NOTES);

export const saveNotes = (notes) => saveToStorage(STORAGE_KEYS.NOTES, notes);

export const addNote = (note) => {
  const notes = getNotes();
  const newNote = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    ...note,
  };
  notes.push(newNote);
  saveNotes(notes);
  return newNote;
};

export const updateNote = (id, updates) => {
  const notes = getNotes();
  const index = notes.findIndex(n => n.id === id);
  if (index !== -1) {
    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveNotes(notes);
    return notes[index];
  }
  return null;
};

export const deleteNote = (id) => {
  const notes = getNotes();
  const filtered = notes.filter(n => n.id !== id);
  saveNotes(filtered);
  return filtered;
};

// Goals
export const getGoals = () => getFromStorage(STORAGE_KEYS.GOALS);

export const saveGoals = (goals) => saveToStorage(STORAGE_KEYS.GOALS, goals);

export const addGoal = (goal) => {
  const goals = getGoals();
  const newGoal = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    progress: 0,
    milestones: [],
    ...goal,
  };
  goals.push(newGoal);
  saveGoals(goals);
  return newGoal;
};

export const updateGoal = (id, updates) => {
  const goals = getGoals();
  const index = goals.findIndex(g => g.id === id);
  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates };
    saveGoals(goals);
    return goals[index];
  }
  return null;
};

export const deleteGoal = (id) => {
  const goals = getGoals();
  const filtered = goals.filter(g => g.id !== id);
  saveGoals(filtered);
  return filtered;
};

// Progress tracking
export const getProgress = () => getFromStorage(STORAGE_KEYS.PROGRESS);

export const saveProgress = (progress) => saveToStorage(STORAGE_KEYS.PROGRESS, progress);

export const addProgressEntry = (entry) => {
  const progress = getProgress();
  const newEntry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...entry,
  };
  progress.push(newEntry);
  saveProgress(progress);
  return newEntry;
};

// Export/Import
export const exportAllData = () => {
  return {
    version: STORAGE_VERSION,
    exportDate: new Date().toISOString(),
    tasks: getTasks(),
    notes: getNotes(),
    goals: getGoals(),
    progress: getProgress(),
  };
};

export const importAllData = (data) => {
  try {
    if (data.tasks) saveTasks(data.tasks);
    if (data.notes) saveNotes(data.notes);
    if (data.goals) saveGoals(data.goals);
    if (data.progress) saveProgress(data.progress);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Routines
export const getRoutines = () => getFromStorage(STORAGE_KEYS.ROUTINES);

export const saveRoutines = (routines) => saveToStorage(STORAGE_KEYS.ROUTINES, routines);

export const addRoutine = (routine) => {
  const routines = getRoutines();
  const newRoutine = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    active: true,
    ...routine,
  };
  routines.push(newRoutine);
  saveRoutines(routines);
  return newRoutine;
};

export const updateRoutine = (id, updates) => {
  const routines = getRoutines();
  const index = routines.findIndex(r => r.id === id);
  if (index !== -1) {
    routines[index] = { ...routines[index], ...updates };
    saveRoutines(routines);
    return routines[index];
  }
  return null;
};

export const deleteRoutine = (id) => {
  const routines = getRoutines();
  const filtered = routines.filter(r => r.id !== id);
  saveRoutines(filtered);
  return filtered;
};

// Routine Completions (tracks daily completion status)
export const getRoutineCompletions = () => {
  const completions = getFromStorage(STORAGE_KEYS.ROUTINE_COMPLETIONS, {});
  const today = new Date().toISOString().split('T')[0];

  // Return today's completions or empty object
  return completions[today] || {};
};

export const saveRoutineCompletions = (completions) => {
  const allCompletions = getFromStorage(STORAGE_KEYS.ROUTINE_COMPLETIONS, {});
  const today = new Date().toISOString().split('T')[0];

  allCompletions[today] = completions;

  // Clean up old completions (keep last 30 days)
  const dates = Object.keys(allCompletions);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

  dates.forEach(date => {
    if (date < cutoffDate) {
      delete allCompletions[date];
    }
  });

  saveToStorage(STORAGE_KEYS.ROUTINE_COMPLETIONS, allCompletions);
};

export const toggleRoutineCompletion = (routineId) => {
  const completions = getRoutineCompletions();
  completions[routineId] = !completions[routineId];
  saveRoutineCompletions(completions);
  return completions[routineId];
};

export const getRoutineHistory = (routineId, days = 7) => {
  const allCompletions = getFromStorage(STORAGE_KEYS.ROUTINE_COMPLETIONS, {});
  const history = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    history.push({
      date: dateStr,
      completed: allCompletions[dateStr]?.[routineId] || false,
    });
  }

  return history;
};

export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  initStorage();
};
