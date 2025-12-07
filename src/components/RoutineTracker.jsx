import React, { useState, useEffect } from 'react';
import { routinesAPI } from '../services/api';
import { useApp } from '../App';

export default function RoutineTracker() {
    const [routines, setRoutines] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState(null);
    const [selectedRoutine, setSelectedRoutine] = useState(null);
    const [loading, setLoading] = useState(true);
    const { triggerRefresh } = useApp();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        category: 'health',
    });

    useEffect(() => {
        loadRoutines();
    }, []);

    const loadRoutines = async () => {
        try {
            setLoading(true);
            const loadedRoutines = await routinesAPI.getAll();
            setRoutines(loadedRoutines);
        } catch (error) {
            console.error('Error loading routines:', error);
            alert('Failed to load routines. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingRoutine) {
                await routinesAPI.update(editingRoutine._id, formData);
            } else {
                await routinesAPI.create(formData);
            }

            setFormData({ title: '', description: '', startTime: '', endTime: '', category: 'health' });
            setShowForm(false);
            setEditingRoutine(null);
            await loadRoutines();
            triggerRefresh();
        } catch (error) {
            console.error('Error saving routine:', error);
            alert('Failed to save routine. Please try again.');
        }
    };

    const handleEdit = (routine) => {
        setEditingRoutine(routine);
        setFormData({
            title: routine.title,
            description: routine.description || '',
            startTime: routine.startTime || '',
            endTime: routine.endTime || '',
            category: routine.category || 'health',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this routine?')) {
            try {
                await routinesAPI.delete(id);
                await loadRoutines();
                triggerRefresh();
            } catch (error) {
                console.error('Error deleting routine:', error);
                alert('Failed to delete routine. Please try again.');
            }
        }
    };

    const handleToggleComplete = async (routineId) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            await routinesAPI.toggleCompletion(routineId, today);
            await loadRoutines();
            triggerRefresh();
        } catch (error) {
            console.error('Error toggling routine:', error);
            alert('Failed to update routine. Please try again.');
        }
    };

    const handleViewHistory = (routine) => {
        setSelectedRoutine(routine);
    };

    const getCategoryIcon = (category) => {
        const icons = {
            health: '💪',
            work: '💼',
            learning: '📚',
            personal: '🌟',
            fitness: '🏃',
            mindfulness: '🧘',
            other: '📌',
        };
        return icons[category] || icons.other;
    };

    const isCompletedToday = (routine) => {
        const today = new Date().toISOString().split('T')[0];
        return routine.completions && routine.completions.get(today) === true;
    };

    const getStreak = (routine) => {
        if (!routine.completions) return 0;

        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            if (routine.completions.get(dateStr)) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    const getCompletionRate = (routine) => {
        if (!routine.completions) return 0;

        const last30Days = 30;
        let completed = 0;
        const today = new Date();

        for (let i = 0; i < last30Days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            if (routine.completions && routine.completions.get(dateStr)) {
                completed++;
            }
        }

        return Math.round((completed / last30Days) * 100);
    };

    const stats = {
        total: routines.length,
        completedToday: routines.filter(r => isCompletedToday(r)).length,
        pending: routines.filter(r => !isCompletedToday(r)).length,
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">🔄 Routine Tracker</h1>
                <p className="page-description">
                    Build consistent habits and track your daily routines
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="glass-card">
                    <div className="text-muted text-sm">Total Routines</div>
                    <div className="text-xl font-bold gradient-text">{stats.total}</div>
                </div>
                <div className="glass-card">
                    <div className="text-muted text-sm">Completed Today</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--success-400)' }}>{stats.completedToday}</div>
                </div>
                <div className="glass-card">
                    <div className="text-muted text-sm">Pending</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--warning-400)' }}>{stats.pending}</div>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingRoutine(null);
                        setFormData({ title: '', description: '', startTime: '', endTime: '', category: 'health' });
                    }}
                >
                    {showForm ? '✕ Cancel' : '+ New Routine'}
                </button>
            </div>

            {/* Routine Form */}
            {showForm && (
                <div className="glass-card fade-in" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3>{editingRoutine ? 'Edit Routine' : 'Create New Routine'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                Routine Title *
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Morning meditation, Evening workout..."
                                required
                            />
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                Description
                            </label>
                            <textarea
                                className="textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Add routine description..."
                                rows="3"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                            <div>
                                <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    className="input"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    className="input"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                    Category
                                </label>
                                <select
                                    className="select"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="health">Health</option>
                                    <option value="work">Work</option>
                                    <option value="learning">Learning</option>
                                    <option value="personal">Personal</option>
                                    <option value="fitness">Fitness</option>
                                    <option value="mindfulness">Mindfulness</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-sm">
                            <button type="submit" className="btn btn-primary">
                                {editingRoutine ? 'Update Routine' : 'Create Routine'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingRoutine(null);
                                    setFormData({ title: '', description: '', startTime: '', endTime: '', category: 'health' });
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Routine List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {loading ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div className="text-xl gradient-text">Loading routines...</div>
                    </div>
                ) : routines.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🔄</div>
                        <h3>No routines yet</h3>
                        <p className="text-muted">
                            Create your first routine to start building consistent habits!
                        </p>
                    </div>
                ) : (
                    routines.map((routine) => (
                        <div
                            key={routine._id}
                            className="glass-card"
                            style={{
                                borderLeft: isCompletedToday(routine) ? '4px solid var(--success-500)' : '4px solid var(--primary-500)',
                            }}
                        >
                            <div className="flex items-start gap-md">
                                <input
                                    type="checkbox"
                                    checked={isCompletedToday(routine)}
                                    onChange={() => handleToggleComplete(routine._id)}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        marginTop: '4px',
                                        cursor: 'pointer',
                                        accentColor: 'var(--success-500)',
                                    }}
                                />

                                <div style={{ flex: 1 }}>
                                    <div className="flex items-start justify-between gap-md" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                        <div>
                                            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                <span>{getCategoryIcon(routine.category)}</span>
                                                <span>{routine.title}</span>
                                            </h4>
                                            {routine.description && (
                                                <p className="text-sm text-secondary" style={{ margin: 'var(--spacing-xs) 0 0 0' }}>
                                                    {routine.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-sm">
                                            <span className="badge badge-primary">{routine.category}</span>
                                        </div>
                                    </div>

                                    {(routine.startTime || routine.endTime) && (
                                        <div className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                            ⏰ {routine.startTime} - {routine.endTime}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between" style={{ marginTop: 'var(--spacing-md)' }}>
                                        <div className="flex gap-lg">
                                            <div className="text-sm">
                                                <span className="text-muted">Streak:</span>{' '}
                                                <span className="font-bold" style={{ color: 'var(--warning-400)' }}>
                                                    {getStreak(routine)} days 🔥
                                                </span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted">30-day rate:</span>{' '}
                                                <span className="font-bold" style={{ color: 'var(--success-400)' }}>
                                                    {getCompletionRate(routine)}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-sm">
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleEdit(routine)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleDelete(routine._id)}
                                                style={{ color: 'var(--danger-400)' }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
