import {
    formatDate,
    getToday,
    getThisWeek,
    getThisMonth,
    filterByDateRange,
} from './dateUtils';

// Calculate completion rate
const calculateCompletionRate = (total, completed) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
};

// Generate daily report
export const generateDailyReport = (tasks, goals, progress) => {
    const today = getToday();
    const todayTasks = filterByDateRange(tasks, 'createdAt', today);
    const completedToday = todayTasks.filter(t => t.completed);
    const overdueToday = tasks.filter(t => !t.completed && t.deadline && new Date(t.deadline) < today.start);

    const report = {
        type: 'daily',
        date: new Date().toISOString(),
        title: `Daily Report - ${formatDate(new Date(), 'EEEE, MMMM dd, yyyy')}`,
        summary: {
            tasksCreated: todayTasks.length,
            tasksCompleted: completedToday.length,
            completionRate: calculateCompletionRate(todayTasks.length, completedToday.length),
            overdueTasks: overdueToday.length,
        },
        tasks: {
            completed: completedToday,
            pending: todayTasks.filter(t => !t.completed),
            overdue: overdueToday,
        },
        insights: [],
    };

    // Generate insights
    if (report.summary.completionRate === 100 && todayTasks.length > 0) {
        report.insights.push('🎉 Perfect day! You completed all your tasks!');
    } else if (report.summary.completionRate >= 80) {
        report.insights.push('💪 Great productivity today!');
    } else if (report.summary.completionRate >= 50) {
        report.insights.push('👍 Good progress, keep it up!');
    } else if (todayTasks.length > 0) {
        report.insights.push('📈 There\'s room for improvement tomorrow.');
    }

    if (overdueToday.length > 0) {
        report.insights.push(`⚠️ You have ${overdueToday.length} overdue task${overdueToday.length > 1 ? 's' : ''}.`);
    }

    return report;
};

// Generate weekly report
export const generateWeeklyReport = (tasks, goals, progress) => {
    const thisWeek = getThisWeek();
    const weekTasks = filterByDateRange(tasks, 'createdAt', thisWeek);
    const completedThisWeek = weekTasks.filter(t => t.completed);
    const weekGoals = goals.filter(g => g.period === 'weekly' || g.period === 'monthly');

    // Calculate daily breakdown
    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(thisWeek.start);
        date.setDate(date.getDate() + i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayTasks = weekTasks.filter(t => {
            const taskDate = new Date(t.createdAt);
            return taskDate >= dayStart && taskDate <= dayEnd;
        });

        dailyBreakdown.push({
            date: dayStart.toISOString(),
            tasksCreated: dayTasks.length,
            tasksCompleted: dayTasks.filter(t => t.completed).length,
        });
    }

    const report = {
        type: 'weekly',
        date: new Date().toISOString(),
        title: `Weekly Report - Week of ${formatDate(thisWeek.start)}`,
        period: {
            start: thisWeek.start.toISOString(),
            end: thisWeek.end.toISOString(),
        },
        summary: {
            tasksCreated: weekTasks.length,
            tasksCompleted: completedThisWeek.length,
            completionRate: calculateCompletionRate(weekTasks.length, completedThisWeek.length),
            activeGoals: weekGoals.length,
            goalsCompleted: weekGoals.filter(g => g.completed).length,
        },
        dailyBreakdown,
        trends: {
            mostProductiveDay: dailyBreakdown.reduce((max, day) =>
                day.tasksCompleted > max.tasksCompleted ? day : max, dailyBreakdown[0]),
            averageTasksPerDay: Math.round(weekTasks.length / 7),
        },
        insights: [],
    };

    // Generate insights
    if (report.summary.completionRate >= 80) {
        report.insights.push('🌟 Excellent week! You\'re crushing your goals!');
    } else if (report.summary.completionRate >= 60) {
        report.insights.push('✨ Solid week of productivity!');
    } else if (report.summary.completionRate >= 40) {
        report.insights.push('📊 Decent progress, but there\'s room to improve.');
    }

    const mostProductiveDay = formatDate(report.trends.mostProductiveDay.date, 'EEEE');
    report.insights.push(`🏆 ${mostProductiveDay} was your most productive day with ${report.trends.mostProductiveDay.tasksCompleted} tasks completed.`);

    if (report.summary.goalsCompleted > 0) {
        report.insights.push(`🎯 You completed ${report.summary.goalsCompleted} goal${report.summary.goalsCompleted > 1 ? 's' : ''} this week!`);
    }

    return report;
};

