import axios from 'axios';

// Use environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Flag to check if backend is available
let backendAvailable = true;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000, // 5 second timeout
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if backend is unavailable
        if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
            backendAvailable = false;
            console.warn('⚠️ Backend unavailable, using localStorage mode');
        }

        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Check if backend is available
export const isBackendAvailable = () => backendAvailable;

// Auth API
export const authAPI = {
    register: async (email, password, name) => {
        const response = await api.post('/auth/register', { email, password, name });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    getStoredUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },
};

// Tasks API
export const tasksAPI = {
    getAll: async () => {
        const response = await api.get('/tasks');
        return response.data;
    },

    create: async (task) => {
        const response = await api.post('/tasks', task);
        return response.data;
    },

    update: async (id, updates) => {
        const response = await api.put(`/tasks/${id}`, updates);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    },
};

// Notes API
export const notesAPI = {
    getAll: async () => {
        const response = await api.get('/notes');
        return response.data;
    },

    create: async (note) => {
        const response = await api.post('/notes', note);
        return response.data;
    },

    update: async (id, updates) => {
        const response = await api.put(`/notes/${id}`, updates);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/notes/${id}`);
        return response.data;
    },
};

// Goals API
export const goalsAPI = {
    getAll: async () => {
        const response = await api.get('/goals');
        return response.data;
    },

    create: async (goal) => {
        const response = await api.post('/goals', goal);
        return response.data;
    },

    update: async (id, updates) => {
        const response = await api.put(`/goals/${id}`, updates);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/goals/${id}`);
        return response.data;
    },
};

// Routines API
export const routinesAPI = {
    getAll: async () => {
        const response = await api.get('/routines');
        return response.data;
    },

    create: async (routine) => {
        const response = await api.post('/routines', routine);
        return response.data;
    },

    update: async (id, updates) => {
        const response = await api.put(`/routines/${id}`, updates);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/routines/${id}`);
        return response.data;
    },

    toggleCompletion: async (id, date) => {
        const response = await api.post(`/routines/${id}/toggle/${date}`);
        return response.data;
    },
};

export default api;
