import React, { useState, useEffect } from 'react';
import {
    getRoutines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    getRoutineCompletions,
    toggleRoutineCompletion,
    getRoutineHistory,
} from '../utils/storage';
import { useApp } from '../App';

export default function RoutineTracker() {
    const [routines, setRoutines] = useState([]);
    const [completions, setCompletions] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState(null);
    const [selectedRoutine, setSelectedRoutine] = useState(null);
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
        loadCompletions();
    }, []);

    const loadRoutines = () => {
        const loadedRoutines = getRoutines();
        setRoutines(loadedRoutines.filter(r => r.active));
    };

    const loadCompletions = () => {
        const todayCompletions = getRoutineCompletions();
        setCompletions(todayCompletions);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingRoutine) {
            updateRoutine(editingRoutine.id, formData);
        } else {
            addRoutine(formData);
        }

        setFormData({ title: '', description: '', startTime: '', endTime: '', category: 'health' });
        setShowForm(false);
        setEditingRoutine(null);
        loadRoutines();
        triggerRefresh();
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

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this routine?')) {
            deleteRoutine(id);
            loadRoutines();
            triggerRefresh();
        }
    };

    const handleToggleComplete = (routineId) => {
        toggleRoutineCompletion(routineId);
        loadCompletions();
        triggerRefresh();
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

    const getCategoryColor = (category) => {
        const colors = {
            health: 'var(--success-500)',
            work: 'var(--primary-500)',
            learning: 'var(--accent-500)',
            personal: 'var(--warning-500)',
            fitness: 'var(--success-400)',
            mindfulness: 'var(--accent-400)',
            other: 'var(--text-muted)',
        };
        return colors[category] || colors.other;
    };

    const stats = {
        total: routines.length,
        completed: Object.values(completions).filter(Boolean).length,
        completionRate: routines.length > 0
            ? Math.round((Object.values(completions).filter(Boolean).length / routines.length) * 100)
            : 0,
    };

    // Group routines by category
    const routinesByCategory = routines.reduce((acc, routine) => {
        const category = routine.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(routine);
        return acc;
    }, {});

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">🔄 Daily Routine Tracker</h1>
                <p className="page-description">
                    Track your daily habits and routines - resets every day
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
                    <div className="text-xl font-bold" style={{ color: 'var(--success-400)' }}>
                        {stats.completed} / {stats.total}
                    </div>
                </div>
                <div className="glass-card">
                    <div className="text-muted text-sm">Completion Rate</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--primary-400)' }}>
                        {stats.completionRate}%
                    </div>
                    <div className="progress mt-sm">
                        <div className="progress-bar" style={{ width: `${stats.completionRate}%` }} />
                    </div>
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
                                placeholder="e.g., Morning Exercise, Read for 30 minutes..."
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
                                placeholder="Add details about this routine..."
                                rows="2"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                            <div>
                                <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    className="input"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    placeholder="e.g., 06:00"
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
                                    placeholder="e.g., 07:00"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                Category
                            </label>
                            <select
                                className="select"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="health">💪 Health</option>
                                <option value="fitness">🏃 Fitness</option>
                                <option value="work">💼 Work</option>
                                <option value="learning">📚 Learning</option>
                                <option value="mindfulness">🧘 Mindfulness</option>
                                <option value="personal">🌟 Personal</option>
                                <option value="other">📌 Other</option>
                            </select>
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

            {/* Routines List */}
            {routines.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🔄</div>
                    <h3>No routines yet</h3>
                    <p className="text-muted">Create your first daily routine to start tracking!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                    {Object.entries(routinesByCategory).map(([category, categoryRoutines]) => (
                        <div key={category}>
                            <h3 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <span>{getCategoryIcon(category)}</span>
                                <span style={{ textTransform: 'capitalize' }}>{category}</span>
                                <span className="badge badge-primary">{categoryRoutines.length}</span>
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
                                {categoryRoutines.map((routine) => (
                                    <div
                                        key={routine.id}
                                        className="glass-card"
                                        style={{
                                            borderLeft: completions[routine.id]
                                                ? '4px solid var(--success-500)'
                                                : '4px solid ' + getCategoryColor(routine.category),
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handleToggleComplete(routine.id)}
                                    >
                                        <div className="flex items-start gap-md">
                                            <input
                                                type="checkbox"
                                                checked={completions[routine.id] || false}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleComplete(routine.id);
                                                }}
                                                style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    marginTop: '2px',
                                                    cursor: 'pointer',
                                                    accentColor: getCategoryColor(routine.category),
                                                }}
                                            />

                                            <div style={{ flex: 1 }}>
                                                <h4 style={{
                                                    margin: '0 0 var(--spacing-xs) 0',
                                                    textDecoration: completions[routine.id] ? 'line-through' : 'none',
                                                    color: completions[routine.id] ? 'var(--text-muted)' : 'var(--text-primary)',
                                                }}>
                                                    {routine.title}
                                                </h4>

                                                {routine.description && (
                                                    <p className="text-sm text-secondary" style={{ margin: '0 0 var(--spacing-sm) 0' }}>
                                                        {routine.description}
                                                    </p>
                                                )}

                                                {(routine.startTime || routine.endTime) && (
                                                    <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                                        <span className="badge badge-primary">
                                                            🕐 {routine.startTime || '--:--'} - {routine.endTime || '--:--'}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewHistory(routine);
                                                        }}
                                                    >
                                                        📊 History
                                                    </button>
                                                    <div className="flex gap-sm">
                                                        <button
                                                            className="btn btn-sm btn-ghost"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(routine);
                                                            }}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-ghost"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(routine.id);
                                                            }}
                                                            style={{ color: 'var(--danger-400)' }}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* History Modal */}
            {selectedRoutine && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'var(--bg-overlay)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: 'var(--spacing-xl)',
                    }}
                    onClick={() => setSelectedRoutine(null)}
                >
                    <div
                        className="glass-card"
                        style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h3 style={{ margin: 0 }}>📊 {selectedRoutine.title} - History</h3>
                            <button className="btn btn-sm btn-ghost" onClick={() => setSelectedRoutine(null)}>
                                ✕
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {getRoutineHistory(selectedRoutine.id, 14).map((day, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between"
                                    style={{
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: day.completed ? '3px solid var(--success-500)' : '3px solid var(--border-default)',
                                    }}
                                >
                                    <div>
                                        <div className="font-medium">
                                            {new Date(day.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <div className="text-sm text-muted">
                                            {day.date === new Date().toISOString().split('T')[0] ? 'Today' : ''}
                                        </div>
                                    </div>
                                    <div>
                                        {day.completed ? (
                                            <span style={{ fontSize: '1.5rem' }}>✅</span>
                                        ) : (
                                            <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>⭕</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                            <div className="text-sm text-muted">Last 14 Days Completion Rate</div>
                            <div className="text-xl font-bold" style={{ color: 'var(--primary-400)' }}>
                                {Math.round(
                                    (getRoutineHistory(selectedRoutine.id, 14).filter(d => d.completed).length / 14) * 100
                                )}%
                            </div>
                            <div className="progress mt-sm">
                                <div
                                    className="progress-bar"
                                    style={{
                                        width: `${(getRoutineHistory(selectedRoutine.id, 14).filter(d => d.completed).length / 14) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
