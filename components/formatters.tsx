import { User, GraduationCap } from 'lucide-react';
import { DatePickerRange } from '@/rails/types';
import { getDateString, getTime } from './getters';


// Date type configurations
const DATE_TYPES = {
    today: {
        label: "Hoy",
        colors: "border-b-2 border-green-500"
    },
    tomorrow: {
        label: "Mañana",
        colors: "border-b-2 border-blue-500"
    },
    past: {
        label: (days: number) => `${days} day${days !== 1 ? 's' : ''} ago`,
        colors: "border-b-2 border-muted-foreground"
    },
    thisWeek: {
        label: (date: Date) => date.toLocaleString("es-ES", { weekday: "long" }),
        colors: "border-b-2 border-accent"
    }
} as const;

/**
 * Simple progress bar component - rounded div with fill based on percentage
 */
export const ProgressBar = ({
    usedMinutes,
    totalMinutes
}: {
    usedMinutes: number;
    totalMinutes: number;
}) => {
    if (!totalMinutes || totalMinutes === 0) {
        return (
            <span className="text-xs text-muted-foreground">N/A</span>
        );
    }

    const totalUsedHours = usedMinutes / 60;
    const totalPackageHours = totalMinutes / 60;
    const progressPercentage = totalPackageHours > 0 ? (totalUsedHours / totalPackageHours) * 100 : 0;

    const displayUsedHours = totalUsedHours % 1 === 0 ? `${Math.floor(totalUsedHours)}` : `${totalUsedHours.toFixed(1)}`;
    const displayTotalHours = totalPackageHours % 1 === 0 ? `${Math.floor(totalPackageHours)}h` : `${totalPackageHours.toFixed(1)}h`;

    const isOverused = totalUsedHours > totalPackageHours;

    const getFillColor = () => {
        if (isOverused) return "bg-red-500"; // Over limit
        if (usedMinutes === totalMinutes) return "bg-gray-500"; // Exactly at limit
        return "bg-green-500"; // Normal progress
    };

    const fillColor = getFillColor();

    return (
        <div className="inline-flex items-center gap-3">
            {/* Simple Progress Bar - 80px constant width */}
            <div className="h-3 rounded-full overflow-hidden border" style={{ width: '80px' }}>
                <div
                    className={`h-full ${fillColor} rounded-full transition-all duration-300`}
                    style={{ width: `${isOverused ? 100 : Math.min(progressPercentage, 100)}%` }}
                />
            </div>

            {/* Hours Display */}
            <span className="text-xs text-foreground">
                {displayUsedHours}/{displayTotalHours}
            </span>
        </div>
    );
};


/**
 * Format duration (convert minutes to hours and minutes)
 */
export const formatDuration = (minutes: number) => {
    if (minutes < 60) {
        return `${minutes}mins`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return hours === 1 ? '1hr' : `${hours}hrs`;
    }

    const hourText = hours === 1 ? '1hr' : `${hours}hrs`;
    return `${hourText} ${remainingMinutes}mins`;
};


/**
 * Enhanced component that renders a formatted date with improved UI and DRY code
 */