// Generate monthly report
export const generateMonthlyReport = (tasks, goals, progress) => {
    const thisMonth = getThisMonth();
    const monthTasks = filterByDateRange(tasks, 'createdAt', thisMonth);
    const completedThisMonth = monthTasks.filter(t => t.completed);
    const monthGoals = goals.filter(g => g.period === 'monthly');

    // Calculate weekly breakdown
    const weeklyBreakdown = [];
    let currentWeekStart = new Date(thisMonth.start);

    while (currentWeekStart < thisMonth.end) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekTasks = monthTasks.filter(t => {
            const taskDate = new Date(t.createdAt);
            return taskDate >= currentWeekStart && taskDate <= weekEnd;
        });

        weeklyBreakdown.push({
            weekStart: currentWeekStart.toISOString(),
            weekEnd: weekEnd.toISOString(),
            tasksCreated: weekTasks.length,
            tasksCompleted: weekTasks.filter(t => t.completed).length,
        });

        currentWeekStart = new Date(weekEnd);
        currentWeekStart.setDate(currentWeekStart.getDate() + 1);
    }

    const report = {
        type: 'monthly',
        date: new Date().toISOString(),
        title: `Monthly Report - ${formatDate(thisMonth.start, 'MMMM yyyy')}`,
        period: {
            start: thisMonth.start.toISOString(),
            end: thisMonth.end.toISOString(),
        },
        summary: {
            tasksCreated: monthTasks.length,
            tasksCompleted: completedThisMonth.length,
            completionRate: calculateCompletionRate(monthTasks.length, completedThisMonth.length),
            monthlyGoals: monthGoals.length,
            goalsCompleted: monthGoals.filter(g => g.completed).length,
            goalCompletionRate: calculateCompletionRate(monthGoals.length, monthGoals.filter(g => g.completed).length),
        },
        weeklyBreakdown,
        trends: {
            mostProductiveWeek: weeklyBreakdown.reduce((max, week) =>
                week.tasksCompleted > max.tasksCompleted ? week : max, weeklyBreakdown[0]),
            averageTasksPerWeek: Math.round(monthTasks.length / weeklyBreakdown.length),
            totalProductivityScore: Math.round(
                (report.summary.completionRate * 0.6) +
                (calculateCompletionRate(monthGoals.length, monthGoals.filter(g => g.completed).length) * 0.4)
            ),
        },
        insights: [],
    };

    // Generate comprehensive insights
    if (report.trends.totalProductivityScore >= 90) {
        report.insights.push('🏆 Outstanding month! You\'re at peak performance!');
    } else if (report.trends.totalProductivityScore >= 75) {
        report.insights.push('🌟 Fantastic month! Keep up the great work!');
    } else if (report.trends.totalProductivityScore >= 60) {
        report.insights.push('✅ Good month overall. You\'re making steady progress.');
    } else if (report.trends.totalProductivityScore >= 40) {
        report.insights.push('📈 Room for improvement. Let\'s aim higher next month!');
    } else {
        report.insights.push('💪 New month, fresh start! Set achievable goals and build momentum.');
    }

    if (report.summary.goalsCompleted === report.summary.monthlyGoals && monthGoals.length > 0) {
        report.insights.push('🎯 Perfect! You achieved all your monthly goals!');
    } else if (report.summary.goalCompletionRate >= 75) {
        report.insights.push(`🎯 Great goal achievement rate: ${report.summary.goalCompletionRate}%`);
    }

    report.insights.push(`📊 You completed an average of ${report.trends.averageTasksPerWeek} tasks per week.`);

    if (completedThisMonth.length > 0) {
        report.insights.push(`✨ Total accomplishments: ${completedThisMonth.length} tasks completed!`);
    }

    return report;
};

// Format report as markdown
export const formatReportAsMarkdown = (report) => {
    let markdown = `# ${report.title}\n\n`;
    markdown += `*Generated on ${formatDate(new Date(), 'MMMM dd, yyyy \'at\' HH:mm')}*\n\n`;

    markdown += `## Summary\n\n`;
    markdown += `- **Tasks Created:** ${report.summary.tasksCreated}\n`;
    markdown += `- **Tasks Completed:** ${report.summary.tasksCompleted}\n`;
    markdown += `- **Completion Rate:** ${report.summary.completionRate}%\n`;

    if (report.summary.activeGoals !== undefined) {
        markdown += `- **Active Goals:** ${report.summary.activeGoals}\n`;
        markdown += `- **Goals Completed:** ${report.summary.goalsCompleted}\n`;
    }

    if (report.summary.monthlyGoals !== undefined) {
        markdown += `- **Monthly Goals:** ${report.summary.monthlyGoals}\n`;
        markdown += `- **Goal Completion Rate:** ${report.summary.goalCompletionRate}%\n`;
    }

    if (report.summary.overdueTasks !== undefined) {
        markdown += `- **Overdue Tasks:** ${report.summary.overdueTasks}\n`;
    }

    markdown += `\n## Insights\n\n`;
    report.insights.forEach(insight => {
        markdown += `${insight}\n\n`;
    });

    if (report.trends) {
        markdown += `## Trends\n\n`;
        if (report.trends.totalProductivityScore !== undefined) {
            markdown += `- **Productivity Score:** ${report.trends.totalProductivityScore}/100\n`;
        }
        if (report.trends.averageTasksPerDay !== undefined) {
            markdown += `- **Average Tasks Per Day:** ${report.trends.averageTasksPerDay}\n`;
        }
        if (report.trends.averageTasksPerWeek !== undefined) {
            markdown += `- **Average Tasks Per Week:** ${report.trends.averageTasksPerWeek}\n`;
        }
    }

    return markdown;
};
