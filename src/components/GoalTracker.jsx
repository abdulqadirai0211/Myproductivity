import React, { useState, useEffect } from 'react';
import { getGoals, addGoal, updateGoal, deleteGoal, getTasks, addTask } from '../utils/storage';
import { formatDate } from '../utils/dateUtils';
import { useApp } from '../App';

export default function GoalTracker() {
    const [goals, setGoals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [expandedGoal, setExpandedGoal] = useState(null);
    const { triggerRefresh } = useApp();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        period: 'monthly',
        targetDate: '',
    });

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = () => {
        const loadedGoals = getGoals();
        setGoals(loadedGoals);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const goalData = {
            ...formData,
            milestones: editingGoal ? editingGoal.milestones : [],
        };

        if (editingGoal) {
            updateGoal(editingGoal.id, goalData);
        } else {
            addGoal(goalData);
        }

        setFormData({ title: '', description: '', period: 'monthly', targetDate: '' });
        setShowForm(false);
        setEditingGoal(null);
        loadGoals();
        triggerRefresh();
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setFormData({
            title: goal.title,
            description: goal.description || '',
            period: goal.period || 'monthly',
            targetDate: goal.targetDate || '',
        });
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            deleteGoal(id);
            loadGoals();
            triggerRefresh();
        }
    };

    const handleAddMilestone = (goalId) => {
        const title = prompt('Enter milestone title:');
        if (!title) return;

        const goal = goals.find(g => g.id === goalId);
        const milestones = goal.milestones || [];

        milestones.push({
            id: Date.now().toString(),
            title,
            completed: false,
            tasks: [],
        });

        updateGoal(goalId, { milestones });
        loadGoals();
        triggerRefresh();
    };

    const handleToggleMilestone = (goalId, milestoneId) => {
        const goal = goals.find(g => g.id === goalId);
        const milestones = goal.milestones.map(m =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );

        // Update goal progress
        const completedMilestones = milestones.filter(m => m.completed).length;
        const progress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

        updateGoal(goalId, { milestones, progress, completed: progress === 100 });
        loadGoals();
        triggerRefresh();
    };

    const handleAddTaskToMilestone = (goalId, milestoneId) => {
        const title = prompt('Enter task title:');
        if (!title) return;

        const deadline = prompt('Enter deadline (YYYY-MM-DD) or leave empty:');

        // Add task to task manager
        const newTask = addTask({
            title,
            description: `From goal milestone`,
            deadline: deadline || '',
            priority: 'medium',
            goalId,
            milestoneId,
        });

        // Link task to milestone
        const goal = goals.find(g => g.id === goalId);
        const milestones = goal.milestones.map(m => {
            if (m.id === milestoneId) {
                return {
                    ...m,
                    tasks: [...(m.tasks || []), newTask.id],
                };
            }
            return m;
        });

        updateGoal(goalId, { milestones });
        loadGoals();
        triggerRefresh();
    };

    const handleToggleGoalComplete = (goal) => {
        updateGoal(goal.id, { completed: !goal.completed });
        loadGoals();
        triggerRefresh();
    };

    const getGoalsByPeriod = (period) => {
        return goals.filter(g => g.period === period);
    };

    const monthlyGoals = getGoalsByPeriod('monthly');
    const weeklyGoals = getGoalsByPeriod('weekly');
    const customGoals = getGoalsByPeriod('custom');

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">🎯 Goal Tracker</h1>
                <p className="page-description">
                    Set goals, break them down into milestones, and track your progress
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="glass-card">
                    <div className="text-muted text-sm">Total Goals</div>
                    <div className="text-xl font-bold gradient-text">{goals.length}</div>
                </div>
                <div className="glass-card">
                    <div className="text-muted text-sm">Completed</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--success-400)' }}>
                        {goals.filter(g => g.completed).length}
                    </div>
                </div>
                <div className="glass-card">
                    <div className="text-muted text-sm">In Progress</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--primary-400)' }}>
                        {goals.filter(g => !g.completed).length}
                    </div>
                </div>
                <div className="glass-card">
                    <div className="text-muted text-sm">Average Progress</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--accent-400)' }}>
                        {goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length) : 0}%
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingGoal(null);
                        setFormData({ title: '', description: '', period: 'monthly', targetDate: '' });
                    }}
                >
                    {showForm ? '✕ Cancel' : '+ New Goal'}
                </button>
            </div>

            {/* Goal Form */}
            {showForm && (
                <div className="glass-card fade-in" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                Goal Title *
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter goal title..."
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
                                placeholder="Describe your goal..."
                                rows="3"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                            <div>
                                <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                    Period
                                </label>
                                <select
                                    className="select"
                                    value={formData.period}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                    Target Date
                                </label>
                                <input
                                    type="date"
                                    className="input"
                                    value={formData.targetDate}
                                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-sm">
                            <button type="submit" className="btn btn-primary">
                                {editingGoal ? 'Update Goal' : 'Create Goal'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingGoal(null);
                                    setFormData({ title: '', description: '', period: 'monthly', targetDate: '' });
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Goals by Period */}
            {monthlyGoals.length > 0 && (
                <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>📅 Monthly Goals</h2>
                    <GoalsList
                        goals={monthlyGoals}
                        expandedGoal={expandedGoal}
                        setExpandedGoal={setExpandedGoal}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleToggleGoalComplete={handleToggleGoalComplete}
                        handleAddMilestone={handleAddMilestone}
                        handleToggleMilestone={handleToggleMilestone}
                        handleAddTaskToMilestone={handleAddTaskToMilestone}
                    />
                </div>
            )}

            {weeklyGoals.length > 0 && (
                <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>📆 Weekly Goals</h2>
                    <GoalsList
                        goals={weeklyGoals}
                        expandedGoal={expandedGoal}
                        setExpandedGoal={setExpandedGoal}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleToggleGoalComplete={handleToggleGoalComplete}
                        handleAddMilestone={handleAddMilestone}
                        handleToggleMilestone={handleToggleMilestone}
                        handleAddTaskToMilestone={handleAddTaskToMilestone}
                    />
                </div>
            )}

            {customGoals.length > 0 && (
                <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>🎯 Custom Goals</h2>
                    <GoalsList
                        goals={customGoals}
                        expandedGoal={expandedGoal}
                        setExpandedGoal={setExpandedGoal}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleToggleGoalComplete={handleToggleGoalComplete}
                        handleAddMilestone={handleAddMilestone}
                        handleToggleMilestone={handleToggleMilestone}
                        handleAddTaskToMilestone={handleAddTaskToMilestone}
                    />
                </div>
            )}

            {goals.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🎯</div>
                    <h3>No goals yet</h3>
                    <p className="text-muted">Create your first goal to start tracking your progress!</p>
                </div>
            )}
        </div>
    );
}