export const FormatDate = ({ dateStr }: { dateStr: string | undefined | null }) => {
    if (!dateStr) return <span className="text-gray-400 text-sm">No date</span>;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return <span className="text-gray-400 text-sm">Invalid date</span>;

    const now = new Date();
    const daysDiff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Determine date type and get configuration
    const getDateTypeConfig = () => {
        const isToday = date.toDateString() === now.toDateString();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        if (isToday) {
            return { type: 'today', config: DATE_TYPES.today, label: DATE_TYPES.today.label, isToday: true };
        }
        if (isTomorrow) {
            return { type: 'tomorrow', config: DATE_TYPES.tomorrow, label: DATE_TYPES.tomorrow.label, isTomorrow: true };
        }
        if (daysDiff < 0 && !isToday) {
            const daysAgo = Math.abs(daysDiff);
            return { type: 'past', config: DATE_TYPES.past, label: DATE_TYPES.past.label(daysAgo) };
        }
        if (daysDiff >= 0 && daysDiff < 7) {
            return { type: 'thisWeek', config: DATE_TYPES.thisWeek, label: DATE_TYPES.thisWeek.label(date) };
        }
        return null;
    };

    const dateTypeInfo = getDateTypeConfig();

    // Show time for today, tomorrow, and future dates (but not past dates)
    const showTime = daysDiff >= 0 || (dateTypeInfo?.isToday);
    const dateString = getDateString(date);
    const timeString = getTime(date);

    return (
        <div className="inline-flex items-center rounded-lg border border-border bg-card shadow-sm px-2">
            {/* Date Type Badge */}
            {dateTypeInfo && (
                <div className={`px-3 py-1.5 text-xs font-medium ${dateTypeInfo.config.colors}`}>
                    {dateTypeInfo.label}
                </div>
            )}

            {/* Time Section */}
            {showTime && (
                <div className="px-3 py-1.5 text-xs font-mono text-foreground">
                    {timeString}
                </div>
            )}

            {/* Date Section */}
            <div className="px-3 py-1.5 text-xs text-foreground">
                {dateString}
            </div>
        </div>
    );
};

/**
 * Enhanced component that shows weekday in badge and date without weekday duplication
 * Examples:
 * - Today: [Today] [16:06] [junio 13]
 * - Tomorrow: [Tomorrow] [16:06] [junio 14]
 * - Other days: [lunes] [16:06] [junio 16]
 */
export const FormatDateWithWeek = ({ dateStr }: { dateStr: string | undefined | null }) => {
    if (!dateStr) return <span className="text-gray-400 text-sm">No date</span>;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return <span className="text-gray-400 text-sm">Invalid date</span>;

    const now = new Date();
    const daysDiff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Determine date type and get configuration
    const getDateTypeConfig = () => {
        const isToday = date.toDateString() === now.toDateString();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        if (isToday) {
            return { type: 'today', config: DATE_TYPES.today, label: DATE_TYPES.today.label, isToday: true };
        }
        if (isTomorrow) {
            return { type: 'tomorrow', config: DATE_TYPES.tomorrow, label: DATE_TYPES.tomorrow.label, isTomorrow: true };
        }
        if (daysDiff < 0 && !isToday) {
            const daysAgo = Math.abs(daysDiff);
            return { type: 'past', config: DATE_TYPES.past, label: DATE_TYPES.past.label(daysAgo) };
        }
        // For any other date (this week or beyond), show the weekday as the badge
        const weekday = date.toLocaleString("es-ES", { weekday: "long", timeZone: "Europe/Madrid" });
        return {
            type: 'weekday',
            config: DATE_TYPES.thisWeek,
            label: weekday
        };
    };

    const dateTypeInfo = getDateTypeConfig();

    // Show time for today, tomorrow, and future dates (but not past dates)
    const showTime = daysDiff >= 0 || (dateTypeInfo?.isToday);
    const dateString = getDateString(date); // Use regular date string without weekday
    const timeString = getTime(date);

    return (
        <div className="inline-flex items-center rounded-lg border border-border bg-card shadow-sm px-2">
            {/* Date Type Badge */}
            {dateTypeInfo && (
                <div className={`px-3 py-1.5 text-xs font-medium ${dateTypeInfo.config.colors}`}>
                    {dateTypeInfo.label}
                </div>
            )}

            {/* Time Section */}
            {showTime && (
                <div className="px-3 py-1.5 text-xs font-mono text-foreground">
                    {timeString}
                </div>
            )}

            {/* Date Section */}
            <div className="px-3 py-1.5 text-xs text-foreground">
                {dateString}
            </div>
        </div>
    );
};

/**
 * Component to display a date range with start and end dates in an inline format
 */
