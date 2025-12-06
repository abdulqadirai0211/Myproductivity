import {
    format,
    formatDistance,
    isToday,
    isYesterday,
    isTomorrow,
    isPast,
    isFuture,
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    differenceInDays,
    parseISO,
    isWithinInterval,
} from 'date-fns';

// Format date for display
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
};

// Format date with time
export const formatDateTime = (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM dd, yyyy HH:mm');
};

// Relative time (e.g., "2 hours ago")
export const formatRelative = (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
};

// Smart date formatting
export const formatSmartDate = (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) return 'Today';
    if (isTomorrow(dateObj)) return 'Tomorrow';
    if (isYesterday(dateObj)) return 'Yesterday';

    return formatDate(dateObj);
};

// Check if date is overdue
export const isOverdue = (date) => {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isPast(dateObj) && !isToday(dateObj);
};

// Check if date is due soon (within 3 days)
export const isDueSoon = (date) => {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const daysUntil = differenceInDays(dateObj, new Date());
    return daysUntil >= 0 && daysUntil <= 3;
};

// Get deadline status
export const getDeadlineStatus = (date) => {
    if (!date) return 'none';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isOverdue(dateObj)) return 'overdue';
    if (isToday(dateObj)) return 'today';
    if (isDueSoon(dateObj)) return 'soon';
    return 'upcoming';
};

// Get time period boundaries
export const getToday = () => ({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
});

export const getThisWeek = () => ({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
});

export const getThisMonth = () => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
});

// Filter items by date range
export const filterByDateRange = (items, dateField, range) => {
    return items.filter(item => {
        const date = item[dateField];
        if (!date) return false;
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return isWithinInterval(dateObj, range);
    });
};

// Group items by date
export const groupByDate = (items, dateField) => {
    const groups = {
        today: [],
        yesterday: [],
        thisWeek: [],
        thisMonth: [],
        older: [],
    };

    items.forEach(item => {
        const date = item[dateField];
        if (!date) {
            groups.older.push(item);
            return;
        }

        const dateObj = typeof date === 'string' ? parseISO(date) : date;

        if (isToday(dateObj)) {
            groups.today.push(item);
        } else if (isYesterday(dateObj)) {
            groups.yesterday.push(item);
        } else if (isWithinInterval(dateObj, getThisWeek())) {
            groups.thisWeek.push(item);
        } else if (isWithinInterval(dateObj, getThisMonth())) {
            groups.thisMonth.push(item);
        } else {
            groups.older.push(item);
        }
    });

    return groups;
};

// Get days until deadline
export const getDaysUntil = (date) => {
    if (!date) return null;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return differenceInDays(dateObj, new Date());
};