function GoalsList({
    goals,
    expandedGoal,
    setExpandedGoal,
    handleEdit,
    handleDelete,
    handleToggleGoalComplete,
    handleAddMilestone,
    handleToggleMilestone,
    handleAddTaskToMilestone,
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {goals.map((goal) => (
                <div
                    key={goal.id}
                    className="glass-card"
                    style={{
                        borderLeft: goal.completed ? '4px solid var(--success-500)' : '4px solid var(--primary-500)',
                    }}
                >
                    <div className="flex items-start gap-md">
                        <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={() => handleToggleGoalComplete(goal)}
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
                                <h3 style={{
                                    margin: 0,
                                    textDecoration: goal.completed ? 'line-through' : 'none',
                                    color: goal.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                }}>
                                    {goal.title}
                                </h3>
                                <div className="flex gap-sm">
                                    {goal.targetDate && (
                                        <span className="badge badge-primary">
                                            📅 {formatDate(goal.targetDate)}
                                        </span>
                                    )}
                                    <span className="badge badge-success">
                                        {goal.progress || 0}%
                                    </span>
                                </div>
                            </div>

                            {goal.description && (
                                <p className="text-sm text-secondary" style={{ margin: '0 0 var(--spacing-md) 0' }}>
                                    {goal.description}
                                </p>
                            )}

                            {/* Progress Bar */}
                            <div className="progress" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <div className="progress-bar" style={{ width: `${goal.progress || 0}%` }} />
                            </div>

                            {/* Milestones */}
                            {goal.milestones && goal.milestones.length > 0 && (
                                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <div
                                        className="flex items-center gap-sm text-sm font-medium"
                                        style={{ marginBottom: 'var(--spacing-sm)', cursor: 'pointer' }}
                                        onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                                    >
                                        <span>{expandedGoal === goal.id ? '▼' : '▶'}</span>
                                        <span>Milestones ({goal.milestones.filter(m => m.completed).length}/{goal.milestones.length})</span>
                                    </div>

                                    {expandedGoal === goal.id && (
                                        <div style={{ paddingLeft: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                            {goal.milestones.map((milestone) => (
                                                <div key={milestone.id} className="flex items-start gap-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={milestone.completed}
                                                        onChange={() => handleToggleMilestone(goal.id, milestone.id)}
                                                        style={{ marginTop: '4px', cursor: 'pointer', accentColor: 'var(--primary-500)' }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <span
                                                            className="text-sm"
                                                            style={{
                                                                textDecoration: milestone.completed ? 'line-through' : 'none',
                                                                color: milestone.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                                                            }}
                                                        >
                                                            {milestone.title}
                                                        </span>
                                                        {milestone.tasks && milestone.tasks.length > 0 && (
                                                            <span className="badge badge-primary" style={{ marginLeft: 'var(--spacing-sm)' }}>
                                                                {milestone.tasks.length} tasks
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={() => handleAddTaskToMilestone(goal.id, milestone.id)}
                                                    >
                                                        + Task
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <button
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => handleAddMilestone(goal.id)}
                                >
                                    + Add Milestone
                                </button>
                                <div className="flex gap-sm">
                                    <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(goal)}>
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-ghost"
                                        onClick={() => handleDelete(goal.id)}
                                        style={{ color: 'var(--danger-400)' }}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
