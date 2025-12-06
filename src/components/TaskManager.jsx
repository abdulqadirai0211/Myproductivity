import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import { formatSmartDate, getDeadlineStatus, getDaysUntil } from '../utils/dateUtils';
import { useApp } from '../App';

export default function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all'); // all, active, completed
    const [sortBy, setSortBy] = useState('deadline'); // deadline, created
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const { triggerRefresh } = useApp();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
    });

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const loadedTasks = await tasksAPI.getAll();
            setTasks(loadedTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            alert('Failed to load tasks. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingTask) {
                await tasksAPI.update(editingTask._id, formData);
            } else {
                await tasksAPI.create(formData);
            }

            setFormData({ title: '', description: '', deadline: '', priority: 'medium' });
            setShowForm(false);
            setEditingTask(null);
            await loadTasks();
            triggerRefresh();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Failed to save task. Please try again.');
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            deadline: task.deadline ? task.deadline.split('T')[0] : '',
            priority: task.priority || 'medium',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await tasksAPI.delete(id);
                await loadTasks();
                triggerRefresh();
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task. Please try again.');
            }
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            await tasksAPI.update(task._id, { completed: !task.completed });
            await loadTasks();
            triggerRefresh();
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task. Please try again.');
        }
    };

    const getFilteredTasks = () => {
        let filtered = [...tasks];

        // Apply filter
        if (filter === 'active') {
            filtered = filtered.filter(t => !t.completed);
        } else if (filter === 'completed') {
            filtered = filtered.filter(t => t.completed);
        }

        // Apply sort
        if (sortBy === 'deadline') {
            filtered.sort((a, b) => {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            });
        } else {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return filtered;
    };

    const getDeadlineBadge = (deadline) => {
        if (!deadline) return null;

        const status = getDeadlineStatus(deadline);
        const daysUntil = getDaysUntil(deadline);

        const badges = {
            overdue: { class: 'badge-danger', text: 'Overdue' },
            today: { class: 'badge-warning', text: 'Due Today' },
            soon: { class: 'badge-warning', text: `${daysUntil} days left` },
            upcoming: { class: 'badge-primary', text: formatSmartDate(deadline) },
        };

        const badge = badges[status];
        return <span className={`badge ${badge.class}`}>{badge.text}</span>;
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            high: { class: 'badge-danger', text: '🔴 High' },
            medium: { class: 'badge-warning', text: '🟡 Medium' },
            low: { class: 'badge-success', text: '🟢 Low' },
        };

        const badge = badges[priority] || badges.medium;
        return <span className={`badge ${badge.class}`}>{badge.text}</span>;
    };

    const filteredTasks = getFilteredTasks();
    const stats = {
        total: tasks.length,
        active: tasks.filter(t => !t.completed).length,
        completed: tasks.filter(t => t.completed).length,
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">📋 Task Manager</h1>
                <p className="page-description">
                    Organize your tasks and track deadlines
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="glass-card">
                    <div className="text-muted text-sm">Total Tasks</div>
                    <div className="text-xl font-bold gradient-text">{stats.total}</div>
                </div>
                <div className="glass-card">
                    <div className="text-muted text-sm">Active</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--primary-400)' }}>{stats.active}</div>
                </div>
                <div className="glass-card">
                    <div className="text-muted text-sm">Completed</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--success-400)' }}>{stats.completed}</div>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="flex items-center justify-between gap-md" style={{ flexWrap: 'wrap' }}>
                    <div className="flex gap-sm">
                        <button
                            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`btn btn-sm ${filter === 'active' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('active')}
                        >
                            Active
                        </button>
                        <button
                            className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                    </div>

                    <div className="flex gap-sm items-center">
                        <select
                            className="select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ width: 'auto' }}
                        >
                            <option value="deadline">Sort by Deadline</option>
                            <option value="created">Sort by Created</option>
                        </select>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setShowForm(!showForm);
                                setEditingTask(null);
                                setFormData({ title: '', description: '', deadline: '', priority: 'medium' });
                            }}
                        >
                            {showForm ? '✕ Cancel' : '+ New Task'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Task Form */}
            {showForm && (
                <div className="glass-card fade-in" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                Task Title *
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter task title..."
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
                                placeholder="Add task description..."
                                rows="3"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                            <div>
                                <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    className="input"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                    Priority
                                </label>
                                <select
                                    className="select"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-sm">
                            <button type="submit" className="btn btn-primary">
                                {editingTask ? 'Update Task' : 'Create Task'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingTask(null);
                                    setFormData({ title: '', description: '', deadline: '', priority: 'medium' });
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Task List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {loading ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div className="text-xl gradient-text">Loading tasks...</div>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📝</div>
                        <h3>No tasks found</h3>
                        <p className="text-muted">
                            {filter === 'all' ? 'Create your first task to get started!' : `No ${filter} tasks.`}
                        </p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div
                            key={task._id}
                            className="glass-card"
                            style={{
                                opacity: task.completed ? 0.7 : 1,
                                borderLeft: task.completed ? '4px solid var(--success-500)' : '4px solid var(--primary-500)',
                            }}
                        >
                            <div className="flex items-start gap-md">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleToggleComplete(task)}
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        marginTop: '4px',
                                        cursor: 'pointer',
                                        accentColor: 'var(--primary-500)',
                                    }}
                                />

                                <div style={{ flex: 1 }}>
                                    <div className="flex items-start justify-between gap-md" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                        <h4 style={{
                                            margin: 0,
                                            textDecoration: task.completed ? 'line-through' : 'none',
                                            color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                        }}>
                                            {task.title}
                                        </h4>
                                        <div className="flex gap-sm">
                                            {getPriorityBadge(task.priority)}
                                            {task.deadline && getDeadlineBadge(task.deadline)}
                                        </div>
                                    </div>

                                    {task.description && (
                                        <p className="text-sm text-secondary" style={{ margin: '0 0 var(--spacing-sm) 0' }}>
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted">
                                            Created {formatSmartDate(task.createdAt)}
                                        </span>
                                        <div className="flex gap-sm">
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleEdit(task)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleDelete(task._id)}
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