export const FormatDateRange = ({ startDate, endDate }: DatePickerRange) => {
    if (!startDate) {
        return <span className="text-red-400">No start date found</span>;
    }

    if (!endDate) {
        return <span className="text-red-400">No end date found</span>;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        return <span className="text-gray-400 ">Invalid date range</span>;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDateOnly = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), startDateObj.getDate());
    const endDateOnly = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), endDateObj.getDate());

    // Check if dates are on the same day
    const sameDay = startDateOnly.getTime() === endDateOnly.getTime();

    // Calculate duration in days
    const durationMs = endDateOnly.getTime() - startDateOnly.getTime();
    const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

    // Determine badge color based on current date
    const getBadgeColor = () => {
        const isActive = today >= startDateOnly && today <= endDateOnly;
        const isPast = today > endDateOnly;

        if (isActive) {
            return "bg-green-200 text-green-800";
        } else if (isPast) {
            return "bg-gray-200 text-gray-600";
        } else {
            return "bg-blue-200 text-blue-800";
        }
    };

    const badgeColor = getBadgeColor();
    const startDateString = getDateString(startDateObj);
    const endDateString = getDateString(endDateObj);

    return (
        <div className="inline-flex items-center gap-2">
            {/* Date Range */}
            <div className="font-semibold">
                {sameDay ? startDateString : `${startDateString} - ${endDateString}`}
            </div>

            {/* Duration Badge with Color */}
            <div className={`px-2 rounded-sm ${badgeColor}`}>
                {durationDays}d
            </div>
        </div>
    );
};

/**
 * Component to display lesson information including teacher name, kite events count, and total hours
 */
export const FormatLessonInfo = ({ lesson }: { lesson: any }) => {
    if (!lesson) {
        return <span className="text-gray-400 text-sm">Lesson info unavailable</span>;
    }

    const teacherName = (lesson as any).teacher?.name || "No teacher";
    const kiteEventsCount = (lesson as any).kiteEvents?.length || 0;
    const totalMinutes = (lesson as any).kiteEvents?.reduce((sum: number, event: any) => sum + ((event as any).duration || 0), 0) || 0;
    const totalHours = totalMinutes > 0 ? (totalMinutes / 60).toFixed(1) : "0";
    const displayHours = totalHours.endsWith('.0') ? totalHours.slice(0, -2) : totalHours;

    return (
        <div className="inline-flex items-center rounded-lg border border-border bg-card shadow-sm">
            {/* Teacher Icon */}
            <div className="px-3 py-1.5 flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Teacher Name */}
            <div className="px-3 py-1.5 text-sm font-medium text-foreground">
                {teacherName}
            </div>

            {/* Events Count and Total Hours */}
            <div className="px-3 py-1.5 text-sm text-foreground">
                {kiteEventsCount} | {displayHours}h
            </div>
        </div>
    );
};


/**
 * Component to display student booking progress showing package hours vs used hours with progress bar
 */
export const FormatStudentBookingProgress = ({ bookingStudents }: { bookingStudents: any[] }) => {
    if (!bookingStudents || bookingStudents.length === 0) {
        return null;
    }

    // Calculate total package hours and used hours across all bookings
    let totalPackageMinutes = 0;
    let totalUsedMinutes = 0;

    bookingStudents.forEach((bookingStudent) => {
        const packageDuration = (bookingStudent as any).booking?.package?.duration || 0;
        totalPackageMinutes += packageDuration;

        // Sum all kite event durations from lessons in this booking
        (bookingStudent as any).booking?.lessons?.forEach((lesson: any) => {
            (lesson as any).kiteEvents?.forEach((kiteEvent: any) => {
                totalUsedMinutes += (kiteEvent as any).duration || 0;
            });
        });
    });

    // Don't show if no package minutes
    if (totalPackageMinutes === 0) {
        return null;
    }

    return (
        <ProgressBar
            usedMinutes={totalUsedMinutes}
            totalMinutes={totalPackageMinutes}
        />
    );
};

/**
 * Format date in consistent DD/MM/YYYY format that works the same on server and client
 */
export const formatDateNow = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};
