import React, { useState, useEffect } from 'react';
import { getTasks, getGoals } from '../utils/storage';
import { getToday, getThisWeek, getThisMonth, filterByDateRange } from '../utils/dateUtils';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProgressDashboard() {
    const [tasks, setTasks] = useState([]);
    const [goals, setGoals] = useState([]);
    const [timeRange, setTimeRange] = useState('week'); // day, week, month

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setTasks(getTasks());
        setGoals(getGoals());
    };

    const getTimeRangeData = () => {
        const ranges = {
            day: getToday(),
            week: getThisWeek(),
            month: getThisMonth(),
        };
        return ranges[timeRange];
    };

    const range = getTimeRangeData();
    const rangeTasks = filterByDateRange(tasks, 'createdAt', range);
    const completedTasks = rangeTasks.filter(t => t.completed);
    const activeTasks = rangeTasks.filter(t => !t.completed);

    // Calculate stats
    const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        activeTasks: tasks.filter(t => !t.completed).length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
        totalGoals: goals.length,
        completedGoals: goals.filter(g => g.completed).length,
        avgGoalProgress: goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length) : 0,
    };

    // Prepare chart data
    const getLast7DaysData = () => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            const dayTasks = tasks.filter(t => {
                const taskDate = new Date(t.createdAt);
                return taskDate >= dayStart && taskDate <= dayEnd;
            });

            data.push({
                date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                created: dayTasks.length,
                completed: dayTasks.filter(t => t.completed).length,
            });
        }
        return data;
    };

    const getPriorityData = () => {
        const priorities = { high: 0, medium: 0, low: 0 };
        tasks.forEach(t => {
            const priority = t.priority || 'medium';
            priorities[priority]++;
        });
        return [
            { name: 'High Priority', value: priorities.high, color: 'var(--danger-500)' },
            { name: 'Medium Priority', value: priorities.medium, color: 'var(--warning-500)' },
            { name: 'Low Priority', value: priorities.low, color: 'var(--success-500)' },
        ];
    };

    const getGoalProgressData = () => {
        return goals.map(g => ({
            name: g.title.substring(0, 20) + (g.title.length > 20 ? '...' : ''),
            progress: g.progress || 0,
        }));
    };

    const chartData = getLast7DaysData();
    const priorityData = getPriorityData();
    const goalProgressData = getGoalProgressData();

    const COLORS = ['#ef4444', '#f59e0b', '#22c55e'];

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">📊 Progress Dashboard</h1>
                <p className="page-description">
                    Track your productivity and visualize your progress
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="glass-card">
                    <div className="text-muted text-sm">Total Tasks</div>
                    <div className="text-xl font-bold gradient-text">{stats.totalTasks}</div>
                    <div className="text-sm text-muted mt-sm">
                        {stats.completedTasks} completed, {stats.activeTasks} active
                    </div>
                </div>

                <div className="glass-card">
                    <div className="text-muted text-sm">Completion Rate</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--success-400)' }}>
                        {stats.completionRate}%
                    </div>
                    <div className="progress mt-sm">
                        <div className="progress-bar" style={{ width: `${stats.completionRate}%` }} />
                    </div>
                </div>

                <div className="glass-card">
                    <div className="text-muted text-sm">Total Goals</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--primary-400)' }}>
                        {stats.totalGoals}
                    </div>
                    <div className="text-sm text-muted mt-sm">
                        {stats.completedGoals} completed
                    </div>
                </div>

                <div className="glass-card">
                    <div className="text-muted text-sm">Avg Goal Progress</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--accent-400)' }}>
                        {stats.avgGoalProgress}%
                    </div>
                    <div className="progress mt-sm">
                        <div className="progress-bar" style={{ width: `${stats.avgGoalProgress}%` }} />
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                {/* Task Activity Chart */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>📈 Task Activity (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                            <XAxis dataKey="date" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="created" stroke="var(--primary-500)" strokeWidth={2} name="Created" />
                            <Line type="monotone" dataKey="completed" stroke="var(--success-500)" strokeWidth={2} name="Completed" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Priority Distribution */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>🎯 Task Priority Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={priorityData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {priorityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Goal Progress Chart */}
            {goalProgressData.length > 0 && (
                <div className="glass-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>🎯 Goal Progress Overview</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={goalProgressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="progress" fill="url(#colorGradient)" name="Progress %" />
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary-500)" stopOpacity={1} />
                                    <stop offset="100%" stopColor="var(--accent-500)" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Recent Activity */}
            <div className="glass-card">
                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>⚡ Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                    {tasks.length === 0 ? (
                        <p className="text-muted text-center" style={{ padding: 'var(--spacing-xl)' }}>
                            No activity yet. Start creating tasks and goals!
                        </p>
                    ) : (
                        tasks
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .slice(0, 10)
                            .map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-md"
                                    style={{
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: task.completed ? '3px solid var(--success-500)' : '3px solid var(--primary-500)',
                                    }}
                                >
                                    <span style={{ fontSize: '1.25rem' }}>
                                        {task.completed ? '✅' : '⏳'}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <div className="font-medium">{task.title}</div>
                                        <div className="text-sm text-muted">
                                            {task.completed ? 'Completed' : 'Created'} • {new Date(task.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {task.priority && (
                                        <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}`}>
                                            {task.priority}
                                        </span>
                                    )}
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
}
