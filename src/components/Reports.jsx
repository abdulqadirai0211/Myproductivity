import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getTasks, getGoals, getProgress } from '../utils/storage';
import { generateDailyReport, generateWeeklyReport, generateMonthlyReport, formatReportAsMarkdown } from '../utils/reportGenerator';
import { formatDate } from '../utils/dateUtils';

export default function Reports() {
    const [reportType, setReportType] = useState('daily'); // daily, weekly, monthly
    const [currentReport, setCurrentReport] = useState(null);
    const [showMarkdown, setShowMarkdown] = useState(false);

    useEffect(() => {
        generateReport();
    }, [reportType]);

    const generateReport = () => {
        const tasks = getTasks();
        const goals = getGoals();
        const progress = getProgress();

        let report;
        switch (reportType) {
            case 'daily':
                report = generateDailyReport(tasks, goals, progress);
                break;
            case 'weekly':
                report = generateWeeklyReport(tasks, goals, progress);
                break;
            case 'monthly':
                report = generateMonthlyReport(tasks, goals, progress);
                break;
            default:
                report = generateDailyReport(tasks, goals, progress);
        }

        setCurrentReport(report);
    };

    const downloadReport = () => {
        if (!currentReport) return;

        const markdown = formatReportAsMarkdown(currentReport);
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${formatDate(new Date(), 'yyyy-MM-dd')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!currentReport) {
        return (
            <div className="fade-in">
                <div className="page-header">
                    <h1 className="page-title">📈 Reports</h1>
                    <p className="page-description">
                        Generate and view productivity reports
                    </p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <p className="text-muted">Loading report...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">📈 Reports</h1>
                <p className="page-description">
                    Automated productivity reports with insights and analytics
                </p>
            </div>

            {/* Controls */}
            <div className="glass-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="flex items-center justify-between gap-md" style={{ flexWrap: 'wrap' }}>
                    <div className="flex gap-sm">
                        <button
                            className={`btn btn-sm ${reportType === 'daily' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setReportType('daily')}
                        >
                            📅 Daily
                        </button>
                        <button
                            className={`btn btn-sm ${reportType === 'weekly' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setReportType('weekly')}
                        >
                            📆 Weekly
                        </button>
                        <button
                            className={`btn btn-sm ${reportType === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setReportType('monthly')}
                        >
                            📊 Monthly
                        </button>
                    </div>

                    <div className="flex gap-sm">
                        <button
                            className={`btn btn-sm ${showMarkdown ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setShowMarkdown(!showMarkdown)}
                        >
                            {showMarkdown ? '👁️ View Report' : '📝 View Markdown'}
                        </button>
                        <button className="btn btn-sm btn-success" onClick={downloadReport}>
                            💾 Download Report
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={generateReport}>
                            🔄 Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            {showMarkdown ? (
                <div className="glass-card">
                    <pre style={{
                        background: 'var(--bg-elevated)',
                        padding: 'var(--spacing-lg)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'auto',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                        color: 'var(--text-secondary)',
                    }}>
                        {formatReportAsMarkdown(currentReport)}
                    </pre>
                </div>
            ) : (
                <div className="glass-card">
                    <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                        <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>{currentReport.title}</h1>
                        <p className="text-muted">
                            Generated on {formatDate(new Date(), 'MMMM dd, yyyy \'at\' HH:mm')}
                        </p>
                    </div>

                    {/* Summary Section */}
                    <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                        <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>📊 Summary</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
                            <div className="glass-card">
                                <div className="text-muted text-sm">Tasks Created</div>
                                <div className="text-xl font-bold gradient-text">{currentReport.summary.tasksCreated}</div>
                            </div>
                            <div className="glass-card">
                                <div className="text-muted text-sm">Tasks Completed</div>
                                <div className="text-xl font-bold" style={{ color: 'var(--success-400)' }}>
                                    {currentReport.summary.tasksCompleted}
                                </div>
                            </div>
                            <div className="glass-card">
                                <div className="text-muted text-sm">Completion Rate</div>
                                <div className="text-xl font-bold" style={{ color: 'var(--primary-400)' }}>
                                    {currentReport.summary.completionRate}%
                                </div>
                                <div className="progress mt-sm">
                                    <div className="progress-bar" style={{ width: `${currentReport.summary.completionRate}%` }} />
                                </div>
                            </div>
                            {currentReport.summary.overdueTasks !== undefined && (
                                <div className="glass-card">
                                    <div className="text-muted text-sm">Overdue Tasks</div>
                                    <div className="text-xl font-bold" style={{ color: 'var(--danger-400)' }}>
                                        {currentReport.summary.overdueTasks}
                                    </div>
                                </div>
                            )}
                            {currentReport.summary.activeGoals !== undefined && (
                                <>
                                    <div className="glass-card">
                                        <div className="text-muted text-sm">Active Goals</div>
                                        <div className="text-xl font-bold" style={{ color: 'var(--accent-400)' }}>
                                            {currentReport.summary.activeGoals}
                                        </div>
                                    </div>
                                    <div className="glass-card">
                                        <div className="text-muted text-sm">Goals Completed</div>
                                        <div className="text-xl font-bold" style={{ color: 'var(--success-400)' }}>
                                            {currentReport.summary.goalsCompleted}
                                        </div>
                                    </div>
                                </>
                            )}
                            {currentReport.summary.monthlyGoals !== undefined && (
                                <>
                                    <div className="glass-card">
                                        <div className="text-muted text-sm">Monthly Goals</div>
                                        <div className="text-xl font-bold" style={{ color: 'var(--primary-400)' }}>
                                            {currentReport.summary.monthlyGoals}
                                        </div>
                                    </div>
                                    <div className="glass-card">
                                        <div className="text-muted text-sm">Goal Completion Rate</div>
                                        <div className="text-xl font-bold" style={{ color: 'var(--success-400)' }}>
                                            {currentReport.summary.goalCompletionRate}%
                                        </div>
                                        <div className="progress mt-sm">
                                            <div className="progress-bar" style={{ width: `${currentReport.summary.goalCompletionRate}%` }} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Insights Section */}
                    <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                        <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>💡 Insights</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {currentReport.insights.map((insight, index) => (
                                <div
                                    key={index}
                                    className="glass-card"
                                    style={{
                                        padding: 'var(--spacing-lg)',
                                        borderLeft: '4px solid var(--primary-500)',
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: '1rem' }}>{insight}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trends Section */}
                    {currentReport.trends && (
                        <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>📈 Trends & Analytics</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
                                {currentReport.trends.totalProductivityScore !== undefined && (
                                    <div className="glass-card">
                                        <div className="text-muted text-sm">Productivity Score</div>
                                        <div className="text-xl font-bold gradient-text">
                                            {currentReport.trends.totalProductivityScore}/100
                                        </div>
                                        <div className="progress mt-sm">
                                            <div className="progress-bar" style={{ width: `${currentReport.trends.totalProductivityScore}%` }} />
                                        </div>
                                    </div>
                                )}
                                {currentReport.trends.averageTasksPerDay !== undefined && (
                                    <div className="glass-card">
                                        <div className="text-muted text-sm">Avg Tasks Per Day</div>
                                        <div className="text-xl font-bold" style={{ color: 'var(--primary-400)' }}>
                                            {currentReport.trends.averageTasksPerDay}
                                        </div>
                                    </div>
                                )}
                                {currentReport.trends.averageTasksPerWeek !== undefined && (
                                    <div className="glass-card">
                                        <div className="text-muted text-sm">Avg Tasks Per Week</div>
                                        <div className="text-xl font-bold" style={{ color: 'var(--accent-400)' }}>
                                            {currentReport.trends.averageTasksPerWeek}
                                        </div>
                                    </div>
                                )}
                                {currentReport.trends.mostProductiveDay && (
                                    <div className="glass-card">
                                        <div className="text-muted text-sm">Most Productive Day</div>
                                        <div className="text-lg font-bold" style={{ color: 'var(--success-400)' }}>
                                            {formatDate(currentReport.trends.mostProductiveDay.date, 'EEEE')}
                                        </div>
                                        <div className="text-sm text-muted mt-sm">
                                            {currentReport.trends.mostProductiveDay.tasksCompleted} tasks completed
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Daily Breakdown (Weekly Report) */}
                    {currentReport.dailyBreakdown && (
                        <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>📅 Daily Breakdown</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {currentReport.dailyBreakdown.map((day, index) => (
                                    <div
                                        key={index}
                                        className="glass-card"
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div>
                                            <div className="font-medium">{formatDate(day.date, 'EEEE, MMM dd')}</div>
                                            <div className="text-sm text-muted">
                                                {day.tasksCompleted} of {day.tasksCreated} tasks completed
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-md">
                                            <div style={{ width: '200px' }}>
                                                <div className="progress">
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            width: `${day.tasksCreated > 0 ? (day.tasksCompleted / day.tasksCreated) * 100 : 0}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="badge badge-primary">
                                                {day.tasksCreated > 0 ? Math.round((day.tasksCompleted / day.tasksCreated) * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Weekly Breakdown (Monthly Report) */}
                    {currentReport.weeklyBreakdown && (
                        <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>📆 Weekly Breakdown</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {currentReport.weeklyBreakdown.map((week, index) => (
                                    <div
                                        key={index}
                                        className="glass-card"
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div>
                                            <div className="font-medium">
                                                Week {index + 1}: {formatDate(week.weekStart, 'MMM dd')} - {formatDate(week.weekEnd, 'MMM dd')}
                                            </div>
                                            <div className="text-sm text-muted">
                                                {week.tasksCompleted} of {week.tasksCreated} tasks completed
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-md">
                                            <div style={{ width: '200px' }}>
                                                <div className="progress">
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            width: `${week.tasksCreated > 0 ? (week.tasksCompleted / week.tasksCreated) * 100 : 0}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="badge badge-primary">
                                                {week.tasksCreated > 0 ? Math.round((week.tasksCompleted / week.tasksCreated) * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
